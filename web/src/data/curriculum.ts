import { moreQuiz } from './moreQuiz';
import { pythonExplained } from './pythonExplained';
import { pythonTrack } from './trackPython';
import { sqlTrack } from './trackSql';
import { pandasTrack } from './trackPandas';
import { statsBiTrack } from './trackGitAndBi';
import { gitTrack } from './trackGit';
import { cheatsheets } from './cheatsheetsData';
import { careerProTrack } from './trackCareerPro';
import { pythonPractice } from './practicePython';
import { sqlPractice } from './practiceSql';
import { pandasPractice } from './practicePandas';
import { statsPractice } from './practiceStats';
import { biProPractice, biProSqlPractice } from './practiceBiPro';
import { gitPractice } from './practiceGit';
import { projetoFinalTrack } from './trackProjetoFinal';
import { projetoPractice } from './practiceProjeto';
import {
  assembleCareerProTrack,
  assembleEstatisticaTrack,
  assembleGitTrack,
  assemblePandasTrack,
  assembleProjetoFinalTrack,
  assemblePythonTrack,
  assembleSqlTrack,
  assembleVisualBiTrack,
} from './trackAssembly';
import type { Track } from './types';

export const allTracks: Track[] = [
  assemblePythonTrack(pythonTrack, pythonExplained, pythonPractice, moreQuiz),
  assembleSqlTrack(sqlTrack, sqlPractice, moreQuiz),
  assemblePandasTrack(pandasTrack, pandasPractice, moreQuiz),
  assembleGitTrack(gitTrack, gitPractice, moreQuiz),
  assembleVisualBiTrack(statsBiTrack, statsPractice, biProPractice, biProSqlPractice, moreQuiz),
  assembleEstatisticaTrack(statsBiTrack, statsPractice, biProPractice, biProSqlPractice, moreQuiz),
  assembleCareerProTrack(careerProTrack, biProPractice, biProSqlPractice, moreQuiz),
  assembleProjetoFinalTrack(projetoFinalTrack, projetoPractice, moreQuiz),
];

export { cheatsheets };

export const totalLessonsCount = allTracks.reduce((sum, t) => sum + t.lessons.length, 0);
