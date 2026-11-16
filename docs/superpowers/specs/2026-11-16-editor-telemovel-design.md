# Ecrã de escrita para telemóvel

## Porquê

No telemóvel, ao tocar no editor o teclado abre e a página inteira muda de tamanho. A barra do topo fixa come espaço, o enunciado (por cima) e o resultado (por baixo) ficam fora do ecrã, e o browser faz scroll sozinho. Ao tocar fora, o teclado fecha e a página volta a saltar. Quem aprende pelo telemóvel perde o fio entre o que tem de fazer, o que escreve e o que o código devolve.

## Objetivo

- Enquanto escreve, o aluno vê o código com o teclado aberto e chega ao enunciado e ao resultado com um toque.
- A página da lição deixa de saltar quando o teclado abre e fecha.

**Não-objetivos**
- Mudar a forma de corrigir ou os desafios: continua a escrever código, como no computador.
- Mudar o computador ou o tablet em modo horizontal: o editor atual fica como está.

**Seria um fracasso se**
- o código escrito no ecrã de escrita e na bancada normal deixasse de ser o mesmo rascunho;
- o aluno perdesse o sítio onde estava na lição ao fechar o ecrã;
- o ecrã abrisse por engano num computador com rato.

## Abordagens consideradas

| | O que é | Porque não |
|---|---|---|
| **A. Ecrã próprio para escrever (escolhida)** | Ao tocar no editor abre um ecrã inteiro por cima da lição, com separadores Enunciado, Código e Resultado e uma barra colada ao teclado | É a única em que a lição deixa de saltar |
| B. Reorganizar a página com o teclado aberto | Esconder a barra do topo e reduzir o enunciado a uma linha | A página continua a mexer e depende muito de cada browser (sobretudo o Safari do iPhone) |
| C. Correções pequenas | Barra do topo não fixa, botão Executar mais perto | Não resolve ver o enunciado e o resultado enquanto se escreve |

O utilizador escolheu a A.

## Quem recebe o ecrã de escrita (decisão minha)

Não se adivinha o aparelho pelo nome do browser (o "user agent"), porque é pouco fiável e cada vez mais escondido. Pergunta-se ao browser o que o ecrã consegue fazer:

- **toque como forma principal de apontar:** `matchMedia('(pointer: coarse)')`, a mesma regra que a app já usa para aumentar os botões; e
- **ecrã estreito:** `matchMedia('(max-width: 48rem)')`, o mesmo limite onde a app já passa ao layout de telemóvel.

As duas têm de ser verdade. Assim:
- um computador com rato, mesmo com a janela estreita, fica como está;
- um tablet em horizontal (largo) fica como está; em vertical estreito recebe o ecrã de escrita;
- se o aparelho rodar ou a janela mudar de tamanho, a decisão volta a ser feita (listener `change` nas duas regras).

Se o aluno preferir o editor normal, há uma forma de o voltar a usar (ver "Por decidir").

## Como funciona

**Abrir.** No telemóvel o editor da bancada passa a ser só uma pré-visualização do código, de leitura. Tem um botão "Escrever código" e não é uma caixa de texto, por isso tocar-lhe não abre o teclado. Tocar abre o ecrã de escrita no separador Código, com o cursor no fim e o teclado aberto.

**O ecrã de escrita** ocupa o ecrã inteiro, por cima da lição:

```
┌ Enunciado · Código · Resultado    ✕ ┐  ← cabeçalho fixo
│ (conteúdo do separador ativo)       │
│                                     │
├ : ( ) [ ] " =  ⇥    ▶ Executar      ┤  ← colada ao teclado
│ [ teclado ]                         │
```

- **Enunciado:** a descrição do desafio ou do treino ativo e, se já foram pedidas, as pistas.
- **Código:** o mesmo editor, com as mesmas cores e números de linha, a ocupar o espaço que o teclado deixa livre.
- **Resultado:** a saída da última execução e as verificações (certo/errado), tal como na bancada.
- **Barra de baixo:** os símbolos rápidos de cada motor (os que já existem) e o botão Executar. Fica colada ao teclado, porque a altura do ecrã de escrita acompanha a área visível (`window.visualViewport`).

**Executar.** Fecha o teclado, corre o código e muda para o separador Resultado. Tocar em Código volta ao editor com o teclado.

**Fechar (✕ ou o botão Voltar do telemóvel).** Fecha o ecrã de escrita e a lição volta ao ponto exato onde estava. A lição não mexe enquanto o ecrã está aberto: o scroll da página fica bloqueado por baixo e a posição é reposta ao fechar.

**Um só rascunho.** O ecrã de escrita lê e grava o mesmo rascunho da bancada (`state.editorDrafts` com a mesma chave). O que se escreve num aparece no outro, e conta para o progresso e para a sincronização como hoje.

**Estado na app.** Um novo `state.mobileEditor: null | 'enunciado' | 'codigo' | 'resultado'`. O `renderApp()` desenha o ecrã quando não é `null`. Como a app volta a desenhar tudo a cada mudança, o foco e a posição do cursor têm de ser repostos depois de cada render, como o editor já faz.

**Botão Voltar.** Ao abrir o ecrã, acrescenta-se uma entrada ao histórico do browser. O Voltar fecha o ecrã em vez de sair da etapa.

## O que fica igual

Correção, treinos, pistas, progresso, sincronização, o editor no computador e as abas Lição/Bancada do telemóvel.

## Verificação

- Testes: a regra de deteção (as 4 combinações de toque e largura) e o rascunho partilhado entre a bancada e o ecrã de escrita.
- No browser, com o ecrã de telemóvel: abrir, escrever, executar, ver o resultado, fechar e confirmar que a lição está no mesmo sítio. Confirmar também que em desktop nada muda.
- Limitação: o teclado verdadeiro não aparece na emulação do browser. O comportamento com teclado (barra colada, nada a saltar) só se confirma num telemóvel real, em Android (Chrome) e iPhone (Safari).

## Por decidir pelo construtor

- O aspeto exato (cores, ícones, animação ao abrir), seguindo o estilo atual.
- Onde fica a opção para voltar ao editor normal no telemóvel. A minha proposta: uma ligação discreta "Usar o editor normal" no ecrã de escrita, guardada no aparelho.
- Os botões Formatar, Repor e Ver solução: na barra de baixo ou num menu "⋯" no cabeçalho.
