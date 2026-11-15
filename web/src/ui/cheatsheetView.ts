import { cheatsheets } from '../data/curriculum';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCheatsheetHtml(query: string, categoryFilter: string): string {
  const categories = ['Todas', 'Python', 'SQL', 'Pandas', 'Git', 'BI & DAX'];
  const q = query.trim().toLowerCase();

  const filtered = cheatsheets.filter((item) => {
    if (categoryFilter !== 'Todas' && item.category !== categoryFilter) return false;
    if (!q) return true;
    return (
      item.topic.toLowerCase().includes(q) ||
      item.syntax.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  return `
    <section class="seam-panels">
      <div class="seam-panel">
        <div class="workbench-toolbar">
          <div>
            <h1>Referência rápida de sintaxe para Analistas de Dados</h1>
            <p class="lesson-lede">Consulta comparada estilo W3Schools entre Python, SQL, Pandas, Git e DAX. Podes testar cada receita diretamente na bancada.</p>
          </div>
          <div class="filter-bar">
            <label for="ref-search" class="visually-hidden">Pesquisar sintaxe ou comando</label>
            <input
              id="ref-search"
              name="pesquisa"
              type="search"
              autocomplete="off"
              class="input-field"
              placeholder="Pesquisar comando (ex.: JOIN, groupby, git)…"
              value="${escapeHtml(query)}"
            />
            <label for="ref-cat" class="visually-hidden">Filtrar ferramenta</label>
            <select id="ref-cat" name="ferramenta" class="select-field">
              ${categories
                .map((c) => `<option value="${escapeHtml(c)}" ${categoryFilter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`)
                .join('')}
            </select>
          </div>
        </div>
      </div>
    </section>

    ${
      filtered.length === 0
        ? `
      <section class="seam-panels">
        <div class="seam-panel empty-state">
          <h2>Nenhum cartão de referência encontrado</h2>
          <p>Não encontrámos comandos para esse termo na ferramenta selecionada.</p>
          <div>
            <button type="button" class="btn btn-primary" data-action="clear-ref-search">Mostrar toda a referência</button>
          </div>
        </div>
      </section>
    `
        : `
      <section class="seam-panels">
        <div class="seam-panel">
          <div class="table-scroll">
            <table class="data-table">
              <caption class="visually-hidden">Folha de referência rápida W3Schools de Python, SQL, Pandas, Git e BI</caption>
              <thead>
                <tr>
                  <th scope="col">Ferramenta</th>
                  <th scope="col">Tarefa</th>
                  <th scope="col">Sintaxe de referência</th>
                  <th scope="col">Explicação prática</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map((entry, idx) => {
                    const globalIdx = cheatsheets.indexOf(entry);
                    return `
                      <tr>
                        <td><span class="status-chip">${escapeHtml(entry.category)}</span></td>
                        <td>${escapeHtml(entry.topic)}</td>
                        <td class="mono-cell"><code>${escapeHtml(entry.syntax)}</code></td>
                        <td>${escapeHtml(entry.description)}</td>
                        <td>
                          ${
                            entry.tryEngine && entry.trySnippet
                              ? `<button type="button" class="btn" data-try-ref="${globalIdx}" id="try-ref-${idx}">Testar na bancada</button>`
                              : `<span class="measured">Power BI</span>`
                          }
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `
    }
  `;
}
