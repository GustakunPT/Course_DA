import type { MerceariaDataset } from '../engines/csvEngine';
import type { GitRepoState } from '../engines/gitEngine';
import type { UserProgressMap } from '../data/progress';
import type { LayoutPrefs } from './layout';
import type { OutputViewModel } from './outputView';
import type { ThemeId } from './theme';

// Estado global da aplicação, partilhado entre main.ts e as vistas.

export type ViewMode = 'academia' | 'explorador' | 'referencia';
export type WorkbenchTab = 'challenge' | 'example' | 'sqlfree';

export interface AppState {
  view: ViewMode;
  trackId: string;
  lessonId: string;
  wbTab: WorkbenchTab;
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
}
