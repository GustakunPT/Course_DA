// Gera public/og.png (1200×630), a imagem que aparece quando se partilha o link da app
// no LinkedIn, WhatsApp ou Slack. Corre com: node scripts/og-image.mjs
// (precisa do Playwright: npm install --no-save playwright && npx playwright install chromium)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const fonte = (pkg, peso) =>
  readFileSync(require.resolve(`@fontsource/${pkg}/files/${pkg}-latin-${peso}-normal.woff2`)).toString('base64');

// Os números vêm do currículo, para a imagem não ficar desatualizada.
const indice = readFileSync(new URL('../src/data/trackIndex.ts', import.meta.url), 'utf-8');
const etapas = (indice.match(/^\s+code: '\d+'/gm) ?? []).length;
const trilhas = (indice.match(/^\s+lessons: \[/gm) ?? []).length;
if (!etapas || !trilhas) throw new Error('Não consegui contar as etapas e as trilhas em trackIndex.ts.');

const html = `<!doctype html><html><head><style>
@font-face { font-family: 'Host Grotesk'; font-weight: 500; src: url(data:font/woff2;base64,${fonte('host-grotesk', 500)}); }
@font-face { font-family: 'Mono'; font-weight: 400; src: url(data:font/woff2;base64,${fonte('atkinson-hyperlegible-mono', 400)}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #05070a; color: #f8fafc; font-family: 'Host Grotesk', sans-serif;
  padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between;
  background-image: radial-gradient(circle at 92% 8%, rgba(34,197,94,.18), transparent 42%); }
.tag { font-family: 'Mono', monospace; font-size: 26px; color: #22c55e; letter-spacing: .02em; }
h1 { font-size: 84px; line-height: 1.02; font-weight: 500; letter-spacing: -.02em; margin-top: 22px; }
p { font-size: 34px; line-height: 1.3; color: #cbd5e1; max-width: 960px; }
.chips { display: flex; gap: 14px; flex-wrap: wrap; }
.chip { font-family: 'Mono', monospace; font-size: 24px; padding: 10px 18px; border: 2px solid #1f2937; border-radius: 10px; color: #e2e8f0; }
.chip.on { border-color: #22c55e; color: #22c55e; }
</style></head><body>
<div><div class="tag">🛒 Mercearia do Bairro</div><h1>Academia de Análise<br>de Dados</h1></div>
<p>${etapas} etapas em ${trilhas} trilhas, com o código a correr no browser e um projeto final teu.</p>
<div class="chips"><span class="chip on">Python</span><span class="chip on">SQL</span><span class="chip on">pandas</span>
<span class="chip">Git</span><span class="chip">Excel e Power BI</span><span class="chip">Estatística</span></div>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const destino = fileURLToPath(new URL('../public/og.png', import.meta.url));
  await page.screenshot({ path: destino });
  console.log(`✓ ${destino} (${etapas} etapas, ${trilhas} trilhas)`);
} finally {
  await browser.close();
}
