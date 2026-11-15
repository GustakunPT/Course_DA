// Verifica o conteúdo das etapas: estrutura coerente e, para SQL e Git,
// que a solução oficial passa na própria correção automática.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);

// sql.js em Node: o .wasm vem de node_modules em vez de /sql-wasm.wasm.
vi.mock('sql.js', async () => {
  const actual = await vi.importActual<typeof import('sql.js')>('sql.js');
  const init = actual.default;
  return {
    ...actual,
    default: () => init({ locateFile: (f: string) => require.resolve(`sql.js/dist/${f}`) }),
  };
});

// Os CSV vêm da pasta dados/ do projeto, tal como o "npm run sync" os copia para public/.
vi.stubGlobal('fetch', async (url: string) => {
  const nome = url.replace('/dados/', '');
  const texto = readFileSync(new URL(`../../dados/${nome}`, import.meta.url), 'utf-8');
  return new Response(texto);
});

const { allTracks, totalLessonsCount } = await import('../src/data/curriculum');
const { runSqlQuery } = await import('../src/engines/sqlEngine');
const { createInitialGitState, runGitSimulator } = await import('../src/engines/gitEngine');

const todas = allTracks.flatMap((t) => t.lessons.map((l) => ({ trilha: t.id, ...l })));

describe('estrutura do currículo', () => {
  it('tem 6 trilhas e 53 etapas', () => {
    expect(allTracks).toHaveLength(6);
    expect(totalLessonsCount).toBe(53);
  });

  it('os ids das etapas são únicos', () => {
    const ids = todas.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(todas.map((l) => [l.id, l] as const))('%s tem quiz válido e desafio do motor certo', (_id, l) => {
    expect(l.title.trim()).not.toBe('');
    expect(l.quiz.options.length).toBeGreaterThanOrEqual(2);
    expect(l.quiz.correctIndex).toBeGreaterThanOrEqual(0);
    expect(l.quiz.correctIndex).toBeLessThan(l.quiz.options.length);
    if (l.engine === 'sql') expect(l.sqlChallenge).toBeDefined();
    if (l.engine === 'git') expect(l.gitChallenge).toBeDefined();
    if (l.engine === 'python') {
      expect(l.pythonChallenge).toBeDefined();
      expect(l.pythonChallenge!.checks.length).toBeGreaterThan(0);
    }
  });
});

const sqlLessons = todas.filter((l) => l.sqlChallenge);
describe('soluções SQL passam na correção', () => {
  it.each(sqlLessons.map((l) => [l.id, l] as const))('%s', async (_id, l) => {
    const res = await runSqlQuery(l.sqlChallenge!.solutionSql);
    expect(res.error).toBeUndefined();
    const verdict = l.sqlChallenge!.validate(res.columns, res.rows);
    expect(verdict.passed, verdict.message).toBe(true);
  });

  it.each(sqlLessons.map((l) => [l.id, l] as const))('%s: o código inicial ainda não passa', async (_id, l) => {
    const res = await runSqlQuery(l.sqlChallenge!.starterSql);
    const verdict = res.error ? { passed: false } : l.sqlChallenge!.validate(res.columns, res.rows);
    expect(verdict.passed).toBe(false);
  });
});

const treinosSql = todas.flatMap((l) => (l.practiceSql ?? []).map((ch, i) => [`${l.id} treino ${i + 1}`, ch] as const));
describe('treinos SQL', () => {
  it('cada etapa de SQL tem pelo menos um treino e a sql-10 treina o RFM', () => {
    for (const l of sqlLessons.filter((x) => x.trilha === 'sql')) expect(l.practiceSql?.length ?? 0, l.id).toBeGreaterThanOrEqual(1);
    expect(todas.find((l) => l.id === 'sql-10-medias-moveis-rfm')!.practiceSql!.map((t) => t.title).join(' ')).toContain('RFM');
  });

  it.each(treinosSql)('%s: a solução passa e o código inicial não', async (_nome, ch) => {
    const certo = await runSqlQuery(ch.solutionSql);
    expect(certo.error).toBeUndefined();
    const veredito = ch.validate(certo.columns, certo.rows);
    expect(veredito.passed, veredito.message).toBe(true);
    const inicial = await runSqlQuery(ch.starterSql);
    expect(inicial.error ? false : ch.validate(inicial.columns, inicial.rows).passed).toBe(false);
  });
});

describe('sql-02 recusa respostas incompletas', () => {
  const desafio = todas.find((l) => l.id === 'sql-02-where')!.sqlChallenge!;
  it.each([
    ['LIMIT 1', "SELECT id, nome, cidade FROM clientes WHERE cidade IN ('Porto', 'Matosinhos') AND nome LIKE '%Santos' LIMIT 1"],
    ['esquecer Matosinhos', "SELECT id, nome, cidade FROM clientes WHERE cidade = 'Porto' AND nome LIKE '%Santos'"],
    ['esquecer o Porto', "SELECT id, nome, cidade FROM clientes WHERE cidade = 'Matosinhos' AND nome LIKE '%Santos'"],
  ])('%s', async (_nome, sql) => {
    const res = await runSqlQuery(sql);
    expect(desafio.validate(res.columns, res.rows).passed).toBe(false);
  });
});

const gitLessons = todas.filter((l) => l.gitChallenge);
describe('soluções Git passam na correção', () => {
  it.each(gitLessons.map((l) => [l.id, l] as const))('%s', (_id, l) => {
    const { nextState, output } = runGitSimulator(createInitialGitState(), l.gitChallenge!.solutionCommands);
    const verdict = l.gitChallenge!.validate(nextState, output);
    expect(verdict.passed, verdict.message).toBe(true);
  });
});

describe('base SQL da bancada', () => {
  it('tem a vista vendas_detalhe igual à do esquema normalizado', async () => {
    const res = await runSqlQuery(
      "SELECT COUNT(*), ROUND(SUM(subtotal), 2) FROM vendas_detalhe WHERE produto = 'Pão' AND categoria = 'Padaria'",
    );
    expect(res.error).toBeUndefined();
    expect(Number(res.rows[0][0])).toBeGreaterThan(0);
    const total = await runSqlQuery('SELECT ROUND(SUM(subtotal), 2) FROM vendas_detalhe');
    expect(total.rows[0][0]).toBe(26902.89);
  });
});
