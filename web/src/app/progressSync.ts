// Gravar progresso (local e na nuvem) e concluir etapas.

import { savePractice, saveProgress } from '../data/progress';
import type { Lesson } from '../data/types';
import { createCloudSyncController } from '../ui/cloudSyncController';
import { etapaProjetoCompleta } from '../ui/projectPanel';
import { linkDoProjeto, locateLesson } from './lessonContext';
import { renderApp } from './rerender';
import { state } from './store';

let pendingCloudRender = false;

export const cloudSync = createCloudSyncController({
  state,
  locateLesson,
  renderApp: () => {
    // Redesenhar enquanto o aluno escreve tirava-lhe o cursor: espera pelo blur do editor.
    if (document.activeElement?.id === 'workbench-editor') {
      pendingCloudRender = true;
      return;
    }
    renderApp();
  },
});

export const buildCloudSyncPayload = cloudSync.buildPayload;
export const applyRemoteCloudSync = cloudSync.applyRemote;
export const scheduleCloudSync = cloudSync.scheduleSync;

/** Devolve true (uma só vez) se chegou progresso da nuvem enquanto o editor tinha o foco. */
export function takePendingCloudRender(): boolean {
  const pending = pendingCloudRender;
  pendingCloudRender = false;
  return pending;
}

export function savePracticeDone(): void {
  savePractice(state.practiceDone);
  scheduleCloudSync();
}

export function markLessonCompleted(lesson: Lesson): void {
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
export function concluirEtapaProjeto(lesson: Lesson): boolean {
  if (state.completedLessons[lesson.id]) return false;
  if (!etapaProjetoCompleta(lesson, state.practiceDone, linkDoProjeto(lesson))) return false;
  markLessonCompleted(lesson);
  return true;
}
