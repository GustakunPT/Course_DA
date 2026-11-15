-- Esquema relacional da Mercearia do Bairro (compatível com PostgreSQL e SQLite)
-- Fase 2: modela catalogo de produtos, fichas de clientes e linhas de venda.

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
    produto     VARCHAR(80) NOT NULL,
    quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
    preco       NUMERIC(8, 2) NOT NULL CHECK (preco >= 0)
);

CREATE INDEX idx_vendas_data ON vendas(data);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_produto ON vendas(produto_id);
