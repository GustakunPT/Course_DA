import { describe, expect, it } from 'vitest';
import { TRACK_INDEX } from '../src/data/trackIndex';
import { buildSpacedReviewSummary, markLessonReviewedRecord } from '../src/data/spacedReview';
import { buildStudyTimeReport } from '../src/data/studyStats';
import { evaluatePlacementAnswers, PLACEMENT_QUESTIONS } from '../src/data/placementQuiz';
import { handleTablistArrowKeys } from '../src/ui/modalFocus';

describe('revisão espaçada (spacedReview)', () => {
  const now = Date.parse('2026-11-20T12:00:00Z');

  it('coloca etapas vencidas na fila de hoje e prioriza quizzes errados e etapas c/ apoio', () => {
    const progress = {
      'py-01-sintaxe': { status: 'autonomous' as const, completedAt: '2026-11-18T10:00:00Z' }, // 2d -> vence (1d)
      'py-02-variaveis': { status: 'helped' as const, completedAt: '2026-11-19T10:00:00Z' }, // 1d -> vence (1d c/ apoio)
      'py-03-strings-conversoes': {
        status: 'autonomous' as const,
        completedAt: '2026-11-10T10:00:00Z',
        reviewCount: 2,
        lastReviewedAt: '2026-11-18T10:00:00Z', // intervalo 7d -> faltam 5d -> consolidada
      },
      'sql-01-select': {
        status: 'autonomous' as const,
        completedAt: '2026-11-20T10:00:00Z', // hoje mas quiz errado -> prioridade máxima
      },
    };
    const sqlQuizWrong = (TRACK_INDEX[1].lessons[0].quiz.correctIndex + 1) % 4;
    const summary = buildSpacedReviewSummary(TRACK_INDEX, progress, { 'sql-01-select': sqlQuizWrong }, now);

    expect(summary.totalTracked).toBe(4);
    expect(summary.dueNow.map((x) => x.lessonId)).toEqual(['sql-01-select', 'py-02-variaveis', 'py-01-sintaxe']);
    expect(summary.dueNow[0].reason).toContain('Quiz ainda incorreto');
    expect(summary.consolidatedCount).toBe(1);
  });

  it('markLessonReviewedRecord avança reviewCount e retira a etapa da fila de hoje', () => {
    const base = { status: 'autonomous' as const, completedAt: '2026-11-10T10:00:00Z' };
    const updated = markLessonReviewedRecord(base, '2026-11-20T11:00:00Z');
    expect(updated.reviewCount).toBe(1);
    expect(updated.lastReviewedAt).toBe('2026-11-20T11:00:00Z');

    const summary = buildSpacedReviewSummary(TRACK_INDEX, { 'py-01-sintaxe': updated }, {}, now);
    expect(summary.dueNow).toHaveLength(0);
    expect(summary.upcoming.map((x) => x.lessonId)).toEqual(['py-01-sintaxe']);
  });
});

describe('estatísticas de tempo útil (studyStats)', () => {
  it('identifica etapas acima da margem previstas ordenadas por maior desvio', () => {
    const progress = {
      'py-01-sintaxe': { status: 'autonomous' as const, completedAt: '2026-11-18T10:00:00Z' },
      'sql-04-groupby': { status: 'helped' as const, completedAt: '2026-11-19T10:00:00Z' },
    };
    const times = {
      'py-01-sintaxe': 12 * 60, // rápido
      'sql-04-groupby': 90 * 60, // muito acima do previsto
      'pd-01-dataframes': 75 * 60, // em curso e acima do previsto
    };
    const report = buildStudyTimeReport(TRACK_INDEX, progress, times);
    expect(report.trackedLessonsCount).toBe(3);
    expect(report.hasOverBudget).toBe(true);
    expect(report.overBudgetCount).toBe(2);
    expect(report.topTimeDrains[0].lessonId).toBe('sql-04-groupby');
    expect(report.fastestCompleted[0].lessonId).toBe('py-01-sintaxe');
  });
});

describe('nivelamento prático (placementQuiz)', () => {
  it('tem 4 perguntas válidas e recomenda pontos de arranque coerentes', () => {
    expect(PLACEMENT_QUESTIONS).toHaveLength(4);
    const allRight = Object.fromEntries(PLACEMENT_QUESTIONS.map((q) => [q.id, q.correctIndex]));
    const r4 = evaluatePlacementAnswers(allRight);
    expect(r4.complete).toBe(true);
    expect(r4.score).toBe(4);
    expect(r4.suggestedBackground).toBe('tech');
    expect(r4.suggestedTrackId).toBe('bi');

    const rZero = evaluatePlacementAnswers({ negocio: 0, sql: 0, python: 0, estatistica: 0 });
    expect(rZero.score).toBe(0);
    expect(rZero.suggestedBackground).toBe('zero');
    expect(rZero.suggestedLessonId).toBe('py-00-pensamento');

    const rSqlPython = evaluatePlacementAnswers({
      negocio: PLACEMENT_QUESTIONS[0].correctIndex,
      sql: PLACEMENT_QUESTIONS[1].correctIndex,
      python: PLACEMENT_QUESTIONS[2].correctIndex,
      estatistica: 0,
    });
    expect(rSqlPython.score).toBe(3);
    expect(rSqlPython.suggestedTrackId).toBe('pandas');
    expect(rSqlPython.suggestedLessonId).toBe('pd-01-dataframes');
  });
});

describe('navegação por setas em role="tablist"', () => {
  it('move foco e ativa o separador seguinte/anterior em ciclo', () => {
    const clicked: string[] = [];
    const focused: string[] = [];
    const mkTab = (id: string) =>
      ({
        id,
        focus: () => focused.push(id),
        click: () => clicked.push(id),
      }) as unknown as HTMLElement;
    const tabs = [mkTab('t1'), mkTab('t2'), mkTab('t3')];
    const tablist = {
      querySelectorAll: () => tabs,
    } as unknown as HTMLElement;

    let prevented = false;
    const evRight = {
      key: 'ArrowRight',
      target: tabs[2],
      preventDefault: () => {
        prevented = true;
      },
    } as unknown as KeyboardEvent;
    expect(handleTablistArrowKeys(tablist, evRight)).toBe(true);
    expect(prevented).toBe(true);
    expect(focused).toEqual(['t1']);
    expect(clicked).toEqual(['t1']);
  });
});
