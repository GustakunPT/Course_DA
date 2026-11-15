import type { Track } from './types';

export const sqlTrack: Track = {
  id: 'sql',
  shortTitle: '2. SQL',
  fullTitle: 'SQL para Analistas de Dados',
  summary: 'Consultas relacionais ao vivo sobre produtos (15), clientes (120) e vendas (5 078): filtros, agregações, JOINs, CTEs e Window Functions.',
  engineLabel: 'SQLite WebAssembly (5 078 vendas)',
  lessons: [
    {
      id: 'sql-01-select',
      code: '01',
      title: 'SELECT, DISTINCT e LIMIT: explorar tabelas',
      lede: 'Em SQL pedes exatamente as colunas de que precisas, espreitas as primeiras linhas com LIMIT e removes repetidos com DISTINCT.',
      analogyTitle: 'Pedir ao fiel de armazém apenas as colunas necessárias',
      analogyBody: 'Em vez de despejar os 5 078 talões todos em cima do balcão (SELECT *), dizes exatamente que colunas queres ver e limitas a amostra às primeiras 5 ou 10 linhas.',
      concepts: [
        'SELECT escolhe colunas específicas; FROM indica a tabela (produtos, clientes ou vendas).',
        'SELECT DISTINCT devolve apenas os valores únicos de uma coluna (por exemplo, as cidades onde temos clientes).',
        'LIMIT restringe o número de linhas devolvidas para explorar tabelas grandes com segurança.',
      ],
      referenceTitle: 'Sintaxe base de consulta (W3Schools SQL)',
      referenceRows: [
        { syntax: 'SELECT col1, col2 FROM tab;', meaning: 'Lê apenas as colunas indicadas', example: 'SELECT nome, preco FROM produtos;' },
        { syntax: 'SELECT DISTINCT col FROM tab;', meaning: 'Lista valores sem duplicados', example: 'SELECT DISTINCT categoria FROM produtos;' },
        { syntax: 'LIMIT n;', meaning: 'Devolve apenas as primeiras n linhas', example: 'SELECT * FROM vendas LIMIT 5;' },
      ],
      engine: 'sql',
      exampleCode: `SELECT nome, categoria, preco
FROM produtos
LIMIT 8;`,
      sqlChallenge: {
        description: 'Lista as categorias únicas existentes na tabela produtos (uma coluna chamada categoria), ordenadas alfabeticamente.',
        starterSql: `-- Devolve as categorias únicas da tabela produtos por ordem alfabética
SELECT categoria
FROM produtos;`,
        solutionSql: `SELECT DISTINCT categoria
FROM produtos
ORDER BY categoria ASC;`,
        hint: 'Usa SELECT DISTINCT categoria FROM produtos ORDER BY categoria;',
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 1 && rows[0][0] === 'Bebidas';
          return {
            passed: ok,
            message: ok
              ? 'Perfeito! Encontraste as 6 categorias únicas ordenadas de A a Z.'
              : `Obtiveste ${rows.length} categorias. Dica: usa DISTINCT e ORDER BY categoria (existem exatamente 6 categorias no catálogo).`,
          };
        },
      },
      quiz: {
        question: 'Qual cláusula SQL impede que a mesma cidade apareça repetida 20 vezes no resultado?',
        options: [
          'UNIQUE',
          'DISTINCT',
          'GROUP',
          'LIMIT',
        ],
        correctIndex: 1,
        explanation: 'SELECT DISTINCT cidade FROM clientes devolve apenas uma linha por cada cidade distinta.',
      },
    },
    {
      id: 'sql-02-where',
      code: '02',
      title: 'WHERE, IN, BETWEEN e LIKE: filtrar registos',
      lede: 'A cláusula WHERE filtra linhas antes de qualquer agrupamento, combinando comparações numéricas, intervalos de datas e padrões de texto.',
      analogyTitle: 'A peneira à entrada da contabilidade',
      analogyBody: 'O WHERE funciona linha a linha: cada venda passa pela peneira; se cumprir a regra segue para o resultado, se não cumprir fica de fora.',
      concepts: [
        'BETWEEN inclui ambos os extremos: preco BETWEEN 1.00 AND 3.00 apanha 1.00 e 3.00.',
        'IN ("Porto", "Gaia") substitui vários OR repetitivos de forma muito mais limpa.',
        'LIKE usa % como joker para qualquer sequência de caracteres (ex.: nome LIKE "%Silva").',
      ],
      referenceTitle: 'Operadores de filtro em WHERE (W3Schools)',
      referenceRows: [
        { syntax: 'WHERE col IN (v1, v2)', meaning: 'Corresponde a qualquer valor da lista', example: "WHERE cidade IN ('Porto', 'Braga')" },
        { syntax: 'WHERE col BETWEEN a AND b', meaning: 'Intervalo inclusivo [a, b]', example: "WHERE data BETWEEN '2025-12-01' AND '2025-12-31'" },
        { syntax: "WHERE col LIKE 'P%'", meaning: 'Pesquisa por padrão de texto', example: "WHERE nome LIKE '%(kg)%'" },
      ],
      engine: 'sql',
      exampleCode: `SELECT id, nome, categoria, preco
FROM produtos
WHERE categoria = 'Mercearia' AND preco >= 1.20;`,
      sqlChallenge: {
        description: 'Seleciona id, nome e cidade de todos os clientes das cidades "Porto" ou "Matosinhos" cujo nome termina em "Santos".',
        starterSql: `SELECT id, nome, cidade
FROM clientes
WHERE cidade IN ('Porto', 'Matosinhos');`,
        solutionSql: `SELECT id, nome, cidade
FROM clientes
WHERE cidade IN ('Porto', 'Matosinhos')
  AND nome LIKE '%Santos';`,
        hint: "Junta AND nome LIKE '%Santos' à condição WHERE.",
        validate: (_cols, rows) => {
          const certas = rows.every((r) => ['Porto', 'Matosinhos'].includes(String(r[2])) && String(r[1]).endsWith('Santos'));
          const cidades = new Set(rows.map((r) => String(r[2])));
          const ok = certas && rows.length === 9 && cidades.has('Porto') && cidades.has('Matosinhos');
          let message = 'Certo: encontraste os 9 clientes Santos (6 do Porto e 3 de Matosinhos).';
          if (!certas) message = 'Há linhas a mais: confirma o filtro de cidade IN ("Porto", "Matosinhos") e o nome LIKE "%Santos".';
          else if (!cidades.has('Matosinhos') || !cidades.has('Porto')) message = 'Falta uma das cidades: devem aparecer clientes do Porto e de Matosinhos.';
          else if (!ok) message = `Encontraste ${rows.length} clientes, mas são 9 no total. Tiraste algum LIMIT?`;
          return { passed: ok, message };
        },
      },
      quiz: {
        question: 'Se misturares AND e OR num WHERE sem parênteses, qual operador tem precedência em SQL?',
        options: [
          'O OR é avaliado primeiro',
          'O AND é avaliado primeiro',
          'São avaliados da esquerda para a direita',
          'Têm a mesma precedência, por isso dá erro',
        ],
        correctIndex: 1,
        explanation: 'Tal como a multiplicação precede a soma, o AND liga mais forte do que o OR. Usa sempre parênteses quando combinas ambos!',
      },
    },
    {
      id: 'sql-03-orderby-calculos',
      code: '03',
      title: 'ORDER BY e colunas calculadas com AS',
      lede: 'Cria métricas por linha como quantidade * preco, atribui-lhes nomes claros com AS e ordena o ranking com ORDER BY.',
      analogyTitle: 'Arrumar as faturas da mais alta para a mais baixa',
      analogyBody: 'Em vendas.csv não existe coluna subtotal: tens quantidade e preco separados. O SQL calcula o valor da linha em tempo real e ordena o pódio.',
      concepts: [
        'quantidade * preco AS subtotal cria uma coluna derivada legível no relatório.',
        'ORDER BY coluna DESC ordena do maior para o menor; ASC (padrão) ordena do menor para o maior.',
        'Podes ordenar por duas colunas para desempatar (ORDER BY subtotal DESC, data ASC).',
      ],
      referenceTitle: 'Cálculos e ordenação',
      referenceRows: [
        { syntax: 'expr AS alias', meaning: 'Dá nome a uma coluna calculada', example: 'ROUND(quantidade * preco, 2) AS subtotal' },
        { syntax: 'ORDER BY col DESC', meaning: 'Ordena por ordem decrescente', example: 'ORDER BY preco DESC' },
        { syntax: 'ORDER BY c1 DESC, c2 ASC', meaning: 'Ordenação com critério de desempate', example: 'ORDER BY subtotal DESC, id ASC' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  data,
  produto,
  quantidade,
  preco,
  ROUND(quantidade * preco, 2) AS subtotal
FROM vendas
ORDER BY subtotal DESC, data ASC
LIMIT 6;`,
      sqlChallenge: {
        description: 'Lista os 5 produtos mais caros da tabela produtos mostrando nome, preco e preco_com_iva (preco * 1.23 arredondado a 2 casas com ROUND), do mais caro para o mais barato.',
        starterSql: `SELECT
  nome,
  preco
FROM produtos;`,
        solutionSql: `SELECT
  nome,
  preco,
  ROUND(preco * 1.23, 2) AS preco_com_iva
FROM produtos
ORDER BY preco DESC
LIMIT 5;`,
        hint: 'Calcula ROUND(preco * 1.23, 2) AS preco_com_iva e termina com ORDER BY preco DESC LIMIT 5.',
        validate: (cols, rows) => {
          const ok = rows.length === 5 && cols.length === 3 && rows[0][0] === 'Azeite' && Math.abs(Number(rows[0][2]) - 9.23) < 0.02;
          return {
            passed: ok,
            message: ok
              ? 'Certo: Azeite lidera a 7.50 € (9.23 € com IVA a 23%).'
              : 'Confirma que devolves 3 colunas (nome, preco, preco_com_iva), ordenadas por preco DESC com LIMIT 5.',
          };
        },
      },
      quiz: {
        question: 'Qual a ordem exata das cláusulas numa query SQL com filtro, ordenação e limite?',
        options: [
          'SELECT -> FROM -> ORDER BY -> WHERE -> LIMIT',
          'SELECT -> FROM -> WHERE -> ORDER BY -> LIMIT',
          'SELECT -> WHERE -> FROM -> LIMIT -> ORDER BY',
          'SELECT -> FROM -> WHERE -> LIMIT -> ORDER BY',
        ],
        correctIndex: 1,
        explanation: 'Em SQL a ordem gramatical fixa é: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY e por fim LIMIT.',
      },
    },
    {
      id: 'sql-04-groupby',
      code: '04',
      title: 'GROUP BY e funções de agregação',
      lede: 'Confirma em SQL os 4 números da Caixa Registadora usando COUNT, SUM, AVG, MIN e MAX com GROUP BY.',
      analogyTitle: 'Separar talões em caixas por artigo e somar cada caixa',
      analogyBody: 'O GROUP BY substitui o dicionário acumulador do Python numa só instrução declarativa.',
      concepts: [
        'COUNT(*) conta linhas; SUM() soma valores; AVG() calcula a média.',
        'Regra de ouro do SQL: toda a coluna no SELECT que não esteja dentro de COUNT/SUM/AVG/MIN/MAX tem de aparecer no GROUP BY.',
        'Com semente 42, a faturação total de vendas é exatamente 26 902,89 € e o dia recorde é 2025-09-14 (217,97 €).',
      ],
      referenceTitle: 'Funções de agregação SQL (W3Schools)',
      referenceRows: [
        { syntax: 'COUNT(*) / COUNT(DISTINCT c)', meaning: 'Conta linhas / valores distintos', example: 'COUNT(DISTINCT cliente_id)' },
        { syntax: 'SUM(expr)', meaning: 'Soma todos os valores do grupo', example: 'SUM(quantidade * preco)' },
        { syntax: 'AVG(expr)', meaning: 'Calcula a média do grupo', example: 'ROUND(AVG(quantidade * preco), 2)' },
        { syntax: 'MIN(c) / MAX(c)', meaning: 'Valor mínimo e máximo', example: 'MIN(data), MAX(data)' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  produto,
  SUM(quantidade) AS total_unidades,
  ROUND(SUM(quantidade * preco), 2) AS faturacao_eur
FROM vendas
GROUP BY produto
ORDER BY faturacao_eur DESC
LIMIT 5;`,
      sqlChallenge: {
        description: 'Descobre os 3 dias com maior faturação em 2025: devolve as colunas data e faturacao_dia (arredondada a 2 casas), ordenadas da maior para a menor.',
        starterSql: `SELECT
  data,
  ROUND(SUM(quantidade * preco), 2) AS faturacao_dia
FROM vendas
-- Agrupa por data, ordena e limite a 3 linhas
`,
        solutionSql: `SELECT
  data,
  ROUND(SUM(quantidade * preco), 2) AS faturacao_dia
FROM vendas
GROUP BY data
ORDER BY faturacao_dia DESC
LIMIT 3;`,
        hint: 'Adiciona GROUP BY data ORDER BY faturacao_dia DESC LIMIT 3;',
        validate: (_cols, rows) => {
          const ok = rows.length === 3 && rows[0][0] === '2025-09-14' && Math.abs(Number(rows[0][1]) - 217.97) < 0.02;
          return {
            passed: ok,
            message: ok
              ? 'Exato! O dia 2025-09-14 faturou 217.97 €, igualzinho ao resultado da Caixa Registadora em Python.'
              : 'Verifica se agrupaste por data, ordenaste por faturacao_dia DESC e usaste LIMIT 3.',
          };
        },
      },
      quiz: {
        question: 'Qual a diferença entre COUNT(*) e COUNT(coluna)?',
        options: [
          'São sempre iguais, em qualquer tabela.',
          'COUNT(*) conta todas as linhas; COUNT(coluna) ignora os NULL.',
          'COUNT(coluna) conta todas as linhas; COUNT(*) ignora os NULL.',
          'COUNT(coluna) conta só os valores diferentes dessa coluna.',
        ],
        correctIndex: 1,
        explanation: 'Detalhe crucial em entrevistas de análise de dados: COUNT(coluna) ignora valores NULL!',
      },
    },
    {
      id: 'sql-05-having',
      code: '05',
      title: 'HAVING vs WHERE: filtrar grupos agregados',
      lede: 'O WHERE não consegue ver o resultado de um SUM() porque corre antes do agrupamento; para filtrar totais por grupo existe o HAVING.',
      analogyTitle: 'Peneirar antes de pesar vs escolher só os sacos pesados',
      analogyBody: 'WHERE retira maçãs estragadas antes de encher os sacos; HAVING pesa os sacos já fechados pelo GROUP BY e fica apenas com os sacos acima de 2 500 €.',
      concepts: [
        'WHERE filtra linhas individuais antes de GROUP BY.',
        'HAVING filtra grupos já formados depois de GROUP BY.',
        'Podes usar ambos na mesma query: WHERE para filtrar o mês e HAVING para exigir um mínimo de compras.',
      ],
      referenceTitle: 'Pipeline de filtragem em SQL',
      referenceRows: [
        { syntax: 'WHERE data >= "2025-07-01"', meaning: 'Filtra linhas brutas antes de agrupar', example: 'Só 2.º semestre' },
        { syntax: 'GROUP BY produto', meaning: 'Agrega linhas por chave', example: 'Um grupo por artigo' },
        { syntax: 'HAVING SUM(quantidade) > 850', meaning: 'Filtra os grupos pelo agregado', example: 'Artigos de alta rotação' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  produto,
  SUM(quantidade) AS unidades,
  ROUND(SUM(quantidade * preco), 2) AS faturacao
FROM vendas
GROUP BY produto
HAVING SUM(quantidade * preco) > 2000
ORDER BY faturacao DESC;`,
      sqlChallenge: {
        description: 'Encontra todos os produtos que venderam mais de 880 unidades no total do ano: mostra produto e unidades, ordenados por unidades DESC.',
        starterSql: `SELECT
  produto,
  SUM(quantidade) AS unidades
FROM vendas
GROUP BY produto;`,
        solutionSql: `SELECT
  produto,
  SUM(quantidade) AS unidades
FROM vendas
GROUP BY produto
HAVING SUM(quantidade) > 880
ORDER BY unidades DESC;`,
        hint: 'Usa HAVING SUM(quantidade) > 880 seguido de ORDER BY unidades DESC.',
        validate: (_cols, rows) => {
          const ok = rows.length === 4 && rows[0][0] === 'Leite' && Number(rows[0][1]) === 960;
          return {
            passed: ok,
            message: ok
              ? 'Certo: Leite (960), Açúcar (909), Queijo (906) e Fiambre (891) superaram as 880 unidades.'
              : 'Usa HAVING SUM(quantidade) > 880 e ordena por unidades DESC.',
          };
        },
      },
      quiz: {
        question: 'Porque falha a query SELECT cliente_id, COUNT(*) FROM vendas WHERE COUNT(*) > 50 GROUP BY cliente_id?',
        options: [
          'Porque COUNT(*) não pode ser usado com cliente_id.',
          'Porque agregações não podem ir no WHERE; vão no HAVING.',
          'Porque o GROUP BY tem de ser escrito sempre antes do WHERE.',
          'Porque falta dar um nome à contagem com AS.',
        ],
        correctIndex: 1,
        explanation: 'No momento em que o WHERE é executado os grupos ainda não existem; filtros sobre agregações pertencem ao HAVING.',
      },
    },
    {
      id: 'sql-06-joins',
      code: '06',
      title: 'INNER JOIN e LEFT JOIN: cruzar tabelas',
      lede: 'A tabela vendas guarda apenas cliente_id e produto_id; com JOIN ligamos esses códigos às cidades dos clientes e às categorias dos produtos.',
      analogyTitle: 'Cruzar o número do cartão de cliente com o ficheiro de moradas',
      analogyBody: 'O talão só imprime "Cliente #107" para não repetir nome e cidade 50 vezes. Com JOIN juntamos o talão à ficha #107 através da chave em comum.',
      concepts: [
        'INNER JOIN devolve apenas linhas que têm correspondência nas duas tabelas.',
        'LEFT JOIN mantém todas as linhas da tabela da esquerda, preenchendo com NULL se não houver par à direita (perfeito para achar clientes sem compras!).',
        'Usa sempre aliases curtos (vendas v, clientes c, produtos p) para qualificar v.cliente_id = c.id.',
      ],
      referenceTitle: 'Tipos de JOIN em SQL (W3Schools)',
      referenceRows: [
        { syntax: 'INNER JOIN t2 ON t1.fk = t2.id', meaning: 'Interseção entre duas tabelas', example: 'INNER JOIN produtos p ON p.id = v.produto_id' },
        { syntax: 'LEFT JOIN t2 ON t1.id = t2.fk', meaning: 'Preserva tudo da esquerda (mesmo sem par)', example: 'LEFT JOIN vendas v ON v.cliente_id = c.id' },
        { syntax: 'WHERE t2.fk IS NULL', meaning: 'Anti-join: encontra registos sem par', example: 'Clientes com zero compras' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  p.categoria,
  COUNT(*) AS transacoes,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
GROUP BY p.categoria
ORDER BY faturacao_eur DESC;`,
      sqlChallenge: {
        description: 'Cruza vendas com clientes para calcular a faturação total por cidade: devolve cidade e faturacao_eur (arredondada a 2 casas), ordenadas da maior faturação para a menor.',
        starterSql: `SELECT
  c.cidade,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur
FROM vendas v
-- Junta a tabela clientes e agrupa por cidade
`,
        solutionSql: `SELECT
  c.cidade,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.cidade
ORDER BY faturacao_eur DESC;`,
        hint: 'INNER JOIN clientes c ON c.id = v.cliente_id GROUP BY c.cidade ORDER BY faturacao_eur DESC;',
        validate: (_cols, rows) => {
          const total = rows.reduce((acc, r) => acc + Number(r[1]), 0);
          const ok = rows.length === 6 && Math.abs(total - 26902.89) < 0.1 && Number(rows[0][1]) >= Number(rows[5][1]);
          return {
            passed: ok,
            message: ok
              ? `Certo: as 6 cidades somam os 26 902,89 € totais, lideradas por ${rows[0][0]}.`
              : 'Confirma o INNER JOIN clientes c ON c.id = v.cliente_id, GROUP BY c.cidade e ORDER BY faturacao_eur DESC.',
          };
        },
      },
      quiz: {
        question: 'Queres listar todos os 120 clientes, incluindo os que nunca compraram nada (mostrando 0 €). Que JOIN deves usar a partir de clientes?',
        options: [
          'INNER JOIN vendas',
          'LEFT JOIN vendas',
          'CROSS JOIN vendas',
          'RIGHT JOIN vendas',
        ],
        correctIndex: 1,
        explanation: 'LEFT JOIN a partir de clientes preserva os 120 clientes mesmo que algum não tenha linhas correspondentes em vendas.',
      },
    },
    {
      id: 'sql-07-case-coalesce',
      code: '07',
      title: 'CASE WHEN, COALESCE e limpeza em SQL',
      lede: 'Nem toda a limpeza exige Python: o SQL permite criar segmentos de valor com CASE WHEN e tratar vazios com COALESCE e NULLIF.',
      analogyTitle: 'Carimbar clientes Ouro, Prata e Bronze na própria consulta',
      analogyBody: 'CASE WHEN é o if / elif / else do SQL: avalia condições por ordem e devolve uma etiqueta nova para cada linha ou cliente.',
      concepts: [
        'CASE WHEN cond THEN valor ELSE outro END cria colunas categóricas ou bandeiras binárias (1/0).',
        'NULLIF(coluna, "") transforma texto vazio "" num verdadeiro NULL.',
        'COALESCE(valor, padrao) devolve o primeiro argumento não nulo.',
      ],
      referenceTitle: 'Expressões condicionais e nulos',
      referenceRows: [
        { syntax: 'CASE WHEN ... THEN ... ELSE ... END', meaning: 'Lógica condicional em SQL', example: "CASE WHEN preco >= 3 THEN 'Premium' ELSE 'Base' END" },
        { syntax: 'COALESCE(x, 0)', meaning: 'Substitui NULL por valor padrão', example: 'COALESCE(NULLIF(quantidade, ""), "1")' },
        { syntax: 'TRIM(col)', meaning: 'Remove espaços nas extremidades', example: 'TRIM(produto)' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  linha,
  TRIM(COALESCE(NULLIF(produto, ''), 'Desconhecido')) AS produto_limpo,
  COALESCE(NULLIF(quantidade, ''), '1') AS qtd_limpa,
  REPLACE(preco, ',', '.') AS preco_ponto
FROM vendas_sujas;`,
      sqlChallenge: {
        description: 'Classifica os 15 artigos de produtos nas faixas "Económico" (preco < 1.00), "Intermédio" (preco <= 3.00) e "Premium" (acima de 3.00): conta quantos produtos há em cada faixa (colunas faixa e qtd_produtos, ordenadas por qtd_produtos DESC).',
        starterSql: `SELECT
  CASE
    WHEN preco < 1.00 THEN 'Económico'
    WHEN preco <= 3.00 THEN 'Intermédio'
    ELSE 'Premium'
  END AS faixa,
  COUNT(*) AS qtd_produtos
FROM produtos
-- Agrupa pela faixa e ordena
`,
        solutionSql: `SELECT
  CASE
    WHEN preco < 1.00 THEN 'Económico'
    WHEN preco <= 3.00 THEN 'Intermédio'
    ELSE 'Premium'
  END AS faixa,
  COUNT(*) AS qtd_produtos
FROM produtos
GROUP BY faixa
ORDER BY qtd_produtos DESC;`,
        hint: 'Acrescenta GROUP BY faixa ORDER BY qtd_produtos DESC;',
        validate: (_cols, rows) => {
          const sum = rows.reduce((a, r) => a + Number(r[1]), 0);
          const ok = rows.length === 3 && sum === 15 && Number(rows[0][1]) >= Number(rows[2][1]);
          return {
            passed: ok,
            message: ok
              ? 'Certo: os 15 produtos do catálogo ficaram classificados nas 3 faixas de preço.'
              : 'Agrupa por faixa e ordena por qtd_produtos DESC.',
          };
        },
      },
      quiz: {
        question: 'Qual é o resultado de COALESCE(NULL, NULL, "Porto", "Lisboa")?',
        options: [
          'NULL',
          '"Porto"',
          '"Lisboa"',
          '"Porto, Lisboa"',
        ],
        correctIndex: 1,
        explanation: 'COALESCE avalia os argumentos da esquerda para a direita e devolve o primeiro que não seja NULL.',
      },
    },
    {
      id: 'sql-08-cte-windows',
      code: '08',
      title: 'CTEs (WITH) e Window Functions (OVER)',
      lede: 'O nível profissional do analista SQL: organizar consultas em etapas legíveis com WITH e calcular acumulados e rankings sem colapsar linhas.',
      analogyTitle: 'A coluna de saldo acumulado no extrato bancário',
      analogyBody: 'Um GROUP BY esmaga os 12 meses numa linha só. Uma Window Function com OVER (ORDER BY mes) mantém cada mês visível e acrescenta ao lado o acumulado do ano até àquele mês.',
      concepts: [
        'WITH nome_cte AS (...) divide queries complexas em blocos limpos e fáceis de auditar.',
        'SUM(valor) OVER (ORDER BY mes) calcula o total acumulado (running total) linha a linha.',
        'RANK() OVER (PARTITION BY categoria ORDER BY faturacao DESC) cria rankings dentro de cada categoria.',
      ],
      referenceTitle: 'CTEs e funções de janela',
      referenceRows: [
        { syntax: 'WITH cte AS (SELECT ...) SELECT ...', meaning: 'Tabela temporária nomeada para a query', example: 'WITH mensal AS (...)' },
        { syntax: 'SUM(x) OVER (ORDER BY data)', meaning: 'Soma acumulada ordenada', example: 'Acumulado anual mês a mês' },
        { syntax: 'RANK() OVER (PARTITION BY g ORDER BY x DESC)', meaning: 'Posição no ranking por grupo', example: 'Top produto por categoria' },
      ],
      engine: 'sql',
      exampleCode: `WITH por_produto AS (
  SELECT
    p.categoria,
    p.nome AS produto,
    ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao
  FROM vendas v
  INNER JOIN produtos p ON p.id = v.produto_id
  GROUP BY p.categoria, p.nome
)
SELECT
  categoria,
  produto,
  faturacao,
  RANK() OVER (PARTITION BY categoria ORDER BY faturacao DESC) AS pos_na_categoria
FROM por_produto
ORDER BY categoria, pos_na_categoria;`,
      sqlChallenge: {
        description: 'Calcula a faturação mensal de 2025 (SUBSTR(data, 1, 7) AS mes) e o acumulado anual mês a mês: devolve 12 linhas com mes, faturacao_mes e acumulado_ano.',
        starterSql: `WITH mensal AS (
  SELECT
    SUBSTR(data, 1, 7) AS mes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao_mes
  FROM vendas
  GROUP BY SUBSTR(data, 1, 7)
)
SELECT
  mes,
  faturacao_mes
  -- Acrescenta a coluna acumulado_ano usando SUM(...) OVER (ORDER BY mes)
FROM mensal
ORDER BY mes;`,
        solutionSql: `WITH mensal AS (
  SELECT
    SUBSTR(data, 1, 7) AS mes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao_mes
  FROM vendas
  GROUP BY SUBSTR(data, 1, 7)
)
SELECT
  mes,
  faturacao_mes,
  ROUND(SUM(faturacao_mes) OVER (ORDER BY mes), 2) AS acumulado_ano
FROM mensal
ORDER BY mes;`,
        hint: 'Usa ROUND(SUM(faturacao_mes) OVER (ORDER BY mes), 2) AS acumulado_ano.',
        validate: (cols, rows) => {
          const ok =
            rows.length === 12 &&
            cols.length === 3 &&
            rows[0][0] === '2025-01' &&
            Math.abs(Number(rows[11][2]) - 26902.89) < 0.1;
          return {
            passed: ok,
            message: ok
              ? 'Brilhante! O acumulado de dezembro fecha exatamente nos 26 902,89 € anuais.'
              : 'Confirma que devolves 3 colunas para os 12 meses e que o último acumulado fecha em 26902.89.',
          };
        },
      },
      quiz: {
        question: 'Qual cláusula dentro de OVER (...) reinicia o ranking ou a soma para cada categoria separadamente?',
        options: [
          'GROUP BY categoria',
          'PARTITION BY categoria',
          'ORDER BY categoria',
          'SPLIT BY categoria',
        ],
        correctIndex: 1,
        explanation: 'PARTITION BY divide a janela por grupos (como categorias ou cidades) sem reduzir o número de linhas.',
      },
    },
    {
      id: 'sql-09-subqueries-exists-union',
      code: '09',
      title: 'Subqueries, EXISTS vs IN e UNION ALL',
      lede: 'Domina subconsultas escalares, verificação rápida de existência com EXISTS e consolidação de múltiplas tabelas com UNION ALL.',
      analogyTitle: 'Consultar a média geral antes de escolher os produtos acima da média',
      analogyBody: 'Como descobres que produtos custam mais do que o preço médio da loja se ainda não sabes qual é a média? Colocas uma query pequenina entre parênteses (SELECT AVG(preco) FROM produtos) dentro do WHERE da query principal!',
      concepts: [
        'Subquery escalar: devolve 1 único valor (ex.: WHERE preco > (SELECT AVG(preco) FROM produtos)).',
        'EXISTS (SELECT 1 FROM vendas v WHERE v.cliente_id = c.id ...) pára assim que encontra a primeira linha correspondente, sendo muito rápido em tabelas grandes.',
        'UNION ALL empilha resultados de duas queries com as mesmas colunas sem gastar tempo a remover duplicados; UNION remove duplicados.',
      ],
      beginnerSteps: [
        'Testa primeiro a query interior sozinha para teres a certeza do que ela devolve.',
        'Coloca a query interior entre parênteses curvos () dentro do WHERE ou do FROM.',
        'Usa UNION ALL quando quiseres juntar duas listas de resultados numa tabela vertical única.',
      ],
      proPractice: 'Em bases de dados de produção com milhões de registos, NOT EXISTS é muito mais seguro do que NOT IN porque NOT IN falha silenciosamente se a subquery devolver um único valor NULL!',
      commonPitfall: 'Usar UNION simples por hábito quando não há duplicados para remover, desperdiçando memória num sort desnecessário (prefere UNION ALL).',
      referenceTitle: 'Subconsultas e Operadores de Conjunto',
      referenceRows: [
        { syntax: 'WHERE col > (SELECT AVG(col) FROM t)', meaning: 'Subquery escalar de comparação dinâmica', example: 'Artigos acima do preço médio' },
        { syntax: 'WHERE EXISTS (SELECT 1 FROM t2 WHERE ...)', meaning: 'Filtra se existir pelo menos 1 registo relacionado', example: 'Clientes com compras de Azeite' },
        { syntax: 'SELECT ... UNION ALL SELECT ...', meaning: 'Empilha duas consultas com as mesmas colunas', example: 'Comparar série Base vs Sazonal' },
      ],
      engine: 'sql',
      exampleCode: `-- Compara num único resultado a série Base e a série Sazonal com UNION ALL:
SELECT 'Base Uniforme' AS serie, COUNT(*) AS linhas, ROUND(SUM(quantidade * preco), 2) AS faturacao
FROM vendas
UNION ALL
SELECT 'Sazonal Realista' AS serie, COUNT(*) AS linhas, ROUND(SUM(quantidade * preco), 2) AS faturacao
FROM vendas_sazonais;`,
      sqlChallenge: {
        description: 'Usando uma subquery no WHERE, seleciona nome, categoria e preco de todos os produtos cujo preco seja estritamente superior ao preço médio de todos os produtos da tabela produtos, ordenados por preco DESC.',
        starterSql: `SELECT
  nome,
  categoria,
  preco
FROM produtos
-- Filtra onde preco > (subquery com a média de preco de produtos) e ordena por preco DESC
`,
        solutionSql: `SELECT
  nome,
  categoria,
  preco
FROM produtos
WHERE preco > (SELECT AVG(preco) FROM produtos)
ORDER BY preco DESC;`,
        hint: 'Usa WHERE preco > (SELECT AVG(preco) FROM produtos) ORDER BY preco DESC;',
        validate: (cols, rows) => {
          const ok = rows.length === 5 && cols.length === 3 && rows[0][0] === 'Azeite' && rows[4][0] === 'Ovos (dúzia)';
          return {
            passed: ok,
            message: ok
              ? 'Certo! O preço médio do catálogo é 2.09 € e encontraste os 5 produtos acima dessa média.'
              : 'Filtra com WHERE preco > (SELECT AVG(preco) FROM produtos) e ordena por preco DESC.',
          };
        },
      },
      quiz: {
        question: 'Qual é o grande perigo de usar WHERE id NOT IN (SELECT id_pai FROM tabela) em SQL profissional?',
        options: [
          'Fica lento, mas o resultado está sempre certo.',
          'Se a subquery devolver um NULL, não sai nenhuma linha.',
          'Só funciona se a subquery devolver um único valor.',
          'Repete linhas do resultado quando a subquery tem ids duplicados.',
        ],
        correctIndex: 1,
        explanation: 'X NOT IN (1, 2, NULL) dá UNKNOWN para todas as linhas e o resultado vem vazio, sem erro nenhum. Por isso prefere-se NOT EXISTS ou LEFT JOIN ... IS NULL.',
      },
    },
    {
      id: 'sql-10-medias-moveis-rfm',
      code: '10',
      title: 'Médias Móveis (ROWS BETWEEN) e Matriz RFM de Clientes',
      lede: 'Calcula médias móveis de 3 meses em SQL usando frames de janela no desafio e, nos dois treinos, constrói e segmenta a tabela RFM (Recência, Frequência, Valor Monetário).',
      analogyTitle: 'Suavizar os altos e baixos da caixa e classificar a carteira de clientes',
      analogyBody: 'Uma média móvel de 3 meses junta o mês atual aos 2 meses anteriores para mostrar a tendência limpa sem o ruído de uma semana atípica. Já o RFM mede para cada cliente: quando veio pela última vez (Recência), quantas vezes veio (Frequência) e quanto gastou (Monetário).',
      concepts: [
        'AVG(faturacao) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) calcula a média móvel trimestral.',
        'JULIANDAY("2025-12-31") - JULIANDAY(MAX(data)) calcula há quantos dias o cliente fez a última compra (Recência).',
        'A análise RFM é o modelo padrão na indústria para segmentar clientes em Campeões, Fiéis e Em Risco.',
      ],
      beginnerSteps: [
        'Prepara primeiro uma CTE com a faturação de cada mês.',
        'Usa AVG(faturacao_mes) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) para a média móvel de 3 meses.',
        'Arredonda com ROUND(..., 2) para manter a tabela limpa.',
      ],
      proPractice: 'Em dashboards financeiros, nunca se analisa apenas a linha diária bruta: acompanha-se sempre a média móvel de 7 dias (MM7) ou 3 meses (MM3) para isolar a tendência estrutural.',
      commonPitfall: 'Esquecer a cláusula ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, o que calcula a média acumulada desde janeiro em vez da janela móvel de 3 meses.',
      referenceTitle: 'Janelas Móveis e RFM em SQL',
      referenceRows: [
        { syntax: 'ROWS BETWEEN 2 PRECEDING AND CURRENT ROW', meaning: 'Janela de 3 linhas (2 anteriores + atual)', example: 'Média móvel trimestral' },
        { syntax: 'MAX(data)', meaning: 'Data da compra mais recente do cliente', example: 'Base da Recência (R)' },
        { syntax: 'COUNT(DISTINCT data)', meaning: 'Número de dias em que o cliente visitou a loja', example: 'Frequência de visitas (F)' },
      ],
      engine: 'sql',
      exampleCode: `-- Top 6 clientes na Matriz RFM sobre vendas_sazonais (referência 2025-12-31):
SELECT
  c.id AS cliente_id,
  c.nome,
  CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(v.data)) AS INT) AS recencia_dias,
  COUNT(DISTINCT v.data) AS frequencia_visitas,
  ROUND(SUM(v.quantidade * v.preco), 2) AS valor_monetario_eur
FROM vendas_sazonais v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome
ORDER BY valor_monetario_eur DESC
LIMIT 6;`,
      sqlChallenge: {
        description: 'Sobre a tabela vendas_sazonais, calcula para os 12 meses de 2025: mes, faturacao_mes e media_movel_3m (média móvel do mês atual e dos 2 meses anteriores usando ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, arredondada a 2 casas).',
        starterSql: `WITH mensal_saz AS (
  SELECT
    SUBSTR(data, 1, 7) AS mes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao_mes
  FROM vendas_sazonais
  GROUP BY SUBSTR(data, 1, 7)
)
SELECT
  mes,
  faturacao_mes
  -- Acrescenta media_movel_3m usando AVG(faturacao_mes) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
FROM mensal_saz
ORDER BY mes;`,
        solutionSql: `WITH mensal_saz AS (
  SELECT
    SUBSTR(data, 1, 7) AS mes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao_mes
  FROM vendas_sazonais
  GROUP BY SUBSTR(data, 1, 7)
)
SELECT
  mes,
  faturacao_mes,
  ROUND(AVG(faturacao_mes) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_movel_3m
FROM mensal_saz
ORDER BY mes;`,
        hint: 'Usa ROUND(AVG(faturacao_mes) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_movel_3m.',
        validate: (cols, rows) => {
          const formaCerta = rows.length === 12 && cols.length === 3;
          const valoresCertos = formaCerta && [[0, 2185.21], [1, 1889.22], [11, 4267.66]].every(([i, v]) => Math.abs(Number(rows[i][2]) - v) < 0.011);
          return {
            passed: valoresCertos,
            message: valoresCertos
              ? 'Domínio total de Window Frames! A média móvel do 4.º trimestre mostra claramente a aceleração de Natal.'
              : !formaCerta
                ? 'Confirma que tens 3 colunas (mes, faturacao_mes, media_movel_3m) para os 12 meses de vendas_sazonais.'
                : 'A forma está certa, mas a média móvel não: confirma ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, ORDER BY mes e ROUND(..., 2).',
          };
        },
      },
      quiz: {
        question: 'Na janela ROWS BETWEEN 6 PRECEDING AND CURRENT ROW sobre uma tabela diária ordenada por data, quantos dias entram no cálculo de cada linha?',
        options: [
          '6 dias (o dia atual não conta)',
          '7 dias (os 6 anteriores e o atual)',
          '13 dias (6 antes, o atual e 6 depois)',
          '7 dias (o atual e os 6 seguintes)',
        ],
        correctIndex: 1,
        explanation: '6 anteriores + 1 atual = janela móvel exata de 7 dias (1 semana completa).',
      },
    },
  ],
};
