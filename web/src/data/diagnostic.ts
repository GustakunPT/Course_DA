export type BackgroundLevel = 'zero' | 'negocio' | 'tech';

export interface DiagnosticProfile {
  background: BackgroundLevel;
  hoursPerWeek: number;
  targetMonths: number;
  updatedAt: string;
}

export interface DiagnosticEvaluation {
  courseHours: number;
  portfolioHours: number;
  totalPlanHours: number;
  weeksNeeded: number;
  targetWeeks: number;
  fitsTarget: boolean;
  suggestedHoursPerWeek: number;
  startTrackId: string;
  startLessonId: string;
  routeTitle: string;
  routeNote: string;
  verdictLabel: string;
}

export const BACKGROUND_OPTIONS: { id: BackgroundLevel; label: string; hint: string }[] = [
  {
    id: 'zero',
    label: 'Estaca zero em dados e código',
    hint: 'Nunca programei nem trabalhei com indicadores; quero construir a base passo a passo.',
  },
  {
    id: 'negocio',
    label: 'Excel e/ou área de negócio',
    hint: 'Já uso folhas de cálculo ou trabalho com vendas, finanças ou operações, sem código.',
  },
  {
    id: 'tech',
    label: 'Já sei lógica, Python ou SQL básico',
    hint: 'Tenho base técnica e quero focar em análise aplicada, estatística, BI e portefólio.',
  },
];

export const HOURS_OPTIONS = [4, 6, 8, 10, 12];
export const TARGET_MONTHS_OPTIONS = [3, 6, 9, 12];

export const FOUR_PILLARS = [
  {
    num: '1',
    title: 'Fundamentos de Negócio e Dados',
    detail:
      'Pensamento analítico, definição de KPIs e Excel / Google Sheets avançado (SOMA.SE.S, PROCX, Tabelas Dinâmicas).',
    tracks: 'Trilhas 1 (início) e 5',
  },
  {
    num: '2',
    title: 'Extração e Manipulação (SQL)',
    detail:
      'SELECT, filtros, GROUP BY, JOINs, subqueries, CTEs e Window Functions — a competência mais cobrada em entrevistas.',
    tracks: 'Trilha 2 e Nível Profissional',
  },
  {
    num: '3',
    title: 'Estatística e Programação (Python)',
    detail:
      'Média, mediana, dispersão, correlação, testes A/B e regressão junto com Python, Pandas, NumPy e Matplotlib.',
    tracks: 'Trilhas 1, 3 e 6',
  },
  {
    num: '4',
    title: 'Visualização (BI) e Portfólio (3–4 projetos)',
    detail: 'Star Schema, DAX no Power BI e 3 a 4 projetos completos publicados no GitHub do dado bruto à decisão.',
    tracks: 'Trilhas 5, 7 e 8',
  },
];

export const THREE_RISKS = [
  {
    title: 'Tutorial Hell (excesso de teoria)',
    guard:
      'Aqui nenhuma etapa termina só com leitura: cada lição obriga a código validado ou entregável real em dados imperfeitos.',
  },
  {
    title: 'Foco prematuro em Machine Learning',
    guard:
      'O percurso para na regressão e séries temporais para garantir domínio sólido de SQL, estatística descritiva/A/B e análise exploratória.',
  },
  {
    title: 'Ignorar o contexto de negócio',
    guard:
      'Cada desafio e projeto fecha com "Quem decide?", "Limites" e "Que ação tomar na segunda-feira com este número?".',
  },
];

const STORAGE_DIAGNOSTIC_KEY = 'mercearia_diagnostico_v1';

export function sanitizeDiagnostic(raw: unknown): DiagnosticProfile | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const bg = obj.background;
  if (bg !== 'zero' && bg !== 'negocio' && bg !== 'tech') return null;
  const hrs = Number(obj.hoursPerWeek);
  const months = Number(obj.targetMonths);
  if (!Number.isFinite(hrs) || hrs < 2 || hrs > 40) return null;
  if (!Number.isFinite(months) || months < 1 || months > 36) return null;
  return {
    background: bg,
    hoursPerWeek: Math.round(hrs),
    targetMonths: Math.round(months),
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
  };
}

export function loadSavedDiagnostic(): DiagnosticProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_DIAGNOSTIC_KEY);
    return raw ? sanitizeDiagnostic(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveDiagnostic(profile: DiagnosticProfile): void {
  try {
    localStorage.setItem(STORAGE_DIAGNOSTIC_KEY, JSON.stringify(profile));
  } catch {
    // Ignorar erros de quota
  }
}

export function clearSavedDiagnostic(): void {
  try {
    localStorage.removeItem(STORAGE_DIAGNOSTIC_KEY);
  } catch {
    // Ignorar
  }
}

export function evaluateDiagnosticPlan(
  profile: DiagnosticProfile,
  courseProjectedMinutes: number,
): DiagnosticEvaluation {
  const courseHours = Math.round(courseProjectedMinutes / 60);
  // Tempo extra recomendado fora do browser para consolidar e publicar 3–4 projetos completos no GitHub.
  const portfolioHours = 20;
  const totalPlanHours = courseHours + portfolioHours;
  const safeHours = Math.max(1, profile.hoursPerWeek);
  const weeksNeeded = Math.ceil(totalPlanHours / safeHours);
  const targetWeeks = Math.max(1, Math.round(profile.targetMonths * 4.33));
  const fitsTarget = weeksNeeded <= targetWeeks;
  const suggestedHoursPerWeek = Math.max(safeHours, Math.ceil(totalPlanHours / targetWeeks));

  let startTrackId = 'python';
  let startLessonId = 'py-00-pensamento';
  let routeTitle = 'Percurso completo do zero (Trilhas 1 → 8)';
  let routeNote =
    'Começa em 1. Python (Ponto Zero) e segue a ordem 1 → 8 sem saltar etapas. A partir da Trilha 2 ganha ritmo forte em SQL antes de entrar em Pandas e BI.';

  if (profile.background === 'negocio') {
    routeTitle = 'Foco negócio → SQL & Código (Trilhas 1 → 8)';
    routeNote =
      'A tua base de negócio/Excel acelera a leitura de KPIs e a Trilha 5. Usa o arranque em 1. Python para ganhar fluência de código e dá prioridade máxima a 2. SQL e 7–8 (casos e portefólio).';
  } else if (profile.background === 'tech') {
    startTrackId = 'pandas';
    startLessonId = 'pd-01-dataframes';
    routeTitle = 'Arranque acelerado em Dados, Estatística & Portfólio';
    routeNote =
      'Se já dominas lógica e SQL base, valida primeiro as revisões py-11 e sql-11 para confirmar o nível e entra direto em 3. Pandas, 6. Estatística, 7. Nível Profissional e 8. Portfólio (3–4 projetos).';
  }

  const verdictLabel = fitsTarget
    ? `Meta confortável: precisas de ~${weeksNeeded} semanas dentro do teu prazo de ~${targetWeeks} semanas.`
    : `Meta apertada: com ${safeHours} h/sem precisas de ~${weeksNeeded} semanas (para fechar em ${profile.targetMonths} meses sobe para ~${suggestedHoursPerWeek} h/sem).`;

  return {
    courseHours,
    portfolioHours,
    totalPlanHours,
    weeksNeeded,
    targetWeeks,
    fitsTarget,
    suggestedHoursPerWeek,
    startTrackId,
    startLessonId,
    routeTitle,
    routeNote,
    verdictLabel,
  };
}
