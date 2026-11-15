import type { MerceariaDataset } from '../engines/csvEngine';

export interface ExplorerFilters {
  serie: 'sazonal' | 'base';
  cidade: string;
  categoria: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderExplorerHtml(dataset: MerceariaDataset, filters: ExplorerFilters): string {
  const catByProdId = new Map(dataset.produtos.map((p) => [p.id, p.categoria]));
  const cityByClientId = new Map(dataset.clientes.map((c) => [c.id, c.cidade]));

  const cidades = Array.from(new Set(dataset.clientes.map((c) => c.cidade))).sort();
  const categorias = Array.from(new Set(dataset.produtos.map((p) => p.categoria))).sort();

  const activeRows = filters.serie === 'sazonal' ? dataset.vendasSazonais : dataset.vendas;

  const filtered = activeRows.filter((v) => {
    const cid = cityByClientId.get(v.cliente_id) ?? '';
    const cat = catByProdId.get(v.produto_id) ?? '';
    if (filters.cidade !== 'todas' && cid !== filters.cidade) return false;
    if (filters.categoria !== 'todas' && cat !== filters.categoria) return false;
    return true;
  });

  if (filtered.length === 0) {
    return `
      <section class="seam-panels">
        <div class="seam-panel empty-state">
          <h1>Explorador analítico da Mercearia</h1>
          <p>Nenhuma venda corresponde à combinação selecionada de cidade e categoria.</p>
          <div>
            <button type="button" class="btn btn-primary" data-action="reset-explorer-filters">Limpar filtros ativos</button>
          </div>
        </div>
      </section>
    `;
  }

  let totalFaturacao = 0;
  const activeClients = new Set<number>();
  const byMonth = new Map<string, number>();
  const clientsByMonth = new Map<string, Set<number>>();
  const byProd = new Map<string, number>();
  const byCity = new Map<string, number>();

  for (let m = 1; m <= 12; m++) {
    const key = `2025-${String(m).padStart(2, '0')}`;
    byMonth.set(key, 0);
    clientsByMonth.set(key, new Set());
  }

  for (const v of filtered) {
    const sub = v.quantidade * v.preco;
    totalFaturacao += sub;
    activeClients.add(v.cliente_id);
    const mes = v.data.slice(0, 7);
    byMonth.set(mes, (byMonth.get(mes) ?? 0) + sub);
    clientsByMonth.get(mes)?.add(v.cliente_id);
    byProd.set(v.produto, (byProd.get(v.produto) ?? 0) + sub);
    const cid = cityByClientId.get(v.cliente_id) ?? 'Outra';
    byCity.set(cid, (byCity.get(cid) ?? 0) + sub);
  }

  const mediaLinha = totalFaturacao / filtered.length;
  const monthEntries = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxMonthVal = Math.max(...monthEntries.map((e) => e[1]), 1);

  const svgWidth = 680;
  const svgHeight = 210;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const plotW = svgWidth - padL - padR;
  const plotH = svgHeight - padT - padB;

  const points = monthEntries.map(([mes, val], idx) => {
    const x = padL + (idx / Math.max(monthEntries.length - 1, 1)) * plotW;
    const y = padT + plotH - (val / maxMonthVal) * plotH;
    return { mes: mes.slice(5), val, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const polylinePts = points.map((p) => `${p.x},${p.y}`).join(' ');

  const prodSorted = Array.from(byProd.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxProd = prodSorted[0]?.[1] ?? 1;

  const citySorted = Array.from(byCity.entries()).sort((a, b) => b[1] - a[1]);
  const maxCity = citySorted[0]?.[1] ?? 1;

  return `
    <section class="seam-panels">
      <div class="seam-panel">
        <div class="workbench-toolbar">
          <div>
            <h1>Explorador analítico, sazonalidade e templates Power BI / Excel</h1>
            <p class="lesson-lede">Compare a série sazonal realista (crescimento de coortes de clientes, verão, Páscoa e Natal) com a série base de reconciliação, e descarregue o modelo Power BI (.pbip/.tmdl) e o dashboard Excel (.xlsx).</p>
          </div>
          <div class="filter-bar">
            <label for="f-serie" class="visually-hidden">Série de dados</label>
            <select id="f-serie" name="serie" class="select-field" data-filter="serie">
              <option value="sazonal" ${filters.serie === 'sazonal' ? 'selected' : ''}>Sazonal Realista (vendas_sazonais.csv · 7 031 linhas)</option>
              <option value="base" ${filters.serie === 'base' ? 'selected' : ''}>Base Reconciliação (vendas.csv · 5 078 linhas)</option>
            </select>

            <label for="f-cidade" class="visually-hidden">Filtrar por cidade</label>
            <select id="f-cidade" name="cidade" class="select-field" data-filter="cidade">
              <option value="todas" ${filters.cidade === 'todas' ? 'selected' : ''}>Todas as cidades (6)</option>
              ${cidades.map((c) => `<option value="${escapeHtml(c)}" ${filters.cidade === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>

            <label for="f-categoria" class="visually-hidden">Filtrar por categoria</label>
            <select id="f-categoria" name="categoria" class="select-field" data-filter="categoria">
              <option value="todas" ${filters.categoria === 'todas' ? 'selected' : ''}>Todas as categorias (5)</option>
              ${categorias.map((c) => `<option value="${escapeHtml(c)}" ${filters.categoria === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>

            ${
              filters.cidade !== 'todas' || filters.categoria !== 'todas'
                ? `<button type="button" class="btn" data-action="reset-explorer-filters">Repor filtros</button>`
                : ''
            }
          </div>
        </div>
      </div>
    </section>

    <section class="seam-panels">
      <div class="seam-panel">
        <div class="workbench-toolbar">
          <div>
            <h2>Transferência direta de artefactos Power BI e Excel (Fase 4)</h2>
            <p class="helper-slot">Inclui o modelo semântico Star Schema com relacionamentos 1:* e 8 medidas DAX (Faturação Total, Ticket Médio, Clientes Ativos, LTV, Quota % e Acumulado YTD).</p>
          </div>
          <div class="filter-bar">
            <a href="/relatorios/PowerBI_Mercearia_do_Bairro_PBIP.zip" download class="btn btn-primary">
              Descarregar Power BI (.pbip + DAX)
            </a>
            <a href="/relatorios/Dashboard_Mercearia_do_Bairro_2025.xlsx" download class="btn">
              Descarregar Excel (.xlsx)
            </a>
            <a href="/relatorios/relatorio_executivo_2025.md" download class="btn">
              Relatório Executivo (.md)
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="seam-panels kpi-grid" aria-label="Indicadores principais">
      <div class="seam-panel">
        <div class="kpi-reading">${totalFaturacao.toFixed(2)} €</div>
        <div class="kpi-label">Faturação acumulada</div>
      </div>
      <div class="seam-panel">
        <div class="kpi-reading">${filtered.length}</div>
        <div class="kpi-label">Linhas de venda registadas</div>
      </div>
      <div class="seam-panel">
        <div class="kpi-reading">${mediaLinha.toFixed(2)} €</div>
        <div class="kpi-label">Valor médio por linha</div>
      </div>
      <div class="seam-panel">
        <div class="kpi-reading">${activeClients.size} / ${dataset.clientes.length}</div>
        <div class="kpi-label">Clientes ativos na seleção</div>
      </div>
    </section>

    <section class="seam-panels explorer-two-col">
      <div class="seam-panel prose-section">
        <h2>Faturação mensal em 2025 (eixo iniciado a zero)</h2>
        <p>Evolução mês a mês calculada diretamente sobre dados/vendas.csv.</p>
        <div class="chart-scroll-wrap">
          <svg class="chart-svg chart-data" viewBox="0 0 ${svgWidth} ${svgHeight}" role="img" aria-label="Gráfico de linha da faturação mensal de janeiro a dezembro de 2025">
            <line x1="${padL}" y1="${padT + plotH}" x2="${svgWidth - padR}" y2="${padT + plotH}" stroke="var(--color-rule-2)" stroke-width="1" />
            <line x1="${padL}" y1="${padT}" x2="${svgWidth - padR}" y2="${padT}" stroke="var(--color-rule)" stroke-dasharray="3 3" stroke-width="1" />
            <text x="4" y="${padT + 10}" fill="var(--color-muted)" font-size="12" font-family="var(--font-outlier)">${Math.round(maxMonthVal)} €</text>
            <text x="4" y="${padT + plotH}" fill="var(--color-muted)" font-size="12" font-family="var(--font-outlier)">0 €</text>
            <polyline fill="none" stroke="var(--color-cool)" stroke-width="2.2" points="${polylinePts}" />
            ${points
              .map(
                (p) => `
              <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="var(--color-accent)" />
              <text x="${p.x}" y="${svgHeight - 10}" text-anchor="middle" fill="var(--color-muted)" font-size="12" font-family="var(--font-outlier)">${p.mes}</text>
            `,
              )
              .join('')}
          </svg>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <caption class="visually-hidden">Faturação mensal, clientes ativos e gasto médio por cliente em 2025</caption>
            <thead>
              <tr><th scope="col">Mês</th><th scope="col">Faturação</th><th scope="col">Clientes ativos</th><th scope="col">Gasto médio / cliente</th></tr>
            </thead>
            <tbody>
              ${monthEntries
                .map(([mes, val]) => {
                  const nCli = clientsByMonth.get(mes)?.size ?? 0;
                  const ltv = nCli > 0 ? val / nCli : 0;
                  return `
                    <tr>
                      <td class="mono-cell">${mes}</td>
                      <td class="mono-cell">${val.toFixed(2)} €</td>
                      <td class="mono-cell">${nCli}</td>
                      <td class="mono-cell">${ltv.toFixed(2)} €</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="seam-panel prose-section">
        <h2>Top 8 artigos por faturação</h2>
        <div class="prose-section">
          ${prodSorted
            .map(([prod, val], idx) => {
              const pct = Math.max(2, Math.round((val / maxProd) * 100));
              return `
                <div class="bar-row">
                  <span class="bar-name" title="${escapeHtml(prod)}">${escapeHtml(prod)}</span>
                  <div class="bar-track"><div class="bar-fill ${idx < 2 ? 'is-accent' : ''}" style="width: ${pct}%"></div></div>
                  <span class="measured">${val.toFixed(2)} €</span>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    </section>

    <section class="seam-panels explorer-two-col">
      <div class="seam-panel prose-section">
        <h2>Auditoria linha a linha de dados/vendas_sujas.csv</h2>
        <p>As 12 linhas reais usadas na Etapa 16 de limpeza: registos a verde estão limpos; registos assinalados a vermelho exigem tratamento.</p>
        <div class="table-scroll">
          <table class="data-table">
            <caption class="visually-hidden">Auditoria de anomalias e qualidade de dados em vendas_sujas.csv</caption>
            <thead>
              <tr>
                <th scope="col">Linha</th>
                <th scope="col">Data</th>
                <th scope="col">Produto bruto</th>
                <th scope="col">Qtd</th>
                <th scope="col">Preço bruto</th>
                <th scope="col">Diagnóstico de qualidade</th>
              </tr>
            </thead>
            <tbody>
              ${dataset.vendasSujas
                .map(
                  (r) => `
                <tr class="${r.problemas.length ? 'diff-minus' : 'diff-plus'}">
                  <td class="mono-cell">${r.linha}</td>
                  <td class="mono-cell">${escapeHtml(r.data)}</td>
                  <td class="mono-cell">${escapeHtml(JSON.stringify(r.produto))}</td>
                  <td class="mono-cell">${escapeHtml(r.quantidade || 'NULL')}</td>
                  <td class="mono-cell">${escapeHtml(r.preco)}</td>
                  <td>${r.problemas.length ? escapeHtml(r.problemas.join(', ')) : 'Válida'}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="seam-panel prose-section">
        <h2>Distribuição geográfica por cidade</h2>
        <div class="prose-section">
          ${citySorted
            .map(([cid, val]) => {
              const pct = Math.max(4, Math.round((val / maxCity) * 100));
              return `
                <div class="bar-row">
                  <span class="bar-name" title="${escapeHtml(cid)}">${escapeHtml(cid)}</span>
                  <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
                  <span class="measured">${val.toFixed(2)} €</span>
                </div>
              `;
            })
            .join('')}
        </div>

        <h2>Catálogo oficial (dados/produtos.csv)</h2>
        <div class="table-scroll">
          <table class="data-table">
            <caption class="visually-hidden">Catálogo de produtos e preços unitários da Mercearia do Bairro</caption>
            <thead>
              <tr><th scope="col">ID</th><th scope="col">Artigo</th><th scope="col">Categoria</th><th scope="col">Preço unitário</th></tr>
            </thead>
            <tbody>
              ${dataset.produtos
                .slice(0, 8)
                .map(
                  (p) => `
                <tr>
                  <td class="mono-cell">${p.id}</td>
                  <td>${escapeHtml(p.nome)}</td>
                  <td>${escapeHtml(p.categoria)}</td>
                  <td class="mono-cell">${p.preco.toFixed(2)} €</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
