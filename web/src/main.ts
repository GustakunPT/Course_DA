import './styles/app.css';
import {
  TOTAL_LESSONS_COUNT,
  TRACK_INDEX,
  type LessonIndexEntry,
  type TrackIndexEntry,
} from './data/trackIndex';
import {
  ensureTrackLoaded,
  getCachedTrack,
  loadAllTracksAsync,
  loadCheatsheetsAsync,
} from './data/trackLoaders';
import {
  formatHoursApproxPt,
  formatMinutesPt,
  getLessonBaseMinutes,
  getLessonBufferMinutes,
  getLessonMinutes,
  getTrackMinutes,
} from './data/studyPlan';
import { formatTimerClock, loadSavedLessonTimes, saveLessonTimes } from './data/timeTracker';
import {
  clearSavedDiagnostic,
  evaluateDiagnosticPlan,
  loadSavedDiagnostic,
  saveDiagnostic,
  type BackgroundLevel,
} from './data/diagnostic';
import { evaluatePlacementAnswers } from './data/placementQuiz';
import { markLessonReviewedRecord } from './data/spacedReview';
import { getCourseMinutes } from './data/studyPlan';
import type { EngineKind, GitChallengeSpec, Lesson, PythonChallengeSpec, SqlChallengeSpec, Track } from './data/types';
import { loadMerceariaDataset } from './engines/csvEngine';
import { createInitialGitState } from './engines/gitEngine';
import type { GanttFilterStatus } from './ui/ganttView';
import { formatCodePrettier, highlightCode, renderLineNumbers } from './ui/codeEditor';
import {
  clearAllUserProgress,
  decodeProgressCode,
  encodeProgressCode,
  exportProgressJson,
  generatePortfolioMarkdown,
  importProgressJson,
  buildSyncShareUrl,
  extractSyncCode,
  loadLastLocation,
  loadSavedDrafts,
  loadSavedProgress,
  loadSavedQuizzes,
  loadSyncCode,
  pullCloudSync,
  pushCloudSync,
  loadSavedPractice,
  savePractice,
  saveDrafts,
  saveLastLocation,
  saveProgress,
  saveQuizzes,
  saveSyncCode,
} from './data/progress';
import type { AppState, ViewMode, WorkbenchTab } from './ui/appState';
import { createCloudSyncController } from './ui/cloudSyncController';
import {
  focusInitialDialogElement,
  getActiveModalKind,
  handleDialogTabTrap,
  handleTablistArrowKeys,
  restoreFocusFromSelectors,
  selectorForControl,
  type ModalKind,
} from './ui/modalFocus';
import { attachSplitterListeners } from './ui/splitters';
import { startStudyTimer } from './ui/studyTimer';
import { createWorkbenchRunner } from './ui/workbenchRunner';
import { buildAnswerSheetCode, isAnswerSheetMode, renderAnswerSheetPanel } from './ui/answerSheetPanel';
import { downloadTextFile, escapeHtml } from './ui/html';
import { quizDisplayOrder } from './ui/quizOrder';
import { DEFAULT_LAYOUT, loadSavedLayout, saveLayoutPrefs } from './ui/layout';
import { renderDiagnosticModal, renderGuideModal, renderProgressModal, renderThemeModal } from './ui/modals';
import { renderOutputRegion } from './ui/outputView';
import { chaveLista, ESTADO_PROJETO, etapaProjetoCompleta, linkGithubValido, mensagemLink, renderPainelProjeto } from './ui/projectPanel';
import {
  type AbaEscrita,
  deveUsarEcraDeEscrita,
  ligarAlturaVisivel,
  loadPreferirEditorNormal,
  renderEcraDeEscrita,
  renderPreviaCodigo,
  savePreferirEditorNormal,
  vigiarAparelho,
} from './ui/mobileEditor';
import { applyTheme, loadSavedTheme, THEME_OPTIONS, type ThemeId } from './ui/theme';
import { applyFontSize, FONT_SIZE_OPTIONS, type FontSizeId, loadSavedFontSize, NORMAL, renderFontSizeMenu, saveFontSize } from './ui/fontSize';

const savedDiagnostic = loadSavedDiagnostic();

const state: AppState = {
  view: 'academia',
  trackId: TRACK_INDEX[0].id,
  lessonId: TRACK_INDEX[0].lessons[0].id,
  wbTab: 'challenge',
  practiceIdx: 0,
  practiceDone: new Set(loadSavedPractice()),
  editorDrafts: loadSavedDrafts(),
  quizSelection: loadSavedQuizzes(),
  completedLessons: loadSavedProgress(),
  helpedInSession: new Set(),
  hintLevel: 0,
  showProgressModal: false,
  showThemeModal: false,
  generatedProgressCode: '',
  progressCodeInput: '',
  progressModalFeedback: null,
  confirmClearProgress: false,
  syncCode: loadSyncCode(),
  syncStatus: loadSyncCode() ? 'synced' : 'idle',
  syncLastUpdatedAt: null,
  output: { kind: 'empty' },
  gitState: createInitialGitState(),
  sidebarOpenMobile: false,
  mobileTab: 'lesson',
  layout: loadSavedLayout(),
  explorerSerie: 'sazonal',
  explorerCidade: 'todas',
  explorerCategoria: 'todas',
  refQuery: '',
  refCategory: 'Todas',
  theme: loadSavedTheme(),
  dataset: null,
  datasetError: null,
  confirmSolutionLessonId: null,
  mobileEditor: null,
  fontSize: loadSavedFontSize(),
  showFontMenu: false,
  ganttPaceMinutes: savedDiagnostic ? savedDiagnostic.hoursPerWeek * 60 : 360,
  ganttFilterStatus: 'all',
  ganttCollapsedTracks: new Set(),
  lessonTimes: loadSavedLessonTimes(),
  timerPaused: false,
  showDiagnosticModal: false,
  showGuideModal: false,
  diagnostic: savedDiagnostic,
  diagnosticDraft: savedDiagnostic ?? {
    background: 'zero',
    hoursPerWeek: 6,
    targetMonths: 6,
    updatedAt: '',
  },
  showPlacementQuiz: false,
  placementAnswers: {},
};

applyTheme(state.theme);
applyFontSize(state.fontSize);


/** Chave onde fica guardada a resposta à pergunta n (0 = a pergunta principal, que conta para o progresso). */
function quizKey(lessonId: string, n: number): string {
  return n === 0 ? lessonId : `${lessonId}#${n + 1}`;
}

function renderQuizzes(lesson: Lesson): string {
  const perguntas = [lesson.quiz, ...(lesson.moreQuiz ?? [])];
  const varias = perguntas.length > 1;
  const certas = perguntas.filter((q, n) => state.quizSelection[quizKey(lesson.id, n)] === q.correctIndex).length;
  return `
        <div class="quiz-well" role="group" aria-labelledby="quiz-title">
          <h3 id="quiz-title">Verificação rápida de conceito${varias ? ` <span class="quiz-score">${certas} de ${perguntas.length} certas</span>` : ''}</h3>
          ${perguntas
            .map((q, n) => {
              const key = quizKey(lesson.id, n);
              const sel = state.quizSelection[key];
              return `
          <div class="quiz-item">
            <p>${varias ? `<strong>${n + 1}.</strong> ` : ''}${escapeHtml(q.question)}</p>
            <div class="quiz-options">
              ${quizDisplayOrder(key, q.options.length)
                .map((idx) => {
                  let cls = '';
                  if (sel !== undefined) {
                    if (idx === q.correctIndex) cls = 'is-correct';
                    else if (idx === sel) cls = 'is-wrong';
                  }
                  return `
                  <label class="quiz-option ${cls}">
                    <input type="radio" name="quiz-${escapeHtml(key)}" value="${idx}" class="quiz-radio"
                      data-quiz-idx="${idx}" data-quiz-key="${escapeHtml(key)}" ${sel === idx ? 'checked' : ''} />
                    <span>${escapeHtml(q.options[idx])}</span>
                  </label>`;
                })
                .join('')}
            </div>
            <div class="helper-slot ${sel !== undefined ? (sel === q.correctIndex ? 'is-ok' : 'is-bad') : ''}">
              ${
                sel === undefined
                  ? 'Seleciona uma opção para testar a tua compreensão.'
                  : sel === q.correctIndex
                    ? `Correto! ${escapeHtml(q.explanation)}`
                    : `Ainda não: ${escapeHtml(q.explanation)}`
              }
            </div>
          </div>`;
            })
            .join('')}
        </div>`;
}

function currentTrackMeta(): TrackIndexEntry {
  return TRACK_INDEX.find((t) => t.id === state.trackId) ?? TRACK_INDEX[0];
}

function currentLessonMeta(): LessonIndexEntry {
  const tr = currentTrackMeta();
  return tr.lessons.find((l) => l.id === state.lessonId) ?? tr.lessons[0];
}

function currentTrackOrNull(): Track | null {
  return getCachedTrack(currentTrackMeta().id) ?? null;
}

function currentTrack(): Track {
  const tr = currentTrackOrNull();
  if (!tr) throw new Error(`Trilha "${state.trackId}" ainda a carregar.`);
  return tr;
}

function currentLesson(): Lesson {
  const track = currentTrack();
  return track.lessons.find((l) => l.id === state.lessonId) ?? track.lessons[0];
}

function savePracticeDone(): void {
  savePractice(state.practiceDone);
  scheduleCloudSync();
}

/** Desafio Python ativo na bancada: o principal ou um dos treinos. */
function activePythonChallenge(lesson: Lesson): PythonChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practice?.[state.practiceIdx - 1] ?? lesson.pythonChallenge;
  return lesson.pythonChallenge;
}

/** Desafio SQL ativo na bancada: o principal ou um dos treinos. */
function activeSqlChallenge(lesson: Lesson): SqlChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practiceSql?.[state.practiceIdx - 1] ?? lesson.sqlChallenge;
  return lesson.sqlChallenge;
}

/** Desafio Git ativo na bancada: o principal ou um dos treinos. */
function activeGitChallenge(lesson: Lesson): GitChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practiceGit?.[state.practiceIdx - 1] ?? lesson.gitChallenge;
  return lesson.gitChallenge;
}

function draftKey(lesson: Lesson, tab: WorkbenchTab): string {
  if (tab === 'challenge' && state.practiceIdx > 0) return `${lesson.id}:treino${state.practiceIdx}`;
  return `${lesson.id}:${tab}`;
}

/**
 * Rascunho onde fica o link do GitHub de uma etapa de projeto. É o draftKey(lesson, 'challenge')
 * sem treino (as etapas de projeto não têm treinos), a mesma chave que o portefólio lê.
 */
function chaveLinkProjeto(lesson: Lesson): string {
  return `${lesson.id}:challenge`;
}

function linkDoProjeto(lesson: Lesson): string {
  return state.editorDrafts[chaveLinkProjeto(lesson)] ?? '';
}

function defaultEditorCode(lesson: Lesson, tab: WorkbenchTab): string {
  if (tab === 'sqlfree') {
    return `SELECT produto, SUM(quantidade) AS unidades, ROUND(SUM(quantidade * preco), 2) AS faturacao_eur\nFROM vendas\nGROUP BY produto\nORDER BY faturacao_eur DESC\nLIMIT 5;`;
  }
  if (tab === 'example') {
    return lesson.exampleCode;
  }
  const py = activePythonChallenge(lesson);
  if (py) return py.starterCode;
  const sq = activeSqlChallenge(lesson);
  if (sq) return sq.starterSql;
  const gc = activeGitChallenge(lesson);
  if (gc) return gc.starterCommands;
  return lesson.exampleCode;
}

function getEditorValue(): string {
  const lesson = currentLesson();
  const key = draftKey(lesson, state.wbTab);
  return state.editorDrafts[key] ?? defaultEditorCode(lesson, state.wbTab);
}

function activeEngine(): EngineKind {
  if (state.wbTab === 'sqlfree') return 'sql';
  return currentLessonMeta().engine;
}

/**
 * Encontra a trilha certa para uma etapa. Se a etapa mudou de trilha (ex.: quando a trilha 5
 * foi dividida), segue a etapa; se não existir, abre a primeira etapa da trilha pedida.
 */
function locateLesson(trackId: string | null | undefined, lessonId: string | null | undefined): { trackId: string; lessonId: string } | null {
  const pedida = TRACK_INDEX.find((t) => t.id === trackId);
  if (lessonId) {
    const dona = pedida?.lessons.some((l) => l.id === lessonId) ? pedida : TRACK_INDEX.find((t) => t.lessons.some((l) => l.id === lessonId));
    if (dona) return { trackId: dona.id, lessonId };
  }
  return pedida ? { trackId: pedida.id, lessonId: pedida.lessons[0].id } : null;
}

// Chaves de navegação que a app lê do endereço. O formato normal é #vista=...&trilha=...&licao=...,
// mas também se aceitam no ?..., para links escritos à mão; nesse caso passam para o # e saem do ?.
const CHAVES_NAVEGACAO = ['vista', 'trilha', 'licao', 'cidade', 'categoria', 'q', 'ferramenta'];

function syncStateFromUrl(): void {
  const search = new URLSearchParams(window.location.search);
  const daQuery = new URLSearchParams();
  for (const k of CHAVES_NAVEGACAO) {
    const valor = search.get(k);
    if (valor !== null) daQuery.set(k, valor);
    search.delete(k);
  }
  if ([...daQuery.keys()].length) {
    const resto = search.toString();
    history.replaceState(null, '', `${window.location.pathname}${resto ? `?${resto}` : ''}${window.location.hash}`);
  }
  const raw = window.location.hash.replace(/^#/, '') || daQuery.toString();
  if (!raw) {
    const last = loadLastLocation();
    if (last) {
      if (last.view === 'academia' || last.view === 'explorador' || last.view === 'referencia' || last.view === 'cronograma') {
        state.view = last.view;
      }
      const loc = locateLesson(last.trackId, last.lessonId);
      if (loc) {
        state.trackId = loc.trackId;
        state.lessonId = loc.lessonId;
      }
    }
    return;
  }
  const params = new URLSearchParams(raw);
  const v = params.get('vista');
  if (v === 'academia' || v === 'explorador' || v === 'referencia' || v === 'cronograma') {
    state.view = v;
  }
  const loc = locateLesson(params.get('trilha'), params.get('licao'));
  if (loc) {
    state.trackId = loc.trackId;
    state.lessonId = loc.lessonId;
  }
  const cid = params.get('cidade');
  if (cid) state.explorerCidade = cid;
  const cat = params.get('categoria');
  if (cat) state.explorerCategoria = cat;
  const q = params.get('q');
  if (q !== null) state.refQuery = q;
  const f = params.get('ferramenta');
  if (f) state.refCategory = f;
}

function writeStateToUrl(): void {
  const params = new URLSearchParams();
  params.set('vista', state.view);
  if (state.view === 'academia') {
    params.set('trilha', state.trackId);
    params.set('licao', state.lessonId);
  } else if (state.view === 'explorador') {
    if (state.explorerCidade !== 'todas') params.set('cidade', state.explorerCidade);
    if (state.explorerCategoria !== 'todas') params.set('categoria', state.explorerCategoria);
  } else if (state.view === 'referencia') {
    if (state.refQuery) params.set('q', state.refQuery);
    if (state.refCategory !== 'Todas') params.set('ferramenta', state.refCategory);
  }
  const nextHash = `#${params.toString()}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(history.state, '', nextHash);
  }
  saveLastLocation({
    trackId: state.trackId,
    lessonId: state.lessonId,
    view: state.view,
    timestamp: new Date().toISOString(),
  });
}

function markLessonCompleted(lesson: Lesson): void {
  const existing = state.completedLessons[lesson.id];
  const wasHelped = state.helpedInSession.has(lesson.id);
  const status = existing?.status === 'autonomous' ? 'autonomous' : wasHelped ? 'helped' : 'autonomous';
  const quizIdx = state.quizSelection[lesson.id];
  const quizPassed = existing?.quizPassed || (quizIdx !== undefined && quizIdx === lesson.quiz.correctIndex);

  state.completedLessons[lesson.id] = {
    status,
    quizPassed,
    completedAt: existing?.completedAt ?? new Date().toISOString(),
  };
  saveProgress(state.completedLessons);
  scheduleCloudSync();
}

/**
 * Conclui uma etapa de projeto quando a lista está toda marcada (e há link válido, se pedido).
 * Desmarcar depois não desfaz a conclusão. Devolve true só quando a etapa acabou de ficar concluída.
 */
function concluirEtapaProjeto(lesson: Lesson): boolean {
  if (state.completedLessons[lesson.id]) return false;
  if (!etapaProjetoCompleta(lesson, state.practiceDone, linkDoProjeto(lesson))) return false;
  markLessonCompleted(lesson);
  return true;
}

let pendingCloudRender = false;
const cloudSync = createCloudSyncController({
  state,
  locateLesson,
  renderApp: () => {
    if (document.activeElement?.id === 'workbench-editor') {
      pendingCloudRender = true;
      return;
    }
    renderApp();
  },
});
const buildCloudSyncPayload = cloudSync.buildPayload;
const applyRemoteCloudSync = cloudSync.applyRemote;
const scheduleCloudSync = cloudSync.scheduleSync;

function renderViewLoadingSkeleton(title: string): string {
  return `
    <section class="seam-panels">
      <div class="seam-panel skeleton-stack" role="status">
        <h1>${escapeHtml(title)}</h1>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </div>
    </section>
  `;
}

let explorerViewMod: typeof import('./ui/explorerView') | null = null;
let ganttViewMod: typeof import('./ui/ganttView') | null = null;
let cheatsheetViewMod: typeof import('./ui/cheatsheetView') | null = null;
let explorerLoadStarted = false;
let ganttLoadStarted = false;
let cheatsheetLoadStarted = false;
let trackLoadError: { trackId: string; message: string } | null = null;
let viewLoadError: { view: 'explorador' | 'cronograma' | 'referencia'; message: string } | null = null;

function renderPracticeSwitcher(lesson: Lesson): string {
  const treinos: { title?: string }[] = lesson.practice ?? lesson.practiceSql ?? lesson.practiceGit ?? [];
  if (!treinos.length) return '';
  const feito = (i: number) =>
    i === 0 ? Boolean(state.completedLessons[lesson.id]) : state.practiceDone.has(`${lesson.id}:${i}`);
  const botoes = [lesson.pythonChallenge ?? lesson.sqlChallenge ?? lesson.gitChallenge, ...treinos].map((ch, i) => {
    const nome = i === 0 ? 'Desafio' : `Treino ${i}`;
    const dica = i === 0 ? 'Desafio principal da etapa (conta para o progresso)' : ch?.title ?? nome;
    return `<button type="button" class="mode-btn" aria-pressed="${state.practiceIdx === i}" data-practice-idx="${i}" title="${escapeHtml(dica)}">${nome}${feito(i) ? ' ✓' : ''}</button>`;
  });
  return `<div class="practice-switcher" role="group" aria-label="Desafio principal e exercícios de treino">${botoes.join('')}</div>`;
}

/** Atalhos da barra de símbolos no telemóvel, de acordo com o motor da bancada. */
function simbolosRapidos(engine: EngineKind): [string, string][] {
  if (engine === 'sql') {
    return [
      ['SELECT', 'SELECT '],
      ['FROM', 'FROM '],
      ['WHERE', 'WHERE '],
      ['GROUP BY', 'GROUP BY '],
      ['ORDER BY', 'ORDER BY '],
      ['AS', 'AS '],
      ['JOIN', 'JOIN '],
      ['ON', 'ON '],
      ['AND', 'AND '],
      ['OR', 'OR '],
      ['DESC', 'DESC'],
      ['LIMIT', 'LIMIT '],
      ['_', '_'],
      ["'", "'"],
      ['*', '*'],
      ['(', '('],
      [')', ')'],
      [',', ', '],
      ['=', '='],
      ['<', '<'],
      ['>', '>'],
      [';', ';'],
    ];
  }
  if (engine === 'git') {
    return [
      ['git ', 'git '],
      ['status', 'status'],
      ['add .', 'add .'],
      ['commit -m ""', 'commit -m ""'],
      ['log', 'log'],
      ['branch ', 'branch '],
      ['switch ', 'switch '],
      ['-c ', '-c '],
      ['merge ', 'merge '],
      ['"', '"'],
      ['.', '.'],
    ];
  }
  if (engine === 'projeto') return [];
  return [
    ['⇥ Tab', '    '],
    ['⇤ -Tab', '__OUTDENT__'],
    ['_', '_'],
    ["'", "'"],
    ['"', '"'],
    [':', ':'],
    ['(', '('],
    [')', ')'],
    ['[', '['],
    [']', ']'],
    ['{', '{'],
    ['}', '}'],
    ['=', '='],
    ['==', ' == '],
    ['!=', ' != '],
    ['.', '.'],
    [',', ', '],
    ['+', ' + '],
    ['-', ' - '],
    ['*', ' * '],
    ['/', ' / '],
    ['<', '<'],
    ['>', '>'],
    ['#', '# '],
  ];
}

function renderSchemaDrawer(): string {
  return `
    <details class="schema-drawer">
      <summary>Tabelas e colunas disponíveis (6)</summary>
      <ul class="schema-drawer-list">
        <li><code>vendas</code> (5 078): id, data, cliente_id, produto_id, produto, quantidade, preco</li>
        <li><code>vendas_sazonais</code> (7 031): id, data, cliente_id, produto_id, produto, quantidade, preco</li>
        <li><code>clientes</code> (120): id, nome, cidade</li>
        <li><code>produtos</code> (15): id, nome, categoria, preco_base</li>
        <li><code>vendas_sujas</code> (12): id, data, cliente_id, produto, quantidade, preco</li>
        <li><code>vendas_detalhe</code> (vista, 5 078): id, data, cliente_id, cliente, cidade, produto_id, produto, categoria, quantidade, preco, subtotal</li>
      </ul>
    </details>
  `;
}

/** Descrição do que o aluno tem de fazer no separador ativo da bancada. */
function descricaoDoEnunciado(lesson: Lesson): string {
  return (
    state.wbTab === 'sqlfree'
      ? 'Consola SQLite aberta com todas as tabelas da Mercearia: produtos (15), clientes (120), vendas (5 078) e vendas_sujas (12).'
      : state.wbTab === 'example'
        ? 'Modo Experimenta (estilo W3Schools): altera os valores à vontade e executa para observar o comportamento.'
        : activePythonChallenge(lesson)?.description ??
          activeSqlChallenge(lesson)?.description ??
          activeGitChallenge(lesson)?.description ??
          'Corre o código abaixo para validar esta etapa.'
  );
}

/** Título e descrição do desafio (o seletor de treinos incluído). */
function renderEnunciado(lesson: Lesson): string {
  const promptDescription = descricaoDoEnunciado(lesson);
  return `
        <div class="challenge-prompt">
          ${state.wbTab === 'challenge' ? renderPracticeSwitcher(lesson) : ''}
          <strong>${
            state.wbTab === 'challenge'
              ? state.practiceIdx > 0
                ? `Treino ${state.practiceIdx}: ${escapeHtml(activePythonChallenge(lesson)?.title ?? activeSqlChallenge(lesson)?.title ?? activeGitChallenge(lesson)?.title ?? '')}`
                : 'Enunciado do desafio'
              : state.wbTab === 'example'
                ? 'Laboratório Experimenta'
                : 'Consulta SQL livre'
          }</strong>
          <p>${escapeHtml(promptDescription)}</p>
        </div>
  `;
}

function renderSimbolosBar(engine: EngineKind): string {
  return `
        <div class="mobile-symbols-bar" aria-label="Símbolos rápidos de código">
          ${simbolosRapidos(engine)
            .map(([texto, valor]) => `<button type="button" class="sym-btn" data-insert="${escapeHtml(valor)}">${escapeHtml(texto)}</button>`)
            .join('')}
        </div>
  `;
}

/** O editor de código (com os ids que os listeners procuram). Existe uma só vez no DOM. */
function renderEditorShell(editorVal: string, engine: EngineKind): string {
  return `
        <div class="code-editor-shell" id="editor-shell">
          <div class="code-gutter" id="workbench-gutter" aria-hidden="true">${renderLineNumbers(editorVal)}</div>
          <div class="code-stage">
            <pre class="code-highlight-layer" id="workbench-highlight" aria-hidden="true"><code>${highlightCode(editorVal, engine)}</code></pre>
            <label for="workbench-editor" class="visually-hidden">Editor de código interativo</label>
            <textarea
              id="workbench-editor"
              name="code"
              class="code-editor"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              wrap="off"
            >${escapeHtml(editorVal)}</textarea>
          </div>
        </div>
  `;
}

/** Pistas progressivas do desafio guiado. */
function renderPistas(lesson: Lesson): string {
  return `
        ${
          state.wbTab === 'challenge' && state.hintLevel > 0
            ? (() => {
                const hint1 =
                  activeSqlChallenge(lesson)?.hint ??
                  activeGitChallenge(lesson)?.hint ??
                  activePythonChallenge(lesson)?.checks[0]?.hint ??
                  lesson.beginnerSteps?.[0] ??
                  'Revê a sintaxe na tabela de referência à esquerda.';
                const hint2 =
                  lesson.beginnerSteps && lesson.beginnerSteps.length > 0
                    ? lesson.beginnerSteps.join(' · ')
                    : lesson.commonPitfall ?? 'Compara a tua lógica passo a passo com o exemplo demonstrativo.';
                return `
                  <div class="hints-panel" role="region" aria-label="Pistas progressivas">
                    <div class="hint-card">
                      <strong>Pista 1:</strong> ${escapeHtml(hint1)}
                    </div>
                    ${
                      state.hintLevel >= 2
                        ? `<div class="hint-card is-step2">
                             <strong>Pista 2 (Passo a passo):</strong> ${escapeHtml(hint2)}
                           </div>`
                        : ''
                    }
                  </div>
                `;
              })()
            : ''
        }
  `;
}

// ---- Ecrã de escrita no telemóvel ----

const aparelho = vigiarAparelho(() => {
  if (state.mobileEditor !== null && !usaEcraDeEscrita()) {
    // Tira a entrada do ecrã do histórico; o popstate que se segue é ignorado (o ecrã já está fechado).
    if (history.state?.ecraEscrita) history.back();
    state.mobileEditor = null;
  }
  if (state.view === 'academia') renderApp();
});

/** O aparelho é de toque e estreito (independentemente da preferência do aluno). */
function aparelhoPedeEcraDeEscrita(): boolean {
  if (currentLessonMeta().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({ toque: aparelho.toque(), estreito: aparelho.estreito(), preferirNormal: false });
}

/** As etapas de projeto não têm editor, logo nunca usam o ecrã de escrita. */
function usaEcraDeEscrita(): boolean {
  if (currentLessonMeta().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({ toque: aparelho.toque(), estreito: aparelho.estreito(), preferirNormal: loadPreferirEditorNormal() });
}

let scrollAntesDoEcra = 0;
let desligarAlturaVisivel: () => void = () => {};
/** Etapa em que o ecrã foi aberto: só fecha se mudar de vista, trilha ou lição. */
let etapaDoEcra = '';
let editorSavedSelection: { start: number; end: number; scrollTop: number; scrollLeft: number } | null = null;

interface EditorSnapshot {
  value: string;
  start: number;
  end: number;
}
const editorUndoStacks = new Map<string, EditorSnapshot[]>();
const editorRedoStacks = new Map<string, EditorSnapshot[]>();
let lastSnapshotTime = 0;

function editorHistoryKey(): string {
  return `${state.lessonId}:${state.wbTab}:${state.practiceIdx}`;
}

function getUndoStack(): EditorSnapshot[] {
  const k = editorHistoryKey();
  let arr = editorUndoStacks.get(k);
  if (!arr) {
    arr = [];
    editorUndoStacks.set(k, arr);
  }
  return arr;
}

function getRedoStack(): EditorSnapshot[] {
  const k = editorHistoryKey();
  let arr = editorRedoStacks.get(k);
  if (!arr) {
    arr = [];
    editorRedoStacks.set(k, arr);
  }
  return arr;
}

function recordEditorInput(ed: HTMLTextAreaElement): void {
  const undo = getUndoStack();
  const redo = getRedoStack();
  const now = performance.now();
  const snap: EditorSnapshot = {
    value: ed.value,
    start: ed.selectionStart ?? ed.value.length,
    end: ed.selectionEnd ?? ed.value.length,
  };
  if (undo.length > 0 && now - lastSnapshotTime < 500) {
    undo[undo.length - 1] = snap;
  } else {
    if (undo.length === 0 || undo[undo.length - 1].value !== snap.value) {
      undo.push(snap);
      if (undo.length > 80) undo.shift();
    }
  }
  lastSnapshotTime = now;
  redo.length = 0;
}

function applyEditorEdit(ed: HTMLTextAreaElement, nextValue: string, nextStart: number, nextEnd: number): void {
  const undo = getUndoStack();
  const redo = getRedoStack();
  const curSnap: EditorSnapshot = {
    value: ed.value,
    start: ed.selectionStart ?? ed.value.length,
    end: ed.selectionEnd ?? ed.value.length,
  };
  if (undo.length === 0 || undo[undo.length - 1].value !== curSnap.value) {
    undo.push(curSnap);
  }
  ed.value = nextValue;
  ed.selectionStart = nextStart;
  ed.selectionEnd = nextEnd;
  undo.push({ value: nextValue, start: nextStart, end: nextEnd });
  if (undo.length > 80) undo.shift();
  redo.length = 0;
  lastSnapshotTime = 0;
  ed.dispatchEvent(new Event('input', { bubbles: true }));
}

function undoEditor(ed: HTMLTextAreaElement): boolean {
  const undo = getUndoStack();
  const redo = getRedoStack();
  if (undo.length <= 1) return false;
  const current = undo.pop()!;
  redo.push(current);
  const prev = undo[undo.length - 1];
  ed.value = prev.value;
  ed.selectionStart = prev.start;
  ed.selectionEnd = prev.end;
  lastSnapshotTime = 0;
  ed.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function redoEditor(ed: HTMLTextAreaElement): boolean {
  const undo = getUndoStack();
  const redo = getRedoStack();
  if (redo.length === 0) return false;
  const next = redo.pop()!;
  undo.push(next);
  ed.value = next.value;
  ed.selectionStart = next.start;
  ed.selectionEnd = next.end;
  lastSnapshotTime = 0;
  ed.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function outdentCurrentLine(ed: HTMLTextAreaElement): void {
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

function bindInsertButtons(rootEl: ParentNode): void {
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

function abrirEcraDeEscrita(aba: AbaEscrita): void {
  if (currentLessonMeta().engine === 'projeto') return;
  const ecraExistente = document.querySelector<HTMLElement>('.ecra-escrita');
  if (state.mobileEditor !== null && ecraExistente && etapaAtual() === etapaDoEcra) {
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
        simbolosEl.innerHTML = simbolosRapidos(activeEngine())
          .map(([texto, valor]) => `<button type="button" class="sym-btn" data-insert="${escapeHtml(valor)}">${escapeHtml(texto)}</button>`)
          .join('');
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

function fecharEcraDeEscrita(opcoes: { viaHistorico?: boolean } = {}): void {
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

window.addEventListener('popstate', () => {
  if (state.mobileEditor === null) return;
  // Mudar o # também dispara popstate: lê-se primeiro o endereço novo, senão o render seguinte
  // escreveria no endereço a etapa antiga.
  syncStateFromUrl();
  fecharEcraDeEscrita({ viaHistorico: true });
});

function renderEcraEnunciadoHtml(lesson: Lesson): string {
  return (
    renderEnunciado(lesson) +
    renderPistas(lesson) +
    (state.wbTab === 'challenge' && state.hintLevel < 2
      ? `<button type="button" class="btn" data-action="next-hint">${state.hintLevel === 0 ? 'Pedir pista (1/2)' : 'Mais uma pista (2/2)'}</button>`
      : '') +
    (lesson.engine === 'sql' || lesson.engine === 'python' ? renderSchemaDrawer() : '')
  );
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

function renderEcraResultadoHtml(engine: EngineKind): string {
  const base = renderOutputRegion(state.output, engine, { hideStopButton: true });
  const editBtn = '<button type="button" class="btn" data-action="editar-codigo-ecra">Editar código</button>';
  if (state.output.kind === 'full' && state.output.bannerOk === true) {
    return `${base}<div class="action-pair">${editBtn}<button type="button" class="btn btn-primary" data-action="next-lesson-from-ecra">Próxima etapa →</button></div>`;
  }
  return `${base}<div class="action-pair">${editBtn}</div>`;
}

function renderEcraDeEscritaAtual(): string {
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

function updateWorkbenchOutputInPlace(): void {
  const ecra = document.querySelector<HTMLElement>('.ecra-escrita');
  if (!ecra) {
    renderApp();
    return;
  }
  const engine = activeEngine();
  const resPanel = ecra.querySelector<HTMLElement>('.ecra-painel[data-painel="resultado"]');
  if (resPanel) {
    resPanel.innerHTML = renderEcraResultadoHtml(engine);
  }
  const aCorrer = state.output.kind === 'loading';
  const execBtn = ecra.querySelector<HTMLButtonElement>('[data-action="executar-ecra-escrita"]');
  if (execBtn) execBtn.disabled = aCorrer;

  const barra = ecra.querySelector<HTMLElement>('.ecra-barra');
  if (barra) {
    const existingStop = barra.querySelector<HTMLElement>('[data-action="stop-code"]');
    if (aCorrer && !existingStop && execBtn) {
      const stopBtn = document.createElement('button');
      stopBtn.type = 'button';
      stopBtn.className = 'btn btn-danger-outline';
      stopBtn.dataset.action = 'stop-code';
      stopBtn.textContent = 'Parar';
      barra.insertBefore(stopBtn, execBtn);
    } else if (!aCorrer && existingStop) {
      existingStop.remove();
    }
  }

  // Atualiza o progresso e o painel Enunciado se a execução terminou.
  if (state.output.kind === 'full') {
    const enunciadoPanel = ecra.querySelector<HTMLElement>('.ecra-painel[data-painel="enunciado"]');
    const lesson = currentTrackOrNull() ? currentLesson() : null;
    if (enunciadoPanel && lesson) {
      enunciadoPanel.innerHTML = `${renderEcraEnunciadoHtml(lesson)}<button type="button" class="link-btn" data-action="usar-editor-normal">Usar o editor normal</button>`;
    }
    const done = Object.keys(state.completedLessons).length;
    const progressFull = document.querySelector<HTMLElement>('.nav-progress-btn .progress-full');
    if (progressFull) progressFull.textContent = `Progresso ${done}/${TOTAL_LESSONS_COUNT}`;
    const progressCompact = document.querySelector<HTMLElement>('.nav-progress-btn .progress-compact');
    if (progressCompact) progressCompact.textContent = `${done}/${TOTAL_LESSONS_COUNT}`;
  }

  // Garante listeners nos botões dinâmicos de resultado / barra (stop-code, run-code, next-hint, usar-editor-normal).
  ecra.querySelectorAll<HTMLElement>('.ecra-painel[data-painel="resultado"] [data-action], .ecra-barra [data-action="stop-code"], .ecra-painel[data-painel="enunciado"] [data-action]').forEach((btn) => {
    if (btn.dataset.boundAction === '1') return;
    btn.dataset.boundAction = '1';
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      if (act === 'stop-code') {
        const stopped = workbenchRunner.cancelExecution();
        if (!stopped) {
          state.output = { kind: 'error', errorText: 'Execução interrompida pelo utilizador.' };
          updateWorkbenchOutputInPlace();
        }
      } else if (act === 'run-code') {
        void executeWorkbench();
      } else if (act === 'next-hint') {
        state.hintLevel = Math.min(2, state.hintLevel + 1);
        const lesson = currentTrackOrNull() ? currentLesson() : null;
        const enunciadoPanel = ecra.querySelector<HTMLElement>('.ecra-painel[data-painel="enunciado"]');
        if (enunciadoPanel && lesson) {
          enunciadoPanel.innerHTML = `${renderEcraEnunciadoHtml(lesson)}<button type="button" class="link-btn" data-action="usar-editor-normal">Usar o editor normal</button>`;
        }
      } else if (act === 'editar-codigo-ecra') {
        abrirEcraDeEscrita('codigo');
      } else if (act === 'next-lesson-from-ecra') {
        const track = currentTrackOrNull();
        if (track) {
          const lesson = currentLesson();
          const idx = track.lessons.findIndex((l) => l.id === lesson.id);
          const trIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
          const next =
            idx < track.lessons.length - 1
              ? { trackId: track.id, lessonId: track.lessons[idx + 1].id }
              : trIdx >= 0 && trIdx < TRACK_INDEX.length - 1
                ? { trackId: TRACK_INDEX[trIdx + 1].id, lessonId: TRACK_INDEX[trIdx + 1].lessons[0].id }
                : null;
          if (next) {
            state.trackId = next.trackId;
            state.lessonId = next.lessonId;
            state.mobileTab = 'lesson';
            state.wbTab = 'challenge';
            state.practiceIdx = 0;
            state.output = { kind: 'empty' };
            state.confirmSolutionLessonId = null;
            state.hintLevel = 0;
            fecharEcraDeEscrita();
            window.scrollTo({ top: 0 });
          }
        }
      } else if (act === 'usar-editor-normal') {
        savePreferirEditorNormal(true);
        fecharEcraDeEscrita();
      }
    });
  });
}

const loadingTrackIds = new Set<string>();

function renderCompletionBanner(track: TrackIndexEntry, lesson: Lesson): string {
  const doneCount = Object.keys(state.completedLessons).length;
  const trackDone = track.lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
  const isTrackFinished = trackDone === track.lessons.length;
  const trackIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
  const nextTrack = trackIdx >= 0 && trackIdx < TRACK_INDEX.length - 1 ? TRACK_INDEX[trackIdx + 1] : null;
  const isFinalLesson = trackIdx === TRACK_INDEX.length - 1 && lesson.id === track.lessons[track.lessons.length - 1]?.id;
  const isCourseFinished = doneCount === TOTAL_LESSONS_COUNT || (isFinalLesson && Boolean(state.completedLessons[lesson.id]));

  if (isCourseFinished) {
    const rawGithubUrl = (state.editorDrafts['pf-05-publicar:challenge'] ?? '').trim();
    const githubLink = linkGithubValido(rawGithubUrl) ? rawGithubUrl : '';
    return `
      <section class="completion-banner is-course-complete" aria-label="Conclusão do curso">
        <span class="status-chip is-ok">Percurso concluído · ${doneCount} / ${TOTAL_LESSONS_COUNT} etapas</span>
        <h2>Chegaste ao fim! O teu portefólio está pronto.</h2>
        <p>Fechaste Python, SQL, Pandas, Git, Visualização/BI, Estatística, o desafio de recrutamento simulado, o projeto próprio e a preparação para candidaturas.</p>
        ${
          githubLink
            ? `<p><strong>Projeto publicado no GitHub:</strong> <a href="${escapeHtml(githubLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(githubLink)}</a></p>`
            : ''
        }
        <ol class="prose-list">
          <li>Descarrega o teu portefólio em Markdown (<code>.md</code>) e junta o resumo ao teu CV em PDF.</li>
          <li>Confirma que o repositório do projeto próprio está fixado nos <strong>Destaques</strong> do LinkedIn.</li>
          <li>Usa o guião do pitch de 2 minutos e candidata-te esta semana às primeiras 5 vagas de Analista de Dados Júnior.</li>
        </ol>
        <div class="action-pair" style="flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" data-action="export-portfolio-md">Descarregar Portfólio (.md)</button>
          <button type="button" class="btn" data-action="export-progress-json">Backup do Progresso (.json)</button>
          <button type="button" class="btn" data-action="open-progress-modal">Ver mapa e plano de 10 semanas</button>
        </div>
      </section>
    `;
  }

  if (isTrackFinished && nextTrack) {
    return `
      <section class="completion-banner" aria-label="Conclusão da trilha">
        <span class="status-chip is-ok">Trilha concluída · ${trackDone}/${track.lessons.length} etapas</span>
        <h3>Terminaste ${escapeHtml(track.shortTitle)}!</h3>
        <p>Todas as etapas desta trilha estão concluídas. Podes seguir diretamente para a próxima trilha (${escapeHtml(formatHoursApproxPt(getTrackMinutes(nextTrack)))} estimadas).</p>
        <div class="action-pair">
          <button type="button" class="btn btn-primary" data-select-track="${escapeHtml(nextTrack.id)}">
            Avançar para ${escapeHtml(nextTrack.shortTitle)} →
          </button>
        </div>
      </section>
    `;
  }

  return '';
}

function renderAcademyShell(trackMeta: TrackIndexEntry, lessonMeta: LessonIndexEntry, centerAndRightHtml: string): string {
  const { sidebarWidth, lessonRatio, editorHeight, sidebarCollapsed } = state.layout;
  const workbenchRatio = 100 - lessonRatio;

  return `
    <div class="layout-bar" role="region" aria-label="Controlo de painéis e redimensionamento">
      <div class="layout-controls">
        <button type="button" class="btn mobile-index-toggle" data-action="toggle-mobile-sidebar">
          ${state.sidebarOpenMobile ? 'Ocultar índice' : `Índice (etapa ${escapeHtml(lessonMeta.code)})`}
        </button>
        <button type="button" class="btn" data-action="toggle-desktop-sidebar">
          ${sidebarCollapsed ? 'Mostrar índice' : 'Recolher índice'}
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio >= 58}" data-layout-preset="reading">
          Foco leitura
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio > 42 && lessonRatio < 58}" data-layout-preset="balanced">
          Divisão 50 / 50
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio <= 42}" data-layout-preset="coding">
          Foco código
        </button>
      </div>
      <div class="layout-controls desktop-only-controls">
        <span class="status-chip">Arrasta as divisórias para redimensionar</span>
        <button type="button" class="btn" data-action="reset-layout">Repor painéis</button>
      </div>
    </div>

    <!-- Mobile Segmented View Switcher (Lição vs Bancada) -->
    <div class="mobile-view-segmented" role="tablist" aria-label="Alternar entre lição e bancada">
      <button
        type="button"
        role="tab"
        class="segmented-btn ${state.mobileTab === 'lesson' ? 'is-active' : ''}"
        data-mobile-tab="lesson"
        aria-selected="${state.mobileTab === 'lesson'}"
      >
        📖 Lição
      </button>
      <button
        type="button"
        role="tab"
        class="segmented-btn ${state.mobileTab === 'workbench' ? 'is-active' : ''}"
        data-mobile-tab="workbench"
        aria-selected="${state.mobileTab === 'workbench'}"
      >
        ⚡ Bancada
      </button>
    </div>

    ${state.sidebarOpenMobile ? `<div class="sidebar-backdrop" data-action="toggle-mobile-sidebar" aria-hidden="true"></div>` : ''}

    <div
      id="academy-grid"
      class="seam-panels academy-grid ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}"
      data-mobile-active="${state.mobileTab}"
      style="--sidebar-w: ${sidebarWidth}px; --lesson-fr: ${lessonRatio}fr; --workbench-fr: ${workbenchRatio}fr; --editor-h: ${editorHeight}px;"
    >
      <!-- Left Sidebar -->
      <nav class="seam-panel sidebar-panel ${state.sidebarOpenMobile ? 'is-open' : ''}" aria-label="Índice de etapas">
        <div class="sidebar-drawer-header">
          <strong>Navegação</strong>
          <button type="button" class="sidebar-drawer-close" data-action="close-mobile-sidebar" aria-label="Fechar índice">✕</button>
        </div>
        <div class="sidebar-track-pills" role="group" aria-label="Escolher trilha">
          ${TRACK_INDEX.map(
            (tr) =>
              `<button type="button" class="sidebar-track-pill ${tr.id === trackMeta.id ? 'is-active' : ''}" data-select-track="${escapeHtml(tr.id)}">${escapeHtml(tr.shortTitle)}</button>`,
          ).join('')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-heading">${escapeHtml(trackMeta.fullTitle)} <span class="sidebar-time-hint">(${escapeHtml(formatHoursApproxPt(getTrackMinutes(trackMeta)))})</span></div>
          <ul class="lesson-nav-list">
            ${trackMeta.lessons
              .map((item) => {
                const isCur = item.id === lessonMeta.id;
                const rec = state.completedLessons[item.id];
                const isDone = Boolean(rec);
                const isHelped = rec?.status === 'helped';
                // Etapa de projeto concluída: autoavaliada, nunca aparece como corrigida.
                const isProjeto = isDone && item.engine === 'projeto';
                const statusClass = isProjeto ? 'is-projeto' : isDone ? (isHelped ? 'is-helped' : 'is-done') : '';
                const rotulo = isProjeto ? `${item.title} (${ESTADO_PROJETO})` : item.title;
                return `
                  <li>
                    <button
                      type="button"
                      class="lesson-nav-btn ${isCur ? 'is-current' : ''} ${statusClass}"
                      data-select-lesson="${escapeHtml(item.id)}"
                      title="${escapeHtml(rotulo)}"
                      ${isProjeto ? `aria-label="${escapeHtml(rotulo)}"` : ''}
                      ${isCur ? 'aria-current="step"' : ''}
                    >
                      <span class="lesson-nav-title">${escapeHtml(item.title)}</span>
                      <span class="lesson-step-id">${isProjeto ? '✓' : isDone ? (isHelped ? 'REF' : 'OK') : escapeHtml(item.code)}</span>
                    </button>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-heading">Tabelas na bancada</div>
          <ul class="lesson-nav-list">
            <li class="schema-row"><span>vendas_sazonais</span><span class="lesson-step-id">7031</span></li>
            <li class="schema-row"><span>vendas</span><span class="lesson-step-id">5078</span></li>
            <li class="schema-row"><span>clientes</span><span class="lesson-step-id">120</span></li>
            <li class="schema-row"><span>produtos</span><span class="lesson-step-id">15</span></li>
            <li class="schema-row"><span>vendas_sujas</span><span class="lesson-step-id">12</span></li>
            <li class="schema-row" title="Vista: vendas já juntas com produtos e clientes"><span>vendas_detalhe (vista)</span><span class="lesson-step-id">5078</span></li>
          </ul>
        </div>
      </nav>

      <!-- Resizable Splitter: Sidebar <-> Lesson -->
      <div
        id="splitter-sidebar"
        class="pane-splitter-v splitter-sidebar"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="Redimensionar largura do índice lateral"
        title="Arrasta para redimensionar o índice lateral (duplo clique para repor)"
      ></div>

      ${centerAndRightHtml}
    </div>
  `;
}

function renderAcademyWorkspace(): string {
  const trackMeta = currentTrackMeta();
  const lessonMeta = currentLessonMeta();
  const track = getCachedTrack(trackMeta.id);

  if (!track) {
    if (trackLoadError?.trackId === trackMeta.id) {
      return renderAcademyShell(
        trackMeta,
        lessonMeta,
        `
        <article class="seam-panel lesson-article error-state" role="alert">
          <h1>Não foi possível carregar ${escapeHtml(trackMeta.shortTitle)}</h1>
          <p>${escapeHtml(trackLoadError.message)}</p>
          <div><button type="button" class="btn btn-primary" data-action="retry-track-load">Tentar novamente</button></div>
        </article>
        `,
      );
    }
    if (!loadingTrackIds.has(trackMeta.id)) {
      loadingTrackIds.add(trackMeta.id);
      void ensureTrackLoaded(trackMeta.id)
        .then(() => {
          if (trackLoadError?.trackId === trackMeta.id) trackLoadError = null;
          if (state.view === 'academia' && currentTrackMeta().id === trackMeta.id) renderApp();
        })
        .catch((err) => {
          trackLoadError = {
            trackId: trackMeta.id,
            message: err instanceof Error ? err.message : 'Verifica a tua ligação à internet e tenta novamente.',
          };
          if (state.view === 'academia' && currentTrackMeta().id === trackMeta.id) renderApp();
        })
        .finally(() => {
          loadingTrackIds.delete(trackMeta.id);
        });
    }
    return renderAcademyShell(
      trackMeta,
      lessonMeta,
      `
      <article class="seam-panel lesson-article skeleton-stack" role="status">
        <span class="status-chip">A carregar ${escapeHtml(trackMeta.shortTitle)}…</span>
        <h1>${escapeHtml(lessonMeta.title)}</h1>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </article>
      <div id="splitter-main" class="pane-splitter-v" role="separator" tabindex="0" aria-orientation="vertical"></div>
      <section class="seam-panel seam-panel-deep workbench-panel skeleton-stack" aria-label="Bancada a carregar">
        <span class="status-chip">A preparar bancada…</span>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </section>
      `,
    );
  }

  const lesson = track.lessons.find((l) => l.id === lessonMeta.id) ?? track.lessons[0];
  const lessonIdx = track.lessons.findIndex((l) => l.id === lesson.id);
  const trackIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
  const prevTrack = trackIdx > 0 ? TRACK_INDEX[trackIdx - 1] : null;
  const nextTrack = trackIdx >= 0 && trackIdx < TRACK_INDEX.length - 1 ? TRACK_INDEX[trackIdx + 1] : null;
  const prevLesson =
    lessonIdx > 0
      ? track.lessons[lessonIdx - 1]
      : prevTrack
        ? prevTrack.lessons[prevTrack.lessons.length - 1]
        : null;
  const nextLesson =
    lessonIdx < track.lessons.length - 1
      ? track.lessons[lessonIdx + 1]
      : nextTrack
        ? nextTrack.lessons[0]
        : null;

  const engine = activeEngine();
  const editorVal = getEditorValue();
  const answerSheet = isAnswerSheetMode(lesson.id, state.wbTab, state.practiceIdx);

  return renderAcademyShell(
    trackMeta,
    lessonMeta,
    `
      <!-- Center Lesson Column -->
      <article class="seam-panel lesson-article">
        <header class="lesson-header">
          <div class="workbench-toolbar">
            <div class="action-pair" style="flex-wrap:wrap;gap:6px;">
              <span class="status-chip is-person">Etapa ${escapeHtml(lesson.code)} de ${track.lessons.length}</span>
              <span class="status-chip" title="Tempo previsto base (${getLessonBaseMinutes(lesson)} min) + margem de ~20% (${getLessonBufferMinutes(lesson)} min)">⏱ ~${escapeHtml(formatMinutesPt(getLessonBaseMinutes(lesson)))} (+${getLessonBufferMinutes(lesson)} min margem)</span>
              <button
                type="button"
                class="status-chip lesson-timer-pill ${state.timerPaused ? 'is-paused' : 'is-running'}"
                data-action="toggle-lesson-timer"
                title="Tempo real nesta etapa vs previsto (${getLessonMinutes(lesson)} min c/ margem). Pausa automaticamente se mudares de separador ou após 3 min de inatividade. Clica para pausar/retomar."
              >
                <span aria-hidden="true">${state.timerPaused ? '▶' : '⏸'}</span>
                <span id="lesson-timer-clock">${escapeHtml(formatTimerClock(state.lessonTimes[lesson.id] ?? 0))}</span>
                <span class="measured">/ ${escapeHtml(formatMinutesPt(getLessonMinutes(lesson)))}</span>
              </button>
            </div>
            ${
              state.completedLessons[lesson.id]
                ? lesson.engine === 'projeto'
                  ? `<span class="status-chip is-projeto">${escapeHtml(ESTADO_PROJETO)}</span>`
                  : state.completedLessons[lesson.id].status === 'helped'
                  ? `<span class="status-chip is-helped">Concluída c/ apoio</span>`
                  : `<span class="status-chip is-ok">Concluída</span>`
                : `<span class="status-chip">${escapeHtml(track.engineLabel)}</span>`
            }
          </div>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="lesson-lede">${escapeHtml(lesson.lede)}</p>
        </header>

        ${
          lesson.id === 'py-00-pensamento' && !state.diagnostic
            ? `<div class="gantt-diag-strip">
                <div class="gantt-diag-info">
                  <strong>Novo na academia?</strong> <span class="measured">Vê como navegar pelas 3 janelas ou faz o diagnóstico de 30 s para ajustar o Cronograma Gantt ao teu ritmo.</span>
                </div>
                <div class="action-pair" style="flex-wrap:wrap;">
                  <button type="button" class="btn" data-action="open-guide-modal">? Como navegar</button>
                  <button type="button" class="btn btn-primary" data-action="open-diagnostic-modal">🎯 Fazer diagnóstico</button>
                </div>
              </div>`
            : ''
        }

        <section class="analogy-box" aria-label="Analogia prática">
          <h2>${escapeHtml(lesson.analogyTitle)}</h2>
          <p>${escapeHtml(lesson.analogyBody)}</p>
        </section>

        ${
          lesson.beginnerSteps && lesson.beginnerSteps.length
            ? `
          <section class="prose-section">
            <h2>Passo a passo</h2>
            <ol class="prose-list">
              ${lesson.beginnerSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ol>
          </section>
        `
            : ''
        }

        ${
          lesson.explained && lesson.explained.length
            ? `
          <section class="prose-section">
            <h2>Explicado com calma</h2>
            ${lesson.explained.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          </section>
        `
            : ''
        }

        <section class="prose-section">
          <h2>Conceitos essenciais</h2>
          <ul class="prose-list">
            ${lesson.concepts.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
          </ul>
        </section>

        ${
          lesson.errorDemo
            ? `
          <section class="prose-section error-demo" aria-label="Exemplo de erro">
            <h2>O que acontece se…</h2>
            <pre class="code-sample"><code>${highlightCode(lesson.errorDemo.code, lesson.engine)}</code></pre>
            <p class="error-demo-label">${
              lesson.engine === 'sql'
                ? 'O SQLite responde:'
                : lesson.engine === 'git'
                  ? 'O Git responde:'
                  : 'O Python responde:'
            }</p>
            <pre class="error-demo-msg">${escapeHtml(lesson.errorDemo.message)}</pre>
            <p>${escapeHtml(lesson.errorDemo.fix)}</p>
          </section>
        `
            : ''
        }

        ${
          lesson.proPractice || lesson.commonPitfall
            ? `
          <section class="pro-grid" aria-label="Prática profissional e erros comuns">
            ${
              lesson.proPractice
                ? `
              <div class="pro-box">
                <h3>No trabalho real (Nível Profissional)</h3>
                <p>${escapeHtml(lesson.proPractice)}</p>
              </div>
            `
                : ''
            }
            ${
              lesson.commonPitfall
                ? `
              <div class="pro-box is-pitfall">
                <h3>Armadilha clássica a evitar</h3>
                <p>${escapeHtml(lesson.commonPitfall)}</p>
              </div>
            `
                : ''
            }
          </section>
        `
            : ''
        }

        <section class="prose-section">
          <h2>${escapeHtml(lesson.referenceTitle)}</h2>
          <div class="table-scroll">
            <table class="data-table">
              <caption class="visually-hidden">${escapeHtml(lesson.referenceTitle)}</caption>
              <thead>
                <tr>
                  <th scope="col">Sintaxe</th>
                  <th scope="col">O que faz</th>
                  <th scope="col">Exemplo prático</th>
                </tr>
              </thead>
              <tbody>
                ${lesson.referenceRows
                  .map(
                    (r) => `
                  <tr>
                    <td class="mono-cell">${escapeHtml(r.syntax)}</td>
                    <td>${escapeHtml(r.meaning)}</td>
                    <td class="mono-cell">${escapeHtml(r.example)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="prose-section">
          <div class="workbench-toolbar">
            <h2>Exemplo demonstrativo</h2>
            ${lesson.engine === 'projeto' ? '' : '<button type="button" class="btn" data-action="load-example-tab">Experimentar no editor</button>'}
          </div>
          <pre class="code-sample"><code>${highlightCode(lesson.exampleCode, lesson.engine)}</code></pre>
        </section>

        ${renderQuizzes(lesson)}

        <nav class="lesson-pager" aria-label="Navegação entre lições">
          <button type="button" class="btn" data-select-lesson="${prevLesson ? escapeHtml(prevLesson.id) : ''}" ${!prevLesson ? 'disabled' : ''}>
            Etapa anterior
          </button>
          <button type="button" class="btn" data-select-lesson="${nextLesson ? escapeHtml(nextLesson.id) : ''}" ${!nextLesson ? 'disabled' : ''}>
            Próxima etapa
          </button>
        </nav>

        ${renderCompletionBanner(trackMeta, lesson)}

        <div class="mobile-switch-wrap">
          <button type="button" class="btn btn-primary mobile-switch-btn" data-action="switch-to-workbench">
            Ir para a Bancada ⚡ ▶
          </button>
        </div>
      </article>

      <!-- Resizable Splitter: Lesson <-> Workbench -->
      <div
        id="splitter-main"
        class="pane-splitter-v"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="Redimensionar largura entre a lição e o editor de código"
        title="Arrasta para redimensionar lição vs editor (duplo clique para 50/50)"
      ></div>

      <!-- Right Live Workbench -->
      <section class="seam-panel seam-panel-deep workbench-panel" aria-label="Bancada interativa de código">
        <div class="mobile-switch-wrap">
          <button type="button" class="btn mobile-switch-btn" data-action="switch-to-lesson">
            ◀ Ver Enunciado da Lição
          </button>
        </div>

        ${
          lesson.engine === 'projeto'
            ? renderPainelProjeto(lesson, state.practiceDone, linkDoProjeto(lesson), Boolean(state.completedLessons[lesson.id]))
            : `
        <div class="workbench-toolbar">
          <div class="mode-tabs" role="tablist" aria-label="Modo do editor">
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'challenge'}" data-wb-tab="challenge">
              Desafio guiado
            </button>
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'example'}" data-wb-tab="example">
              Experimenta livre
            </button>
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'sqlfree'}" data-wb-tab="sqlfree">
              Consola SQL
            </button>
          </div>
          <span class="status-chip desktop-shortcut-chip">
            ${answerSheet ? 'Preenche os valores e clica Verificar' : 'Ctrl + Enter para correr'}
          </span>
        </div>

        ${renderEnunciado(lesson)}

        ${
          answerSheet
            ? renderAnswerSheetPanel(lesson.id, editorVal)
            : usaEcraDeEscrita()
              ? state.mobileEditor === null
                ? renderPreviaCodigo(highlightCode(editorVal, engine))
                : ''
              : `${renderSimbolosBar(engine)}
        ${renderEditorShell(editorVal, engine)}
        ${aparelhoPedeEcraDeEscrita() ? '<button type="button" class="link-btn" data-action="usar-ecra-escrita">Usar o ecrã de escrita</button>' : ''}`
        }

        ${
          answerSheet
            ? ''
            : `<!-- Resizable Horizontal Splitter: Editor <-> Output -->
        <div
          id="splitter-editor"
          class="pane-splitter-h"
          role="separator"
          tabindex="0"
          aria-orientation="horizontal"
          aria-label="Redimensionar altura do editor de código"
          title="Arrasta para aumentar ou diminuir a altura do editor (duplo clique para repor)"
        ></div>`
        }

        <div class="workbench-actions">
          <div class="action-pair">
            <button type="button" class="btn btn-primary" data-action="run-code" ${state.output.kind === 'loading' ? 'disabled' : ''}>
              ${answerSheet ? 'Verificar respostas' : state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar agora'}
            </button>
            ${
              state.output.kind === 'loading' && (activeEngine() === 'python' || activeEngine() === 'sql')
                ? '<button type="button" class="btn btn-danger-outline" data-action="stop-code">Parar execução</button>'
                : ''
            }
            ${
              answerSheet
                ? ''
                : `<button type="button" class="btn" data-action="format-code" title="Formatar código com Prettier (Shift + Alt + F)">
              Formatar Prettier
            </button>`
            }
            <button type="button" class="btn" data-action="reset-code">${answerSheet ? 'Limpar respostas' : 'Repor código'}</button>
          </div>
          ${
            state.wbTab === 'challenge'
              ? `<div class="action-pair">
                  ${
                    state.hintLevel < 2
                      ? `<button type="button" class="btn" data-action="next-hint">${state.hintLevel === 0 ? 'Pedir pista (1/2)' : 'Mais uma pista (2/2)'}</button>`
                      : ''
                  }
                  ${
                    state.confirmSolutionLessonId === lesson.id
                      ? `<button type="button" class="btn" data-action="apply-solution">Confirmar solução</button>
                         <button type="button" class="btn" data-action="cancel-solution">Cancelar</button>`
                      : `<button type="button" class="btn" data-action="ask-solution">${answerSheet ? 'Mostrar respostas de referência' : 'Mostrar solução de referência'}</button>`
                  }
                </div>`
              : ''
          }
        </div>

        ${state.mobileEditor === null && (engine === 'sql' || engine === 'python') ? renderSchemaDrawer() : ''}

        ${state.mobileEditor === null ? renderPistas(lesson) : ''}

        ${state.mobileEditor === null ? renderOutputRegion(state.output, engine) : ''}
        `
        }
      </section>
    `,
  );
}

let prevOpenModal: ModalKind = 'none';
let modalTriggerSelector: string | null = null;
const MODAL_FALLBACK_TRIGGERS: Record<Exclude<ModalKind, 'none'>, string[]> = {
  guide: ['[data-action="open-guide-modal"]'],
  progress: ['[data-action="open-progress-modal"]'],
  theme: ['[data-action="open-theme-modal"]'],
  diagnostic: ['[data-action="open-diagnostic-modal"]', '[data-action="open-progress-modal"]'],
};

function renderApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const nextModal = getActiveModalKind(state);
  let insideModalControlSelector: string | null = null;
  if (prevOpenModal === 'none' && nextModal !== 'none') {
    modalTriggerSelector = selectorForControl(document.activeElement);
  } else if (prevOpenModal !== 'none' && nextModal === prevOpenModal) {
    const active = document.activeElement;
    if (active && active.closest('.modal-backdrop')) {
      insideModalControlSelector = selectorForControl(active);
    }
  }

  writeStateToUrl();

  // O ecrã de escrita fecha se a etapa, o separador ou o aparelho mudarem.
  if (state.mobileEditor !== null && (etapaAtual() !== etapaDoEcra || !usaEcraDeEscrita())) {
    state.mobileEditor = null;
    if (history.state?.ecraEscrita) history.replaceState(null, '');
  }
  const ecraAberto = state.view === 'academia' && state.mobileEditor !== null && Boolean(currentTrackOrNull());
  desligarAlturaVisivel();
  desligarAlturaVisivel = () => {};

  let mainContent = '';
  if (state.view === 'academia') {
    mainContent = renderAcademyWorkspace();
  } else if (state.view === 'explorador') {
    if (state.datasetError) {
      mainContent = `
        <section class="seam-panels">
          <div class="seam-panel error-state" role="alert">
            <h1>Erro ao carregar os ficheiros CSV</h1>
            <p>${escapeHtml(state.datasetError)}</p>
            <div><button type="button" class="btn btn-primary" data-action="retry-dataset">Tentar carregar novamente</button></div>
          </div>
        </section>
      `;
    } else if (!state.dataset) {
      void bootstrapData();
      mainContent = `
        <section class="seam-panels">
          <div class="seam-panel skeleton-stack" role="status">
            <h1>A carregar dados da Mercearia do Bairro…</h1>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
            <div class="skeleton-bar"></div>
          </div>
        </section>
      `;
    } else if (!explorerViewMod) {
      if (viewLoadError?.view === 'explorador') {
        mainContent = `
          <section class="seam-panels">
            <div class="seam-panel error-state" role="alert">
              <h1>Não foi possível carregar o Explorador</h1>
              <p>${escapeHtml(viewLoadError.message)}</p>
              <div><button type="button" class="btn btn-primary" data-action="retry-view-load">Tentar novamente</button></div>
            </div>
          </section>
        `;
      } else {
        if (!explorerLoadStarted) {
          explorerLoadStarted = true;
          void import('./ui/explorerView')
            .then((mod) => {
              explorerViewMod = mod;
              if (viewLoadError?.view === 'explorador') viewLoadError = null;
              if (state.view === 'explorador') renderApp();
            })
            .catch((err) => {
              explorerLoadStarted = false;
              viewLoadError = {
                view: 'explorador',
                message: err instanceof Error ? err.message : 'Verifica a ligação à internet e tenta novamente.',
              };
              if (state.view === 'explorador') renderApp();
            });
        }
        mainContent = renderViewLoadingSkeleton('A carregar Explorador de Dados…');
      }
    } else {
      mainContent = explorerViewMod.renderExplorerHtml(state.dataset, {
        serie: state.explorerSerie,
        cidade: state.explorerCidade,
        categoria: state.explorerCategoria,
      });
    }
  } else if (state.view === 'cronograma') {
    if (!ganttViewMod) {
      if (viewLoadError?.view === 'cronograma') {
        mainContent = `
          <section class="seam-panels">
            <div class="seam-panel error-state" role="alert">
              <h1>Não foi possível carregar o Cronograma</h1>
              <p>${escapeHtml(viewLoadError.message)}</p>
              <div><button type="button" class="btn btn-primary" data-action="retry-view-load">Tentar novamente</button></div>
            </div>
          </section>
        `;
      } else {
        if (!ganttLoadStarted) {
          ganttLoadStarted = true;
          void import('./ui/ganttView')
            .then((mod) => {
              ganttViewMod = mod;
              if (viewLoadError?.view === 'cronograma') viewLoadError = null;
              if (state.view === 'cronograma') renderApp();
            })
            .catch((err) => {
              ganttLoadStarted = false;
              viewLoadError = {
                view: 'cronograma',
                message: err instanceof Error ? err.message : 'Verifica a ligação à internet e tenta novamente.',
              };
              if (state.view === 'cronograma') renderApp();
            });
        }
        mainContent = renderViewLoadingSkeleton('A carregar Cronograma…');
      }
    } else {
      mainContent = ganttViewMod.renderGanttHtml(TRACK_INDEX, state.completedLessons, {
        paceMinutesPerWeek: state.ganttPaceMinutes,
        filterStatus: state.ganttFilterStatus,
        collapsedTracks: state.ganttCollapsedTracks,
        currentLessonId: state.lessonId,
        lessonTimes: state.lessonTimes,
        diagnostic: state.diagnostic,
        quizSelection: state.quizSelection,
      });
    }
  } else {
    if (!cheatsheetViewMod) {
      if (viewLoadError?.view === 'referencia') {
        mainContent = `
          <section class="seam-panels">
            <div class="seam-panel error-state" role="alert">
              <h1>Não foi possível carregar a Referência Rápida</h1>
              <p>${escapeHtml(viewLoadError.message)}</p>
              <div><button type="button" class="btn btn-primary" data-action="retry-view-load">Tentar novamente</button></div>
            </div>
          </section>
        `;
      } else {
        if (!cheatsheetLoadStarted) {
          cheatsheetLoadStarted = true;
          void import('./ui/cheatsheetView')
            .then((mod) => {
              cheatsheetViewMod = mod;
              if (viewLoadError?.view === 'referencia') viewLoadError = null;
              if (state.view === 'referencia') renderApp();
            })
            .catch((err) => {
              cheatsheetLoadStarted = false;
              viewLoadError = {
                view: 'referencia',
                message: err instanceof Error ? err.message : 'Verifica a ligação à internet e tenta novamente.',
              };
              if (state.view === 'referencia') renderApp();
            });
        }
        mainContent = renderViewLoadingSkeleton('A carregar Referência Rápida…');
      }
    } else {
      mainContent = cheatsheetViewMod.renderCheatsheetHtml(state.refQuery, state.refCategory);
    }
  }

  root.innerHTML = `
    <div class="app-root">
      <a href="#conteudo-principal" class="skip-link">Saltar para o conteúdo principal</a>
      <header class="top-nav">
        <div class="top-nav-inner">
          <div class="brand-group">
            <a href="#vista=academia&trilha=python&licao=py-00-pensamento" class="brand-link" aria-label="Mercearia do Bairro, página inicial da academia" data-action="go-home">
              <span class="brand-wordmark"><span class="brand-icon">🛒</span> <span class="brand-name">Mercearia</span><span class="brand-full"> do Bairro</span></span>
              <span class="brand-context">Academia de Dados</span>
            </a>
          </div>

          <nav class="track-strip" aria-label="Trilhas e ferramentas">
            ${TRACK_INDEX
              .map((tr) => {
                const isActive = state.view === 'academia' && state.trackId === tr.id;
                return `
                  <button
                    type="button"
                    class="nav-tab ${isActive ? 'is-active' : ''}"
                    ${isActive ? 'aria-current="page"' : ''}
                    data-select-track="${escapeHtml(tr.id)}"
                  >
                    ${escapeHtml(tr.shortTitle)}
                  </button>
                `;
              })
              .join('')}
            <button
              type="button"
              class="nav-tab ${state.view === 'explorador' ? 'is-active' : ''}"
              ${state.view === 'explorador' ? 'aria-current="page"' : ''}
              data-select-view="explorador"
            >
              Explorador CSV
            </button>
            <button
              type="button"
              class="nav-tab ${state.view === 'cronograma' ? 'is-active' : ''}"
              ${state.view === 'cronograma' ? 'aria-current="page"' : ''}
              data-select-view="cronograma"
            >
              Cronograma
            </button>
            <button
              type="button"
              class="nav-tab ${state.view === 'referencia' ? 'is-active' : ''}"
              ${state.view === 'referencia' ? 'aria-current="page"' : ''}
              data-select-view="referencia"
            >
              Referência W3
            </button>
          </nav>

          <div class="nav-actions">
            <button
              type="button"
              class="btn nav-guide-btn"
              data-action="open-guide-modal"
              title="Como navegar pelas janelas (etapas, teoria e bancada de código)"
            >
              <span class="progress-full">? Guia</span>
              <span class="progress-compact">?</span>
            </button>
            <button
              type="button"
              class="btn nav-progress-btn"
              data-action="open-progress-modal"
              title="Ver progresso por trilha, código de retoma e exportar portefólio"
            >
              <span class="progress-full">${Object.keys(state.completedLessons).length} / ${TOTAL_LESSONS_COUNT} etapas · Progresso</span>
              <span class="progress-compact">🏆 ${Object.keys(state.completedLessons).length}/${TOTAL_LESSONS_COUNT}</span>
            </button>
            <div class="font-menu-wrap">
              <button
                type="button"
                class="btn nav-theme-btn nav-font-btn"
                data-action="toggle-font-menu"
                aria-haspopup="menu"
                aria-expanded="${state.showFontMenu}"
                aria-label="Tamanho do texto: ${escapeHtml((FONT_SIZE_OPTIONS.find((o) => o.id === state.fontSize) ?? NORMAL).label)}"
                title="Tamanho do texto"
              ><span aria-hidden="true">A<small>A</small></span></button>
              ${state.showFontMenu ? renderFontSizeMenu(state.fontSize) : ''}
            </div>
            <button
              type="button"
              class="btn nav-theme-btn"
              data-action="open-theme-modal"
              aria-label="Escolher estilo visual da academia"
              title="Escolher estilo visual (5 temas)"
            >
              <span class="theme-full">🎨 ${escapeHtml((THEME_OPTIONS.find((t) => t.id === state.theme) ?? THEME_OPTIONS[0]).label)}</span>
              <span class="theme-compact">🎨</span>
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo-principal" class="workspace-wrap" tabindex="-1">
        ${mainContent}
      </main>
      ${state.showProgressModal ? renderProgressModal(state) : ''}
      ${state.showThemeModal ? renderThemeModal(state) : ''}
      ${state.showDiagnosticModal ? renderDiagnosticModal(state) : ''}
      ${state.showGuideModal ? renderGuideModal() : ''}
      ${ecraAberto ? renderEcraDeEscritaAtual() : ''}
    </div>
  `;

  document.body.classList.toggle('tem-ecra-escrita', ecraAberto);
  const ecra = root.querySelector<HTMLElement>('.ecra-escrita');
  if (ecra) desligarAlturaVisivel = ligarAlturaVisivel(ecra);

  if (state.sidebarOpenMobile) {
    root.querySelector<HTMLElement>('.sidebar-panel .lesson-nav-btn.is-current')?.scrollIntoView({ block: 'nearest' });
  }

  attachDomListeners();

  if (nextModal !== 'none' && nextModal !== prevOpenModal) {
    const dialog = root.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    if (dialog) focusInitialDialogElement(dialog);
  } else if (nextModal !== 'none' && insideModalControlSelector) {
    const dialog = root.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    dialog?.querySelector<HTMLElement>(insideModalControlSelector)?.focus();
  } else if (prevOpenModal !== 'none' && nextModal === 'none') {
    restoreFocusFromSelectors([modalTriggerSelector, ...MODAL_FALLBACK_TRIGGERS[prevOpenModal]]);
    modalTriggerSelector = null;
  }
  prevOpenModal = nextModal;
}

const workbenchRunner = createWorkbenchRunner({
  state,
  currentTrackOrNull,
  currentLesson,
  activeEngine,
  getEditorValue,
  activePythonChallenge,
  activeSqlChallenge,
  activeGitChallenge,
  markLessonCompleted,
  savePracticeDone,
  renderApp,
  updateOutputInPlace: updateWorkbenchOutputInPlace,
});

const executeWorkbench = workbenchRunner.execute;

function attachDomListeners(): void {
  const answerInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.answer-field-input[data-answer-var]'));
  if (answerInputs.length > 0) {
    const syncAnswerInputs = (): void => {
      const vals: Record<string, string> = {};
      for (const inp of answerInputs) {
        if (inp.dataset.answerVar) vals[inp.dataset.answerVar] = inp.value;
      }
      state.editorDrafts[draftKey(currentLesson(), state.wbTab)] = buildAnswerSheetCode(currentLesson().id, vals);
      saveDrafts(state.editorDrafts);
      scheduleCloudSync();
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

  const editor = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
  const highlightPre = document.getElementById('workbench-highlight') as HTMLElement | null;
  const gutterEl = document.getElementById('workbench-gutter') as HTMLElement | null;

  const syncEditorOverlay = (): void => {
    if (!editor) return;
    const val = editor.value;
    state.editorDrafts[draftKey(currentLesson(), state.wbTab)] = val;
    saveDrafts(state.editorDrafts);
    scheduleCloudSync();
    if (highlightPre) {
      highlightPre.innerHTML = `<code>${highlightCode(val, activeEngine())}</code>`;
      highlightPre.scrollTop = editor.scrollTop;
      highlightPre.scrollLeft = editor.scrollLeft;
    }
    if (gutterEl) {
      gutterEl.innerHTML = renderLineNumbers(val);
      gutterEl.scrollTop = editor.scrollTop;
    }
  };

  if (editor) {
    let tabTrapActive = true;
    if (getUndoStack().length === 0) {
      getUndoStack().push({
        value: editor.value,
        start: editor.selectionStart ?? editor.value.length,
        end: editor.selectionEnd ?? editor.value.length,
      });
    }
    editor.addEventListener('input', () => {
      recordEditorInput(editor);
      syncEditorOverlay();
    });
    editor.addEventListener('blur', () => {
      tabTrapActive = true;
      if (pendingCloudRender) {
        pendingCloudRender = false;
        renderApp();
      }
    });
    editor.addEventListener('scroll', () => {
      if (highlightPre) {
        highlightPre.scrollTop = editor.scrollTop;
        highlightPre.scrollLeft = editor.scrollLeft;
      }
      if (gutterEl) {
        gutterEl.scrollTop = editor.scrollTop;
      }
    });
    editor.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (tabTrapActive) {
          tabTrapActive = false;
          ev.stopPropagation();
        }
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && ev.key.toLowerCase() === 'z') {
        if (undoEditor(editor)) ev.preventDefault();
      } else if ((ev.ctrlKey || ev.metaKey) && ((ev.shiftKey && ev.key.toLowerCase() === 'z') || ev.key.toLowerCase() === 'y')) {
        if (redoEditor(editor)) ev.preventDefault();
      } else if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        void executeWorkbench();
      } else if (ev.shiftKey && ev.altKey && (ev.key === 'F' || ev.key === 'f')) {
        ev.preventDefault();
        const formatted = formatCodePrettier(editor.value, activeEngine());
        applyEditorEdit(editor, formatted, formatted.length, formatted.length);
      } else if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
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
        if (nextIndent.length > 0) {
          ev.preventDefault();
          const insert = '\n' + nextIndent;
          applyEditorEdit(editor, val.slice(0, start) + insert + val.slice(end), start + insert.length, start + insert.length);
        }
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

  bindInsertButtons(document);

  document.querySelectorAll<HTMLElement>('[data-ecra-aba]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const aba = btn.dataset.ecraAba as AbaEscrita | undefined;
      if (aba) abrirEcraDeEscrita(aba);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-mobile-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mobileTab = btn.dataset.mobileTab === 'workbench' ? 'workbench' : 'lesson';
      renderApp();
      window.scrollTo({ top: 0 });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-select-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.selectTrack!;
      const tr = TRACK_INDEX.find((t) => t.id === tid);
      if (!tr) return;
      state.view = 'academia';
      state.trackId = tr.id;
      if (!tr.lessons.some((l) => l.id === state.lessonId)) {
        state.lessonId = tr.lessons[0].id;
      }
      state.mobileTab = 'lesson';
      state.sidebarOpenMobile = false;
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
      window.scrollTo({ top: 0 });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-select-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.selectView as ViewMode;
      renderApp();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-gantt-pace]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mins = Number(btn.dataset.ganttPace);
      if (Number.isFinite(mins) && mins > 0) {
        state.ganttPaceMinutes = mins;
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-gantt-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.ganttFilter as GanttFilterStatus;
      if (f === 'all' || f === 'todo' || f === 'done') {
        state.ganttFilterStatus = f;
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-gantt-toggle-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.ganttToggleTrack;
      if (!tid) return;
      if (state.ganttCollapsedTracks.has(tid)) state.ganttCollapsedTracks.delete(tid);
      else state.ganttCollapsedTracks.add(tid);
      renderApp();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-gantt-jump-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.ganttJumpTrack;
      const lid = btn.dataset.ganttJumpLesson;
      const loc = locateLesson(tid ?? null, lid ?? null);
      if (!loc) return;
      state.trackId = loc.trackId;
      state.lessonId = loc.lessonId;
      state.view = 'academia';
      state.mobileTab = 'lesson';
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
      window.scrollTo({ top: 0 });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-diag-bg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bg = btn.dataset.diagBg as BackgroundLevel;
      if (bg === 'zero' || bg === 'negocio' || bg === 'tech') {
        state.diagnosticDraft = { ...state.diagnosticDraft, background: bg };
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-diag-hours]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hrs = Number(btn.dataset.diagHours);
      if (Number.isFinite(hrs) && hrs > 0) {
        state.diagnosticDraft = { ...state.diagnosticDraft, hoursPerWeek: hrs };
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-diag-months]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = Number(btn.dataset.diagMonths);
      if (Number.isFinite(m) && m > 0) {
        state.diagnosticDraft = { ...state.diagnosticDraft, targetMonths: m };
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-select-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lid = btn.dataset.selectLesson;
      if (!lid) return;
      const loc = locateLesson(null, lid);
      if (loc) {
        state.trackId = loc.trackId;
        state.lessonId = loc.lessonId;
      } else {
        state.lessonId = lid;
      }
      state.mobileTab = 'lesson';
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.sidebarOpenMobile = false;
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
      window.scrollTo({ top: 0 });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-practice-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.practiceIdx = Number(btn.dataset.practiceIdx) || 0;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
    });
  });

  document.querySelectorAll<HTMLElement>('[data-wb-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.wbTab = btn.dataset.wbTab as WorkbenchTab;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      renderApp();
    });
  });

  document.querySelectorAll<HTMLInputElement>('input[data-quiz-idx]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const lesson = currentLesson();
      const idx = Number(inp.dataset.quizIdx);
      const key = inp.dataset.quizKey ?? lesson.id;
      state.quizSelection[key] = idx;
      saveQuizzes(state.quizSelection);
      if (key === lesson.id && state.completedLessons[lesson.id] && idx === lesson.quiz.correctIndex) {
        state.completedLessons[lesson.id].quizPassed = true;
        saveProgress(state.completedLessons);
      }
      scheduleCloudSync();
      renderApp();
    });
  });

  // Etapas de projeto: as marcas da lista vão para practiceDone (chaves "etapa#lista:n").
  document.querySelectorAll<HTMLInputElement>('input[data-lista-item]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const lesson = currentLesson();
      const n = Number(inp.dataset.listaItem);
      const chave = chaveLista(lesson.id, n);
      if (inp.checked) state.practiceDone.add(chave);
      else state.practiceDone.delete(chave);
      savePracticeDone(); // grava e agenda a sincronização com a nuvem
      // A caixa já mostra o estado certo; só se redesenha quando a etapa acaba de ficar concluída.
      if (concluirEtapaProjeto(lesson)) {
        renderApp();
        document.querySelector<HTMLInputElement>(`input[data-lista-item="${n}"]`)?.focus();
      }
    });
  });

  const linkInput = document.querySelector<HTMLInputElement>('input[data-link-github]');
  if (linkInput) {
    linkInput.addEventListener('input', () => {
      const lesson = currentLesson();
      state.editorDrafts[chaveLinkProjeto(lesson)] = linkInput.value;
      saveDrafts(state.editorDrafts);
      scheduleCloudSync();
      // Atualiza só a mensagem: o campo não é redesenhado e não perde o foco.
      const msg = document.querySelector<HTMLElement>('[data-link-msg]');
      if (msg) {
        const { texto, classe } = mensagemLink(linkInput.value);
        msg.textContent = texto;
        msg.className = `projeto-link-msg ${classe}`;
      }
      if (concluirEtapaProjeto(lesson)) {
        // A conclusão grava já; o rascunho do link também, para não o perder se o separador fechar.
        saveDrafts(state.editorDrafts, true);
        // Redesenha uma vez (chip, índice, progresso) e devolve o foco e o cursor ao campo.
        const { selectionStart, selectionEnd } = linkInput;
        renderApp();
        const novo = document.querySelector<HTMLInputElement>('input[data-link-github]');
        if (novo) {
          novo.focus();
          novo.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    });
  }

  document.querySelectorAll<HTMLElement>('[data-try-ref]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const refIdx = Number(btn.dataset.tryRef);
      void (async () => {
        const cheatsheets = await loadCheatsheetsAsync();
        const entry = cheatsheets[refIdx];
        if (!entry || !entry.tryEngine || !entry.trySnippet) return;
        const targetTrackId =
          entry.tryEngine === 'sql'
            ? 'sql'
            : entry.tryEngine === 'git'
              ? 'git'
              : entry.category === 'Pandas'
                ? 'pandas'
                : 'python';
        const targetTrack = await ensureTrackLoaded(targetTrackId);
        state.view = 'academia';
        state.trackId = targetTrack.id;
        state.lessonId = targetTrack.lessons[0].id;
        state.wbTab = 'example';
        state.mobileTab = 'workbench';
        state.editorDrafts[draftKey(targetTrack.lessons[0], 'example')] = entry.trySnippet;
        saveDrafts(state.editorDrafts, true);
        state.output = { kind: 'empty' };
        renderApp();
        window.scrollTo({ top: 0 });
        void executeWorkbench();
      })();
    });
  });

  const serieSelect = document.querySelector<HTMLSelectElement>('select[data-filter="serie"]');
  if (serieSelect) {
    serieSelect.addEventListener('change', () => {
      state.explorerSerie = serieSelect.value === 'base' ? 'base' : 'sazonal';
      renderApp();
    });
  }

  const citySelect = document.querySelector<HTMLSelectElement>('select[data-filter="cidade"]');
  if (citySelect) {
    citySelect.addEventListener('change', () => {
      state.explorerCidade = citySelect.value;
      renderApp();
    });
  }

  const catSelect = document.querySelector<HTMLSelectElement>('select[data-filter="categoria"]');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      state.explorerCategoria = catSelect.value;
      renderApp();
    });
  }

  const refSearch = document.getElementById('ref-search') as HTMLInputElement | null;
  if (refSearch) {
    refSearch.addEventListener('input', () => {
      const pos = refSearch.selectionStart ?? refSearch.value.length;
      state.refQuery = refSearch.value;
      renderApp();
      const nextInput = document.getElementById('ref-search') as HTMLInputElement | null;
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(pos, pos);
      }
    });
  }

  const refCat = document.getElementById('ref-cat') as HTMLSelectElement | null;
  if (refCat) {
    refCat.addEventListener('change', () => {
      state.refCategory = refCat.value;
      renderApp();
    });
  }

  document.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      const act = el.dataset.action;
      if (act === 'go-home') {
        ev.preventDefault();
        state.view = 'academia';
        state.trackId = TRACK_INDEX[0].id;
        state.lessonId = TRACK_INDEX[0].lessons[0].id;
        state.wbTab = 'challenge';
        renderApp();
      } else if (act === 'toggle-font-menu') {
        state.showFontMenu = !state.showFontMenu;
        renderApp();
        if (state.showFontMenu) document.querySelector<HTMLElement>('.font-menu-item[aria-checked="true"]')?.focus();
      } else if (act === 'select-font-size') {
        const id = el.dataset.fontSize as FontSizeId | undefined;
        if (id && FONT_SIZE_OPTIONS.some((o) => o.id === id)) {
          state.fontSize = id;
          saveFontSize(id);
          applyFontSize(id);
        }
        state.showFontMenu = false;
        renderApp();
        document.querySelector<HTMLElement>('.nav-font-btn')?.focus();
      } else if (act === 'open-theme-modal') {
        state.showFontMenu = false;
        state.showThemeModal = true;
        renderApp();
      } else if (act === 'close-theme-modal') {
        state.showThemeModal = false;
        renderApp();
      } else if (act === 'close-theme-backdrop') {
        if (ev.target === el) {
          state.showThemeModal = false;
          renderApp();
        }
      } else if (act === 'select-theme') {
        const nextTheme = el.dataset.themeId as ThemeId | undefined;
        if (nextTheme && THEME_OPTIONS.some((t) => t.id === nextTheme)) {
          state.theme = nextTheme;
          applyTheme(state.theme);
          state.showThemeModal = false;
          renderApp();
        }
      } else if (act === 'toggle-theme') {
        const idx = THEME_OPTIONS.findIndex((t) => t.id === state.theme);
        state.theme = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length].id;
        applyTheme(state.theme);
        renderApp();
      } else if (act === 'toggle-mobile-sidebar') {
        state.sidebarOpenMobile = !state.sidebarOpenMobile;
        renderApp();
      } else if (act === 'toggle-desktop-sidebar') {
        state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
        saveLayoutPrefs(state.layout);
        renderApp();
      } else if (act === 'reset-layout') {
        state.layout = { ...DEFAULT_LAYOUT };
        saveLayoutPrefs(state.layout);
        renderApp();
      } else if (act === 'switch-to-workbench') {
        state.mobileTab = 'workbench';
        renderApp();
        window.scrollTo({ top: 0 });
      } else if (act === 'switch-to-lesson') {
        state.mobileTab = 'lesson';
        renderApp();
        window.scrollTo({ top: 0 });
      } else if (act === 'load-example-tab') {
        state.wbTab = 'example';
        state.mobileTab = 'workbench';
        state.editorDrafts[draftKey(currentLesson(), 'example')] = currentLesson().exampleCode;
        saveDrafts(state.editorDrafts, true);
        renderApp();
        window.scrollTo({ top: 0 });
        void executeWorkbench();
      } else if (act === 'run-code') {
        void executeWorkbench();
      } else if (act === 'stop-code') {
        const stopped = workbenchRunner.cancelExecution();
        if (!stopped) {
          state.output = { kind: 'error', errorText: 'Execução interrompida pelo utilizador.' };
          updateWorkbenchOutputInPlace();
        }
      } else if (act === 'abrir-ecra-escrita' || act === 'editar-codigo-ecra') {
        abrirEcraDeEscrita('codigo');
      } else if (act === 'fechar-ecra-escrita') {
        fecharEcraDeEscrita();
      } else if (act === 'editar-codigo-ecra') {
        abrirEcraDeEscrita('codigo');
      } else if (act === 'next-lesson-from-ecra') {
        const track = currentTrackOrNull();
        if (track) {
          const lesson = currentLesson();
          const idx = track.lessons.findIndex((l) => l.id === lesson.id);
          const trIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
          const next =
            idx < track.lessons.length - 1
              ? { trackId: track.id, lessonId: track.lessons[idx + 1].id }
              : trIdx >= 0 && trIdx < TRACK_INDEX.length - 1
                ? { trackId: TRACK_INDEX[trIdx + 1].id, lessonId: TRACK_INDEX[trIdx + 1].lessons[0].id }
                : null;
          if (next) {
            state.trackId = next.trackId;
            state.lessonId = next.lessonId;
            state.mobileTab = 'lesson';
            state.wbTab = 'challenge';
            state.practiceIdx = 0;
            state.output = { kind: 'empty' };
            state.confirmSolutionLessonId = null;
            state.hintLevel = 0;
            fecharEcraDeEscrita();
            window.scrollTo({ top: 0 });
          }
        }
      } else if (act === 'usar-editor-normal') {
        savePreferirEditorNormal(true);
        fecharEcraDeEscrita();
      } else if (act === 'usar-ecra-escrita') {
        savePreferirEditorNormal(false);
        renderApp();
      } else if (act === 'executar-ecra-escrita') {
        (document.activeElement as HTMLElement | null)?.blur();
        abrirEcraDeEscrita('resultado');
        void executeWorkbench();
      } else if (act === 'editor-undo') {
        const ed = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
        if (ed) {
          undoEditor(ed);
          ed.focus({ preventScroll: true });
        }
      } else if (act === 'editor-redo') {
        const ed = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
        if (ed) {
          redoEditor(ed);
          ed.focus({ preventScroll: true });
        }
      } else if (act === 'copy-code') {
        const cur = getEditorValue();
        void navigator.clipboard?.writeText(cur).catch(() => {});
      } else if (act === 'next-lesson-from-ecra') {
        const track = currentTrackOrNull();
        if (track) {
          const lesson = currentLesson();
          const idx = track.lessons.findIndex((l) => l.id === lesson.id);
          const trIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
          const next =
            idx < track.lessons.length - 1
              ? { trackId: track.id, lessonId: track.lessons[idx + 1].id }
              : trIdx >= 0 && trIdx < TRACK_INDEX.length - 1
                ? { trackId: TRACK_INDEX[trIdx + 1].id, lessonId: TRACK_INDEX[trIdx + 1].lessons[0].id }
                : null;
          if (next) {
            state.trackId = next.trackId;
            state.lessonId = next.lessonId;
            state.mobileTab = 'lesson';
            state.wbTab = 'challenge';
            state.practiceIdx = 0;
            state.output = { kind: 'empty' };
            state.confirmSolutionLessonId = null;
            state.hintLevel = 0;
            fecharEcraDeEscrita();
            window.scrollTo({ top: 0 });
          }
        }
      } else if (act === 'close-mobile-sidebar') {
        state.sidebarOpenMobile = false;
        renderApp();
        document.querySelector<HTMLElement>('.mobile-index-toggle')?.focus({ preventScroll: true });
      } else if (act === 'retry-track-load') {
        trackLoadError = null;
        renderApp();
      } else if (act === 'retry-view-load') {
        viewLoadError = null;
        renderApp();
      } else if (act === 'format-code') {
        const cur = getEditorValue();
        state.editorDrafts[draftKey(currentLesson(), state.wbTab)] = formatCodePrettier(cur, activeEngine());
        saveDrafts(state.editorDrafts, true);
        renderApp();
      } else if (act === 'reset-code') {
        delete state.editorDrafts[draftKey(currentLesson(), state.wbTab)];
        saveDrafts(state.editorDrafts, true);
        if (currentLesson().engine === 'git') {
          state.gitState = createInitialGitState();
        }
        state.output = { kind: 'empty' };
        state.confirmSolutionLessonId = null;
        state.hintLevel = 0;
        renderApp();
      } else if (act === 'next-hint') {
        state.hintLevel = Math.min(2, state.hintLevel + 1);
        renderApp();
      } else if (act === 'ask-solution') {
        state.confirmSolutionLessonId = currentLesson().id;
        renderApp();
      } else if (act === 'cancel-solution') {
        state.confirmSolutionLessonId = null;
        renderApp();
      } else if (act === 'apply-solution') {
        const l = currentLesson();
        const sol =
          activePythonChallenge(l)?.solutionCode ??
          activeSqlChallenge(l)?.solutionSql ??
          activeGitChallenge(l)?.solutionCommands ??
          l.exampleCode;
        state.editorDrafts[draftKey(l, 'challenge')] = sol;
        saveDrafts(state.editorDrafts, true);
        if (state.practiceIdx === 0) state.helpedInSession.add(l.id);
        state.confirmSolutionLessonId = null;
        renderApp();
      } else if (act === 'open-progress-modal') {
        state.showProgressModal = true;
        state.progressModalFeedback = null;
        state.confirmClearProgress = false;
        renderApp();
      } else if (act === 'close-progress-modal') {
        state.showProgressModal = false;
        renderApp();
      } else if (act === 'close-progress-backdrop') {
        if (ev.target === el) {
          state.showProgressModal = false;
          renderApp();
        }
      } else if (act === 'generate-progress-code') {
        void (async () => {
          try {
            const code = await encodeProgressCode(
              state.completedLessons,
              state.editorDrafts,
              state.quizSelection,
              {
                trackId: state.trackId,
                lessonId: state.lessonId,
                view: state.view,
                timestamp: new Date().toISOString(),
              },
              [...state.practiceDone],
              state.lessonTimes,
              state.diagnostic,
            );
            state.generatedProgressCode = code;
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(code);
              state.progressModalFeedback = {
                ok: true,
                text: 'Código gerado e copiado para a área de transferência!',
              };
            } else {
              state.progressModalFeedback = {
                ok: true,
                text: 'Código gerado! Copia o texto abaixo para continuar noutro dispositivo.',
              };
            }
          } catch (err) {
            state.progressModalFeedback = {
              ok: false,
              text: err instanceof Error ? err.message : 'Não foi possível gerar o código.',
            };
          }
          renderApp();
        })();
      } else if (act === 'activate-cloud-sync') {
        state.syncStatus = 'syncing';
        state.progressModalFeedback = { ok: true, text: 'A criar código de sincronização na cloud…' };
        renderApp();
        void (async () => {
          try {
            const res = await pushCloudSync(buildCloudSyncPayload());
            state.syncCode = res.code;
            state.syncStatus = 'synced';
            state.syncLastUpdatedAt = res.updatedAt;
            const shareUrl = buildSyncShareUrl(res.code);
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(shareUrl);
              state.progressModalFeedback = {
                ok: true,
                text: `Código ${res.code} ativado! Link de retoma copiado para a área de transferência.`,
              };
            } else {
              state.progressModalFeedback = {
                ok: true,
                text: `Código ${res.code} ativado! Guarda este código para retomar noutro dispositivo.`,
              };
            }
          } catch (err) {
            state.syncStatus = 'error';
            state.progressModalFeedback = {
              ok: false,
              text: err instanceof Error ? err.message : 'Erro ao ativar sincronização na cloud.',
            };
          }
          renderApp();
        })();
      } else if (act === 'copy-sync-link') {
        if (!state.syncCode) return;
        const shareUrl = buildSyncShareUrl(state.syncCode);
        void (async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(shareUrl);
              state.progressModalFeedback = {
                ok: true,
                text: `Link de retoma (${state.syncCode}) copiado! Abre-o no telemóvel ou PC.`,
              };
            } else {
              state.progressModalFeedback = {
                ok: true,
                text: `Usa o código ${state.syncCode} ou o URL: ${shareUrl}`,
              };
            }
          } catch {
            state.progressModalFeedback = {
              ok: true,
              text: `Código ativo: ${state.syncCode}`,
            };
          }
          renderApp();
        })();
      } else if (act === 'sync-now') {
        if (!state.syncCode) return;
        state.syncStatus = 'syncing';
        renderApp();
        void (async () => {
          try {
            const res = await pushCloudSync(buildCloudSyncPayload(state.syncCode));
            state.syncStatus = 'synced';
            state.syncLastUpdatedAt = res.updatedAt;
            state.progressModalFeedback = {
              ok: true,
              text: `Sincronizado com sucesso (${res.code}).`,
            };
          } catch (err) {
            state.syncStatus = 'error';
            state.progressModalFeedback = {
              ok: false,
              text: err instanceof Error ? err.message : 'Falha ao sincronizar com a cloud.',
            };
          }
          renderApp();
        })();
      } else if (act === 'disconnect-cloud-sync') {
        state.syncCode = null;
        state.syncStatus = 'idle';
        saveSyncCode(null);
        state.progressModalFeedback = {
          ok: true,
          text: 'Sincronização na cloud desligada neste dispositivo (o progresso local mantém-se).',
        };
        renderApp();
      } else if (act === 'apply-progress-code') {
        const raw = state.progressCodeInput.trim();
        if (!raw) {
          state.progressModalFeedback = {
            ok: false,
            text: 'Cola primeiro um código MB-XXXX-XXXX-XXXX, link ?sync=… ou código MB1-….',
          };
          renderApp();
          return;
        }
        const cloudCode = extractSyncCode(raw);
        if (cloudCode) {
          state.syncStatus = 'syncing';
          state.progressModalFeedback = { ok: true, text: `A ligar ao código ${cloudCode}…` };
          renderApp();
          void (async () => {
            try {
              const remote = await pullCloudSync(cloudCode);
              applyRemoteCloudSync(remote);
              if (remote.lastLocation) {
                const loc = locateLesson(remote.lastLocation!.trackId, remote.lastLocation!.lessonId);
                if (loc) {
                  state.trackId = loc.trackId;
                  state.lessonId = loc.lessonId;
                }
                state.view = remote.lastLocation.view;
                saveLastLocation(remote.lastLocation);
              }
              state.progressCodeInput = '';
              state.progressModalFeedback = {
                ok: true,
                text: `Dispositivo ligado ao código ${remote.code}! Progresso sincronizado.`,
              };
            } catch (err) {
              state.syncStatus = 'error';
              state.progressModalFeedback = {
                ok: false,
                text: err instanceof Error ? err.message : 'Código não encontrado na cloud.',
              };
            }
            renderApp();
          })();
          return;
        }
        void (async () => {
          try {
            const restored = await decodeProgressCode(raw);
            state.completedLessons = restored.progress;
            state.editorDrafts = restored.drafts;
            state.quizSelection = restored.quizzes;
            state.practiceDone = new Set(restored.practice);
            if (Object.keys(restored.timeSpent).length) {
              state.lessonTimes = restored.timeSpent;
            }
            if (restored.diagnostic) {
              state.diagnostic = restored.diagnostic;
              state.diagnosticDraft = restored.diagnostic;
              state.ganttPaceMinutes = restored.diagnostic.hoursPerWeek * 60;
            }
            if (restored.lastLocation) {
              const loc = locateLesson(restored.lastLocation!.trackId, restored.lastLocation!.lessonId);
              if (loc) {
                state.trackId = loc.trackId;
                state.lessonId = loc.lessonId;
              }
              state.view = restored.lastLocation.view;
            }
            state.progressCodeInput = '';
            state.progressModalFeedback = {
              ok: true,
              text: `Progresso restaurado! (${Object.keys(restored.progress).length} etapas concluídas).`,
            };
          } catch (err) {
            state.progressModalFeedback = {
              ok: false,
              text: err instanceof Error ? err.message : 'Código inválido.',
            };
          }
          renderApp();
        })();
      } else if (act === 'export-portfolio-md') {
        state.progressModalFeedback = { ok: true, text: 'A preparar portefólio completo…' };
        renderApp();
        void (async () => {
          try {
            const tracks = await loadAllTracksAsync();
            const md = generatePortfolioMarkdown(state.completedLessons, state.editorDrafts, tracks);
            downloadTextFile('portfolio_mercearia_do_bairro.md', md, 'text/markdown;charset=utf-8');
            state.progressModalFeedback = { ok: true, text: 'Portefólio (.md) descarregado com sucesso.' };
          } catch (err) {
            state.progressModalFeedback = {
              ok: false,
              text: err instanceof Error ? err.message : 'Erro ao exportar portefólio.',
            };
          }
          renderApp();
        })();
      } else if (act === 'export-progress-json') {
        saveLessonTimes(state.lessonTimes);
        const json = exportProgressJson(
          state.completedLessons,
          state.editorDrafts,
          state.quizSelection,
          [...state.practiceDone],
          state.lessonTimes,
          state.diagnostic,
        );
        downloadTextFile('mercearia_progresso_backup.json', json, 'application/json;charset=utf-8');
        state.progressModalFeedback = { ok: true, text: 'Backup (.json) descarregado com sucesso.' };
        renderApp();
      } else if (act === 'trigger-import-json') {
        document.getElementById('import-progress-file')?.click();
      } else if (act === 'ask-clear-progress') {
        state.confirmClearProgress = true;
        renderApp();
      } else if (act === 'cancel-clear-progress') {
        state.confirmClearProgress = false;
        renderApp();
      } else if (act === 'confirm-clear-progress') {
        clearAllUserProgress();
        clearSavedDiagnostic();
        state.completedLessons = {};
        state.editorDrafts = {};
        state.quizSelection = {};
        state.practiceDone = new Set();
        state.lessonTimes = {};
        state.diagnostic = null;
        state.helpedInSession.clear();
        state.generatedProgressCode = '';
        state.confirmClearProgress = false;
        state.progressModalFeedback = { ok: true, text: 'Progresso local limpo.' };
        renderApp();
      } else if (act === 'reset-explorer-filters') {
        state.explorerCidade = 'todas';
        state.explorerCategoria = 'todas';
        renderApp();
      } else if (act === 'clear-ref-search') {
        state.refQuery = '';
        state.refCategory = 'Todas';
        renderApp();
      } else if (act === 'retry-dataset') {
        state.datasetError = null;
        renderApp();
        void bootstrapData();
      } else if (act === 'open-gantt-view') {
        saveLessonTimes(state.lessonTimes);
        state.showProgressModal = false;
        state.showGuideModal = false;
        state.view = 'cronograma';
        renderApp();
      } else if (act === 'open-guide-modal') {
        state.showProgressModal = false;
        state.showDiagnosticModal = false;
        state.showGuideModal = true;
        renderApp();
      } else if (act === 'close-guide-modal') {
        state.showGuideModal = false;
        renderApp();
      } else if (act === 'close-guide-backdrop') {
        if (ev.target === el) {
          state.showGuideModal = false;
          renderApp();
        }
      } else if (act === 'toggle-lesson-timer') {
        state.timerPaused = !state.timerPaused;
        saveLessonTimes(state.lessonTimes);
        scheduleCloudSync();
        renderApp();
      } else if (act === 'gantt-expand-all') {
        state.ganttCollapsedTracks.clear();
        renderApp();
      } else if (act === 'gantt-collapse-all') {
        state.ganttCollapsedTracks = new Set(TRACK_INDEX.map((t) => t.id));
        renderApp();
      } else if (act === 'open-diagnostic-modal') {
        state.showProgressModal = false;
        state.showGuideModal = false;
        state.diagnosticDraft = state.diagnostic ?? state.diagnosticDraft;
        state.showDiagnosticModal = true;
        renderApp();
      } else if (act === 'close-diagnostic-modal') {
        state.showDiagnosticModal = false;
        renderApp();
      } else if (act === 'close-diagnostic-backdrop') {
        if (ev.target === el) {
          state.showDiagnosticModal = false;
          renderApp();
        }
      } else if (act === 'toggle-placement-quiz') {
        state.showPlacementQuiz = !state.showPlacementQuiz;
        renderApp();
      } else if (act === 'apply-placement-result') {
        const res = evaluatePlacementAnswers(state.placementAnswers);
        const saved = {
          ...state.diagnosticDraft,
          background: res.suggestedBackground,
          updatedAt: new Date().toISOString(),
        };
        state.diagnosticDraft = saved;
        state.diagnostic = saved;
        saveDiagnostic(saved);
        scheduleCloudSync();
        state.ganttPaceMinutes = saved.hoursPerWeek * 60;
        state.showDiagnosticModal = false;
        const loc = locateLesson(res.suggestedTrackId, res.suggestedLessonId);
        if (loc) {
          state.trackId = loc.trackId;
          state.lessonId = loc.lessonId;
        }
        state.view = 'academia';
        state.wbTab = 'challenge';
        state.practiceIdx = 0;
        state.output = { kind: 'empty' };
        renderApp();
      } else if (act === 'apply-diagnostic-only' || act === 'apply-diagnostic-and-go') {
        const saved = { ...state.diagnosticDraft, updatedAt: new Date().toISOString() };
        state.diagnostic = saved;
        saveDiagnostic(saved);
        scheduleCloudSync();
        state.ganttPaceMinutes = saved.hoursPerWeek * 60;
        state.showDiagnosticModal = false;
        if (act === 'apply-diagnostic-and-go') {
          const plan = evaluateDiagnosticPlan(saved, getCourseMinutes(TRACK_INDEX));
          const loc = locateLesson(plan.startTrackId, plan.startLessonId);
          if (loc) {
            state.trackId = loc.trackId;
            state.lessonId = loc.lessonId;
          }
          state.view = 'academia';
          state.wbTab = 'challenge';
          state.practiceIdx = 0;
          state.output = { kind: 'empty' };
        }
        renderApp();
      }
    });
  });

  const codeInput = document.getElementById('progress-code-input') as HTMLInputElement | null;
  if (codeInput) {
    codeInput.addEventListener('input', () => {
      state.progressCodeInput = codeInput.value;
    });
  }

  const importFile = document.getElementById('import-progress-file') as HTMLInputElement | null;
  if (importFile) {
    importFile.addEventListener('change', () => {
      const file = importFile.files?.[0];
      if (!file) return;
      void (async () => {
        try {
          const text = await file.text();
          const imported = importProgressJson(text);
          state.completedLessons = imported.progress;
          state.editorDrafts = imported.drafts;
          state.quizSelection = imported.quizzes;
          state.practiceDone = new Set(imported.practice);
          state.lessonTimes = imported.timeSpent;
          if (imported.diagnostic) {
            state.diagnostic = imported.diagnostic;
            state.diagnosticDraft = imported.diagnostic;
            state.ganttPaceMinutes = imported.diagnostic.hoursPerWeek * 60;
            saveDiagnostic(imported.diagnostic);
          }
          saveLessonTimes(state.lessonTimes);
          state.progressModalFeedback = {
            ok: true,
            text: `Backup importado! (${Object.keys(imported.progress).length} etapas concluídas).`,
          };
        } catch (err) {
          state.progressModalFeedback = {
            ok: false,
            text: err instanceof Error ? err.message : 'Erro ao importar ficheiro JSON.',
          };
        }
        renderApp();
      })();
    });
  }
  document.querySelectorAll<HTMLElement>('[data-placement-q][data-placement-opt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.placementQ;
      const opt = Number(btn.dataset.placementOpt);
      if (qId && Number.isInteger(opt)) {
        state.placementAnswers[qId] = opt;
        const res = evaluatePlacementAnswers(state.placementAnswers);
        if (res.complete) {
          state.diagnosticDraft = { ...state.diagnosticDraft, background: res.suggestedBackground };
        }
        renderApp();
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-review-go-track][data-review-go-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const trId = btn.dataset.reviewGoTrack;
      const leId = btn.dataset.reviewGoLesson;
      const loc = locateLesson(trId, leId);
      if (loc) {
        saveLessonTimes(state.lessonTimes);
        state.trackId = loc.trackId;
        state.lessonId = loc.lessonId;
        state.view = 'academia';
        state.mobileTab = 'lesson';
        state.wbTab = 'challenge';
        state.practiceIdx = 0;
        state.output = { kind: 'empty' };
        state.showProgressModal = false;
        renderApp();
        window.scrollTo({ top: 0 });
      }
    });
  });

  document.querySelectorAll<HTMLElement>('[data-review-done]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const leId = btn.dataset.reviewDone;
      if (!leId || !state.completedLessons[leId]) return;
      state.completedLessons[leId] = markLessonReviewedRecord(state.completedLessons[leId]);
      saveProgress(state.completedLessons);
      scheduleCloudSync();
      renderApp();
    });
  });

  document.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((tablist) => {
    tablist.addEventListener('keydown', (ev) => {
      handleTablistArrowKeys(tablist, ev);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-layout-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.layoutPreset;
      if (preset === 'reading') {
        state.layout.lessonRatio = 62;
      } else if (preset === 'coding') {
        state.layout.lessonRatio = 36;
      } else {
        state.layout.lessonRatio = 48;
      }
      saveLayoutPrefs(state.layout);
      renderApp();
    });
  });

  attachSplitterListeners(state, renderApp);
}

async function bootstrapData(): Promise<void> {
  try {
    state.dataset = await loadMerceariaDataset();
    state.datasetError = null;
    if (state.view === 'explorador') renderApp();
  } catch (err) {
    state.datasetError = err instanceof Error ? err.message : String(err);
    if (state.view === 'explorador') renderApp();
  }
}

window.addEventListener('hashchange', () => {
  syncStateFromUrl();
  renderApp();
});

// O menu do tamanho do texto fecha com um clique fora dele ou com Escape.
document.addEventListener('click', (ev) => {
  if (state.showFontMenu && !(ev.target as HTMLElement | null)?.closest('.font-menu-wrap')) {
    state.showFontMenu = false;
    renderApp();
  }
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && state.showFontMenu) {
    state.showFontMenu = false;
    renderApp();
    document.querySelector<HTMLElement>('.nav-font-btn')?.focus();
    return;
  }
  const anyModalOpen =
    state.showProgressModal || state.showThemeModal || state.showDiagnosticModal || state.showGuideModal;
  if (ev.key === 'Tab' && anyModalOpen) {
    const dialog = document.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    if (dialog) handleDialogTabTrap(dialog, ev);
    return;
  }
  if (ev.key === 'Tab' && state.mobileEditor !== null && !anyModalOpen) {
    const mobileDialog = document.querySelector<HTMLElement>('.ecra-escrita[role="dialog"]');
    if (mobileDialog && ev.target !== document.getElementById('workbench-editor')) {
      handleDialogTabTrap(mobileDialog, ev);
    }
    return;
  }
  if (ev.key === 'Escape' && state.mobileEditor !== null && !anyModalOpen) {
    fecharEcraDeEscrita();
    return;
  }
  if (ev.key === 'Escape' && state.sidebarOpenMobile && !anyModalOpen) {
    state.sidebarOpenMobile = false;
    renderApp();
    document.querySelector<HTMLElement>('.mobile-index-toggle')?.focus({ preventScroll: true });
    return;
  }
  if (ev.key === 'Escape' && anyModalOpen) {
    state.showProgressModal = false;
    state.showThemeModal = false;
    state.showDiagnosticModal = false;
    state.showGuideModal = false;
    renderApp();
  }
});

syncStateFromUrl();
renderApp();
void cloudSync.bootstrap();
cloudSync.attachCrossTabStorageSync();
startStudyTimer(state);

window.addEventListener('pagehide', () => saveDrafts(state.editorDrafts, true));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveDrafts(state.editorDrafts, true);
});

const isProdBuild = Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD);
if (isProdBuild && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
