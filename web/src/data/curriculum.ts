import { pythonTrack } from './trackPython';
import { sqlTrack } from './trackSql';
import { pandasTrack } from './trackPandas';
import { cheatsheets, gitTrack, statsBiTrack } from './trackGitAndBi';
import { careerProTrack, enrichTracksWithPedagogy } from './trackCareerPro';
import { pythonPractice } from './practicePython';
import { sqlPractice } from './practiceSql';
import type { Track } from './types';

// Os exercícios de treino ficam num ficheiro à parte e juntam-se aqui à etapa respetiva.
const pythonTrackComTreinos: Track = {
  ...pythonTrack,
  lessons: pythonTrack.lessons.map((l) => (pythonPractice[l.id] ? { ...l, practice: pythonPractice[l.id] } : l)),
};

const sqlTrackComTreinos: Track = {
  ...sqlTrack,
  lessons: sqlTrack.lessons.map((l) => (sqlPractice[l.id] ? { ...l, practiceSql: sqlPractice[l.id] } : l)),
};

export const allTracks: Track[] = enrichTracksWithPedagogy([
  pythonTrackComTreinos,
  sqlTrackComTreinos,
  pandasTrack,
  gitTrack,
  statsBiTrack,
  careerProTrack,
]);

export { cheatsheets };

export const totalLessonsCount = allTracks.reduce((sum, t) => sum + t.lessons.length, 0);
