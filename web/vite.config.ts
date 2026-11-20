import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { PYODIDE_VERSION } from './src/engines/pythonRunnerCore';

// Usa no "npm run preview" os mesmos cabeçalhos de segurança (incluindo a CSP) que o vercel.json
// aplica em produção, para que um problema de CSP apareça localmente antes do deploy.
interface VercelHeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf-8')) as {
  headers: VercelHeaderRule[];
};
const securityHeaders = Object.fromEntries(
  vercel.headers
    .filter((rule) => rule.source.startsWith('/(') || rule.source.startsWith('/((?!'))
    .flatMap((rule) => rule.headers.map((h) => [h.key, h.value])),
);

/**
 * Dá à cache do service worker um nome novo a cada build (a partir dos nomes dos ficheiros gerados).
 * Ao ativar, o sw.js apaga as caches com outro nome: os bundles de deploys antigos não se acumulam.
 */
function versionarServiceWorker(): Plugin {
  let outDir = 'dist';
  let buildId = '';
  return {
    name: 'versionar-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    generateBundle(_options, bundle) {
      buildId = createHash('sha256').update(Object.keys(bundle).sort().join('|')).digest('hex').slice(0, 12);
    },
    closeBundle() {
      const sw = resolve(outDir, 'sw.js');
      const original = readFileSync(sw, 'utf-8');
      for (const marcador of ['__BUILD_ID__', '__PYODIDE_VERSION__']) {
        if (!original.includes(marcador)) throw new Error(`sw.js sem o marcador ${marcador}.`);
      }
      writeFileSync(sw, original.replace('__BUILD_ID__', buildId).replace('__PYODIDE_VERSION__', PYODIDE_VERSION));
    },
  };
}

export default defineConfig({
  plugins: [versionarServiceWorker()],
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/sql.js/')) {
            return 'vendor-sql';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 4173,
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**', 'api/**'],
      reporter: ['text-summary', 'html'],
      // Mínimos 3 pontos abaixo dos valores atuais: o CI falha se a cobertura descer a sério.
      // (Desde o vitest 4 a v8 conta instruções e não linhas de texto: os ficheiros de lições,
      // feitos de strings longas, deixaram de inflacionar a percentagem. Os testes são os mesmos.)
      thresholds: { statements: 58, branches: 55, functions: 65, lines: 59 },
    },
  },
});
