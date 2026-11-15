import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(here, '..');
const repoDados = resolve(webRoot, '..', 'dados');
const repoRelatorios = resolve(webRoot, '..', 'relatorios');
const publicDados = resolve(webRoot, 'public', 'dados');
const publicRelatorios = resolve(webRoot, 'public', 'relatorios');
const publicRoot = resolve(webRoot, 'public');

mkdirSync(publicDados, { recursive: true });
mkdirSync(publicRelatorios, { recursive: true });

for (const csvName of ['produtos.csv', 'clientes.csv', 'vendas.csv', 'vendas_sazonais.csv', 'vendas_sujas.csv']) {
  const src = resolve(repoDados, csvName);
  const dst = resolve(publicDados, csvName);
  if (existsSync(src)) {
    copyFileSync(src, dst);
  }
}

for (const relName of [
  'Dashboard_Mercearia_do_Bairro_2025.xlsx',
  'PowerBI_Mercearia_do_Bairro_PBIP.zip',
  'relatorio_executivo_2025.md',
]) {
  const src = resolve(repoRelatorios, relName);
  const dst = resolve(publicRelatorios, relName);
  if (existsSync(src)) {
    copyFileSync(src, dst);
  }
}

const wasmSrc = resolve(webRoot, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const wasmDst = resolve(publicRoot, 'sql-wasm.wasm');
if (existsSync(wasmSrc)) {
  copyFileSync(wasmSrc, wasmDst);
}

console.log('Synced CSV datasets and sql-wasm.wasm to public/');
