// Editor de código, folha de respostas e barra de símbolos.

import { saveDrafts } from '../../data/progress';
import { buildAnswerSheetCode } from '../../ui/answerSheetPanel';
import { formatCodePrettier, highlightCode, renderLineNumbers } from '../../ui/codeEditor';
import type { AbaEscrita } from '../../ui/mobileEditor';
import {
  applyEditorEdit,
  ensureInitialSnapshot,
  outdentCurrentLine,
  recordEditorInput,
  redoEditor,
  undoEditor,
} from '../editorHistory';
import { activeEngine, currentLesson, draftKey } from '../lessonContext';
import { abrirEcraDeEscrita, bindInsertButtons } from '../mobileWriting';
import { scheduleCloudSync, takePendingCloudRender } from '../progressSync';
import { renderApp } from '../rerender';
import { state } from '../store';
import { executeWorkbench } from '../workbench';

function saveCurrentDraft(code: string): void {
  state.editorDrafts[draftKey(currentLesson(), state.wbTab)] = code;
  saveDrafts(state.editorDrafts);
  scheduleCloudSync();
}

function attachAnswerSheetListeners(): void {
  const answerInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.answer-field-input[data-answer-var]'));
  if (answerInputs.length === 0) return;
  const syncAnswerInputs = (): void => {
    const vals: Record<string, string> = {};
    for (const inp of answerInputs) {
      if (inp.dataset.answerVar) vals[inp.dataset.answerVar] = inp.value;
    }
    saveCurrentDraft(buildAnswerSheetCode(currentLesson().id, vals));
  };
  for (const inp of answerInputs) {
    inp.addEventListener('input', syncAnswerInputs);
    inp.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        void executeWorkbench();
      }
    });
  }
}

/** Enter mantém a indentação (e acrescenta 4 espaços depois de ":" em Python). Devolve true se tratou a tecla. */
function handleAutoIndent(editor: HTMLTextAreaElement): boolean {
  const start = editor.selectionStart ?? editor.value.length;
  const end = editor.selectionEnd ?? editor.value.length;
  const val = editor.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  const lineUpToCursor = val.slice(lineStart, start);
  const indentMatch = /^[ \t]*/.exec(lineUpToCursor);
  let nextIndent = indentMatch ? indentMatch[0] : '';
  if (activeEngine() === 'python' && lineUpToCursor.trimEnd().endsWith(':')) {
    nextIndent += '    ';
  }
  if (nextIndent.length === 0) return false;
  const insert = '\n' + nextIndent;
  applyEditorEdit(editor, val.slice(0, start) + insert + val.slice(end), start + insert.length, start + insert.length);
  return true;
}

function attachCodeEditorListeners(): void {
  const editor = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
  if (!editor) return;
  const highlightPre = document.getElementById('workbench-highlight') as HTMLElement | null;
  const gutterEl = document.getElementById('workbench-gutter') as HTMLElement | null;

  const syncScroll = (): void => {
    if (highlightPre) {
      highlightPre.scrollTop = editor.scrollTop;
      highlightPre.scrollLeft = editor.scrollLeft;
    }
    if (gutterEl) {
      gutterEl.scrollTop = editor.scrollTop;
    }
  };

  // A camada de realce e os números de linha seguem o texto escrito.
  const syncEditorOverlay = (): void => {
    const val = editor.value;
    saveCurrentDraft(val);
    if (highlightPre) highlightPre.innerHTML = `<code>${highlightCode(val, activeEngine())}</code>`;
    if (gutterEl) gutterEl.innerHTML = renderLineNumbers(val);
    syncScroll();
  };

  // Tab escreve espaços; depois de Escape, Tab volta a mudar de foco (para quem usa só o teclado).
  let tabTrapActive = true;
  ensureInitialSnapshot(editor);

  editor.addEventListener('input', () => {
    recordEditorInput(editor);
    syncEditorOverlay();
  });
  editor.addEventListener('blur', () => {
    tabTrapActive = true;
    if (takePendingCloudRender()) renderApp();
  });
  editor.addEventListener('scroll', syncScroll);
  editor.addEventListener('keydown', (ev) => {
    const mod = ev.ctrlKey || ev.metaKey;
    const key = ev.key.toLowerCase();
    if (ev.key === 'Escape') {
      if (tabTrapActive) {
        tabTrapActive = false;
        ev.stopPropagation();
      }
      return;
    }
    if (mod && !ev.shiftKey && key === 'z') {
      if (undoEditor(editor)) ev.preventDefault();
    } else if (mod && ((ev.shiftKey && key === 'z') || key === 'y')) {
      if (redoEditor(editor)) ev.preventDefault();
    } else if (mod && ev.key === 'Enter') {
      ev.preventDefault();
      void executeWorkbench();
    } else if (ev.shiftKey && ev.altKey && key === 'f') {
      ev.preventDefault();
      const formatted = formatCodePrettier(editor.value, activeEngine());
      applyEditorEdit(editor, formatted, formatted.length, formatted.length);
    } else if (ev.key === 'Enter' && !mod && !ev.altKey) {
      if (handleAutoIndent(editor)) ev.preventDefault();
    } else if (ev.key === 'Tab' && !ev.shiftKey && tabTrapActive) {
      ev.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      applyEditorEdit(editor, editor.value.slice(0, start) + '    ' + editor.value.slice(end), start + 4, start + 4);
    } else if (ev.key === 'Tab' && ev.shiftKey && tabTrapActive) {
      ev.preventDefault();
      outdentCurrentLine(editor);
    }
  });
}

export function attachEditorListeners(): void {
  attachAnswerSheetListeners();
  attachCodeEditorListeners();
  bindInsertButtons(document);

  document.querySelectorAll<HTMLElement>('[data-ecra-aba]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.ecraAba as AbaEscrita | undefined;
      if (aba) abrirEcraDeEscrita(aba);
    });
  });
}
