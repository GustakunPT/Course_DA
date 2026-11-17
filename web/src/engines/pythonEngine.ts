import { loadMerceariaDataset } from './csvEngine';
import {
  PYODIDE_INDEX_URL,
  PYODIDE_SCRIPT_SRI,
  PYODIDE_SCRIPT_URL,
  PYTHON_EXECUTION_TIMEOUT_MS,
  executeInPyodideInstance,
  validatePythonCodeScope,
  writeCsvPairToPyodide,
  type PythonCheckSpec,
  type PythonExecutionResult,
} from './pythonRunnerCore';
import type { PythonWorkerRequest, PythonWorkerResponse } from './pythonWorker';

export {
  ALLOWED_PYTHON_MODULES,
  PYTHON_EXECUTION_TIMEOUT_MS,
  validatePythonCodeScope,
  type PythonAssertionCheck,
  type PythonCheckSpec,
  type PythonExecutionResult,
} from './pythonRunnerCore';

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
  }
}

export interface PythonWorkerLike {
  onmessage: ((ev: { data: PythonWorkerResponse }) => void) | null;
  onerror: ((ev: { message?: string }) => void) | null;
  postMessage(msg: PythonWorkerRequest): void;
  terminate(): void;
}

type PyodideLoader = () => Promise<any>;
type WorkerFactory = () => PythonWorkerLike;

let pyodidePromise: Promise<any> | null = null;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();
let customPyodideLoader: PyodideLoader | null = null;
let customWorkerFactory: WorkerFactory | null = null;
let executionTimeoutMs = PYTHON_EXECUTION_TIMEOUT_MS;

interface PendingRun {
  id: number;
  startTime: number;
  onStatus?: (msg: string) => void;
  resolve: (res: PythonExecutionResult) => void;
  timerId: ReturnType<typeof setTimeout> | null;
}

let activeWorker: PythonWorkerLike | null = null;
let activePending: PendingRun | null = null;
let nextRunId = 1;

// No browser o Pyodide principal é usado só se Web Workers não existirem; nos testes é trocado pelo npm "pyodide".
let pyodideLoader: PyodideLoader = async () => {
  await loadPyodideScript();
  return window.loadPyodide!({ indexURL: PYODIDE_INDEX_URL });
};

/** Só para testes: usa outro carregador do Pyodide e recomeça do zero. */
export function setPyodideLoaderForTests(loader: PyodideLoader): void {
  customPyodideLoader = loader;
  pyodideLoader = loader;
  pyodidePromise = null;
  loadedPackages.clear();
  loadedFiles.clear();
}

/** Só para testes: substitui a criação do Web Worker e/ou o timeout de execução. */
export function setPythonWorkerForTests(factory: WorkerFactory | null, timeoutMs = PYTHON_EXECUTION_TIMEOUT_MS): void {
  stopPythonExecution();
  customWorkerFactory = factory;
  executionTimeoutMs = timeoutMs;
}

function loadPyodideScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao transferir o motor Pyodide da CDN.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = PYODIDE_SCRIPT_URL;
    // SRI: o browser recusa o script se a CDN servir um ficheiro diferente do v0.26.4 oficial.
    script.integrity = PYODIDE_SCRIPT_SRI;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.dataset.pyodide = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao transferir o motor Python (Pyodide). Verifica a ligação à internet.'));
    document.head.appendChild(script);
  });
}

export async function getPyodideEngine(onStatus?: (msg: string) => void): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.('A iniciar Python 3.12 WebAssembly (primeira execução demora alguns segundos)…');
      const [pyodide, dataset] = await Promise.all([pyodideLoader(), loadMerceariaDataset()]);

      pyodide.FS.mkdirTree('/home/pyodide/dados');
      pyodide.FS.mkdirTree('/home/dados');
      for (const [name, content] of Object.entries(dataset.rawCsvs)) {
        writeCsvPairToPyodide(pyodide, name, content);
      }
      return pyodide;
    })();
  }
  return pyodidePromise;
}

function elapsedSince(startTime: number): number {
  return Math.round((performance.now() - startTime) * 10) / 10;
}

function finishPendingWithError(error: string, terminateWorker: boolean): void {
  const pending = activePending;
  activePending = null;
  if (pending?.timerId) clearTimeout(pending.timerId);
  if (terminateWorker && activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
  pending?.resolve({
    stdout: '',
    elapsedMs: elapsedSince(pending.startTime),
    error,
  });
}

function ensureWorker(): PythonWorkerLike {
  if (!activeWorker) {
    activeWorker = customWorkerFactory
      ? customWorkerFactory()
      : (new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'module' }) as unknown as PythonWorkerLike);

    activeWorker.onmessage = (ev: { data: PythonWorkerResponse }) => {
      const msg = ev.data;
      if (!activePending || !msg || msg.id !== activePending.id) return;

      if (msg.type === 'status') {
        activePending.onStatus?.(msg.message);
      } else if (msg.type === 'executing') {
        if (activePending.timerId) clearTimeout(activePending.timerId);
        const runId = activePending.id;
        activePending.timerId = setTimeout(() => {
          if (activePending?.id !== runId) return;
          const secs = Math.max(1, Math.round(executionTimeoutMs / 1000));
          finishPendingWithError(
            `Execução interrompida: o código demorou mais de ${secs} segundos (verifica se existe um ciclo infinito como while True).`,
            true,
          );
        }, executionTimeoutMs);
      } else if (msg.type === 'result') {
        const pending = activePending;
        activePending = null;
        if (pending.timerId) clearTimeout(pending.timerId);
        pending.resolve(msg.result);
      } else if (msg.type === 'error') {
        finishPendingWithError(msg.error, true);
      }
    };

    activeWorker.onerror = (ev: { message?: string }) => {
      finishPendingWithError(ev.message || 'Falha no Web Worker de Python.', true);
    };
  }
  return activeWorker;
}

/** Termina imediatamente o Web Worker Python em execução (por ex. ciclo infinito). */
export function stopPythonExecution(): boolean {
  if (!activePending) return false;
  finishPendingWithError('Execução interrompida pelo utilizador.', true);
  return true;
}

function shouldUseWorker(): boolean {
  if (customWorkerFactory) return true;
  if (customPyodideLoader) return false;
  return typeof Worker !== 'undefined';
}

function runPythonInWorker(
  code: string,
  checks: PythonCheckSpec[] | undefined,
  onStatus: ((msg: string) => void) | undefined,
  ficheirosExtra: string[],
  startTime: number,
): Promise<PythonExecutionResult> {
  if (activePending) {
    stopPythonExecution();
  }
  return new Promise((resolve) => {
    const id = nextRunId++;
    activePending = { id, startTime, onStatus, resolve, timerId: null };
    try {
      const worker = ensureWorker();
      onStatus?.('A preparar Python no Web Worker…');
      worker.postMessage({ type: 'run', id, code, checks, ficheirosExtra });
    } catch (err) {
      finishPendingWithError(err instanceof Error ? err.message : String(err), true);
    }
  });
}

export async function runPythonCode(
  code: string,
  checks?: PythonCheckSpec[],
  onStatus?: (msg: string) => void,
  ficheirosExtra: string[] = [],
): Promise<PythonExecutionResult> {
  const start = performance.now();
  const quickError = validatePythonCodeScope(code);
  if (quickError) {
    return {
      stdout: '',
      elapsedMs: elapsedSince(start),
      error: quickError,
    };
  }

  if (shouldUseWorker()) {
    return runPythonInWorker(code, checks, onStatus, ficheirosExtra, start);
  }

  try {
    const pyodide = await getPyodideEngine(onStatus);
    return await executeInPyodideInstance({
      pyodide,
      code,
      checks,
      ficheirosExtra,
      loadedPackages,
      loadedFiles,
      startTime: start,
      onStatus,
    });
  } catch (err) {
    pyodidePromise = null;
    loadedFiles.clear();
    return {
      stdout: '',
      elapsedMs: elapsedSince(start),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
