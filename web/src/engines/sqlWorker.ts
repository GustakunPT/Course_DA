import initSqlJs, { type Database } from 'sql.js';
import { loadMerceariaDataset } from './csvEngine';
import type { SandboxWorkerResponse } from './sandboxWorkerClient';
import {
  buildSqlDatabaseFromDataset,
  executeSqlOnDatabase,
  validateSqlReadOnly,
  type SqlExecutionResult,
} from './sqlRunnerCore';

export type SqlWorkerRequest = {
  type: 'run';
  id: number;
  query: string;
};

export type SqlWorkerResponse = SandboxWorkerResponse<SqlExecutionResult>;

let dbPromise: Promise<Database> | null = null;

async function getWorkerSqlDatabase(onStatus: (msg: string) => void): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      onStatus('A iniciar SQLite WebAssembly e a carregar dados…');
      const [SQL, dataset] = await Promise.all([
        initSqlJs({ locateFile: () => '/sql-wasm.wasm' }),
        loadMerceariaDataset(),
      ]);
      return buildSqlDatabaseFromDataset(SQL, dataset);
    })();
  }
  return dbPromise;
}

const workerScope = globalThis as unknown as {
  onmessage: ((ev: MessageEvent<SqlWorkerRequest>) => void) | null;
  postMessage: (msg: SqlWorkerResponse) => void;
};

workerScope.onmessage = (ev: MessageEvent<SqlWorkerRequest>) => {
  const msg = ev.data;
  if (!msg || msg.type !== 'run') return;

  const startTime = performance.now();
  const guardError = validateSqlReadOnly(msg.query);
  if (guardError) {
    workerScope.postMessage({
      type: 'result',
      id: msg.id,
      result: {
        columns: [],
        rows: [],
        elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
        error: guardError,
      },
    });
    return;
  }

  void (async () => {
    try {
      const db = await getWorkerSqlDatabase((message) => {
        workerScope.postMessage({ type: 'status', id: msg.id, message });
      });
      workerScope.postMessage({ type: 'status', id: msg.id, message: 'A executar consulta SQL…' });
      workerScope.postMessage({ type: 'executing', id: msg.id });
      const result = executeSqlOnDatabase(db, msg.query, startTime);
      workerScope.postMessage({ type: 'result', id: msg.id, result });
    } catch (err) {
      dbPromise = null;
      workerScope.postMessage({
        type: 'error',
        id: msg.id,
        elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();
};
