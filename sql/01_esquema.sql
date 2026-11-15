-- Esquema relacional da Mercearia do Bairro (compatível com PostgreSQL e SQLite)
-- Fase 2: modela catalogo de produtos, fichas de clientes e linhas de venda.
--
-- Normalização (3.ª forma normal):
--   * O nome do produto vive só em produtos.nome. O CSV dados/vendas.csv traz também uma
--     coluna "produto" (cópia do nome) para facilitar as primeiras lições, mas guardá-la
--     em vendas seria redundante: se um nome mudasse, teria de ser corrigido em milhares de
--     linhas e podia ficar inconsistente. Para ver o nome, use a vista vendas_detalhe.
--   * vendas.preco NÃO é redundante: é o preço praticado no dia da venda. O preço de
--     catálogo (produtos.preco) pode mudar amanhã sem alterar o histórico.
--
-- Para criar uma base SQLite já carregada com os CSV: python src/carregar_base.py

DROP VIEW IF EXISTS vendas_detalhe;
DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS produtos;

CREATE TABLE produtos (
    id          INTEGER PRIMARY KEY,
    nome        VARCHAR(80) NOT NULL,
    categoria   VARCHAR(40) NOT NULL,
    preco       NUMERIC(8, 2) NOT NULL CHECK (preco > 0)
);

CREATE TABLE clientes (
    id          INTEGER PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    cidade      VARCHAR(60) NOT NULL
);

CREATE TABLE vendas (
    id          INTEGER PRIMARY KEY,
    data        DATE NOT NULL,
    cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
    produto_id  INTEGER NOT NULL REFERENCES produtos(id),
    quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
    preco       NUMERIC(8, 2) NOT NULL CHECK (preco >= 0)
);

CREATE INDEX idx_vendas_data ON vendas(data);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_produto ON vendas(produto_id);

-- Vista com os nomes e categorias já juntos (o que antes estava duplicado em vendas)
CREATE VIEW vendas_detalhe AS
SELECT
    v.id,
    v.data,
    v.cliente_id,
    c.nome      AS cliente,
    c.cidade,
    v.produto_id,
    p.nome      AS produto,
    p.categoria,
    v.quantidade,
    v.preco,
    v.quantidade * v.preco AS subtotal
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
INNER JOIN clientes c ON c.id = v.cliente_id;
