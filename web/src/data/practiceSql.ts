import type { SqlChallengeSpec } from './types';

// Exercícios de treino SQL: repetem o conceito de cada etapa com outra pergunta.
// Não contam para o progresso; servem para ganhar mão antes de avançar.

type Linhas = (string | number | null)[][];

const num = (v: unknown) => Number(v);
const perto = (a: unknown, b: number, tol = 0.011) => Math.abs(num(a) - b) < tol;
const ok = (passed: boolean, certo: string, errado: string) => ({ passed, message: passed ? certo : errado });

/** Procura a linha cuja primeira coluna é `chave`. */
const linha = (rows: Linhas, chave: string) => rows.find((r) => String(r[0]) === chave);

export const sqlPractice: Record<string, SqlChallengeSpec[]> = {
  'sql-01-select': [
    {
      title: 'Categorias sem repetições',
      description: 'Lista as categorias diferentes que existem na tabela produtos (só a coluna categoria), por ordem alfabética.',
      starterSql: 'SELECT categoria\nFROM produtos;',
      solutionSql: 'SELECT DISTINCT categoria\nFROM produtos\nORDER BY categoria;',
      hint: 'SELECT DISTINCT categoria FROM produtos ORDER BY categoria;',
      validate: (cols, rows) => {
        const esperado = ['Bebidas', 'Charcutaria', 'Frutaria', 'Laticínios', 'Mercearia', 'Padaria'];
        const certo = cols.length === 1 && rows.length === 6 && rows.every((r, i) => r[0] === esperado[i]);
        return ok(
          certo,
          'Seis categorias, sem repetições e por ordem alfabética.',
          rows.length > 6 ? 'Há categorias repetidas: falta o DISTINCT.' : 'Esperava 6 categorias numa única coluna, por ordem alfabética (ORDER BY categoria).',
        );
      },
    },
  ],
  'sql-02-where': [
    {
      title: 'Produtos de gama média',
      description: 'Mostra nome, categoria e preco dos produtos das categorias Mercearia ou Charcutaria com preço entre 2 € e 5 € (inclusive).',
      starterSql: "SELECT nome, categoria, preco\nFROM produtos\nWHERE categoria = 'Mercearia';",
      solutionSql: "SELECT nome, categoria, preco\nFROM produtos\nWHERE categoria IN ('Mercearia', 'Charcutaria')\n  AND preco BETWEEN 2 AND 5;",
      hint: "Junta duas condições com AND: categoria IN ('Mercearia', 'Charcutaria') e preco BETWEEN 2 AND 5.",
      validate: (cols, rows) => {
        const nomes = rows.map((r) => String(r[0])).sort();
        const certo = cols.length === 3 && nomes.join('|') === ['Café', 'Fiambre', 'Ovos (dúzia)', 'Queijo'].join('|');
        return ok(
          certo,
          'Quatro produtos: Café, Fiambre, Ovos e Queijo. O Azeite (7,50 €) ficou de fora pelo BETWEEN.',
          rows.some((r) => String(r[0]) === 'Azeite')
            ? 'O Azeite custa 7,50 €: falta limitar o preço com BETWEEN 2 AND 5.'
            : 'Esperava 4 produtos (nome, categoria, preco) das duas categorias com preço entre 2 e 5 €.',
        );
      },
    },
  ],
  'sql-03-orderby-calculos': [
    {
      title: 'Tabela de preços com IVA',
      description: 'Mostra nome, preco e preco_com_iva (preço × 1,23 arredondado a 2 casas) de todos os produtos, do mais caro para o mais barato.',
      starterSql: 'SELECT nome, preco\nFROM produtos;',
      solutionSql: 'SELECT nome, preco, ROUND(preco * 1.23, 2) AS preco_com_iva\nFROM produtos\nORDER BY preco DESC;',
      hint: 'Acrescenta ROUND(preco * 1.23, 2) AS preco_com_iva e termina com ORDER BY preco DESC.',
      validate: (cols, rows) => {
        const temColuna = cols.includes('preco_com_iva');
        const certo = temColuna && rows.length === 15 && rows[0][0] === 'Azeite' && perto(rows[0][cols.indexOf('preco_com_iva')], 9.22) && rows[14][0] === 'Pão';
        return ok(
          certo,
          'Azeite no topo (9,22 € com IVA) e Pão no fim.',
          !temColuna ? 'Falta a coluna preco_com_iva (usa AS para lhe dar o nome).' : 'Confirma ROUND(preco * 1.23, 2) e a ordem do mais caro para o mais barato (DESC).',
        );
      },
    },
  ],
  'sql-04-groupby': [
    {
      title: 'Clientes por cidade',
      description: 'Conta quantos clientes há em cada cidade: cidade e num_clientes, da cidade com mais clientes para a com menos.',
      starterSql: 'SELECT cidade\nFROM clientes;',
      solutionSql: 'SELECT cidade, COUNT(*) AS num_clientes\nFROM clientes\nGROUP BY cidade\nORDER BY num_clientes DESC;',
      hint: 'SELECT cidade, COUNT(*) AS num_clientes FROM clientes GROUP BY cidade ORDER BY num_clientes DESC;',
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 6 && rows[0][0] === 'Lisboa' && num(rows[0][1]) === 26 && num(linha(rows, 'Maia')?.[1]) === 10;
        return ok(
          certo,
          'Lisboa lidera com 26 clientes e a Maia tem 10.',
          rows.length === 120 ? 'Tens uma linha por cliente: falta o GROUP BY cidade.' : 'Esperava 6 cidades com a contagem, ordenadas por num_clientes DESC.',
        );
      },
    },
  ],
  'sql-05-having': [
    {
      title: 'Produtos com muitas vendas',
      description: 'Na tabela vendas, mostra produto e linhas (número de linhas de venda) só dos produtos com mais de 350 linhas, do maior para o menor.',
      starterSql: 'SELECT produto, COUNT(*) AS linhas\nFROM vendas\nGROUP BY produto\nORDER BY linhas DESC;',
      solutionSql: 'SELECT produto, COUNT(*) AS linhas\nFROM vendas\nGROUP BY produto\nHAVING COUNT(*) > 350\nORDER BY linhas DESC;',
      hint: 'O filtro é sobre o total do grupo, por isso vai no HAVING: HAVING COUNT(*) > 350.',
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 4 && rows[0][0] === 'Leite' && num(rows[0][1]) === 386 && rows.every((r) => num(r[1]) > 350);
        return ok(
          certo,
          'Leite, Queijo, Fiambre e Açúcar passam a fasquia das 350 linhas.',
          rows.length === 15 ? 'Aparecem os 15 produtos: falta filtrar os grupos com HAVING.' : 'Esperava 4 produtos com mais de 350 linhas, ordenados do maior para o menor.',
        );
      },
    },
  ],
  'sql-06-joins': [
    {
      title: 'Unidades por categoria',
      description: 'Junta vendas a produtos e mostra categoria e unidades (soma da quantidade vendida), da categoria com mais unidades para a com menos.',
      starterSql: 'SELECT produto_id, SUM(quantidade) AS unidades\nFROM vendas\nGROUP BY produto_id;',
      solutionSql: 'SELECT p.categoria, SUM(v.quantidade) AS unidades\nFROM vendas v\nINNER JOIN produtos p ON p.id = v.produto_id\nGROUP BY p.categoria\nORDER BY unidades DESC;',
      hint: 'FROM vendas v INNER JOIN produtos p ON p.id = v.produto_id, depois GROUP BY p.categoria.',
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 6 && rows[0][0] === 'Mercearia' && num(rows[0][1]) === 5117 && num(linha(rows, 'Padaria')?.[1]) === 822;
        return ok(
          certo,
          'A Mercearia vende 5 117 unidades, quase o triplo da segunda categoria.',
          'Esperava 6 categorias com a soma das quantidades (Mercearia no topo). Confirma o ON p.id = v.produto_id.',
        );
      },
    },
  ],
  'sql-07-case-coalesce': [
    {
      title: 'Faixas de preço',
      description: "Classifica os produtos em faixas com CASE: 'barato' (preço < 1), 'medio' (de 1 a 3, inclusive) e 'caro' (acima de 3). Mostra faixa e num_produtos.",
      starterSql: 'SELECT nome, preco\nFROM produtos;',
      solutionSql: "SELECT\n  CASE\n    WHEN preco < 1 THEN 'barato'\n    WHEN preco <= 3 THEN 'medio'\n    ELSE 'caro'\n  END AS faixa,\n  COUNT(*) AS num_produtos\nFROM produtos\nGROUP BY faixa\nORDER BY num_produtos DESC;",
      hint: "CASE WHEN preco < 1 THEN 'barato' WHEN preco <= 3 THEN 'medio' ELSE 'caro' END AS faixa, depois GROUP BY faixa.",
      validate: (cols, rows) => {
        const conta = (f: string) => num(linha(rows, f)?.[1]);
        const certo = cols.length === 2 && rows.length === 3 && conta('barato') === 5 && conta('medio') === 7 && conta('caro') === 3;
        return ok(
          certo,
          '5 baratos, 7 médios e 3 caros. A ordem dos WHEN fez o trabalho todo.',
          'Esperava 3 faixas (barato 5, medio 7, caro 3). Confirma os limites: < 1 e <= 3.',
        );
      },
    },
  ],
  'sql-08-cte-windows': [
    {
      title: 'O campeão de cada categoria',
      description: 'Com uma CTE e RANK() OVER (PARTITION BY categoria ...), mostra o produto com mais unidades vendidas em cada categoria: categoria, nome e unidades, por ordem alfabética de categoria.',
      starterSql: 'WITH unidades AS (\n  SELECT p.categoria, p.nome, SUM(v.quantidade) AS unidades\n  FROM vendas v\n  INNER JOIN produtos p ON p.id = v.produto_id\n  GROUP BY p.categoria, p.nome\n)\nSELECT categoria, nome, unidades\nFROM unidades\nORDER BY categoria;',
      solutionSql: 'WITH unidades AS (\n  SELECT p.categoria, p.nome, SUM(v.quantidade) AS unidades\n  FROM vendas v\n  INNER JOIN produtos p ON p.id = v.produto_id\n  GROUP BY p.categoria, p.nome\n),\nranking AS (\n  SELECT *, RANK() OVER (PARTITION BY categoria ORDER BY unidades DESC) AS pos\n  FROM unidades\n)\nSELECT categoria, nome, unidades\nFROM ranking\nWHERE pos = 1\nORDER BY categoria;',
      hint: 'Cria uma segunda CTE com RANK() OVER (PARTITION BY categoria ORDER BY unidades DESC) AS pos e filtra WHERE pos = 1.',
      validate: (cols, rows) => {
        const nome = (cat: string) => linha(rows, cat)?.[1];
        const certo = rows.length === 6 && nome('Laticínios') === 'Leite' && nome('Mercearia') === 'Açúcar' && nome('Charcutaria') === 'Queijo' && num(linha(rows, 'Laticínios')?.[2]) === 960;
        return ok(
          certo,
          'Um campeão por categoria: o Leite (960 unidades) é o maior de todos.',
          rows.length === 15 ? 'Aparecem os 15 produtos: falta filtrar a posição 1 do ranking.' : 'Esperava 6 linhas, uma por categoria, com o produto mais vendido.',
        );
      },
    },
  ],
  'sql-09-subqueries-exists-union': [
    {
      title: 'Quem nunca comprou Azeite?',
      description: "Com NOT EXISTS, lista id, nome e cidade dos clientes que nunca compraram Azeite (tabela vendas), por ordem de id.",
      starterSql: 'SELECT c.id, c.nome, c.cidade\nFROM clientes c\nORDER BY c.id;',
      solutionSql: "SELECT c.id, c.nome, c.cidade\nFROM clientes c\nWHERE NOT EXISTS (\n  SELECT 1 FROM vendas v\n  WHERE v.cliente_id = c.id AND v.produto = 'Azeite'\n)\nORDER BY c.id;",
      hint: "WHERE NOT EXISTS (SELECT 1 FROM vendas v WHERE v.cliente_id = c.id AND v.produto = 'Azeite').",
      validate: (cols, rows) => {
        const certo = cols.length === 3 && rows.length === 14 && num(rows[0][0]) === 2 && num(rows[13][0]) === 119;
        return ok(
          certo,
          '14 clientes nunca levaram Azeite: uma lista pronta para uma campanha.',
          rows.length === 120 ? 'Aparecem todos os clientes: falta o WHERE NOT EXISTS (...).' : 'Esperava 14 clientes (id, nome, cidade) ordenados por id.',
        );
      },
    },
  ],
  'sql-10-medias-moveis-rfm': [
    {
      title: 'Tabela RFM por cliente',
      description: "Sobre vendas_sazonais, constrói a tabela RFM: cliente_id, recencia_dias (dias entre a última compra e 2025-12-31, como inteiro), frequencia (dias diferentes com compras) e monetario (soma de quantidade × preço, 2 casas). Ordena por monetario DESC.",
      starterSql: "SELECT\n  cliente_id,\n  MAX(data) AS ultima_compra\nFROM vendas_sazonais\nGROUP BY cliente_id;",
      solutionSql: "SELECT\n  cliente_id,\n  CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(data)) AS INT) AS recencia_dias,\n  COUNT(DISTINCT data) AS frequencia,\n  ROUND(SUM(quantidade * preco), 2) AS monetario\nFROM vendas_sazonais\nGROUP BY cliente_id\nORDER BY monetario DESC;",
      hint: "Recência: CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(data)) AS INT). Frequência: COUNT(DISTINCT data). Valor: ROUND(SUM(quantidade * preco), 2).",
      validate: (cols, rows) => {
        const forma = cols.length === 4 && rows.length === 120;
        const top = forma && num(rows[0][0]) === 44 && num(rows[0][1]) === 3 && num(rows[0][2]) === 45 && perto(rows[0][3], 669.48);
        return ok(
          top,
          'O cliente 44 é o campeão: comprou há 3 dias, em 45 dias diferentes, e gastou 669,48 €.',
          !forma
            ? 'Esperava 120 clientes com 4 colunas: cliente_id, recencia_dias, frequencia, monetario.'
            : 'A forma está certa, mas os valores não: confirma COUNT(DISTINCT data), o CAST(... AS INT) e o ORDER BY monetario DESC.',
        );
      },
    },
    {
      title: 'Segmentos RFM',
      description: "Reaproveita a tabela RFM numa CTE e classifica os clientes com CASE: 'Campeões' (recência ≤ 7 dias e frequência ≥ 30), 'Em risco' (recência > 30 dias) e 'Regulares' (os restantes). Mostra segmento, num_clientes e gasto_medio (média do monetario, 2 casas).",
      starterSql: "WITH rfm AS (\n  SELECT\n    cliente_id,\n    CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(data)) AS INT) AS recencia_dias,\n    COUNT(DISTINCT data) AS frequencia,\n    ROUND(SUM(quantidade * preco), 2) AS monetario\n  FROM vendas_sazonais\n  GROUP BY cliente_id\n)\nSELECT *\nFROM rfm;",
      solutionSql: "WITH rfm AS (\n  SELECT\n    cliente_id,\n    CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(data)) AS INT) AS recencia_dias,\n    COUNT(DISTINCT data) AS frequencia,\n    ROUND(SUM(quantidade * preco), 2) AS monetario\n  FROM vendas_sazonais\n  GROUP BY cliente_id\n)\nSELECT\n  CASE\n    WHEN recencia_dias <= 7 AND frequencia >= 30 THEN 'Campeões'\n    WHEN recencia_dias > 30 THEN 'Em risco'\n    ELSE 'Regulares'\n  END AS segmento,\n  COUNT(*) AS num_clientes,\n  ROUND(AVG(monetario), 2) AS gasto_medio\nFROM rfm\nGROUP BY segmento\nORDER BY num_clientes DESC;",
      hint: "No SELECT final usa CASE WHEN recencia_dias <= 7 AND frequencia >= 30 THEN 'Campeões' WHEN recencia_dias > 30 THEN 'Em risco' ELSE 'Regulares' END AS segmento e agrupa por segmento.",
      validate: (cols, rows) => {
        const n = (s: string) => num(linha(rows, s)?.[1]);
        const certo = cols.length === 3 && rows.length === 3 && n('Campeões') === 31 && n('Em risco') === 8 && n('Regulares') === 81 && perto(linha(rows, 'Campeões')?.[2], 441);
        return ok(
          certo,
          '31 Campeões gastam em média 441 €; 8 clientes Em risco merecem uma campanha de regresso.',
          'Esperava 3 segmentos (Campeões 31, Regulares 81, Em risco 8). Confirma a ordem dos WHEN e os limites 7, 30 e 30.',
        );
      },
    },
  ],
};
