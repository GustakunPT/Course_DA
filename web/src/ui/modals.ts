import { allTracks, totalLessonsCount } from '../data/curriculum';
import type { AppState } from './appState';
import { escapeHtml } from './html';
import { THEME_OPTIONS } from './theme';

// Janelas modais: escolha de tema e gestão de progresso/sincronização.

export function renderThemeModal(state: AppState): string {
  return `
    <div class="modal-backdrop" data-action="close-theme-backdrop" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title">
      <div class="modal-card seam-panel">
        <div class="modal-head">
          <div>
            <span class="badge-chip">Aparência · 5 estilos</span>
            <h2 id="theme-modal-title">Escolher estilo visual</h2>
            <p class="measured">Personaliza as cores, contraste e tipografia da academia. A tua escolha fica guardada neste dispositivo.</p>
          </div>
          <button type="button" class="btn" data-action="close-theme-modal" aria-label="Fechar seletor de estilo">Fechar</button>
        </div>
        <div class="theme-grid">
          ${THEME_OPTIONS.map((opt) => {
            const active = state.theme === opt.id;
            return `
              <button
                type="button"
                class="theme-option-card ${active ? 'is-active' : ''}"
                data-action="select-theme"
                data-theme-id="${opt.id}"
                aria-pressed="${active ? 'true' : 'false'}"
              >
                <div class="theme-option-top">
                  <strong>${escapeHtml(opt.label)}</strong>
                  <span class="theme-swatches" aria-hidden="true">
                    ${opt.swatches.map((hex) => `<span class="theme-swatch" style="background:${hex};"></span>`).join('')}
                  </span>
                </div>
                <span class="status-chip ${active ? 'is-ok' : ''}">${active ? 'Ativo · ' : ''}${escapeHtml(opt.tag)}</span>
                <span class="theme-option-desc">${escapeHtml(opt.desc)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderProgressModal(state: AppState): string {
  const entries = Object.values(state.completedLessons);
  const doneCount = entries.length;
  // As etapas de projeto são autoavaliadas: contam no seu próprio cartão, não em "Resolvidas s/ ajuda".
  const etapasProjeto = allTracks.flatMap((tr) => tr.lessons.filter((l) => l.engine === 'projeto'));
  const idsProjeto = new Set(etapasProjeto.map((l) => l.id));
  const projetoFeitas = etapasProjeto.filter((l) => state.completedLessons[l.id]).length;
  const autonomousCount = Object.entries(state.completedLessons).filter(
    ([id, e]) => e.status === 'autonomous' && !idsProjeto.has(id),
  ).length;
  const quizCorrectCount = allTracks.reduce((acc, tr) => {
    return (
      acc +
      tr.lessons.filter((l) => {
        const sel = state.quizSelection[l.id];
        return sel !== undefined && sel === l.quiz.correctIndex;
      }).length
    );
  }, 0);

  return `
    <div class="modal-backdrop" data-action="close-progress-backdrop" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
      <div class="progress-modal">
        <div class="workbench-toolbar">
          <div>
            <h2 id="progress-modal-title">Progresso, Código de Retoma & Portfólio</h2>
            <p class="measured">O teu progresso, rascunhos de código e quizzes ficam guardados automaticamente neste navegador.</p>
          </div>
          <button type="button" class="btn" data-action="close-progress-modal" aria-label="Fechar janela">Fechar</button>
        </div>

        <div class="progress-summary-grid">
          <div class="progress-stat-card">
            <div class="progress-stat-val">${doneCount} / ${totalLessonsCount}</div>
            <div class="progress-stat-lbl">Etapas concluídas</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${autonomousCount}</div>
            <div class="progress-stat-lbl">Resolvidas s/ ajuda</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${quizCorrectCount} / ${totalLessonsCount}</div>
            <div class="progress-stat-lbl">Quizzes certos</div>
          </div>
          ${
            etapasProjeto.length
              ? `<div class="progress-stat-card is-projeto">
            <div class="progress-stat-val">${projetoFeitas} / ${etapasProjeto.length}</div>
            <div class="progress-stat-lbl">Projeto final (autoavaliado)</div>
          </div>`
              : ''
          }
        </div>

        <div class="progress-track-list">
          ${allTracks
            .map((tr) => {
              const trDone = tr.lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
              const pct = Math.round((trDone / tr.lessons.length) * 100);
              return `
                <div class="progress-track-row">
                  <span>${escapeHtml(tr.shortTitle)}</span>
                  <span class="measured">${trDone}/${tr.lessons.length}</span>
                  <div class="progress-bar-bg" aria-hidden="true">
                    <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <div class="hints-panel">
          <strong>Sincronização na Cloud (sem login)</strong>
          <p class="measured">Liga este dispositivo a um código (<code>MB-XXXX-XXXX-XXXX</code>) para sincronizar automaticamente o progresso entre telemóvel e PC.</p>
          ${
            state.syncCode
              ? `<div class="action-pair" style="align-items:center;flex-wrap:wrap;gap:8px;">
                  <span class="status-chip is-ok">${escapeHtml(state.syncCode)}</span>
                  <span class="status-chip">${
                    state.syncStatus === 'syncing'
                      ? 'A sincronizar…'
                      : state.syncStatus === 'error'
                        ? 'Erro de rede (guardado local)'
                        : 'Sincronizado na cloud'
                  }</span>
                </div>
                <div class="action-pair" style="margin-top:8px;flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" data-action="copy-sync-link">Copiar link de retoma</button>
                  <button type="button" class="btn" data-action="sync-now">Sincronizar agora</button>
                  <button type="button" class="btn" data-action="disconnect-cloud-sync">Desligar</button>
                </div>`
              : `<div class="action-pair" style="flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" data-action="activate-cloud-sync">Ativar código na cloud</button>
                  <button type="button" class="btn" data-action="generate-progress-code">Gerar código offline (MB1)</button>
                </div>`
          }
          ${
            state.generatedProgressCode
              ? `<div class="action-pair" style="margin-top:6px;">
                  <input type="text" readonly class="code-input-inline" id="generated-code-field" value="${escapeHtml(state.generatedProgressCode)}" aria-label="Código de progresso gerado" style="flex:1;min-width:180px;padding:6px 10px;font-family:var(--font-mono);font-size:var(--text-xs);background:var(--color-paper-3);color:var(--color-ink);border:var(--rule-hair) solid var(--color-rule);border-radius:var(--radius-chip);" />
                </div>`
              : ''
          }
          <div class="action-pair" style="margin-top:8px;">
            <input
              type="text"
              id="progress-code-input"
              placeholder="Cola MB-XXXX-XXXX-XXXX, link ?sync=… ou MB1-…"
              value="${escapeHtml(state.progressCodeInput)}"
              aria-label="Colar código de sincronização ou progresso"
              style="flex:1;min-width:200px;padding:6px 10px;font-family:var(--font-mono);font-size:var(--text-xs);background:var(--color-paper-3);color:var(--color-ink);border:var(--rule-hair) solid var(--color-rule);border-radius:var(--radius-chip);"
            />
            <button type="button" class="btn" data-action="apply-progress-code">Continuar com código</button>
          </div>
          ${
            state.progressModalFeedback
              ? `<div class="helper-slot ${state.progressModalFeedback.ok ? 'is-ok' : 'is-bad'}">${escapeHtml(state.progressModalFeedback.text)}</div>`
              : ''
          }
        </div>

        <div class="modal-actions-row">
          <div class="action-pair">
            <button type="button" class="btn btn-primary" data-action="export-portfolio-md">Descarregar Portfólio (.md)</button>
            <button type="button" class="btn" data-action="export-progress-json">Backup (.json)</button>
            <button type="button" class="btn" data-action="trigger-import-json">Restaurar (.json)</button>
            <input type="file" id="import-progress-file" accept=".json,application/json" aria-label="Selecionar ficheiro JSON de cópia de segurança do progresso" style="display:none" />
          </div>
          <div class="action-pair">
            ${
              state.confirmClearProgress
                ? `<button type="button" class="btn" data-action="confirm-clear-progress" style="color:var(--color-bad);">Confirmar limpeza</button>
                   <button type="button" class="btn" data-action="cancel-clear-progress">Cancelar</button>`
                : `<button type="button" class="btn" data-action="ask-clear-progress">Limpar progresso</button>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}
