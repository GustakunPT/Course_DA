// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deveAvisar, installErrorNotice, mostrarAvisoDeErro } from '../src/ui/errorNotice';

const aviso = (): HTMLElement | null => document.getElementById('aviso-erro-app');

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
});

describe('deveAvisar', () => {
  it('avisa erros da própria app', () => {
    expect(
      deveAvisar(
        { mensagem: 'TypeError: x is undefined', ficheiro: 'https://app.pt/assets/index.js' },
        'https://app.pt',
      ),
    ).toBe(true);
    expect(deveAvisar({ mensagem: 'Error: falhou' }, 'https://app.pt')).toBe(true);
  });

  it('ignora extensões do browser e ruído conhecido', () => {
    expect(deveAvisar({ mensagem: 'Erro', ficheiro: 'chrome-extension://abc/x.js' }, 'https://app.pt')).toBe(false);
    expect(deveAvisar({ mensagem: 'ResizeObserver loop completed with undelivered notifications.' })).toBe(false);
    expect(deveAvisar({ mensagem: 'Script error.' })).toBe(false);
    expect(deveAvisar({ mensagem: 'AbortError: The operation was aborted.' })).toBe(false);
  });
});

describe('aviso de erro', () => {
  it('aparece uma só vez, fora de #app, como alerta com foco no botão de recarregar', () => {
    mostrarAvisoDeErro();
    mostrarAvisoDeErro();
    expect(document.querySelectorAll('#aviso-erro-app')).toHaveLength(1);
    expect(aviso()?.parentElement).toBe(document.body);
    expect(aviso()?.getAttribute('role')).toBe('alert');
    expect((document.activeElement as HTMLElement).dataset.aviso).toBe('recarregar');
  });

  it('"Continuar" fecha o aviso', () => {
    mostrarAvisoDeErro();
    aviso()!.querySelector<HTMLElement>('[data-aviso="fechar"]')!.click();
    expect(aviso()).toBeNull();
  });

  it('"Recarregar" guarda os rascunhos antes de recarregar', () => {
    const guardar = vi.fn();
    const recarregar = vi.spyOn(location, 'reload').mockImplementation(() => {});
    mostrarAvisoDeErro(guardar);
    aviso()!.querySelector<HTMLElement>('[data-aviso="recarregar"]')!.click();
    expect(guardar).toHaveBeenCalledOnce();
    expect(recarregar).toHaveBeenCalledOnce();
    recarregar.mockRestore();
  });

  it('liga-se aos erros da janela e às promessas rejeitadas', () => {
    installErrorNotice(() => {});
    window.dispatchEvent(new ErrorEvent('error', { message: 'ResizeObserver loop limit exceeded' }));
    expect(aviso()).toBeNull();
    const rejeicao = new Event('unhandledrejection') as Event & { reason: unknown };
    rejeicao.reason = new Error('falhou o fetch');
    window.dispatchEvent(rejeicao);
    expect(aviso()).not.toBeNull();
  });
});
