// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { TRACK_INDEX } from '../src/data/trackIndex';
import { ensureTrackLoaded } from '../src/data/trackLoaders';
import {
  ensureInitialSnapshot,
  outdentCurrentLine,
  recordEditorInput,
  redoEditor,
  undoEditor,
  applyEditorEdit,
} from '../src/app/editorHistory';
import {
  draftKey,
  locateLesson,
  nextLessonLocation,
  quizKey,
  resetWorkbenchForNewLesson,
} from '../src/app/lessonContext';
import { state } from '../src/app/store';
import { syncStateFromUrl, writeStateToUrl } from '../src/app/urlState';

const [primeira, segunda] = TRACK_INDEX;

beforeEach(() => {
  history.replaceState(null, '', '/');
  state.view = 'academia';
  state.trackId = primeira.id;
  state.lessonId = primeira.lessons[0].id;
  state.wbTab = 'challenge';
  state.practiceIdx = 0;
  state.explorerCidade = 'todas';
  state.explorerCategoria = 'todas';
  state.refQuery = '';
  state.refCategory = 'Todas';
});

describe('lessonContext', () => {
  it('quizKey: a pergunta 0 usa o id da etapa e as seguintes ganham #n', () => {
    expect(quizKey('sql-01', 0)).toBe('sql-01');
    expect(quizKey('sql-01', 2)).toBe('sql-01#3');
  });

  it('locateLesson segue a etapa para a trilha certa e recua para a 1.ª etapa da trilha pedida', () => {
    const etapaDaSegunda = segunda.lessons[1].id;
    expect(locateLesson(primeira.id, etapaDaSegunda)).toEqual({ trackId: segunda.id, lessonId: etapaDaSegunda });
    expect(locateLesson(segunda.id, 'nao-existe')).toEqual({ trackId: segunda.id, lessonId: segunda.lessons[0].id });
    expect(locateLesson('trilha-inventada', null)).toBeNull();
  });

  it('draftKey separa o desafio principal dos treinos', () => {
    const lesson = { id: 'py-03' } as Parameters<typeof draftKey>[0];
    expect(draftKey(lesson, 'challenge')).toBe('py-03:challenge');
    state.practiceIdx = 2;
    expect(draftKey(lesson, 'challenge')).toBe('py-03:treino2');
    expect(draftKey(lesson, 'example')).toBe('py-03:example');
  });

  it('nextLessonLocation avança dentro da trilha e passa para a trilha seguinte no fim', async () => {
    await ensureTrackLoaded(primeira.id);
    expect(nextLessonLocation()).toEqual({ trackId: primeira.id, lessonId: primeira.lessons[1].id });
    state.lessonId = primeira.lessons[primeira.lessons.length - 1].id;
    expect(nextLessonLocation()).toEqual({ trackId: segunda.id, lessonId: segunda.lessons[0].id });
  });

  it('resetWorkbenchForNewLesson volta ao desafio principal sem resultado nem pistas', () => {
    Object.assign(state, {
      wbTab: 'example',
      practiceIdx: 2,
      hintLevel: 2,
      confirmSolutionLessonId: 'x',
      output: { kind: 'loading' },
    });
    resetWorkbenchForNewLesson();
    expect(state).toMatchObject({
      wbTab: 'challenge',
      practiceIdx: 0,
      hintLevel: 0,
      confirmSolutionLessonId: null,
      output: { kind: 'empty' },
    });
  });
});

describe('urlState', () => {
  it('lê a vista, a trilha e a etapa do #', () => {
    const etapa = segunda.lessons[2].id;
    history.replaceState(null, '', `/#vista=academia&trilha=${segunda.id}&licao=${etapa}`);
    syncStateFromUrl();
    expect(state.trackId).toBe(segunda.id);
    expect(state.lessonId).toBe(etapa);
  });

  it('aceita links escritos à mão no ? e passa-os para o #', () => {
    history.replaceState(null, '', '/?vista=explorador&cidade=Braga&utm=x');
    syncStateFromUrl();
    expect(state.view).toBe('explorador');
    expect(state.explorerCidade).toBe('Braga');
    expect(location.search).toBe('?utm=x');
  });

  it('ignora vistas desconhecidas', () => {
    history.replaceState(null, '', '/#vista=hack');
    syncStateFromUrl();
    expect(state.view).toBe('academia');
  });

  it('escreve no # só os filtros que não são o valor por omissão', () => {
    state.view = 'referencia';
    state.refQuery = 'GROUP BY';
    writeStateToUrl();
    expect(location.hash).toBe('#vista=referencia&q=GROUP+BY');
    state.view = 'explorador';
    writeStateToUrl();
    expect(location.hash).toBe('#vista=explorador');
  });
});

describe('editorHistory', () => {
  function novoEditor(valor: string): HTMLTextAreaElement {
    const ed = document.createElement('textarea');
    ed.value = valor;
    ed.selectionStart = ed.selectionEnd = valor.length;
    ensureInitialSnapshot(ed);
    return ed;
  }

  beforeEach(() => {
    // Cada teste usa uma etapa própria: o histórico é guardado por etapa, separador e treino.
    state.lessonId = `teste-${Math.random()}`;
  });

  it('desfaz e refaz uma edição', () => {
    const ed = novoEditor('a');
    applyEditorEdit(ed, 'ab', 2, 2);
    expect(undoEditor(ed)).toBe(true);
    expect(ed.value).toBe('a');
    expect(undoEditor(ed)).toBe(false);
    expect(redoEditor(ed)).toBe(true);
    expect(ed.value).toBe('ab');
    expect(redoEditor(ed)).toBe(false);
  });

  it('teclas seguidas juntam-se num só passo e escrever apaga o refazer', () => {
    const ed = novoEditor('');
    for (const v of ['x', 'xy', 'xyz']) {
      ed.value = v;
      recordEditorInput(ed);
    }
    undoEditor(ed);
    expect(ed.value).toBe('');
    redoEditor(ed);
    ed.value = 'xyz!';
    recordEditorInput(ed);
    expect(redoEditor(ed)).toBe(false);
  });

  it('cada separador tem o seu histórico', () => {
    const ed = novoEditor('desafio');
    applyEditorEdit(ed, 'desafio 2', 9, 9);
    state.wbTab = 'example';
    expect(undoEditor(ed)).toBe(false);
  });

  it('outdentCurrentLine tira até 4 espaços do início da linha', () => {
    const ed = novoEditor('if x:\n      y = 1');
    ed.selectionStart = ed.selectionEnd = ed.value.length;
    outdentCurrentLine(ed);
    expect(ed.value).toBe('if x:\n  y = 1');
    outdentCurrentLine(ed);
    expect(ed.value).toBe('if x:\ny = 1');
  });
});
