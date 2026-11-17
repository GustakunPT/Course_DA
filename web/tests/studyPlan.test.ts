import { describe, expect, it } from 'vitest';
import { allTracks } from '../src/data/curriculum';
import {
  formatHoursApproxPt,
  formatMinutesPt,
  getCourseMinutes,
  getLessonBaseMinutes,
  getLessonBufferMinutes,
  getLessonMinutes,
  getTrackBufferMinutes,
  getTrackMinutes,
  getTrackMinutesBreakdown,
  STUDY_PLAN_WEEKS,
} from '../src/data/studyPlan';
import { compareActualVsProjected, formatTimerClock, sanitizeLessonTimes } from '../src/data/timeTracker';

describe('plano de estudo e tempos estimados', () => {
  it('todas as etapas têm tempo base + margem (buffer) positivo e coerente', () => {
    for (const tr of allTracks) {
      for (const l of tr.lessons) {
        const base = getLessonBaseMinutes(l);
        const buf = getLessonBufferMinutes(l);
        const mins = getLessonMinutes(l);
        expect(base, l.id).toBeGreaterThanOrEqual(15);
        expect(buf, l.id).toBeGreaterThanOrEqual(5);
        expect(mins, l.id).toBe(base + buf);
        expect(mins, l.id).toBeLessThanOrEqual(180);
      }
      const b = getTrackMinutesBreakdown(tr);
      expect(b.themeBufferMinutes).toBe(getTrackBufferMinutes(tr));
      expect(b.totalMinutes).toBe(b.baseMinutes + b.lessonBufferMinutes + b.themeBufferMinutes);
      expect(getTrackMinutes(tr)).toBe(b.totalMinutes);
    }
  });

  it('o plano de 10 semanas cobre todas as 8 trilhas sem repetições', () => {
    const cobertas = STUDY_PLAN_WEEKS.flatMap((b) => b.trackIds);
    expect(new Set(cobertas).size).toBe(cobertas.length);
    expect(new Set(cobertas)).toEqual(new Set(allTracks.map((t) => t.id)));
  });

  it('o curso inteiro c/ buffers encaixa num plano de ~55 a 68 horas (10 sem. a ~6 h/sem)', () => {
    const totalHoras = getCourseMinutes(allTracks) / 60;
    expect(totalHoras).toBeGreaterThanOrEqual(50);
    expect(totalHoras).toBeLessThanOrEqual(75);
  });

  it('formata relógio do tracker e compara tempo real vs projetado', () => {
    expect(formatTimerClock(0)).toBe('00:00');
    expect(formatTimerClock(125)).toBe('02:05');
    expect(formatTimerClock(3665)).toBe('1:01:05');
    expect(compareActualVsProjected(0, 25, 30).zone).toBe('none');
    expect(compareActualVsProjected(18, 25, 30).zone).toBe('ahead');
    expect(compareActualVsProjected(28, 25, 30).zone).toBe('buffer');
    expect(compareActualVsProjected(38, 25, 30).zone).toBe('over');
    expect(sanitizeLessonTimes({ a: 120.7, b: -5, c: 'x' })).toEqual({ a: 120 });
  });

  it('formata minutos e horas em português', () => {
    expect(formatMinutesPt(0)).toBe('0 min');
    expect(formatMinutesPt(25)).toBe('25 min');
    expect(formatMinutesPt(60)).toBe('1 h');
    expect(formatMinutesPt(150)).toBe('2 h 30 min');
    expect(formatHoursApproxPt(300)).toBe('~5 h');
    expect(formatHoursApproxPt(270)).toBe('~4,5 h');
  });
});
