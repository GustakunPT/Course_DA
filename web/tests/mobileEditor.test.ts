// Ecrã de escrita para telemóvel: quem o recebe e como é desenhado.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deveUsarEcraDeEscrita, loadPreferirEditorNormal, savePreferirEditorNormal } from '../src/ui/mobileEditor';

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
