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
  },
  server: {
    port: 4173,
  },
  preview: {
    headers: securityHeaders,
  },
});
