import type { EngineKind } from './types';

export interface LessonTimingInfo {
  id: string;
  engine: EngineKind;
  estimatedMinutes?: number;
}

export interface TrackTimingInfo {
  lessons: LessonTimingInfo[];
}

const EXPLICIT_MINUTES: Record<string, number> = {
  'py-00-pensamento': 15,
  'py-10-caixa-csv': 40,
  'py-11-revisao': 35,
  'sql-11-revisao': 35,
  'pd-09-revisao': 35,
  'bi-10-pratica-excel-powerbi': 45,
  'bi-20-excel-powerquery-limpeza': 45,
  'bi-21-excel-dinamicas-procx': 45,
  'bi-22-powerbi-dax-relatorio': 50,
  'bi-14-perguntas-entrevista': 35,
  'pro-09-projeto-final': 50,
  'pro-12-desafio-recrutamento': 150,
  'pf-01-limpeza-bicicletas': 50,
  'pf-00-preparar-computador': 30,
  'pf-02-pergunta-dados': 90,
  'pf-03-explorar-limpar': 150,
  'pf-04-analisar-recomendar': 150,
  'pf-05-publicar': 90,
  'pf-08-portfolio-3-projetos': 150,
  'pf-06-cv-linkedin': 60,
  'pf-07-anuncios-entrevista': 60,
};

/** Tempo base estimado (em minutos) sem margem, para leitura, prática e quiz. */
export function getLessonBaseMinutes(lesson: LessonTimingInfo): number {
  if (lesson.estimatedMinutes && lesson.estimatedMinutes > 0) return lesson.estimatedMinutes;
  if (EXPLICIT_MINUTES[lesson.id]) return EXPLICIT_MINUTES[lesson.id];
  if (lesson.engine === 'projeto') return 60;
  if (lesson.id.startsWith('pro-')) return 35;
  if (lesson.id.startsWith('bi-')) return 30;
  if (lesson.id.startsWith('pd-')) return 30;
  if (lesson.id.startsWith('sql-')) return 25;
  if (lesson.id.startsWith('git-')) return 20;
  return 25;
}

/** Margem (buffer) de ~20% por etapa, arredondada a múltiplos de 5 minutos (mínimo 5 min). */
export function getLessonBufferMinutes(lesson: LessonTimingInfo): number {
  const base = getLessonBaseMinutes(lesson);
  return Math.max(5, Math.round((base * 0.2) / 5) * 5);
}

/** Tempo total projetado por etapa (base + margem). */
export function getLessonMinutes(lesson: LessonTimingInfo): number {
  return getLessonBaseMinutes(lesson) + getLessonBufferMinutes(lesson);
}

/** Margem extra de consolidação e revisão no fim de cada tema antes do marco. */
export function getTrackBufferMinutes(track: TrackTimingInfo): number {
  return track.lessons.length <= 6 ? 15 : 30;
}

export interface TrackMinutesBreakdown {
  baseMinutes: number;
  lessonBufferMinutes: number;
  themeBufferMinutes: number;
  totalMinutes: number;
}

export function getTrackMinutesBreakdown(track: TrackTimingInfo): TrackMinutesBreakdown {
  const baseMinutes = track.lessons.reduce((sum, l) => sum + getLessonBaseMinutes(l), 0);
  const lessonBufferMinutes = track.lessons.reduce((sum, l) => sum + getLessonBufferMinutes(l), 0);
  const themeBufferMinutes = getTrackBufferMinutes(track);
  return {
    baseMinutes,
    lessonBufferMinutes,
    themeBufferMinutes,
    totalMinutes: baseMinutes + lessonBufferMinutes + themeBufferMinutes,
  };
}

export function getTrackMinutes(track: TrackTimingInfo): number {
  return getTrackMinutesBreakdown(track).totalMinutes;
}

export function getCourseMinutes(tracks: TrackTimingInfo[]): number {
  return tracks.reduce((sum, t) => sum + getTrackMinutes(t), 0);
}

/** Formata minutos em português legível: "0 min", "25 min", "1 h", "1 h 30 min". */
export function formatMinutesPt(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (rest === 0) return `${h} h`;
  return `${h} h ${rest} min`;
}

/** Formata horas aproximadas para resumos de trilha/plano: "~4 h" ou "~4,5 h". */
export function formatHoursApproxPt(minutes: number): string {
  const hours = minutes / 60;
  if (hours < 1) return `${Math.round(minutes)} min`;
  const rounded = Math.round(hours * 2) / 2;
  const label = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',');
  return `~${label} h`;
}

export interface StudyPlanBlock {
  weeks: string;
  focus: string;
  trackIds: string[];
  goal: string;
}

/** Plano de estudo sugerido: 10 semanas a ~6 horas por semana. */
export const STUDY_PLAN_WEEKS: StudyPlanBlock[] = [
  {
    weeks: 'Semanas 1–2',
    focus: '1. Python (fundamentos)',
    trackIds: ['python'],
    goal: 'Dominar variáveis, condições, ciclos, funções e ler CSV em Python.',
  },
  {
    weeks: 'Semanas 3–4',
    focus: '2. SQL + 3. Pandas',
    trackIds: ['sql', 'pandas'],
    goal: 'Cruzar tabelas com JOIN/CTE/Window Functions e limpar dados em pandas.',
  },
  {
    weeks: 'Semanas 5–6',
    focus: '4. Git & GitHub + 5. Visualização, Excel & Power BI',
    trackIds: ['git', 'bi'],
    goal: 'Versionar código, construir modelos Star Schema, DAX e praticar em Excel/Power BI.',
  },
  {
    weeks: 'Semanas 7–8',
    focus: '6. Estatística + 7. Nível Profissional',
    trackIds: ['estatistica', 'carreira'],
    goal: 'Validar testes A/B, regressões e fechar o desafio de recrutamento simulado.',
  },
  {
    weeks: 'Semanas 9–10',
    focus: '8. Projeto final + Procura de emprego',
    trackIds: ['projeto-final'],
    goal: 'Preparar o PC, publicar o teu projeto no GitHub, fechar CV, LinkedIn e pitch.',
  },
];
