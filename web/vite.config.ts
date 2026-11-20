import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

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

export default defineConfig({
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
      thresholds: { statements: 78, branches: 78, functions: 58, lines: 78 },
    },
  },
});
