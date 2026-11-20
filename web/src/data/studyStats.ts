import type { UserProgressMap } from './progress';
import { getLessonBaseMinutes, getLessonMinutes } from './studyPlan';
import type { LessonTimeMap } from './timeTracker';
import type { TrackIndexEntry } from './trackIndex';

export interface LessonTimeStat {
  trackId: string;
  trackShortTitle: string;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  actualMinutes: number;
  baseMinutes: number;
  projectedMinutes: number;
  deltaMinutes: number;
  ratio: number;
  completed: boolean;
}

export interface TrackTimeStat {
  trackId: string;
  shortTitle: string;
  actualMinutes: number;
  projectedMinutes: number;
  doneCount: number;
  totalCount: number;
  ratio: number | null;
}

export interface StudyTimeReport {
  totalActualMinutes: number;
  trackedLessonsCount: number;
  overBudgetCount: number;
  /** Etapas onde o tempo real mais ultrapassou o previsto (ou as mais demoradas se nenhuma ultrapassou). */
  topTimeDrains: LessonTimeStat[];
  /** Etapas concluídas mais rapidamente em relação ao tempo previsto. */
  fastestCompleted: LessonTimeStat[];
  trackBreakdown: TrackTimeStat[];
  hasOverBudget: boolean;
}

export function buildStudyTimeReport(
  tracks: TrackIndexEntry[],
  progress: UserProgressMap,
  lessonTimes: LessonTimeMap,
): StudyTimeReport {
  const allTracked: LessonTimeStat[] = [];
  const trackBreakdown: TrackTimeStat[] = [];
  let totalActualSeconds = 0;

  for (const tr of tracks) {
    let trActualSecs = 0;
    let trProjectedDoneMins = 0;
    let doneCount = 0;

    for (const le of tr.lessons) {
      const secs = Math.max(0, Math.floor(lessonTimes[le.id] ?? 0));
      const completed = Boolean(progress[le.id]);
      if (completed) doneCount++;
      trActualSecs += secs;
      totalActualSeconds += secs;

      const baseMinutes = getLessonBaseMinutes(le);
      const projectedMinutes = getLessonMinutes(le);
      if (completed || secs >= 60) {
        trProjectedDoneMins += projectedMinutes;
      }

      if (secs >= 60) {
        const actualMinutes = Math.round((secs / 60) * 10) / 10;
        const deltaMinutes = Math.round((actualMinutes - projectedMinutes) * 10) / 10;
        const ratio = projectedMinutes > 0 ? Math.round((actualMinutes / projectedMinutes) * 100) / 100 : 1;
        allTracked.push({
          trackId: tr.id,
          trackShortTitle: tr.shortTitle,
          lessonId: le.id,
          lessonCode: le.code,
          lessonTitle: le.title,
          actualMinutes,
          baseMinutes,
          projectedMinutes,
          deltaMinutes,
          ratio,
          completed,
        });
      }
    }

    const actualMinutes = Math.round(trActualSecs / 60);
    trackBreakdown.push({
      trackId: tr.id,
      shortTitle: tr.shortTitle,
      actualMinutes,
      projectedMinutes: trProjectedDoneMins,
      doneCount,
      totalCount: tr.lessons.length,
      ratio:
        trProjectedDoneMins > 0 && actualMinutes > 0
          ? Math.round((actualMinutes / trProjectedDoneMins) * 100) / 100
          : null,
    });
  }

  const overBudget = allTracked
    .filter((x) => x.deltaMinutes > 0)
    .sort((a, b) => b.deltaMinutes - a.deltaMinutes || b.ratio - a.ratio);

  const topTimeDrains = (
    overBudget.length > 0
      ? overBudget
      : [...allTracked].sort((a, b) => b.actualMinutes - a.actualMinutes || b.ratio - a.ratio)
  ).slice(0, 6);

  const fastestCompleted = allTracked
    .filter((x) => x.completed && x.actualMinutes > 0)
    .sort((a, b) => a.ratio - b.ratio || a.actualMinutes - b.actualMinutes)
    .slice(0, 3);

  return {
    totalActualMinutes: Math.round(totalActualSeconds / 60),
    trackedLessonsCount: allTracked.length,
    overBudgetCount: overBudget.length,
    topTimeDrains,
    fastestCompleted,
    trackBreakdown,
    hasOverBudget: overBudget.length > 0,
  };
}
