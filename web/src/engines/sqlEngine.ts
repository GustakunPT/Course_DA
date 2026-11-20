import type { Database } from 'sql.js';
import { loadMerceariaDataset } from './csvEngine';
import { createSandboxWorkerClient, type SandboxWorkerLike } from './sandboxWorkerClient';
import {
  SQL_EXECUTION_TIMEOUT_MS,
  buildSqlDatabaseFromDataset,
  executeSqlOnDatabase,
  validateSqlReadOnly,
  type SqlExecutionResult,
} from './sqlRunnerCore';
import type { SqlWorkerRequest } from './sqlWorker';

export { SQL_EXECUTION_TIMEOUT_MS, validateSqlReadOnly, type SqlExecutionResult } from './sqlRunnerCore';

export type SqlWorkerLike = SandboxWorkerLike<SqlWorkerRequest, SqlExecutionResult>;

let dbPromise: Promise<Database> | null = null;

const sqlWorkerClient = createSandboxWorkerClient<SqlWorkerRequest, SqlExecutionResult>({
  createWorker: () =>
    new Worker(new URL('./sqlWorker.ts', import.meta.url), { type: 'module' }) as unknown as SqlWorkerLike,
  defaultTimeoutMs: SQL_EXECUTION_TIMEOUT_MS,
  preparingMessage: 'A preparar SQLite no Web Worker…',
  stopErrorMessage: 'Execução SQL interrompida pelo utilizador.',
  formatTimeoutError: (secs) =>
    `Consulta SQL interrompida: demorou mais de ${secs} segundos (verifica JOINs sem condição ou cruzamentos muito grandes).`,
  defaultWorkerError: 'Falha no Web Worker SQLite.',
  makeErrorResult: (error, elapsedMs) => ({ columns: [], rows: [], elapsedMs, error }),
});

export function setSqlWorkerForTests(
  factory: (() => SqlWorkerLike) | null,
  timeoutMs = SQL_EXECUTION_TIMEOUT_MS,
): void {
  sqlWorkerClient.setTestWorkerFactory(factory, timeoutMs);
}

/** Termina imediatamente o Web Worker SQLite em execução. */
export function stopSqlExecution(): boolean {
  return sqlWorkerClient.stop();
}

export async function getSqlDatabase(forceReset = false): Promise<Database> {
  if (!dbPromise || forceReset) {
    dbPromise = (async () => {
      const [sqlJsMod, dataset] = await Promise.all([import('sql.js'), loadMerceariaDataset()]);
      const SQL = await sqlJsMod.default({ locateFile: () => '/sql-wasm.wasm' });
      return buildSqlDatabaseFromDataset(SQL, dataset);
    })();
  }
  return dbPromise;
}

export async function runSqlQuery(query: string, onStatus?: (msg: string) => void): Promise<SqlExecutionResult> {
  const start = performance.now();
  const guardError = validateSqlReadOnly(query);
  if (guardError) {
    return {
      columns: [],
      rows: [],
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: guardError,
    };
  }

  if (sqlWorkerClient.hasTestWorkerFactory() || typeof Worker !== 'undefined') {
    return sqlWorkerClient.run({ type: 'run', query }, onStatus);
  }

  try {
    onStatus?.('A executar consulta SQL…');
    const db = await getSqlDatabase();
    return executeSqlOnDatabase(db, query, start);
  } catch (err) {
    return {
      columns: [],
      rows: [],
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
