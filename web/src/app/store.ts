// Estado único da aplicação, criado a partir do que ficou guardado no navegador.

import { TRACK_INDEX } from '../data/trackIndex';
import { loadSavedDiagnostic } from '../data/diagnostic';
import {
  loadSavedDrafts,
  loadSavedPractice,
  loadSavedProgress,
  loadSavedQuizzes,
  loadSyncCode,
} from '../data/progress';
import { loadSavedLessonTimes } from '../data/timeTracker';
import { createInitialGitState } from '../engines/gitEngine';
import type { AppState } from '../ui/appState';
import { applyFontSize, loadSavedFontSize } from '../ui/fontSize';
import { loadSavedLayout } from '../ui/layout';
import { applyTheme, loadSavedTheme } from '../ui/theme';

const savedDiagnostic = loadSavedDiagnostic();

export const state: AppState = {
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
