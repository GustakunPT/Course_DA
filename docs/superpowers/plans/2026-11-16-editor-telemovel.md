# Ecrã de escrita para telemóvel — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Em aparelhos de toque com ecrã estreito, escrever código passa a fazer-se num ecrã inteiro por cima da lição, com os separadores Enunciado, Código e Resultado. A lição deixa de saltar quando o teclado abre e fecha.

**Architecture:** Um módulo novo, `web/src/ui/mobileEditor.ts`, tem a deteção do aparelho, a preferência do aluno e as funções puras que desenham o ecrã de escrita e a pré-visualização do código. O `main.ts` guarda `state.mobileEditor` e, quando o ecrã está aberto, move para dentro dele o mesmo bloco de editor que hoje está na bancada, com os mesmos ids. Há sempre um só `#workbench-editor` no DOM, por isso os listeners e o rascunho (`state.editorDrafts`) não mudam. A altura do ecrã acompanha `window.visualViewport`.

**Tech Stack:** TypeScript + Vite, sem framework (HTML em template strings re-desenhado por `renderApp()`), Vitest em ambiente node (sem jsdom).

**Spec:** `docs/superpowers/specs/2026-11-16-editor-telemovel-design.md`

## Global Constraints

- O ecrã de escrita só é usado quando `matchMedia('(pointer: coarse)')` **e** `matchMedia('(max-width: 48rem)')` são verdadeiros e o aluno não escolheu o editor normal. Não se usa o user agent.
- A decisão é refeita quando qualquer das duas regras muda (listener `change`).
- O ecrã de escrita e a bancada usam o mesmo rascunho: a mesma chave de `state.editorDrafts`, via `draftKey(currentLesson(), state.wbTab)`.
- Nada muda no computador nem no tablet em horizontal. Correção, treinos, pistas, progresso e sincronização ficam iguais.
- Os textos da interface estão em português europeu e tratam o aluno por "tu" ("Escrever código", "Executar", "Usar o editor normal").
- Separadores, por esta ordem: Enunciado, Código, Resultado.
- A preferência "usar o editor normal" fica guardada no aparelho, em `localStorage`, na chave `'mercearia-editor-normal-v1'`.

## Review Focus

1. **Rodar o telemóvel para horizontal com o ecrã aberto** (a largura passa os 48rem): o ecrã fecha e a bancada normal mostra o mesmo código, sem perder nada. → Task 3, passo de verificação 2.
2. **Botão Voltar do telemóvel com o ecrã aberto:** fecha o ecrã e fica na mesma etapa. Abrir e fechar várias vezes não acumula entradas no histórico: depois de fechar, um Voltar sai da etapa como antes. → Task 3, passo de verificação 3.
3. **Executar com o Python ainda a carregar** (primeira execução, Pyodide a descarregar): o ecrã passa ao Resultado, mostra o estado "a carregar" e o botão Executar fica desativado até terminar. → Task 2, teste `executar fica desativado enquanto corre`.
4. **Mudar de etapa com o ecrã aberto** (link com `#…&licao=`, sincronização na nuvem, índice): o ecrã fecha e não fica preso por cima de outra etapa. → Task 3, passo de verificação 4.
5. **Computador com rato e janela estreita:** nenhum ecrã de escrita. A bancada mostra o editor normal. → Task 1, teste das 4 combinações.

---

## File Structure

- **Create** `web/src/ui/mobileEditor.ts`: deteção, preferência, `renderEcraDeEscrita()`, `renderPreviaCodigo()` e `ligarAlturaVisivel()`. Não importa o `main.ts`.
- **Create** `web/tests/mobileEditor.test.ts`: testes das funções puras.
- **Modify** `web/src/ui/appState.ts`: campo `mobileEditor` no `AppState`.
- **Modify** `web/src/main.ts`: estado, extração do bloco do editor para uma função, ligações (abrir, fechar, separadores, executar, Voltar, rotação) e fecho do ecrã ao mudar de etapa.
- **Modify** `web/src/styles/app.css`: estilos do ecrã de escrita e da pré-visualização.

---

### Task 1: Deteção do aparelho e preferência do aluno

**Files:**
- Create: `web/src/ui/mobileEditor.ts`
- Test: `web/tests/mobileEditor.test.ts`

**Interfaces:**
- Produces:
  - `export type AbaEscrita = 'enunciado' | 'codigo' | 'resultado';`
  - `export function deveUsarEcraDeEscrita(c: { toque: boolean; estreito: boolean; preferirNormal: boolean }): boolean`
  - `export function loadPreferirEditorNormal(): boolean`: lê `'mercearia-editor-normal-v1'`; devolve `false` se não houver `localStorage` ou se ler der erro.
  - `export function savePreferirEditorNormal(valor: boolean): void`: grava `'1'` ou remove a chave; ignora erros.
  - `export function vigiarAparelho(aoMudar: () => void): { toque: () => boolean; estreito: () => boolean }`: cria os dois `matchMedia` (`'(pointer: coarse)'` e `'(max-width: 48rem)'`), regista `change` em ambos para chamar `aoMudar` e devolve leitores do valor atual. Se `window.matchMedia` não existir, os dois leitores devolvem `false`.

- [ ] **Step 1: Escrever os testes que falham**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deveUsarEcraDeEscrita, loadPreferirEditorNormal, savePreferirEditorNormal } from '../src/ui/mobileEditor';

describe('deveUsarEcraDeEscrita', () => {
  it.each([
    [true, true, false, true],   // telemóvel
    [true, false, false, false], // tablet em horizontal
    [false, true, false, false], // computador com rato e janela estreita
    [false, false, false, false],// computador
    [true, true, true, false],   // telemóvel, mas o aluno escolheu o editor normal
  ])('toque=%s estreito=%s preferirNormal=%s → %s', (toque, estreito, preferirNormal, esperado) => {
    expect(deveUsarEcraDeEscrita({ toque, estreito, preferirNormal })).toBe(esperado);
  });
});

describe('preferência do editor normal', () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    });
  });

  it('começa desligada, grava e volta a desligar', () => {
    expect(loadPreferirEditorNormal()).toBe(false);
    savePreferirEditorNormal(true);
    expect(loadPreferirEditorNormal()).toBe(true);
    expect(localStorage.getItem('mercearia-editor-normal-v1')).toBe('1');
    savePreferirEditorNormal(false);
    expect(loadPreferirEditorNormal()).toBe(false);
  });

  it('sem localStorage devolve false e não rebenta', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadPreferirEditorNormal()).toBe(false);
    expect(() => savePreferirEditorNormal(true)).not.toThrow();
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd web && npx vitest run tests/mobileEditor.test.ts`
Expected: FAIL, "Failed to resolve import ../src/ui/mobileEditor".

- [ ] **Step 3: Implementar as quatro funções e o tipo em `web/src/ui/mobileEditor.ts`**, com os contratos do bloco Interfaces.

- [ ] **Step 4: Correr e ver passar**

Run: `cd web && npx vitest run tests/mobileEditor.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add web/src/ui/mobileEditor.ts web/tests/mobileEditor.test.ts
git commit -m "Deteção de aparelho de toque estreito para o ecrã de escrita"
```

---

### Task 2: Desenho do ecrã de escrita e da pré-visualização

**Files:**
- Modify: `web/src/ui/mobileEditor.ts`
- Modify: `web/src/styles/app.css` (acrescentar no fim)
- Test: `web/tests/mobileEditor.test.ts`

**Interfaces:**
- Consumes: `AbaEscrita` (Task 1); `escapeHtml` de `./html`.
- Produces:
  - `export function renderEcraDeEscrita(o: { aba: AbaEscrita; enunciadoHtml: string; editorHtml: string; resultadoHtml: string; simbolos: [string, string][]; rotuloExecutar: string; aCorrer: boolean }): string`
    - Raiz: `<div class="ecra-escrita" role="dialog" aria-modal="true" aria-label="Escrever código">`.
    - Cabeçalho com 3 botões `data-ecra-aba="enunciado|codigo|resultado"` (`role="tab"`, `aria-selected` no ativo), com os textos Enunciado, Código e Resultado, e um botão `data-action="fechar-ecra-escrita"` com `aria-label="Fechar"` e o texto ✕.
    - Três painéis `<section class="ecra-painel" data-painel="…">`, um por aba. Os não ativos levam o atributo `hidden`. O painel `codigo` contém `editorHtml`, que é sempre desenhado, mesmo escondido, para manter um só editor e o cursor.
    - O painel `enunciado` termina com `<button type="button" class="link-btn" data-action="usar-editor-normal">Usar o editor normal</button>`.
    - Barra de baixo `<div class="ecra-barra">` com os símbolos (`class="sym-btn" data-insert="…"`, valores escapados como hoje em `simbolosRapidos`) e `<button type="button" class="btn btn-primary" data-action="executar-ecra-escrita">` com `rotuloExecutar`, com `disabled` quando `aCorrer`.
    - Os símbolos só aparecem quando `aba === 'codigo'`.
    - `enunciadoHtml`, `editorHtml` e `resultadoHtml` já vêm escapados de quem chama e são inseridos tal e qual.
  - `export function renderPreviaCodigo(codigoRealcadoHtml: string): string`: `<button type="button" class="codigo-previa" data-action="abrir-ecra-escrita">` com `<pre><code>${codigoRealcadoHtml}</code></pre>` e um rótulo visível "Escrever código". Não tem `textarea`, por isso tocar não abre o teclado.
  - `export function ligarAlturaVisivel(el: HTMLElement): () => void`: se existir `window.visualViewport`, define `--vv-altura` (height em px) e `--vv-topo` (offsetTop em px) em `el.style` já e em cada `resize`/`scroll` do `visualViewport`. Devolve a função que remove os listeners. Sem `visualViewport`, não faz nada e devolve uma função vazia. Não tem teste em node; verifica-se na Task 3.

- [ ] **Step 1: Escrever os testes que falham** (no mesmo ficheiro de testes)

```ts
import { renderEcraDeEscrita, renderPreviaCodigo } from '../src/ui/mobileEditor';

const base = {
  enunciadoHtml: '<p>Soma as vendas</p>',
  editorHtml: '<textarea id="workbench-editor"></textarea>',
  resultadoHtml: '<div class="out">ok</div>',
  simbolos: [[':', ':'], ['"', '"']] as [string, string][],
  rotuloExecutar: 'Executar',
  aCorrer: false,
};

describe('renderEcraDeEscrita', () => {
  it('desenha os 3 separadores por ordem e marca o ativo', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'codigo' });
    const abas = [...html.matchAll(/data-ecra-aba="(\w+)"/g)].map((m) => m[1]);
    expect(abas).toEqual(['enunciado', 'codigo', 'resultado']);
    expect(html).toMatch(/aria-selected="true"[^>]*data-ecra-aba="codigo"|data-ecra-aba="codigo"[^>]*aria-selected="true"/);
  });

  it('o editor existe uma só vez, mesmo noutro separador', () => {
    for (const aba of ['enunciado', 'codigo', 'resultado'] as const) {
      const html = renderEcraDeEscrita({ ...base, aba });
      expect(html.match(/id="workbench-editor"/g)).toHaveLength(1);
    }
  });

  it('só o painel ativo fica visível', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'resultado' });
    expect(html).toMatch(/data-painel="resultado"(?![^>]*hidden)/);
    expect(html).toMatch(/data-painel="codigo"[^>]*hidden/);
    expect(html).toMatch(/data-painel="enunciado"[^>]*hidden/);
  });

  it('os símbolos só aparecem no separador Código', () => {
    expect(renderEcraDeEscrita({ ...base, aba: 'codigo' })).toContain('data-insert=":"');
    expect(renderEcraDeEscrita({ ...base, aba: 'resultado' })).not.toContain('data-insert');
  });

  it('executar fica desativado enquanto corre', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'resultado', aCorrer: true });
    expect(html).toMatch(/data-action="executar-ecra-escrita"[^>]*disabled/);
  });

  it('escapa os símbolos e tem saída para o editor normal', () => {
    const html = renderEcraDeEscrita({ ...base, aba: 'codigo' });
    expect(html).toContain('data-insert="&quot;"');
    expect(html).toContain('data-action="usar-editor-normal"');
    expect(html).toContain('data-action="fechar-ecra-escrita"');
  });
});

describe('renderPreviaCodigo', () => {
  it('mostra o código sem caixa de texto e abre o ecrã de escrita', () => {
    const html = renderPreviaCodigo('<span>print</span>(1)');
    expect(html).toContain('data-action="abrir-ecra-escrita"');
    expect(html).toContain('<span>print</span>(1)');
    expect(html).toContain('Escrever código');
    expect(html).not.toContain('<textarea');
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `cd web && npx vitest run tests/mobileEditor.test.ts`
Expected: FAIL, "renderEcraDeEscrita is not exported" (ou equivalente).

- [ ] **Step 3: Implementar `renderEcraDeEscrita`, `renderPreviaCodigo` e `ligarAlturaVisivel`** com os contratos acima.

- [ ] **Step 4: Acrescentar os estilos no fim de `web/src/styles/app.css`**
  - `.ecra-escrita`: `position: fixed; left: 0; right: 0; top: var(--vv-topo, 0px); height: var(--vv-altura, 100dvh); z-index` acima da barra do topo e abaixo dos modais existentes. É uma grelha com 3 linhas: cabeçalho `auto`, painel `1fr` com `overflow: auto`, barra `auto`. Fundo `var(--color-paper)`.
  - O cabeçalho e a barra usam as variáveis de cor e espaçamento já usadas na `.workbench-toolbar` e na `.mobile-symbols-bar`. A barra faz scroll horizontal dos símbolos, com o botão Executar fixo à direita.
  - No painel Código, o `.code-editor-shell` ocupa a altura toda do painel (`height: 100%`).
  - `.codigo-previa`: largura total, alinhado à esquerda, com o fundo e a borda do `.code-editor-shell`, `max-height: 12rem` e `overflow: hidden`. O rótulo "Escrever código" aparece como um chip no canto.
  - `body.tem-ecra-escrita { overflow: hidden; }`.
  - Respeitar `--safe-bottom` na barra de baixo.

- [ ] **Step 5: Correr e ver passar**

Run: `cd web && npx vitest run tests/mobileEditor.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web/src/ui/mobileEditor.ts web/src/styles/app.css web/tests/mobileEditor.test.ts
git commit -m "Desenho do ecrã de escrita e da pré-visualização do código"
```

---

### Task 3: Ligar o ecrã de escrita à app

**Files:**
- Modify: `web/src/ui/appState.ts` (interface `AppState`)
- Modify: `web/src/main.ts`: estado inicial (~linha 44), `renderAcademyWorkspace()` (~linhas 680–785, bloco do enunciado, símbolos, editor, pistas e resultado), `renderApp()`, `attachDomListeners()`, ações `data-action` (~linha 1328) e listeners globais (~linha 1854)

**Interfaces:**
- Consumes: tudo o que as Tasks 1 e 2 produzem.
- Produces (internas ao `main.ts`):
  - `AppState.mobileEditor: AbaEscrita | null` (começa a `null`).
  - `function renderEditorShell(editorVal: string, engine: EngineKind): string`: o bloco `<div class="code-editor-shell" id="editor-shell">…</div>` atual, movido sem mudanças.
  - `function renderEnunciado(lesson: Lesson): string`: o bloco `.challenge-prompt` atual mais o painel de pistas atual e o botão "Pedir pista" (`data-action="next-hint"`) quando `state.hintLevel < 2`.
  - `function usaEcraDeEscrita(): boolean`: chama `deveUsarEcraDeEscrita` com os leitores de `vigiarAparelho` e com `loadPreferirEditorNormal()`.
  - `function abrirEcraDeEscrita(aba: AbaEscrita): void` e `function fecharEcraDeEscrita(opcoes?: { viaHistorico?: boolean }): void`.

- [ ] **Step 1: Estado.** Acrescentar `mobileEditor: AbaEscrita | null` ao `AppState` e `mobileEditor: null` ao estado inicial.

- [ ] **Step 2: Extrair sem mudar comportamento.** Mover o bloco do editor para `renderEditorShell()` e o enunciado com as pistas para `renderEnunciado()`. Correr `cd web && npx tsc --noEmit -p . && npx vitest run`. Esperado: tudo verde e a bancada igual no desktop.

- [ ] **Step 3: Bancada quando `usaEcraDeEscrita()` é verdade.**
  - Em vez de `renderEditorShell(...)` e da `.mobile-symbols-bar`, a bancada mostra `renderPreviaCodigo(highlightCode(editorVal, engine))`.
  - O resto (enunciado, botões Formatar, Repor, pistas e solução, resultado) fica como está.
  - Quando o aparelho se qualifica mas a preferência é "editor normal", aparece por baixo do editor um `<button class="link-btn" data-action="usar-ecra-escrita">Usar o ecrã de escrita</button>`.

- [ ] **Step 4: Desenhar o ecrã.** Em `renderApp()`, quando `state.view === 'academia'` e `state.mobileEditor !== null` e `usaEcraDeEscrita()`:
  - acrescentar ao fim do HTML `renderEcraDeEscrita({ aba: state.mobileEditor, enunciadoHtml: renderEnunciado(lesson), editorHtml: renderEditorShell(getEditorValue(), activeEngine()), resultadoHtml: renderOutputRegion(state.output, activeEngine()), simbolos: simbolosRapidos(activeEngine()), rotuloExecutar: state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar', aCorrer: state.output.kind === 'loading' })`;
  - aplicar `document.body.classList.toggle('tem-ecra-escrita', aberto)`;
  - depois do render, ligar `ligarAlturaVisivel()` ao `.ecra-escrita` e guardar a função de limpeza para o render seguinte.

  Neste caso a bancada não desenha a pré-visualização: o editor existe uma só vez, dentro do ecrã.

- [ ] **Step 5: Abrir e fechar.**
  - `abrirEcraDeEscrita(aba)`:
    1. guarda `window.scrollY` numa variável do módulo;
    2. se o ecrã estava fechado, faz `history.pushState({ ecraEscrita: true }, '')`;
    3. põe `state.mobileEditor = aba` e chama `renderApp()`;
    4. se `aba === 'codigo'`, chama já `focus()` no `#workbench-editor`, com o cursor no fim. Tem de ser no mesmo gesto do toque, porque o iPhone só abre o teclado assim.
  - `fecharEcraDeEscrita({ viaHistorico })`:
    1. põe `state.mobileEditor = null`, chama `renderApp()` e repõe `window.scrollTo(0, guardado)`;
    2. se não veio do histórico e a entrada atual tem `history.state?.ecraEscrita`, faz `history.back()`.

    Assim o Voltar não acumula entradas.
  - Ações:
    - `abrir-ecra-escrita` → `abrirEcraDeEscrita('codigo')`;
    - `fechar-ecra-escrita` → `fecharEcraDeEscrita()`;
    - `usar-editor-normal` → `savePreferirEditorNormal(true)` e `fecharEcraDeEscrita()`;
    - `usar-ecra-escrita` → `savePreferirEditorNormal(false)` e `renderApp()`;
    - clique em `[data-ecra-aba]` → muda `state.mobileEditor`, desenha e, se for `codigo`, foca o editor como acima.
  - O listener atual de `[data-insert]` funciona tal como está, porque procura `#workbench-editor`.

- [ ] **Step 6: Executar.** Ação `executar-ecra-escrita`:
  1. `(document.activeElement as HTMLElement | null)?.blur()`, para fechar o teclado;
  2. `state.mobileEditor = 'resultado'`;
  3. `void executeWorkbench()`, que já desenha o estado "a carregar" e o resultado.

- [ ] **Step 7: Fechar sozinho.**
  - `window.addEventListener('popstate', ...)`: se o ecrã estiver aberto, chama `fecharEcraDeEscrita({ viaHistorico: true })`.
  - Mudança de aparelho: `vigiarAparelho(aoMudar)`. Se o ecrã estiver aberto e `usaEcraDeEscrita()` passar a falso, faz `state.mobileEditor = null` e `renderApp()`. Se estiver fechado, chama só `renderApp()`, para trocar a pré-visualização pelo editor normal ou o contrário.
  - Mudança de etapa: em todos os sítios que mudam `state.lessonId`, `state.trackId`, `state.wbTab` ou `state.practiceIdx`, e no listener `hashchange`, pôr `state.mobileEditor = null` antes do render. O mais simples é comparar a etapa anterior com a nova no início de `renderApp()` e fechar o ecrã se mudou. Guardar a última `${trackId}|${lessonId}|${wbTab}|${practiceIdx}` numa variável do módulo.
  - `Escape` (no listener global de keydown que já existe) fecha o ecrã se estiver aberto.

- [ ] **Step 8: Verificar tipos e testes.**

Run: `cd web && npx tsc --noEmit -p . && npx vitest run && npm run build`
Expected: sem erros de tipos, todos os testes verdes e build concluído.

- [ ] **Step 9: Verificar no browser** (servidor `web-preview`, `npm run preview` na porta 4173; ecrã de telemóvel com `resize_window` preset `mobile`, que também emula o toque):
  1. Etapa `py-05-ciclo-for` → aba Bancada: aparece a pré-visualização com "Escrever código" e não há `textarea` na bancada. Tocar abre o ecrã no separador Código com o editor focado. Escrever `print(1)` e confirmar que o rascunho foi gravado (`localStorage`). Executar mostra o Resultado. ✕ fecha e o `scrollY` é igual ao de antes de abrir.
  2. Com o ecrã aberto, mudar para preset `tablet` em horizontal (ou largura 1024): o ecrã fecha e o editor normal mostra `print(1)`. (Review Focus 1)
  3. Abrir, `navigate back`: o ecrã fecha e o endereço continua na mesma etapa. Abrir e fechar com ✕ três vezes e depois `navigate back` uma vez: sai da etapa, como sairia antes desta mudança. (Review Focus 2)
  4. Com o ecrã aberto, `navigate` para `#vista=academia&trilha=python&licao=py-06-while`: o ecrã fecha. (Review Focus 4)
  5. Preset `desktop`: a bancada é exatamente a de antes, com caixa de texto e sem pré-visualização. (Review Focus 5)
  6. "Usar o editor normal" → a bancada mostra a caixa de texto com "Usar o ecrã de escrita"; carregar nele volta à pré-visualização.
  7. A consola não tem erros.

  O comportamento com o teclado verdadeiro (barra colada ao teclado, lição sem saltos) não aparece na emulação. Fica para confirmar num telemóvel real, em Android Chrome e iPhone Safari.

- [ ] **Step 10: Commit**

```bash
git add web/src/ui/appState.ts web/src/main.ts
git commit -m "Ecrã de escrita no telemóvel: abrir, executar, fechar e voltar"
```

---

### Task 4: README

**Files:**
- Modify: `README.md` (a lista de funcionalidades da app, perto da descrição da barra de símbolos do telemóvel ou da secção da app)

- [ ] **Step 1:** Acrescentar uma linha: "No telemóvel e no tablet na vertical, escrever código abre um ecrã próprio com Enunciado, Código e Resultado, para o teclado não desarrumar a lição. Quem preferir pode voltar ao editor normal."
- [ ] **Step 2:** `git add README.md && git commit -m "README: ecrã de escrita no telemóvel"` e `git push origin main`.
