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
import { TRACK_INDEX } from './trackIndex';
import type { CheatsheetEntry, Track } from './types';

const trackCache = new Map<string, Track>();
const inflightTrackLoads = new Map<string, Promise<Track>>();
let allTracksPromise: Promise<Track[]> | null = null;
let cheatsheetsCache: CheatsheetEntry[] | null = null;

export function getCachedTrack(trackId: string): Track | undefined {
  return trackCache.get(trackId);
}

export function getCachedAllTracks(): Track[] | null {
  return TRACK_INDEX.every((t) => trackCache.has(t.id))
    ? TRACK_INDEX.map((t) => trackCache.get(t.id)!)
    : null;
}

async function fetchAndAssembleTrack(trackId: string): Promise<Track> {
  switch (trackId) {
    case 'python': {
      const [{ pythonTrack }, { pythonExplained }, { pythonPractice }, { moreQuiz }] = await Promise.all([
        import('./trackPython'),
        import('./pythonExplained'),
        import('./practicePython'),
        import('./moreQuiz'),
      ]);
      return assemblePythonTrack(pythonTrack, pythonExplained, pythonPractice, moreQuiz);
    }
    case 'sql': {
      const [{ sqlTrack }, { sqlPractice }, { moreQuiz }, { sqlExplained }] = await Promise.all([
        import('./trackSql'),
        import('./practiceSql'),
        import('./moreQuiz'),
        import('./sqlExplained'),
      ]);
      return assembleSqlTrack(sqlTrack, sqlPractice, moreQuiz, sqlExplained);
    }
    case 'pandas': {
      const [{ pandasTrack }, { pandasPractice }, { moreQuiz }, { pandasExplained }] = await Promise.all([
        import('./trackPandas'),
        import('./practicePandas'),
        import('./moreQuiz'),
        import('./pandasExplained'),
      ]);
      return assemblePandasTrack(pandasTrack, pandasPractice, moreQuiz, pandasExplained);
    }
    case 'git': {
      const [{ gitTrack }, { gitPractice }, { moreQuiz }] = await Promise.all([
        import('./trackGit'),
        import('./practiceGit'),
        import('./moreQuiz'),
      ]);
      return assembleGitTrack(gitTrack, gitPractice, moreQuiz);
    }
    case 'bi': {
      const [{ statsBiTrack }, { statsPractice }, { biProPractice, biProSqlPractice }, { moreQuiz }, { statsBiExplained }] = await Promise.all([
        import('./trackGitAndBi'),
        import('./practiceStats'),
        import('./practiceBiPro'),
        import('./moreQuiz'),
        import('./statsBiExplained'),
      ]);
      return assembleVisualBiTrack(statsBiTrack, statsPractice, biProPractice, biProSqlPractice, moreQuiz, statsBiExplained);
    }
    case 'estatistica': {
      const [{ statsBiTrack }, { statsPractice }, { biProPractice, biProSqlPractice }, { moreQuiz }, { statsBiExplained }] = await Promise.all([
        import('./trackGitAndBi'),
        import('./practiceStats'),
        import('./practiceBiPro'),
        import('./moreQuiz'),
        import('./statsBiExplained'),
      ]);
      return assembleEstatisticaTrack(statsBiTrack, statsPractice, biProPractice, biProSqlPractice, moreQuiz, statsBiExplained);
    }
    case 'carreira': {
      const [{ careerProTrack }, { biProPractice, biProSqlPractice }, { moreQuiz }] = await Promise.all([
        import('./trackCareerPro'),
        import('./practiceBiPro'),
        import('./moreQuiz'),
      ]);
      return assembleCareerProTrack(careerProTrack, biProPractice, biProSqlPractice, moreQuiz);
    }
    case 'projeto-final': {
      const [{ projetoFinalTrack }, { projetoPractice }, { moreQuiz }] = await Promise.all([
        import('./trackProjetoFinal'),
        import('./practiceProjeto'),
        import('./moreQuiz'),
      ]);
      return assembleProjetoFinalTrack(projetoFinalTrack, projetoPractice, moreQuiz);
    }
    default:
      return ensureTrackLoaded(TRACK_INDEX[0].id);
  }
}

export async function ensureTrackLoaded(trackId: string): Promise<Track> {
  const cached = trackCache.get(trackId);
  if (cached) return cached;

  let pending = inflightTrackLoads.get(trackId);
  if (!pending) {
    pending = fetchAndAssembleTrack(trackId)
      .then((tr) => {
        trackCache.set(tr.id, tr);
        inflightTrackLoads.delete(tr.id);
        return tr;
      })
      .catch((err) => {
        inflightTrackLoads.delete(trackId);
        throw err;
      });
    inflightTrackLoads.set(trackId, pending);
  }
  return pending;
}

export async function loadAllTracksAsync(): Promise<Track[]> {
  const existing = getCachedAllTracks();
  if (existing) return existing;
  if (!allTracksPromise) {
    allTracksPromise = Promise.all(TRACK_INDEX.map((t) => ensureTrackLoaded(t.id)))
      .finally(() => {
        allTracksPromise = null;
      });
  }
  return allTracksPromise;
}

export async function loadCheatsheetsAsync(): Promise<CheatsheetEntry[]> {
  if (!cheatsheetsCache) {
    const mod = await import('./cheatsheetsData');
    cheatsheetsCache = mod.cheatsheets;
  }
  return cheatsheetsCache;
}
