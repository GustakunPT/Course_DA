import { describe, expect, it } from 'vitest';
import {
  evaluateDiagnosticPlan,
  FOUR_PILLARS,
  sanitizeDiagnostic,
  THREE_RISKS,
} from '../src/data/diagnostic';

describe('diagnóstico inicial e plano personalizado', () => {
  it('tem os 4 pilares essenciais e os 3 riscos a evitar', () => {
    expect(FOUR_PILLARS).toHaveLength(4);
    expect(THREE_RISKS).toHaveLength(3);
  });

  it('avalia corretamente meta confortável vs meta apertada face às horas/semana', () => {
    const confortavel = evaluateDiagnosticPlan(
      { background: 'zero', hoursPerWeek: 6, targetMonths: 6, updatedAt: '2026-11-17' },
      3900, // 65 h de curso + 20 h portefólio = 85 h -> 15 sem. <= 26 sem.
    );
    expect(confortavel.fitsTarget).toBe(true);
    expect(confortavel.startLessonId).toBe('py-00-pensamento');

    const apertada = evaluateDiagnosticPlan(
      { background: 'negocio', hoursPerWeek: 4, targetMonths: 3, updatedAt: '2026-11-17' },
      3900, // 85 h / 4 = 22 sem. > 13 sem.
    );
    expect(apertada.fitsTarget).toBe(false);
    expect(apertada.suggestedHoursPerWeek).toBeGreaterThan(4);
  });

  it('sugere arranque acelerado para perfil técnico e valida sanitização', () => {
    const tech = evaluateDiagnosticPlan(
      { background: 'tech', hoursPerWeek: 8, targetMonths: 6, updatedAt: '2026-11-17' },
      3900,
    );
    expect(tech.startTrackId).toBe('pandas');
    expect(sanitizeDiagnostic({ background: 'zero', hoursPerWeek: 6, targetMonths: 6 })).not.toBeNull();
    expect(sanitizeDiagnostic({ background: 'invalid', hoursPerWeek: 6, targetMonths: 6 })).toBeNull();
  });
});
