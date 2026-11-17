export type LessonTimeMap = Record<string, number>;

const STORAGE_TIME_KEY = 'mercearia_tempo_etapas_v1';

export function sanitizeLessonTimes(raw: unknown): LessonTimeMap {
  if (!raw || typeof raw !== 'object') return {};
  const clean: LessonTimeMap = {};
  for (const [id, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
      clean[id] = Math.min(360_000, Math.floor(val));
    }
  }
  return clean;
}

export function loadSavedLessonTimes(): LessonTimeMap {
  try {
    const raw = localStorage.getItem(STORAGE_TIME_KEY);
    return raw ? sanitizeLessonTimes(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function saveLessonTimes(times: LessonTimeMap): void {
  try {
    localStorage.setItem(STORAGE_TIME_KEY, JSON.stringify(times));
  } catch {
    // Ignorar erros de quota
  }
}

export function clearSavedLessonTimes(): void {
  try {
    localStorage.removeItem(STORAGE_TIME_KEY);
  } catch {
    // Ignorar
  }
}

/** Formata segundos em mm:ss ou h:mm:ss para o cronómetro discreto da etapa. */
export function formatTimerClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

export type PaceComparisonZone = 'ahead' | 'buffer' | 'over' | 'none';

export interface PaceComparison {
  zone: PaceComparisonZone;
  deltaMinutes: number;
  label: string;
}

/** Compara os minutos reais com o tempo base e a margem (base + buffer). */
export function compareActualVsProjected(
  actualMinutes: number,
  baseMinutes: number,
  projectedMinutes: number,
): PaceComparison {
  if (actualMinutes <= 0) {
    return { zone: 'none', deltaMinutes: 0, label: 'Sem tempo registado' };
  }
  const roundedActual = Math.round(actualMinutes);
  const deltaBase = roundedActual - Math.round(baseMinutes);
  const deltaProj = roundedActual - Math.round(projectedMinutes);

  if (actualMinutes <= baseMinutes) {
    return {
      zone: 'ahead',
      deltaMinutes: deltaBase,
      label: deltaBase === 0 ? 'No tempo base' : `${deltaBase} min vs base`,
    };
  }
  if (actualMinutes <= projectedMinutes) {
    return {
      zone: 'buffer',
      deltaMinutes: deltaBase,
      label: `Na margem (+${deltaBase} min)`,
    };
  }
  return {
    zone: 'over',
    deltaMinutes: deltaProj,
    label: `+${deltaProj} min acima da margem`,
  };
}
