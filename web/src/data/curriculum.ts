import { pythonTrack } from './trackPython';
import { sqlTrack } from './trackSql';
import { pandasTrack } from './trackPandas';
import { cheatsheets, gitTrack, statsBiTrack } from './trackGitAndBi';
import { careerProTrack, enrichTracksWithPedagogy } from './trackCareerPro';
import { pythonPractice } from './practicePython';
import { sqlPractice } from './practiceSql';
import { pandasPractice } from './practicePandas';
import { statsPractice } from './practiceStats';
import { biProPractice, biProSqlPractice } from './practiceBiPro';
import type { Lesson, PythonChallengeSpec, Track } from './types';

// Os exercícios de treino ficam num ficheiro à parte e juntam-se aqui à etapa respetiva.
const pythonTrackComTreinos: Track = {
  ...pythonTrack,
  lessons: pythonTrack.lessons.map((l) => (pythonPractice[l.id] ? { ...l, practice: pythonPractice[l.id] } : l)),
};

const sqlTrackComTreinos: Track = {
  ...sqlTrack,
  lessons: sqlTrack.lessons.map((l) => (sqlPractice[l.id] ? { ...l, practiceSql: sqlPractice[l.id] } : l)),
};

const pandasTrackComTreinos: Track = {
  ...pandasTrack,
  lessons: pandasTrack.lessons.map((l) => (pandasPractice[l.id] ? { ...l, practice: pandasPractice[l.id] } : l)),
};

/** Junta os treinos Python e SQL que existirem para a etapa. */
function comTreinosExtra(l: Lesson, python?: PythonChallengeSpec[]): Lesson {
  const sql = biProSqlPractice[l.id];
  return { ...l, ...(python ? { practice: python } : {}), ...(sql ? { practiceSql: sql } : {}) };
}

const careerProComTreinos: Track = {
  ...careerProTrack,
  lessons: careerProTrack.lessons.map((l) => comTreinosExtra(l, biProPractice[l.id])),
};

/** Escolhe e ordena etapas de uma trilha base e renumera os códigos (01, 02, ...). */
function montarTrilha(base: Track, meta: Pick<Track, 'id' | 'shortTitle' | 'fullTitle' | 'summary'>, ordem: string[]): Track {
  const lessons = ordem.map((id, i) => {
    const l = base.lessons.find((x) => x.id === id);
    if (!l) throw new Error(`Etapa em falta: ${id}`);
    const comTreinos = comTreinosExtra(l, statsPractice[id] ?? biProPractice[id]);
    return { ...comTreinos, code: String(i + 1).padStart(2, '0') };
  });
  return { ...base, ...meta, lessons };
}

// A antiga trilha 5 tinha 16 etapas: dividiu-se em duas. Os ids das etapas não mudam,
// por isso o progresso guardado continua válido.
const visualBiTrack = montarTrilha(
  statsBiTrack,
  {
    id: 'bi',
    shortTitle: '5. Visualização & BI',
    fullTitle: 'Visualização, Excel/DAX e Power BI para Analistas',
    summary: 'Curva ABC, relatório executivo e gráficos honestos com matplotlib, Star Schema, DAX e prática guiada de Excel e Power BI com os dados da Mercearia.',
  },
  ['bi-03-curva-abc', 'bi-06-storytelling', 'bi-07-graficos-matplotlib', 'bi-04-star-schema', 'bi-05-excel-dax', 'bi-10-pratica-excel-powerbi'],
);

const estatisticaTrack = montarTrilha(
  statsBiTrack,
  {
    id: 'estatistica',
    shortTitle: '6. Estatística',
    fullTitle: 'Estatística para Analistas: do descritivo às perguntas de entrevista',
    summary: 'Média e mediana, quartis, probabilidade e Bayes, correlação e intervalos de confiança, testes A/B, qui-quadrado e ANOVA, regressão simples e múltipla, e perguntas rápidas de entrevista.',
  },
  [
    'bi-01-media-mediana',
    'bi-02-quartis-outliers',
    'bi-12-probabilidade-simpson',
    'bi-09-correlacao-confianca',
    'bi-08-teste-ab',
    'bi-11-ab-proporcoes',
    'bi-15-qui-quadrado-anova',
    'bi-13-regressao-linear',
    'bi-16-regressao-multipla',
    'bi-14-perguntas-entrevista',
  ],
);

export const allTracks: Track[] = enrichTracksWithPedagogy([
  pythonTrackComTreinos,
  sqlTrackComTreinos,
  pandasTrackComTreinos,
  gitTrack,
  visualBiTrack,
  estatisticaTrack,
  careerProComTreinos,
]);

export { cheatsheets };

export const totalLessonsCount = allTracks.reduce((sum, t) => sum + t.lessons.length, 0);
