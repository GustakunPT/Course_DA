import {
  BASE_CSV_FILES,
  PYODIDE_CORE_SRI,
  PYODIDE_INDEX_URL,
  executeInPyodideInstance,
  validatePythonCodeScope,
  writeCsvPairToPyodide,
  type PythonCheckSpec,
  type PythonExecutionResult,
} from './pythonRunnerCore';
import type { SandboxWorkerResponse } from './sandboxWorkerClient';

export type PythonWorkerRequest = {
  type: 'run';
  id: number;
  code: string;
  checks?: PythonCheckSpec[];
  ficheirosExtra?: string[];
};

export type PythonWorkerResponse = SandboxWorkerResponse<PythonExecutionResult>;

const LOCAL_BOOTSTRAP_FILES = new Set(['pyodide.mjs', 'pyodide.asm.js']);

let pyodidePromise: Promise<any> | null = null;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();
let fetchPatchedForSri = false;

/** Garante integridade SRI nos artefactos Pyodide v0.26.4 e redireciona pacotes .whl/.zip para a CDN mantendo o integrity da Pyodide. */
function installPyodideFetchIntegrity(): void {
  if (fetchPatchedForSri) return;
  fetchPatchedForSri = true;
  const origFetch = globalThis.fetch.bind(globalThis);
  const localPrefix = `${globalThis.location.origin}/pyodide/`;

  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (rawUrl.startsWith(localPrefix)) {
      const fileName = rawUrl.slice(localPrefix.length).split('?')[0];
      if (!LOCAL_BOOTSTRAP_FILES.has(fileName)) {
        const sri = PYODIDE_CORE_SRI[fileName];
        return origFetch(`${PYODIDE_INDEX_URL}${fileName}`, {
          ...init,
          ...(sri ? { integrity: sri } : {}),
          mode: 'cors',
        });
      }
    }
    return origFetch(input, init);
  };
}

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
      installPyodideFetchIntegrity();
      // O runtime JS (pyodide.mjs e pyodide.asm.js) é servido localmente de 'self' (npm pinado 0.26.4);
      // wasm, stdlib e lockfile vêm da CDN com verificação criptográfica SRI (SHA-384).
      const localBase = `${globalThis.location.origin}/pyodide/`;
      const [mod, rawCsvs] = await Promise.all([
        import(/* @vite-ignore */ `${localBase}pyodide.mjs`),
        loadBaseCsvs(),
      ]);
      const pyodide = await mod.loadPyodide({ indexURL: localBase });
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
