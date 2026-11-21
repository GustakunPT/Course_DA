import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.SMOKE_PORT ?? 4178);
const BASE_URL = `http://127.0.0.1:${PORT}`;
// Browsers a testar, separados por vírgula: chromium, firefox, webkit. Por omissão só o Chromium,
// que é o único que costuma estar instalado; o CI corre os três.
const BROWSERS = (process.env.SMOKE_BROWSERS ?? 'chromium')
  .split(',')
  .map((b) => b.trim())
  .filter(Boolean);

async function waitForServer(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Ainda a arrancar
    }
    await delay(250);
  }
  throw new Error(`Servidor preview não respondeu em ${url} dentro de ${timeoutMs}ms.`);
}

/** Corre o axe-core na página e falha se houver violações sérias ou críticas (WCAG 2.1 AA). */
async function verificarAcessibilidade(page, nome) {
  let axePath;
  try {
    axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
  } catch {
    throw new Error('axe-core não está instalado. Instala com: npm install --no-save playwright axe-core');
  }
  await page.addScriptTag({ path: axePath });
  const violacoes = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
    return res.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.impact} ${v.id} (${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`);
  });
  if (violacoes.length) throw new Error(`Acessibilidade (${nome}):\n${violacoes.join('\n')}`);
}

/** Abre uma página nova e junta os erros da consola e da página, para falhar no fim se houver algum. */
async function novaPagina(browser, opcoes) {
  // bypassCSP: só para poder injetar o axe-core na página (a CSP de produção não aceita scripts inline).
  const context = await browser.newContext({ bypassCSP: true, ...opcoes });
  const page = await context.newPage();
  const erros = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') erros.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => erros.push(`page: ${err.message}`));
  return { page, erros, fechar: () => context.close() };
}

/** Percurso no computador: navegação por teclado, modais, nivelamento, SQL, Cronograma e acessibilidade. */
async function percursoComputador(browser, nomeBrowser) {
  const { page, erros, fechar } = await novaPagina(browser, { viewport: { width: 1366, height: 900 } });
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // 1) Skip-link + landmark principal
    const skipHref = await page.locator('a.skip-link').getAttribute('href');
    if (skipHref !== '#conteudo-principal') throw new Error(`Skip-link inválido: ${skipHref}`);
    const mainCount = await page.locator('main#conteudo-principal').count();
    if (mainCount !== 1) throw new Error('Landmark main#conteudo-principal em falta.');

    // 2) Modal Guia: foco inicial + trap Tab + Escape restaura foco
    await page.locator('[data-action="open-guide-modal"]').first().click();
    await page.locator('.modal-backdrop[role="dialog"]').waitFor({ state: 'visible' });
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
    }
    const focusInside = await page.evaluate(() =>
      Boolean(document.activeElement?.closest('.modal-backdrop[role="dialog"]')),
    );
    if (!focusInside) throw new Error('Foco escapou da modal Guia ao premir Tab.');
    await page.keyboard.press('Escape');
    await page.locator('.modal-backdrop[role="dialog"]').waitFor({ state: 'detached' });
    const restoredAction = await page.evaluate(() => document.activeElement?.dataset?.action ?? '');
    if (restoredAction !== 'open-guide-modal') {
      throw new Error(`Foco não voltou ao botão Guia após Escape (ativo: "${restoredAction}").`);
    }

    // 3) Diagnóstico + Nivelamento prático de 4 perguntas
    await page.locator('[data-action="open-diagnostic-modal"]').first().click();
    await page.locator('[data-action="toggle-placement-quiz"]').click();
    for (const q of ['negocio', 'sql', 'python', 'estatistica']) {
      await page.locator(`[data-placement-q="${q}"][data-placement-opt="1"]`).click();
    }
    const applyVisible = await page.locator('[data-action="apply-placement-result"]').isVisible();
    if (!applyVisible) throw new Error('Botão de aplicar nivelamento prático não apareceu após 4 respostas.');
    await page.keyboard.press('Escape');

    // 4) Trilha SQL + execução no Worker SQLite
    // A trilha aparece na barra de topo e nos botões do índice lateral: usa-se a da barra de topo.
    await page.locator('.track-strip [data-select-track="sql"]').click();
    await page.locator('h1', { hasText: 'SELECT' }).waitFor({ state: 'visible' });
    await page.locator('[data-wb-tab="sqlfree"]').click();
    // O resultado vazio também tem um botão "Executar código atual": usa-se o botão principal da bancada.
    await page.locator('.workbench-actions [data-action="run-code"]').click();
    await page
      .locator('.output-panel table.data-table tbody tr')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });

    // 5) Cronograma Gantt + verificação ARIA (zero aria-selected em botões fora de role="tab")
    await page.locator('[data-select-view="cronograma"]').click();
    await page.locator('.gantt-board').waitFor({ state: 'visible' });
    const badAria = await page.evaluate(
      () => Array.from(document.querySelectorAll('button[aria-selected]:not([role="tab"])')).length,
    );
    if (badAria > 0) throw new Error(`Encontrados ${badAria} botões com aria-selected sem role="tab".`);

    // 6) Acessibilidade (axe-core, as regras do Lighthouse): sem violações sérias ou críticas
    //    numa lição com bancada e no Cronograma.
    await verificarAcessibilidade(page, `Cronograma, ${nomeBrowser}`);
    await page.goto(`${BASE_URL}/#vista=academia&trilha=python&licao=py-02-variaveis`, { waitUntil: 'networkidle' });
    await page.locator('#workbench-editor').waitFor({ state: 'visible' });
    await verificarAcessibilidade(page, `lição Python, ${nomeBrowser}`);

    // 7) Python a sério no Web Worker: o Pyodide arranca (runtime local + wasm da CDN com SRI) e corre
    //    o código da etapa. Com o código inicial as verificações falham, mas tem de haver resultado.
    //    (A bancada guarda o separador do passo 4: volta-se ao desafio da etapa.)
    await page.locator('[data-wb-tab="challenge"]').click();
    await page.locator('.workbench-actions [data-action="run-code"]').click();
    try {
      await page
        .locator('.output-panel', { hasText: /verificações certas|testes passaram/ })
        .waitFor({ timeout: 90_000 });
    } catch (err) {
      const painel = await page
        .locator('.output-panel')
        .first()
        .innerText()
        .catch(() => '(sem painel de resultado)');
      throw new Error(`Python não correu (${nomeBrowser}). Painel: ${painel.replace(/\s+/g, ' ').slice(0, 300)}`, {
        cause: err,
      });
    }

    if (erros.length) throw new Error(`Erros de browser (${nomeBrowser}):\n${erros.join('\n')}`);
  } finally {
    await fechar();
  }
}

/** Percurso no telemóvel: o código escreve-se num ecrã próprio com Enunciado, Código e Resultado. */
async function percursoTelemovel(browser, nomeBrowser, aparelho) {
  const { page, erros, fechar } = await novaPagina(browser, aparelho);
  try {
    await page.goto(`${BASE_URL}/#vista=academia&trilha=sql&licao=sql-01-select`, { waitUntil: 'networkidle' });
    await page.locator('h1', { hasText: 'SELECT' }).waitFor({ state: 'visible' });

    // No telemóvel não há divisórias de arrastar: a lição e a bancada ficam uma por baixo da outra.
    if (await page.locator('#splitter-main').isVisible()) {
      throw new Error('A divisória lição/editor não devia aparecer no telemóvel.');
    }

    // No telemóvel a bancada está noutro painel: abre-se com o botão da lição.
    await page.locator('[data-action="switch-to-workbench"]').first().tap();
    // Tocar no código abre o ecrã de escrita, um diálogo com o editor.
    await page.locator('[data-action="abrir-ecra-escrita"]').first().tap();
    const ecra = page.locator('.ecra-escrita[role="dialog"]');
    await ecra.waitFor({ state: 'visible' });
    await ecra.locator('#workbench-editor').waitFor({ state: 'visible' });
    await verificarAcessibilidade(page, `ecrã de escrita, ${nomeBrowser}`);

    // Executar mostra o separador Resultado com a tabela da consulta.
    await ecra.locator('[data-action="executar-ecra-escrita"]').tap();
    await ecra.locator('[data-ecra-aba="resultado"][aria-selected="true"]').waitFor({ timeout: 15_000 });
    await ecra.locator('table.data-table tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });

    // Fechar volta à lição.
    await ecra.locator('[data-action="fechar-ecra-escrita"]').tap();
    await ecra.waitFor({ state: 'detached' });

    if (erros.length) throw new Error(`Erros de browser (${nomeBrowser}, telemóvel):\n${erros.join('\n')}`);
  } finally {
    await fechar();
  }
}

async function run() {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    throw new Error(
      'Playwright não está instalado. Instala com: npm install --no-save playwright && npx playwright install chromium',
    );
  }

  // O vite corre diretamente com o node (sem npx nem shell): assim o kill() acerta no próprio servidor.
  // Com npx, no Linux o SIGTERM ficava no npx, o vite continuava vivo e o passo do CI nunca acabava.
  const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
  const server = spawn(
    process.execPath,
    [viteBin, 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { stdio: 'ignore' },
  );

  try {
    await waitForServer(BASE_URL);
    for (const nome of BROWSERS) {
      const tipo = playwright[nome];
      if (!tipo) throw new Error(`Browser desconhecido em SMOKE_BROWSERS: "${nome}".`);
      const browser = await tipo.launch({ headless: true });
      try {
        await percursoComputador(browser, nome);
        console.log(`✓ ${nome}: computador`);
        // O Firefox do Playwright não emula telemóveis (isMobile); o Chromium faz de Android e o WebKit de iPhone.
        const aparelho =
          nome === 'chromium'
            ? playwright.devices['Pixel 7']
            : nome === 'webkit'
              ? playwright.devices['iPhone 14']
              : null;
        if (aparelho) {
          await percursoTelemovel(browser, nome, aparelho);
          console.log(`✓ ${nome}: telemóvel (${nome === 'chromium' ? 'Pixel 7' : 'iPhone 14'})`);
        }
      } finally {
        await browser.close();
      }
    }

    console.log(
      `✓ Playwright E2E smoke test PASSED em ${BROWSERS.join(', ')} (skip-link, modal, nivelamento, SQL Worker, Python no Pyodide, Gantt ARIA, ecrã de escrita no telemóvel, axe-core WCAG AA, 0 erros).`,
    );
  } finally {
    server.kill('SIGTERM');
  }
}

// Termina sempre de forma explícita: um processo filho esquecido não pode deixar o CI à espera.
run().then(
  () => process.exit(0),
  (err) => {
    console.error('✗ E2E smoke test FAILED:', err);
    process.exit(1);
  },
);
