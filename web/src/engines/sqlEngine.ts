import initSqlJs, { type Database } from 'sql.js';
import { loadMerceariaDataset } from './csvEngine';

export interface SqlExecutionResult {
  columns: string[];
  rows: (string | number | null)[][];
  elapsedMs: number;
  error?: string;
}

let dbPromise: Promise<Database> | null = null;

export async function getSqlDatabase(forceReset = false): Promise<Database> {
  if (!dbPromise || forceReset) {
    dbPromise = (async () => {
      const [SQL, dataset] = await Promise.all([
        initSqlJs({ locateFile: () => '/sql-wasm.wasm' }),
        loadMerceariaDataset(),
      ]);

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
    })();
  }
  return dbPromise;
}

export async function runSqlQuery(query: string): Promise<SqlExecutionResult> {
  const start = performance.now();
  try {
    const db = await getSqlDatabase();
    const res = db.exec(query);
    const elapsedMs = Math.round((performance.now() - start) * 10) / 10;
    if (!res.length) {
      return { columns: [], rows: [], elapsedMs };
    }
    const last = res[res.length - 1];
    return {
      columns: last.columns,
      rows: last.values as (string | number | null)[][],
      elapsedMs,
    };
  } catch (err) {
    return {
      columns: [],
      rows: [],
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
