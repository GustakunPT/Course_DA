import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('recusa códigos sem prefixo válido', async () => {
    await expect(progress.decodeProgressCode('abc')).rejects.toThrow();
  });
});
