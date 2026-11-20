// Desenha a app inteira: barra de topo, vista ativa, modais e ecrã de escrita.

import { TOTAL_LESSONS_COUNT, TRACK_INDEX } from '../data/trackIndex';
import { FONT_SIZE_OPTIONS, NORMAL, renderFontSizeMenu } from '../ui/fontSize';
import { escapeHtml } from '../ui/html';
import {
  focusInitialDialogElement,
  getActiveModalKind,
  restoreFocusFromSelectors,
  selectorForControl,
  type ModalKind,
} from '../ui/modalFocus';
import { renderDiagnosticModal, renderGuideModal, renderProgressModal, renderThemeModal } from '../ui/modals';
import { THEME_OPTIONS } from '../ui/theme';
import { renderAcademyWorkspace } from './academyView';
import { renderSecondaryView } from './lazyViews';
import { attachDomListeners } from './listeners';
import { ligarEcraDepoisDoRender, prepararEcraParaRender, renderEcraDeEscritaAtual } from './mobileWriting';
import { state } from './store';
import { writeStateToUrl } from './urlState';

let prevOpenModal: ModalKind = 'none';
let modalTriggerSelector: string | null = null;
const MODAL_FALLBACK_TRIGGERS: Record<Exclude<ModalKind, 'none'>, string[]> = {
  guide: ['[data-action="open-guide-modal"]'],
  progress: ['[data-action="open-progress-modal"]'],
  theme: ['[data-action="open-theme-modal"]'],
  diagnostic: ['[data-action="open-diagnostic-modal"]', '[data-action="open-progress-modal"]'],
};

export function renderAppNow(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const nextModal = getActiveModalKind(state);
  let insideModalControlSelector: string | null = null;
  if (prevOpenModal === 'none' && nextModal !== 'none') {
    modalTriggerSelector = selectorForControl(document.activeElement);
  } else if (prevOpenModal !== 'none' && nextModal === prevOpenModal) {
    const active = document.activeElement;
    if (active && active.closest('.modal-backdrop')) {
      insideModalControlSelector = selectorForControl(active);
    }
  }

  writeStateToUrl();

  const ecraAberto = prepararEcraParaRender();
  const mainContent = state.view === 'academia' ? renderAcademyWorkspace() : renderSecondaryView(state.view);

  root.innerHTML = `
    <div class="app-root">
      <a href="#conteudo-principal" class="skip-link">Saltar para o conteúdo principal</a>
      <header class="top-nav">
        <div class="top-nav-inner">
          <div class="brand-group">
            <a href="#vista=academia&trilha=python&licao=py-00-pensamento" class="brand-link" aria-label="Mercearia do Bairro, página inicial da academia" data-action="go-home">
              <span class="brand-wordmark"><span class="brand-icon">🛒</span> <span class="brand-name">Mercearia</span><span class="brand-full"> do Bairro</span></span>
              <span class="brand-context">Academia de Dados</span>
            </a>
          </div>

          <nav class="track-strip" aria-label="Trilhas e ferramentas">
            ${TRACK_INDEX.map((tr) => {
              const isActive = state.view === 'academia' && state.trackId === tr.id;
              return `
                  <button
                    type="button"
                    class="nav-tab ${isActive ? 'is-active' : ''}"
                    ${isActive ? 'aria-current="page"' : ''}
                    data-select-track="${escapeHtml(tr.id)}"
                  >
                    ${escapeHtml(tr.shortTitle)}
                  </button>
                `;
            }).join('')}
            <button
              type="button"
              class="nav-tab ${state.view === 'explorador' ? 'is-active' : ''}"
              ${state.view === 'explorador' ? 'aria-current="page"' : ''}
              data-select-view="explorador"
            >
              Explorador CSV
            </button>
            <button
              type="button"
              class="nav-tab ${state.view === 'cronograma' ? 'is-active' : ''}"
              ${state.view === 'cronograma' ? 'aria-current="page"' : ''}
              data-select-view="cronograma"
            >
              Cronograma
            </button>
            <button
              type="button"
              class="nav-tab ${state.view === 'referencia' ? 'is-active' : ''}"
              ${state.view === 'referencia' ? 'aria-current="page"' : ''}
              data-select-view="referencia"
            >
              Referência W3
            </button>
          </nav>

          <div class="nav-actions">
            <button
              type="button"
              class="btn nav-guide-btn"
              data-action="open-guide-modal"
              title="Como navegar pelas janelas (etapas, teoria e bancada de código)"
            >
              <span class="progress-full">? Guia</span>
              <span class="progress-compact">?</span>
            </button>
            <button
              type="button"
              class="btn nav-progress-btn"
              data-action="open-progress-modal"
              title="Ver progresso por trilha, código de retoma e exportar portefólio"
            >
              <span class="progress-full">${Object.keys(state.completedLessons).length} / ${TOTAL_LESSONS_COUNT} etapas · Progresso</span>
              <span class="progress-compact">🏆 ${Object.keys(state.completedLessons).length}/${TOTAL_LESSONS_COUNT}</span>
            </button>
            <div class="font-menu-wrap">
              <button
                type="button"
                class="btn nav-theme-btn nav-font-btn"
                data-action="toggle-font-menu"
                aria-haspopup="menu"
                aria-expanded="${state.showFontMenu}"
                aria-label="Tamanho do texto: ${escapeHtml((FONT_SIZE_OPTIONS.find((o) => o.id === state.fontSize) ?? NORMAL).label)}"
                title="Tamanho do texto"
              ><span aria-hidden="true">A<small>A</small></span></button>
              ${state.showFontMenu ? renderFontSizeMenu(state.fontSize) : ''}
            </div>
            <button
              type="button"
              class="btn nav-theme-btn"
              data-action="open-theme-modal"
              aria-label="Escolher estilo visual da academia"
              title="Escolher estilo visual (5 temas)"
            >
              <span class="theme-full">🎨 ${escapeHtml((THEME_OPTIONS.find((t) => t.id === state.theme) ?? THEME_OPTIONS[0]).label)}</span>
              <span class="theme-compact">🎨</span>
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo-principal" class="workspace-wrap" tabindex="-1">
        ${mainContent}
      </main>
      ${state.showProgressModal ? renderProgressModal(state) : ''}
      ${state.showThemeModal ? renderThemeModal(state) : ''}
      ${state.showDiagnosticModal ? renderDiagnosticModal(state) : ''}
      ${state.showGuideModal ? renderGuideModal() : ''}
      ${ecraAberto ? renderEcraDeEscritaAtual() : ''}
    </div>
  `;

  ligarEcraDepoisDoRender(root, ecraAberto);

  if (state.sidebarOpenMobile) {
    root.querySelector<HTMLElement>('.sidebar-panel .lesson-nav-btn.is-current')?.scrollIntoView({ block: 'nearest' });
  }

  attachDomListeners();

  if (nextModal !== 'none' && nextModal !== prevOpenModal) {
    const dialog = root.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    if (dialog) focusInitialDialogElement(dialog);
  } else if (nextModal !== 'none' && insideModalControlSelector) {
    const dialog = root.querySelector<HTMLElement>('.modal-backdrop[role="dialog"]');
    dialog?.querySelector<HTMLElement>(insideModalControlSelector)?.focus();
  } else if (prevOpenModal !== 'none' && nextModal === 'none') {
    restoreFocusFromSelectors([modalTriggerSelector, ...MODAL_FALLBACK_TRIGGERS[prevOpenModal]]);
    modalTriggerSelector = null;
  }
  prevOpenModal = nextModal;
}
