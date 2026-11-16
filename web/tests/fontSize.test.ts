// Tamanho do texto: opções, escolha guardada e menu do botão "Aa".
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FONT_SIZE_OPTIONS, loadSavedFontSize, renderFontSizeMenu, saveFontSize } from '../src/ui/fontSize';

describe('opções de tamanho do texto', () => {
  it('vão do mais pequeno ao maior, com o Normal a 100%', () => {
    const pcts = FONT_SIZE_OPTIONS.map((o) => o.percent);
    expect(pcts).toEqual([...pcts].sort((a, b) => a - b));
    expect(FONT_SIZE_OPTIONS.length).toBeGreaterThanOrEqual(4);
    expect(FONT_SIZE_OPTIONS.find((o) => o.id === 'normal')?.percent).toBe(100);
  });
});

describe('escolha guardada', () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    });
  });

  it('começa no Normal e lembra a escolha', () => {
    expect(loadSavedFontSize()).toBe('normal');
    saveFontSize('grande');
    expect(loadSavedFontSize()).toBe('grande');
  });

  it('ignora um valor guardado que já não existe', () => {
    localStorage.setItem('mercearia_academia_fonte_v1', 'gigante');
    expect(loadSavedFontSize()).toBe('normal');
  });

  it('sem localStorage usa o Normal e não rebenta', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadSavedFontSize()).toBe('normal');
    expect(() => saveFontSize('grande')).not.toThrow();
  });
});

describe('menu do botão Aa', () => {
  it('tem uma opção por tamanho e marca a atual', () => {
    const html = renderFontSizeMenu('grande');
    expect(html.match(/data-action="select-font-size"/g)).toHaveLength(FONT_SIZE_OPTIONS.length);
    expect(html).toMatch(/data-font-size="grande"[^>]*aria-checked="true"|aria-checked="true"[^>]*data-font-size="grande"/);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
  });

  it('mostra cada opção no próprio tamanho, para se ver a diferença', () => {
    const html = renderFontSizeMenu('normal');
    for (const o of FONT_SIZE_OPTIONS) expect(html).toContain(`font-size:${o.percent}%`);
  });
});
