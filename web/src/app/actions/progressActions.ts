// Ações do modal de progresso (códigos, nuvem, backups, portefólio) e do diagnóstico inicial.

import {
  clearSavedDiagnostic,
  evaluateDiagnosticPlan,
  saveDiagnostic,
  type DiagnosticProfile,
} from '../../data/diagnostic';
import { evaluatePlacementAnswers } from '../../data/placementQuiz';
import {
  buildSyncShareUrl,
  clearAllUserProgress,
  decodeProgressCode,
  encodeProgressCode,
  exportProgressJson,
  extractSyncCode,
  generatePortfolioMarkdown,
  pullCloudSync,
  pushCloudSync,
  saveLastLocation,
  saveSyncCode,
} from '../../data/progress';
import { getCourseMinutes } from '../../data/studyPlan';
import { saveLessonTimes } from '../../data/timeTracker';
import { TRACK_INDEX } from '../../data/trackIndex';
import { loadAllTracksAsync } from '../../data/trackLoaders';
import { downloadTextFile } from '../../ui/html';
import { locateLesson } from '../lessonContext';
import { applyRemoteCloudSync, buildCloudSyncPayload, scheduleCloudSync } from '../progressSync';
import { renderApp } from '../rerender';
import { state } from '../store';
import { onBackdrop, type ActionMap } from './types';

function feedback(ok: boolean, text: string): void {
  state.progressModalFeedback = { ok, text };
}

function errorText(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** Abre a etapa guardada (ou sugerida) e põe a vista nela. */
function goToLocation(trackId: string, lessonId: string): void {
  const loc = locateLesson(trackId, lessonId);
  if (loc) {
    state.trackId = loc.trackId;
    state.lessonId = loc.lessonId;
  }
}

function closeProgressModal(): void {
  state.showProgressModal = false;
  renderApp();
}

function closeDiagnosticModal(): void {
  state.showDiagnosticModal = false;
  renderApp();
}

/** Guarda o diagnóstico e ajusta o ritmo do cronograma. */
function commitDiagnostic(saved: DiagnosticProfile): void {
  state.diagnostic = saved;
  saveDiagnostic(saved);
  scheduleCloudSync();
  state.ganttPaceMinutes = saved.hoursPerWeek * 60;
  state.showDiagnosticModal = false;
}

/** Depois do diagnóstico: abre a etapa sugerida no desafio principal. */
function openSuggestedLesson(trackId: string, lessonId: string): void {
  goToLocation(trackId, lessonId);
  state.view = 'academia';
  state.wbTab = 'challenge';
  state.practiceIdx = 0;
  state.output = { kind: 'empty' };
}

async function generateProgressCode(): Promise<void> {
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
      feedback(true, 'Código gerado e copiado para a área de transferência!');
    } else {
      feedback(true, 'Código gerado! Copia o texto abaixo para continuar noutro dispositivo.');
    }
  } catch (err) {
    feedback(false, errorText(err, 'Não foi possível gerar o código.'));
  }
  renderApp();
}

async function activateCloudSync(): Promise<void> {
  try {
    const res = await pushCloudSync(buildCloudSyncPayload());
    state.syncCode = res.code;
    state.syncStatus = 'synced';
    state.syncLastUpdatedAt = res.updatedAt;
    const shareUrl = buildSyncShareUrl(res.code);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      feedback(true, `Código ${res.code} ativado! Link de retoma copiado para a área de transferência.`);
    } else {
      feedback(true, `Código ${res.code} ativado! Guarda este código para retomar noutro dispositivo.`);
    }
  } catch (err) {
    state.syncStatus = 'error';
    feedback(false, errorText(err, 'Erro ao ativar sincronização na cloud.'));
  }
  renderApp();
}

async function copySyncLink(syncCode: string): Promise<void> {
  const shareUrl = buildSyncShareUrl(syncCode);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      feedback(true, `Link de retoma (${state.syncCode}) copiado! Abre-o no telemóvel ou PC.`);
    } else {
      feedback(true, `Usa o código ${state.syncCode} ou o URL: ${shareUrl}`);
    }
  } catch {
    feedback(true, `Código ativo: ${state.syncCode}`);
  }
  renderApp();
}

async function syncNow(syncCode: string): Promise<void> {
  try {
    const res = await pushCloudSync(buildCloudSyncPayload(syncCode));
    state.syncStatus = 'synced';
    state.syncLastUpdatedAt = res.updatedAt;
    feedback(true, `Sincronizado com sucesso (${res.code}).`);
  } catch (err) {
    state.syncStatus = 'error';
    feedback(false, errorText(err, 'Falha ao sincronizar com a cloud.'));
  }
  renderApp();
}

async function connectToCloudCode(cloudCode: string): Promise<void> {
  try {
    const remote = await pullCloudSync(cloudCode);
    applyRemoteCloudSync(remote);
    if (remote.lastLocation) {
      goToLocation(remote.lastLocation.trackId, remote.lastLocation.lessonId);
      state.view = remote.lastLocation.view;
      saveLastLocation(remote.lastLocation);
    }
    state.progressCodeInput = '';
    feedback(true, `Dispositivo ligado ao código ${remote.code}! Progresso sincronizado.`);
  } catch (err) {
    state.syncStatus = 'error';
    feedback(false, errorText(err, 'Código não encontrado na cloud.'));
  }
  renderApp();
}

async function restoreFromProgressCode(raw: string): Promise<void> {
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
      goToLocation(restored.lastLocation.trackId, restored.lastLocation.lessonId);
      state.view = restored.lastLocation.view;
    }
    state.progressCodeInput = '';
    feedback(true, `Progresso restaurado! (${Object.keys(restored.progress).length} etapas concluídas).`);
  } catch (err) {
    feedback(false, errorText(err, 'Código inválido.'));
  }
  renderApp();
}

async function exportPortfolio(): Promise<void> {
  try {
    const tracks = await loadAllTracksAsync();
    const md = generatePortfolioMarkdown(state.completedLessons, state.editorDrafts, tracks);
    downloadTextFile('portfolio_mercearia_do_bairro.md', md, 'text/markdown;charset=utf-8');
    feedback(true, 'Portefólio (.md) descarregado com sucesso.');
  } catch (err) {
    feedback(false, errorText(err, 'Erro ao exportar portefólio.'));
  }
  renderApp();
}

function applyDiagnostic(goToStart: boolean): void {
  const saved = { ...state.diagnosticDraft, updatedAt: new Date().toISOString() };
  commitDiagnostic(saved);
  if (goToStart) {
    const plan = evaluateDiagnosticPlan(saved, getCourseMinutes(TRACK_INDEX));
    openSuggestedLesson(plan.startTrackId, plan.startLessonId);
  }
  renderApp();
}

export const progressActions: ActionMap = {
  'open-progress-modal': () => {
    state.showProgressModal = true;
    state.progressModalFeedback = null;
    state.confirmClearProgress = false;
    renderApp();
  },
  'close-progress-modal': closeProgressModal,
  'close-progress-backdrop': onBackdrop(closeProgressModal),

  'generate-progress-code': () => void generateProgressCode(),

  'activate-cloud-sync': () => {
    state.syncStatus = 'syncing';
    feedback(true, 'A criar código de sincronização na cloud…');
    renderApp();
    void activateCloudSync();
  },
  'copy-sync-link': () => {
    if (!state.syncCode) return;
    void copySyncLink(state.syncCode);
  },
  'sync-now': () => {
    if (!state.syncCode) return;
    state.syncStatus = 'syncing';
    renderApp();
    void syncNow(state.syncCode);
  },
  'disconnect-cloud-sync': () => {
    state.syncCode = null;
    state.syncStatus = 'idle';
    saveSyncCode(null);
    feedback(true, 'Sincronização na cloud desligada neste dispositivo (o progresso local mantém-se).');
    renderApp();
  },
  'apply-progress-code': () => {
    const raw = state.progressCodeInput.trim();
    if (!raw) {
      feedback(false, 'Cola primeiro um código MB-XXXX-XXXX-XXXX, link ?sync=… ou código MB1-….');
      renderApp();
      return;
    }
    // Código da nuvem (MB-XXXX-…) ou link ?sync=…: liga este dispositivo a esse código.
    const cloudCode = extractSyncCode(raw);
    if (cloudCode) {
      state.syncStatus = 'syncing';
      feedback(true, `A ligar ao código ${cloudCode}…`);
      renderApp();
      void connectToCloudCode(cloudCode);
      return;
    }
    // Senão é um código offline MB1-… com o progresso todo lá dentro.
    void restoreFromProgressCode(raw);
  },

  'export-portfolio-md': () => {
    feedback(true, 'A preparar portefólio completo…');
    renderApp();
    void exportPortfolio();
  },
  'export-progress-json': () => {
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
    feedback(true, 'Backup (.json) descarregado com sucesso.');
    renderApp();
  },
  'trigger-import-json': () => {
    document.getElementById('import-progress-file')?.click();
  },

  'ask-clear-progress': () => {
    state.confirmClearProgress = true;
    renderApp();
  },
  'cancel-clear-progress': () => {
    state.confirmClearProgress = false;
    renderApp();
  },
  'confirm-clear-progress': () => {
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
    feedback(true, 'Progresso local limpo.');
    renderApp();
  },

  'open-diagnostic-modal': () => {
    state.showProgressModal = false;
    state.showGuideModal = false;
    state.diagnosticDraft = state.diagnostic ?? state.diagnosticDraft;
    state.showDiagnosticModal = true;
    renderApp();
  },
  'close-diagnostic-modal': closeDiagnosticModal,
  'close-diagnostic-backdrop': onBackdrop(closeDiagnosticModal),
  'toggle-placement-quiz': () => {
    state.showPlacementQuiz = !state.showPlacementQuiz;
    renderApp();
  },
  'apply-placement-result': () => {
    const res = evaluatePlacementAnswers(state.placementAnswers);
    const saved = {
      ...state.diagnosticDraft,
      background: res.suggestedBackground,
      updatedAt: new Date().toISOString(),
    };
    state.diagnosticDraft = saved;
    commitDiagnostic(saved);
    openSuggestedLesson(res.suggestedTrackId, res.suggestedLessonId);
    renderApp();
  },
  'apply-diagnostic-only': () => applyDiagnostic(false),
  'apply-diagnostic-and-go': () => applyDiagnostic(true),
};
