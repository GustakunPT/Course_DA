# Projeto final próprio — desenho

## Porquê

A avaliação do curso concluiu que quem completa as 67 etapas tem boas bases técnicas, mas ainda não está pronto para trabalhar como analista de dados (DA). Faltam-lhe três coisas:

1. **Transferência.** Todas as etapas usam os mesmos dados (a Mercearia), gerados e limpos, com respostas conhecidas. No trabalho os dados são de outro negócio, chegam sujos e o pedido vem sem enunciado. Hoje a "oficina de limpeza" tem 12 linhas.
2. **Portefólio próprio.** O projeto final atual (Profissional 10) e o README (Profissional 11) são iguais para todos os alunos, com os mesmos números. Um recrutador não distingue ninguém.
3. **Autonomia.** O aluno nunca decide sozinho a pergunta, os dados e o que conta como "bem feito".

O objetivo do curso é o aluno completar todas as etapas e conseguir trabalhar como DA. Este projeto final é a ponte entre as duas coisas.

## Objetivos

- Uma trilha nova, **"8. Projeto final"**, depois do Nível Profissional, que conta para o progresso como as outras.
- Uma etapa de **limpeza a sério**, corrigida na app, sobre um ficheiro grande e sujo de outro negócio.
- Quatro etapas em que o aluno faz **o seu próprio projeto** com dados públicos reais, no computador (Jupyter ou VS Code), e o publica no GitHub. A app serve de guia: diz o que entregar, dá uma lista para marcar e uma grelha de autoavaliação.

## Não-objetivos

- A app não corrige o projeto do aluno: não conhece os dados nem as respostas, e isso é dito com clareza.
- A app não descarrega dados da internet nem carrega ficheiros do aluno (a política de segurança do site, `connect-src 'self' https://cdn.jsdelivr.net`, impede-o, e não é para mudar).
- As etapas 2 a 5 não se fazem no telemóvel: precisam de um computador com Python e Git. A app mostra-as no telemóvel, para ler.
- Não substitui as etapas 10 e 11 do Nível Profissional: essas continuam a ser o exemplo guiado; o projeto final é a versão sem guia.

## Seria um fracasso se

- as etapas 2 a 5 parecessem "corrigidas" em qualquer sítio da app ou do portefólio (um visto verde que o aluno ou um recrutador interpreta como validação de qualidade);
- o aluno pudesse marcar tudo sem ter feito nada e a app o felicitasse como se tivesse um projeto (as marcas são compromissos dele, e o texto deve dizê-lo);
- o ficheiro de limpeza fosse outra vez "dados de mercearia": tem de ser outro negócio;
- a mudança obrigasse a mexer na API de sincronização ou estragasse o progresso já guardado.

## Abordagens consideradas

**Onde se faz o projeto**

| | O que é | Decisão |
|---|---|---|
| **A. No computador, publicado no GitHub, com a app como guia** | Jupyter/VS Code + Git, como no trabalho | **Escolhida pelo utilizador:** o portefólio fica onde o recrutador o vê, feito com ferramentas reais |
| B. Dentro da app, com o CSV do aluno | O aluno carrega um ficheiro e trabalha no editor do browser | O editor não é um ambiente de trabalho, ficheiros grandes ficam lentos e o resultado não é um repositório |

**De onde vem o ficheiro sujo da etapa 1**

| | O que é | Decisão |
|---|---|---|
| Dados reais com sujidade acrescentada | Conjunto real + problemas controlados | Exige licença para incluir no repositório |
| **Dados gerados por nós** | Gerador com semente fixa, outro negócio | **Escolhida pelo utilizador:** controlo total dos problemas e das respostas, sem licenças |
| Dados reais tal como vêm | Sem alterações | A sujidade real raramente cobre o que importa treinar |

**Como a app mostra as etapas sem código**

| | O que é | Decisão |
|---|---|---|
| **Tipo novo de etapa "projeto"** | No lugar do editor: entregáveis, lista para marcar e grelha de autoavaliação | **Escolhida pelo utilizador:** deixa claro que o trabalho é fora da app |
| Editor Python como formulário | Respostas em variáveis, verificações de formato | Finge uma correção que não existe |

## Como funciona

### Etapa 1 — Limpeza a sério (motor Python, corrigida)

**Dados (decisão minha):** viagens de uma rede de bicicletas partilhadas numa cidade portuguesa fictícia, em 2025, com cerca de **20 000 linhas**. O ficheiro chama-se `dados/bicicletas_viagens_sujas.csv` e é gerado por uma função nova em `src/gerar_dados.py`, com a semente fixa (`SEMENTE`) e só com a biblioteca padrão, como o resto do gerador. O gerador também escreve a versão limpa de referência, `dados/bicicletas_viagens_limpas.csv`, que serve só aos testes (pytest e vitest) e **não** é copiada para `web/public/dados/` nem escrita no sistema de ficheiros do Pyodide, para o aluno não poder ler a resposta; os números esperados vão diretamente para as verificações (decisão minha). O ficheiro sujo (cerca de 1,8 MB) passa para `web/public/dados/` pelo `npm run sync`, mas só é descarregado e escrito no Pyodide quando o aluno está numa etapa da trilha 8 (hoje `loadMerceariaDataset` e o motor Python carregam sempre a lista fixa de ficheiros; decisão minha, para não atrasar as outras trilhas).

Colunas: `viagem_id, inicio, fim, estacao_partida, estacao_chegada, duracao_min, tipo_cliente, valor_eur`.

Problemas plantados, cada um em quantidade conhecida, para a correção poder contar:

| Problema | Exemplo |
|---|---|
| Datas em formatos mistos | `2025-03-14 08:05`, `14/03/2025 08:05`, `14-03-2025 8h05` |
| Nomes de estações escritos de várias maneiras | `Estação Central`, ` estacao central `, `EST. CENTRAL` |
| Viagens repetidas | a mesma linha (com o mesmo `viagem_id`) duas ou três vezes |
| Durações impossíveis | negativas, zero ou mais de 24 horas |
| Fim antes do início | `fim < inicio` |
| Valores em falta | `tipo_cliente` vazio, `valor_eur` vazio |
| Números com vírgula | `valor_eur` = `"1,50"` |
| Categorias inconsistentes | `Anual`, `anual`, `ANUAL`, `Ocasional`, `ocasional ` |

**Desafio:** o aluno escreve em pandas um passo de limpeza que produz um `DataFrame` limpo, com as regras escritas no enunciado (por exemplo: tirar duplicados por `viagem_id`, uniformizar estações e categorias, converter datas, descartar viagens impossíveis e contar quantas saíram por cada motivo). As verificações comparam os números com o ficheiro limpo de referência e incluem pelo menos uma verificação `correr_com(...)` com dados pequenos, para que valores escritos à mão não passem (como nas outras etapas).

**Treinos:** dois, à semelhança da trilha Pandas. Por exemplo: um relatório de qualidade (quantas linhas tinham cada problema) e uma primeira análise dos dados já limpos (horas de ponta, estações mais usadas).

Quiz: 3 perguntas, como nas trilhas SQL e Pandas.

### Etapas 2 a 5 — O projeto do aluno (tipo novo "projeto")

**Tipo de etapa.** `EngineKind` passa a incluir `'projeto'`. Uma etapa de projeto não tem `pythonChallenge`, `sqlChallenge` nem `gitChallenge`. Tem um campo novo:

```ts
projectSpec: {
  entregaveis: string[];          // o que o aluno deve ter feito no fim da etapa
  lista: string[];                // itens a marcar; cada um é um compromisso do aluno
  grelha: { criterio: string; bom: string; aMelhorar: string }[]; // autoavaliação
  pedirLinkGithub?: boolean;      // só na etapa 5
}
```

O resto da etapa (lede, analogia, passo a passo, conceitos, referência, exemplo, quiz) é igual às outras. O exemplo pode ser código para correr no computador do aluno. Como estas etapas não têm o separador "Experimenta", o exemplo aparece na coluna da lição, sem botão "Experimentar no editor" (decisão minha).

**Bancada.** No lugar do editor, a bancada de uma etapa de projeto mostra:

1. um aviso curto: "Esta etapa faz-se no teu computador. A app não vê os teus ficheiros: as marcas são um compromisso teu.";
2. os entregáveis;
3. a lista, com caixas para marcar;
4. a grelha de autoavaliação (só leitura: critério, como é "bom", como é "a melhorar");
5. na etapa 5, um campo para o link do repositório.

**Quando conta como feita.** Quando todos os itens da lista estão marcados (e, na etapa 5, há um link válido), a app chama `markLessonCompleted(lesson)`. O estado fica "autónomo" (não há pistas nem solução nestas etapas). Desmarcar um item depois não desfaz a conclusão, tal como resolver um desafio e depois apagar o código.

**Como aparece uma etapa de projeto concluída (decisão do utilizador: em todo o lado).** Uma etapa de projeto concluída nunca aparece como "corrigida". O estado guardado continua a ser `autonomous` (o progresso e a sincronização não mudam); o que muda é a apresentação, decidida pelo `engine === 'projeto'` da etapa:

| Onde | Hoje (etapa corrigida) | Etapa de projeto concluída |
|---|---|---|
| Índice lateral (`main.ts`, classe `is-done`) | "OK" verde | marca própria, de outra cor, com o texto acessível "Feito por ti, não corrigido" |
| Topo da lição (chip `is-ok`) | "Concluída" verde | chip "Feito por ti, não corrigido", de outra cor |
| Janela de progresso (`ui/modals.ts`) | conta em "Resolvidas s/ ajuda" | conta numa linha própria, "Projeto final (autoavaliado)", fora dos totais de resolvidas sem ajuda e com ajuda |
| Portefólio exportado (`generatePortfolioMarkdown`, `progress.ts`) | conta em "Competências Práticas Validadas" e "N desafios resolvidos", com "Resolvido com sucesso" e um bloco de código do rascunho ou do `exampleCode` | secção própria, "Projeto final (autoavaliado)", fora das contagens de validados; sem bloco de código; mostra o link do repositório quando existe |

**Onde se guardam as marcas (decisão minha).** As marcas vão para o conjunto que já guarda os treinos resolvidos (`state.practiceDone`), com chaves `${lessonId}#lista:${n}`. Esse conjunto já é guardado no aparelho, sincronizado com a nuvem (`api/sync.ts` aceita até 500 textos com 80 caracteres no máximo), incluído no JSON de cópia de segurança e no código MB1, e limpo por `clearAllUserProgress`. Por isso não é preciso mudar a sincronização. O builder confirma que os ids das etapas de projeto mais o sufixo cabem nos 80 caracteres e que o limite de 500 continua folgado.

**O link do GitHub (decisão minha).** Guarda-se como rascunho da etapa (`state.editorDrafts[draftKey(lesson, 'challenge')]`), que também já é sincronizado. É válido quando corresponde a `https://github.com/<utilizador>/<repositório>` (com ou sem barra final). Não se faz nenhum pedido ao GitHub, porque a política de segurança não o permite. O link aparece no portefólio exportado (`progress.ts`, a função do portefólio em Markdown) quando existe.

**Treinos e verificação "todas as etapas têm treino".** As etapas de projeto não têm treinos. O teste que exige pelo menos um treino em cada etapa passa a excluí-las, tal como já exclui a introdução e o projeto da trilha Python.

### Conteúdo das etapas 2 a 5

As quatro etapas seguem o percurso das etapas 10 e 11 do Nível Profissional, agora sem guia:

2. **Escolher a pergunta e os dados.** Como passar de um tema a uma pergunta com decisão ("onde…", "quando…", "quanto…"), como verificar se os dados respondem e se a licença permite usá-los, e como criar o repositório com a estrutura do curso (`dados/`, `cadernos/`, `README.md`, `.gitignore`). Inclui uma **lista curta de fontes públicas portuguesas** (por exemplo, dados.gov.pt, INE e PORDATA), com o tipo de dados de cada uma. Os links e as descrições têm de ser confirmados pelo builder no momento de escrever, e escolhem-se só fontes com dados abertos e ficheiros CSV ou Excel. Uma entrega: o ficheiro de dados e a pergunta escrita no README.
3. **Explorar e limpar os teus dados.** Repete o método da etapa 1 nos dados do aluno, num caderno Jupyter: forma, tipos, valores em falta, duplicados e regras de limpeza escritas e justificadas.
4. **Analisar e recomendar.** Um número que responde à pergunta, um gráfico honesto (eixo no zero quando são quantidades, título com a conclusão) e uma recomendação numa frase com decisão, como na etapa 10 do Nível Profissional. Inclui um aviso sobre conclusões que os dados não permitem (correlação não é causa, amostra pequena).
5. **Publicar.** README com pergunta, dados (fonte e licença), conclusões com números em formato português e como correr o projeto (o modelo da etapa 11 do Nível Profissional), commits com mensagens claras e link do repositório. A grelha desta etapa é a que um recrutador usaria em 2 minutos.

Cada etapa tem quiz (pelo menos 1 pergunta, como as do Nível Profissional) e grelha com 4 a 6 critérios.

## O que muda na app

- `web/src/data/types.ts`: `EngineKind` com `'projeto'`; `Lesson.projectSpec?`.
- Uma trilha nova, `projetoFinalTrack`, com id `'projeto-final'` e o título "8. Projeto final", ligada em `curriculum.ts` depois da carreira; códigos 01 a 05.
- `web/src/main.ts`: a bancada desenha o painel de projeto quando `lesson.engine === 'projeto'`; o seletor de modos (Desafio guiado / Experimenta / Consola SQL) e os botões Executar, Pistas e Solução não aparecem; o ecrã de escrita do telemóvel não se aplica.
- `web/src/data/progress.ts`: o portefólio exportado põe as etapas de projeto numa secção própria, fora das contagens de validados, sem código e com o link do GitHub quando existe.
- `web/src/main.ts` e `web/src/ui/modals.ts`: o índice lateral, o chip do topo da lição e a janela de progresso mostram as etapas de projeto concluídas como "Feito por ti, não corrigido" (ver a tabela acima).
- `src/gerar_dados.py`, `dados/`, `tests/` (pytest): o gerador do ficheiro de bicicletas e testes que confirmam as quantidades de cada problema e que a versão limpa é coerente.
- `web/tests/`: a solução da etapa 1 passa e o código inicial não; o portefólio exportado não conta as etapas de projeto como validadas nem lhes põe código; as etapas de projeto têm entregáveis, lista e grelha; marcar a lista toda conclui a etapa; a validação do link; as marcas sobrevivem ao código MB1 e ao JSON de cópia de segurança.
- `README.md`: a trilha 8 e o total de etapas (72).
- O teste que conta as etapas passa de 67 para 72, e o da lista de trilhas inclui `'projeto-final'`.

## Restrições

- Português europeu, tratando o aluno por "tu", sem anglicismos desnecessários (como no resto do curso).
- Sem dependências novas na app nem no gerador.
- A política de segurança do site não muda.
- O progresso já guardado pelos alunos continua válido (nenhuma chave existente muda de significado).

## Fica para o builder

- O texto completo das etapas, dos quizzes e das grelhas, dentro do que está acima.
- A cidade, as estações e as proporções exatas de cada problema no ficheiro de bicicletas. As quantidades finais ficam fixas pela semente e escritas nas verificações.
- As regras exatas de limpeza do enunciado da etapa 1, desde que deem um resultado único que os testes confirmam.
- A lista de fontes públicas da etapa 2, com links confirmados.
- O aspeto do painel de projeto, seguindo o estilo atual da bancada.
