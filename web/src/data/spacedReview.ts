import type { LessonProgressRecord, UserProgressMap } from './progress';
import type { TrackIndexEntry } from './trackIndex';

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

export interface SpacedReviewItem {
  trackId: string;
  trackShortTitle: string;
  lessonId: string;
  lessonCode: string;
  lessonTitle: string;
  reviewCount: number;
  intervalDays: number;
  daysSinceAnchor: number;
  daysUntilDue: number;
  dueNow: boolean;
  priority: number;
  reason: string;
}

export interface SpacedReviewSummary {
  dueNow: SpacedReviewItem[];
  upcoming: SpacedReviewItem[];
  consolidatedCount: number;
  totalTracked: number;
}

const MS_PER_DAY = 86_400_000;

/**
 * Calcula a fila de revisão espaçada a partir das datas de conclusão (completedAt),
 * revisões anteriores (lastReviewedAt/reviewCount), apoio usado e estado do quiz.
 */
export function buildSpacedReviewSummary(
  tracks: TrackIndexEntry[],
  progress: UserProgressMap,
  quizSelection: Record<string, number> = {},
  nowMs: number = Date.now(),
): SpacedReviewSummary {
  const dueNow: SpacedReviewItem[] = [];
  const upcoming: SpacedReviewItem[] = [];
  let consolidatedCount = 0;
  let totalTracked = 0;

  for (const tr of tracks) {
    for (const le of tr.lessons) {
      if (le.engine === 'projeto') continue;
      const rec = progress[le.id];
      if (!rec) continue;
      totalTracked++;

      const reviewCount = Math.max(0, Math.floor(rec.reviewCount ?? 0));
      const anchorStr = rec.lastReviewedAt || rec.completedAt;
      const anchorMs = Date.parse(anchorStr);
      const safeAnchorMs = Number.isFinite(anchorMs) ? anchorMs : nowMs;
      const daysSinceAnchor = Math.max(0, Math.floor((nowMs - safeAnchorMs) / MS_PER_DAY));

      const baseInterval =
        rec.status === 'helped' && reviewCount === 0
          ? 1
          : REVIEW_INTERVALS_DAYS[Math.min(reviewCount, REVIEW_INTERVALS_DAYS.length - 1)];

      const sel = quizSelection[le.id];
      const quizWrong = sel !== undefined && sel !== le.quiz.correctIndex;

      let daysUntilDue = baseInterval - daysSinceAnchor;
      let reason = `Ciclo de ${baseInterval}d (${daysSinceAnchor}d desde a última prática)`;
      let priority = daysSinceAnchor - baseInterval;

      if (quizWrong) {
        daysUntilDue = Math.min(daysUntilDue, 0);
        reason = 'Quiz ainda incorreto — rever conceito';
        priority += 100;
      } else if (rec.status === 'helped' && reviewCount === 0) {
        reason = 'Resolvida c/ apoio — consolidar sozinho';
        priority += 20;
      }

      const item: SpacedReviewItem = {
        trackId: tr.id,
        trackShortTitle: tr.shortTitle,
        lessonId: le.id,
        lessonCode: le.code,
        lessonTitle: le.title,
        reviewCount,
        intervalDays: baseInterval,
        daysSinceAnchor,
        daysUntilDue,
        dueNow: daysUntilDue <= 0,
        priority,
        reason,
      };

      if (item.dueNow) {
        dueNow.push(item);
      } else if (daysUntilDue <= 3) {
        upcoming.push(item);
      } else {
        consolidatedCount++;
      }
    }
  }

  dueNow.sort((a, b) => b.priority - a.priority || a.lessonId.localeCompare(b.lessonId));
  upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.lessonId.localeCompare(b.lessonId));

  return {
    dueNow,
    upcoming,
    consolidatedCount,
    totalTracked,
  };
}

/** Avança o contador de revisão espaçada de uma etapa para o próximo intervalo. */
export function markLessonReviewedRecord(
  existing: LessonProgressRecord,
  nowIso: string = new Date().toISOString(),
): LessonProgressRecord {
  return {
    ...existing,
    reviewCount: Math.max(0, Math.floor(existing.reviewCount ?? 0)) + 1,
    lastReviewedAt: nowIso,
  };
}
