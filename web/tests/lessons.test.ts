// Verifica o conteúdo das etapas: estrutura coerente e, para SQL e Git,
// que a solução oficial passa na própria correção automática.
import { existsSync, readFileSync } from 'node:fs';
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

const { allTracks, totalLessonsCount, cheatsheets } = await import('../src/data/curriculum');
const { runSqlQuery } = await import('../src/engines/sqlEngine');
const { createInitialGitState, runGitSimulator } = await import('../src/engines/gitEngine');

const todas = allTracks.flatMap((t) => t.lessons.map((l) => ({ trilha: t.id, ...l })));

describe('estrutura do currículo', () => {
  it('tem 8 trilhas e 79 etapas', () => {
    expect(allTracks).toHaveLength(8);
    expect(totalLessonsCount).toBe(79);
  });

  it('a antiga trilha 5 está dividida em Visualização & BI e Estatística, com códigos seguidos', () => {
    const ids = allTracks.map((t) => t.id);
    expect(ids).toEqual(['python', 'sql', 'pandas', 'git', 'bi', 'estatistica', 'carreira', 'projeto-final']);
    for (const id of ['bi', 'estatistica']) {
      const t = allTracks.find((x) => x.id === id)!;
      expect(t.lessons.map((l) => l.code)).toEqual(t.lessons.map((_, i) => String(i + 1).padStart(2, '0')));
    }
    expect(allTracks.find((t) => t.id === 'estatistica')!.lessons[0].id).toBe('bi-01-media-mediana');
  });

  it('todas as etapas têm pelo menos um treino, exceto a introdução, o projeto da trilha Python e as etapas de projeto', () => {
    const semTreino = todas
      .filter((l) => !(l.practice?.length || l.practiceSql?.length || l.practiceGit?.length))
      .map((l) => l.id);
    expect(semTreino).toEqual([
      'py-00-pensamento',
      'py-11-revisao',
      'py-10-caixa-csv',
      'pf-00-preparar-computador',
      'pf-02-pergunta-dados',
      'pf-03-explorar-limpar',
      'pf-04-analisar-recomendar',
      'pf-05-publicar',
      'pf-06-cv-linkedin',
      'pf-07-anuncios-entrevista',
    ]);
  });

  it('a trilha Pandas tem 2 treinos por etapa e os desafios de estatística ficaram curtos', () => {
    for (const l of allTracks.find((t) => t.id === 'pandas')!.lessons) expect(l.practice?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
    for (const l of allTracks.find((t) => t.id === 'estatistica')!.lessons) {
      expect(l.pythonChallenge!.checks.length, l.id).toBeLessThanOrEqual(6);
    }
  });

  it('a trilha 8 começa com a limpeza das bicicletas, com 2 treinos e 3 perguntas', () => {
    const t = allTracks.find((x) => x.id === 'projeto-final')!;
    expect(t.shortTitle).toBe('8. Projeto final');
    expect(t.fullTitle).toBe('Projeto final: os teus dados, a tua pergunta, o teu portefólio');
    expect(t.engineLabel).toBe('Projeto no teu computador');
    const l = t.lessons[0];
    expect(l.id).toBe('pf-01-limpeza-bicicletas');
    expect(l.code).toBe('01');
    expect(l.engine).toBe('python');
    expect(l.ficheirosDados).toEqual(['bicicletas_viagens_sujas.csv']);
    expect(l.practice?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(1 + (l.moreQuiz?.length ?? 0)).toBeGreaterThanOrEqual(3);
  });

  it('o ficheiro limpo de referência fica só para os testes', () => {
    // A app nunca o lê nem o publica: o aluno não pode ir buscar a resposta.
    expect(JSON.stringify(allTracks)).not.toContain('bicicletas_viagens_limpas');
    expect(existsSync(new URL('../public/dados/bicicletas_viagens_limpas.csv', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../public/dados/bicicletas_viagens_sujas.csv', import.meta.url))).toBe(true);
    expect(existsSync(new URL('../public/dados/loja_online_pedidos.csv', import.meta.url))).toBe(true);
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
    if (l.engine === 'projeto') {
      const spec = l.projectSpec;
      expect(spec).toBeDefined();
      expect(spec!.entregaveis.length).toBeGreaterThanOrEqual(2);
      expect(spec!.lista.length).toBeGreaterThanOrEqual(4);
      expect(spec!.lista.length).toBeLessThanOrEqual(8);
      expect(spec!.grelha.length).toBeGreaterThanOrEqual(4);
      expect(spec!.grelha.length).toBeLessThanOrEqual(6);
      expect(l.pythonChallenge).toBeUndefined();
      expect(l.sqlChallenge).toBeUndefined();
      expect(l.gitChallenge).toBeUndefined();
    }
  });

  it('a trilha 8 tem as etapas 02 a 08 de projeto, e só a etapa Publicar pede o link do GitHub', () => {
    const t = allTracks.find((x) => x.id === 'projeto-final')!;
    const projeto = t.lessons.slice(1);
    expect(projeto.map((l) => [l.id, l.code, l.engine])).toEqual([
      ['pf-00-preparar-computador', '02', 'projeto'],
      ['pf-02-pergunta-dados', '03', 'projeto'],
      ['pf-03-explorar-limpar', '04', 'projeto'],
      ['pf-04-analisar-recomendar', '05', 'projeto'],
      ['pf-05-publicar', '06', 'projeto'],
      ['pf-06-cv-linkedin', '07', 'projeto'],
      ['pf-07-anuncios-entrevista', '08', 'projeto'],
    ]);
    expect(projeto.filter((l) => l.projectSpec?.pedirLinkGithub).map((l) => l.id)).toEqual(['pf-05-publicar']);
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
    for (const l of sqlLessons.filter((x) => x.trilha === 'sql' && x.id !== 'sql-11-revisao')) expect(l.practiceSql?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
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
const treinosGit = todas.flatMap((l) => (l.practiceGit ?? []).map((ch, i) => [`${l.id} treino ${i + 1}`, ch] as const));
describe('treinos Git', () => {
  it('cada etapa Git tem dois treinos', () => {
    expect(treinosGit).toHaveLength(10);
  });

  it.each(treinosGit)('%s: a solução passa e o código inicial não', (_nome, ch) => {
    const certo = runGitSimulator(createInitialGitState(), ch.solutionCommands);
    const veredito = ch.validate(certo.nextState, certo.output);
    expect(veredito.passed, veredito.message).toBe(true);
    const inicial = runGitSimulator(createInitialGitState(), ch.starterCommands);
    expect(ch.validate(inicial.nextState, inicial.output).passed).toBe(false);
  });
});

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

describe('fichas da Referência', () => {
  it('cobrem todas as categorias do filtro', () => {
    const cats = new Set(cheatsheets.map((c) => c.category));
    for (const c of ['Python', 'SQL', 'Pandas', 'NumPy & Gráficos', 'Estatística', 'Git', 'BI & DAX']) expect(cats.has(c as never), c).toBe(true);
  });

  it.each(cheatsheets.filter((c) => c.tryEngine === 'sql').map((c) => [c.topic, c.trySnippet!] as const))('"%s": o exemplo SQL corre', async (_t, sql) => {
    const res = await runSqlQuery(sql);
    expect(res.error).toBeUndefined();
    expect(res.rows.length).toBeGreaterThan(0);
  });

  it.each(cheatsheets.filter((c) => c.tryEngine === 'git').map((c) => [c.topic, c.trySnippet!] as const))('"%s": o exemplo Git corre', (_t, cmds) => {
    const { output } = runGitSimulator(createInitialGitState(), cmds);
    expect(output).not.toContain('não suportado');
    expect(output).not.toContain('fatal');
  });
});
