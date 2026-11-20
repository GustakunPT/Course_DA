// Vista da Academia: carrega a trilha (com esqueleto e erro) e junta índice, lição e bancada.

import { ensureTrackLoaded, getCachedTrack } from '../data/trackLoaders';
import { escapeHtml } from '../ui/html';
import { splitterAriaAttrs } from '../ui/layout';
import { renderAcademyShell } from './academySidebar';
import { currentLessonMeta, currentTrackMeta } from './lessonContext';
import { renderLessonArticle } from './lessonArticle';
import { renderApp } from './rerender';
import { state } from './store';
import { renderWorkbenchPanel } from './workbenchPanel';

// Vista da Academia: índice lateral, lição e bancada.

const loadingTrackIds = new Set<string>();
let trackLoadError: { trackId: string; message: string } | null = null;

export function clearTrackLoadError(): void {
  trackLoadError = null;
}

export function renderAcademyWorkspace(): string {
  const trackMeta = currentTrackMeta();
  const lessonMeta = currentLessonMeta();
  const track = getCachedTrack(trackMeta.id);

  if (!track) {
    if (trackLoadError?.trackId === trackMeta.id) {
      return renderAcademyShell(
        trackMeta,
        lessonMeta,
        `
        <article class="seam-panel lesson-article error-state" role="alert">
          <h1>Não foi possível carregar ${escapeHtml(trackMeta.shortTitle)}</h1>
          <p>${escapeHtml(trackLoadError.message)}</p>
          <div><button type="button" class="btn btn-primary" data-action="retry-track-load">Tentar novamente</button></div>
        </article>
        `,
      );
    }
    if (!loadingTrackIds.has(trackMeta.id)) {
      loadingTrackIds.add(trackMeta.id);
      void ensureTrackLoaded(trackMeta.id)
        .then(() => {
          if (trackLoadError?.trackId === trackMeta.id) trackLoadError = null;
          if (state.view === 'academia' && currentTrackMeta().id === trackMeta.id) renderApp();
        })
        .catch((err) => {
          trackLoadError = {
            trackId: trackMeta.id,
            message: err instanceof Error ? err.message : 'Verifica a tua ligação à internet e tenta novamente.',
          };
          if (state.view === 'academia' && currentTrackMeta().id === trackMeta.id) renderApp();
        })
        .finally(() => {
          loadingTrackIds.delete(trackMeta.id);
        });
    }
    return renderAcademyShell(
      trackMeta,
      lessonMeta,
      `
      <article class="seam-panel lesson-article skeleton-stack" role="status">
        <span class="status-chip">A carregar ${escapeHtml(trackMeta.shortTitle)}…</span>
        <h1>${escapeHtml(lessonMeta.title)}</h1>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </article>
      <div id="splitter-main" class="pane-splitter-v" role="separator" tabindex="0" aria-orientation="vertical"
        aria-label="Redimensionar largura entre a lição e o editor de código"
        ${splitterAriaAttrs('lessonRatio', state.layout.lessonRatio)}></div>
      <section class="seam-panel seam-panel-deep workbench-panel skeleton-stack" aria-label="Bancada a carregar">
        <span class="status-chip">A preparar bancada…</span>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar"></div>
      </section>
      `,
    );
  }

  const lesson = track.lessons.find((l) => l.id === lessonMeta.id) ?? track.lessons[0];

  return renderAcademyShell(
    trackMeta,
    lessonMeta,
    `
      ${renderLessonArticle(track, trackMeta, lesson)}

      <!-- Resizable Splitter: Lesson <-> Workbench -->
      <div
        id="splitter-main"
        class="pane-splitter-v"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="Redimensionar largura entre a lição e o editor de código"
        ${splitterAriaAttrs('lessonRatio', state.layout.lessonRatio)}
        title="Arrasta para redimensionar lição vs editor (duplo clique para 50/50)"
      ></div>

      ${renderWorkbenchPanel(lesson)}
    `,
  );
}
