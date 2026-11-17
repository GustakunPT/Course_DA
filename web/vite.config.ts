import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

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
          if (
            normalized.includes('/src/data/trackGitAndBi') ||
            normalized.includes('/src/data/practiceBiPro') ||
            normalized.includes('/src/data/practiceStats') ||
            normalized.includes('/src/data/practiceGit') ||
            normalized.includes('/src/data/moreQuiz')
          ) {
            return 'curriculum-bi-stats';
          }
          if (
            normalized.includes('/src/data/trackCareerPro') ||
            normalized.includes('/src/data/trackProjetoFinal') ||
            normalized.includes('/src/data/practiceProjeto')
          ) {
            return 'curriculum-career';
          }
          if (
            normalized.includes('/src/data/trackPython') ||
            normalized.includes('/src/data/trackSql') ||
            normalized.includes('/src/data/trackPandas') ||
            normalized.includes('/src/data/practicePython') ||
            normalized.includes('/src/data/practiceSql') ||
            normalized.includes('/src/data/practicePandas') ||
            normalized.includes('/src/data/pythonExplained')
          ) {
            return 'curriculum-core';
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
});
