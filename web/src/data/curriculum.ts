import { pythonTrack } from './trackPython';
import { sqlTrack } from './trackSql';
import { pandasTrack } from './trackPandas';
import { cheatsheets, gitTrack, statsBiTrack } from './trackGitAndBi';
import { careerProTrack, enrichTracksWithPedagogy } from './trackCareerPro';
import type { Track } from './types';

export const allTracks: Track[] = enrichTracksWithPedagogy([
  pythonTrack,
  sqlTrack,
  pandasTrack,
  gitTrack,
  statsBiTrack,
  careerProTrack,
]);

export { cheatsheets };

export const totalLessonsCount = allTracks.reduce((sum, t) => sum + t.lessons.length, 0);
