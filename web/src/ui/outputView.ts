import type { EngineKind } from '../data/types';
import { escapeHtml } from './html';

// Painel de resultados da bancada (Python, SQL ou Git).

export type OutputStateKind = 'empty' | 'loading' | 'error' | 'full';
export type OutputErrorCategory = 'syntax_runtime' | 'network' | 'timeout' | 'worker_crash';

export function classifyOutputError(errorText?: string): OutputErrorCategory {
  const msg = errorText ?? '';
  if (/não foi possível carregar|failed to fetch|networkerror|network|offline|http \d{3}|jsdelivr/i.test(msg)) {
    return 'network';
  }
  if (/demorou mais de|sem progresso|timeout/i.test(msg)) {
    return 'timeout';
  }
  if (/falha no web worker|worker/i.test(msg)) {
    return 'worker_crash';
  }
  return 'syntax_runtime';
}

export interface OutputViewModel {
  kind: OutputStateKind;
  statusMessage?: string;
  elapsedMs?: number;
  stdout?: string;
  table?: { columns: string[]; rows: (string | number | null)[][]; totalRows?: number; truncated?: boolean };
  checks?: { label: string; passed: boolean; actual?: string; hint?: string }[];
  bannerOk?: boolean;
  bannerText?: string;
  errorText?: string;
  errorCategory?: OutputErrorCategory;
  /** Gráficos matplotlib em PNG (base64). */
  images?: string[];
}

function isTabularStdout(stdout: string): boolean {
  const lines = stdout.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return false;
  return lines.filter((l) => /\s{2,}/.test(l.trim()) || l.includes('|')).length >= 2;
}

export function renderOutputRegion(
  out: OutputViewModel,
  engine: EngineKind,
  opts: { hideStopButton?: boolean } = {},
): string {
  const engineName =
    engine === 'sql'
      ? 'SQLite WebAssembly'
      : engine === 'git'
        ? 'Simulador Git'
        : engine === 'projeto'
          ? 'Projeto'
          : 'Python 3.12 (Pyodide)';

  if (out.kind === 'loading') {
    return `
      <div class="output-panel" role="status" aria-live="polite">
        <div class="output-header">
          <span class="status-chip">${escapeHtml(engineName)}</span>
          <div class="output-header-actions">
            <span class="measured">${escapeHtml(out.statusMessage ?? 'A executar…')}</span>
            ${
              !opts.hideStopButton && (engine === 'python' || engine === 'sql')
                ? '<button type="button" class="btn btn-danger-outline" data-action="stop-code">Parar execução</button>'
                : ''
            }
          </div>
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
    const category = out.errorCategory ?? classifyOutputError(out.errorText);
    const isTransient = category !== 'syntax_runtime';
    const helperText =
      category === 'network'
        ? 'Falha de ligação ao descarregar recursos. Verifica a internet ou dados móveis e tenta novamente.'
        : category === 'timeout'
          ? 'A operação excedeu o tempo limite. Verifica se há ciclos infinitos ou ligação lenta e tenta novamente.'
          : category === 'worker_crash'
            ? 'O motor de execução reiniciou devido a um erro inesperado. Podes tentar novamente.'
            : 'Revê a sintaxe na linha indicada ou clica em Repor código para recomeçar limpo.';
    return `
      <div class="output-panel" role="alert">
        <div class="output-header">
          <span class="status-chip is-bad">${isTransient ? 'Falha de ligação ou execução' : 'Erro de execução'}</span>
          ${out.elapsedMs !== undefined ? `<span class="measured">${out.elapsedMs} ms</span>` : ''}
        </div>
        <div class="error-state">
          <p>${escapeHtml(out.errorText ?? 'Não foi possível concluir a execução.')}</p>
          <p class="helper-slot">${helperText}</p>
          ${
            isTransient
              ? '<div><button type="button" class="btn btn-primary" data-action="run-code">Tentar novamente</button></div>'
              : ''
          }
        </div>
      </div>
    `;
  }

  return `
    <div class="output-panel" aria-live="polite">
      <div class="output-header">
        <span class="status-chip ${out.bannerOk === true ? 'is-ok' : out.bannerOk === false ? 'is-person' : ''}">
          ${out.bannerText ? escapeHtml(out.bannerText) : escapeHtml(`${engineName} executado`)}
        </span>
        ${out.elapsedMs !== undefined ? `<span class="measured">${out.elapsedMs} ms</span>` : ''}
      </div>

      ${out.stdout ? `<pre class="output-stdout${isTabularStdout(out.stdout) ? ' output-stdout--tabular' : ''}">${escapeHtml(out.stdout)}</pre>` : ''}

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
        <div class="table-scroll" tabindex="0">
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
                              const isNum =
                                typeof cell === 'number' || (typeof cell === 'string' && /^-?\d+(\.\d+)?$/.test(cell));
                              return `<td class="${isNum ? 'mono-cell' : ''}">${cell === null ? 'NULL' : escapeHtml(String(cell))}</td>`;
                            })
                            .join('')}</tr>`,
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
        ${
          out.table.rows.length > 25 || out.table.truncated
            ? `<p class="helper-slot">A mostrar ${Math.min(25, out.table.rows.length)} de ${out.table.totalRows ?? out.table.rows.length} linhas${out.table.truncated ? ' (transferência limitada a 500)' : ''}.</p>`
            : ''
        }
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
