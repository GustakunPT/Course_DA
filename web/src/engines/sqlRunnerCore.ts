import type { Database, SqlJsStatic } from 'sql.js';
import type { MerceariaDataset } from './csvEngine';

export interface SqlExecutionResult {
  columns: string[];
  rows: (string | number | null)[][];
  totalRows?: number;
  truncated?: boolean;
  elapsedMs: number;
  error?: string;
}

export const MAX_SQL_CHARS = 15_000;
export const SQL_EXECUTION_TIMEOUT_MS = 10_000;
export const SQL_MAX_TRANSFER_ROWS = 500;
const BLOCKED_SQL_KEYWORDS =
  /\b(DROP|DELETE|UPDATE|INSERT|ALTER|ATTACH|DETACH|PRAGMA|CREATE|VACUUM|REINDEX)\b|\bREPLACE\s+INTO\b/i;

/** Garante que o editor SQL executa apenas consultas de leitura (SELECT, WITH, EXPLAIN). */
export function validateSqlReadOnly(query: string): string | null {
  if (query.length > MAX_SQL_CHARS) {
    return `A consulta excede o limite de ${MAX_SQL_CHARS} caracteres da bancada.`;
  }
  const stripped = query
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/'(?:''|[^'])*'/g, "''")
    .replace(/"(?:""|[^"])*"/g, '""')
    .trim();

  if (!stripped) return null;
  if (BLOCKED_SQL_KEYWORDS.test(stripped)) {
    return 'A bancada SQL permite apenas consultas de leitura (SELECT, WITH, EXPLAIN). Alterações de esquema ou dados estão bloqueadas.';
  }
  const stmts = stripped
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of stmts) {
    if (!/^(SELECT|WITH|EXPLAIN\s+(?:QUERY\s+PLAN\s+)?(?:SELECT|WITH))\b/i.test(stmt)) {
      return 'Cada instrução na bancada SQL deve começar por SELECT, WITH ou EXPLAIN.';
    }
  }
  return null;
}

export function buildSqlDatabaseFromDataset(SQL: SqlJsStatic, dataset: MerceariaDataset): Database {
  const db = new SQL.Database();
  db.run(`
    CREATE TABLE produtos (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      preco REAL NOT NULL
    );
    CREATE TABLE clientes (
      id INTEGER PRIMARY KEY,
      nome TEXT NOT NULL,
      cidade TEXT NOT NULL
    );
    CREATE TABLE vendas (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      cliente_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      preco REAL NOT NULL
    );
    CREATE TABLE vendas_sazonais (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      cliente_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      preco REAL NOT NULL
    );
    CREATE TABLE vendas_sujas (
      linha INTEGER PRIMARY KEY,
      data TEXT,
      produto TEXT,
      quantidade TEXT,
      preco TEXT
    );
  `);

  db.run('BEGIN TRANSACTION;');
  const insProd = db.prepare('INSERT INTO produtos VALUES (?, ?, ?, ?)');
  for (const p of dataset.produtos) {
    insProd.run([p.id, p.nome, p.categoria, p.preco]);
  }
  insProd.free();

  const insCli = db.prepare('INSERT INTO clientes VALUES (?, ?, ?)');
  for (const c of dataset.clientes) {
    insCli.run([c.id, c.nome, c.cidade]);
  }
  insCli.free();

  const insVen = db.prepare('INSERT INTO vendas VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const v of dataset.vendas) {
    insVen.run([v.id, v.data, v.cliente_id, v.produto_id, v.produto, v.quantidade, v.preco]);
  }
  insVen.free();

  const insSaz = db.prepare('INSERT INTO vendas_sazonais VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const v of dataset.vendasSazonais) {
    insSaz.run([v.id, v.data, v.cliente_id, v.produto_id, v.produto, v.quantidade, v.preco]);
  }
  insSaz.free();

  const insSuj = db.prepare('INSERT INTO vendas_sujas VALUES (?, ?, ?, ?, ?)');
  for (const s of dataset.vendasSujas) {
    insSuj.run([s.linha, s.data, s.produto, s.quantidade, s.preco]);
  }
  insSuj.free();
  db.run('COMMIT;');

  // Mesma vista do esquema normalizado (sql/01_esquema.sql). A tabela vendas da bancada
  // mantém a coluna "produto" para as primeiras lições não precisarem de JOIN.
  db.run(`
    CREATE VIEW vendas_detalhe AS
    SELECT v.id, v.data, v.cliente_id, c.nome AS cliente, c.cidade,
           v.produto_id, p.nome AS produto, p.categoria,
           v.quantidade, v.preco, v.quantidade * v.preco AS subtotal
    FROM vendas v
    INNER JOIN produtos p ON p.id = v.produto_id
    INNER JOIN clientes c ON c.id = v.cliente_id;
  `);

  return db;
}

export function executeSqlOnDatabase(db: Database, query: string, startTime: number): SqlExecutionResult {
  const res = db.exec(query);
  const elapsedMs = Math.round((performance.now() - startTime) * 10) / 10;
  if (!res.length) {
    return { columns: [], rows: [], elapsedMs };
  }
  const last = res[res.length - 1];
  const allRows = last.values as (string | number | null)[][];
  const totalRows = allRows.length;
  const truncated = totalRows > SQL_MAX_TRANSFER_ROWS;
  return {
    columns: last.columns,
    rows: truncated ? allRows.slice(0, SQL_MAX_TRANSFER_ROWS) : allRows,
    totalRows,
    truncated,
    elapsedMs,
  };
}
