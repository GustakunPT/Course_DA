import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectSpec, Track } from '../src/data/types';

const memoria = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memoria.get(k) ?? null,
  setItem: (k: string, v: string) => void memoria.set(k, v),
  removeItem: (k: string) => void memoria.delete(k),
  clear: () => memoria.clear(),
});

const progress = await import('../src/data/progress');

beforeEach(() => memoria.clear());

describe('isCloudSyncCode', () => {
  it.each(['MB-ABCD-EF23', 'MB-ABCD-EF23-XY45', ' mb-abcd-ef23-xy45 '])('aceita %s', (c) => {
    expect(progress.isCloudSyncCode(c)).toBe(true);
  });
  it.each(['MB-ABCD', 'MB-ABC1-EF23', 'MB-ABCD-EF23-XY45-ZZZZ', 'XX-ABCD-EF23'])('recusa %s', (c) => {
    expect(progress.isCloudSyncCode(c)).toBe(false);
  });
});

describe('código de sincronização guardado', () => {
  it('guarda em maiúsculas e apaga', () => {
    progress.saveSyncCode('mb-abcd-ef23-xy45');
    expect(progress.loadSyncCode()).toBe('MB-ABCD-EF23-XY45');
    progress.saveSyncCode(null);
    expect(progress.loadSyncCode()).toBeNull();
  });
});

describe('mergeProgressRecords', () => {
  it('autónomo ganha a "com ajuda" e fica a data mais recente', () => {
    const local = { a: { status: 'helped' as const, quizPassed: false, completedAt: '2026-01-01' } };
    const remoto = { a: { status: 'autonomous' as const, quizPassed: true, completedAt: '2026-02-01' } };
    expect(progress.mergeProgressRecords(local, remoto).a).toEqual({
      status: 'autonomous',
      quizPassed: true,
      completedAt: '2026-02-01',
    });
  });
});

describe('códigos de progresso MB1', () => {
  it('codifica e descodifica sem perder dados', async () => {
    const prog = { 'py-01': { status: 'helped' as const, quizPassed: true, completedAt: 'x' } };
    const code = await progress.encodeProgressCode(prog, { 'py-01': 'print(1)' }, { 'py-01': 3 }, null);
    expect(code).toMatch(/^MB1U?-/);
    const out = await progress.decodeProgressCode(code);
    expect(out.progress['py-01'].status).toBe('helped');
    expect(out.progress['py-01'].quizPassed).toBe(true);
    expect(out.drafts).toEqual({ 'py-01': 'print(1)' });
    expect(out.quizzes).toEqual({ 'py-01': 3 });
  });

  it('leva os treinos resolvidos, tempo útil, diagnóstico e revisões em MB1 e aceita códigos antigos', async () => {
    const diag = { background: 'tech' as const, hoursPerWeek: 10, targetMonths: 6, updatedAt: '2026-11-19T10:00:00Z' };
    const prog = {
      'py-01-sintaxe': {
        status: 'autonomous' as const,
        quizPassed: true,
        completedAt: '2026-11-10T10:00:00Z',
        reviewCount: 2,
        lastReviewedAt: '2026-11-18T10:00:00Z',
      },
    };
    const code = await progress.encodeProgressCode(
      prog,
      {},
      {},
      null,
      ['sql-10-medias-moveis-rfm:2'],
      { 'py-01-sintaxe': 420 },
      diag,
    );
    const decoded = await progress.decodeProgressCode(code);
    expect(decoded.practice).toEqual(['sql-10-medias-moveis-rfm:2']);
    expect(decoded.timeSpent).toEqual({ 'py-01-sintaxe': 420 });
    expect(decoded.diagnostic?.background).toBe('tech');
    expect(decoded.diagnostic?.hoursPerWeek).toBe(10);
    expect(decoded.progress['py-01-sintaxe'].reviewCount).toBe(2);
    expect(decoded.progress['py-01-sintaxe'].lastReviewedAt).toBe('2026-11-18T10:00:00Z');

    const antigo = await progress.encodeProgressCode({}, {}, {}, null);
    const decAntigo = await progress.decodeProgressCode(antigo);
    expect(decAntigo.practice).toEqual([]);
    expect(decAntigo.timeSpent).toEqual({});
    expect(decAntigo.diagnostic).toBeNull();
  });

  it('o backup .json leva os treinos, o tempo útil e o diagnóstico', () => {
    const diag = { background: 'negocio' as const, hoursPerWeek: 8, targetMonths: 6, updatedAt: '2026-11-17T10:00:00Z' };
    const json = progress.exportProgressJson({}, {}, {}, ['py-01-sintaxe:1'], { 'py-01-sintaxe': 300 }, diag);
    const imported = progress.importProgressJson(json);
    expect(imported.practice).toEqual(['py-01-sintaxe:1']);
    expect(imported.timeSpent).toEqual({ 'py-01-sintaxe': 300 });
    expect(imported.diagnostic).toEqual(diag);
    expect(progress.importProgressJson('{"progress": {}}').practice).toEqual([]);
    expect(progress.importProgressJson('{"progress": {}}').diagnostic).toBeNull();
  });

  it('mergeLessonTimes mantém o maior tempo registado por etapa', () => {
    expect(
      progress.mergeLessonTimes({ 'py-01-sintaxe': 120, 'sql-01-select': 90 }, { 'py-01-sintaxe': 300, 'py-02-variaveis': 60 }),
    ).toEqual({
      'py-01-sintaxe': 300,
      'sql-01-select': 90,
      'py-02-variaveis': 60,
    });
  });

  it('recusa códigos sem prefixo válido', async () => {
    await expect(progress.decodeProgressCode('abc')).rejects.toThrow();
  });
});

describe('etapas de projeto', () => {
  const etapaBase = {
    lede: 'Lede.',
    analogyTitle: '',
    analogyBody: '',
    concepts: [],
    referenceTitle: '',
    referenceRows: [],
    quiz: { question: '', options: [], correctIndex: 0, explanation: '' },
  };
  const spec = (pedirLinkGithub?: boolean): ProjectSpec => ({
    entregaveis: ['Um ficheiro'],
    lista: ['Fiz isto'],
    grelha: [{ criterio: 'C', bom: 'B', aMelhorar: 'M' }],
    ...(pedirLinkGithub ? { pedirLinkGithub } : {}),
  });
  const tracksMinimas: Track[] = [
    {
      id: 'projeto-final',
      shortTitle: 'Projeto',
      fullTitle: '8. Projeto final',
      summary: '',
      engineLabel: '',
      lessons: [
        {
          ...etapaBase,
          id: 'pf-01-limpeza',
          code: '01',
          title: 'Limpeza a sério',
          engine: 'python',
          exampleCode: 'print("exemplo")',
        },
        {
          ...etapaBase,
          id: 'pf-02-pergunta-dados',
          code: '02',
          title: 'Escolher a pergunta e os dados',
          engine: 'projeto',
          exampleCode: 'pasta/\n  dados/',
          projectSpec: spec(),
        },
        {
          ...etapaBase,
          id: 'pf-05-publicar',
          code: '05',
          title: 'Publicar',
          engine: 'projeto',
          exampleCode: '# README',
          projectSpec: spec(true),
        },
      ],
    },
  ];
  const progressoComAsTres = {
    'pf-01-limpeza': { status: 'autonomous' as const, completedAt: 'x' },
    'pf-02-pergunta-dados': { status: 'autonomous' as const, completedAt: 'x' },
    'pf-05-publicar': { status: 'autonomous' as const, completedAt: 'x' },
  };

  it('o portefólio não conta as etapas de projeto como validadas nem lhes põe código', () => {
    const md = progress.generatePortfolioMarkdown(
      progressoComAsTres,
      { 'pf-05-publicar:challenge': 'https://github.com/ana/p' },
      tracksMinimas,
    );
    expect(md).toContain('1 desafios resolvidos');
    expect(md).toContain('1 de 1 etapas concluídas');
    expect(md).toContain('## 3. Projeto final (autoavaliado)');
    expect(md).toContain('Etapas marcadas pelo aluno; a app não corrigiu este trabalho.');
    expect(md).toContain('- Etapa 02 · Escolher a pergunta e os dados');
    expect(md).toContain('- Etapa 05 · Publicar');
    expect(md).toContain('**Repositório:** https://github.com/ana/p');
    const seccao2 = md.split('## 2.')[1].split('## 3.')[0];
    expect(seccao2).not.toContain('pf-0');
    expect(seccao2).not.toContain('Publicar');
    expect(seccao2).not.toContain('# README');
  });

  it('sem etapas de projeto concluídas não há secção 3, e um link inválido não aparece', () => {
    const soPython = { 'pf-01-limpeza': progressoComAsTres['pf-01-limpeza'] };
    expect(progress.generatePortfolioMarkdown(soPython, {}, tracksMinimas)).not.toContain('## 3.');
    const md = progress.generatePortfolioMarkdown(
      progressoComAsTres,
      { 'pf-05-publicar:challenge': 'https://gitlab.com/ana/p' },
      tracksMinimas,
    );
    expect(md).toContain('## 3. Projeto final (autoavaliado)');
    expect(md).not.toContain('**Repositório:**');
  });

  it('as marcas da lista sobrevivem ao JSON e ao código MB1', async () => {
    const practice = ['pf-02-pergunta-dados#lista:0'];
    const json = progress.exportProgressJson({}, {}, {}, practice);
    expect(progress.importProgressJson(json).practice).toEqual(practice);
    const code = await progress.encodeProgressCode({}, {}, {}, null, practice);
    expect((await progress.decodeProgressCode(code)).practice).toEqual(practice);
  });
});

describe('extractSyncCode e buildSyncShareUrl', () => {
  it('encontra o código dentro de um link de retoma', () => {
    const link = progress.buildSyncShareUrl('MB-ABCD-EF23-XY45', 'https://exemplo.pt/?a=1#vista=academia');
    expect(link).toBe('https://exemplo.pt/?a=1&sync=MB-ABCD-EF23-XY45#vista=academia');
    expect(progress.extractSyncCode(link)).toBe('MB-ABCD-EF23-XY45');
  });
  it('aceita código solto em minúsculas e recusa lixo', () => {
    expect(progress.extractSyncCode('  mb-abcd-ef23 ')).toBe('MB-ABCD-EF23');
    expect(progress.extractSyncCode('olá')).toBeNull();
  });
});
