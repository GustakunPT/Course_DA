import type { WorkbenchTab } from './appState';
import { escapeHtml } from './html';

export interface AnswerFieldSpec {
  varName: string;
  label: string;
  hint: string;
  kind: 'number' | 'text';
  placeholder: string;
  section?: string;
}

export interface AnswerSheetSpec {
  title: string;
  subtitle: string;
  fields: AnswerFieldSpec[];
}

export const ANSWER_SHEETS: Record<string, AnswerSheetSpec> = {
  'bi-10-pratica-excel-powerbi': {
    title: 'Folha de respostas · Excel & Power BI',
    subtitle: 'Preenche diretamente os valores calculados no Excel e Power BI (2 casas decimais para euros).',
    fields: [
      {
        section: 'Excel (vendas.csv e produtos.csv)',
        varName: 'total_faturacao',
        label: '1. Faturação total (€)',
        hint: 'Soma da coluna Subtotal nas 5 078 linhas',
        kind: 'number',
        placeholder: 'ex.: 26902.89',
      },
      {
        section: 'Excel (vendas.csv e produtos.csv)',
        varName: 'faturacao_pao',
        label: '2. Faturação do Pão (€)',
        hint: 'SOMA.SE.S com critério produto = "Pão"',
        kind: 'number',
        placeholder: 'ex.: 205.50',
      },
      {
        section: 'Excel (vendas.csv e produtos.csv)',
        varName: 'faturacao_charcutaria',
        label: '3. Faturação da Charcutaria (€)',
        hint: 'PROCX para Categoria + SOMA.SE.S',
        kind: 'number',
        placeholder: 'ex.: 6756.00',
      },
      {
        section: 'Excel (vendas.csv e produtos.csv)',
        varName: 'mes_top',
        label: '4a. Mês com mais faturação',
        hint: 'Formato AAAA-MM (ex.: 2025-01)',
        kind: 'text',
        placeholder: 'ex.: 2025-09',
      },
      {
        section: 'Excel (vendas.csv e produtos.csv)',
        varName: 'faturacao_mes_top',
        label: '4b. Faturação do mês líder (€)',
        hint: 'Valor do mês no topo da Tabela Dinâmica',
        kind: 'number',
        placeholder: 'ex.: 2462.82',
      },
      {
        section: 'Power BI (medidas DAX e matriz)',
        varName: 'clientes_ativos',
        label: '5. Clientes Ativos (n.º único)',
        hint: 'DISTINCTCOUNT(vendas[cliente_id])',
        kind: 'number',
        placeholder: 'ex.: 120',
      },
      {
        section: 'Power BI (medidas DAX e matriz)',
        varName: 'gasto_por_cliente',
        label: '6. Gasto por Cliente (€)',
        hint: 'DIVIDE([Faturação], [Clientes Ativos])',
        kind: 'number',
        placeholder: 'ex.: 224.19',
      },
      {
        section: 'Power BI (medidas DAX e matriz)',
        varName: 'cidade_top',
        label: '7. Cidade com maior faturação',
        hint: 'Nome da cidade no topo da Matriz',
        kind: 'text',
        placeholder: 'ex.: Lisboa',
      },
    ],
  },
  'bi-20-excel-powerquery-limpeza': {
    title: 'Folha de respostas · Excel & Power Query',
    subtitle: 'Preenche os 5 valores obtidos sobre loja_online_pedidos.csv após importação correta.',
    fields: [
      {
        varName: 'valor_bruto_total',
        label: '1. Valor bruto total (€)',
        hint: 'Soma de quantidade * preco_unit nas 2 700 linhas',
        kind: 'number',
        placeholder: 'ex.: 274466.03',
      },
      {
        varName: 'faturacao_liquida',
        label: '2. Faturação líquida (€)',
        hint: 'Soma apenas onde estado = "Concluído"',
        kind: 'number',
        placeholder: 'ex.: 246900.06',
      },
      {
        varName: 'pedidos_concluidos',
        label: '3. Pedidos concluídos (contagem)',
        hint: 'CONTAR.SE estado = "Concluído"',
        kind: 'number',
        placeholder: 'ex.: 2432',
      },
      {
        varName: 'pedidos_cancelados',
        label: '4. Pedidos cancelados (contagem)',
        hint: 'CONTAR.SE estado = "Cancelado"',
        kind: 'number',
        placeholder: 'ex.: 268',
      },
      {
        varName: 'taxa_cancelamento_pct',
        label: '5. Taxa de cancelamento (%)',
        hint: 'Cancelados / Total * 100 (2 casas decimais)',
        kind: 'number',
        placeholder: 'ex.: 9.93',
      },
    ],
  },
  'bi-21-excel-dinamicas-procx': {
    title: 'Folha de respostas · Tabelas Dinâmicas & SOMA.SE.S',
    subtitle: 'Indica os 5 valores da tua Tabela Dinâmica (Região × Canal filtrada a Concluído) e SOMA.SE.S.',
    fields: [
      {
        varName: 'eletronica_lisboa',
        label: '1. Eletrónica concluída em Lisboa (€)',
        hint: 'SOMA.SE.S com 3 critérios (Concluído, Eletrónica, Lisboa)',
        kind: 'number',
        placeholder: 'ex.: 23411.22',
      },
      {
        varName: 'ticket_medio_eletr',
        label: '2. Ticket médio de Eletrónica concluída (€)',
        hint: 'MÉDIA.SE.S sobre Valor em Concluído + Eletrónica',
        kind: 'number',
        placeholder: 'ex.: 152.97',
      },
      {
        varName: 'regiao_lider_total',
        label: '3. Região líder no total',
        hint: 'Região com maior Soma de Valor na Tabela Dinâmica',
        kind: 'text',
        placeholder: 'ex.: Lisboa',
      },
      {
        varName: 'web_lisboa',
        label: '4. Cruzamento Lisboa × Web (€)',
        hint: 'Valor da célula Lisboa / Web (apenas Concluído)',
        kind: 'number',
        placeholder: 'ex.: 40301.95',
      },
      {
        varName: 'app_norte',
        label: '5. Cruzamento Norte × App (€)',
        hint: 'Valor da célula Norte / App (apenas Concluído)',
        kind: 'number',
        placeholder: 'ex.: 24544.32',
      },
    ],
  },
  'bi-22-powerbi-dax-relatorio': {
    title: 'Folha de respostas · Power BI (Medidas DAX)',
    subtitle: 'Preenche os 5 valores calculados pelas tuas medidas DAX sobre loja_online_pedidos.csv.',
    fields: [
      {
        varName: 'faturacao_web',
        label: '1. Faturação Líquida Web (€)',
        hint: 'CALCULATE([Faturação Líquida], pedidos[canal] = "Web")',
        kind: 'number',
        placeholder: 'ex.: 148276.61',
      },
      {
        varName: 'quota_web_pct',
        label: '2. Quota Web (%)',
        hint: 'Peso percentual do canal Web (2 casas decimais)',
        kind: 'number',
        placeholder: 'ex.: 60.06',
      },
      {
        varName: 'clientes_concluidos',
        label: '3. Clientes únicos concluídos',
        hint: 'CALCULATE(DISTINCTCOUNT(pedidos[cliente_id]), Concluído)',
        kind: 'number',
        placeholder: 'ex.: 632',
      },
      {
        varName: 'categoria_lider',
        label: '4. Categoria líder em faturação',
        hint: 'Nome da categoria no topo da matriz',
        kind: 'text',
        placeholder: 'ex.: Eletrónica',
      },
      {
        varName: 'faturacao_cat_lider',
        label: '5. Faturação líquida da categoria líder (€)',
        hint: 'Valor de [Faturação Líquida] nessa categoria',
        kind: 'number',
        placeholder: 'ex.: 92853.76',
      },
    ],
  },
};

export function isAnswerSheetMode(lessonId: string, wbTab: WorkbenchTab, practiceIdx: number): boolean {
  return wbTab === 'challenge' && practiceIdx === 0 && Object.hasOwn(ANSWER_SHEETS, lessonId);
}

/** Normaliza números colados do Excel em português (ex.: "26 902,89 €" -> "26902.89"). */
export function normalizePtNumberInput(raw: string): string {
  let s = raw.replace(/[€%\s\u00a0]/g, '').trim();
  if (!s) return '';
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    s = s.replace(',', '.');
  }
  return s;
}

function unquotePythonLiteral(rawExpr: string): string {
  const trimmed = rawExpr.trim();
  if (!trimmed || trimmed === 'None') return '';
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      if (trimmed.startsWith('"')) return String(JSON.parse(trimmed));
    } catch {
      // fallback manual abaixo
    }
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/** Extrai os valores do rascunho Python atual para preencher o formulário da folha de respostas. */
export function parseAnswerSheetDraft(lessonId: string, pythonCode: string): Record<string, string> {
  const spec = ANSWER_SHEETS[lessonId];
  if (!spec) return {};
  const rawMap = new Map<string, string>();
  for (const line of pythonCode.split(/\r?\n/)) {
    const m = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^\s#]+)/.exec(line.trim());
    if (m) rawMap.set(m[1], m[2]);
  }
  const values: Record<string, string> = {};
  for (const field of spec.fields) {
    values[field.varName] = unquotePythonLiteral(rawMap.get(field.varName) ?? '');
  }
  return values;
}

/** Gera código Python válido com as respostas do formulário para correr nos testes automáticos. */
export function buildAnswerSheetCode(lessonId: string, values: Record<string, string>): string {
  const spec = ANSWER_SHEETS[lessonId];
  if (!spec) return '';
  const lines = [`# ${spec.title}`];
  for (const field of spec.fields) {
    const raw = (values[field.varName] ?? '').trim();
    if (!raw) {
      lines.push(`${field.varName} = None`);
      continue;
    }
    if (field.kind === 'number') {
      const normalized = normalizePtNumberInput(raw);
      if (/^-?\d+(?:\.\d+)?$/.test(normalized)) {
        lines.push(`${field.varName} = ${normalized}`);
      } else {
        lines.push(`${field.varName} = ${JSON.stringify(raw)}`);
      }
    } else {
      lines.push(`${field.varName} = ${JSON.stringify(raw)}`);
    }
  }
  lines.push(`print(${spec.fields.map((f) => f.varName).join(', ')})`);
  return lines.join('\n');
}

export function renderAnswerSheetPanel(lessonId: string, currentCode: string): string {
  const spec = ANSWER_SHEETS[lessonId];
  if (!spec) return '';
  const values = parseAnswerSheetDraft(lessonId, currentCode);

  let lastSection: string | undefined;
  const rowsHtml = spec.fields
    .map((f) => {
      const sectionHeading =
        f.section && f.section !== lastSection
          ? `<div class="answer-sheet-section">${escapeHtml(f.section)}</div>`
          : '';
      lastSection = f.section;
      const val = values[f.varName] ?? '';
      return `
        ${sectionHeading}
        <label class="answer-field" for="ans-${escapeHtml(f.varName)}">
          <span class="answer-field-head">
            <span class="answer-field-label">${escapeHtml(f.label)}</span>
            <span class="answer-field-hint">${escapeHtml(f.hint)}</span>
          </span>
          <input
            type="text"
            inputmode="${f.kind === 'number' ? 'decimal' : 'text'}"
            class="answer-field-input"
            id="ans-${escapeHtml(f.varName)}"
            data-answer-var="${escapeHtml(f.varName)}"
            value="${escapeHtml(val)}"
            placeholder="${escapeHtml(f.placeholder)}"
            autocomplete="off"
            spellcheck="false"
          />
        </label>
      `;
    })
    .join('');

  return `
    <div class="answer-sheet-card" role="region" aria-label="${escapeHtml(spec.title)}">
      <div class="answer-sheet-header">
        <strong>${escapeHtml(spec.title)}</strong>
        <p>${escapeHtml(spec.subtitle)}</p>
      </div>
      <div class="answer-sheet-grid">
        ${rowsHtml}
      </div>
    </div>
  `;
}
