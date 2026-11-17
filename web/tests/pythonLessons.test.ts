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
let pedidosBicicletas = 0;
vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
  const texto = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
  if (texto.startsWith('/dados/')) {
    if (texto === '/dados/bicicletas_viagens_sujas.csv') pedidosBicicletas++;
    return new Response(readFileSync(new URL(`../../dados/${texto.slice(7)}`, import.meta.url), 'utf-8'));
  }
  return fetchReal(url, init);
});

const { allTracks, cheatsheets } = await import('../src/data/curriculum');
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
      const res = await runPythonCode(ch.solutionCode, ch.checks, undefined, l.ficheirosDados);
      expect(res.error).toBeUndefined();
      const falhadas = (res.checks ?? []).filter((c) => !c.passed).map((c) => `${c.label} (obtido: ${c.actual})`);
      expect(falhadas).toEqual([]);
      expect(res.checks).toHaveLength(ch.checks.length);
      expect(res.stdout).not.toContain('Pyarrow will become');
    },
    120_000,
  );

  const treinos = allTracks
    .flatMap((t) => t.lessons)
    .flatMap((l) => (l.practice ?? []).map((ch, i) => [`${l.id} treino ${i + 1}`, ch, l] as const));

  it('a trilha Python tem pelo menos 2 treinos em cada etapa de py-01 a py-09', () => {
    const python = allTracks.find((t) => t.id === 'python')!;
    for (const l of python.lessons.filter((x) => /^py-0[1-9]/.test(x.id))) {
      expect(l.practice?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(treinos)('%s: a solução passa e o código inicial não', async (_nome, ch, l) => {
    const certo = await runPythonCode(ch.solutionCode, ch.checks, undefined, l.ficheirosDados);
    expect(certo.error).toBeUndefined();
    expect((certo.checks ?? []).filter((c) => !c.passed).map((c) => `${c.label} (obtido: ${c.actual})`)).toEqual([]);
    const inicial = await runPythonCode(ch.starterCode, ch.checks, undefined, l.ficheirosDados);
    expect(!inicial.error && inicial.checks!.every((c) => c.passed)).toBe(false);
  }, 120_000);

  it('ficheiros extra carregam uma só vez e só quando pedidos', async () => {
    pedidosBicicletas = 0;
    await runPythonCode('x = 1', []);
    expect(pedidosBicicletas).toBe(0);
    const a = await runPythonCode('import pandas as pd\nn = len(pd.read_csv("dados/bicicletas_viagens_sujas.csv"))', [{ label: 'n', expr: 'n > 19000', actualExpr: 'n', hint: '' }], undefined, ['bicicletas_viagens_sujas.csv']);
    const b = await runPythonCode('y = 2', [], undefined, ['bicicletas_viagens_sujas.csv']);
    expect(a.checks![0].passed).toBe(true);
    expect(b.error).toBeUndefined();
    expect(pedidosBicicletas).toBeLessThanOrEqual(1);
  }, 120_000);

  it('os gráficos matplotlib voltam como PNG', async () => {
    const l = licoes.find((x) => x.id === 'bi-07-graficos-matplotlib')!;
    const res = await runPythonCode(l.pythonChallenge!.solutionCode, l.pythonChallenge!.checks, undefined, l.ficheirosDados);
    expect(res.images).toHaveLength(1);
    expect(res.images![0].startsWith('iVBORw0KGgo')).toBe(true); // assinatura PNG em base64
  }, 120_000);

  it.each([
    ['py-04-condicoes', 'total = 37.5\ndesconto_pct = 5\ntotal_final = 35.625\nidade = 17\npode_entrar = False\ncidade = "Porto"\nentrega_gratis = True'],
    ['py-06-while', 'vendas = [120, 80, 250, 40, 100, 310]\ntotal_vendas = 900\nmedia_vendas = 150\nsaldo = 100\nsemanas = 12\nsaldo_final = 520'],
    ['py-09-funcoes', 'def calcular_subtotal(quantidade, preco):\n    return 2.67\ndef limpar_nome_produto(texto):\n    return "Pão"\ndef aplicar_iva(valor, taxa=0.23):\n    return round(valor * (1 + taxa), 2)'],
    ['py-11-revisao', `carrinho = [("Pão", 6, 0.25), ("Leite", 4, 0.89), ("Azeite", 1, 7.50), ("Café", 2, 3.40), ("Queijo", 1, 4.90)]
def linha_talao(produto, quantidade, preco):
    return f"{produto} x{quantidade} = {quantidade * preco:.2f} €"
subtotal = 24.26
desconto_pct = 5
total = 23.05
unidades_por_categoria = {"Padaria": 6, "Laticínios": 4, "Mercearia": 3, "Charcutaria": 1}
produtos_caros = ["Azeite", "Café", "Queijo"]`],
  ])('%s: resultados escritos à mão não passam', async (id, codigo) => {
    const ch = licoes.find((l) => l.id === id)!.pythonChallenge!;
    const res = await runPythonCode(codigo, ch.checks, undefined, licoes.find((l) => l.id === id)!.ficheirosDados);
    expect(res.error).toBeUndefined();
    expect(res.checks!.some((c) => !c.passed)).toBe(true);
  }, 120_000);

  it.each(licoes.map((l) => [l.id, l] as const))(
    '%s: o código inicial ainda não passa',
    async (_id, l) => {
      const ch = l.pythonChallenge!;
      const res = await runPythonCode(ch.starterCode, ch.checks, undefined, l.ficheirosDados);
      const todasCertas = !res.error && (res.checks ?? []).length > 0 && res.checks!.every((c) => c.passed);
      expect(todasCertas).toBe(false);
    },
    120_000,
  );

  const demos = allTracks.flatMap((t) => t.lessons).filter((l) => l.errorDemo);
  it('as etapas 02 a 10 da trilha Python têm explicação longa e um erro típico', () => {
    expect(demos.map((l) => l.id)).toHaveLength(9);
    for (const l of demos) expect(l.explained!.join(' ').length, l.id).toBeGreaterThan(600);
  });

  it.each(demos.map((l) => [l.id, l.errorDemo!] as const))('%s: o erro típico dá a mensagem anunciada', async (_id, demo) => {
    const res = await runPythonCode(demo.code, []);
    expect(res.error).toBeDefined();
    expect(res.error).toContain(demo.message);
  }, 120_000);

  it.each(cheatsheets.filter((c) => c.tryEngine === 'python').map((c) => [c.topic, c.trySnippet!] as const))(
    'Referência "%s": o exemplo Python corre sem erros',
    async (_topico, codigo) => {
      const res = await runPythonCode(codigo, []);
      expect(res.error).toBeUndefined();
    },
    120_000,
  );
});
