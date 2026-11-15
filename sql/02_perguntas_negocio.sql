-- Perguntas de negócio da Mercearia do Bairro (Fase 2)
-- Compare os primeiros 4 resultados com a sua Caixa Registadora (src/caixa.py)!

-- 1. Faturação total do ano (esperado com semente 42: 26902.89 €)
SELECT ROUND(SUM(quantidade * preco), 2) AS faturacao_total_eur
FROM vendas;

-- 2. Produto mais vendido em unidades (esperado: Leite com 960 unidades)
-- O nome vem de produtos (JOIN), porque o esquema normalizado não o repete em vendas.
SELECT p.nome AS produto, SUM(v.quantidade) AS total_unidades
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
GROUP BY p.nome
ORDER BY total_unidades DESC
LIMIT 1;

-- 3. Dia com maior faturação (esperado: 2025-09-14 com 217.97 €)
SELECT data, ROUND(SUM(quantidade * preco), 2) AS faturacao_dia
FROM vendas
GROUP BY data
ORDER BY faturacao_dia DESC
LIMIT 1;

-- 4. Valor médio por linha de venda (esperado: 5.30 €)
SELECT ROUND(AVG(quantidade * preco), 2) AS media_por_linha
FROM vendas;

-- 5. Faturação e peso percentual por categoria (JOIN com produtos)
SELECT
    p.categoria,
    COUNT(*) AS num_linhas,
    SUM(v.quantidade) AS unidades,
    ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur,
    ROUND(100.0 * SUM(v.quantidade * v.preco) / (SELECT SUM(quantidade * preco) FROM vendas), 2) AS quota_pct
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
GROUP BY p.categoria
ORDER BY faturacao_eur DESC;

-- 6. Faturação por cidade dos clientes (INNER JOIN com clientes)
SELECT
    c.cidade,
    COUNT(DISTINCT c.id) AS clientes_ativos,
    ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur,
    ROUND(SUM(v.quantidade * v.preco) / COUNT(DISTINCT c.id), 2) AS gasto_medio_cliente
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.cidade
ORDER BY faturacao_eur DESC;

-- 7. Clientes sem nenhuma compra registada (LEFT JOIN + IS NULL)
SELECT c.id, c.nome, c.cidade
FROM clientes c
LEFT JOIN vendas v ON v.cliente_id = c.id
WHERE v.cliente_id IS NULL;

-- 8. Top 10 clientes mais valiosos (HAVING filtra após agregação)
SELECT
    c.id,
    c.nome,
    c.cidade,
    COUNT(*) AS linhas_compradas,
    ROUND(SUM(v.quantidade * v.preco), 2) AS total_gasto_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome, c.cidade
HAVING SUM(v.quantidade * v.preco) > 280
ORDER BY total_gasto_eur DESC
LIMIT 10;

-- 9. Evolução mensal da faturação em 2025
SELECT
    SUBSTR(CAST(data AS VARCHAR), 1, 7) AS ano_mes,
    COUNT(*) AS transacoes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao_mensal
FROM vendas
GROUP BY SUBSTR(CAST(data AS VARCHAR), 1, 7)
ORDER BY ano_mes;

-- 10. Window Function: acumulado anual mês a mês (Running Total)
WITH mensal AS (
    SELECT
        SUBSTR(CAST(data AS VARCHAR), 1, 7) AS ano_mes,
        ROUND(SUM(quantidade * preco), 2) AS faturacao_mes
    FROM vendas
    GROUP BY SUBSTR(CAST(data AS VARCHAR), 1, 7)
)
SELECT
    ano_mes,
    faturacao_mes,
    ROUND(SUM(faturacao_mes) OVER (ORDER BY ano_mes), 2) AS acumulado_anual
FROM mensal
ORDER BY ano_mes;
