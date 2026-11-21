// Ações de interface: tema, letra, painéis, modais de guia e cronograma.

import { saveDrafts } from '../../data/progress';
import { TRACK_INDEX } from '../../data/trackIndex';
import { saveLessonTimes } from '../../data/timeTracker';
import { applyFontSize, FONT_SIZE_OPTIONS, type FontSizeId, saveFontSize } from '../../ui/fontSize';
import { DEFAULT_LAYOUT, saveLayoutPrefs } from '../../ui/layout';
import { applyTheme, THEME_OPTIONS, type ThemeId } from '../../ui/theme';
import { clearTrackLoadError } from '../academyView';
import { bootstrapData, clearViewLoadError } from '../lazyViews';
import { scheduleCloudSync } from '../progressSync';
import { renderApp } from '../rerender';
import { state } from '../store';
import { onBackdrop, type ActionMap } from './types';

function closeThemeModal(): void {
  state.showThemeModal = false;
  renderApp();
}

function closeGuideModal(): void {
  state.showGuideModal = false;
  renderApp();
}

function showMobileTab(tab: 'lesson' | 'workbench'): void {
  state.mobileTab = tab;
  renderApp();
  window.scrollTo({ top: 0 });
}

export const uiActions: ActionMap = {
  // Quando o Python da bancada não arranca: guarda os rascunhos e recarrega a página.
  'reload-page': () => {
    saveDrafts(state.editorDrafts, true);
    location.reload();
  },
  'go-home': (_el, ev) => {
    ev.preventDefault();
    state.view = 'academia';
    state.trackId = TRACK_INDEX[0].id;
    state.lessonId = TRACK_INDEX[0].lessons[0].id;
    state.wbTab = 'challenge';
    renderApp();
  },

  'toggle-font-menu': () => {
    state.showFontMenu = !state.showFontMenu;
    renderApp();
    if (state.showFontMenu) document.querySelector<HTMLElement>('.font-menu-item[aria-checked="true"]')?.focus();
  },
  'select-font-size': (el) => {
    const id = el.dataset.fontSize as FontSizeId | undefined;
    if (id && FONT_SIZE_OPTIONS.some((o) => o.id === id)) {
      state.fontSize = id;
      saveFontSize(id);
      applyFontSize(id);
    }
    state.showFontMenu = false;
    renderApp();
    document.querySelector<HTMLElement>('.nav-font-btn')?.focus();
  },

  'open-theme-modal': () => {
    state.showFontMenu = false;
    state.showThemeModal = true;
    renderApp();
  },
  'close-theme-modal': closeThemeModal,
  'close-theme-backdrop': onBackdrop(closeThemeModal),
  'select-theme': (el) => {
    const nextTheme = el.dataset.themeId as ThemeId | undefined;
    if (nextTheme && THEME_OPTIONS.some((t) => t.id === nextTheme)) {
      state.theme = nextTheme;
      applyTheme(state.theme);
      state.showThemeModal = false;
      renderApp();
    }
  },
  'toggle-theme': () => {
    const idx = THEME_OPTIONS.findIndex((t) => t.id === state.theme);
    state.theme = THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length].id;
    applyTheme(state.theme);
    renderApp();
  },

  'toggle-mobile-sidebar': () => {
    state.sidebarOpenMobile = !state.sidebarOpenMobile;
    renderApp();
  },
  'close-mobile-sidebar': () => {
    state.sidebarOpenMobile = false;
    renderApp();
    document.querySelector<HTMLElement>('.mobile-index-toggle')?.focus({ preventScroll: true });
  },
  'toggle-desktop-sidebar': () => {
    state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
    saveLayoutPrefs(state.layout);
    renderApp();
  },
  'reset-layout': () => {
    state.layout = { ...DEFAULT_LAYOUT };
    saveLayoutPrefs(state.layout);
    renderApp();
  },
  'switch-to-workbench': () => showMobileTab('workbench'),
  'switch-to-lesson': () => showMobileTab('lesson'),

  'retry-track-load': () => {
    clearTrackLoadError();
    renderApp();
  },
  'retry-view-load': () => {
    clearViewLoadError();
    renderApp();
  },
  'retry-dataset': () => {
    state.datasetError = null;
    renderApp();
    void bootstrapData();
  },

  'reset-explorer-filters': () => {
    state.explorerCidade = 'todas';
    state.explorerCategoria = 'todas';
    renderApp();
  },
  'clear-ref-search': () => {
    state.refQuery = '';
    state.refCategory = 'Todas';
    renderApp();
  },

  'open-gantt-view': () => {
    saveLessonTimes(state.lessonTimes);
    state.showProgressModal = false;
    state.showGuideModal = false;
    state.view = 'cronograma';
    renderApp();
  },
  'gantt-expand-all': () => {
    state.ganttCollapsedTracks.clear();
    renderApp();
  },
  'gantt-collapse-all': () => {
    state.ganttCollapsedTracks = new Set(TRACK_INDEX.map((t) => t.id));
    renderApp();
  },

  'open-guide-modal': () => {
    state.showProgressModal = false;
    state.showDiagnosticModal = false;
    state.showGuideModal = true;
    renderApp();
  },
  'close-guide-modal': closeGuideModal,
  'close-guide-backdrop': onBackdrop(closeGuideModal),

  'toggle-lesson-timer': () => {
    state.timerPaused = !state.timerPaused;
    saveLessonTimes(state.lessonTimes);
    scheduleCloudSync();
    renderApp();
  },
};
