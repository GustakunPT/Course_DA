export type SandboxWorkerResponse<TResult> =
  | { type: 'status'; id: number; message: string }
  | { type: 'executing'; id: number }
  | { type: 'result'; id: number; result: TResult }
  | { type: 'error'; id: number; error: string; elapsedMs: number };

export interface SandboxWorkerLike<TRequest extends { id: number }, TResult> {
  onmessage: ((ev: { data: SandboxWorkerResponse<TResult> }) => void) | null;
  onerror: ((ev: { message?: string }) => void) | null;
  postMessage(msg: TRequest): void;
  terminate(): void;
}

export interface SandboxWorkerClientOptions<TRequest extends { id: number }, TResult> {
  createWorker: () => SandboxWorkerLike<TRequest, TResult>;
  defaultTimeoutMs: number;
  preparingMessage: string;
  stopErrorMessage: string;
  formatTimeoutError: (seconds: number) => string;
  defaultWorkerError: string;
  makeErrorResult: (error: string, elapsedMs: number) => TResult;
}

export interface SandboxWorkerClient<TRequest extends { id: number }, TResult> {
  run: (requestWithoutId: Omit<TRequest, 'id'>, onStatus?: (msg: string) => void) => Promise<TResult>;
  stop: () => boolean;
  setTestWorkerFactory: (factory: (() => SandboxWorkerLike<TRequest, TResult>) | null, timeoutMs?: number) => void;
  hasTestWorkerFactory: () => boolean;
}

interface PendingExecution<TResult> {
  id: number;
  startTime: number;
  onStatus?: (msg: string) => void;
  resolve: (res: TResult) => void;
  timerId: ReturnType<typeof setTimeout> | null;
}

function elapsedSince(startTime: number): number {
  return Math.round((performance.now() - startTime) * 10) / 10;
}

export function createSandboxWorkerClient<TRequest extends { id: number }, TResult>(
  opts: SandboxWorkerClientOptions<TRequest, TResult>,
): SandboxWorkerClient<TRequest, TResult> {
  let activeWorker: SandboxWorkerLike<TRequest, TResult> | null = null;
  let activePending: PendingExecution<TResult> | null = null;
  let customFactory: (() => SandboxWorkerLike<TRequest, TResult>) | null = null;
  let timeoutMs = opts.defaultTimeoutMs;
  let nextId = 1;

  function finishWithError(error: string, terminateWorker: boolean): void {
    const pending = activePending;
    activePending = null;
    if (pending?.timerId) clearTimeout(pending.timerId);
    if (terminateWorker && activeWorker) {
      activeWorker.terminate();
      activeWorker = null;
    }
    if (pending) {
      pending.resolve(opts.makeErrorResult(error, elapsedSince(pending.startTime)));
    }
  }

  function ensureWorker(): SandboxWorkerLike<TRequest, TResult> {
    if (!activeWorker) {
      activeWorker = customFactory ? customFactory() : opts.createWorker();

      activeWorker.onmessage = (ev: { data: SandboxWorkerResponse<TResult> }) => {
        const msg = ev.data;
        if (!activePending || !msg || msg.id !== activePending.id) return;

        if (msg.type === 'status') {
          activePending.onStatus?.(msg.message);
        } else if (msg.type === 'executing') {
          if (activePending.timerId) clearTimeout(activePending.timerId);
          const runId = activePending.id;
          activePending.timerId = setTimeout(() => {
            if (activePending?.id !== runId) return;
            const secs = Math.max(1, Math.round(timeoutMs / 1000));
            finishWithError(opts.formatTimeoutError(secs), true);
          }, timeoutMs);
        } else if (msg.type === 'result') {
          const pending = activePending;
          activePending = null;
          if (pending.timerId) clearTimeout(pending.timerId);
          pending.resolve(msg.result);
        } else if (msg.type === 'error') {
          finishWithError(msg.error, true);
        }
      };

      activeWorker.onerror = (ev: { message?: string }) => {
        finishWithError(ev.message || opts.defaultWorkerError, true);
      };
    }
    return activeWorker;
  }

  function stop(): boolean {
    if (!activePending) return false;
    finishWithError(opts.stopErrorMessage, true);
    return true;
  }

  function run(requestWithoutId: Omit<TRequest, 'id'>, onStatus?: (msg: string) => void): Promise<TResult> {
    if (activePending) stop();
    const startTime = performance.now();
    return new Promise((resolve) => {
      const id = nextId++;
      activePending = { id, startTime, onStatus, resolve, timerId: null };
      try {
        const worker = ensureWorker();
        onStatus?.(opts.preparingMessage);
        worker.postMessage({ ...requestWithoutId, id } as TRequest);
      } catch (err) {
        finishWithError(err instanceof Error ? err.message : String(err), true);
      }
    });
  }

  function setTestWorkerFactory(
    factory: (() => SandboxWorkerLike<TRequest, TResult>) | null,
    overrideTimeoutMs = opts.defaultTimeoutMs,
  ): void {
    stop();
    if (activeWorker) {
      activeWorker.terminate();
      activeWorker = null;
    }
    customFactory = factory;
    timeoutMs = overrideTimeoutMs;
  }

  return {
    run,
    stop,
    setTestWorkerFactory,
    hasTestWorkerFactory: () => customFactory !== null,
  };
}
