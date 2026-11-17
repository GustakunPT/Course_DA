import './styles/app.css';
import { allTracks, cheatsheets, totalLessonsCount } from './data/curriculum';
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
import { getCourseMinutes } from './data/studyPlan';
import type { EngineKind, GitChallengeSpec, Lesson, PythonChallengeSpec, SqlChallengeSpec, Track } from './data/types';
import { loadMerceariaDataset } from './engines/csvEngine';
import { runSqlQuery } from './engines/sqlEngine';
import { runPythonCode } from './engines/pythonEngine';
import { createInitialGitState, runGitSimulator } from './engines/gitEngine';
import { renderExplorerHtml } from './ui/explorerView';
import { renderCheatsheetHtml } from './ui/cheatsheetView';
import { renderGanttHtml, type GanttFilterStatus } from './ui/ganttView';
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
  mergeProgressRecords,
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
import { downloadTextFile, escapeHtml } from './ui/html';
import { quizDisplayOrder } from './ui/quizOrder';
import { DEFAULT_LAYOUT, loadSavedLayout, saveLayoutPrefs } from './ui/layout';
import { renderDiagnosticModal, renderProgressModal, renderThemeModal } from './ui/modals';
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
  trackId: allTracks[0].id,
  lessonId: allTracks[0].lessons[0].id,
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
  diagnostic: savedDiagnostic,
  diagnosticDraft: savedDiagnostic ?? {
    background: 'zero',
    hoursPerWeek: 6,
    targetMonths: 6,
    updatedAt: '',
  },
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

function currentTrack(): Track {
  return allTracks.find((t) => t.id === state.trackId) ?? allTracks[0];
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
  return currentLesson().engine;
}

/**
 * Encontra a trilha certa para uma etapa. Se a etapa mudou de trilha (ex.: quando a trilha 5
 * foi dividida), segue a etapa; se não existir, abre a primeira etapa da trilha pedida.
 */
function locateLesson(trackId: string | null | undefined, lessonId: string | null | undefined): { trackId: string; lessonId: string } | null {
  const pedida = allTracks.find((t) => t.id === trackId);
  if (lessonId) {
    const dona = pedida?.lessons.some((l) => l.id === lessonId) ? pedida : allTracks.find((t) => t.lessons.some((l) => l.id === lessonId));
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
    history.replaceState(null, '', nextHash);
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

let cloudSyncTimer: number | undefined;
function scheduleCloudSync(): void {
  if (!state.syncCode) return;
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  state.syncStatus = 'syncing';
  cloudSyncTimer = window.setTimeout(() => {
    if (!state.syncCode) return;
    void pushCloudSync({
      code: state.syncCode,
      progress: state.completedLessons,
      drafts: state.editorDrafts,
      quizzes: state.quizSelection,
      practice: [...state.practiceDone],
      lastLocation: {
        trackId: state.trackId,
        lessonId: state.lessonId,
        view: state.view,
        timestamp: new Date().toISOString(),
      },
    })
      .then((res) => {
        state.syncStatus = 'synced';
        state.syncLastUpdatedAt = res.updatedAt;
        if (state.showProgressModal) renderApp();
      })
      .catch(() => {
        state.syncStatus = 'error';
        if (state.showProgressModal) renderApp();
      });
  }, 1200);
}

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
    return [['SELECT', 'SELECT '], ['FROM', 'FROM '], ['WHERE', 'WHERE '], ['GROUP BY', 'GROUP BY '], ['*', '*'], ['=', '='], ["'", "'"], ['(', '('], [')', ')'], [',', ','], [';', ';']];
  }
  if (engine === 'git') {
    return [['git ', 'git '], ['add .', 'add .'], ['commit -m', 'commit -m "'], ['switch', 'switch '], ['-c', '-c '], ['"', '"'], ['.', '.']];
  }
  if (engine === 'projeto') return [];
  return [['⇥ Tab', '    '], [':', ':'], ['(', '('], [')', ')'], ['[', '['], [']', ']'], ['"', '"'], ['=', '='], ['==', ' == '], ['.', '.'], [',', ', '], ['#', '# ']];
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
              autocapitalize="off"
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
  if (currentLesson().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({ toque: aparelho.toque(), estreito: aparelho.estreito(), preferirNormal: false });
}

/** As etapas de projeto não têm editor, logo nunca usam o ecrã de escrita. */
function usaEcraDeEscrita(): boolean {
  if (currentLesson().engine === 'projeto') return false;
  return deveUsarEcraDeEscrita({ toque: aparelho.toque(), estreito: aparelho.estreito(), preferirNormal: loadPreferirEditorNormal() });
}

let scrollAntesDoEcra = 0;
let desligarAlturaVisivel: () => void = () => {};
/** Etapa em que o ecrã foi aberto: se mudar, o ecrã fecha. */
let etapaDoEcra = '';

function etapaAtual(): string {
  return `${state.view}|${state.trackId}|${state.lessonId}|${state.wbTab}|${state.practiceIdx}`;
}

function focarEditor(): void {
  const ed = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
  if (!ed) return;
  ed.focus({ preventScroll: true });
  ed.selectionStart = ed.selectionEnd = ed.value.length;
}

function abrirEcraDeEscrita(aba: AbaEscrita): void {
  if (currentLesson().engine === 'projeto') return;
  if (state.mobileEditor === null) {
    scrollAntesDoEcra = window.scrollY;
    etapaDoEcra = etapaAtual();
    history.pushState({ ecraEscrita: true }, '');
  }
  state.mobileEditor = aba;
  renderApp();
  // No iPhone o teclado só abre se o foco acontecer dentro do gesto do toque: tem de ser já.
  if (aba === 'codigo') focarEditor();
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
}

window.addEventListener('popstate', () => {
  if (state.mobileEditor === null) return;
  // Mudar o # também dispara popstate: lê-se primeiro o endereço novo, senão o render seguinte
  // escreveria no endereço a etapa antiga.
  syncStateFromUrl();
  fecharEcraDeEscrita({ viaHistorico: true });
});

function renderEcraDeEscritaAtual(): string {
  const lesson = currentLesson();
  const engine = activeEngine();
  const enunciado =
    renderEnunciado(lesson) +
    renderPistas(lesson) +
    (state.wbTab === 'challenge' && state.hintLevel < 2
      ? `<button type="button" class="btn" data-action="next-hint">${state.hintLevel === 0 ? 'Pedir pista (1/2)' : 'Mais uma pista (2/2)'}</button>`
      : '');
  return renderEcraDeEscrita({
    aba: state.mobileEditor ?? 'codigo',
    enunciadoHtml: enunciado,
    editorHtml: renderEditorShell(getEditorValue(), engine),
    resultadoHtml: renderOutputRegion(state.output, engine),
    simbolos: simbolosRapidos(engine),
    rotuloExecutar: state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar',
    aCorrer: state.output.kind === 'loading',
  });
}

function renderCompletionBanner(track: Track, lesson: Lesson): string {
  const doneCount = Object.keys(state.completedLessons).length;
  const trackDone = track.lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
  const isTrackFinished = trackDone === track.lessons.length;
  const trackIdx = allTracks.findIndex((t) => t.id === track.id);
  const nextTrack = trackIdx >= 0 && trackIdx < allTracks.length - 1 ? allTracks[trackIdx + 1] : null;
  const isFinalLesson = trackIdx === allTracks.length - 1 && lesson.id === track.lessons[track.lessons.length - 1]?.id;
  const isCourseFinished = doneCount === totalLessonsCount || (isFinalLesson && Boolean(state.completedLessons[lesson.id]));

  if (isCourseFinished) {
    const githubLink = allTracks
      .flatMap((t) => t.lessons)
      .filter((l) => l.projectSpec?.pedirLinkGithub)
      .map((l) => (state.editorDrafts[`${l.id}:challenge`] ?? '').trim())
      .find((url) => linkGithubValido(url));
    return `
      <section class="completion-banner is-course-complete" aria-label="Conclusão do curso">
        <span class="status-chip is-ok">Percurso concluído · ${doneCount} / ${totalLessonsCount} etapas</span>
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

function renderAcademyWorkspace(): string {
  const track = currentTrack();
  const lesson = currentLesson();
  const lessonIdx = track.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = lessonIdx > 0 ? track.lessons[lessonIdx - 1] : null;
  const nextLesson = lessonIdx < track.lessons.length - 1 ? track.lessons[lessonIdx + 1] : null;

  const engine = activeEngine();
  const editorVal = getEditorValue();


  const { sidebarWidth, lessonRatio, editorHeight, sidebarCollapsed } = state.layout;
  const workbenchRatio = 100 - lessonRatio;

  return `
    <div class="layout-bar" role="region" aria-label="Controlo de painéis e redimensionamento">
      <div class="layout-controls">
        <button type="button" class="btn mobile-index-toggle" data-action="toggle-mobile-sidebar">
          ${state.sidebarOpenMobile ? 'Ocultar índice' : `Índice (etapa ${escapeHtml(lesson.code)})`}
        </button>
        <button type="button" class="btn" data-action="toggle-desktop-sidebar">
          ${sidebarCollapsed ? 'Mostrar índice' : 'Recolher índice'}
        </button>
        <button type="button" class="mode-btn" aria-selected="${lessonRatio >= 58}" data-layout-preset="reading">
          Foco leitura
        </button>
        <button type="button" class="mode-btn" aria-selected="${lessonRatio > 42 && lessonRatio < 58}" data-layout-preset="balanced">
          Divisão 50 / 50
        </button>
        <button type="button" class="mode-btn" aria-selected="${lessonRatio <= 42}" data-layout-preset="coding">
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
        <div class="sidebar-section">
          <div class="sidebar-heading">${escapeHtml(track.fullTitle)} <span class="sidebar-time-hint">(${escapeHtml(formatHoursApproxPt(getTrackMinutes(track)))})</span></div>
          <ul class="lesson-nav-list">
            ${track.lessons
              .map((item) => {
                const isCur = item.id === lesson.id;
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
                  <strong>Novo na academia?</strong> <span class="measured">Define a tua bagagem, horas por semana e prazo alvo em 30 segundos para personalizar o Cronograma Gantt.</span>
                </div>
                <button type="button" class="btn btn-primary" data-action="open-diagnostic-modal">🎯 Fazer diagnóstico</button>
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
            <pre class="code-sample"><code>${highlightCode(lesson.errorDemo.code, 'python')}</code></pre>
            <p class="error-demo-label">O Python responde:</p>
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

        ${renderCompletionBanner(track, lesson)}

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
          <span class="status-chip desktop-shortcut-chip">Ctrl + Enter para correr</span>
        </div>

        ${renderEnunciado(lesson)}

        ${
          usaEcraDeEscrita()
            ? state.mobileEditor === null
              ? renderPreviaCodigo(highlightCode(editorVal, engine))
              : ''
            : `${renderSimbolosBar(engine)}
        ${renderEditorShell(editorVal, engine)}
        ${aparelhoPedeEcraDeEscrita() ? '<button type="button" class="link-btn" data-action="usar-ecra-escrita">Usar o ecrã de escrita</button>' : ''}`
        }

        <!-- Resizable Horizontal Splitter: Editor <-> Output -->
        <div
          id="splitter-editor"
          class="pane-splitter-h"
          role="separator"
          tabindex="0"
          aria-orientation="horizontal"
          aria-label="Redimensionar altura do editor de código"
          title="Arrasta para aumentar ou diminuir a altura do editor (duplo clique para repor)"
        ></div>

        <div class="workbench-actions">
          <div class="action-pair">
            <button type="button" class="btn btn-primary" data-action="run-code" ${state.output.kind === 'loading' ? 'disabled' : ''}>
              ${state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar agora'}
            </button>
            <button type="button" class="btn" data-action="format-code" title="Formatar código com Prettier (Shift + Alt + F)">
              Formatar Prettier
            </button>
            <button type="button" class="btn" data-action="reset-code">Repor código</button>
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
                      : `<button type="button" class="btn" data-action="ask-solution">Mostrar solução de referência</button>`
                  }
                </div>`
              : ''
          }
        </div>

        ${state.mobileEditor === null ? renderPistas(lesson) : ''}

        ${state.mobileEditor === null ? renderOutputRegion(state.output, engine) : ''}
        `
        }
      </section>
    </div>
  `;
}

function renderApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  writeStateToUrl();

  // O ecrã de escrita fecha se a etapa, o separador ou o aparelho mudarem.
  if (state.mobileEditor !== null && (etapaAtual() !== etapaDoEcra || !usaEcraDeEscrita())) {
    state.mobileEditor = null;
    if (history.state?.ecraEscrita) history.replaceState(null, '');
  }
  const ecraAberto = state.view === 'academia' && state.mobileEditor !== null;
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
    } else {
      mainContent = renderExplorerHtml(state.dataset, {
        serie: state.explorerSerie,
        cidade: state.explorerCidade,
        categoria: state.explorerCategoria,
      });
    }
  } else if (state.view === 'cronograma') {
    mainContent = renderGanttHtml(allTracks, state.completedLessons, {
      paceMinutesPerWeek: state.ganttPaceMinutes,
      filterStatus: state.ganttFilterStatus,
      collapsedTracks: state.ganttCollapsedTracks,
      currentLessonId: state.lessonId,
      lessonTimes: state.lessonTimes,
      diagnostic: state.diagnostic,
    });
  } else {
    mainContent = renderCheatsheetHtml(state.refQuery, state.refCategory);
  }

  root.innerHTML = `
    <div class="app-root">
      <header class="top-nav">
        <div class="top-nav-inner">
          <div class="brand-group">
            <a href="#vista=academia&trilha=python&licao=py-00-pensamento" class="brand-link" aria-label="Mercearia do Bairro, página inicial da academia" data-action="go-home">
              <span class="brand-wordmark"><span class="brand-icon">🛒</span> <span class="brand-name">Mercearia</span><span class="brand-full"> do Bairro</span></span>
              <span class="brand-context">Academia de Dados</span>
            </a>
          </div>

          <nav class="track-strip" aria-label="Trilhas e ferramentas">
            ${allTracks
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
              class="btn nav-progress-btn"
              data-action="open-progress-modal"
              title="Ver progresso por trilha, código de retoma e exportar portefólio"
            >
              <span class="progress-full">${Object.keys(state.completedLessons).length} / ${totalLessonsCount} etapas · Progresso</span>
              <span class="progress-compact">🏆 ${Object.keys(state.completedLessons).length}/${totalLessonsCount}</span>
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

      <main class="workspace-wrap">
        ${mainContent}
      </main>
      ${state.showProgressModal ? renderProgressModal(state) : ''}
      ${state.showThemeModal ? renderThemeModal(state) : ''}
      ${state.showDiagnosticModal ? renderDiagnosticModal(state) : ''}
      ${ecraAberto ? renderEcraDeEscritaAtual() : ''}
    </div>
  `;

  document.body.classList.toggle('tem-ecra-escrita', ecraAberto);
  const ecra = root.querySelector<HTMLElement>('.ecra-escrita');
  if (ecra) desligarAlturaVisivel = ligarAlturaVisivel(ecra);

  attachDomListeners();
}

async function executeWorkbench(): Promise<void> {
  const lesson = currentLesson();
  // As etapas de projeto fazem-se no computador do aluno: não há nada para correr aqui.
  if (lesson.engine === 'projeto') return;
  const engine = activeEngine();
  const code = getEditorValue();

  state.output = { kind: 'loading', statusMessage: 'A processar código…' };
  renderApp();

  if (engine === 'sql') {
    const res = await runSqlQuery(code);
    if (res.error) {
      state.output = { kind: 'error', errorText: res.error, elapsedMs: res.elapsedMs };
      renderApp();
      return;
    }

    const sqlChallenge = state.wbTab === 'challenge' ? activeSqlChallenge(lesson) : undefined;
    if (sqlChallenge) {
      const check = sqlChallenge.validate(res.columns, res.rows);
      if (check.passed && state.practiceIdx > 0) {
        state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
        savePracticeDone();
      } else if (check.passed) {
        markLessonCompleted(lesson);
      }
      state.output = {
        kind: 'full',
        elapsedMs: res.elapsedMs,
        table: { columns: res.columns, rows: res.rows },
        bannerOk: check.passed,
        bannerText: check.passed
          ? state.practiceIdx > 0
            ? 'Treino resolvido!'
            : 'Desafio SQL validado'
          : 'Query executada: revê o requisito',
        checks: [
          {
            label: check.message,
            passed: check.passed,
            hint: check.passed ? undefined : sqlChallenge.hint,
          },
        ],
      };
    } else {
      state.output = {
        kind: 'full',
        elapsedMs: res.elapsedMs,
        table: { columns: res.columns, rows: res.rows },
        bannerText: `${res.rows.length} linha(s) devolvidas`,
      };
    }
    renderApp();
    return;
  }

  if (engine === 'git') {
    const freshBase = state.wbTab === 'challenge' ? createInitialGitState() : state.gitState;
    const { output, nextState } = runGitSimulator(freshBase, code);
    state.gitState = nextState;

    const gitChallenge = state.wbTab === 'challenge' ? activeGitChallenge(lesson) : undefined;
    if (gitChallenge) {
      const check = gitChallenge.validate(nextState, output);
      if (check.passed && state.practiceIdx > 0) {
        state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
        savePracticeDone();
      } else if (check.passed) {
        markLessonCompleted(lesson);
      }
      state.output = {
        kind: 'full',
        elapsedMs: 1.2,
        stdout: output || 'Nenhum comando executado.',
        bannerOk: check.passed,
        bannerText: check.passed
          ? state.practiceIdx > 0
            ? 'Treino resolvido!'
            : 'Desafio Git concluído'
          : 'Comandos executados: falta um passo',
        checks: [
          {
            label: check.message,
            passed: check.passed,
            hint: check.passed ? undefined : gitChallenge.hint,
          },
        ],
      };
    } else {
      state.output = {
        kind: 'full',
        elapsedMs: 1.0,
        stdout: output || 'Nenhum comando executado.',
        bannerText: `Ramo ativo: ${nextState.currentBranch}`,
      };
    }
    renderApp();
    return;
  }

  const pyChallenge = state.wbTab === 'challenge' ? activePythonChallenge(lesson) : undefined;
  const pyChecks = pyChallenge?.checks;
  const pyRes = await runPythonCode(code, pyChecks, (statusMsg) => {
    state.output = { kind: 'loading', statusMessage: statusMsg };
    const statusEl = document.querySelector('.output-panel .measured');
    if (statusEl) statusEl.textContent = statusMsg;
  }, currentLesson().ficheirosDados ?? []);

  if (pyRes.error) {
    state.output = {
      kind: 'error',
      elapsedMs: pyRes.elapsedMs,
      errorText: pyRes.error,
    };
    renderApp();
    return;
  }

  const allPassed = pyRes.checks ? pyRes.checks.every((c) => c.passed) : undefined;
  if (allPassed && state.practiceIdx > 0) {
    state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
    savePracticeDone();
  } else if (allPassed) {
    markLessonCompleted(lesson);
  }

  state.output = {
    kind: 'full',
    elapsedMs: pyRes.elapsedMs,
    stdout: pyRes.stdout,
    table: pyRes.table,
    images: pyRes.images,
    checks: pyRes.checks,
    bannerOk: allPassed,
    bannerText:
      allPassed === true
        ? state.practiceIdx > 0
          ? 'Treino resolvido!'
          : 'Todos os testes passaram!'
        : allPassed === false
          ? `${pyRes.checks!.filter((c) => c.passed).length}/${pyRes.checks!.length} verificações certas`
          : 'Código Python executado',
  };
  renderApp();
}

function attachDomListeners(): void {
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
    }
  };

  if (editor) {
    let tabTrapActive = true;
    editor.addEventListener('input', syncEditorOverlay);
    editor.addEventListener('blur', () => {
      tabTrapActive = true;
    });
    editor.addEventListener('scroll', () => {
      if (highlightPre) {
        highlightPre.scrollTop = editor.scrollTop;
        highlightPre.scrollLeft = editor.scrollLeft;
      }
    });
    editor.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        tabTrapActive = false;
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault();
        void executeWorkbench();
      } else if (ev.shiftKey && ev.altKey && (ev.key === 'F' || ev.key === 'f')) {
        ev.preventDefault();
        editor.value = formatCodePrettier(editor.value, activeEngine());
        syncEditorOverlay();
      } else if (ev.key === 'Tab' && !ev.shiftKey && tabTrapActive) {
        ev.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.slice(0, start) + '    ' + editor.value.slice(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        syncEditorOverlay();
      }
    });
  }

  document.querySelectorAll<HTMLElement>('[data-insert]').forEach((btn) => {
    // Sem isto o botão tira o foco ao editor e o teclado do telemóvel fecha e reabre a cada símbolo.
    btn.addEventListener('mousedown', (ev) => ev.preventDefault());
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const textToInsert = btn.dataset.insert;
      if (!textToInsert) return;
      const editorEl = document.getElementById('workbench-editor') as HTMLTextAreaElement | null;
      if (!editorEl) return;
      const start = editorEl.selectionStart ?? editorEl.value.length;
      const end = editorEl.selectionEnd ?? editorEl.value.length;
      editorEl.value = editorEl.value.slice(0, start) + textToInsert + editorEl.value.slice(end);
      const newPos = start + textToInsert.length;
      editorEl.selectionStart = editorEl.selectionEnd = newPos;
      editorEl.focus();
      syncEditorOverlay();
    });
  });

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
    });
  });

  document.querySelectorAll<HTMLElement>('[data-select-track]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.selectTrack!;
      const tr = allTracks.find((t) => t.id === tid);
      if (!tr) return;
      state.view = 'academia';
      state.trackId = tr.id;
      if (!tr.lessons.some((l) => l.id === state.lessonId)) {
        state.lessonId = tr.lessons[0].id;
      }
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
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
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
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
      state.lessonId = lid;
      state.wbTab = 'challenge';
      state.practiceIdx = 0;
      state.output = { kind: 'empty' };
      state.sidebarOpenMobile = false;
      state.confirmSolutionLessonId = null;
      state.hintLevel = 0;
      renderApp();
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
      const entry = cheatsheets[Number(btn.dataset.tryRef)];
      if (!entry || !entry.tryEngine || !entry.trySnippet) return;
      const targetTrack =
        entry.tryEngine === 'sql'
          ? allTracks.find((t) => t.id === 'sql')!
          : entry.tryEngine === 'git'
            ? allTracks.find((t) => t.id === 'git')!
            : allTracks.find((t) => t.id === (entry.category === 'Pandas' ? 'pandas' : 'python'))!;
      state.view = 'academia';
      state.trackId = targetTrack.id;
      state.lessonId = targetTrack.lessons[0].id;
      state.wbTab = 'example';
      state.mobileTab = 'workbench';
      state.editorDrafts[draftKey(targetTrack.lessons[0], 'example')] = entry.trySnippet;
      saveDrafts(state.editorDrafts, true);
      state.output = { kind: 'empty' };
      renderApp();
      void executeWorkbench();
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
        state.trackId = allTracks[0].id;
        state.lessonId = allTracks[0].lessons[0].id;
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
      } else if (act === 'switch-to-lesson') {
        state.mobileTab = 'lesson';
        renderApp();
      } else if (act === 'load-example-tab') {
        state.wbTab = 'example';
        state.mobileTab = 'workbench';
        state.editorDrafts[draftKey(currentLesson(), 'example')] = currentLesson().exampleCode;
        saveDrafts(state.editorDrafts, true);
        renderApp();
        void executeWorkbench();
      } else if (act === 'run-code') {
        void executeWorkbench();
      } else if (act === 'abrir-ecra-escrita') {
        abrirEcraDeEscrita('codigo');
      } else if (act === 'fechar-ecra-escrita') {
        fecharEcraDeEscrita();
      } else if (act === 'usar-editor-normal') {
        savePreferirEditorNormal(true);
        fecharEcraDeEscrita();
        renderApp();
      } else if (act === 'usar-ecra-escrita') {
        savePreferirEditorNormal(false);
        renderApp();
      } else if (act === 'executar-ecra-escrita') {
        (document.activeElement as HTMLElement | null)?.blur();
        state.mobileEditor = 'resultado';
        void executeWorkbench();
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
            const res = await pushCloudSync({
              progress: state.completedLessons,
              drafts: state.editorDrafts,
              quizzes: state.quizSelection,
              practice: [...state.practiceDone],
              lastLocation: {
                trackId: state.trackId,
                lessonId: state.lessonId,
                view: state.view,
                timestamp: new Date().toISOString(),
              },
            });
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
            const res = await pushCloudSync({
              code: state.syncCode,
              progress: state.completedLessons,
              drafts: state.editorDrafts,
              quizzes: state.quizSelection,
              practice: [...state.practiceDone],
              lastLocation: {
                trackId: state.trackId,
                lessonId: state.lessonId,
                view: state.view,
                timestamp: new Date().toISOString(),
              },
            });
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
              state.completedLessons = mergeProgressRecords(state.completedLessons, remote.progress);
              state.editorDrafts = { ...remote.drafts, ...state.editorDrafts };
              state.quizSelection = { ...remote.quizzes, ...state.quizSelection };
              state.practiceDone = new Set([...state.practiceDone, ...remote.practice]);
              savePractice(state.practiceDone);
              saveProgress(state.completedLessons);
              saveDrafts(state.editorDrafts, true);
              saveQuizzes(state.quizSelection);
              saveSyncCode(remote.code);
              state.syncCode = remote.code;
              state.syncStatus = 'synced';
              state.syncLastUpdatedAt = remote.updatedAt;
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
        const md = generatePortfolioMarkdown(state.completedLessons, state.editorDrafts, allTracks);
        downloadTextFile('portfolio_mercearia_do_bairro.md', md, 'text/markdown;charset=utf-8');
        state.progressModalFeedback = { ok: true, text: 'Portefólio (.md) descarregado com sucesso.' };
        renderApp();
      } else if (act === 'export-progress-json') {
        saveLessonTimes(state.lessonTimes);
        const json = exportProgressJson(
          state.completedLessons,
          state.editorDrafts,
          state.quizSelection,
          [...state.practiceDone],
          state.lessonTimes,
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
        state.view = 'cronograma';
        renderApp();
      } else if (act === 'toggle-lesson-timer') {
        state.timerPaused = !state.timerPaused;
        saveLessonTimes(state.lessonTimes);
        renderApp();
      } else if (act === 'gantt-expand-all') {
        state.ganttCollapsedTracks.clear();
        renderApp();
      } else if (act === 'gantt-collapse-all') {
        state.ganttCollapsedTracks = new Set(allTracks.map((t) => t.id));
        renderApp();
      } else if (act === 'open-diagnostic-modal') {
        state.showProgressModal = false;
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
      } else if (act === 'apply-diagnostic-only' || act === 'apply-diagnostic-and-go') {
        const saved = { ...state.diagnosticDraft, updatedAt: new Date().toISOString() };
        state.diagnostic = saved;
        saveDiagnostic(saved);
        state.ganttPaceMinutes = saved.hoursPerWeek * 60;
        state.showDiagnosticModal = false;
        if (act === 'apply-diagnostic-and-go') {
          const plan = evaluateDiagnosticPlan(saved, getCourseMinutes(allTracks));
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

  const gridEl = document.getElementById('academy-grid');
  const sidebarSplitter = document.getElementById('splitter-sidebar');
  const mainSplitter = document.getElementById('splitter-main');
  const editorSplitter = document.getElementById('splitter-editor');

  const applyCssVarsLive = (): void => {
    if (!gridEl) return;
    gridEl.style.setProperty('--sidebar-w', `${state.layout.sidebarWidth}px`);
    gridEl.style.setProperty('--lesson-fr', `${state.layout.lessonRatio}fr`);
    gridEl.style.setProperty('--workbench-fr', `${100 - state.layout.lessonRatio}fr`);
    gridEl.style.setProperty('--editor-h', `${state.layout.editorHeight}px`);
  };

  if (sidebarSplitter && gridEl) {
    sidebarSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      sidebarSplitter.setPointerCapture(ev.pointerId);
      sidebarSplitter.classList.add('is-dragging');
      const rect = gridEl.getBoundingClientRect();
      const onMove = (moveEv: PointerEvent): void => {
        const nextW = Math.round(Math.min(420, Math.max(180, moveEv.clientX - rect.left)));
        state.layout.sidebarWidth = nextW;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        sidebarSplitter.classList.remove('is-dragging');
        sidebarSplitter.removeEventListener('pointermove', onMove);
        sidebarSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
      };
      sidebarSplitter.addEventListener('pointermove', onMove);
      sidebarSplitter.addEventListener('pointerup', onUp);
    });
    sidebarSplitter.addEventListener('dblclick', () => {
      state.layout.sidebarWidth = DEFAULT_LAYOUT.sidebarWidth;
      applyCssVarsLive();
      saveLayoutPrefs(state.layout);
    });
    sidebarSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowRight' ? 16 : -16;
        state.layout.sidebarWidth = Math.min(420, Math.max(180, state.layout.sidebarWidth + delta));
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }

  if (mainSplitter && gridEl) {
    mainSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      mainSplitter.setPointerCapture(ev.pointerId);
      mainSplitter.classList.add('is-dragging');
      const onMove = (moveEv: PointerEvent): void => {
        const rect = gridEl.getBoundingClientRect();
        const sideOffset = state.layout.sidebarCollapsed ? 0 : state.layout.sidebarWidth + 8;
        const availW = Math.max(400, rect.width - sideOffset);
        const relX = moveEv.clientX - (rect.left + sideOffset);
        const ratio = Math.round(Math.min(70, Math.max(30, (relX / availW) * 100)));
        state.layout.lessonRatio = ratio;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        mainSplitter.classList.remove('is-dragging');
        mainSplitter.removeEventListener('pointermove', onMove);
        mainSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
        renderApp();
      };
      mainSplitter.addEventListener('pointermove', onMove);
      mainSplitter.addEventListener('pointerup', onUp);
    });
    mainSplitter.addEventListener('dblclick', () => {
      state.layout.lessonRatio = DEFAULT_LAYOUT.lessonRatio;
      saveLayoutPrefs(state.layout);
      renderApp();
    });
    mainSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowRight' ? 4 : -4;
        state.layout.lessonRatio = Math.min(70, Math.max(30, state.layout.lessonRatio + delta));
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }

  if (editorSplitter && gridEl) {
    const editorShell = document.getElementById('editor-shell');
    editorSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      editorSplitter.setPointerCapture(ev.pointerId);
      editorSplitter.classList.add('is-dragging');
      const startY = ev.clientY;
      const startH = editorShell?.getBoundingClientRect().height ?? state.layout.editorHeight;
      const onMove = (moveEv: PointerEvent): void => {
        const nextH = Math.round(Math.min(640, Math.max(140, startH + (moveEv.clientY - startY))));
        state.layout.editorHeight = nextH;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        editorSplitter.classList.remove('is-dragging');
        editorSplitter.removeEventListener('pointermove', onMove);
        editorSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
      };
      editorSplitter.addEventListener('pointermove', onMove);
      editorSplitter.addEventListener('pointerup', onUp);
    });
    editorSplitter.addEventListener('dblclick', () => {
      state.layout.editorHeight = DEFAULT_LAYOUT.editorHeight;
      applyCssVarsLive();
      saveLayoutPrefs(state.layout);
    });
    editorSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowDown' ? 24 : -24;
        state.layout.editorHeight = Math.min(640, Math.max(140, state.layout.editorHeight + delta));
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }
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
  if (ev.key === 'Escape' && state.mobileEditor !== null && !state.showProgressModal && !state.showThemeModal) {
    fecharEcraDeEscrita();
    return;
  }
  if (ev.key === 'Escape' && (state.showProgressModal || state.showThemeModal)) {
    state.showProgressModal = false;
    state.showThemeModal = false;
    renderApp();
  }
});

async function bootstrapCloudSync(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const urlCode = params.get('sync');
  const normalizedUrlCode = urlCode ? extractSyncCode(urlCode) : null;
  const targetCode = normalizedUrlCode ?? state.syncCode;
  if (!targetCode) return;

  try {
    const remote = await pullCloudSync(targetCode);
    state.completedLessons = mergeProgressRecords(state.completedLessons, remote.progress);
    state.editorDrafts = { ...remote.drafts, ...state.editorDrafts };
    state.quizSelection = { ...remote.quizzes, ...state.quizSelection };
    state.practiceDone = new Set([...state.practiceDone, ...remote.practice]);
    savePractice(state.practiceDone);
    saveProgress(state.completedLessons);
    saveDrafts(state.editorDrafts, true);
    saveQuizzes(state.quizSelection);
    saveSyncCode(remote.code);
    state.syncCode = remote.code;
    state.syncStatus = 'synced';
    state.syncLastUpdatedAt = remote.updatedAt;

    if (normalizedUrlCode && remote.lastLocation) {
      const loc = locateLesson(remote.lastLocation!.trackId, remote.lastLocation!.lessonId);
      if (loc) {
        state.trackId = loc.trackId;
        state.lessonId = loc.lessonId;
      }
      state.view = remote.lastLocation.view;
      saveLastLocation(remote.lastLocation);
    }

    if (urlCode) {
      params.delete('sync');
      const cleanSearch = params.toString();
      const nextUrl = `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${window.location.hash}`;
      history.replaceState(null, '', nextUrl);
    }
    renderApp();
  } catch {
    state.syncStatus = 'error';
  }
}

syncStateFromUrl();
renderApp();
void bootstrapData();
void bootstrapCloudSync();

// Tracker discreto de tempo útil por etapa: só avança na vista Academia com o separador visível e atividade recente.
let lastStudyActivityAt = Date.now();
let timerTicksSinceSave = 0;
const touchStudyActivity = () => {
  lastStudyActivityAt = Date.now();
};
window.addEventListener('pointerdown', touchStudyActivity, { passive: true });
window.addEventListener('keydown', touchStudyActivity, { passive: true });
window.addEventListener('scroll', touchStudyActivity, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveLessonTimes(state.lessonTimes);
  } else {
    touchStudyActivity();
  }
});
window.addEventListener('beforeunload', () => saveLessonTimes(state.lessonTimes));

window.setInterval(() => {
  if (
    state.view !== 'academia' ||
    state.timerPaused ||
    document.visibilityState !== 'visible' ||
    state.showProgressModal ||
    state.showThemeModal ||
    state.showDiagnosticModal ||
    Date.now() - lastStudyActivityAt > 180_000
  ) {
    return;
  }
  const nextSecs = (state.lessonTimes[state.lessonId] ?? 0) + 1;
  state.lessonTimes[state.lessonId] = nextSecs;
  const clockEl = document.getElementById('lesson-timer-clock');
  if (clockEl) clockEl.textContent = formatTimerClock(nextSecs);
  timerTicksSinceSave++;
  if (timerTicksSinceSave >= 10) {
    timerTicksSinceSave = 0;
    saveLessonTimes(state.lessonTimes);
  }
}, 1000);
