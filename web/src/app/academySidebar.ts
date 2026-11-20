// Barra de controlo dos painéis e índice lateral da Academia.

import { TRACK_INDEX, type LessonIndexEntry, type TrackIndexEntry } from '../data/trackIndex';
import { formatHoursApproxPt, getTrackMinutes } from '../data/studyPlan';
import { escapeHtml } from '../ui/html';
import { ESTADO_PROJETO } from '../ui/projectPanel';
import { state } from './store';

// Vista da Academia: índice lateral, lição e bancada.

export function renderAcademyShell(
  trackMeta: TrackIndexEntry,
  lessonMeta: LessonIndexEntry,
  centerAndRightHtml: string,
): string {
  const { sidebarWidth, lessonRatio, editorHeight, sidebarCollapsed } = state.layout;
  const workbenchRatio = 100 - lessonRatio;

  return `
    <div class="layout-bar" role="region" aria-label="Controlo de painéis e redimensionamento">
      <div class="layout-controls">
        <button type="button" class="btn mobile-index-toggle" data-action="toggle-mobile-sidebar">
          ${state.sidebarOpenMobile ? 'Ocultar índice' : `Índice (etapa ${escapeHtml(lessonMeta.code)})`}
        </button>
        <button type="button" class="btn" data-action="toggle-desktop-sidebar">
          ${sidebarCollapsed ? 'Mostrar índice' : 'Recolher índice'}
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio >= 58}" data-layout-preset="reading">
          Foco leitura
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio > 42 && lessonRatio < 58}" data-layout-preset="balanced">
          Divisão 50 / 50
        </button>
        <button type="button" class="mode-btn" aria-pressed="${lessonRatio <= 42}" data-layout-preset="coding">
          Foco código
        </button>
      </div>
      <div class="layout-controls desktop-only-controls">
        <span class="status-chip">Arrasta as divisórias para redimensionar</span>
        <button type="button" class="btn" data-action="reset-layout">Repor painéis</button>
      </div>
    </div>

    <!-- Mobile Segmented View Switcher (Lição vs Bancada) -->
    <div class="mobile-view-segmented" role="tablist" aria-label="Alternar entre lição e bancada">
      <button
        type="button"
        role="tab"
        class="segmented-btn ${state.mobileTab === 'lesson' ? 'is-active' : ''}"
        data-mobile-tab="lesson"
        aria-selected="${state.mobileTab === 'lesson'}"
      >
        📖 Lição
      </button>
      <button
        type="button"
        role="tab"
        class="segmented-btn ${state.mobileTab === 'workbench' ? 'is-active' : ''}"
        data-mobile-tab="workbench"
        aria-selected="${state.mobileTab === 'workbench'}"
      >
        ⚡ Bancada
      </button>
    </div>

    ${state.sidebarOpenMobile ? `<div class="sidebar-backdrop" data-action="toggle-mobile-sidebar" aria-hidden="true"></div>` : ''}

    <div
      id="academy-grid"
      class="seam-panels academy-grid ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}"
      data-mobile-active="${state.mobileTab}"
      style="--sidebar-w: ${sidebarWidth}px; --lesson-fr: ${lessonRatio}fr; --workbench-fr: ${workbenchRatio}fr; --editor-h: ${editorHeight}px;"
    >
      <!-- Left Sidebar -->
      <nav class="seam-panel sidebar-panel ${state.sidebarOpenMobile ? 'is-open' : ''}" aria-label="Índice de etapas">
        <div class="sidebar-drawer-header">
          <strong>Navegação</strong>
          <button type="button" class="sidebar-drawer-close" data-action="close-mobile-sidebar" aria-label="Fechar índice">✕</button>
        </div>
        <div class="sidebar-track-pills" role="group" aria-label="Escolher trilha">
          ${TRACK_INDEX.map(
            (tr) =>
              `<button type="button" class="sidebar-track-pill ${tr.id === trackMeta.id ? 'is-active' : ''}" data-select-track="${escapeHtml(tr.id)}">${escapeHtml(tr.shortTitle)}</button>`,
          ).join('')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-heading">${escapeHtml(trackMeta.fullTitle)} <span class="sidebar-time-hint">(${escapeHtml(formatHoursApproxPt(getTrackMinutes(trackMeta)))})</span></div>
          <ul class="lesson-nav-list">
            ${trackMeta.lessons
              .map((item) => {
                const isCur = item.id === lessonMeta.id;
                const rec = state.completedLessons[item.id];
                const isDone = Boolean(rec);
                const isHelped = rec?.status === 'helped';
                // Etapa de projeto concluída: autoavaliada, nunca aparece como corrigida.
                const isProjeto = isDone && item.engine === 'projeto';
                const statusClass = isProjeto ? 'is-projeto' : isDone ? (isHelped ? 'is-helped' : 'is-done') : '';
                const rotulo = isProjeto ? `${item.title} (${ESTADO_PROJETO})` : item.title;
                return `
                  <li>
                    <button
                      type="button"
                      class="lesson-nav-btn ${isCur ? 'is-current' : ''} ${statusClass}"
                      data-select-lesson="${escapeHtml(item.id)}"
                      title="${escapeHtml(rotulo)}"
                      ${isProjeto ? `aria-label="${escapeHtml(rotulo)}"` : ''}
                      ${isCur ? 'aria-current="step"' : ''}
                    >
                      <span class="lesson-nav-title">${escapeHtml(item.title)}</span>
                      <span class="lesson-step-id">${isProjeto ? '✓' : isDone ? (isHelped ? 'REF' : 'OK') : escapeHtml(item.code)}</span>
                    </button>
                  </li>
                `;
              })
              .join('')}
          </ul>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-heading">Tabelas na bancada</div>
          <ul class="lesson-nav-list">
            <li class="schema-row"><span>vendas_sazonais</span><span class="lesson-step-id">7031</span></li>
            <li class="schema-row"><span>vendas</span><span class="lesson-step-id">5078</span></li>
            <li class="schema-row"><span>clientes</span><span class="lesson-step-id">120</span></li>
            <li class="schema-row"><span>produtos</span><span class="lesson-step-id">15</span></li>
            <li class="schema-row"><span>vendas_sujas</span><span class="lesson-step-id">12</span></li>
            <li class="schema-row" title="Vista: vendas já juntas com produtos e clientes"><span>vendas_detalhe (vista)</span><span class="lesson-step-id">5078</span></li>
          </ul>
        </div>
      </nav>

      <!-- Resizable Splitter: Sidebar <-> Lesson -->
      <div
        id="splitter-sidebar"
        class="pane-splitter-v splitter-sidebar"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        aria-label="Redimensionar largura do índice lateral"
        title="Arrasta para redimensionar o índice lateral (duplo clique para repor)"
      ></div>

      ${centerAndRightHtml}
    </div>
  `;
}
