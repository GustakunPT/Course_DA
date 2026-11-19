import type { EngineKind, GitChallengeSpec, Lesson, PythonChallengeSpec, SqlChallengeSpec, Track } from '../data/types';
import { createInitialGitState, runGitSimulator } from '../engines/gitEngine';
import { runPythonCode, stopPythonExecution } from '../engines/pythonEngine';
import type { AppState } from './appState';

export interface WorkbenchRunnerDeps {
  state: AppState;
  currentTrackOrNull: () => Track | null;
  currentLesson: () => Lesson;
  activeEngine: () => EngineKind;
  getEditorValue: () => string;
  activePythonChallenge: (lesson: Lesson) => PythonChallengeSpec | undefined;
  activeSqlChallenge: (lesson: Lesson) => SqlChallengeSpec | undefined;
  activeGitChallenge: (lesson: Lesson) => GitChallengeSpec | undefined;
  markLessonCompleted: (lesson: Lesson) => void;
  savePracticeDone: () => void;
  renderApp: () => void;
}

export function createWorkbenchRunner(deps: WorkbenchRunnerDeps) {
  let activeRunToken = 0;
  let sqlEngineMod: typeof import('../engines/sqlEngine') | null = null;

  function cancelExecution(): boolean {
    const stopped = stopPythonExecution() || Boolean(sqlEngineMod?.stopSqlExecution());
    if (!stopped) {
      activeRunToken++;
    }
    return stopped;
  }

  async function execute(): Promise<void> {
    const {
      state,
      currentTrackOrNull,
      currentLesson,
      activeEngine,
      getEditorValue,
      activePythonChallenge,
      activeSqlChallenge,
      activeGitChallenge,
      markLessonCompleted,
      savePracticeDone,
      renderApp,
    } = deps;

    if (!currentTrackOrNull()) return;
    const lesson = currentLesson();
    if (lesson.engine === 'projeto') return;
    const runToken = ++activeRunToken;
    const engine = activeEngine();
    const code = getEditorValue();

    state.output = { kind: 'loading', statusMessage: 'A processar código…' };
    renderApp();

    if (engine === 'sql') {
      if (!sqlEngineMod) {
        sqlEngineMod = await import('../engines/sqlEngine');
      }
      const res = await sqlEngineMod.runSqlQuery(code, (statusMsg) => {
        if (runToken !== activeRunToken) return;
        state.output = { kind: 'loading', statusMessage: statusMsg };
        const statusEl = document.querySelector('.output-panel .measured');
        if (statusEl) statusEl.textContent = statusMsg;
      });
      if (runToken !== activeRunToken) return;
      if (res.error) {
        state.output = { kind: 'error', errorText: res.error, elapsedMs: res.elapsedMs };
        renderApp();
        return;
      }

      const sqlChallenge = state.wbTab === 'challenge' ? activeSqlChallenge(lesson) : undefined;
      if (sqlChallenge) {
        const check = sqlChallenge.validate(res.columns, res.rows);
        if (check.passed && state.practiceIdx > 0) {
          state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
          savePracticeDone();
        } else if (check.passed) {
          markLessonCompleted(lesson);
        }
        state.output = {
          kind: 'full',
          elapsedMs: res.elapsedMs,
          table: { columns: res.columns, rows: res.rows },
          bannerOk: check.passed,
          bannerText: check.passed
            ? state.practiceIdx > 0
              ? 'Treino resolvido!'
              : 'Desafio SQL validado'
            : 'Query executada: revê o requisito',
          checks: [
            {
              label: check.message,
              passed: check.passed,
              hint: check.passed ? undefined : sqlChallenge.hint,
            },
          ],
        };
      } else {
        state.output = {
          kind: 'full',
          elapsedMs: res.elapsedMs,
          table: { columns: res.columns, rows: res.rows },
          bannerText: `${res.rows.length} linha(s) devolvidas`,
        };
      }
      renderApp();
      return;
    }

    if (engine === 'git') {
      const freshBase = state.wbTab === 'challenge' ? createInitialGitState() : state.gitState;
      const { output, nextState } = runGitSimulator(freshBase, code);
      state.gitState = nextState;

      const gitChallenge = state.wbTab === 'challenge' ? activeGitChallenge(lesson) : undefined;
      if (gitChallenge) {
        const check = gitChallenge.validate(nextState, output);
        if (check.passed && state.practiceIdx > 0) {
          state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
          savePracticeDone();
        } else if (check.passed) {
          markLessonCompleted(lesson);
        }
        state.output = {
          kind: 'full',
          elapsedMs: 1.2,
          stdout: output || 'Nenhum comando executado.',
          bannerOk: check.passed,
          bannerText: check.passed
            ? state.practiceIdx > 0
              ? 'Treino resolvido!'
              : 'Desafio Git concluído'
            : 'Comandos executados: falta um passo',
          checks: [
            {
              label: check.message,
              passed: check.passed,
              hint: check.passed ? undefined : gitChallenge.hint,
            },
          ],
        };
      } else {
        state.output = {
          kind: 'full',
          elapsedMs: 1.0,
          stdout: output || 'Nenhum comando executado.',
          bannerText: `Ramo ativo: ${nextState.currentBranch}`,
        };
      }
      renderApp();
      return;
    }

    const pyChallenge = state.wbTab === 'challenge' ? activePythonChallenge(lesson) : undefined;
    const pyChecks = pyChallenge?.checks;
    const pyRes = await runPythonCode(
      code,
      pyChecks,
      (statusMsg) => {
        if (runToken !== activeRunToken) return;
        state.output = { kind: 'loading', statusMessage: statusMsg };
        const statusEl = document.querySelector('.output-panel .measured');
        if (statusEl) statusEl.textContent = statusMsg;
      },
      currentLesson().ficheirosDados ?? [],
    );

    if (runToken !== activeRunToken) return;

    if (pyRes.error) {
      state.output = {
        kind: 'error',
        elapsedMs: pyRes.elapsedMs,
        errorText: pyRes.error,
      };
      renderApp();
      return;
    }

    const allPassed = pyRes.checks ? pyRes.checks.every((c) => c.passed) : undefined;
    if (allPassed && state.practiceIdx > 0) {
      state.practiceDone.add(`${lesson.id}:${state.practiceIdx}`);
      savePracticeDone();
    } else if (allPassed) {
      markLessonCompleted(lesson);
    }

    state.output = {
      kind: 'full',
      elapsedMs: pyRes.elapsedMs,
      stdout: pyRes.stdout,
      table: pyRes.table,
      images: pyRes.images,
      checks: pyRes.checks,
      bannerOk: allPassed,
      bannerText:
        allPassed === true
          ? state.practiceIdx > 0
            ? 'Treino resolvido!'
            : 'Todos os testes passaram!'
          : allPassed === false
            ? `${pyRes.checks!.filter((c) => c.passed).length}/${pyRes.checks!.length} verificações certas`
            : 'Código Python executado',
    };
    renderApp();
  }

  return { execute, cancelExecution };
}
