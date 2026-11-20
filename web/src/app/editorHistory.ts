// Desfazer/refazer do editor de código, um histórico por etapa, separador e treino.

import { state } from './store';

interface EditorSnapshot {
  value: string;
  start: number;
  end: number;
}

const MAX_SNAPSHOTS = 80;
/** Teclas escritas com menos de 500 ms de intervalo juntam-se num só passo de desfazer. */
const MERGE_WINDOW_MS = 500;

const editorUndoStacks = new Map<string, EditorSnapshot[]>();
const editorRedoStacks = new Map<string, EditorSnapshot[]>();
/** Última tecla registada: só se junta a ela uma tecla do mesmo histórico, dentro da janela. */
let ultimaTecla: { chave: string; tempo: number } | null = null;

function editorHistoryKey(): string {
  return `${state.lessonId}:${state.wbTab}:${state.practiceIdx}`;
}

function getStack(stacks: Map<string, EditorSnapshot[]>): EditorSnapshot[] {
  const k = editorHistoryKey();
  let arr = stacks.get(k);
  if (!arr) {
    arr = [];
    stacks.set(k, arr);
  }
  return arr;
}

function snapshotOf(ed: HTMLTextAreaElement): EditorSnapshot {
  return {
    value: ed.value,
    start: ed.selectionStart ?? ed.value.length,
    end: ed.selectionEnd ?? ed.value.length,
  };
}

/** Guarda o estado inicial do editor, para o primeiro Desfazer ter para onde voltar. */
export function ensureInitialSnapshot(ed: HTMLTextAreaElement): void {
  const undo = getStack(editorUndoStacks);
  if (undo.length === 0) undo.push(snapshotOf(ed));
}

export function recordEditorInput(ed: HTMLTextAreaElement): void {
  const undo = getStack(editorUndoStacks);
  const redo = getStack(editorRedoStacks);
  const now = performance.now();
  const chave = editorHistoryKey();
  const snap = snapshotOf(ed);
  // undo[0] é o estado inicial do editor: nunca se junta a ele, senão o Desfazer deixava de lá voltar.
  const juntar =
    ultimaTecla !== null && ultimaTecla.chave === chave && now - ultimaTecla.tempo < MERGE_WINDOW_MS && undo.length > 1;
  if (juntar) {
    undo[undo.length - 1] = snap;
  } else {
    if (undo.length === 0 || undo[undo.length - 1].value !== snap.value) {
      undo.push(snap);
      if (undo.length > MAX_SNAPSHOTS) undo.shift();
    }
  }
  ultimaTecla = { chave, tempo: now };
  redo.length = 0;
}

export function applyEditorEdit(ed: HTMLTextAreaElement, nextValue: string, nextStart: number, nextEnd: number): void {
  const undo = getStack(editorUndoStacks);
  const redo = getStack(editorRedoStacks);
  const curSnap = snapshotOf(ed);
  if (undo.length === 0 || undo[undo.length - 1].value !== curSnap.value) {
    undo.push(curSnap);
  }
  ed.value = nextValue;
  ed.selectionStart = nextStart;
  ed.selectionEnd = nextEnd;
  undo.push({ value: nextValue, start: nextStart, end: nextEnd });
  if (undo.length > MAX_SNAPSHOTS) undo.shift();
  redo.length = 0;
  ultimaTecla = null;
  ed.dispatchEvent(new Event('input', { bubbles: true }));
}

function restoreSnapshot(ed: HTMLTextAreaElement, snap: EditorSnapshot): void {
  ed.value = snap.value;
  ed.selectionStart = snap.start;
  ed.selectionEnd = snap.end;
  ultimaTecla = null;
  ed.dispatchEvent(new Event('input', { bubbles: true }));
}

export function undoEditor(ed: HTMLTextAreaElement): boolean {
  const undo = getStack(editorUndoStacks);
  const redo = getStack(editorRedoStacks);
  if (undo.length <= 1) return false;
  redo.push(undo.pop()!);
  restoreSnapshot(ed, undo[undo.length - 1]);
  return true;
}

export function redoEditor(ed: HTMLTextAreaElement): boolean {
  const undo = getStack(editorUndoStacks);
  const redo = getStack(editorRedoStacks);
  if (redo.length === 0) return false;
  const next = redo.pop()!;
  undo.push(next);
  restoreSnapshot(ed, next);
  return true;
}

export function outdentCurrentLine(ed: HTMLTextAreaElement): void {
  const start = ed.selectionStart ?? 0;
  const end = ed.selectionEnd ?? 0;
  const val = ed.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  const linePrefix = val.slice(lineStart);
  const match = /^ {1,4}/.exec(linePrefix);
  if (!match) return;
  const removed = match[0].length;
  const nextValue = val.slice(0, lineStart) + val.slice(lineStart + removed);
  const nextStart = Math.max(lineStart, start - removed);
  const nextEnd = Math.max(lineStart, end - removed);
  applyEditorEdit(ed, nextValue, nextStart, nextEnd);
}
