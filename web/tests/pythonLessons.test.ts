// Corre as soluções dos desafios Python e pandas no mesmo Pyodide 0.26.4 (Python 3.12)
// que o browser usa, através do pacote npm "pyodide". Na primeira vez o pandas é
// descarregado da CDN do jsDelivr, por isso este ficheiro precisa de internet.
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { createRequire } from 'node:module';
import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it, vi } from 'vitest';

// Os CSV vêm da pasta dados/; tudo o resto (ex.: o pandas na CDN) usa o fetch verdadeiro.
const fetchReal = globalThis.fetch;
vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
  const texto = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
  if (texto.startsWith('/dados/')) {
    return new Response(readFileSync(new URL(`../../dados/${texto.slice(7)}`, import.meta.url), 'utf-8'));
  }
  return fetchReal(url, init);
});

const { allTracks } = await import('../src/data/curriculum');
const { runPythonCode, setPyodideLoaderForTests } = await import('../src/engines/pythonEngine');

const licoes = allTracks.flatMap((t) => t.lessons).filter((l) => l.pythonChallenge);

// Sob o vitest o Pyodide não adivinha onde estão os seus ficheiros: indicamos a pasta.
const pyodideDir = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/';

beforeAll(async () => {
  setPyodideLoaderForTests(() => loadPyodide({ indexURL: pyodideDir }));
}, 120_000);

describe('desafios Python e pandas', () => {
  it('existem desafios Python para testar', () => {
    expect(licoes.length).toBeGreaterThan(20);
  });

  it.each(licoes.map((l) => [l.id, l] as const))(
    '%s: a solução passa em todas as verificações',
    async (_id, l) => {
      const ch = l.pythonChallenge!;
      const res = await runPythonCode(ch.solutionCode, ch.checks);
      expect(res.error).toBeUndefined();
      const falhadas = (res.checks ?? []).filter((c) => !c.passed).map((c) => `${c.label} (obtido: ${c.actual})`);
      expect(falhadas).toEqual([]);
      expect(res.checks).toHaveLength(ch.checks.length);
      expect(res.stdout).not.toContain('Pyarrow will become');
    },
    120_000,
  );

  it.each(licoes.map((l) => [l.id, l] as const))(
    '%s: o código inicial ainda não passa',
    async (_id, l) => {
      const ch = l.pythonChallenge!;
      const res = await runPythonCode(ch.starterCode, ch.checks);
      const todasCertas = !res.error && (res.checks ?? []).length > 0 && res.checks!.every((c) => c.passed);
      expect(todasCertas).toBe(false);
    },
    120_000,
  );
});
