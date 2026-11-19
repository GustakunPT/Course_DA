import { loadSavedDiagnostic, saveDiagnostic, type DiagnosticProfile } from '../data/diagnostic';
import {
  extractSyncCode,
  loadSavedDrafts,
  loadSavedPractice,
  loadSavedProgress,
  loadSavedQuizzes,
  loadSyncCode,
  mergeLessonTimes,
  mergeProgressRecords,
  pullCloudSync,
  pushCloudSync,
  saveDrafts,
  saveLastLocation,
  savePractice,
  saveProgress,
  saveQuizzes,
  saveSyncCode,
  type CloudSyncPayload,
} from '../data/progress';
import { loadSavedLessonTimes, saveLessonTimes } from '../data/timeTracker';
import type { AppState } from './appState';

export function mergeDiagnosticProfiles(
  local: DiagnosticProfile | null,
  remote: DiagnosticProfile | null,
): DiagnosticProfile | null {
  if (!remote) return local;
  if (!local) return remote;
  return Date.parse(remote.updatedAt) >= Date.parse(local.updatedAt) ? remote : local;
}

export interface CloudSyncDeps {
  state: AppState;
  locateLesson: (
    trackId: string | null | undefined,
    lessonId: string | null | undefined,
  ) => { trackId: string; lessonId: string } | null;
  renderApp: () => void;
}

export function createCloudSyncController({ state, locateLesson, renderApp }: CloudSyncDeps) {
  let cloudSyncTimer: number | undefined;

  function buildPayload(code?: string | null) {
    return {
      ...(code !== undefined ? { code } : {}),
      progress: state.completedLessons,
      drafts: state.editorDrafts,
      quizzes: state.quizSelection,
      practice: [...state.practiceDone],
      lessonTimes: state.lessonTimes,
      diagnostic: state.diagnostic,
      lastLocation: {
        trackId: state.trackId,
        lessonId: state.lessonId,
        view: state.view,
        timestamp: new Date().toISOString(),
      },
    };
  }

  function applyRemote(remote: CloudSyncPayload): void {
    state.completedLessons = mergeProgressRecords(state.completedLessons, remote.progress);
    state.editorDrafts = { ...remote.drafts, ...state.editorDrafts };
    state.quizSelection = { ...remote.quizzes, ...state.quizSelection };
    state.practiceDone = new Set([...state.practiceDone, ...remote.practice]);
    state.lessonTimes = mergeLessonTimes(state.lessonTimes, remote.lessonTimes);
    const mergedDiag = mergeDiagnosticProfiles(state.diagnostic, remote.diagnostic);
    if (mergedDiag) {
      state.diagnostic = mergedDiag;
      state.diagnosticDraft = mergedDiag;
      state.ganttPaceMinutes = mergedDiag.hoursPerWeek * 60;
      saveDiagnostic(mergedDiag);
    }
    savePractice(state.practiceDone);
    saveProgress(state.completedLessons);
    saveDrafts(state.editorDrafts, true);
    saveQuizzes(state.quizSelection);
    saveLessonTimes(state.lessonTimes);
    saveSyncCode(remote.code);
    state.syncCode = remote.code;
    state.syncStatus = 'synced';
    state.syncLastUpdatedAt = remote.updatedAt;
  }

  function scheduleSync(): void {
    if (!state.syncCode) return;
    if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
    state.syncStatus = 'syncing';
    cloudSyncTimer = window.setTimeout(() => {
      if (!state.syncCode) return;
      void pushCloudSync(buildPayload(state.syncCode))
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

  async function bootstrap(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('sync');
    const normalizedUrlCode = urlCode ? extractSyncCode(urlCode) : null;
    const targetCode = normalizedUrlCode ?? state.syncCode;
    if (!targetCode) return;

    try {
      const remote = await pullCloudSync(targetCode);
      applyRemote(remote);

      if (normalizedUrlCode && remote.lastLocation) {
        const loc = locateLesson(remote.lastLocation.trackId, remote.lastLocation.lessonId);
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

  /** Mantém dois separadores abertos no mesmo browser sincronizados quando localStorage muda. */
  function attachCrossTabStorageSync(): void {
    window.addEventListener('storage', (ev) => {
      if (!ev.key || !ev.key.startsWith('mercearia')) return;
      state.completedLessons = mergeProgressRecords(state.completedLessons, loadSavedProgress());
      state.editorDrafts = { ...loadSavedDrafts(), ...state.editorDrafts };
      state.quizSelection = { ...loadSavedQuizzes(), ...state.quizSelection };
      state.practiceDone = new Set([...state.practiceDone, ...loadSavedPractice()]);
      state.lessonTimes = mergeLessonTimes(state.lessonTimes, loadSavedLessonTimes());
      const nextDiag = mergeDiagnosticProfiles(state.diagnostic, loadSavedDiagnostic());
      if (nextDiag) {
        state.diagnostic = nextDiag;
        state.diagnosticDraft = nextDiag;
        state.ganttPaceMinutes = nextDiag.hoursPerWeek * 60;
      }
      state.syncCode = loadSyncCode();
      renderApp();
    });
  }

  return {
    buildPayload,
    applyRemote,
    scheduleSync,
    bootstrap,
    attachCrossTabStorageSync,
  };
}
