import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PASTA_ESTILOS = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/styles');

/** Ficheiros que um CSS importa com @import url("…"), pela ordem em que aparecem. */
export function importsDe(ficheiro: string): string[] {
  const texto = readFileSync(ficheiro, 'utf-8');
  return [...texto.matchAll(/@import url\("([^"]+)"\)/g)].map((m) => resolve(dirname(ficheiro), m[1]));
}

/** O CSS da app inteiro, com os @import substituídos pelo conteúdo, como o Vite o junta no build. */
export function lerCssDaApp(ficheiro = resolve(PASTA_ESTILOS, 'app.css')): string {
  const texto = readFileSync(ficheiro, 'utf-8');
  return texto.replace(/@import url\("([^"]+)"\);?/g, (_m, caminho: string) =>
    lerCssDaApp(resolve(dirname(ficheiro), caminho)),
  );
}

export function partesDoCss(): string[] {
  return readdirSync(resolve(PASTA_ESTILOS, 'partes'))
    .filter((f) => f.endsWith('.css'))
    .map((f) => resolve(PASTA_ESTILOS, 'partes', f));
}
