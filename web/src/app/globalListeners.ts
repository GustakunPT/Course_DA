// Eventos da janela que ficam ligados uma só vez (não dependem do HTML de cada render).

import { saveDrafts } from '../data/progress';
import { handleDialogTabTrap } from '../ui/modalFocus';
import { fecharEcraDeEscrita, installEcraHistoryListener } from './mobileWriting';
import { renderApp } from './rerender';
import { state } from './store';
import { syncStateFromUrl } from './urlState';

function anyModalOpen(): boolean {
  return state.showProgressModal || state.showThemeModal || state.showDiagnosticModal || state.showGuideModal;
}

function closeFontMenu(): void {
  state.showFontMenu = false;
  renderApp();
}

/** Escape fecha (por esta ordem) o menu da letra, o ecrã de escrita, o índice no telemóvel ou o modal aberto. */
function handleGlobalKeydown(ev: KeyboardEvent): void {
  if (ev.key === 'Escape' && state.showFontMenu) {
    closeFontMenu();
    document.querySelector<HTMLElement>('.nav-font-btn')?.focus();
    return;
  }
  const modalOpen = anyModalOpen();
  if (ev.key === 'Tab' && modalOpen) {
    const dialog = document.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    if (dialog) handleDialogTabTrap(dialog, ev);
    return;
  }
  if (ev.key === 'Tab' && state.mobileEditor !== null) {
    const mobileDialog = document.querySelector<HTMLElement>('.ecra-escrita[role="dialog"]');
    if (mobileDialog && ev.target !== document.getElementById('workbench-editor')) {
      handleDialogTabTrap(mobileDialog, ev);
    }
    return;
  }
  if (ev.key !== 'Escape') return;
  if (state.mobileEditor !== null && !modalOpen) {
    fecharEcraDeEscrita();
  } else if (state.sidebarOpenMobile && !modalOpen) {
    state.sidebarOpenMobile = false;
    renderApp();
    document.querySelector<HTMLElement>('.mobile-index-toggle')?.focus({ preventScroll: true });
  } else if (modalOpen) {
    state.showProgressModal = false;
    state.showThemeModal = false;
    state.showDiagnosticModal = false;
    state.showGuideModal = false;
    renderApp();
  }
}

export function installGlobalListeners(): void {
  installEcraHistoryListener();

  window.addEventListener('hashchange', () => {
    syncStateFromUrl();
    renderApp();
  });

  // O menu do tamanho do texto fecha com um clique fora dele.
  document.addEventListener('click', (ev) => {
    if (state.showFontMenu && !(ev.target as HTMLElement | null)?.closest('.font-menu-wrap')) {
      closeFontMenu();
    }
  });

  window.addEventListener('keydown', handleGlobalKeydown);

  // Grava os rascunhos já quando o separador é escondido ou fechado.
  window.addEventListener('pagehide', () => saveDrafts(state.editorDrafts, true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveDrafts(state.editorDrafts, true);
  });
}

export function registerServiceWorker(): void {
  const isProdBuild = Boolean((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD);
  if (isProdBuild && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}
