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
    {
      title: 'Produtos e preços praticados',
      description: "DISTINCT também funciona com várias colunas: devolve cada combinação diferente uma só vez. Mostra cada par produto e preco que aparece na tabela vendas, sem repetições.",
      starterSql: "SELECT produto, preco\nFROM vendas\nLIMIT 15;",
      solutionSql: "SELECT DISTINCT produto, preco\nFROM vendas;",
      hint: 'Escreve DISTINCT logo a seguir ao SELECT: SELECT DISTINCT produto, preco FROM vendas.',
      validate: (cols, rows) => {
        const pares = new Set(rows.map((r) => `${r[0]}|${r[1]}`));
        const produtos = new Set(rows.map((r) => r[0]));
        return ok(
          cols.length === 2 && rows.length === 15 && pares.size === 15 && produtos.size === 15,
          'Há 15 pares e 15 produtos: cada produto teve sempre o mesmo preço durante o ano.',
          'Esperava 15 linhas sem repetições, com as colunas produto e preco. Um LIMIT corta linhas mas não tira repetidos.',
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
    {
      title: 'Azeite em quantidade, no verão',
      description: "Mostra data, cliente_id e quantidade das vendas de Azeite com 3 ou mais unidades feitas entre 1 de junho e 31 de agosto de 2025 (inclusive).",
      starterSql: "SELECT data, cliente_id, quantidade\nFROM vendas\nWHERE produto = 'Azeite';",
      solutionSql: "SELECT data, cliente_id, quantidade\nFROM vendas\nWHERE produto = 'Azeite'\n  AND quantidade >= 3\n  AND data BETWEEN '2025-06-01' AND '2025-08-31';",
      hint: "Junta três condições com AND: produto = 'Azeite', quantidade >= 3 e data BETWEEN '2025-06-01' AND '2025-08-31'.",
      validate: (cols, rows) => {
        const dentro = rows.every((r) => num(r[2]) >= 3 && String(r[0]) >= '2025-06-01' && String(r[0]) <= '2025-08-31');
        return ok(
          cols.length === 3 && rows.length === 41 && dentro,
          '41 vendas grandes de Azeite no verão: 1 102,50 € só nestas compras.',
          `Esperava 41 linhas, todas com quantidade >= 3 e datas de junho a agosto. Obtive ${rows.length}.`,
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
    {
      title: 'Desempatar com uma segunda coluna',
      description: "Muitas vendas de Café têm o mesmo subtotal. Mostra data, quantidade e subtotal (quantidade * preco) das 5 vendas de Café com maior subtotal e, nos empates, as mais recentes primeiro.",
      starterSql: "SELECT data, quantidade, quantidade * preco AS subtotal\nFROM vendas\nWHERE produto = 'Café'\nORDER BY subtotal DESC\nLIMIT 5;",
      solutionSql: "SELECT data, quantidade, quantidade * preco AS subtotal\nFROM vendas\nWHERE produto = 'Café'\nORDER BY subtotal DESC, data DESC\nLIMIT 5;",
      hint: 'Acrescenta um segundo critério ao ORDER BY, separado por vírgula: ORDER BY subtotal DESC, data DESC.',
      validate: (_cols, rows) => {
        const datas = rows.map((r) => String(r[0]));
        return ok(
          rows.length === 5 && perto(rows[0][2], 13.6) && datas.join(',') === '2025-12-31,2025-12-28,2025-12-27,2025-12-26,2025-12-22',
          'Todas valem 13,60 €; o segundo critério põe as de dezembro em cima, das mais recentes para as mais antigas.',
          'Os subtotais estão certos, mas a ordem dos empates não: acrescenta data DESC ao ORDER BY.',
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
    {
      title: 'Vendas e unidades por mês',
      description: "Para cada mês (SUBSTR(data, 1, 7) AS mes) mostra o número de vendas (COUNT(*)) e o total de unidades (SUM(quantidade)), ordenado por mês.",
      starterSql: "SELECT SUBSTR(data, 1, 7) AS mes, COUNT(*) AS vendas\nFROM vendas;",
      solutionSql: "SELECT\n  SUBSTR(data, 1, 7) AS mes,\n  COUNT(*) AS vendas,\n  SUM(quantidade) AS unidades\nFROM vendas\nGROUP BY mes\nORDER BY mes;",
      hint: 'Sem GROUP BY o COUNT(*) junta a tabela toda numa linha. Agrupa por mes e acrescenta SUM(quantidade) AS unidades.',
      validate: (cols, rows) => {
        const dez = linha(rows, '2025-12');
        return ok(
          cols.length === 3 && rows.length === 12 && String(rows[0][0]) === '2025-01' && num(dez?.[1]) === 432 && num(dez?.[2]) === 1122,
          'Dezembro tem 432 vendas e 1 122 unidades, o mês com mais unidades do ano.',
          'Esperava 12 linhas (uma por mês) com mes, vendas e unidades, de janeiro a dezembro.',
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
    {
      title: 'Clientes assíduos no 2.º semestre',
      description: "Conta as compras de cada cliente a partir de 1 de julho de 2025 e mostra só os que fizeram 28 ou mais: cliente_id e compras, das mais para as menos.",
      starterSql: "SELECT cliente_id, COUNT(*) AS compras\nFROM vendas\nGROUP BY cliente_id\nHAVING COUNT(*) >= 28;",
      solutionSql: "SELECT cliente_id, COUNT(*) AS compras\nFROM vendas\nWHERE data >= '2025-07-01'\nGROUP BY cliente_id\nHAVING COUNT(*) >= 28\nORDER BY compras DESC;",
      hint: "O filtro da data é sobre linhas, por isso vai no WHERE; o mínimo de compras é sobre grupos e vai no HAVING.",
      validate: (_cols, rows) => {
        const ordenado = rows.every((r, i) => i === 0 || num(rows[i - 1][1]) >= num(r[1]));
        return ok(
          rows.length === 23 && ordenado && rows.every((r) => num(r[1]) >= 28),
          '23 clientes compraram 28 vezes ou mais no 2.º semestre: são os candidatos a um cartão de fidelização.',
          `Esperava 23 clientes, por ordem decrescente de compras. Obtive ${rows.length}: confirma o WHERE da data.`,
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
    {
      title: 'Quem não comprou em dezembro?',
      description: "Lista id e nome dos clientes sem nenhuma compra em dezembro de 2025, por ordem de id. Usa LEFT JOIN com a condição da data dentro do ON.",
      starterSql: "SELECT c.id, c.nome\nFROM clientes c\nLEFT JOIN vendas v ON v.cliente_id = c.id\nWHERE v.data >= '2025-12-01' AND v.id IS NULL;",
      solutionSql: "SELECT c.id, c.nome\nFROM clientes c\nLEFT JOIN vendas v\n  ON v.cliente_id = c.id AND v.data >= '2025-12-01'\nWHERE v.id IS NULL\nORDER BY c.id;",
      hint: "Se a condição da data ficar no WHERE, elimina as linhas a NULL e o LEFT JOIN passa a INNER. Põe-na no ON: ON v.cliente_id = c.id AND v.data >= '2025-12-01'.",
      validate: (_cols, rows) =>
        ok(
          rows.length === 21 && num(rows[0][0]) === 7,
          '21 clientes não compraram em dezembro (o primeiro é o 7). Com a data no WHERE o resultado ficaria vazio.',
          rows.length === 0
            ? 'Resultado vazio: a condição da data no WHERE anula o LEFT JOIN. Passa-a para o ON.'
            : `Esperava 21 clientes ordenados por id. Obtive ${rows.length}.`,
        ),
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
    {
      title: 'Arrumar a tabela suja',
      description: "Em vendas_sujas tudo é texto e há problemas. Mostra linha, produto (sem espaços nas pontas, em minúsculas e 'desconhecido' se vier vazio), preco como número (troca a vírgula por ponto) e estado: 'sem quantidade' se a quantidade vier vazia, 'preço inválido' se o preço for 0 ou negativo, 'ok' nos outros casos.",
      starterSql: "SELECT linha, produto, preco, 'ok' AS estado\nFROM vendas_sujas;",
      solutionSql: "SELECT\n  linha,\n  COALESCE(NULLIF(LOWER(TRIM(produto)), ''), 'desconhecido') AS produto,\n  CAST(REPLACE(preco, ',', '.') AS REAL) AS preco,\n  CASE\n    WHEN quantidade = '' THEN 'sem quantidade'\n    WHEN CAST(REPLACE(preco, ',', '.') AS REAL) <= 0 THEN 'preço inválido'\n    ELSE 'ok'\n  END AS estado\nFROM vendas_sujas;",
      hint: "NULLIF(texto, '') transforma o texto vazio em NULL e o COALESCE troca esse NULL por 'desconhecido'. Para o preço: CAST(REPLACE(preco, ',', '.') AS REAL).",
      validate: (cols, rows) => {
        const [iId, iP, iPr, iE] = ['linha', 'produto', 'preco', 'estado'].map((c) => cols.indexOf(c));
        if ([iId, iP, iPr, iE].some((i) => i < 0)) return ok(false, '', 'O resultado precisa das colunas linha, produto, preco e estado.');
        const r = (id: number) => rows.find((x) => num(x[iId]) === id);
        const certo =
          rows.length === 12 && r(1)?.[iP] === 'pão' && r(8)?.[iP] === 'desconhecido' && perto(r(5)?.[iPr], 2.35) &&
          r(2)?.[iE] === 'sem quantidade' && r(9)?.[iE] === 'preço inválido' && rows.filter((x) => x[iE] === 'ok').length === 10;
        return ok(
          certo,
          'Tabela arrumada: 10 linhas ok, 1 sem quantidade (Leite) e 1 com preço negativo (Café). Os Pães com e sem espaços passam a ser iguais.',
          'Confirma o LOWER(TRIM(...)) do produto, o COALESCE(NULLIF(...)) para o produto vazio, o REPLACE da vírgula e a ordem dos WHEN.',
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
    {
      title: 'Peso de cada produto na sua categoria',
      description: "Em vendas_detalhe, mostra categoria, produto, faturacao (soma do subtotal, 2 casas) e pct_categoria: a percentagem da faturação do produto no total da sua categoria (2 casas). Usa SUM(SUM(subtotal)) OVER (PARTITION BY categoria) e ordena por categoria e pct_categoria DESC.",
      starterSql: "SELECT categoria, produto, ROUND(SUM(subtotal), 2) AS faturacao\nFROM vendas_detalhe\nGROUP BY categoria, produto;",
      solutionSql: "SELECT\n  categoria,\n  produto,\n  ROUND(SUM(subtotal), 2) AS faturacao,\n  ROUND(100.0 * SUM(subtotal) / SUM(SUM(subtotal)) OVER (PARTITION BY categoria), 2) AS pct_categoria\nFROM vendas_detalhe\nGROUP BY categoria, produto\nORDER BY categoria, pct_categoria DESC;",
      hint: 'O SUM(subtotal) de dentro é o do GROUP BY (um por produto); o SUM(...) OVER (PARTITION BY categoria) de fora soma esses valores dentro de cada categoria.',
      validate: (cols, rows) => {
        const iPct = cols.indexOf('pct_categoria');
        const azeite = rows.find((r) => r[1] === 'Azeite');
        const pao = rows.find((r) => r[1] === 'Pão');
        return ok(
          iPct >= 0 && rows.length === 15 && perto(azeite?.[iPct], 45.12) && perto(pao?.[iPct], 100),
          'O Azeite vale 45,12% da Mercearia; o Pão é 100% da Padaria, porque é o único produto da categoria.',
          'Esperava 15 linhas com a coluna pct_categoria (Azeite 45.12, Pão 100).',
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
    {
      title: 'Clientes acima da média',
      description: "Numa CTE gastos calcula o total gasto por cliente (SUM(quantidade * preco) AS gasto). Depois mostra cliente_id e gasto (2 casas) dos clientes que gastaram mais do que a média de todos, do maior para o menor.",
      starterSql: "WITH gastos AS (\n  SELECT cliente_id, SUM(quantidade * preco) AS gasto\n  FROM vendas\n  GROUP BY cliente_id\n)\nSELECT cliente_id, ROUND(gasto, 2) AS gasto\nFROM gastos\nORDER BY gasto DESC;",
      solutionSql: "WITH gastos AS (\n  SELECT cliente_id, SUM(quantidade * preco) AS gasto\n  FROM vendas\n  GROUP BY cliente_id\n)\nSELECT cliente_id, ROUND(gasto, 2) AS gasto\nFROM gastos\nWHERE gasto > (SELECT AVG(gasto) FROM gastos)\nORDER BY gasto DESC;",
      hint: 'A média vem de uma subquery sobre a própria CTE: WHERE gasto > (SELECT AVG(gasto) FROM gastos).',
      validate: (_cols, rows) =>
        ok(
          rows.length === 60 && num(rows[0][0]) === 27 && perto(rows[0][1], 417.11),
          '60 dos 120 clientes estão acima da média de 224,19 €; o cliente 27 lidera com 417,11 €.',
          `Esperava 60 clientes, com o 27 em primeiro. Obtive ${rows.length}.`,
        ),
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
  'sql-11-revisao': [
    {
      title: 'Top 3 do último trimestre',
      description: "Junta vendas a produtos para ter a categoria e mostra produto, categoria e faturacao (2 casas) dos 3 produtos que mais faturaram de 1 de outubro de 2025 em diante.",
      starterSql: "SELECT v.produto, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao\nFROM vendas v\nGROUP BY v.produto\nORDER BY faturacao DESC\nLIMIT 3;",
      solutionSql: "SELECT\n  p.nome AS produto,\n  p.categoria,\n  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nWHERE v.data >= '2025-10-01'\nGROUP BY p.nome, p.categoria\nORDER BY faturacao DESC\nLIMIT 3;",
      hint: "JOIN produtos p ON p.id = v.produto_id, WHERE v.data >= '2025-10-01', GROUP BY p.nome, p.categoria, ORDER BY faturacao DESC e LIMIT 3.",
      validate: (cols, rows) =>
        ok(
          cols.length === 3 && rows.length === 3 && rows[0][0] === 'Azeite' && rows[0][1] === 'Mercearia' && perto(rows[0][2], 1582.5) && rows[1][0] === 'Queijo' && rows[2][0] === 'Café',
          'Azeite (1 582,50 €), Queijo (1 019,20 €) e Café (826,20 €) lideram o último trimestre.',
          'Esperava 3 linhas (produto, categoria, faturacao): Azeite, Queijo e Café. Confirma o JOIN e o filtro da data.',
        ),
    },
  ],
};
