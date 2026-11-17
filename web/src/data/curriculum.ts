import { moreQuiz } from './moreQuiz';
import { pythonExplained } from './pythonExplained';
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
import { gitPractice } from './practiceGit';
import { projetoFinalTrack } from './trackProjetoFinal';
import { projetoPractice } from './practiceProjeto';
import type { Lesson, PythonChallengeSpec, Track } from './types';

// Os exercícios de treino ficam num ficheiro à parte e juntam-se aqui à etapa respetiva.
const pythonTrackComTreinos: Track = {
  ...pythonTrack,
  lessons: pythonTrack.lessons.map((l) => ({
    ...l,
    ...pythonExplained[l.id],
    ...(pythonPractice[l.id] ? { practice: pythonPractice[l.id] } : {}),
  })),
};

const sqlTrackComTreinos: Track = {
  ...sqlTrack,
  lessons: sqlTrack.lessons.map((l) => (sqlPractice[l.id] ? { ...l, practiceSql: sqlPractice[l.id] } : l)),
};

const pandasTrackComTreinos: Track = {
  ...pandasTrack,
  lessons: pandasTrack.lessons.map((l) => (pandasPractice[l.id] ? { ...l, practice: pandasPractice[l.id] } : l)),
};

const gitTrackComTreinos: Track = {
  ...gitTrack,
  lessons: gitTrack.lessons.map((l) => (gitPractice[l.id] ? { ...l, practiceGit: gitPractice[l.id] } : l)),
};

/** Junta os treinos Python e SQL que existirem para a etapa. */
function comTreinosExtra(l: Lesson, python?: PythonChallengeSpec[]): Lesson {
  const sql = biProSqlPractice[l.id];
  return { ...l, ...(python ? { practice: python } : {}), ...(sql ? { practiceSql: sql } : {}) };
}

const careerProComTreinos: Track = {
  ...careerProTrack,
  lessons: careerProTrack.lessons.map((l, i) => ({ ...comTreinosExtra(l, biProPractice[l.id]), code: String(i + 1).padStart(2, '0') })),
};

const projetoFinalComTreinos: Track = {
  ...projetoFinalTrack,
  lessons: projetoFinalTrack.lessons.map((l) => comTreinosExtra(l, projetoPractice[l.id])),
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
  ['bi-03-curva-abc', 'bi-06-storytelling', 'bi-07-graficos-matplotlib', 'bi-04-star-schema', 'bi-05-excel-dax', 'bi-10-pratica-excel-powerbi', 'bi-18-inteligencia-tempo'],
);

const estatisticaTrack = montarTrilha(
  statsBiTrack,
  {
    id: 'estatistica',
    shortTitle: '6. Estatística',
    fullTitle: 'Estatística para Analistas: do descritivo às perguntas de entrevista',
    summary: 'Média e mediana, quartis, probabilidade e Bayes, correlação e intervalos de confiança, simulação e bootstrap, testes A/B, qui-quadrado e ANOVA, regressão simples e múltipla, e perguntas rápidas de entrevista.',
  },
  [
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
  ],
);

export const allTracks: Track[] = enrichTracksWithPedagogy([
  pythonTrackComTreinos,
  sqlTrackComTreinos,
  pandasTrackComTreinos,
  gitTrackComTreinos,
  visualBiTrack,
  estatisticaTrack,
  careerProComTreinos,
  projetoFinalComTreinos,
]).map((t) => ({ ...t, lessons: t.lessons.map((l) => (moreQuiz[l.id] ? { ...l, moreQuiz: moreQuiz[l.id] } : l)) }));

export { cheatsheets };

export const totalLessonsCount = allTracks.reduce((sum, t) => sum + t.lessons.length, 0);
