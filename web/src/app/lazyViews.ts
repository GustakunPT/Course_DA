// Vistas carregadas só quando são abertas: Explorador CSV, Cronograma e Referência Rápida.

import { TRACK_INDEX } from '../data/trackIndex';
import { loadMerceariaDataset } from '../engines/csvEngine';
import type { ViewMode } from '../ui/appState';
import { escapeHtml } from '../ui/html';
import { renderApp } from './rerender';
import { state } from './store';

type LazyView = Exclude<ViewMode, 'academia'>;

interface LazySlot<T> {
  view: LazyView;
  mod: T | null;
  started: boolean;
  importer: () => Promise<T>;
  loadingTitle: string;
  errorTitle: string;
}

let viewLoadError: { view: LazyView; message: string } | null = null;

export function clearViewLoadError(): void {
  viewLoadError = null;
}

// Os import() ficam com o caminho escrito à mão para o Vite gerar um ficheiro separado por vista.
const explorerSlot: LazySlot<typeof import('../ui/explorerView')> = {
  view: 'explorador',
  mod: null,
  started: false,
  importer: () => import('../ui/explorerView'),
  loadingTitle: 'A carregar Explorador de Dados…',
  errorTitle: 'Não foi possível carregar o Explorador',
};

const ganttSlot: LazySlot<typeof import('../ui/ganttView')> = {
  view: 'cronograma',
  mod: null,
  started: false,
  importer: () => import('../ui/ganttView'),
  loadingTitle: 'A carregar Cronograma…',
  errorTitle: 'Não foi possível carregar o Cronograma',
};

const cheatsheetSlot: LazySlot<typeof import('../ui/cheatsheetView')> = {
  view: 'referencia',
  mod: null,
  started: false,
  importer: () => import('../ui/cheatsheetView'),
  loadingTitle: 'A carregar Referência Rápida…',
  errorTitle: 'Não foi possível carregar a Referência Rápida',
};

function renderViewLoadingSkeleton(title: string): string {
  return `
    <section class="seam-panels">
      <div class="seam-panel skeleton-stack" role="status">
        <h1>${escapeHtml(title)}</h1>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </div>
    </section>
  `;
}

function renderErrorPanel(title: string, message: string, action: string, buttonLabel: string): string {
  return `
    <section class="seam-panels">
      <div class="seam-panel error-state" role="alert">
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <div><button type="button" class="btn btn-primary" data-action="${action}">${escapeHtml(buttonLabel)}</button></div>
      </div>
    </section>
  `;
}

/** Desenha a vista se o módulo já chegou; senão começa a carregá-lo e mostra o esqueleto (ou o erro). */
function renderLazy<T>(slot: LazySlot<T>, render: (mod: T) => string): string {
  if (slot.mod) return render(slot.mod);
  if (viewLoadError?.view === slot.view) {
    return renderErrorPanel(slot.errorTitle, viewLoadError.message, 'retry-view-load', 'Tentar novamente');
  }
  if (!slot.started) {
    slot.started = true;
    void slot
      .importer()
      .then((mod) => {
        slot.mod = mod;
        if (viewLoadError?.view === slot.view) viewLoadError = null;
        if (state.view === slot.view) renderApp();
      })
      .catch((err) => {
        slot.started = false;
        viewLoadError = {
          view: slot.view,
          message: err instanceof Error ? err.message : 'Verifica a ligação à internet e tenta novamente.',
        };
        if (state.view === slot.view) renderApp();
      });
  }
  return renderViewLoadingSkeleton(slot.loadingTitle);
}

export async function bootstrapData(): Promise<void> {
  try {
    state.dataset = await loadMerceariaDataset();
    state.datasetError = null;
    if (state.view === 'explorador') renderApp();
  } catch (err) {
    state.datasetError = err instanceof Error ? err.message : String(err);
    if (state.view === 'explorador') renderApp();
  }
}

function renderExplorer(): string {
  if (state.datasetError) {
    return renderErrorPanel(
      'Erro ao carregar os ficheiros CSV',
      state.datasetError,
      'retry-dataset',
      'Tentar carregar novamente',
    );
  }
  const dataset = state.dataset;
  if (!dataset) {
    void bootstrapData();
    return renderViewLoadingSkeleton('A carregar dados da Mercearia do Bairro…');
  }
  return renderLazy(explorerSlot, (mod) =>
    mod.renderExplorerHtml(dataset, {
      serie: state.explorerSerie,
      cidade: state.explorerCidade,
      categoria: state.explorerCategoria,
    }),
  );
}

/** Conteúdo principal das vistas que não são a Academia. */
export function renderSecondaryView(view: LazyView): string {
  if (view === 'explorador') return renderExplorer();
  if (view === 'cronograma') {
    return renderLazy(ganttSlot, (mod) =>
      mod.renderGanttHtml(TRACK_INDEX, state.completedLessons, {
        paceMinutesPerWeek: state.ganttPaceMinutes,
        filterStatus: state.ganttFilterStatus,
        collapsedTracks: state.ganttCollapsedTracks,
        currentLessonId: state.lessonId,
        lessonTimes: state.lessonTimes,
        diagnostic: state.diagnostic,
        quizSelection: state.quizSelection,
      }),
    );
  }
  return renderLazy(cheatsheetSlot, (mod) => mod.renderCheatsheetHtml(state.refQuery, state.refCategory));
}
