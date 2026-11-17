import {
  BASE_CSV_FILES,
  PYODIDE_INDEX_URL,
  PYODIDE_MJS_URL,
  executeInPyodideInstance,
  validatePythonCodeScope,
  writeCsvPairToPyodide,
  type PythonCheckSpec,
  type PythonExecutionResult,
} from './pythonRunnerCore';

export type PythonWorkerRequest = {
  type: 'run';
  id: number;
  code: string;
  checks?: PythonCheckSpec[];
  ficheirosExtra?: string[];
};

export type PythonWorkerResponse =
  | { type: 'status'; id: number; message: string }
  | { type: 'executing'; id: number }
  | { type: 'result'; id: number; result: PythonExecutionResult }
  | { type: 'error'; id: number; error: string; elapsedMs: number };

let pyodidePromise: Promise<any> | null = null;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();

async function loadBaseCsvs(): Promise<Record<string, string>> {
  const rawCsvs: Record<string, string> = {};
  await Promise.all(
    BASE_CSV_FILES.map(async (f) => {
      const res = await fetch(`/dados/${f}`);
      if (!res.ok) {
        throw new Error(`Não foi possível carregar /dados/${f} (HTTP ${res.status}).`);
      }
      rawCsvs[f] = await res.text();
    }),
  );
  return rawCsvs;
}

async function getWorkerPyodide(onStatus: (msg: string) => void): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus('A iniciar Python 3.12 WebAssembly (primeira execução demora alguns segundos)…');
      const [mod, rawCsvs] = await Promise.all([
        import(/* @vite-ignore */ PYODIDE_MJS_URL),
        loadBaseCsvs(),
      ]);
      const pyodide = await mod.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
      pyodide.FS.mkdirTree('/home/pyodide/dados');
      pyodide.FS.mkdirTree('/home/dados');
      for (const [name, content] of Object.entries(rawCsvs)) {
        writeCsvPairToPyodide(pyodide, name, content);
      }
      return pyodide;
    })();
  }
  return pyodidePromise;
}

const workerScope = globalThis as unknown as {
  onmessage: ((ev: MessageEvent<PythonWorkerRequest>) => void) | null;
  postMessage: (msg: PythonWorkerResponse) => void;
};

workerScope.onmessage = (ev: MessageEvent<PythonWorkerRequest>) => {
  const msg = ev.data;
  if (!msg || msg.type !== 'run') return;

  const startTime = performance.now();
  const quickError = validatePythonCodeScope(msg.code);
  if (quickError) {
    workerScope.postMessage({
      type: 'result',
      id: msg.id,
      result: {
        stdout: '',
        elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
        error: quickError,
      },
    });
    return;
  }

  void (async () => {
    try {
      const pyodide = await getWorkerPyodide((message) => {
        workerScope.postMessage({ type: 'status', id: msg.id, message });
      });
      const result = await executeInPyodideInstance({
        pyodide,
        code: msg.code,
        checks: msg.checks,
        ficheirosExtra: msg.ficheirosExtra,
        loadedPackages,
        loadedFiles,
        startTime,
        onStatus: (message) => workerScope.postMessage({ type: 'status', id: msg.id, message }),
        onExecuting: () => workerScope.postMessage({ type: 'executing', id: msg.id }),
      });
      workerScope.postMessage({ type: 'result', id: msg.id, result });
    } catch (err) {
      pyodidePromise = null;
      loadedPackages.clear();
      loadedFiles.clear();
      workerScope.postMessage({
        type: 'error',
        id: msg.id,
        elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  })();
};
