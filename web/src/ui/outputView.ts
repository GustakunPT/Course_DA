import type { EngineKind } from '../data/types';
import { escapeHtml } from './html';

// Painel de resultados da bancada (Python, SQL ou Git).

export type OutputStateKind = 'empty' | 'loading' | 'error' | 'full';

export interface OutputViewModel {
  kind: OutputStateKind;
  statusMessage?: string;
  elapsedMs?: number;
  stdout?: string;
  table?: { columns: string[]; rows: (string | number | null)[][] };
  checks?: { label: string; passed: boolean; actual?: string; hint?: string }[];
  bannerOk?: boolean;
  bannerText?: string;
  errorText?: string;
  /** Gráficos matplotlib em PNG (base64). */
  images?: string[];
}

export function renderOutputRegion(out: OutputViewModel, engine: EngineKind): string {
  const engineName =
    engine === 'sql' ? 'SQLite WebAssembly' : engine === 'git' ? 'Simulador Git' : engine === 'projeto' ? 'Projeto' : 'Python 3.12 (Pyodide)';

  if (out.kind === 'loading') {
    return `
      <div class="output-panel" role="status" aria-live="polite">
        <div class="output-header">
          <span class="status-chip">${escapeHtml(engineName)}</span>
          <span class="measured">${escapeHtml(out.statusMessage ?? 'A executar…')}</span>
        </div>
        <div class="skeleton-stack">
          <div class="skeleton-bar"></div>
          <div class="skeleton-bar"></div>
          <div class="skeleton-bar"></div>
        </div>
      </div>
    `;
  }

  if (out.kind === 'empty') {
    return `
      <div class="output-panel">
        <div class="output-header">
          <span class="status-chip">${escapeHtml(engineName)}</span>
          <span class="measured">Pronto a executar</span>
        </div>
        <div class="empty-state">
          <p>O resultado das tuas queries SQL, código Python/Pandas ou comandos Git aparece aqui em tempo real.</p>
          <div>
            <button type="button" class="btn" data-action="run-code">Executar código atual</button>
          </div>
        </div>
      </div>
    `;
  }

  if (out.kind === 'error') {
    return `
      <div class="output-panel" role="alert">
        <div class="output-header">
          <span class="status-chip is-bad">Erro de execução</span>
          ${out.elapsedMs !== undefined ? `<span class="measured">${out.elapsedMs} ms</span>` : ''}
        </div>
        <div class="error-state">
          <p>${escapeHtml(out.errorText ?? 'Não foi possível concluir a execução.')}</p>
          <p class="helper-slot">Revê a sintaxe na linha indicada ou clica em Repor código para recomeçar limpo.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="output-panel" aria-live="polite">
      <div class="output-header">
        <span class="status-chip ${out.bannerOk === true ? 'is-ok' : out.bannerOk === false ? 'is-person' : ''}">
          ${
            out.bannerText
              ? escapeHtml(out.bannerText)
              : escapeHtml(`${engineName} executado`)
          }
        </span>
        ${out.elapsedMs !== undefined ? `<span class="measured">${out.elapsedMs} ms</span>` : ''}
      </div>

      ${out.stdout ? `<pre class="output-stdout">${escapeHtml(out.stdout)}</pre>` : ''}

      ${(out.images ?? [])
        .filter((png) => /^[A-Za-z0-9+/=]+$/.test(png))
        .map(
          (png, i) =>
            `<figure class="output-figure"><img src="data:image/png;base64,${png}" alt="Gráfico ${i + 1} desenhado pelo teu código" /></figure>`,
        )
        .join('')}

      ${
        out.table && out.table.columns.length > 0
          ? `
        <div class="table-scroll">
          <table class="data-table">
            <caption class="visually-hidden">Resultados da execução SQL ou Python/Pandas</caption>
            <thead>
              <tr>${out.table.columns.map((c) => `<th scope="col">${escapeHtml(c)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${
                out.table.rows.length === 0
                  ? `<tr><td colspan="${out.table.columns.length}">0 linhas devolvidas pela consulta.</td></tr>`
                  : out.table.rows
                      .slice(0, 25)
                      .map(
                        (row) =>
                          `<tr>${row
                            .map((cell) => {
                              const isNum = typeof cell === 'number' || (typeof cell === 'string' && /^-?\d+(\.\d+)?$/.test(cell));
                              return `<td class="${isNum ? 'mono-cell' : ''}">${cell === null ? 'NULL' : escapeHtml(String(cell))}</td>`;
                            })
                            .join('')}</tr>`,
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      `
          : ''
      }

      ${
        out.checks && out.checks.length > 0
          ? `
        <ul class="check-list">
          ${out.checks
            .map(
              (c) => `
            <li class="check-row ${c.passed ? 'pass' : 'fail'}">
              <strong class="measured">${c.passed ? '[certo]' : '[rever]'}</strong>
              <span>${escapeHtml(c.label)}</span>
              ${!c.passed && c.actual !== undefined ? `<span class="measured">(obtido: ${escapeHtml(c.actual)})</span>` : ''}
              ${!c.passed && c.hint ? `<span>Dica: ${escapeHtml(c.hint)}</span>` : ''}
            </li>
          `,
            )
            .join('')}
        </ul>
      `
          : ''
      }
    </div>
  `;
}
