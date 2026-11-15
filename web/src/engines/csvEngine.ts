export interface ProdutoRow {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
}

export interface ClienteRow {
  id: number;
  nome: string;
  cidade: string;
}

export interface VendaRow {
  id: number;
  data: string;
  cliente_id: number;
  produto_id: number;
  produto: string;
  quantidade: number;
  preco: number;
}

export interface VendaSujaRow {
  linha: number;
  data: string;
  produto: string;
  quantidade: string;
  preco: string;
  problemas: string[];
}

export interface MerceariaDataset {
  rawCsvs: Record<string, string>;
  produtos: ProdutoRow[];
  clientes: ClienteRow[];
  vendas: VendaRow[];
  vendasSazonais: VendaRow[];
  vendasSujas: VendaSujaRow[];
}

export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseCsvRecords(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, '\n').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] ?? '';
    });
    return obj;
  });
}

let cachedDatasetPromise: Promise<MerceariaDataset> | null = null;

export function loadMerceariaDataset(): Promise<MerceariaDataset> {
  if (!cachedDatasetPromise) {
    cachedDatasetPromise = (async () => {
      const files = ['produtos.csv', 'clientes.csv', 'vendas.csv', 'vendas_sazonais.csv', 'vendas_sujas.csv'];
      const rawCsvs: Record<string, string> = {};
      await Promise.all(
        files.map(async (f) => {
          const res = await fetch(`/dados/${f}`);
          if (!res.ok) {
            throw new Error(`Não foi possível carregar /dados/${f} (HTTP ${res.status}).`);
          }
          rawCsvs[f] = await res.text();
        }),
      );

      const produtos: ProdutoRow[] = parseCsvRecords(rawCsvs['produtos.csv']).map((r) => ({
        id: Number(r.id),
        nome: r.nome,
        categoria: r.categoria,
        preco: Number(r.preco),
      }));

      const clientes: ClienteRow[] = parseCsvRecords(rawCsvs['clientes.csv']).map((r) => ({
        id: Number(r.id),
        nome: r.nome,
        cidade: r.cidade,
      }));

      const vendas: VendaRow[] = parseCsvRecords(rawCsvs['vendas.csv']).map((r, i) => ({
        id: i + 1,
        data: r.data,
        cliente_id: Number(r.cliente_id),
        produto_id: Number(r.produto_id),
        produto: r.produto,
        quantidade: Number(r.quantidade),
        preco: Number(r.preco),
      }));

      const vendasSazonais: VendaRow[] = parseCsvRecords(rawCsvs['vendas_sazonais.csv']).map((r, i) => ({
        id: i + 1,
        data: r.data,
        cliente_id: Number(r.cliente_id),
        produto_id: Number(r.produto_id),
        produto: r.produto,
        quantidade: Number(r.quantidade),
        preco: Number(r.preco),
      }));

      const seenDirty = new Set<string>();
      const vendasSujas: VendaSujaRow[] = parseCsvRecords(rawCsvs['vendas_sujas.csv']).map((r, i) => {
        const problemas: string[] = [];
        const sig = `${r.data}|${r.produto}|${r.quantidade}|${r.preco}`;
        if (seenDirty.has(sig)) problemas.push('Linha duplicada exata');
        seenDirty.add(sig);

        if (!r.produto.trim()) problemas.push('Produto em falta');
        if (!r.quantidade.trim()) problemas.push('Quantidade em falta');
        if (r.produto && r.produto !== r.produto.trim()) problemas.push('Espaços extra no nome');
        if (r.produto.trim() === 'pão') problemas.push('Minúscula inconsistente');
        if (r.preco.includes(',')) problemas.push('Vírgula decimal em texto');
        const numPreco = Number(r.preco.replace(',', '.'));
        if (!Number.isNaN(numPreco) && numPreco <= 0) problemas.push('Preço negativo inválido');

        return {
          linha: i + 1,
          data: r.data,
          produto: r.produto,
          quantidade: r.quantidade,
          preco: r.preco,
          problemas,
        };
      });

      return { rawCsvs, produtos, clientes, vendas, vendasSazonais, vendasSujas };
    })();
  }
  return cachedDatasetPromise;
}
