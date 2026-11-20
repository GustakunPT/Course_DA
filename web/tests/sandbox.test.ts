import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createSandboxWorkerClient } from '../src/engines/sandboxWorkerClient';
import { executeSqlOnDatabase, SQL_MAX_TRANSFER_ROWS } from '../src/engines/sqlRunnerCore';

const require = createRequire(import.meta.url);

vi.mock('sql.js', async () => {
  const actual = await vi.importActual<typeof import('sql.js')>('sql.js');
  const init = actual.default;
  return {
    ...actual,
    default: () => init({ locateFile: (f: string) => require.resolve(`sql.js/dist/${f}`) }),
  };
});

const fetchReal = globalThis.fetch;
vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
  const texto = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
  if (texto.startsWith('/dados/')) {
    return new Response(readFileSync(new URL(`../../dados/${texto.slice(7)}`, import.meta.url), 'utf-8'));
  }
  return fetchReal(url, init);
});

const {
  PYODIDE_CORE_SRI,
  runPythonCode,
  setPyodideLoaderForTests,
  setPythonWorkerForTests,
  stopPythonExecution,
  validatePythonCodeScope,
} = await import('../src/engines/pythonEngine');
const { runSqlQuery, setSqlWorkerForTests, stopSqlExecution, validateSqlReadOnly } =
  await import('../src/engines/sqlEngine');
const { createInitialGitState, runGitSimulator } = await import('../src/engines/gitEngine');
const { renderGuideModal } = await import('../src/ui/modals');

const pyodideDir = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/';

beforeAll(() => {
  setPyodideLoaderForTests(() => loadPyodide({ indexURL: pyodideDir }));
}, 120_000);

describe('isolamento da bancada IDE (segurança e âmbito educativo)', () => {
  it.each([
    ['import js', 'Módulo não permitido'],
    ['from js import localStorage', 'Módulo não permitido'],
    ['import micropip', 'Módulo não permitido'],
    ['import os', 'Módulo não permitido'],
    ['import sys', 'Módulo não permitido'],
    ['import subprocess', 'Módulo não permitido'],
    ['import urllib.request', 'Módulo não permitido'],
    ['import requests', 'Módulo não permitido'],
    ['eval("1+1")', 'bloqueada'],
    ['exec("x = 1")', 'bloqueada'],
    ['__import__("js")', 'bloqueada'],
    ['().__class__.__bases__[0].__subclasses__()', 'bloqueado'],
    ['open("dados/vendas.csv", "w")', 'Escrita de ficheiros bloqueada'],
    ['open("/etc/passwd", "r")', 'limitada à pasta dados'],
  ])(
    'Python bloqueia execução fora de âmbito: %s',
    async (code, expectedErr) => {
      const res = await runPythonCode(code);
      expect(res.error, code).toBeDefined();
      expect(res.error).toContain(expectedErr);
    },
    120_000,
  );

  it('Python rejeita scripts acima do limite de tamanho', () => {
    const huge = 'x = 1\n'.repeat(6000);
    expect(validatePythonCodeScope(huge)).toContain('excede o limite');
  });

  it('Python continua a permitir leitura em dados/ e libs de análise', async () => {
    const res = await runPythonCode(
      'import csv, math\nwith open("dados/produtos.csv", encoding="utf-8") as f:\n    n = len(list(csv.DictReader(f)))\nprint(n, type(n).__name__)',
    );
    expect(res.error).toBeUndefined();
    expect(res.stdout).toContain('15 int');
  }, 120_000);

  it.each([
    'DROP TABLE vendas;',
    'DELETE FROM vendas WHERE id = 1;',
    'UPDATE produtos SET preco = 99 WHERE id = 1;',
    'INSERT INTO produtos VALUES (99, "X", "Y", 1.0);',
    'REPLACE INTO produtos VALUES (99, "X", "Y", 1.0);',
    'CREATE TABLE hack (x INT);',
    'PRAGMA table_info(vendas);',
    "ATTACH DATABASE ':memory:' AS extra;",
  ])('SQL bloqueia comandos destrutivos ou de alteração: %s', async (sql) => {
    expect(validateSqlReadOnly(sql)).not.toBeNull();
    const res = await runSqlQuery(sql);
    expect(res.error).toBeDefined();
  });

  it('SQL permite SELECT, WITH, EXPLAIN QUERY PLAN, REPLACE() e strings normais', async () => {
    const q1 = await runSqlQuery("SELECT COUNT(*) FROM produtos WHERE nome != 'DROP';");
    expect(q1.error).toBeUndefined();
    expect(q1.rows[0][0]).toBe(15);

    const q2 = await runSqlQuery("EXPLAIN QUERY PLAN SELECT * FROM vendas WHERE data >= '2025-09-01';");
    expect(q2.error).toBeUndefined();
    expect(q2.rows.length).toBeGreaterThan(0);

    const q3 = await runSqlQuery("SELECT REPLACE(preco, ',', '.') FROM vendas_sujas LIMIT 3;");
    expect(q3.error).toBeUndefined();
    expect(q3.rows).toHaveLength(3);
  });

  it('Git simulado rejeita scripts exageradamente longos', () => {
    const res = runGitSimulator(createInitialGitState(), 'git status\n'.repeat(500));
    expect(res.output).toContain('excede o limite');
  });

  it('renderiza o guia de navegação pelas 3 janelas', () => {
    const html = renderGuideModal();
    expect(html).toContain('Como navegar e usar a Academia');
    expect(html).toContain('Escolha de etapas');
    expect(html).toContain('Descrição (Teoria)');
    expect(html).toContain('Teste no IDE de código');
  });
});

describe('Web Worker Python (cancelamento e timeout)', () => {
  it('stopPythonExecution termina o Worker ativo e devolve erro limpo', async () => {
    let terminated = false;
    setPythonWorkerForTests(
      () => ({
        onmessage: null,
        onerror: null,
        postMessage() {},
        terminate() {
          terminated = true;
        },
      }),
      5_000,
    );
    try {
      const promise = runPythonCode('while True:\n    pass');
      expect(stopPythonExecution()).toBe(true);
      const res = await promise;
      expect(terminated).toBe(true);
      expect(res.error).toContain('interrompida pelo utilizador');
    } finally {
      setPythonWorkerForTests(null);
    }
  });

  it('o timeout corta ciclos infinitos após entrar em execução e não corta o carregamento', async () => {
    let terminated = false;
    const workers: { onmessage: ((ev: { data: any }) => void) | null }[] = [];
    setPythonWorkerForTests(() => {
      const w = {
        onmessage: null as ((ev: { data: any }) => void) | null,
        onerror: null,
        postMessage(req: { id: number }) {
          // Simula carregamento de 25 ms antes de executar (timeout de teste = 40 ms):
          // se o temporizador começasse logo no arranque, podia falhar antes de terminar; aqui só começa em "executing".
          setTimeout(() => {
            w.onmessage?.({ data: { type: 'status', id: req.id, message: 'A carregar pandas…' } });
          }, 25);
          setTimeout(() => {
            w.onmessage?.({ data: { type: 'executing', id: req.id } });
          }, 35);
        },
        terminate() {
          terminated = true;
        },
      };
      workers.push(w);
      return w;
    }, 40);
    try {
      const res = await runPythonCode('while True:\n    pass');
      expect(workers).toHaveLength(1);
      expect(terminated).toBe(true);
      expect(res.error).toContain('ciclo infinito');
    } finally {
      setPythonWorkerForTests(null);
    }
  });

  it('valida integridade SRI SHA-384 dos artefactos Pyodide v0.26.4 locais/CDN', () => {
    for (const [fileName, expectedSri] of Object.entries(PYODIDE_CORE_SRI)) {
      const bytes = readFileSync(new URL(`../node_modules/pyodide/${fileName}`, import.meta.url));
      const actualSri = `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
      expect(actualSri, fileName).toBe(expectedSri);
    }
  });
});

describe('Web Worker SQLite (cancelamento e timeout)', () => {
  it('stopSqlExecution termina o Worker ativo e devolve erro limpo', async () => {
    let terminated = false;
    setSqlWorkerForTests(
      () => ({
        onmessage: null,
        onerror: null,
        postMessage() {},
        terminate() {
          terminated = true;
        },
      }),
      5_000,
    );
    try {
      const promise = runSqlQuery('SELECT * FROM vendas a, vendas b;');
      expect(stopSqlExecution()).toBe(true);
      const res = await promise;
      expect(terminated).toBe(true);
      expect(res.error).toContain('interrompida pelo utilizador');
    } finally {
      setSqlWorkerForTests(null);
    }
  });

  it('o timeout corta consultas SQL pesadas após entrar em execução', async () => {
    let terminated = false;
    setSqlWorkerForTests(() => {
      const w = {
        onmessage: null as ((ev: { data: any }) => void) | null,
        onerror: null,
        postMessage(req: { id: number }) {
          setTimeout(() => {
            w.onmessage?.({ data: { type: 'status', id: req.id, message: 'A executar consulta SQL…' } });
          }, 15);
          setTimeout(() => {
            w.onmessage?.({ data: { type: 'executing', id: req.id } });
          }, 25);
        },
        terminate() {
          terminated = true;
        },
      };
      return w;
    }, 40);
    try {
      const res = await runSqlQuery('SELECT COUNT(*) FROM vendas a, vendas b;');
      expect(terminated).toBe(true);
      expect(res.error).toContain('Consulta SQL interrompida');
    } finally {
      setSqlWorkerForTests(null);
    }
  });

  it('executeSqlOnDatabase limita a transferência a SQL_MAX_TRANSFER_ROWS (500) e sinaliza totalRows/truncated', () => {
    const fakeDb = {
      exec: () => [
        {
          columns: ['id'],
          values: Array.from({ length: SQL_MAX_TRANSFER_ROWS + 25 }, (_, i) => [i + 1]),
        },
      ],
    } as any;
    const res = executeSqlOnDatabase(fakeDb, 'SELECT id FROM vendas', performance.now());
    expect(res.rows).toHaveLength(SQL_MAX_TRANSFER_ROWS);
    expect(res.totalRows).toBe(SQL_MAX_TRANSFER_ROWS + 25);
    expect(res.truncated).toBe(true);
  });

  it('createSandboxWorkerClient dispara stallTimeoutMs se o carregamento estagnar antes de executing', async () => {
    let terminated = false;
    const client = createSandboxWorkerClient<{ id: number }, { error?: string }>({
      createWorker: () => ({
        onmessage: null,
        onerror: null,
        postMessage() {},
        terminate() {
          terminated = true;
        },
      }),
      defaultTimeoutMs: 5_000,
      stallTimeoutMs: 30,
      preparingMessage: 'A preparar…',
      stopErrorMessage: 'Parado',
      formatTimeoutError: (s) => `Timeout ${s}s`,
      defaultWorkerError: 'Erro',
      makeErrorResult: (error) => ({ error }),
    });
    const res = await client.run({});
    expect(terminated).toBe(true);
    expect(res.error).toContain('sem progresso');
  });
});
