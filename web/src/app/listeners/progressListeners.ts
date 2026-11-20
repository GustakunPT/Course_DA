// Campos do modal de progresso (código, importar backup, revisão) e do diagnóstico.

import { saveDiagnostic, type BackgroundLevel } from '../../data/diagnostic';
import { evaluatePlacementAnswers } from '../../data/placementQuiz';
import { importProgressJson, saveProgress } from '../../data/progress';
import { markLessonReviewedRecord } from '../../data/spacedReview';
import { saveLessonTimes } from '../../data/timeTracker';
import { scheduleCloudSync } from '../progressSync';
import { renderApp } from '../rerender';
import { state } from '../store';

function onClick(selector: string, handler: (btn: HTMLElement) => void): void {
  document.querySelectorAll<HTMLElement>(selector).forEach((btn) => {
    btn.addEventListener('click', () => handler(btn));
  });
}

async function importBackupFile(file: File): Promise<void> {
  try {
    const imported = importProgressJson(await file.text());
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
}

function attachDiagnosticListeners(): void {
  onClick('[data-diag-bg]', (btn) => {
    const bg = btn.dataset.diagBg as BackgroundLevel;
    if (bg === 'zero' || bg === 'negocio' || bg === 'tech') {
      state.diagnosticDraft = { ...state.diagnosticDraft, background: bg };
      renderApp();
    }
  });
  onClick('[data-diag-hours]', (btn) => {
    const hrs = Number(btn.dataset.diagHours);
    if (Number.isFinite(hrs) && hrs > 0) {
      state.diagnosticDraft = { ...state.diagnosticDraft, hoursPerWeek: hrs };
      renderApp();
    }
  });
  onClick('[data-diag-months]', (btn) => {
    const m = Number(btn.dataset.diagMonths);
    if (Number.isFinite(m) && m > 0) {
      state.diagnosticDraft = { ...state.diagnosticDraft, targetMonths: m };
      renderApp();
    }
  });
  // Teste de nivelamento: cada resposta pode mudar o ponto de partida sugerido.
  onClick('[data-placement-q][data-placement-opt]', (btn) => {
    const qId = btn.dataset.placementQ;
    const opt = Number(btn.dataset.placementOpt);
    if (!qId || !Number.isInteger(opt)) return;
    state.placementAnswers[qId] = opt;
    const res = evaluatePlacementAnswers(state.placementAnswers);
    if (res.complete) {
      state.diagnosticDraft = { ...state.diagnosticDraft, background: res.suggestedBackground };
    }
    renderApp();
  });
}

export function attachProgressListeners(): void {
  attachDiagnosticListeners();

  const codeInput = document.getElementById('progress-code-input') as HTMLInputElement | null;
  codeInput?.addEventListener('input', () => {
    state.progressCodeInput = codeInput.value;
  });

  const importFile = document.getElementById('import-progress-file') as HTMLInputElement | null;
  importFile?.addEventListener('change', () => {
    const file = importFile.files?.[0];
    if (file) void importBackupFile(file);
  });

  onClick('[data-review-done]', (btn) => {
    const leId = btn.dataset.reviewDone;
    if (!leId || !state.completedLessons[leId]) return;
    state.completedLessons[leId] = markLessonReviewedRecord(state.completedLessons[leId]);
    saveProgress(state.completedLessons);
    scheduleCloudSync();
    renderApp();
  });
}
