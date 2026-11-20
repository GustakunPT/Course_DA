// Ecrã de escrita no telemóvel: abre por cima da lição com Enunciado, Código e Resultado.

import type { EngineKind, Lesson } from '../data/types';
import { restoreFocusFromSelectors } from '../ui/modalFocus';
import {
  type AbaEscrita,
  deveUsarEcraDeEscrita,
  ligarAlturaVisivel,
  loadPreferirEditorNormal,
  renderEcraDeEscrita,
  vigiarAparelho,
} from '../ui/mobileEditor';
import { renderOutputRegion } from '../ui/outputView';
import { applyEditorEdit, outdentCurrentLine } from './editorHistory';
import {
  activeEngine,
  currentLesson,
  currentLessonMeta,
  currentTrackOrNull,
  getEditorValue,
  nextLessonLocation,
  resetWorkbenchForNewLesson,
} from './lessonContext';
import { renderApp } from './rerender';
import { state } from './store';
import { syncStateFromUrl } from './urlState';
import {
  renderEditorShell,
  renderEnunciado,
  renderNextHintButton,
  renderPistas,
  renderSchemaDrawer,
  renderSimbolosButtons,
  simbolosRapidos,
} from './workbenchParts';

const aparelho = vigiarAparelho(() => {
  if (state.mobileEditor !== null && !usaEcraDeEscrita()) {
    // Tira a entrada do ecrã do histórico; o popstate que se segue é ignorado (o ecrã já está fechado).
    if (history.state?.ecraEscrita) history.back();
    state.mobileEditor = null;
  }
  if (state.view === 'academia') renderApp();
});

/** O aparelho é de toque e estreito (independentemente da preferência do aluno). */
export function aparelhoPedeEcraDeEscrita(): boolean {
  if (currentLessonMeta().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({ toque: aparelho.toque(), estreito: aparelho.estreito(), preferirNormal: false });
}

/** As etapas de projeto não têm editor, logo nunca usam o ecrã de escrita. */
export function usaEcraDeEscrita(): boolean {
  if (currentLessonMeta().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({
    toque: aparelho.toque(),
    estreito: aparelho.estreito(),
    preferirNormal: loadPreferirEditorNormal(),
  });
}

let scrollAntesDoEcra = 0;
let desligarAlturaVisivel: () => void = () => {};
/** Etapa em que o ecrã foi aberto: só fecha se mudar de vista, trilha ou lição. */
let etapaDoEcra = '';
let editorSavedSelection: { start: number; end: number; scrollTop: number; scrollLeft: number } | null = null;

function etapaAtual(): string {
  return `${state.view}|${state.trackId}|${state.lessonId}`;
}

function saveEditorSelection(): void {
  const ed = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
  if (!ed) return;
  editorSavedSelection = {
    start: ed.selectionStart ?? ed.value.length,
    end: ed.selectionEnd ?? ed.value.length,
    scrollTop: ed.scrollTop,
    scrollLeft: ed.scrollLeft,
  };
}

function focarEditor(restoreSaved = false): void {
  const ed = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
  if (!ed) return;
  ed.focus({ preventScroll: true });
  if (restoreSaved && editorSavedSelection) {
    const len = ed.value.length;
    ed.selectionStart = Math.min(editorSavedSelection.start, len);
    ed.selectionEnd = Math.min(editorSavedSelection.end, len);
    ed.scrollTop = editorSavedSelection.scrollTop;
    ed.scrollLeft = editorSavedSelection.scrollLeft;
  } else {
    ed.selectionStart = ed.selectionEnd = ed.value.length;
  }
}

export function bindInsertButtons(rootEl: ParentNode): void {
  rootEl.querySelectorAll<HTMLElement>('[data-insert]').forEach((btn) => {
    // Sem isto o botão tira o foco ao editor e o teclado do telemóvel fecha e reabre a cada símbolo.
    btn.addEventListener('mousedown', (ev) => ev.preventDefault());
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const textToInsert = btn.dataset.insert;
      if (!textToInsert) return;
      const editorEl = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
      if (!editorEl) return;
      if (textToInsert === '__OUTDENT__') {
        outdentCurrentLine(editorEl);
        editorEl.focus({ preventScroll: true });
        return;
      }
      const start = editorEl.selectionStart ?? editorEl.value.length;
      const end = editorEl.selectionEnd ?? editorEl.value.length;
      const nextValue = editorEl.value.slice(0, start) + textToInsert + editorEl.value.slice(end);
      const newPos = start + textToInsert.length;
      applyEditorEdit(editorEl, nextValue, newPos, newPos);
      editorEl.focus({ preventScroll: true });
    });
  });
}

export function abrirEcraDeEscrita(aba: AbaEscrita): void {
  if (currentLessonMeta().engine === 'projeto') return;
  const ecraExistente = document.querySelector<HTMLElement>('.ecra-escrita');
  if (state.mobileEditor !== null && ecraExistente && etapaAtual() === etapaDoEcra) {
    // O ecrã já está aberto: troca só de separador, sem redesenhar (o teclado não fecha).
    if (state.mobileEditor === 'codigo' && aba !== 'codigo') {
      saveEditorSelection();
    }
    state.mobileEditor = aba;
    ecraExistente.querySelectorAll<HTMLElement>('[data-ecra-aba]').forEach((tab) => {
      tab.setAttribute('aria-selected', tab.dataset.ecraAba === aba ? 'true' : 'false');
    });
    ecraExistente.querySelectorAll<HTMLElement>('.ecra-painel').forEach((painel) => {
      painel.hidden = painel.dataset.painel !== aba;
    });
    const simbolosEl = ecraExistente.querySelector<HTMLElement>('.ecra-simbolos');
    if (simbolosEl) {
      if (aba === 'codigo') {
        simbolosEl.innerHTML = renderSimbolosButtons(activeEngine());
        bindInsertButtons(simbolosEl);
      } else {
        simbolosEl.innerHTML = '';
      }
    }
    if (aba === 'codigo') focarEditor(true);
    return;
  }

  if (state.mobileEditor === null) {
    editorSavedSelection = null;
    scrollAntesDoEcra = window.scrollY;
    etapaDoEcra = etapaAtual();
    history.pushState({ ecraEscrita: true }, '');
  }
  state.mobileEditor = aba;
  renderApp();
  // No iPhone o teclado só abre se o foco acontecer dentro do gesto do toque: tem de ser já.
  if (aba === 'codigo') focarEditor(false);
}

export function fecharEcraDeEscrita(opcoes: { viaHistorico?: boolean } = {}): void {
  if (state.mobileEditor === null) return;
  // Se o ecrã tem uma entrada no histórico, quem fecha é o popstate desse Voltar. Fechar já e
  // voltar depois deixava o histórico dessincronizado quando o aluno reabria antes de o Voltar acabar.
  if (!opcoes.viaHistorico && history.state?.ecraEscrita) {
    history.back();
    return;
  }
  const mesmaEtapa = etapaAtual() === etapaDoEcra;
  state.mobileEditor = null;
  renderApp();
  if (mesmaEtapa) window.scrollTo(0, scrollAntesDoEcra);
  restoreFocusFromSelectors(['[data-action="abrir-ecra-escrita"]', '#workbench-editor']);
}

/** Avança para a etapa seguinte a partir do ecrã de escrita (e fecha-o). */
export function irParaProximaEtapaDoEcra(): void {
  const next = nextLessonLocation();
  if (!next) return;
  state.trackId = next.trackId;
  state.lessonId = next.lessonId;
  state.mobileTab = 'lesson';
  resetWorkbenchForNewLesson();
  fecharEcraDeEscrita();
  window.scrollTo({ top: 0 });
}

/** O botão Voltar do telemóvel fecha o ecrã de escrita. */
export function installEcraHistoryListener(): void {
  window.addEventListener('popstate', () => {
    if (state.mobileEditor === null) return;
    // Mudar o # também dispara popstate: lê-se primeiro o endereço novo, senão o render seguinte
    // escreveria no endereço a etapa antiga.
    syncStateFromUrl();
    fecharEcraDeEscrita({ viaHistorico: true });
  });
}

/**
 * Chamado antes de cada render: fecha o ecrã se a etapa, o separador ou o aparelho mudaram.
 * Devolve true se o ecrã deve ser desenhado.
 */
export function prepararEcraParaRender(): boolean {
  if (state.mobileEditor !== null && (etapaAtual() !== etapaDoEcra || !usaEcraDeEscrita())) {
    state.mobileEditor = null;
    if (history.state?.ecraEscrita) history.replaceState(null, '');
  }
  desligarAlturaVisivel();
  desligarAlturaVisivel = () => {};
  return state.view === 'academia' && state.mobileEditor !== null && Boolean(currentTrackOrNull());
}

/** Chamado depois de cada render: ajusta o ecrã à altura visível (teclado aberto). */
export function ligarEcraDepoisDoRender(root: HTMLElement, ecraAberto: boolean): void {
  document.body.classList.toggle('tem-ecra-escrita', ecraAberto);
  const ecra = root.querySelector<HTMLElement>('.ecra-escrita');
  if (ecra) desligarAlturaVisivel = ligarAlturaVisivel(ecra);
}

function renderEcraEnunciadoHtml(lesson: Lesson): string {
  return (
    renderEnunciado(lesson) +
    renderPistas(lesson) +
    renderNextHintButton() +
    (lesson.engine === 'sql' || lesson.engine === 'python' ? renderSchemaDrawer() : '')
  );
}

/** Conteúdo do painel Enunciado, com a saída para o editor normal. */
export function renderEcraEnunciadoPainel(lesson: Lesson): string {
  return `${renderEcraEnunciadoHtml(lesson)}<button type="button" class="link-btn" data-action="usar-editor-normal">Usar o editor normal</button>`;
}

function renderEcraAcoesCodigo(lesson: Lesson): string {
  return `
    <button type="button" class="btn" data-action="editor-undo" title="Desfazer">↶ Desfazer</button>
    <button type="button" class="btn" data-action="editor-redo" title="Refazer">↷ Refazer</button>
    <button type="button" class="btn" data-action="copy-code">Copiar</button>
    <button type="button" class="btn" data-action="format-code">Formatar</button>
    <button type="button" class="btn" data-action="reset-code">Repor</button>
    ${
      state.wbTab === 'challenge'
        ? state.confirmSolutionLessonId === lesson.id
          ? `<button type="button" class="btn" data-action="apply-solution">Confirmar solução</button>
             <button type="button" class="btn" data-action="cancel-solution">Cancelar</button>`
          : `<button type="button" class="btn" data-action="ask-solution">Solução</button>`
        : ''
    }
    <button type="button" class="mode-btn" aria-pressed="${state.wbTab === 'challenge'}" data-wb-tab="challenge">Desafio</button>
    <button type="button" class="mode-btn" aria-pressed="${state.wbTab === 'example'}" data-wb-tab="example">Experimenta</button>
    <button type="button" class="mode-btn" aria-pressed="${state.wbTab === 'sqlfree'}" data-wb-tab="sqlfree">SQL</button>
  `;
}

export function renderEcraResultadoHtml(engine: EngineKind): string {
  const base = renderOutputRegion(state.output, engine, { hideStopButton: true });
  const editBtn = '<button type="button" class="btn" data-action="editar-codigo-ecra">Editar código</button>';
  if (state.output.kind === 'full' && state.output.bannerOk === true) {
    return `${base}<div class="action-pair">${editBtn}<button type="button" class="btn btn-primary" data-action="next-lesson-from-ecra">Próxima etapa →</button></div>`;
  }
  return `${base}<div class="action-pair">${editBtn}</div>`;
}

export function renderEcraDeEscritaAtual(): string {
  const lesson = currentLesson();
  const engine = activeEngine();
  return renderEcraDeEscrita({
    aba: state.mobileEditor ?? 'codigo',
    enunciadoHtml: renderEcraEnunciadoHtml(lesson),
    editorHtml: renderEditorShell(getEditorValue(), engine),
    resultadoHtml: renderEcraResultadoHtml(engine),
    simbolos: simbolosRapidos(engine),
    rotuloExecutar: state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar',
    aCorrer: state.output.kind === 'loading',
    acoesCodigoHtml: renderEcraAcoesCodigo(lesson),
  });
}
