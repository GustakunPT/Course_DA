import type { Track } from './types';

export const pythonTrack: Track = {
  id: 'python',
  shortTitle: '1. Python',
  fullTitle: 'Python do Zero Absoluto à Caixa Registadora',
  summary:
    'Pensamento computacional desde a primeira linha de código até à leitura e validação real das 5 078 vendas da Mercearia.',
  engineLabel: 'Python 3.14 (Pyodide)',
  lessons: [
    {
      id: 'py-00-pensamento',
      code: '01',
      title: 'Ponto zero: como o computador pensa e o que faz um analista',
      lede: 'Nunca programaste na vida? Começa aqui. Programar não é saber matemática difícil: é dar instruções claras, uma por linha, a um ajudante muito rápido mas literal.',
      analogyTitle: 'Ensinar um estagiário no primeiro dia na Mercearia',
      analogyBody:
        'Se disseres a uma pessoa "faz as contas do dia", ela percebe. Mas um computador precisa da receita exata: 1) abre o caderno de vendas, 2) multiplica a quantidade pelo preço de cada linha, 3) soma tudo, 4) mostra o total no ecrã. Essa sequência de passos chama-se algoritmo.',
      concepts: [
        'Entrada (Input) -> Processamento (Regras e Contas) -> Saída (Resultado ou Gráfico): todo o trabalho de dados segue estas 3 etapas.',
        'Os 4 pilares do percurso por ordem certa: 1) Negócio, KPIs e Excel; 2) Extração com SQL (a mais cobrada em entrevistas); 3) Estatística aplicada e Python/Pandas; 4) Visualização (Power BI/DAX) e 3–4 projetos completos no GitHub.',
        'Os 3 riscos a evitar desde o primeiro dia: 1) Tutorial Hell (ver horas de aulas sem resolver problemas reais); 2) Foco prematuro em Machine Learning antes de dominar SQL e análise exploratória; 3) Ignorar o contexto de negócio ("e daí? que decisão tomar?").',
        'Errar faz parte do trabalho diário: até um analista sénior vê mensagens de erro todos os dias — a diferença é que lê a última linha do erro com calma para corrigir.',
      ],
      beginnerSteps: [
        'Olha para o editor à direita: cada linha numerada (1, 2, 3…) é executada de cima para baixo, pela ordem em que está escrita.',
        'Texto humano fica sempre dentro de aspas ("Pão"). Números para fazer contas ficam sem aspas (10 ou 0.25).',
        'Clica no botão âmbar "Executar e verificar" (ou prime Ctrl + Enter) para veres o computador obedecer em tempo real.',
      ],
      proPractice:
        'Nas empresas, um Analista de Dados nunca faz contas manuais na calculadora: escreve um pequeno script documentado para que qualquer colega consiga auditar e repetir o cálculo um mês depois com novos dados.',
      commonPitfall:
        'Ter medo de mexer no código! Aqui nada se estraga: se apagares tudo por engano, basta clicar em "Repor código" e volta ao estado inicial.',
      referenceTitle: 'As 5 ferramentas do teu percurso profissional',
      referenceRows: [
        {
          syntax: 'Python',
          meaning: 'Linguagem base para lógica, automação e leitura de ficheiros',
          example: 'total = 4 * 0.25',
        },
        {
          syntax: 'SQL',
          meaning: 'Linguagem universal para consultar bases de dados nas empresas',
          example: 'SELECT * FROM vendas;',
        },
        {
          syntax: 'Pandas',
          meaning: 'Biblioteca Python para cruzar e limpar milhões de linhas',
          example: 'df.groupby("produto").sum()',
        },
        {
          syntax: 'Git & BI',
          meaning: 'Controlo de versões no GitHub e dashboards executivos',
          example: 'git commit / DAX SUMX',
        },
      ],
      engine: 'python',
      exampleCode: `# 1. Entrada (dados do talão)
unidades = 8
preco_leite = 0.89

# 2. Processamento
total = round(unidades * preco_leite, 2)

# 3. Saída
print("Leite:", total)`,
      pythonChallenge: {
        description:
          'O teu primeiro programa: guarda na variável clientes_hoje o número 25 e na variável gasto_por_cliente o valor 4.50. Depois guarda em receita_dia a multiplicação das duas variáveis.',
        starterCode: `# Passo 1: substitui None pelos números pedidos
clientes_hoje = None
gasto_por_cliente = None

# Passo 2: multiplica clientes_hoje * gasto_por_cliente
receita_dia = None

print("Receita estimada:", receita_dia)`,
        solutionCode: `clientes_hoje = 25
gasto_por_cliente = 4.50

receita_dia = clientes_hoje * gasto_por_cliente

print("Receita estimada:", receita_dia)`,
        checks: [
          {
            label: 'clientes_hoje == 25',
            expr: 'clientes_hoje == 25',
            actualExpr: 'clientes_hoje',
            hint: 'Escreve 25 sem aspas.',
          },
          {
            label: 'gasto_por_cliente == 4.50',
            expr: 'isinstance(gasto_por_cliente, (int, float)) and math.isclose(gasto_por_cliente, 4.5)',
            actualExpr: 'gasto_por_cliente',
            hint: 'Escreve 4.50 (com ponto).',
          },
          {
            label: 'receita_dia == 112.5',
            expr: 'isinstance(receita_dia, (int, float)) and math.isclose(receita_dia, 112.5)',
            actualExpr: 'receita_dia',
            hint: 'Multiplica clientes_hoje * gasto_por_cliente.',
          },
        ],
      },
      quiz: {
        question:
          'Qual é a principal razão pela qual um analista profissional escreve código em vez de alterar células manualmente numa folha de cálculo?',
        options: [
          'Porque o código corre mais depressa do que qualquer fórmula.',
          'Porque o código fica documentado e volta a correr com dados novos.',
          'Porque as folhas de cálculo não aguentam mais de mil linhas.',
          'Porque as empresas já não permitem usar o Excel em análise de dados.',
        ],
        correctIndex: 1,
        explanation:
          'Reprodutibilidade e automação são o que separa uma tarefa manual demorada de engenharia/análise de dados profissional.',
      },
    },
    {
      id: 'py-01-sintaxe',
      code: '02',
      title: 'Sintaxe, print() e comentários',
      lede: 'Em Python cada linha é uma instrução direta e a indentação (espaços à esquerda) define os blocos de código.',
      analogyTitle: 'A lista de abertura da loja',
      analogyBody:
        'O Python lê o teu ficheiro de cima para baixo como o funcionário que abre a mercearia: acende as luzes, abre a caixa e imprime o talão de teste. Tudo o que começa por cardinal (#) é uma nota a lápis na margem que o computador ignora.',
      concepts: [
        'print() envia texto ou resultados de contas diretamente para o ecrã.',
        'Comentários começam por # e servem para explicar o porquê de uma regra de negócio.',
        'Maiúsculas importam: Print() dá erro porque o comando chama-se print() em minúsculas.',
      ],
      referenceTitle: 'Referência rápida de arranque',
      referenceRows: [
        { syntax: 'print("Olá")', meaning: 'Mostra texto no ecrã', example: 'print("Mercearia aberta")' },
        { syntax: 'print(2 + 3)', meaning: 'Calcula e mostra o resultado', example: 'print(15 * 0.25)' },
        { syntax: '# nota', meaning: 'Comentário ignorado pelo Python', example: '# IVA reduzido 6%' },
      ],
      engine: 'python',
      exampleCode: `# Talão de abertura da Mercearia do Bairro
print("Mercearia do Bairro")
print("Artigos no catálogo:", 15)
print("2 pães a 0.25 EUR:", 2 * 0.25)`,
      pythonChallenge: {
        description:
          'Guarda na variável saudacao o texto exato "Bem-vindo à Mercearia" e na variável dobro o dobro do número guardado em numero (usa numero * 2, não escrevas o resultado).',
        starterCode: `numero = 15

# Completa as duas variáveis abaixo
saudacao = None
dobro = None

print(saudacao, dobro)`,
        solutionCode: `numero = 15

saudacao = "Bem-vindo à Mercearia"
dobro = numero * 2

print(saudacao, dobro)`,
        checks: [
          {
            label: 'saudacao',
            expr: 'saudacao == "Bem-vindo à Mercearia"',
            actualExpr: 'saudacao',
            hint: 'Escreve o texto exato entre aspas.',
          },
          {
            label: 'dobro (30)',
            expr: 'dobro == 30 and isinstance(dobro, int)',
            actualExpr: 'dobro',
            hint: 'Multiplica numero * 2.',
          },
          {
            label: 'dobro é calculado a partir de numero',
            expr: 'correr_com(numero=21)["dobro"] == 42',
            actualExpr: 'correr_com(numero=21).get("dobro")',
            hint: 'Escreve dobro = numero * 2 (e não o número 30): assim funciona para qualquer número.',
          },
        ],
      },
      quiz: {
        question: 'O que acontece se escreveres 0,25 com vírgula em vez de 0.25 com ponto em Python?',
        options: [
          'O Python converte automaticamente para o decimal 0.25.',
          'O Python cria um tuplo com dois valores: (0, 25).',
          'O Python dá SyntaxError e recusa correr o programa.',
          'O Python guarda o valor como o texto "0,25".',
        ],
        correctIndex: 1,
        explanation:
          'Em Python os decimais usam sempre ponto (0.25). A vírgula separa elementos, criando o par (0, 25).',
      },
    },
    {
      id: 'py-02-variaveis',
      code: '03',
      title: 'Variáveis e tipos de dados',
      lede: 'Uma variável guarda um valor com nome e tipo bem definidos: inteiros, decimais, texto ou booleanos.',
      analogyTitle: 'Frascos etiquetados na despensa',
      analogyBody:
        'Uma variável é um frasco transparente com um rótulo colado fora. O sinal = não significa igualdade matemática: significa guardar o valor da direita dentro do frasco da esquerda.',
      concepts: [
        'int guarda quantidades inteiras (10) e float guarda preços decimais com ponto (0.25).',
        'str guarda texto entre aspas ("Pão") e colar textos com + chama-se concatenação ("2" + "2" dá "22").',
        'type(valor) revela o tipo exato guardado dentro de qualquer variável.',
      ],
      referenceTitle: 'Tipos fundamentais em Python',
      referenceRows: [
        { syntax: 'int', meaning: 'Número inteiro sem casas decimais', example: 'quantidade = 10' },
        { syntax: 'float', meaning: 'Número decimal (usa ponto)', example: 'preco_pao = 0.25' },
        { syntax: 'str', meaning: 'Cadeia de texto entre aspas', example: 'loja = "Mercearia do Bairro"' },
        { syntax: 'bool', meaning: 'Valor lógico verdadeiro ou falso', example: 'em_stock = True' },
      ],
      engine: 'python',
      exampleCode: `preco_pao = 0.25
quantidade = 10
total = preco_pao * quantidade

print("Total:", total, "| Tipo:", type(total).__name__)
print("Texto colado:", "2" + "2")
print("Número somado:", int("2") + 2)`,
      pythonChallenge: {
        description:
          'Cria as variáveis preco_pao (0.25), quantidade (10), total (usando as variáveis), colado ("22"), somado (4) e nome_loja ("Mercearia do Bairro").',
        starterCode: `preco_pao = None
quantidade = None
total = None
colado = None
somado = None
nome_loja = None

print(preco_pao, quantidade, total, colado, somado, nome_loja)`,
        solutionCode: `preco_pao = 0.25
quantidade = 10
total = preco_pao * quantidade
colado = "2" + "2"
somado = int("2") + int("2")
nome_loja = "Mercearia do Bairro"

print(preco_pao, quantidade, total, colado, somado, nome_loja)`,
        checks: [
          {
            label: 'preco_pao',
            expr: 'isinstance(preco_pao, (int, float)) and math.isclose(preco_pao, 0.25, abs_tol=0.005)',
            actualExpr: 'preco_pao',
            hint: '25 cêntimos escrevem-se 0.25.',
          },
          {
            label: 'quantidade',
            expr: 'quantidade == 10 and isinstance(quantidade, int)',
            actualExpr: 'quantidade',
            hint: 'Usa o inteiro 10 sem aspas.',
          },
          {
            label: 'total',
            expr: 'isinstance(total, (int, float)) and math.isclose(total, 2.5, abs_tol=0.005)',
            actualExpr: 'total',
            hint: 'Multiplica preco_pao * quantidade.',
          },
          {
            label: 'total é calculado a partir das variáveis',
            expr: 'math.isclose(correr_com(preco_pao=0.5, quantidade=4)["total"], 2.0)',
            actualExpr: 'correr_com(preco_pao=0.5, quantidade=4).get("total")',
            hint: 'Escreve total = preco_pao * quantidade (e não o número 2.5).',
          },
          { label: 'colado', expr: 'colado == "22"', actualExpr: 'colado', hint: 'Soma os textos "2" + "2".' },
          {
            label: 'somado',
            expr: 'somado == 4 and isinstance(somado, int)',
            actualExpr: 'somado',
            hint: 'Converte com int("2") + int("2").',
          },
          {
            label: 'nome_loja',
            expr: 'nome_loja == "Mercearia do Bairro"',
            actualExpr: 'nome_loja',
            hint: 'Respeite maiúsculas e espaços.',
          },
        ],
      },
      quiz: {
        question: 'Qual é o resultado da expressão type("0.89") em Python?',
        options: ['float', 'str', 'int', 'number'],
        correctIndex: 1,
        explanation: 'Qualquer sequência rodeada por aspas é texto (str), mesmo que contenha algarismos.',
      },
    },
    {
      id: 'py-03-strings-conversoes',
      code: '04',
      title: 'Texto, limpeza, conversões e f-strings',
      lede: 'Dados reais chegam como texto com espaços a mais ou casas decimais compridas; limpar e formatar texto é pão nosso do analista.',
      analogyTitle: 'O leitor de código de barras e a impressora de talões',
      analogyBody:
        'O teclado e os ficheiros CSV entregam etiquetas de papel (str). Para calcular o troco transformas papel em moedas com float(); para imprimir o talão formatado a duas casas decimais usas uma f-string com :.2f.',
      concepts: [
        'float("20") e int("3") convertem texto numérico em número real ou inteiro.',
        'Métodos de texto essenciais: .strip() limpa espaços nas pontas, .replace(",", ".") troca vírgula por ponto e .capitalize() padroniza nomes.',
        'Nas f-strings, f"Total: {valor:.2f} €" arredonda apenas na apresentação com 2 casas decimais.',
      ],
      referenceTitle: 'Métodos de string e formatação (W3Schools)',
      referenceRows: [
        { syntax: 'texto.strip()', meaning: 'Remove espaços no início e no fim', example: '" Pão ".strip() -> "Pão"' },
        { syntax: 'texto.replace(a, b)', meaning: 'Substitui parte do texto', example: '"2,35".replace(",", ".")' },
        { syntax: 'float(texto)', meaning: 'Converte texto em decimal', example: 'float("20") -> 20.0' },
        { syntax: 'f"{x:.2f}"', meaning: 'Formata número com 2 casas decimais', example: 'f"{13.75/3:.2f}" -> "4.58"' },
      ],
      engine: 'python',
      exampleCode: `produto_sujo = "  pão caseiro  "
preco_texto = "2,35"

nome_limpo = produto_sujo.strip().title()
preco_num = float(preco_texto.replace(",", "."))
print(f"Artigo: {nome_limpo} | Preço: {preco_num:.2f} €")`,
      pythonChallenge: {
        description:
          'Converte valor_pago_texto ("20") em número, calcula o troco para total_compra = 13.75, cria mensagem ("Troco: 6.25 €") e mensagem_divisao ("Preço por pessoa: 4.58 €").',
        starterCode: `total_compra = 13.75
valor_pago_texto = "20"

valor_pago = None
troco = None
mensagem = None
mensagem_divisao = None

print(mensagem)
print(mensagem_divisao)`,
        solutionCode: `total_compra = 13.75
valor_pago_texto = "20"

valor_pago = float(valor_pago_texto)
troco = valor_pago - total_compra
mensagem = f"Troco: {troco:.2f} €"
mensagem_divisao = f"Preço por pessoa: {total_compra / 3:.2f} €"

print(mensagem)
print(mensagem_divisao)`,
        checks: [
          {
            label: 'valor_pago',
            expr: 'isinstance(valor_pago, (int, float)) and math.isclose(valor_pago, 20.0)',
            actualExpr: 'valor_pago',
            hint: 'Usa float(valor_pago_texto).',
          },
          {
            label: 'troco',
            expr: 'isinstance(troco, (int, float)) and math.isclose(troco, 6.25)',
            actualExpr: 'troco',
            hint: 'Subtrai valor_pago - total_compra.',
          },
          {
            label: 'mensagem',
            expr: 'mensagem == "Troco: 6.25 €"',
            actualExpr: 'mensagem',
            hint: 'Usa f"Troco: {troco} €" ou {troco:.2f}.',
          },
          {
            label: 'mensagem_divisao',
            expr: 'mensagem_divisao == "Preço por pessoa: 4.58 €"',
            actualExpr: 'mensagem_divisao',
            hint: 'Usa {total_compra / 3:.2f} dentro da f-string.',
          },
          {
            label: 'A lógica funciona com outra compra (12.40 € pagos com 15 €)',
            expr: 'correr_com(total_compra=12.40, valor_pago_texto="15")["mensagem"] == "Troco: 2.60 €"',
            actualExpr: 'correr_com(total_compra=12.40, valor_pago_texto="15").get("mensagem")',
            hint: 'Calcula o troco a partir das variáveis (float(valor_pago_texto) - total_compra), em vez de escrever o resultado à mão.',
          },
        ],
      },
      quiz: {
        question: 'Em dados/vendas_sujas.csv aparece o preço "2,35". Qual a forma correta de o converter em float?',
        options: ['float("2,35")', 'float("2,35".replace(",", "."))', 'int("2,35")', 'float("2,35".strip())'],
        correctIndex: 1,
        explanation:
          'float("2,35") lança ValueError porque o Python exige ponto decimal. Primeiro substitui-se a vírgula por ponto.',
      },
    },
    {
      id: 'py-04-condicoes',
      code: '05',
      title: 'Comparações e condições if / elif / else',
      lede: 'As estruturas condicionais permitem aplicar escalões de desconto, regras de entrega e validações de qualidade.',
      analogyTitle: 'O tapete separador de fruta',
      analogyBody:
        'As maçãs descem por uma calha com cancelas por tamanho: se passa na primeira abertura cai logo no cesto pequeno; só o que não caiu segue para o elif seguinte, e o resto acaba no else.',
      concepts: [
        'Usa == para comparar igualdade (dois sinais de igual) e != para diferente.',
        'Combina regras de negócio com and (ambas verdadeiras) e or (basta uma verdadeira).',
        'Assim que um ramo if ou elif é verdadeiro, o Python ignora todos os restantes ramos desse bloco.',
      ],
      referenceTitle: 'Operadores de comparação e lógica',
      referenceRows: [
        { syntax: 'a == b / a != b', meaning: 'Igual a / Diferente de', example: 'cidade == "Porto"' },
        { syntax: 'a >= b / a <= b', meaning: 'Maior ou igual / Menor ou igual', example: 'idade >= 18' },
        {
          syntax: 'cond1 and cond2',
          meaning: 'Verdadeiro só se ambas cumprirem',
          example: 'total > 30 and cidade == "Porto"',
        },
        { syntax: 'if / elif / else', meaning: 'Decisão com múltiplos escalões', example: 'elif total <= 50:' },
      ],
      engine: 'python',
      exampleCode: `total = 37.50
cidade = "Porto"

if total <= 20:
    desconto = 0
elif total <= 50:
    desconto = 5
else:
    desconto = 10

print(f"Escalão: {desconto}% | Entrega grátis: {total > 30 and cidade == 'Porto'}")`,
      pythonChallenge: {
        description:
          'Calcula o escalão desconto_pct (até 20 -> 0, até 50 -> 5, acima -> 10) para total = 37.5, total_final após desconto, pode_entrar (idade 17 >= 18) e entrega_gratis (total > 30 e cidade == "Porto").',
        starterCode: `total = 37.5
desconto_pct = None

total_final = None

idade = 17
pode_entrar = None

cidade = "Porto"
entrega_gratis = None

print(desconto_pct, total_final, pode_entrar, entrega_gratis)`,
        solutionCode: `total = 37.5
if total <= 20:
    desconto_pct = 0
elif total <= 50:
    desconto_pct = 5
else:
    desconto_pct = 10

total_final = total - (total * desconto_pct / 100)

idade = 17
pode_entrar = idade >= 18

cidade = "Porto"
entrega_gratis = total > 30 and cidade == "Porto"

print(desconto_pct, total_final, pode_entrar, entrega_gratis)`,
        checks: [
          {
            label: 'desconto_pct',
            expr: 'desconto_pct == 5',
            actualExpr: 'desconto_pct',
            hint: '37.5 fica entre 20 e 50, logo recebe 5.',
          },
          {
            label: 'total_final',
            expr: 'isinstance(total_final, (int, float)) and math.isclose(total_final, 35.625, abs_tol=0.005)',
            actualExpr: 'total_final',
            hint: 'Calcula total - total * desconto_pct / 100.',
          },
          {
            label: 'pode_entrar',
            expr: 'pode_entrar is False',
            actualExpr: 'pode_entrar',
            hint: 'idade >= 18 devolve False para 17.',
          },
          {
            label: 'entrega_gratis',
            expr: 'entrega_gratis is True',
            actualExpr: 'entrega_gratis',
            hint: 'Usa total > 30 and cidade == "Porto".',
          },
          {
            label: 'O escalão funciona para outros totais (15, 20, 50 e 80 €)',
            expr: '[correr_com(total=t)["desconto_pct"] for t in (15, 20, 50, 80)] == [0, 0, 5, 10]',
            actualExpr: '[correr_com(total=t).get("desconto_pct") for t in (15, 20, 50, 80)]',
            hint: 'Usa if / elif / else sobre a variável total, com <= 20 e <= 50, em vez de escrever o desconto à mão.',
          },
          {
            label: 'pode_entrar e entrega_gratis seguem os dados (idade 18, cidade Lisboa)',
            expr: 'correr_com(idade=18)["pode_entrar"] is True and correr_com(cidade="Lisboa")["entrega_gratis"] is False',
            actualExpr: '(correr_com(idade=18).get("pode_entrar"), correr_com(cidade="Lisboa").get("entrega_gratis"))',
            hint: 'Calcula com comparações: idade >= 18 e total > 30 and cidade == "Porto".',
          },
        ],
      },
      quiz: {
        question: 'Porque é que if preco = 7.50: dá SyntaxError em Python?',
        options: [
          'Porque falta converter 7.50 para inteiro com int().',
          'Porque = atribui um valor; para comparar usa-se ==.',
          'Porque o if só aceita comparações com < ou >.',
          'Porque falta escrever 7.50 entre aspas.',
        ],
        correctIndex: 1,
        explanation: 'Em Python = guarda um valor numa variável, enquanto == compara dois valores.',
      },
    },
    {
      id: 'py-05-ciclo-for',
      code: '06',
      title: 'Ciclo for e range()',
      lede: 'O ciclo for percorre cada artigo de uma lista ou intervalo numérico sem repetir linhas de código.',
      analogyTitle: 'Passar artigo a artigo no tapete da caixa',
      analogyBody:
        'Não constróis uma caixa registadora diferente para um cesto de 3 ou de 50 artigos: passas um artigo de cada vez pelo mesmo leitor até o tapete ficar vazio.',
      concepts: [
        'for venda in vendas: executa o bloco indentado uma vez por cada elemento da lista.',
        'range(1, 101) gera números de 1 até 100 (o limite direito fica sempre de fora).',
        'Padrão do máximo: começas com maior = vendas[0] e atualizas sempre que v > maior.',
      ],
      referenceTitle: 'Padrões essenciais com ciclo for',
      referenceRows: [
        { syntax: 'for item in lista:', meaning: 'Percorre todos os valores', example: 'for v in vendas:' },
        { syntax: 'range(inicio, fim)', meaning: 'Sequência de inicio até fim - 1', example: 'range(1, 101)' },
        {
          syntax: 'enumerate(lista, 1)',
          meaning: 'Índice e valor em simultâneo',
          example: 'for pos, v in enumerate(vendas, 1):',
        },
      ],
      engine: 'python',
      exampleCode: `vendas = [120, 80, 250, 40, 100, 310]
acima_100 = 0
for v in vendas:
    if v > 100:
        acima_100 += 1

print("Vendas superiores a 100 EUR:", acima_100)`,
      pythonChallenge: {
        description:
          'Com ciclos for, calcula soma_1_a_100 (1 a 100 inclusive), quantas_acima_100, maior_venda em vendas = [120, 80, 250, 40, 100, 310] e lista descontos para totais = [15, 37.5, 80].',
        starterCode: `vendas = [120, 80, 250, 40, 100, 310]

soma_1_a_100 = 0

quantas_acima_100 = 0

maior_venda = vendas[0]

totais = [15, 37.5, 80]
descontos = []

print(soma_1_a_100, quantas_acima_100, maior_venda, descontos)`,
        solutionCode: `vendas = [120, 80, 250, 40, 100, 310]

soma_1_a_100 = 0
for n in range(1, 101):
    soma_1_a_100 += n

quantas_acima_100 = 0
maior_venda = vendas[0]
for v in vendas:
    if v > 100:
        quantas_acima_100 += 1
    if v > maior_venda:
        maior_venda = v

totais = [15, 37.5, 80]
descontos = []
for t in totais:
    if t <= 20:
        descontos.append(0)
    elif t <= 50:
        descontos.append(5)
    else:
        descontos.append(10)

print(soma_1_a_100, quantas_acima_100, maior_venda, descontos)`,
        checks: [
          {
            label: 'soma_1_a_100',
            expr: 'soma_1_a_100 == 5050',
            actualExpr: 'soma_1_a_100',
            hint: 'Usa range(1, 101) para incluir o 100.',
          },
          {
            label: 'quantas_acima_100',
            expr: 'quantas_acima_100 == 3',
            actualExpr: 'quantas_acima_100',
            hint: 'Usa v > 100 (120, 250 e 310).',
          },
          {
            label: 'maior_venda',
            expr: 'maior_venda == 310',
            actualExpr: 'maior_venda',
            hint: 'Se v > maior_venda, atualiza maior_venda = v.',
          },
          {
            label: 'descontos',
            expr: 'descontos == [0, 5, 10]',
            actualExpr: 'descontos',
            hint: 'Usa descontos.append(...) para cada valor de totais.',
          },
          {
            label: 'Os ciclos funcionam com outra lista de vendas',
            expr: '(lambda r: (r["quantas_acima_100"], r["maior_venda"]))(correr_com(vendas=[50, 400, 101, 99])) == (2, 400)',
            actualExpr:
              '(lambda r: (r.get("quantas_acima_100"), r.get("maior_venda")))(correr_com(vendas=[50, 400, 101, 99]))',
            hint: 'Percorre a lista vendas com for em vez de contar à mão; começa maior_venda em vendas[0].',
          },
          {
            label: 'Os descontos funcionam com outros totais (20, 50 e 51 €)',
            expr: 'correr_com(totais=[20, 50, 51])["descontos"] == [0, 5, 10]',
            actualExpr: 'correr_com(totais=[20, 50, 51]).get("descontos")',
            hint: 'Para cada t em totais, usa if / elif / else e .append() na lista descontos.',
          },
        ],
      },
      quiz: {
        question: 'Quantos números gera range(1, 5)?',
        options: [
          '5 números (1, 2, 3, 4, 5)',
          '4 números (1, 2, 3, 4)',
          '4 números (2, 3, 4, 5)',
          '5 números (0, 1, 2, 3, 4)',
        ],
        correctIndex: 1,
        explanation: 'O limite superior em range(inicio, fim) é exclusivo: pára imediatamente antes do 5.',
      },
    },
    {
      id: 'py-06-while',
      code: '07',
      title: 'Ciclo while e acumuladores',
      lede: 'Quando não sabemos à partida quantas voltas serão precisas até atingir uma meta, usamos while.',
      analogyTitle: 'O mealheiro semanal da mercearia',
      analogyBody:
        'O ciclo for sabe quantas faturas há na gaveta; o ciclo while continua a juntar moedas todas as semanas enquanto o saldo for inferior a 500 euros.',
      concepts: [
        'Um acumulador começa em 0 fora do ciclo e cresce a cada volta com total += valor.',
        'No ciclo while, o código lá dentro tem obrigatoriamente de alterar a variável da condição para evitar ciclos infinitos.',
        'len(lista) devolve o número de elementos, permitindo calcular médias (soma / len(lista)).',
      ],
      referenceTitle: 'Comparação for vs while',
      referenceRows: [
        { syntax: 'total += valor', meaning: 'Atalho para total = total + valor', example: 'saldo += 35' },
        { syntax: 'while saldo < 500:', meaning: 'Repete enquanto a condição for True', example: 'semanas += 1' },
        { syntax: 'len(vendas)', meaning: 'Conta elementos da coleção', example: 'media = total / len(vendas)' },
      ],
      engine: 'python',
      exampleCode: `saldo = 100
meta = 250
semanas = 0

while saldo < meta:
    saldo += 40
    semanas += 1

print(f"Atingiu {saldo} € ao fim de {semanas} semanas.")`,
      pythonChallenge: {
        description:
          'Calcula total_vendas e media_vendas para [120, 80, 250, 40, 100, 310], e com while conta quantas semanas demora um saldo inicial de 100 € (poupando 35 €/semana) a chegar a 500 € ou mais, guardando saldo_final.',
        starterCode: `vendas = [120, 80, 250, 40, 100, 310]
total_vendas = 0
media_vendas = None

saldo = 100
semanas = 0
saldo_final = None

print(total_vendas, media_vendas, semanas, saldo_final)`,
        solutionCode: `vendas = [120, 80, 250, 40, 100, 310]
total_vendas = 0
for v in vendas:
    total_vendas += v
media_vendas = total_vendas / len(vendas)

saldo = 100
semanas = 0
while saldo < 500:
    saldo += 35
    semanas += 1
saldo_final = saldo

print(total_vendas, media_vendas, semanas, saldo_final)`,
        checks: [
          {
            label: 'total_vendas',
            expr: 'math.isclose(total_vendas, 900)',
            actualExpr: 'total_vendas',
            hint: 'Soma cada venda num acumulador.',
          },
          {
            label: 'media_vendas',
            expr: 'isinstance(media_vendas, (int, float)) and math.isclose(media_vendas, 150)',
            actualExpr: 'media_vendas',
            hint: 'Divide total_vendas por len(vendas).',
          },
          {
            label: 'semanas',
            expr: 'semanas == 12',
            actualExpr: 'semanas',
            hint: 'Enquanto saldo < 500, soma 35 ao saldo e 1 às semanas.',
          },
          {
            label: 'saldo_final',
            expr: 'isinstance(saldo_final, (int, float)) and math.isclose(saldo_final, 520)',
            actualExpr: 'saldo_final',
            hint: 'Guarda saldo_final = saldo após o ciclo.',
          },
          {
            label: 'Total e média funcionam com outra lista (10, 20, 30)',
            expr: '(lambda r: (r["total_vendas"], r["media_vendas"]))(correr_com(vendas=[10, 20, 30])) == (60, 20)',
            actualExpr: '(lambda r: (r.get("total_vendas"), r.get("media_vendas")))(correr_com(vendas=[10, 20, 30]))',
            hint: 'Acumula com um ciclo e divide por len(vendas), em vez de escrever 900 e 150.',
          },
          {
            label: 'O while funciona com outro saldo inicial (480 €)',
            expr: '(lambda r: (r["semanas"], r["saldo_final"]))(correr_com(saldo=480)) == (1, 515)',
            actualExpr: '(lambda r: (r.get("semanas"), r.get("saldo_final")))(correr_com(saldo=480))',
            hint: 'Enquanto saldo < 500, soma 35 ao saldo e 1 às semanas.',
          },
        ],
      },
      quiz: {
        question: 'Se inicializares total = 0 DENTRO do ciclo for em vez de fora, o que acontece?',
        options: [
          'O Python dá erro porque a variável total é criada duas vezes seguidas.',
          'O total volta a zero em cada volta e só fica o último valor.',
          'O resultado é o mesmo, só que o ciclo fica mais lento.',
          'O total fica sempre a zero porque nunca chega a somar.',
        ],
        correctIndex: 1,
        explanation: 'Inicializar dentro do ciclo esvazia o mealheiro a cada volta.',
      },
    },
    {
      id: 'py-07-listas-colecoes',
      code: '08',
      title: 'Listas, fatias e compreensão de listas',
      lede: 'Domina indexação, slicing, ordenação e list comprehensions para transformar colunas inteiras numa linha.',
      analogyTitle: 'As prateleiras numeradas a partir do zero',
      analogyBody:
        'Em Python a primeira prateleira é a posição 0 e a última pode ser lida diretamente com -1. Podes recortar uma fatia inteira da prateleira com lista[inicio:fim].',
      concepts: [
        'lista[0] lê o primeiro item, lista[-1] lê o último e lista[:3] devolve os 3 primeiros.',
        'sorted(lista, reverse=True) devolve uma nova lista ordenada do maior para o menor sem destruir a original.',
        '[p for p in precos if p > 1.50] filtra valores de forma concisa e legível.',
      ],
      referenceTitle: 'Operações de listas e sets (W3Schools)',
      referenceRows: [
        { syntax: 'lista[:3]', meaning: 'Fatia com os primeiros 3 itens', example: 'produtos[:3]' },
        {
          syntax: 'sorted(lista, reverse=True)',
          meaning: 'Nova lista ordenada descendente',
          example: 'sorted(precos, reverse=True)',
        },
        {
          syntax: '[x for x in l if cond]',
          meaning: 'Compreensão de lista com filtro',
          example: '[p for p in precos if p > 1.5]',
        },
        { syntax: 'set(lista)', meaning: 'Remove valores duplicados', example: 'len(set(cidades))' },
      ],
      engine: 'python',
      exampleCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Azeite", "Café"]
precos = [0.25, 0.89, 2.35, 1.20, 7.50, 3.40]

print("Top 3 mais caros:", sorted(precos, reverse=True)[:3])
print("Com IVA 6%:", [round(p * 1.06, 2) for p in precos])`,
      pythonChallenge: {
        description:
          'Guarda em primeiro e ultimo o primeiro e o último produto, a fatia tres_primeiros, precos_caros (> 1.50 €) e precos_desc ordenados do maior para o menor.',
        starterCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Azeite", "Café"]
precos = [0.25, 0.89, 2.35, 1.20, 7.50, 3.40]

primeiro = None
ultimo = None
tres_primeiros = None
precos_caros = None
precos_desc = None

print(primeiro, ultimo, tres_primeiros, precos_caros, precos_desc)`,
        solutionCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Azeite", "Café"]
precos = [0.25, 0.89, 2.35, 1.20, 7.50, 3.40]

primeiro = produtos[0]
ultimo = produtos[-1]
tres_primeiros = produtos[:3]
precos_caros = [p for p in precos if p > 1.50]
precos_desc = sorted(precos, reverse=True)

print(primeiro, ultimo, tres_primeiros, precos_caros, precos_desc)`,
        checks: [
          { label: 'primeiro', expr: 'primeiro == "Pão"', actualExpr: 'primeiro', hint: 'Usa produtos[0].' },
          { label: 'ultimo', expr: 'ultimo == "Café"', actualExpr: 'ultimo', hint: 'Usa produtos[-1].' },
          {
            label: 'tres_primeiros',
            expr: 'tres_primeiros == ["Pão", "Leite", "Ovos (dúzia)"]',
            actualExpr: 'tres_primeiros',
            hint: 'Usa produtos[:3].',
          },
          {
            label: 'precos_caros',
            expr: 'precos_caros == [2.35, 7.5, 3.4]',
            actualExpr: 'precos_caros',
            hint: 'Filtra com [p for p in precos if p > 1.50].',
          },
          {
            label: 'precos_desc',
            expr: 'precos_desc == [7.5, 3.4, 2.35, 1.2, 0.89, 0.25]',
            actualExpr: 'precos_desc',
            hint: 'Usa sorted(precos, reverse=True).',
          },
          {
            label: 'Índices, fatias e filtros funcionam com outras listas',
            expr: '(lambda r: (r["primeiro"], r["ultimo"], r["tres_primeiros"], r["precos_caros"], r["precos_desc"]))(correr_com(produtos=["A", "B", "C", "D"], precos=[1.0, 2.0, 5.0])) == ("A", "D", ["A", "B", "C"], [2.0, 5.0], [5.0, 2.0, 1.0])',
            actualExpr:
              '(lambda r: (r.get("primeiro"), r.get("ultimo"), r.get("tres_primeiros"), r.get("precos_caros"), r.get("precos_desc")))(correr_com(produtos=["A", "B", "C", "D"], precos=[1.0, 2.0, 5.0]))',
            hint: 'Usa produtos[0], produtos[-1], produtos[:3], uma list comprehension com p > 1.50 e sorted(..., reverse=True).',
          },
        ],
      },
      quiz: {
        question: 'Qual a diferença entre lista.sort() e sorted(lista)?',
        options: [
          'Nenhuma: as duas devolvem uma nova lista ordenada.',
          '.sort() altera a lista original; sorted() devolve uma nova.',
          'sorted() altera a lista original; .sort() devolve uma nova.',
          '.sort() ordena por ordem crescente e sorted() decrescente.',
        ],
        correctIndex: 1,
        explanation:
          'Guardar x = lista.sort() deixa x a valer None. Para guardar numa variável nova usa-se sorted(lista).',
      },
    },
    {
      id: 'py-08-dicionarios',
      code: '09',
      title: 'Dicionários e agrupamento por chave',
      lede: 'Os dicionários associam chaves únicas a valores, funcionando como tabelas de consulta rápida e acumuladores por categoria.',
      analogyTitle: 'O preçário afixado na parede',
      analogyBody:
        'Em vez de procurar a posição numérica de cada artigo, apontas para a etiqueta "Azeite" e lês imediatamente 7.50. E com .get(chave, 0) somas vendas por artigo sem erro na primeira ocorrência.',
      concepts: [
        'precos["Azeite"] acede diretamente ao valor da chave "Azeite".',
        'precos.get("Chocolate", 0.0) evita KeyError quando a chave ainda não existe.',
        'max(totais, key=totais.get) descobre a chave com maior soma acumulada.',
      ],
      referenceTitle: 'Métodos de dicionário (W3Schools)',
      referenceRows: [
        {
          syntax: 'd[chave] = valor',
          meaning: 'Cria ou atualiza um par chave-valor',
          example: 'precos["Sumo"] = 1.75',
        },
        {
          syntax: 'd.get(k, 0)',
          meaning: 'Lê valor ou devolve 0 se não existir',
          example: 'totais.get(prod, 0) + qtd',
        },
        { syntax: 'for k, v in d.items():', meaning: 'Percorre chaves e valores juntos', example: 'print(k, v)' },
        {
          syntax: 'max(d, key=d.get)',
          meaning: 'Chave com o valor máximo',
          example: 'campeao = max(totais, key=totais.get)',
        },
      ],
      engine: 'python',
      exampleCode: `vendas_amostra = [("Leite", 3), ("Pão", 10), ("Leite", 4), ("Café", 2)]
unidades = {}
for prod, qtd in vendas_amostra:
    unidades[prod] = unidades.get(prod, 0) + qtd

print("Contagem:", unidades)
print("Mais vendido:", max(unidades, key=unidades.get))`,
      pythonChallenge: {
        description:
          'Obtém preco_azeite, usa .get() para preco_chocolate (0.0), acumula unidades_por_produto e calcula total_talao.',
        starterCode: `precos = {"Pão": 0.25, "Leite": 0.89, "Azeite": 7.50, "Café": 3.40}
talao = [("Pão", 4), ("Leite", 2), ("Café", 1), ("Pão", 2), ("Azeite", 1)]

preco_azeite = None
preco_chocolate = None
unidades_por_produto = {}
total_talao = 0.0

print(preco_azeite, preco_chocolate, unidades_por_produto, total_talao)`,
        solutionCode: `precos = {"Pão": 0.25, "Leite": 0.89, "Azeite": 7.50, "Café": 3.40}
talao = [("Pão", 4), ("Leite", 2), ("Café", 1), ("Pão", 2), ("Azeite", 1)]

preco_azeite = precos["Azeite"]
preco_chocolate = precos.get("Chocolate", 0.0)
unidades_por_produto = {}
total_talao = 0.0

for prod, qtd in talao:
    unidades_por_produto[prod] = unidades_por_produto.get(prod, 0) + qtd
    total_talao += qtd * precos[prod]

print(preco_azeite, preco_chocolate, unidades_por_produto, round(total_talao, 2))`,
        checks: [
          {
            label: 'preco_azeite',
            expr: 'preco_azeite == 7.5',
            actualExpr: 'preco_azeite',
            hint: 'Consulte precos["Azeite"].',
          },
          {
            label: 'preco_chocolate',
            expr: 'preco_chocolate == 0.0',
            actualExpr: 'preco_chocolate',
            hint: 'Usa precos.get("Chocolate", 0.0).',
          },
          {
            label: 'unidades_por_produto',
            expr: 'unidades_por_produto == {"Pão": 6, "Leite": 2, "Café": 1, "Azeite": 1}',
            actualExpr: 'unidades_por_produto',
            hint: 'Soma qtd por chave com .get(prod, 0).',
          },
          {
            label: 'total_talao',
            expr: 'math.isclose(total_talao, 14.18, abs_tol=0.005)',
            actualExpr: 'total_talao',
            hint: 'Soma qtd * precos[prod] em cada linha.',
          },
          {
            label: 'O agrupamento funciona com outro talão',
            expr: '(lambda r: (r["unidades_por_produto"], round(r["total_talao"], 2)))(correr_com(talao=[("Leite", 3), ("Leite", 1)])) == ({"Leite": 4}, 3.56)',
            actualExpr:
              '(lambda r: (r.get("unidades_por_produto"), r.get("total_talao")))(correr_com(talao=[("Leite", 3), ("Leite", 1)]))',
            hint: 'Percorre o talão com for prod, qtd in talao e acumula com .get(prod, 0) + qtd.',
          },
        ],
      },
      quiz: {
        question: 'Em Python, que operação SQL equivale a somar quantidades num dicionário indexado por produto?',
        options: [
          'SELECT DISTINCT produto, quantidade',
          'GROUP BY produto com SUM(quantidade)',
          'ORDER BY produto, quantidade DESC',
          'GROUP BY produto com COUNT(*)',
        ],
        correctIndex: 1,
        explanation: 'Cada chave única do dicionário forma um grupo, exatamente como o GROUP BY em SQL.',
      },
    },
    {
      id: 'py-09-funcoes',
      code: '10',
      title: 'Funções reutilizáveis e return',
      lede: 'Organizar cálculos e limpezas em funções torna os scripts testáveis, legíveis e livres de código duplicado.',
      analogyTitle: 'As teclas rápidas da balança',
      analogyBody:
        'Quando programas uma função com def, ensinas uma receita nova ao Python. Sempre que chamas a função com ingredientes novos, o return entrega o resultado calculado.',
      concepts: [
        'def nome(param1, param2=padrao): define parâmetros obrigatórios e opcionais.',
        'return devolve o valor para quem chamou a função e termina a execução dessa função.',
        'Funções pequenas com um único objetivo são a base de pipelines de dados limpos.',
      ],
      referenceTitle: 'Anatomia de funções em Python',
      referenceRows: [
        {
          syntax: 'def fn(a, b=0):',
          meaning: 'Define função com parâmetro opcional',
          example: 'def aplicar_iva(v, taxa=0.23):',
        },
        { syntax: 'return valor', meaning: 'Devolve resultado ao chamador', example: 'return round(q * p, 2)' },
        {
          syntax: 'lambda x: x[1]',
          meaning: 'Função anónima curta para ordenação',
          example: 'sorted(d.items(), key=lambda x: x[1])',
        },
      ],
      engine: 'python',
      exampleCode: `def limpar_preco(texto):
    valor = float(str(texto).strip().replace(",", "."))
    return valor if valor > 0 else None

amostras = ["0.25", " 2,35 ", "-1.00"]
print([limpar_preco(x) for x in amostras])`,
      pythonChallenge: {
        description:
          'Implementa 3 funções: calcular_subtotal(quantidade, preco), limpar_nome_produto(texto) e aplicar_iva(valor, taxa=0.23).',
        starterCode: `def calcular_subtotal(quantidade, preco):
    pass

def limpar_nome_produto(texto):
    pass

def aplicar_iva(valor, taxa=0.23):
    pass

print(calcular_subtotal(3, 0.89), limpar_nome_produto("  pão "), aplicar_iva(10.0))`,
        solutionCode: `def calcular_subtotal(quantidade, preco):
    return round(quantidade * preco, 2)

def limpar_nome_produto(texto):
    return texto.strip().capitalize()

def aplicar_iva(valor, taxa=0.23):
    return round(valor * (1 + taxa), 2)

print(calcular_subtotal(3, 0.89), limpar_nome_produto("  pão "), aplicar_iva(10.0))`,
        checks: [
          {
            label: 'calcular_subtotal(3, 0.89)',
            expr: 'callable(calcular_subtotal) and calcular_subtotal(3, 0.89) == 2.67',
            actualExpr: 'calcular_subtotal(3, 0.89)',
            hint: 'Devolve round(quantidade * preco, 2).',
          },
          {
            label: 'limpar_nome_produto("  pão ")',
            expr: 'callable(limpar_nome_produto) and limpar_nome_produto("  pão ") == "Pão"',
            actualExpr: 'limpar_nome_produto("  pão ")',
            hint: 'Usa texto.strip().capitalize().',
          },
          {
            label: 'aplicar_iva(10.0)',
            expr: 'callable(aplicar_iva) and aplicar_iva(10.0) == 12.3 and aplicar_iva(10.0, 0.06) == 10.6',
            actualExpr: 'aplicar_iva(10.0)',
            hint: 'Devolve round(valor * (1 + taxa), 2).',
          },
          {
            label: 'As funções funcionam com outros argumentos',
            expr: 'calcular_subtotal(2, 7.5) == 15.0 and limpar_nome_produto(" AZEITE ") == "Azeite" and aplicar_iva(100) == 123.0',
            actualExpr: '(calcular_subtotal(2, 7.5), limpar_nome_produto(" AZEITE "), aplicar_iva(100))',
            hint: 'Usa os parâmetros dentro da função (quantidade * preco, texto.strip().capitalize(), valor * (1 + taxa)).',
          },
        ],
      },
      quiz: {
        question: 'O que devolve uma função em Python se nos esquecermos de escrever a instrução return?',
        options: ['0', 'None', 'Um erro de sintaxe', 'O valor da última linha da função'],
        correctIndex: 1,
        explanation: 'Sem return explícito, qualquer função Python devolve automaticamente None.',
      },
    },
    {
      id: 'py-11-revisao',
      code: '11',
      title: 'Revisão geral: o talão de compra completo',
      lede: 'Antes do projeto da Caixa Registadora, volta a usar tudo o que aprendeste num só problema: variáveis, texto formatado, condições, ciclos, listas, dicionários e funções. A correção testa o teu código com outros carrinhos, por isso tem de funcionar para qualquer compra.',
      analogyTitle: 'O teste de condução depois das aulas',
      analogyBody:
        'Nas aulas treinaste cada manobra em separado: arrancar, travar, estacionar. No exame fazes tudo seguido, numa rua que não conheces. Esta etapa é esse exame: nenhum conceito é novo, mas tens de decidir sozinho qual usar em cada passo.',
      concepts: [
        'Funções (py-09): linha_talao recebe produto, quantidade e preço e devolve o texto da linha.',
        'Formatação (py-03): f"{preco:.2f}" mostra sempre 2 casas decimais.',
        'Ciclo for com acumulador (py-05): somar o subtotal percorrendo o carrinho.',
        'if / elif / else (py-04): escolher o desconto pelo valor da compra.',
        'Dicionário acumulador com .get() (py-08): somar unidades por categoria.',
        'Listas (py-07): juntar os nomes dos produtos caros com .append().',
      ],
      beginnerSteps: [
        'Escreve a função linha_talao(produto, quantidade, preco) que devolve f"{produto} x{quantidade} = {quantidade * preco:.2f} €".',
        'Percorre o carrinho com for produto, quantidade, preco in carrinho: e soma quantidade * preco em subtotal.',
        'No mesmo ciclo, soma as unidades por categoria: unidades_por_categoria[cat] = unidades_por_categoria.get(cat, 0) + quantidade.',
        'Ainda no ciclo, se preco > 2, acrescenta o produto a produtos_caros.',
        'Depois do ciclo, escolhe desconto_pct: 10 se subtotal >= 50, 5 se subtotal >= 20, senão 0.',
        'Calcula total = round(subtotal * (1 - desconto_pct / 100), 2).',
      ],
      proPractice:
        'Um bom programa não depende dos dados de exemplo. Antes de entregares, muda o carrinho à mão (um só produto, um carrinho grande) e confirma que tudo continua a fazer sentido.',
      commonPitfall:
        'Escrever o resultado à mão (por exemplo total = 23.05) ou começar o subtotal dentro do ciclo. A correção usa outros carrinhos e apanha as duas coisas.',
      referenceTitle: 'Tudo o que precisas, numa tabela',
      referenceRows: [
        {
          syntax: 'def f(a, b):\n    return ...',
          meaning: 'Definir uma função',
          example: 'def linha_talao(produto, quantidade, preco):',
        },
        {
          syntax: 'for a, b, c in lista:',
          meaning: 'Desempacotar tuplos num ciclo',
          example: 'for produto, quantidade, preco in carrinho:',
        },
        {
          syntax: 'd[k] = d.get(k, 0) + x',
          meaning: 'Acumular num dicionário',
          example: 'unidades_por_categoria[cat] = ...',
        },
        { syntax: 'if / elif / else', meaning: 'Escolher entre várias faixas', example: 'desconto_pct = 10 / 5 / 0' },
        { syntax: 'lista.append(x)', meaning: 'Acrescentar a uma lista', example: 'produtos_caros.append(produto)' },
      ],
      engine: 'python',
      exampleCode: `# Aquecimento: um ciclo, um if e um dicionário no mesmo bloco
cesto = [("Maçãs (kg)", 2, 1.80), ("Iogurte", 4, 0.55), ("Arroz", 1, 1.20)]

total = 0
contagem = {}
for nome, qtd, preco in cesto:
    total += qtd * preco
    tipo = "fruta" if "kg" in nome else "outro"
    contagem[tipo] = contagem.get(tipo, 0) + qtd
    print(f"{nome:<12} {qtd} x {preco:.2f} €")

print(f"Total: {total:.2f} €", contagem)`,
      pythonChallenge: {
        description:
          'Completa o talão: (1) a função linha_talao(produto, quantidade, preco) devolve, por exemplo, "Pão x6 = 1.50 €"; (2) subtotal é a soma de quantidade × preço do carrinho; (3) desconto_pct é 10 se subtotal ≥ 50, 5 se subtotal ≥ 20, senão 0; (4) total = subtotal com desconto, arredondado a 2 casas; (5) unidades_por_categoria soma as unidades por categoria (usa o dicionário categorias); (6) produtos_caros lista os produtos com preço acima de 2 €, pela ordem do carrinho.',
        starterCode: `carrinho = [("Pão", 6, 0.25), ("Leite", 4, 0.89), ("Azeite", 1, 7.50), ("Café", 2, 3.40), ("Queijo", 1, 4.90)]
categorias = {"Pão": "Padaria", "Leite": "Laticínios", "Azeite": "Mercearia", "Café": "Mercearia", "Queijo": "Charcutaria"}


def linha_talao(produto, quantidade, preco):
    return ""  # devolve algo como "Pão x6 = 1.50 €"


subtotal = 0
unidades_por_categoria = {}
produtos_caros = []
# Percorre o carrinho aqui


desconto_pct = None
total = None

for produto, quantidade, preco in carrinho:
    print(linha_talao(produto, quantidade, preco))
print("Subtotal:", subtotal, "| Desconto:", desconto_pct, "% | Total:", total)
print(unidades_por_categoria, produtos_caros)`,
        solutionCode: `carrinho = [("Pão", 6, 0.25), ("Leite", 4, 0.89), ("Azeite", 1, 7.50), ("Café", 2, 3.40), ("Queijo", 1, 4.90)]
categorias = {"Pão": "Padaria", "Leite": "Laticínios", "Azeite": "Mercearia", "Café": "Mercearia", "Queijo": "Charcutaria"}


def linha_talao(produto, quantidade, preco):
    return f"{produto} x{quantidade} = {quantidade * preco:.2f} €"


subtotal = 0
unidades_por_categoria = {}
produtos_caros = []
for produto, quantidade, preco in carrinho:
    subtotal += quantidade * preco
    categoria = categorias[produto]
    unidades_por_categoria[categoria] = unidades_por_categoria.get(categoria, 0) + quantidade
    if preco > 2:
        produtos_caros.append(produto)

if subtotal >= 50:
    desconto_pct = 10
elif subtotal >= 20:
    desconto_pct = 5
else:
    desconto_pct = 0
total = round(subtotal * (1 - desconto_pct / 100), 2)

for produto, quantidade, preco in carrinho:
    print(linha_talao(produto, quantidade, preco))
print("Subtotal:", round(subtotal, 2), "| Desconto:", desconto_pct, "% | Total:", total)
print(unidades_por_categoria, produtos_caros)`,
        checks: [
          {
            label: 'linha_talao formata a linha com 2 casas decimais',
            expr: 'linha_talao("Pão", 6, 0.25) == "Pão x6 = 1.50 €" and linha_talao("Azeite", 2, 7.5) == "Azeite x2 = 15.00 €"',
            actualExpr: 'linha_talao("Pão", 6, 0.25)',
            hint: 'return f"{produto} x{quantidade} = {quantidade * preco:.2f} €"',
          },
          {
            label: 'subtotal (24.26 €) somado no ciclo',
            expr: 'abs(subtotal - 24.26) < 0.001 and abs(correr_com(carrinho=[("Pão", 2, 0.25)])["subtotal"] - 0.5) < 0.001',
            actualExpr: 'subtotal',
            hint: 'Começa com subtotal = 0 antes do ciclo e faz subtotal += quantidade * preco dentro dele.',
          },
          {
            label: 'desconto_pct e total (5% → 23.05 €)',
            expr: 'desconto_pct == 5 and total == 23.05',
            actualExpr: '(desconto_pct, total)',
            hint: 'if subtotal >= 50 / elif subtotal >= 20 / else, e total = round(subtotal * (1 - desconto_pct / 100), 2).',
          },
          {
            label: 'As três faixas de desconto funcionam com outros carrinhos',
            expr: '(lambda a, b: a["desconto_pct"] == 10 and a["total"] == 54.0 and b["desconto_pct"] == 0 and b["total"] == 0.5)(correr_com(carrinho=[("Azeite", 8, 7.50)]), correr_com(carrinho=[("Pão", 2, 0.25)]))',
            actualExpr:
              '(correr_com(carrinho=[("Azeite", 8, 7.50)]).get("total"), correr_com(carrinho=[("Pão", 2, 0.25)]).get("total"))',
            hint: 'Um carrinho de 60 € tem 10% de desconto e um de 0,50 € não tem nenhum. Calcula o desconto a partir do subtotal, não à mão.',
          },
          {
            label: 'unidades_por_categoria acumulado com o dicionário categorias',
            expr: 'unidades_por_categoria == {"Padaria": 6, "Laticínios": 4, "Mercearia": 3, "Charcutaria": 1} and correr_com(carrinho=[("Café", 3, 3.40), ("Azeite", 2, 7.5)])["unidades_por_categoria"] == {"Mercearia": 5}',
            actualExpr: 'unidades_por_categoria',
            hint: 'categoria = categorias[produto] e unidades_por_categoria[categoria] = unidades_por_categoria.get(categoria, 0) + quantidade.',
          },
          {
            label: 'produtos_caros (preço acima de 2 €)',
            expr: 'produtos_caros == ["Azeite", "Café", "Queijo"] and correr_com(carrinho=[("Leite", 1, 0.89), ("Queijo", 1, 4.90)])["produtos_caros"] == ["Queijo"]',
            actualExpr: 'produtos_caros',
            hint: 'Dentro do ciclo: if preco > 2: produtos_caros.append(produto).',
          },
        ],
      },
      quiz: {
        question:
          'O teu código passa com o carrinho de exemplo mas falha com outro carrinho. Qual é a causa mais provável?',
        options: [
          'O Python arredonda de forma diferente consoante o carrinho.',
          'Algum valor foi escrito à mão em vez de calculado a partir dos dados.',
          'O carrinho novo tem demasiados produtos para um ciclo for.',
          'Os dicionários perdem a ordem quando o carrinho muda.',
        ],
        correctIndex: 1,
        explanation:
          'Se um resultado está escrito à mão (total = 23.05), só acerta no exemplo. Calcular tudo a partir de carrinho faz o código funcionar com quaisquer dados.',
      },
    },
    {
      id: 'py-10-caixa-csv',
      code: '12',
      title: 'Projeto Caixa Registadora sobre vendas.csv',
      lede: 'Chegou o momento de juntar tudo: ler as 5 078 linhas reais de dados/vendas.csv em Python puro e responder às 4 perguntas da gerência.',
      analogyTitle: 'O fecho anual do livro-caixa com folha de conferência',
      analogyBody:
        'Imagina um caderno com 5 078 talões do ano inteiro e duas folhas de rascunho ao lado: numa somas as unidades por artigo, noutra os euros por dia. A cada talão que viras atualizas as duas folhas — no fim, os quatro totais servem de folha de conferência para validar o que vais fazer em SQL e Pandas.',
      concepts: [
        'csv.DictReader(f) lê o cabeçalho na primeira linha e devolve cada venda como um dicionário.',
        'Em vendas.csv todas as colunas vêm como texto: converte sempre int(linha["quantidade"]) e float(linha["preco"]).',
        'Os 4 valores oficiais da semente 42 servem de prova real entre Python, SQL e Pandas.',
      ],
      referenceTitle: 'Leitura de CSV na biblioteca padrão',
      referenceRows: [
        {
          syntax: 'with open(p, encoding="utf-8") as f:',
          meaning: 'Abre ficheiro UTF-8 e fecha no fim',
          example: 'with open("dados/vendas.csv", encoding="utf-8") as f:',
        },
        {
          syntax: 'csv.DictReader(f)',
          meaning: 'Lê linhas como dicionários por coluna',
          example: 'vendas = list(csv.DictReader(f))',
        },
        {
          syntax: 'max(d, key=d.get)',
          meaning: 'Obtém chave com maior valor acumulado',
          example: 'dia_topo = max(por_dia, key=por_dia.get)',
        },
      ],
      engine: 'python',
      exampleCode: `import csv

with open("dados/vendas.csv", encoding="utf-8") as f:
    vendas = list(csv.DictReader(f))

print("Total de linhas carregadas:", len(vendas))
print("Primeira venda:", vendas[0])`,
      pythonChallenge: {
        description:
          'Implementa a Caixa Registadora completa (src/caixa.py): calcula faturacao_total, produto_campeao (em unidades), melhor_dia (data com maior faturação) e media_linha sobre dados/vendas.csv.',
        starterCode: `import csv

with open("dados/vendas.csv", encoding="utf-8") as f:
    vendas = list(csv.DictReader(f))

faturacao_total = 0.0
unidades_por_produto = {}
faturacao_por_dia = {}

# Percorre vendas e acumula os valores pedidos:


produto_campeao = None
melhor_dia = None
media_linha = None

print(f"Faturação: {faturacao_total:.2f} €")
print("Mais vendido (un.):", produto_campeao)
print("Dia recorde:", melhor_dia)
print(f"Média por linha: {media_linha:.2f} €" if media_linha else "Por calcular")`,
        solutionCode: `import csv

with open("dados/vendas.csv", encoding="utf-8") as f:
    vendas = list(csv.DictReader(f))

faturacao_total = 0.0
unidades_por_produto = {}
faturacao_por_dia = {}

for v in vendas:
    qtd = int(v["quantidade"])
    sub = qtd * float(v["preco"])
    faturacao_total += sub
    prod = v["produto"]
    dia = v["data"]
    unidades_por_produto[prod] = unidades_por_produto.get(prod, 0) + qtd
    faturacao_por_dia[dia] = faturacao_por_dia.get(dia, 0.0) + sub

produto_campeao = max(unidades_por_produto, key=unidades_por_produto.get)
melhor_dia = max(faturacao_por_dia, key=faturacao_por_dia.get)
media_linha = faturacao_total / len(vendas)

print(f"Faturação: {faturacao_total:.2f} €")
print("Mais vendido (un.):", produto_campeao)
print("Dia recorde:", melhor_dia)
print(f"Média por linha: {media_linha:.2f} €")`,
        checks: [
          {
            label: 'faturacao_total (26902.89 €)',
            expr: 'math.isclose(faturacao_total, 26902.89, abs_tol=0.02)',
            actualExpr: 'round(faturacao_total, 2)',
            hint: 'Soma int(v["quantidade"]) * float(v["preco"]).',
          },
          {
            label: 'produto_campeao ("Leite")',
            expr: 'produto_campeao == "Leite"',
            actualExpr: 'produto_campeao',
            hint: 'Soma a quantidade por produto e tira max(..., key=....get).',
          },
          {
            label: 'melhor_dia ("2025-09-14")',
            expr: 'melhor_dia == "2025-09-14"',
            actualExpr: 'melhor_dia',
            hint: 'Soma a faturação por v["data"] e obtém a data com maior soma.',
          },
          {
            label: 'media_linha (~5.30 €)',
            expr: 'isinstance(media_linha, (int, float)) and math.isclose(media_linha, 26902.89 / 5078, abs_tol=0.01)',
            actualExpr: 'round(media_linha, 4) if media_linha else None',
            hint: 'Divide faturacao_total por len(vendas).',
          },
        ],
      },
      quiz: {
        question: 'Qual o produto que mais unidades vendeu em 2025 e qual o que mais euros faturou na Mercearia?',
        options: [
          'Pão em unidades e Leite em euros',
          'Leite em unidades e Azeite em euros',
          'Azeite em unidades e em euros',
          'Leite em unidades e em euros',
        ],
        correctIndex: 1,
        explanation:
          'O Leite lidera em quantidade (960 unidades), mas o Azeite (a 7,50 € cada) lidera, de longe, em faturação.',
      },
    },
  ],
};
