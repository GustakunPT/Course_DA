// Mudar de trilha, etapa, vista, treino e separador; cronograma; painéis.

import { saveLessonTimes } from '../../data/timeTracker';
import { TRACK_INDEX } from '../../data/trackIndex';
import type { ViewMode, WorkbenchTab } from '../../ui/appState';
import type { GanttFilterStatus } from '../../ui/ganttView';
import { saveLayoutPrefs } from '../../ui/layout';
import { handleTablistArrowKeys } from '../../ui/modalFocus';
import { attachSplitterListeners } from '../../ui/splitters';
import { locateLesson, resetWorkbenchForNewLesson } from '../lessonContext';
import { renderApp } from '../rerender';
import { state } from '../store';

/** Liga um clique a todos os elementos que têm o atributo data-* indicado. */
function onClick(selector: string, handler: (btn: HTMLElement) => void): void {
  document.querySelectorAll<HTMLElement>(selector).forEach((btn) => {
    btn.addEventListener('click', () => handler(btn));
  });
}

function renderAndScrollTop(): void {
  renderApp();
  window.scrollTo({ top: 0 });
}

const LAYOUT_PRESET_RATIOS: Record<string, number> = { reading: 62, coding: 36 };
const BALANCED_RATIO = 48;

export function attachNavigationListeners(): void {
  onClick('[data-mobile-tab]', (btn) => {
    state.mobileTab = btn.dataset.mobileTab === 'workbench' ? 'workbench' : 'lesson';
    renderAndScrollTop();
  });

  onClick('[data-select-track]', (btn) => {
    const tr = TRACK_INDEX.find((t) => t.id === btn.dataset.selectTrack);
    if (!tr) return;
    state.view = 'academia';
    state.trackId = tr.id;
    if (!tr.lessons.some((l) => l.id === state.lessonId)) {
      state.lessonId = tr.lessons[0].id;
    }
    state.mobileTab = 'lesson';
    state.sidebarOpenMobile = false;
    resetWorkbenchForNewLesson();
    renderAndScrollTop();
  });

  onClick('[data-select-view]', (btn) => {
    state.view = btn.dataset.selectView as ViewMode;
    renderApp();
  });

  onClick('[data-select-lesson]', (btn) => {
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
    state.sidebarOpenMobile = false;
    resetWorkbenchForNewLesson();
    renderAndScrollTop();
  });

  onClick('[data-practice-idx]', (btn) => {
    state.practiceIdx = Number(btn.dataset.practiceIdx) || 0;
    state.output = { kind: 'empty' };
    state.confirmSolutionLessonId = null;
    state.hintLevel = 0;
    renderApp();
  });

  onClick('[data-wb-tab]', (btn) => {
    state.wbTab = btn.dataset.wbTab as WorkbenchTab;
    state.output = { kind: 'empty' };
    state.confirmSolutionLessonId = null;
    renderApp();
  });

  // Cronograma
  onClick('[data-gantt-pace]', (btn) => {
    const mins = Number(btn.dataset.ganttPace);
    if (Number.isFinite(mins) && mins > 0) {
      state.ganttPaceMinutes = mins;
      renderApp();
    }
  });
  onClick('[data-gantt-filter]', (btn) => {
    const f = btn.dataset.ganttFilter as GanttFilterStatus;
    if (f === 'all' || f === 'todo' || f === 'done') {
      state.ganttFilterStatus = f;
      renderApp();
    }
  });
  onClick('[data-gantt-toggle-track]', (btn) => {
    const tid = btn.dataset.ganttToggleTrack;
    if (!tid) return;
    if (state.ganttCollapsedTracks.has(tid)) state.ganttCollapsedTracks.delete(tid);
    else state.ganttCollapsedTracks.add(tid);
    renderApp();
  });
  onClick('[data-gantt-jump-lesson]', (btn) => {
    const loc = locateLesson(btn.dataset.ganttJumpTrack ?? null, btn.dataset.ganttJumpLesson ?? null);
    if (!loc) return;
    state.trackId = loc.trackId;
    state.lessonId = loc.lessonId;
    state.view = 'academia';
    state.mobileTab = 'lesson';
    resetWorkbenchForNewLesson();
    renderAndScrollTop();
  });

  // Revisão espaçada (modal de progresso): abrir a etapa a rever.
  onClick('[data-review-go-track][data-review-go-lesson]', (btn) => {
    const loc = locateLesson(btn.dataset.reviewGoTrack, btn.dataset.reviewGoLesson);
    if (!loc) return;
    saveLessonTimes(state.lessonTimes);
    state.trackId = loc.trackId;
    state.lessonId = loc.lessonId;
    state.view = 'academia';
    state.mobileTab = 'lesson';
    state.wbTab = 'challenge';
    state.practiceIdx = 0;
    state.output = { kind: 'empty' };
    state.showProgressModal = false;
    renderAndScrollTop();
  });

  document.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((tablist) => {
    tablist.addEventListener('keydown', (ev) => handleTablistArrowKeys(tablist, ev));
  });

  onClick('[data-layout-preset]', (btn) => {
    state.layout.lessonRatio = LAYOUT_PRESET_RATIOS[btn.dataset.layoutPreset ?? ''] ?? BALANCED_RATIO;
    saveLayoutPrefs(state.layout);
    renderApp();
  });

  attachSplitterListeners(state, renderApp);
}
