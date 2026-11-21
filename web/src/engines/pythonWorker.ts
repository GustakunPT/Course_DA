import type { PyodideInterface } from 'pyodide';
import {
  BASE_CSV_FILES,
  PYODIDE_CORE_SRI,
  PYODIDE_INDEX_URL,
  PYODIDE_LOCAL_PATH,
  PYODIDE_VERSION,
  falhaNoArranqueDoPython,
  PYTHON_VERSION_LABEL,
  mensagemDeTransferencia,
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

const LOCAL_BOOTSTRAP_FILES = new Set(['pyodide.mjs', 'pyodide.asm.mjs']);

let pyodidePromise: Promise<PyodideInterface> | null = null;
let baseCsvsLoaded = false;
const loadedPackages = new Set<string>();
const loadedFiles = new Set<string>();
let fetchPatchedForSri = false;
let currentStatusReporter: ((msg: string) => void) | null = null;

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
        currentStatusReporter?.(mensagemDeTransferencia(label, loaded, total));
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

/** Garante integridade SRI nos artefactos do Pyodide e redireciona pacotes .whl/.zip para a CDN mantendo o integrity da Pyodide. */
function installPyodideFetchIntegrity(): void {
  if (fetchPatchedForSri) return;
  fetchPatchedForSri = true;
  const origFetch = globalThis.fetch.bind(globalThis);
  const localPrefix = `${globalThis.location.origin}${PYODIDE_LOCAL_PATH}`;

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

/**
 * Corre o loadPyodide e rejeita logo se o Pyodide avisar na consola que o wasm não arrancou
 * (sem isto a promessa nunca termina e a bancada ficava presa em "A transferir…").
 */
async function carregarComDetecaoDeFalha<T>(carregar: () => Promise<T>): Promise<T> {
  const avisoOriginal = console.warn;
  const erroOriginal = console.error;
  let falhar: (err: Error) => void = () => {};
  const falhou = new Promise<never>((_resolve, reject) => {
    falhar = reject;
  });
  const vigiar =
    (original: (...args: unknown[]) => void) =>
    (...args: unknown[]): void => {
      original.apply(console, args);
      const mensagem = falhaNoArranqueDoPython(args.map(String).join(' '));
      if (mensagem) falhar(new Error(mensagem));
    };
  console.warn = vigiar(avisoOriginal);
  console.error = vigiar(erroOriginal);
  try {
    return await Promise.race([carregar(), falhou]);
  } finally {
    console.warn = avisoOriginal;
    console.error = erroOriginal;
  }
}

async function getWorkerPyodide(onStatus: (msg: string) => void): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus(`A iniciar ${PYTHON_VERSION_LABEL} WebAssembly (primeira execução demora alguns segundos)…`);
      installPyodideFetchIntegrity();
      // O runtime JS (pyodide.mjs e pyodide.asm.mjs) é servido localmente de 'self' (versão do npm, fixa);
      // wasm, stdlib e lockfile vêm da CDN com verificação criptográfica SRI (SHA-384).
      const localBase = `${globalThis.location.origin}${PYODIDE_LOCAL_PATH}`;
      const mod = (await import(/* @vite-ignore */ `${localBase}pyodide.mjs`)) as {
        version?: string;
        loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>;
      };
      if (mod.version !== PYODIDE_VERSION) {
        throw new Error(
          `O browser carregou o Pyodide ${mod.version ?? '?'} em vez do ${PYODIDE_VERSION}. Recarrega a página para atualizar.`,
        );
      }
      const pyodide = await carregarComDetecaoDeFalha(() => mod.loadPyodide({ indexURL: localBase }));
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
