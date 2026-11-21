// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { attachActionListeners } from '../src/app/actions';
import { onBackdrop } from '../src/app/actions/types';
import { attachNavigationListeners } from '../src/app/listeners/navigationListeners';
import { setRenderer } from '../src/app/rerender';
import { state } from '../src/app/store';
import { TRACK_INDEX } from '../src/data/trackIndex';

const render = vi.fn();
setRenderer(render);

/** Põe o HTML na página e liga os eventos. */
function montar(html: string, ligar: () => void = attachActionListeners): void {
  document.body.innerHTML = html;
  ligar();
}

function clicar(seletor: string): void {
  document.querySelector<HTMLElement>(seletor)!.click();
}

beforeEach(() => {
  render.mockClear();
  Object.assign(state, {
    view: 'academia',
    trackId: TRACK_INDEX[0].id,
    lessonId: TRACK_INDEX[0].lessons[0].id,
    wbTab: 'challenge',
    practiceIdx: 0,
    hintLevel: 0,
    showThemeModal: false,
    showGuideModal: false,
    showProgressModal: false,
    sidebarOpenMobile: false,
    confirmClearProgress: false,
    ganttCollapsedTracks: new Set<string>(),
  });
});

describe('ações data-action', () => {
  it('next-hint sobe a pista até 2 e redesenha', () => {
    montar('<button data-action="next-hint"></button>');
    clicar('[data-action="next-hint"]');
    clicar('[data-action="next-hint"]');
    clicar('[data-action="next-hint"]');
    expect(state.hintLevel).toBe(2);
    expect(render).toHaveBeenCalledTimes(3);
  });

  it('o fundo de um modal só fecha com um clique no próprio fundo', () => {
    state.showThemeModal = true;
    montar('<div data-action="close-theme-backdrop"><button id="dentro">x</button></div>');
    clicar('#dentro');
    expect(state.showThemeModal).toBe(true);
    clicar('[data-action="close-theme-backdrop"]');
    expect(state.showThemeModal).toBe(false);
  });

  it('abrir o guia fecha o modal de progresso', () => {
    state.showProgressModal = true;
    montar('<button data-action="open-guide-modal"></button>');
    clicar('button');
    expect(state).toMatchObject({ showGuideModal: true, showProgressModal: false });
  });

  it('limpar o progresso pede confirmação antes', () => {
    montar('<button data-action="ask-clear-progress"></button><button data-action="cancel-clear-progress"></button>');
    clicar('[data-action="ask-clear-progress"]');
    expect(state.confirmClearProgress).toBe(true);
    clicar('[data-action="cancel-clear-progress"]');
    expect(state.confirmClearProgress).toBe(false);
  });

  it('gantt-collapse-all recolhe todas as trilhas', () => {
    montar('<button data-action="gantt-collapse-all"></button>');
    clicar('button');
    expect(state.ganttCollapsedTracks.size).toBe(TRACK_INDEX.length);
  });

  it('reload-page guarda os rascunhos e recarrega', () => {
    const recarregar = vi.spyOn(location, 'reload').mockImplementation(() => {});
    montar('<button data-action="reload-page"></button>');
    clicar('button');
    expect(recarregar).toHaveBeenCalledOnce();
    recarregar.mockRestore();
  });

  it('uma ação desconhecida não faz nada', () => {
    montar('<button data-action="nao-existe"></button>');
    expect(() => clicar('button')).not.toThrow();
    expect(render).not.toHaveBeenCalled();
  });

  it('onBackdrop ignora cliques que vêm de dentro', () => {
    const fechar = vi.fn();
    const fundo = document.createElement('div');
    const handler = onBackdrop(fechar);
    handler(fundo, { target: document.createElement('span') } as unknown as MouseEvent);
    expect(fechar).not.toHaveBeenCalled();
    handler(fundo, { target: fundo } as unknown as MouseEvent);
    expect(fechar).toHaveBeenCalledOnce();
  });
});

describe('navegação', () => {
  it('escolher uma etapa de outra trilha muda também a trilha e repõe a bancada', () => {
    const destino = TRACK_INDEX[1].lessons[2];
    Object.assign(state, { wbTab: 'example', practiceIdx: 1, hintLevel: 2, sidebarOpenMobile: true });
    montar(`<button data-select-lesson="${destino.id}"></button>`, attachNavigationListeners);
    clicar('button');
    expect(state).toMatchObject({
      trackId: TRACK_INDEX[1].id,
      lessonId: destino.id,
      wbTab: 'challenge',
      practiceIdx: 0,
      hintLevel: 0,
      sidebarOpenMobile: false,
    });
  });

  it('mudar de trilha abre a 1.ª etapa quando a atual não é dessa trilha', () => {
    montar(`<button data-select-track="${TRACK_INDEX[1].id}"></button>`, attachNavigationListeners);
    clicar('button');
    expect(state.trackId).toBe(TRACK_INDEX[1].id);
    expect(state.lessonId).toBe(TRACK_INDEX[1].lessons[0].id);
  });

  it('os modos de painel mudam a proporção lição/bancada', () => {
    montar(
      '<button data-layout-preset="reading"></button><button data-layout-preset="coding"></button><button data-layout-preset="balanced"></button>',
      attachNavigationListeners,
    );
    clicar('[data-layout-preset="reading"]');
    expect(state.layout.lessonRatio).toBe(62);
    clicar('[data-layout-preset="coding"]');
    expect(state.layout.lessonRatio).toBe(36);
    clicar('[data-layout-preset="balanced"]');
    expect(state.layout.lessonRatio).toBe(48);
  });
});
