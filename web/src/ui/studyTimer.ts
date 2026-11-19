import { formatTimerClock, saveLessonTimes } from '../data/timeTracker';
import type { AppState } from './appState';

const INACTIVITY_PAUSE_MS = 180_000;

/**
 * Tracker discreto de tempo útil por etapa: só avança na vista Academia com o separador
 * visível, nenhuma modal bloqueante aberta e atividade nos últimos 3 minutos.
 */
export function startStudyTimer(state: AppState): void {
  let lastStudyActivityAt = Date.now();
  let timerTicksSinceSave = 0;

  const touchStudyActivity = (): void => {
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
      state.showGuideModal ||
      Date.now() - lastStudyActivityAt > INACTIVITY_PAUSE_MS
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
}
