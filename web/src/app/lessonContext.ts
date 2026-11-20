// Trilha, etapa e desafio ativos, e o código que o editor deve mostrar.

import { TRACK_INDEX, type LessonIndexEntry, type TrackIndexEntry } from '../data/trackIndex';
import { getCachedTrack } from '../data/trackLoaders';
import type { EngineKind, GitChallengeSpec, Lesson, PythonChallengeSpec, SqlChallengeSpec, Track } from '../data/types';
import type { WorkbenchTab } from '../ui/appState';
import { state } from './store';

export interface LessonLocation {
  trackId: string;
  lessonId: string;
}

/** Chave onde fica guardada a resposta à pergunta n (0 = a pergunta principal, que conta para o progresso). */
export function quizKey(lessonId: string, n: number): string {
  return n === 0 ? lessonId : `${lessonId}#${n + 1}`;
}

export function currentTrackMeta(): TrackIndexEntry {
  return TRACK_INDEX.find((t) => t.id === state.trackId) ?? TRACK_INDEX[0];
}

export function currentLessonMeta(): LessonIndexEntry {
  const tr = currentTrackMeta();
  return tr.lessons.find((l) => l.id === state.lessonId) ?? tr.lessons[0];
}

export function currentTrackOrNull(): Track | null {
  return getCachedTrack(currentTrackMeta().id) ?? null;
}

export function currentTrack(): Track {
  const tr = currentTrackOrNull();
  if (!tr) throw new Error(`Trilha "${state.trackId}" ainda a carregar.`);
  return tr;
}

export function currentLesson(): Lesson {
  const track = currentTrack();
  return track.lessons.find((l) => l.id === state.lessonId) ?? track.lessons[0];
}

/** Desafio Python ativo na bancada: o principal ou um dos treinos. */
export function activePythonChallenge(lesson: Lesson): PythonChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practice?.[state.practiceIdx - 1] ?? lesson.pythonChallenge;
  return lesson.pythonChallenge;
}

/** Desafio SQL ativo na bancada: o principal ou um dos treinos. */
export function activeSqlChallenge(lesson: Lesson): SqlChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practiceSql?.[state.practiceIdx - 1] ?? lesson.sqlChallenge;
  return lesson.sqlChallenge;
}

/** Desafio Git ativo na bancada: o principal ou um dos treinos. */
export function activeGitChallenge(lesson: Lesson): GitChallengeSpec | undefined {
  if (state.practiceIdx > 0) return lesson.practiceGit?.[state.practiceIdx - 1] ?? lesson.gitChallenge;
  return lesson.gitChallenge;
}

export function draftKey(lesson: Lesson, tab: WorkbenchTab): string {
  if (tab === 'challenge' && state.practiceIdx > 0) return `${lesson.id}:treino${state.practiceIdx}`;
  return `${lesson.id}:${tab}`;
}

/**
 * Rascunho onde fica o link do GitHub de uma etapa de projeto. É o draftKey(lesson, 'challenge')
 * sem treino (as etapas de projeto não têm treinos), a mesma chave que o portefólio lê.
 */
export function chaveLinkProjeto(lesson: Lesson): string {
  return `${lesson.id}:challenge`;
}

export function linkDoProjeto(lesson: Lesson): string {
  return state.editorDrafts[chaveLinkProjeto(lesson)] ?? '';
}

export function defaultEditorCode(lesson: Lesson, tab: WorkbenchTab): string {
  if (tab === 'sqlfree') {
    return `SELECT produto, SUM(quantidade) AS unidades, ROUND(SUM(quantidade * preco), 2) AS faturacao_eur\nFROM vendas\nGROUP BY produto\nORDER BY faturacao_eur DESC\nLIMIT 5;`;
  }
  if (tab === 'example') {
    return lesson.exampleCode;
  }
  const py = activePythonChallenge(lesson);
  if (py) return py.starterCode;
  const sq = activeSqlChallenge(lesson);
  if (sq) return sq.starterSql;
  const gc = activeGitChallenge(lesson);
  if (gc) return gc.starterCommands;
  return lesson.exampleCode;
}

export function getEditorValue(): string {
  const lesson = currentLesson();
  const key = draftKey(lesson, state.wbTab);
  return state.editorDrafts[key] ?? defaultEditorCode(lesson, state.wbTab);
}

export function activeEngine(): EngineKind {
  if (state.wbTab === 'sqlfree') return 'sql';
  return currentLessonMeta().engine;
}

/**
 * Encontra a trilha certa para uma etapa. Se a etapa mudou de trilha (ex.: quando a trilha 5
 * foi dividida), segue a etapa; se não existir, abre a primeira etapa da trilha pedida.
 */
export function locateLesson(
  trackId: string | null | undefined,
  lessonId: string | null | undefined,
): LessonLocation | null {
  const pedida = TRACK_INDEX.find((t) => t.id === trackId);
  if (lessonId) {
    const dona = pedida?.lessons.some((l) => l.id === lessonId)
      ? pedida
      : TRACK_INDEX.find((t) => t.lessons.some((l) => l.id === lessonId));
    if (dona) return { trackId: dona.id, lessonId };
  }
  return pedida ? { trackId: pedida.id, lessonId: pedida.lessons[0].id } : null;
}

/** Etapa seguinte à atual (passa para a trilha seguinte no fim de uma trilha), ou null no fim do curso. */
export function nextLessonLocation(): LessonLocation | null {
  const track = currentTrackOrNull();
  if (!track) return null;
  const lesson = currentLesson();
  const idx = track.lessons.findIndex((l) => l.id === lesson.id);
  const trIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
  if (idx < track.lessons.length - 1) return { trackId: track.id, lessonId: track.lessons[idx + 1].id };
  if (trIdx >= 0 && trIdx < TRACK_INDEX.length - 1) {
    return { trackId: TRACK_INDEX[trIdx + 1].id, lessonId: TRACK_INDEX[trIdx + 1].lessons[0].id };
  }
  return null;
}

/** Ao mudar de etapa: volta ao desafio principal, sem resultado, pistas nem pedido de solução. */
export function resetWorkbenchForNewLesson(): void {
  state.wbTab = 'challenge';
  state.practiceIdx = 0;
  state.output = { kind: 'empty' };
  state.confirmSolutionLessonId = null;
  state.hintLevel = 0;
}
