// Ações da bancada de código: executar, editar, pistas, solução e ecrã de escrita.

import { saveDrafts } from '../../data/progress';
import { createInitialGitState } from '../../engines/gitEngine';
import { formatCodePrettier } from '../../ui/codeEditor';
import { savePreferirEditorNormal } from '../../ui/mobileEditor';
import { redoEditor, undoEditor } from '../editorHistory';
import {
  activeEngine,
  activeGitChallenge,
  activePythonChallenge,
  activeSqlChallenge,
  currentLesson,
  draftKey,
  getEditorValue,
} from '../lessonContext';
import { abrirEcraDeEscrita, fecharEcraDeEscrita, irParaProximaEtapaDoEcra } from '../mobileWriting';
import { renderApp } from '../rerender';
import { state } from '../store';
import { executeWorkbench, stopWorkbench } from '../workbench';
import type { ActionMap } from './types';

function editorEl(): HTMLTextAreaElement | null {
  return document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
}

function editarCodigoNoEcra(): void {
  abrirEcraDeEscrita('codigo');
}

export const workbenchActions: ActionMap = {
  'run-code': () => void executeWorkbench(),
  'stop-code': stopWorkbench,

  'load-example-tab': () => {
    state.wbTab = 'example';
    state.mobileTab = 'workbench';
    state.editorDrafts[draftKey(currentLesson(), 'example')] = currentLesson().exampleCode;
    saveDrafts(state.editorDrafts, true);
    renderApp();
    window.scrollTo({ top: 0 });
    void executeWorkbench();
  },

  'abrir-ecra-escrita': editarCodigoNoEcra,
  'editar-codigo-ecra': editarCodigoNoEcra,
  'fechar-ecra-escrita': () => fecharEcraDeEscrita(),
  'next-lesson-from-ecra': irParaProximaEtapaDoEcra,
  'usar-editor-normal': () => {
    savePreferirEditorNormal(true);
    fecharEcraDeEscrita();
  },
  'usar-ecra-escrita': () => {
    savePreferirEditorNormal(false);
    renderApp();
  },
  'executar-ecra-escrita': () => {
    (document.activeElement as HTMLElement | null)?.blur();
    abrirEcraDeEscrita('resultado');
    void executeWorkbench();
  },

  'editor-undo': () => {
    const ed = editorEl();
    if (ed) {
      undoEditor(ed);
      ed.focus({ preventScroll: true });
    }
  },
  'editor-redo': () => {
    const ed = editorEl();
    if (ed) {
      redoEditor(ed);
      ed.focus({ preventScroll: true });
    }
  },
  'copy-code': () => {
    void navigator.clipboard?.writeText(getEditorValue()).catch(() => {});
  },
  'format-code': () => {
    const cur = getEditorValue();
    state.editorDrafts[draftKey(currentLesson(), state.wbTab)] = formatCodePrettier(cur, activeEngine());
    saveDrafts(state.editorDrafts, true);
    renderApp();
  },
  'reset-code': () => {
    delete state.editorDrafts[draftKey(currentLesson(), state.wbTab)];
    saveDrafts(state.editorDrafts, true);
    if (currentLesson().engine === 'git') {
      state.gitState = createInitialGitState();
    }
    state.output = { kind: 'empty' };
    state.confirmSolutionLessonId = null;
    state.hintLevel = 0;
    renderApp();
  },

  'next-hint': () => {
    state.hintLevel = Math.min(2, state.hintLevel + 1);
    renderApp();
  },
  'ask-solution': () => {
    state.confirmSolutionLessonId = currentLesson().id;
    renderApp();
  },
  'cancel-solution': () => {
    state.confirmSolutionLessonId = null;
    renderApp();
  },
  'apply-solution': () => {
    const l = currentLesson();
    const sol =
      activePythonChallenge(l)?.solutionCode ??
      activeSqlChallenge(l)?.solutionSql ??
      activeGitChallenge(l)?.solutionCommands ??
      l.exampleCode;
    state.editorDrafts[draftKey(l, 'challenge')] = sol;
    saveDrafts(state.editorDrafts, true);
    // Ver a solução do desafio principal faz a etapa contar como "com apoio".
    if (state.practiceIdx === 0) state.helpedInSession.add(l.id);
    state.confirmSolutionLessonId = null;
    renderApp();
  },
};
