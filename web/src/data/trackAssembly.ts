import { enrichTrackWithPedagogy } from './lessonPedagogy';
import type { Lesson, PythonChallengeSpec, QuizSpec, SqlChallengeSpec, Track } from './types';

function comTreinosExtra(
  l: Lesson,
  python?: PythonChallengeSpec[],
  sqlMap?: Record<string, SqlChallengeSpec[]>,
): Lesson {
  const sql = sqlMap?.[l.id];
  return { ...l, ...(python ? { practice: python } : {}), ...(sql ? { practiceSql: sql } : {}) };
}

function applyMoreQuiz(track: Track, moreQuiz: Record<string, QuizSpec[]>): Track {
  return {
    ...enrichTrackWithPedagogy(track),
    lessons: enrichTrackWithPedagogy(track).lessons.map((l) => (moreQuiz[l.id] ? { ...l, moreQuiz: moreQuiz[l.id] } : l)),
  };
}

function montarTrilha(
  base: Track,
  meta: Pick<Track, 'id' | 'shortTitle' | 'fullTitle' | 'summary'>,
  ordem: string[],
  statsPractice: Record<string, PythonChallengeSpec[]>,
  biProPractice: Record<string, PythonChallengeSpec[]>,
  biProSqlPractice: Record<string, SqlChallengeSpec[]>,
): Track {
  const lessons = ordem.map((id, i) => {
    const l = base.lessons.find((x) => x.id === id);
    if (!l) throw new Error(`Etapa em falta: ${id}`);
    const comTreinos = comTreinosExtra(l, statsPractice[id] ?? biProPractice[id], biProSqlPractice);
    return { ...comTreinos, code: String(i + 1).padStart(2, '0') };
  });
  return { ...base, ...meta, lessons };
}

export const VISUAL_BI_ORDER = [
  'bi-03-curva-abc',
  'bi-06-storytelling',
  'bi-07-graficos-matplotlib',
  'bi-04-star-schema',
  'bi-05-excel-dax',
  'bi-10-pratica-excel-powerbi',
  'bi-20-excel-powerquery-limpeza',
  'bi-21-excel-dinamicas-procx',
  'bi-22-powerbi-dax-relatorio',
  'bi-18-inteligencia-tempo',
];

export const ESTATISTICA_ORDER = [
  'bi-01-media-mediana',
  'bi-02-quartis-outliers',
  'bi-12-probabilidade-simpson',
  'bi-09-correlacao-confianca',
  'bi-17-simulacao-bootstrap',
  'bi-08-teste-ab',
  'bi-11-ab-proporcoes',
  'bi-15-qui-quadrado-anova',
  'bi-13-regressao-linear',
  'bi-16-regressao-multipla',
  'bi-19-series-temporais',
  'bi-14-perguntas-entrevista',
];

export function assemblePythonTrack(
  pythonTrack: Track,
  pythonExplained: Record<string, Partial<Lesson>>,
  pythonPractice: Record<string, PythonChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
): Track {
  return applyMoreQuiz(
    {
      ...pythonTrack,
      lessons: pythonTrack.lessons.map((l) => ({
        ...l,
        ...pythonExplained[l.id],
        ...(pythonPractice[l.id] ? { practice: pythonPractice[l.id] } : {}),
      })),
    },
    moreQuiz,
  );
}

export function assembleSqlTrack(
  sqlTrack: Track,
  sqlPractice: Record<string, SqlChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
  sqlExplained: Record<string, Partial<Lesson>> = {},
): Track {
  return applyMoreQuiz(
    {
      ...sqlTrack,
      lessons: sqlTrack.lessons.map((l) => ({
        ...l,
        ...sqlExplained[l.id],
        ...(sqlPractice[l.id] ? { practiceSql: sqlPractice[l.id] } : {}),
      })),
    },
    moreQuiz,
  );
}

export function assemblePandasTrack(
  pandasTrack: Track,
  pandasPractice: Record<string, PythonChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
  pandasExplained: Record<string, Partial<Lesson>> = {},
): Track {
  return applyMoreQuiz(
    {
      ...pandasTrack,
      lessons: pandasTrack.lessons.map((l) => ({
        ...l,
        ...pandasExplained[l.id],
        ...(pandasPractice[l.id] ? { practice: pandasPractice[l.id] } : {}),
      })),
    },
    moreQuiz,
  );
}

export function assembleGitTrack(
  gitTrack: Track,
  gitPractice: Record<string, Track['lessons'][number]['practiceGit']>,
  moreQuiz: Record<string, QuizSpec[]>,
): Track {
  return applyMoreQuiz(
    {
      ...gitTrack,
      lessons: gitTrack.lessons.map((l) => (gitPractice[l.id] ? { ...l, practiceGit: gitPractice[l.id] } : l)),
    },
    moreQuiz,
  );
}

export function assembleVisualBiTrack(
  statsBiTrack: Track,
  statsPractice: Record<string, PythonChallengeSpec[]>,
  biProPractice: Record<string, PythonChallengeSpec[]>,
  biProSqlPractice: Record<string, SqlChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
  statsBiExplained: Record<string, Partial<Lesson>> = {},
): Track {
  const base = montarTrilha(
    statsBiTrack,
    {
      id: 'bi',
      shortTitle: '5. Visualização & BI',
      fullTitle: 'Visualização, Excel/Power Query e Power BI para Analistas',
      summary:
        'Curva ABC, relatório executivo e gráficos honestos com matplotlib, Star Schema, DAX, Inteligência de Tempo e 4 oficinas práticas de Excel, Power Query e Power BI com conferência numérica.',
    },
    VISUAL_BI_ORDER,
    statsPractice,
    biProPractice,
    biProSqlPractice,
  );
  return applyMoreQuiz(
    {
      ...base,
      lessons: base.lessons.map((l) => ({ ...l, ...statsBiExplained[l.id] })),
    },
    moreQuiz,
  );
}

export function assembleEstatisticaTrack(
  statsBiTrack: Track,
  statsPractice: Record<string, PythonChallengeSpec[]>,
  biProPractice: Record<string, PythonChallengeSpec[]>,
  biProSqlPractice: Record<string, SqlChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
  statsBiExplained: Record<string, Partial<Lesson>> = {},
): Track {
  const base = montarTrilha(
    statsBiTrack,
    {
      id: 'estatistica',
      shortTitle: '6. Estatística',
      fullTitle: 'Estatística para Analistas: do descritivo às perguntas de entrevista',
      summary:
        'Média e mediana, quartis, probabilidade e Bayes, correlação e intervalos de confiança, simulação e bootstrap, testes A/B, qui-quadrado e ANOVA, regressão simples e múltipla, e perguntas rápidas de entrevista.',
    },
    ESTATISTICA_ORDER,
    statsPractice,
    biProPractice,
    biProSqlPractice,
  );
  return applyMoreQuiz(
    {
      ...base,
      lessons: base.lessons.map((l) => ({ ...l, ...statsBiExplained[l.id] })),
    },
    moreQuiz,
  );
}

export function assembleCareerProTrack(
  careerProTrack: Track,
  biProPractice: Record<string, PythonChallengeSpec[]>,
  biProSqlPractice: Record<string, SqlChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
): Track {
  return applyMoreQuiz(
    {
      ...careerProTrack,
      lessons: careerProTrack.lessons.map((l, i) => ({
        ...comTreinosExtra(l, biProPractice[l.id], biProSqlPractice),
        code: String(i + 1).padStart(2, '0'),
      })),
    },
    moreQuiz,
  );
}

export function assembleProjetoFinalTrack(
  projetoFinalTrack: Track,
  projetoPractice: Record<string, PythonChallengeSpec[]>,
  moreQuiz: Record<string, QuizSpec[]>,
): Track {
  return applyMoreQuiz(
    {
      ...projetoFinalTrack,
      lessons: projetoFinalTrack.lessons.map((l, i) => ({
        ...comTreinosExtra(l, projetoPractice[l.id]),
        code: String(i + 1).padStart(2, '0'),
      })),
    },
    moreQuiz,
  );
}
