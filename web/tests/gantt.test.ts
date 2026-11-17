import { describe, expect, it } from 'vitest';
import { allTracks } from '../src/data/curriculum';
import type { UserProgressMap } from '../src/data/progress';
import { getLessonMinutes, getTrackBufferMinutes } from '../src/data/studyPlan';
import { buildGanttModel, renderGanttHtml } from '../src/ui/ganttView';

describe('cronograma Gantt por tema e etapa', () => {
  it('encadeia temas (c/ buffer por etapa e por tema) de forma contínua', () => {
    const model = buildGanttModel(allTracks, {}, 360);
    expect(model.groups).toHaveLength(allTracks.length);
    expect(model.totalLessons).toBe(79);
    expect(model.completedLessonsCount).toBe(0);
    expect(model.completedCourseMinutes).toBe(0);
    expect(model.progressTimePct).toBe(0);
    expect(model.totalBufferMinutes).toBeGreaterThan(0);

    let cursor = 0;
    for (const g of model.groups) {
      expect(g.startMin).toBe(cursor);
      for (const node of g.lessons) {
        expect(node.startMin).toBe(cursor);
        expect(node.endMin - node.startMin).toBe(getLessonMinutes(node.lesson));
        expect(node.minutes).toBe(node.baseMinutes + node.bufferMinutes);
        expect(node.widthPct).toBeGreaterThan(0);
        cursor = node.endMin;
      }
      cursor += getTrackBufferMinutes(g.track);
      expect(g.endMin).toBe(cursor);
    }
    expect(cursor).toBe(model.totalCourseMinutes);
    expect(model.months.reduce((s, m) => s + m.weekSpan, 0)).toBe(model.totalWeeks);
  });

  it('pondera o progresso pelo tempo previsto (c/ margem) e enche a barra com tempo real', () => {
    const progress: UserProgressMap = {
      'py-00-pensamento': { status: 'autonomous', completedAt: '2026-11-17' }, // 15 + 5 = 20 min
      'py-01-sintaxe': { status: 'helped', completedAt: '2026-11-17' }, // 25 + 5 = 30 min
      'pf-02-pergunta-dados': { status: 'autonomous', completedAt: '2026-11-17' }, // 90 + 20 = 110 min
    };
    const lessonTimes = {
      'py-00-pensamento': 12 * 60, // 12 min reais (adiantado face a 15+5)
      'py-02-variaveis': 15 * 60, // 15 min em curso na barra de 25+5=30 min -> 50% cheia
    };
    const model = buildGanttModel(allTracks, progress, 360, lessonTimes);
    expect(model.completedLessonsCount).toBe(3);
    expect(model.completedCourseMinutes).toBe(20 + 30 + 110);
    expect(model.totalActualMinutes).toBe(27);
    expect(model.overallPace.zone).toBe('ahead');

    const py = model.groups[0];
    expect(py.doneCount).toBe(2);
    expect(py.lessons[0].status).toBe('autonomous');
    expect(py.lessons[0].fillPct).toBe(100);
    expect(py.lessons[0].pace.zone).toBe('ahead');
    expect(py.lessons[1].status).toBe('helped');
    expect(py.lessons[2].status).toBe('todo');
    expect(py.lessons[2].fillPct).toBe(50);

    const pf = model.groups.find((g) => g.track.id === 'projeto-final')!;
    const pergunta = pf.lessons.find((n) => n.lesson.id === 'pf-02-pergunta-dados')!;
    expect(pergunta.status).toBe('projeto');
  });

  it('ajusta o número de semanas quando muda o ritmo semanal', () => {
    const lento = buildGanttModel(allTracks, {}, 240);
    const rapido = buildGanttModel(allTracks, {}, 600);
    expect(lento.totalWeeks).toBeGreaterThan(rapido.totalWeeks);
    expect(lento.totalCourseMinutes).toBe(rapido.totalCourseMinutes);
  });

  it('renderiza todos os temas, aplica filtros e permite recolher temas', () => {
    const progress: UserProgressMap = {
      'py-00-pensamento': { status: 'autonomous', completedAt: '2026-11-17' },
    };
    const completo = renderGanttHtml(allTracks, progress, {
      paceMinutesPerWeek: 300,
      filterStatus: 'all',
      collapsedTracks: new Set(['sql']),
      currentLessonId: 'py-00-pensamento',
    });
    expect(completo).toContain('Progresso por Tema e por Etapa');
    expect(completo).toContain('1. Python');
    expect(completo).toContain('8. Projeto final');
    expect(completo).toContain('data-gantt-jump-lesson="py-00-pensamento"');
    // A trilha SQL está recolhida, por isso as suas etapas não são desenhadas
    expect(completo).not.toContain('data-gantt-jump-lesson="sql-01-select"');

    const soConcluidas = renderGanttHtml(allTracks, progress, {
      paceMinutesPerWeek: 300,
      filterStatus: 'done',
      collapsedTracks: new Set(),
      currentLessonId: 'py-00-pensamento',
    });
    expect(soConcluidas).toContain('data-gantt-jump-lesson="py-00-pensamento"');
    expect(soConcluidas).not.toContain('data-gantt-jump-lesson="sql-01-select"');
  });
});
