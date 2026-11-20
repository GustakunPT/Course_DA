// Ecrã de escrita para telemóvel: quem o recebe e como é desenhado.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deveUsarEcraDeEscrita,
  loadPreferirEditorNormal,
  renderEcraDeEscrita,
  renderPreviaCodigo,
  savePreferirEditorNormal,
  vigiarAparelho,
} from '../src/ui/mobileEditor';

describe('deveUsarEcraDeEscrita', () => {
  it.each([
    [true, true, false, true], // telemóvel
    [true, false, false, false], // tablet em horizontal
    [false, true, false, false], // computador com rato e janela estreita
    [false, false, false, false], // computador
    [true, true, true, false], // telemóvel, mas o aluno escolheu o editor normal
  ])('toque=%s estreito=%s preferirNormal=%s → %s', (toque, estreito, preferirNormal, esperado) => {
    expect(deveUsarEcraDeEscrita({ toque, estreito, preferirNormal })).toBe(esperado);
  });
});

describe('preferência do editor normal', () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    });
  });

  it('começa desligada, grava e volta a desligar', () => {
    expect(loadPreferirEditorNormal()).toBe(false);
    savePreferirEditorNormal(true);
    expect(loadPreferirEditorNormal()).toBe(true);
    expect(localStorage.getItem('mercearia-editor-normal-v1')).toBe('1');
    savePreferirEditorNormal(false);
    expect(loadPreferirEditorNormal()).toBe(false);
  });

  it('sem localStorage devolve false e não rebenta', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadPreferirEditorNormal()).toBe(false);
    expect(() => savePreferirEditorNormal(true)).not.toThrow();
  });
});

describe('renderEcraDeEscrita', () => {
  const base = {
    enunciadoHtml: '<p>Soma as vendas</p>',
    editorHtml: '<textarea id="workbench-editor"></textarea>',
    resultadoHtml: '<div class="out">ok</div>',
    simbolos: [
      [':', ':'],
      ['"', '"'],
    ] as [string, string][],
    rotuloExecutar: 'Executar',
    aCorrer: false,
  };

  it('desenha os 3 separadores por ordem e marca o ativo', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'codigo' });
    const abas = [...html.matchAll(/data-ecra-aba="(\w+)"/g)].map((m) => m[1]);
    expect(abas).toEqual(['enunciado', 'codigo', 'resultado']);
    expect(html).toMatch(
      /aria-selected="true"[^>]*data-ecra-aba="codigo"|data-ecra-aba="codigo"[^>]*aria-selected="true"/,
    );
  });

  it('o editor existe uma só vez, mesmo noutro separador', () => {
    for (const aba of ['enunciado', 'codigo', 'resultado'] as const) {
      const html = renderEcraDeEscrita({ ...base, aba });
      expect(html.match(/id="workbench-editor"/g)).toHaveLength(1);
    }
  });

  it('só o painel ativo fica visível', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'resultado' });
    expect(html).toMatch(/data-painel="resultado"(?![^>]*hidden)/);
    expect(html).toMatch(/data-painel="codigo"[^>]*hidden/);
    expect(html).toMatch(/data-painel="enunciado"[^>]*hidden/);
  });

  it('os símbolos só aparecem no separador Código', () => {
    expect(renderEcraDeEscrita({ ...base, aba: 'codigo' })).toContain('data-insert=":"');
    expect(renderEcraDeEscrita({ ...base, aba: 'resultado' })).not.toContain('data-insert');
  });

  it('executar fica desativado enquanto corre', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'resultado', aCorrer: true });
    expect(html).toMatch(/data-action="executar-ecra-escrita"[^>]*disabled/);
  });

  it('escapa os símbolos e tem saída para o editor normal', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'codigo' });
    expect(html).toContain('data-insert="&quot;"');
    expect(html).toContain('data-action="usar-editor-normal"');
    expect(html).toContain('data-action="fechar-ecra-escrita"');
  });
});

describe('renderPreviaCodigo', () => {
  it('mostra o código sem caixa de texto e abre o ecrã de escrita', () => {
    const html = renderPreviaCodigo('<span>print</span>(1)');
    expect(html).toContain('data-action="abrir-ecra-escrita"');
    expect(html).toContain('<span>print</span>(1)');
    expect(html).toContain('Escrever código');
    expect(html).not.toContain('<textarea');
  });
});

describe('estilos do ecrã de escrita', () => {
  it('o editor do ecrã usa pelo menos 16px, para o Safari do iPhone não fazer zoom ao focar', async () => {
    const { lerCssDaApp } = await import('./helpers/css');
    const css = lerCssDaApp();
    const regra = /\.ecra-escrita \.code-editor,[^{]*\.ecra-escrita \.code-highlight-layer[^{]*\{([^}]*)\}/.exec(css);
    expect(regra, 'falta a regra para .ecra-escrita .code-editor e .code-highlight-layer').not.toBeNull();
    expect(regra![1]).toMatch(/font-size:\s*max\(16px/);
  });

  it('vigiarAparelho mantém estreito=true em telemóvel em paisagem (max-height: 520px)', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query.includes('pointer: coarse') || query.includes('max-height: 520px'),
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
    const ap = vigiarAparelho(() => {});
    expect(ap.toque()).toBe(true);
    expect(ap.estreito()).toBe(true);
    expect(deveUsarEcraDeEscrita({ toque: ap.toque(), estreito: ap.estreito(), preferirNormal: false })).toBe(true);
    vi.unstubAllGlobals();
  });
});
