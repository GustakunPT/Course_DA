import type { FontSizeId } from './fontSize';
import type { AbaEscrita } from './mobileEditor';
import type { MerceariaDataset } from '../engines/csvEngine';
import type { GitRepoState } from '../engines/gitEngine';
import type { UserProgressMap } from '../data/progress';
import type { DiagnosticProfile } from '../data/diagnostic';
import type { LessonTimeMap } from '../data/timeTracker';
import type { LayoutPrefs } from './layout';
import type { OutputViewModel } from './outputView';
import type { ThemeId } from './theme';

// Estado global da aplicação, partilhado entre main.ts e as vistas.

export type ViewMode = 'academia' | 'explorador' | 'referencia' | 'cronograma';
export type WorkbenchTab = 'challenge' | 'example' | 'sqlfree';

export interface AppState {
  view: ViewMode;
  trackId: string;
  lessonId: string;
  wbTab: WorkbenchTab;
  /** 0 = desafio principal; 1..n = exercícios de treino da etapa. */
  practiceIdx: number;
  /** Treinos resolvidos, por chave "id-da-etapa:n". */
  practiceDone: Set<string>;
  editorDrafts: Record<string, string>;
  quizSelection: Record<string, number>;
  completedLessons: UserProgressMap;
  helpedInSession: Set<string>;
  hintLevel: number;
  showProgressModal: boolean;
  showThemeModal: boolean;
  generatedProgressCode: string;
  progressCodeInput: string;
  progressModalFeedback: { ok: boolean; text: string } | null;
  confirmClearProgress: boolean;
  syncCode: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncLastUpdatedAt: string | null;
  output: OutputViewModel;
  gitState: GitRepoState;
  sidebarOpenMobile: boolean;
  mobileTab: 'lesson' | 'workbench';
  layout: LayoutPrefs;
  explorerSerie: 'sazonal' | 'base';
  explorerCidade: string;
  explorerCategoria: string;
  refQuery: string;
  refCategory: string;
  theme: ThemeId;
  dataset: MerceariaDataset | null;
  datasetError: string | null;
  confirmSolutionLessonId: string | null;
  /** Separador aberto no ecrã de escrita do telemóvel; null quando está fechado. */
  mobileEditor: AbaEscrita | null;
  fontSize: FontSizeId;
  showFontMenu: boolean;
  ganttPaceMinutes: number;
  ganttFilterStatus: 'all' | 'todo' | 'done';
  ganttCollapsedTracks: Set<string>;
  lessonTimes: LessonTimeMap;
  timerPaused: boolean;
  showDiagnosticModal: boolean;
  showGuideModal: boolean;
  diagnostic: DiagnosticProfile | null;
  diagnosticDraft: DiagnosticProfile;
  showPlacementQuiz: boolean;
  placementAnswers: Record<string, number>;
}
