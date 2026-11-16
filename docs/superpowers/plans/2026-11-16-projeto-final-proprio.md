# Projeto final próprio (trilha 8) — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Acrescentar a trilha "8. Projeto final", com 5 etapas:
- uma limpeza a sério, corrigida na app, sobre viagens de bicicletas geradas;
- quatro etapas de um tipo novo, "projeto", em que o aluno faz o seu próprio projeto no computador e o publica no GitHub.

**Architecture:**
- O gerador Python (`src/gerar_dados.py`) cria o ficheiro sujo e a versão limpa de referência; só o sujo chega à app.
- O motor Python passa a aceitar ficheiros extra por etapa, carregados uma só vez quando são pedidos.
- As etapas de projeto têm `engine: 'projeto'` e um `projectSpec`. Um módulo novo, `web/src/ui/projectPanel.ts`, guarda as regras puras e o desenho do painel; o `main.ts` liga-o.
- As marcas da lista vão para `state.practiceDone` (chaves `${id}#lista:${n}`) e o link vai para `state.editorDrafts[`${id}:challenge`]`. Ambos já são guardados e sincronizados.
- Uma etapa de projeto concluída aparece como "Feito por ti, não corrigido" em todo o lado: índice, topo da lição, janela de progresso e portefólio.

**Tech Stack:** TypeScript + Vite sem framework, Vitest (node), Pyodide 0.26.4 nos testes Python, Python 3 só com biblioteca padrão no gerador, pytest.

**Spec:** `docs/superpowers/specs/2026-11-16-projeto-final-proprio-design.md`

## Global Constraints

- Português europeu, tratando o aluno por "tu", sem anglicismos desnecessários.
- Sem dependências novas, nem na app nem no gerador.
- A política de segurança do site (`web/vercel.json`, `connect-src 'self' https://cdn.jsdelivr.net`) não muda.
- O progresso já guardado continua válido: nenhuma chave existente muda de significado e os números da Mercearia (26 902,89 € e outros) não mudam.
- O ficheiro limpo de referência **nunca** é copiado para `web/public/dados/` nem escrito no Pyodide.
- O ficheiro sujo só é descarregado e escrito no Pyodide numa etapa que o declare.
- Estado guardado de uma etapa de projeto concluída: `autonomous`. A apresentação vem de `lesson.engine === 'projeto'`.
- Texto do estado de uma etapa de projeto concluída: **"Feito por ti, não corrigido"**. Linha da janela de progresso e secção do portefólio: **"Projeto final (autoavaliado)"**.
- Trilha: id `'projeto-final'`, `shortTitle` `'8. Projeto final'`, a seguir a `'carreira'`, códigos `01` a `05`. Total do curso: **72 etapas**.

## Review Focus

1. **O aluno desmarca um item depois de a etapa estar concluída.** A etapa continua concluída e o painel mostra o item desmarcado. → Task 5, passo de verificação no browser 3.
2. **Links do GitHub quase certos:** `http://`, só o utilizador, espaços nas pontas, `www.github.com`, outro site. São recusados, e a etapa 5 não fica concluída. Com uma barra final, o link é aceite. → Task 4, teste `linkGithubValido`.
3. **As marcas do projeto passam pela cópia de segurança e pelo código de retoma.** Exportar e importar (JSON e MB1) mantém as chaves `#lista:`. → Task 5, teste em `progress.test.ts`.
4. **O ficheiro das bicicletas noutra trilha, ou pedido duas vezes.** Nas outras trilhas não é descarregado; na trilha 8 é descarregado uma só vez. → Task 2, teste `ficheiros extra carregam uma só vez`.
5. **Etapa de projeto no telemóvel.** Não aparece o ecrã de escrita nem a pré-visualização do código; o painel lê-se a 375 px sem scroll horizontal. → Task 5, passo de verificação no browser 5.

---

## File Structure

| Ficheiro | O que muda |
|---|---|
| `src/gerar_dados.py` | Modify: `gerar_viagens_bicicletas()` e a escrita dos 2 CSV em `main()` |
| `tests/test_bicicletas.py` | Create: testes pytest do gerador |
| `dados/bicicletas_viagens_sujas.csv`, `dados/bicicletas_viagens_limpas.csv` | Create: gerados e incluídos no repositório |
| `web/scripts/sync-assets.mjs` | Modify: copia **só** o ficheiro sujo |
| `web/src/engines/pythonEngine.ts` | Modify: parâmetro `ficheirosExtra` em `runPythonCode` |
| `web/src/data/types.ts` | Modify: `EngineKind` com `'projeto'`, `Lesson.projectSpec?`, `Lesson.ficheirosDados?` |
| `web/src/data/trackProjetoFinal.ts` | Create: a trilha 8 com as 5 etapas |
| `web/src/data/practiceProjeto.ts` | Create: os 2 treinos da etapa 1 |
| `web/src/data/moreQuiz.ts` | Modify: 2 perguntas extra para `pf-01` |
| `web/src/data/curriculum.ts` | Modify: liga a trilha 8 |
| `web/src/ui/projectPanel.ts` | Create: regras puras e desenho do painel |
| `web/src/main.ts`, `web/src/ui/modals.ts`, `web/src/data/progress.ts` | Modify: painel e estado "Feito por ti, não corrigido" |
| `web/src/styles/app.css` | Modify: painel e estado |
| `web/tests/*.test.ts`, `README.md` | Modify |

---

### Task 1: Gerador das viagens de bicicletas

**Files:**
- Modify: `src/gerar_dados.py`
- Create: `tests/test_bicicletas.py`, `dados/bicicletas_viagens_sujas.csv`, `dados/bicicletas_viagens_limpas.csv`
- Modify: `web/scripts/sync-assets.mjs` (lista de CSV copiados)

**Interfaces:**
- Produces:
  - `gerar_viagens_bicicletas(n: int = 20000) -> tuple[list[dict], list[dict], dict[str, int]]`, que devolve `(sujas, limpas, contagens)`.
    - Usa o seu próprio `random.Random(SEMENTE + 200)`, para não mudar os dados da Mercearia.
    - **Colunas das sujas:** `viagem_id, inicio, fim, estacao_partida, estacao_chegada, duracao_min, tipo_cliente, valor_eur`, todas como texto, tal como ficam no CSV.
    - **Colunas das limpas:** as mesmas, já limpas (ver as regras abaixo).
  - Chaves de `contagens`, cada uma com o número de linhas afetadas:
    - `duplicadas` (linhas a mais);
    - `duracao_impossivel`;
    - `fim_antes_inicio`;
    - `data_formato_dd_mm` e `data_formato_h` (as linhas que não vêm em ISO);
    - `estacao_variante`;
    - `tipo_vazio`, `tipo_variante`;
    - `valor_vazio`, `valor_virgula`.
  - Os ficheiros: `dados/bicicletas_viagens_sujas.csv` e `dados/bicicletas_viagens_limpas.csv`.

**Regras do gerador** (fixam a resposta única da etapa 1):
- **Estações:** cerca de 12 estações de uma cidade fictícia, com nomes acentuados e começados por "Estação" (por exemplo "Estação Central" e "Estação Jardim Botânico").
- **Variantes plantadas de cada nome:**
  - minúsculas com espaços nas pontas;
  - MAIÚSCULAS;
  - sem acentos;
  - "Est." em vez de "Estação".
- **Datas:**
  - normal: `%Y-%m-%d %H:%M`;
  - variantes: `%d/%m/%Y %H:%M` e `%d-%m-%Y %Hh%M` (a hora pode ter 1 algarismo).
  - `inicio` e `fim` da mesma linha usam o mesmo formato.
- **`tipo_cliente`:**
  - valores canónicos: `Anual` e `Ocasional`;
  - variantes: minúsculas, MAIÚSCULAS e espaços nas pontas;
  - vazio: na versão limpa fica `Desconhecido`.
- **`valor_eur`:**
  - `Anual` paga 0;
  - `Ocasional` paga de 0,50 € a 6 €;
  - variantes: decimais com vírgula (`"1,50"`) e vazio (na versão limpa fica vazio, e não 0).
- **Problemas que tiram linhas:**
  - duplicados (mesmo `viagem_id`, linha igual);
  - `duracao_min` ≤ 0 ou > 1440;
  - `fim < inicio` (com `duracao_min` positiva).
- **Sobreposição:** cada problema que tira linhas cai em linhas diferentes e em linhas sem outros problemas, para as contagens não dependerem da ordem.
- **Duração nas linhas boas:** `duracao_min` é coerente com `fim - inicio`.

- [ ] **Step 1: Escrever os testes que falham** (`tests/test_bicicletas.py`)

```python
from src.gerar_dados import gerar_viagens_bicicletas

def test_e_deterministico():
    assert gerar_viagens_bicicletas()[2] == gerar_viagens_bicicletas()[2]

def test_tamanho_e_linhas_retiradas():
    sujas, limpas, c = gerar_viagens_bicicletas()
    assert 19000 <= len(sujas) <= 21000
    assert len(limpas) == len(sujas) - c["duplicadas"] - c["duracao_impossivel"] - c["fim_antes_inicio"]

def test_cada_problema_aparece():
    _, _, c = gerar_viagens_bicicletas()
    for chave in ["duplicadas", "duracao_impossivel", "fim_antes_inicio", "data_formato_dd_mm", "data_formato_h",
                  "estacao_variante", "tipo_vazio", "tipo_variante", "valor_vazio", "valor_virgula"]:
        assert c[chave] >= 30, chave

def test_versao_limpa_coerente():
    _, limpas, _ = gerar_viagens_bicicletas()
    ids = [l["viagem_id"] for l in limpas]
    assert len(ids) == len(set(ids))
    assert {l["tipo_cliente"] for l in limpas} == {"Anual", "Ocasional", "Desconhecido"}
    assert all(l["estacao_partida"].startswith("Estação ") for l in limpas)
    assert all(0 < float(l["duracao_min"]) <= 1440 for l in limpas)

def test_mercearia_nao_mudou():
    import csv
    with open("dados/vendas.csv", encoding="utf-8") as f:
        total = sum(int(r["quantidade"]) * float(r["preco"]) for r in csv.DictReader(f))
    assert round(total, 2) == 26902.89
```

- [ ] **Step 2: Correr e ver falhar.**
  - Run: `.venv/Scripts/python.exe -m pytest tests/test_bicicletas.py -q`
  - Expected: FAIL, `ImportError: cannot import name 'gerar_viagens_bicicletas'`.
- [ ] **Step 3: Implementar e escrever os ficheiros.**
  - Implementar `gerar_viagens_bicicletas` com as regras acima.
  - Em `main()`, escrever os dois CSV com `csv.DictWriter`, UTF-8, separador `,`, com aspas só quando é preciso (o `"1,50"`).
  - Correr `.venv/Scripts/python.exe src/gerar_dados.py`.
  - Acrescentar `'bicicletas_viagens_sujas.csv'` à lista de CSV do `web/scripts/sync-assets.mjs`. O ficheiro limpo **não** entra nessa lista.
- [ ] **Step 4: Correr e ver passar.**
  - Run: `.venv/Scripts/python.exe -m pytest -q`
  - Expected: todos verdes (42 que já existiam + 5 novos), incluindo `test_mercearia_nao_mudou`.
- [ ] **Step 5: Commit.** Ficheiros: `src/gerar_dados.py`, `tests/test_bicicletas.py`, os 2 CSV e `web/scripts/sync-assets.mjs`. Mensagem: "Gerador das viagens de bicicletas sujas e limpas".

---

### Task 2: Ficheiros extra no motor Python, carregados a pedido

**Files:**
- Modify: `web/src/engines/pythonEngine.ts`
- Modify: `web/src/data/types.ts` (`Lesson.ficheirosDados?: string[]`)
- Test: `web/tests/pythonLessons.test.ts`

**Interfaces:**
- Produces:
  - `runPythonCode(code: string, checks?: PythonCheckSpec[], onStatus?: (msg: string) => void, ficheirosExtra: string[] = []): Promise<PythonExecutionResult>`.
    - Antes de correr, cada nome de `ficheirosExtra` que ainda não foi carregado é descarregado de `/dados/${nome}` e escrito em `/home/pyodide/dados/` e `/home/dados/`, como já se faz para os CSV da Mercearia.
    - O módulo guarda um `Set<string>` dos ficheiros já carregados.
    - Se o pedido falhar: `error` = `Não foi possível carregar /dados/${nome} (HTTP ${status}).`
  - `Lesson.ficheirosDados?: string[]`: quem chama passa este valor como `ficheirosExtra`.

- [ ] **Step 1: Teste que falha** (em `pythonLessons.test.ts`, no mesmo `describe`). O stub de `fetch` que já existe passa a contar os pedidos a `/dados/bicicletas_viagens_sujas.csv`.

```ts
it('ficheiros extra carregam uma só vez e só quando pedidos', async () => {
  pedidosBicicletas = 0;
  await runPythonCode('x = 1', []);
  expect(pedidosBicicletas).toBe(0);
  const a = await runPythonCode('import pandas as pd\nn = len(pd.read_csv("dados/bicicletas_viagens_sujas.csv"))', [{ label: 'n', expr: 'n > 19000' }], undefined, ['bicicletas_viagens_sujas.csv']);
  const b = await runPythonCode('y = 2', [], undefined, ['bicicletas_viagens_sujas.csv']);
  expect(a.checks![0].passed).toBe(true);
  expect(b.error).toBeUndefined();
  expect(pedidosBicicletas).toBe(1);
}, 120_000);
```

- [ ] **Step 2: Correr e ver falhar.**
  - Run: `cd web && npx vitest run tests/pythonLessons.test.ts -t "ficheiros extra"`
  - Expected: FAIL, porque o ficheiro não existe no Pyodide (`FileNotFoundError` na verificação).
- [ ] **Step 3: Implementar.**
  - Implementar o parâmetro `ficheirosExtra` em `runPythonCode` e o campo `ficheirosDados` em `Lesson`.
  - Nos testes que correm soluções e códigos iniciais (linhas ~41, 63, 66, 100), passar `l.ficheirosDados` como 4.º argumento. Para isso, a lista de treinos passa a levar a etapa junto de cada treino.
  - Em `main.ts`, `executeWorkbench` passa `currentLesson().ficheirosDados ?? []`.
- [ ] **Step 4: Correr e ver passar.**
  - Run: `cd web && npx vitest run tests/pythonLessons.test.ts`
  - Expected: PASS em todos.
- [ ] **Step 5: Commit.** Mensagem: "Motor Python: ficheiros de dados extra carregados a pedido".

---

### Task 3: Trilha 8 com a etapa 1 (limpeza a sério)

**Files:**
- Create: `web/src/data/trackProjetoFinal.ts` (exporta `projetoFinalTrack: Track`), `web/src/data/practiceProjeto.ts` (exporta `projetoPractice: Record<string, PythonChallengeSpec[]>`)
- Modify: `web/src/data/curriculum.ts`, `web/src/data/moreQuiz.ts`, `web/tests/lessons.test.ts`

**Interfaces:**
- Consumes:
  - `Lesson.ficheirosDados` (Task 2);
  - `dados/bicicletas_viagens_limpas.csv` (Task 1), lido só pelos testes para conferir os números.
- Produces:
  - **A trilha:**
    - `projetoFinalTrack`: `id: 'projeto-final'`, `shortTitle: '8. Projeto final'`, `fullTitle: 'Projeto final: os teus dados, a tua pergunta, o teu portefólio'`, `engineLabel: 'Projeto no teu computador'`.
    - Ligada em `curriculum.ts` como a última trilha, com os treinos de `projetoPractice` acrescentados como nas outras trilhas.
  - **A etapa 1:**
    - `id: 'pf-01-limpeza-bicicletas'`, `code: '01'`, `engine: 'python'`, `ficheirosDados: ['bicicletas_viagens_sujas.csv']`.
    - **Desafio:** o aluno guarda o resultado em `limpo` (DataFrame) e em `removidas` (dict com as chaves `duplicadas`, `duracao_impossivel` e `fim_antes_inicio`).
  - **Regras do enunciado**, por esta ordem:
    1. tirar duplicados por `viagem_id` (fica a primeira);
    2. normalizar as estações: sem acentos, minúsculas, sem espaços nas pontas e `est. ` → `estacao `. Depois mapear para o nome canónico através de um dicionário que o código inicial já dá;
    3. converter `inicio` e `fim` com os três formatos explícitos, cada um com `errors="coerce"`, e juntá-los;
    4. `valor_eur`: vírgula → ponto, depois `float` (o vazio fica `NaN`);
    5. `tipo_cliente`: `strip().capitalize()`, e o vazio passa a `Desconhecido`;
    6. tirar `duracao_min` ≤ 0 ou > 1440;
    7. tirar `fim < inicio`;
    8. contar as linhas retiradas por cada motivo.

- [ ] **Step 1: Atualizar os testes para a trilha nova** (em `lessons.test.ts`)
  - Esperar 8 trilhas e 68 etapas.
  - Os ids passam a terminar em `..., 'carreira', 'projeto-final'`.
  - Teste novo: `pf-01` tem pelo menos 2 treinos e 3 perguntas de quiz.
- [ ] **Step 2: Correr e ver falhar.**
  - Run: `cd web && npx vitest run tests/lessons.test.ts`
  - Expected: FAIL (7 trilhas em vez de 8).
- [ ] **Step 3: Escrever a etapa, os 2 treinos e as 2 perguntas extra.**
  - A etapa e os treinos seguem a estrutura das etapas Pandas: lede, analogia, passo a passo, conceitos, referência, exemplo, desafio com `correr_com`, quiz com `correctIndex` variado e a opção certa sem ser a mais longa.
  - Treino 1: relatório de qualidade com quantas linhas tinham cada problema (os valores de `contagens`).
  - Treino 2: primeira análise dos dados limpos (por exemplo, a hora de ponta e a estação de partida mais usada).
  - Os números das verificações vêm de correr o gerador e são escritos como literais, como nas outras etapas. O ficheiro limpo nunca entra no código da app.
- [ ] **Step 4: Correr e ver passar.**
  - Run: `cd web && npx vitest run tests/lessons.test.ts tests/quizzes.test.ts tests/pythonLessons.test.ts`
  - Expected: PASS. A solução de `pf-01` e os treinos passam, os códigos iniciais não passam, e a verificação de `correr_com` recusa valores escritos à mão.
- [ ] **Step 5: Commit.** Mensagem: "Trilha 8: limpeza a sério com viagens de bicicletas".

---

### Task 4: Tipo de etapa "projeto" e as suas regras

**Files:**
- Modify: `web/src/data/types.ts`
- Create: `web/src/ui/projectPanel.ts`
- Test: `web/tests/projectPanel.test.ts`

**Interfaces:**
- Produces:
  - **Em `types.ts`:**
    - `EngineKind = 'python' | 'sql' | 'git' | 'projeto'`;
    - `interface ProjectSpec { entregaveis: string[]; lista: string[]; grelha: { criterio: string; bom: string; aMelhorar: string }[]; pedirLinkGithub?: boolean }`;
    - `Lesson.projectSpec?: ProjectSpec`.
  - **Em `projectPanel.ts`:**
    - `export const ESTADO_PROJETO = 'Feito por ti, não corrigido';`
    - `export function chaveLista(lessonId: string, n: number): string` → `${lessonId}#lista:${n}`;
    - `export function linkGithubValido(url: string): boolean`, que aceita só `^https://github\.com/[A-Za-z0-9-]+/[A-Za-z0-9._-]+/?$` depois de tirar os espaços das pontas;
    - `export function etapaProjetoCompleta(lesson: Lesson, feitos: Set<string>, link: string | undefined): boolean`;
    - `export function renderPainelProjeto(lesson: Lesson, feitos: Set<string>, link: string): string`.
  - **O que o painel desenha:**
    - o aviso "Esta etapa faz-se no teu computador. A app não vê os teus ficheiros: as marcas são um compromisso teu.";
    - os entregáveis;
    - uma caixa por item da lista (`<input type="checkbox" data-lista-item="${n}">`, `checked` quando a chave está em `feitos`);
    - a grelha como tabela só de leitura;
    - se `pedirLinkGithub`, um `<input type="url" data-link-github>` com o valor e uma mensagem "Link válido" ou "O link deve ser https://github.com/utilizador/repositório";
    - todo o texto escapado com `escapeHtml`.

- [ ] **Step 1: Testes que falham**

```ts
const etapa = { id: 'pf-05-publicar', engine: 'projeto', projectSpec: { entregaveis: ['README'], lista: ['a', 'b'], grelha: [{ criterio: 'c', bom: 'b', aMelhorar: 'm' }], pedirLinkGithub: true } } as unknown as Lesson;

it.each([
  ['https://github.com/ana/projeto', true], ['https://github.com/ana/projeto/', true], ['  https://github.com/ana/meu.projeto_1  ', true],
  ['http://github.com/ana/projeto', false], ['https://github.com/ana', false], ['https://www.github.com/ana/p', false],
  ['https://gitlab.com/ana/p', false], ['github.com/ana/p', false], ['', false],
])('linkGithubValido(%j) → %s', (url, ok) => expect(linkGithubValido(url)).toBe(ok));

it('a etapa só fica completa com a lista toda marcada e, se pedido, um link válido', () => {
  const feitos = new Set([chaveLista(etapa.id, 0)]);
  expect(etapaProjetoCompleta(etapa, feitos, 'https://github.com/ana/p')).toBe(false);
  feitos.add(chaveLista(etapa.id, 1));
  expect(etapaProjetoCompleta(etapa, feitos, 'https://gitlab.com/ana/p')).toBe(false);
  expect(etapaProjetoCompleta(etapa, feitos, 'https://github.com/ana/p')).toBe(true);
});

it('as chaves cabem nos 80 caracteres da sincronização', () => {
  expect(chaveLista('pf-04-analisar-recomendar', 12).length).toBeLessThanOrEqual(80);
});

it('o painel marca os itens feitos, mostra a grelha e escapa o texto', () => {
  const html = renderPainelProjeto({ ...etapa, projectSpec: { ...etapa.projectSpec!, lista: ['<b>x</b>', 'y'] } } as Lesson, new Set([chaveLista(etapa.id, 1)]), '');
  expect(html.match(/data-lista-item="\d+"/g)).toHaveLength(2);
  expect(html).toMatch(/data-lista-item="1"[^>]*checked/);
  expect(html).not.toMatch(/data-lista-item="0"[^>]*checked/);
  expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
  expect(html).toContain('data-link-github');
  expect(html).toContain('as marcas são um compromisso teu');
});
```

- [ ] **Step 2: Correr e ver falhar.**
  - Run: `cd web && npx vitest run tests/projectPanel.test.ts`
  - Expected: FAIL, "Cannot find module".
- [ ] **Step 3: Implementar** os tipos e o módulo. Correr `npx tsc --noEmit -p .`: os sítios que fazem `switch` ou usam mapas por `EngineKind` (por exemplo `highlightCode` e o rótulo da linguagem) passam a tratar `'projeto'` como texto simples.
- [ ] **Step 4: Correr e ver passar.**
  - Run: `cd web && npx tsc --noEmit -p . && npx vitest run tests/projectPanel.test.ts`
  - Expected: PASS.
- [ ] **Step 5: Commit.** Mensagem: "Tipo de etapa projeto: lista, grelha e link do GitHub".

---

### Task 5: Painel na app e "Feito por ti, não corrigido" em todo o lado

**Files:**
- Modify: `web/src/main.ts`:
  - bancada em `renderAcademyWorkspace`;
  - índice lateral (~linhas 640–660, `statusClass` e `lesson-step-id`);
  - chip do topo (~linhas 690–700);
  - `executeWorkbench`;
  - listeners.
- Modify: `web/src/ui/modals.ts` (`renderProgressModal`), `web/src/data/progress.ts` (`generatePortfolioMarkdown`), `web/src/styles/app.css`
- Test: `web/tests/progress.test.ts`

**Interfaces:**
- Consumes: tudo da Task 4, `markLessonCompleted(lesson)` e `draftKey(lesson, 'challenge')`, que já existem.
- Produces (portefólio):
  - `generatePortfolioMarkdown` deixa as etapas com `engine === 'projeto'` de fora da secção 1 (contagens) e da secção 2 (código).
  - Acrescenta a secção `## 3. Projeto final (autoavaliado)`, só quando há alguma concluída.
  - Essa secção tem uma linha por etapa concluída (`- Etapa ${code} · ${title}`) e, se existir um link válido em `drafts[`${id}:challenge`]` de uma etapa com `pedirLinkGithub`, a linha `**Repositório:** ${link}`.
  - A nota da secção diz "Etapas marcadas pelo aluno; a app não corrigiu este trabalho."

- [ ] **Step 1: Testes que falham** (`progress.test.ts`), com um `tracks` mínimo: uma etapa Python e duas de projeto, a segunda com `pedirLinkGithub`.

```ts
it('o portefólio não conta as etapas de projeto como validadas nem lhes põe código', () => {
  const md = generatePortfolioMarkdown(progressoComAsTres, { 'pf-05-publicar:challenge': 'https://github.com/ana/p' }, tracksMinimas);
  expect(md).toContain('1 desafios resolvidos');
  expect(md).toContain('## 3. Projeto final (autoavaliado)');
  expect(md).toContain('**Repositório:** https://github.com/ana/p');
  const seccao2 = md.split('## 2.')[1].split('## 3.')[0];
  expect(seccao2).not.toContain('pf-0');
  expect(seccao2).not.toContain('Publicar');
});

it('as marcas da lista sobrevivem ao JSON e ao código MB1', () => {
  // usa as funções de exportação e importação que já existem, com practice = ['pf-02-pergunta-dados#lista:0']
  // e espera a mesma chave depois de importar, em cada formato
});
```

O segundo teste segue o padrão dos testes de `practice` que já existem em `progress.test.ts`, com a chave `'pf-02-pergunta-dados#lista:0'`.

- [ ] **Step 2: Correr e ver falhar.**
  - Run: `cd web && npx vitest run tests/progress.test.ts`
  - Expected: FAIL no teste do portefólio (o teste MB1/JSON pode já passar, porque confirma uma propriedade que já existe; nesse caso fica como teste de regressão e anota-se no relatório).
- [ ] **Step 3: Implementar.**
  - **Bancada.** Quando `lesson.engine === 'projeto'`, a bancada toda (seletor de modos, enunciado, editor, botões, resultado) é substituída por `renderPainelProjeto(lesson, state.practiceDone, state.editorDrafts[draftKey(lesson, 'challenge')] ?? '')`. Nessas etapas não aparece o ecrã de escrita do telemóvel, e `executeWorkbench` não faz nada.
  - **Marcar e desmarcar.** Mudar uma caixa `[data-lista-item]` acrescenta ou tira a chave em `state.practiceDone`, chama `savePracticeDone()` e `scheduleCloudSync()`, e depois `markLessonCompleted(lesson)` se `etapaProjetoCompleta(...)`. Desmarcar **não** apaga a conclusão.
  - **Link.** Escrever no `[data-link-github]` grava o rascunho e reavalia a conclusão. O render não pode roubar o foco a meio da escrita: atualiza só a mensagem de validação sem redesenhar o campo, ou repõe o foco e o cursor.
  - **Exemplo.** O `exampleCode` da etapa aparece na coluna da lição, sem o botão "Experimentar no editor".
  - **Índice lateral.** Uma etapa de projeto concluída leva a classe `is-projeto`, mostra "✓" em vez de "OK" e tem `title`/`aria-label` com `ESTADO_PROJETO`.
  - **Topo da lição.** O chip passa a `<span class="status-chip is-projeto">Feito por ti, não corrigido</span>`.
  - **Janela de progresso.** "Resolvidas s/ ajuda" deixa de contar as etapas de projeto, e aparece um cartão novo "Projeto final (autoavaliado)" com `n / 4`.
  - **Portefólio.** Como descrito nas Interfaces.
  - **CSS.** `is-projeto` usa uma cor distinta do verde `is-ok`/`is-done` e do âmbar `is-helped`, tirada dos tokens existentes (por exemplo `--color-ink-2` com contorno).
- [ ] **Step 4: Correr e ver passar.**
  - Run: `cd web && npx tsc --noEmit -p . && npx vitest run && npm run build`
  - Expected: tudo verde e build concluído.
- [ ] **Step 5: Verificar no browser** (`npm run preview`, servidor `web-preview` na porta 4173). Para isto, uma etapa de projeto temporária pode vir da Task 6. Se a Task 6 ainda não existir, esta verificação faz-se no fim da Task 6.
  1. Etapa de projeto: aparece o painel e não aparece o editor; marcar a lista toda faz aparecer "Feito por ti, não corrigido" no chip e no índice.
  2. Janela de progresso: o cartão "Projeto final (autoavaliado)" conta 1 e "Resolvidas s/ ajuda" não mudou.
  3. Desmarcar um item depois de concluída: continua concluída. (Review Focus 1)
  4. Etapa 5: um link inválido não conclui e mostra a mensagem; um válido conclui. Escrever no campo não perde o foco.
  5. Ecrã de telemóvel (preset `mobile`): sem ecrã de escrita, `document.documentElement.scrollWidth <= innerWidth`. (Review Focus 5)
  6. Exportar o portefólio: a secção 3 tem o link e a secção 2 não tem as etapas de projeto.
  7. A consola não tem erros.
- [ ] **Step 6: Commit.** Mensagem: "Etapas de projeto: painel e estado Feito por ti, não corrigido".

---

### Task 6: Conteúdo das etapas 2 a 5 e README

**Files:**
- Modify: `web/src/data/trackProjetoFinal.ts`, `web/tests/lessons.test.ts`, `README.md`

**Interfaces:**
- Consumes: `ProjectSpec` (Task 4).
- Produces: as etapas `pf-02-pergunta-dados`, `pf-03-explorar-limpar`, `pf-04-analisar-recomendar` e `pf-05-publicar` (códigos `02` a `05`, `engine: 'projeto'`). Só a `pf-05` tem `pedirLinkGithub: true`.

- [ ] **Step 1: Atualizar os testes** (`lessons.test.ts`):
  - 72 etapas;
  - a lista de etapas sem treino passa a `['py-00-pensamento', 'py-11-revisao', 'py-10-caixa-csv', 'pf-02-pergunta-dados', 'pf-03-explorar-limpar', 'pf-04-analisar-recomendar', 'pf-05-publicar']`;
  - o teste "quiz válido e desafio do motor certo" passa a exigir, quando `engine === 'projeto'`:
    - `projectSpec` com pelo menos 2 entregáveis;
    - de 4 a 8 itens na lista;
    - de 4 a 6 critérios na grelha;
    - nenhum desafio Python, SQL ou Git.
- [ ] **Step 2: Correr e ver falhar.**
  - Run: `cd web && npx vitest run tests/lessons.test.ts`
  - Expected: FAIL (68 em vez de 72).
- [ ] **Step 3: Escrever as 4 etapas** com o conteúdo da secção "Conteúdo das etapas 2 a 5" do desenho.
  - **Fontes de dados da `pf-02`:** procurar na web e confirmar abrindo cada link. Ficam só fontes portuguesas de dados abertos com ficheiros CSV ou Excel (por exemplo dados.gov.pt, INE e PORDATA), com uma linha sobre o que cada uma tem e a nota de que se deve confirmar a licença de cada conjunto.
  - **Exemplos:** o `exampleCode` de cada etapa é código para correr no computador (por exemplo a estrutura de pastas e o `.gitignore` na `pf-02`, ou o primeiro bloco do caderno na `pf-03`).
  - **README:** a trilha 8 na lista de trilhas e 72 etapas nos sítios onde aparece 67.
- [ ] **Step 4: Correr e ver passar.**
  - Run: `cd web && npx vitest run && npm run build`, e depois `cd .. && .venv/Scripts/python.exe -m pytest -q`
  - Expected: tudo verde.
- [ ] **Step 5: Verificação no browser** da Task 5 (os 7 pontos), se ainda não foi feita, sobre as etapas verdadeiras.
- [ ] **Step 6: Commit.** Mensagem: "Trilha 8: etapas do projeto próprio e README".
