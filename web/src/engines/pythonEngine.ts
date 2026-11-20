import type { PyodideInterface } from 'pyodide';
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
import type { PythonWorkerRequest } from './pythonWorker';
import { createSandboxWorkerClient, type SandboxWorkerLike } from './sandboxWorkerClient';

export {
  ALLOWED_PYTHON_MODULES,
  PYODIDE_CORE_SRI,
  PYTHON_EXECUTION_TIMEOUT_MS,
  validatePythonCodeScope,
  type PythonAssertionCheck,
  type PythonCheckSpec,
  type PythonExecutionResult,
} from './pythonRunnerCore';

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export type PythonWorkerLike = SandboxWorkerLike<PythonWorkerRequest, PythonExecutionResult>;

type PyodideLoader = () => Promise<PyodideInterface>;

let pyodidePromise: Promise<PyodideInterface> | null = null;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();
let customPyodideLoader: PyodideLoader | null = null;

// No browser o Pyodide principal é usado só se Web Workers não existirem; nos testes é trocado pelo npm "pyodide".
let pyodideLoader: PyodideLoader = async () => {
  await loadPyodideScript();
  return window.loadPyodide!({ indexURL: PYODIDE_INDEX_URL });
};

const pythonWorkerClient = createSandboxWorkerClient<PythonWorkerRequest, PythonExecutionResult>({
  createWorker: () =>
    new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'module' }) as unknown as PythonWorkerLike,
  defaultTimeoutMs: PYTHON_EXECUTION_TIMEOUT_MS,
  preparingMessage: 'A preparar Python no Web Worker…',
  stopErrorMessage: 'Execução interrompida pelo utilizador.',
  formatTimeoutError: (secs) =>
    `Execução interrompida: o código demorou mais de ${secs} segundos (verifica se existe um ciclo infinito como while True).`,
  defaultWorkerError: 'Falha no Web Worker de Python.',
  makeErrorResult: (error, elapsedMs) => ({ stdout: '', elapsedMs, error }),
});

/** Só para testes: usa outro carregador do Pyodide e recomeça do zero. */
export function setPyodideLoaderForTests(loader: PyodideLoader): void {
  customPyodideLoader = loader;
  pyodideLoader = loader;
  pyodidePromise = null;
  loadedPackages.clear();
  loadedFiles.clear();
}

/** Só para testes: substitui a criação do Web Worker e/ou o timeout de execução. */
export function setPythonWorkerForTests(
  factory: (() => PythonWorkerLike) | null,
  timeoutMs = PYTHON_EXECUTION_TIMEOUT_MS,
): void {
  pythonWorkerClient.setTestWorkerFactory(factory, timeoutMs);
}

function loadPyodideScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao transferir o motor Pyodide da CDN.')), {
        once: true,
      });
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
    script.onerror = () =>
      reject(new Error('Falha ao transferir o motor Python (Pyodide). Verifica a ligação à internet.'));
    document.head.appendChild(script);
  });
}

export async function getPyodideEngine(onStatus?: (msg: string) => void): Promise<PyodideInterface> {
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

/** Termina imediatamente o Web Worker Python em execução (por ex. ciclo infinito). */
export function stopPythonExecution(): boolean {
  return pythonWorkerClient.stop();
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
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: quickError,
    };
  }

  if (pythonWorkerClient.hasTestWorkerFactory() || (!customPyodideLoader && typeof Worker !== 'undefined')) {
    return pythonWorkerClient.run({ type: 'run', code, checks, ficheirosExtra }, onStatus);
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
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
