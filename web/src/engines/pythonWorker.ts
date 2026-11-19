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
let baseCsvsLoaded = false;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();
let fetchPatchedForSri = false;
let currentStatusReporter: ((msg: string) => void) | null = null;

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',');
}

function wrapResponseWithProgress(res: Response, label: string): Response {
  if (!res.ok || !res.body) return res;
  const totalHeader = res.headers.get('content-length');
  const total = totalHeader ? Number(totalHeader) : 0;
  // Só reporta progresso em ficheiros >= 256 KB para evitar ruído em ficheiros pequenos.
  if (total > 0 && total < 256 * 1024) return res;
  const reader = res.body.getReader();
  let loaded = 0;
  let lastEmit = 0;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      loaded += value.byteLength;
      const now = performance.now();
      if (now - lastEmit >= 200 || (total > 0 && loaded >= total)) {
        lastEmit = now;
        const msg =
          total > 0
            ? `A transferir ${label} (${formatMb(loaded)} / ${formatMb(total)} MB)…`
            : `A transferir ${label} (${formatMb(loaded)} MB)…`;
        currentStatusReporter?.(msg);
      }
      controller.enqueue(value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return new Response(stream, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

/** Garante integridade SRI nos artefactos Pyodide v0.26.4 e redireciona pacotes .whl/.zip para a CDN mantendo o integrity da Pyodide. */
function installPyodideFetchIntegrity(): void {
  if (fetchPatchedForSri) return;
  fetchPatchedForSri = true;
  const origFetch = globalThis.fetch.bind(globalThis);
  const localPrefix = `${globalThis.location.origin}/pyodide/`;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (rawUrl.startsWith(localPrefix)) {
      const fileName = rawUrl.slice(localPrefix.length).split('?')[0];
      if (!LOCAL_BOOTSTRAP_FILES.has(fileName)) {
        const sri = PYODIDE_CORE_SRI[fileName];
        const res = await origFetch(`${PYODIDE_INDEX_URL}${fileName}`, {
          ...init,
          ...(sri ? { integrity: sri } : {}),
          mode: 'cors',
        });
        return wrapResponseWithProgress(res, fileName);
      }
    }
    const res = await origFetch(input, init);
    if (rawUrl.startsWith(PYODIDE_INDEX_URL)) {
      const fileName = rawUrl.slice(PYODIDE_INDEX_URL.length).split('?')[0].split('/').pop() || 'biblioteca';
      return wrapResponseWithProgress(res, fileName);
    }
    return res;
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
      const mod = await import(/* @vite-ignore */ `${localBase}pyodide.mjs`);
      const pyodide = await mod.loadPyodide({ indexURL: localBase });
      pyodide.FS.mkdirTree('/home/pyodide/dados');
      try {
        pyodide.FS.symlink('/home/pyodide/dados', '/home/dados');
      } catch {
        // Ignora se já existir.
      }
      return pyodide;
    })();
  }
  return pyodidePromise;
}

function needsBaseCsvs(msg: PythonWorkerRequest): boolean {
  if ((msg.ficheirosExtra?.length ?? 0) > 0) return true;
  const checkExprs = (msg.checks ?? []).map((c) => c.expr).join('\n');
  return /(dados\/|\.csv\b|\bpandas\b|\bsqlite3\b)/i.test(`${msg.code}\n${checkExprs}`);
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
    const reportStatus = (message: string) => workerScope.postMessage({ type: 'status', id: msg.id, message });
    currentStatusReporter = reportStatus;
    try {
      const pyodide = await getWorkerPyodide(reportStatus);
      if (!baseCsvsLoaded && needsBaseCsvs(msg)) {
        reportStatus('A preparar dados da mercearia…');
        const rawCsvs = await loadBaseCsvs();
        for (const [name, content] of Object.entries(rawCsvs)) {
          writeCsvPairToPyodide(pyodide, name, content);
        }
        baseCsvsLoaded = true;
      }
      const result = await executeInPyodideInstance({
        pyodide,
        code: msg.code,
        checks: msg.checks,
        ficheirosExtra: msg.ficheirosExtra,
        loadedPackages,
        loadedFiles,
        startTime,
        onStatus: reportStatus,
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
