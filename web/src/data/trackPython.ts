import type { Track } from './types';

export const pythonTrack: Track = {
  id: 'python',
  shortTitle: '1. Python',
  fullTitle: 'Python do Zero Absoluto à Caixa Registadora',
  summary: 'Pensamento computacional desde a primeira linha de código até à leitura e validação real das 5 078 vendas da Mercearia.',
  engineLabel: 'Python 3.12 (Pyodide)',
  lessons: [
    {
      id: 'py-00-pensamento',
      code: '00',
      title: 'Ponto Zero: como o computador pensa e o que faz um Analista',
      lede: 'Nunca programaste na vida? Começa aqui. Programar não é saber matemática difícil: é dar instruções claras, uma por linha, a um ajudante muito rápido mas literal.',
      analogyTitle: 'Ensinar um estagiário no primeiro dia na Mercearia',
      analogyBody: 'Se disseres a uma pessoa "faz as contas do dia", ela percebe. Mas um computador precisa da receita exata: 1) abre o caderno de vendas, 2) multiplica a quantidade pelo preço de cada linha, 3) soma tudo, 4) mostra o total no ecrã. Essa sequência de passos chama-se algoritmo.',
      concepts: [
        'Entrada (Input) -> Processamento (Regras e Contas) -> Saída (Resultado ou Gráfico): todo o trabalho de dados segue estas 3 etapas.',
        'Porque usamos Python, SQL, Pandas, Git e BI? SQL tira dados da base de dados; Python e Pandas limpam e automatizam; Git guarda o histórico; Power BI apresenta à direção.',
        'Errar faz parte do trabalho diário: até um analista sénior vê mensagens de erro todos os dias — a diferença é que lê a última linha do erro com calma para corrigir.',
      ],
      beginnerSteps: [
        'Olha para o editor à direita: cada linha numerada (1, 2, 3…) é executada de cima para baixo, pela ordem em que está escrita.',
        'Texto humano fica sempre dentro de aspas ("Pão"). Números para fazer contas ficam sem aspas (10 ou 0.25).',
        'Clica no botão âmbar "Executar e verificar" (ou prime Ctrl + Enter) para veres o computador obedecer em tempo real.',
      ],
      proPractice: 'Nas empresas, um Analista de Dados nunca faz contas manuais na calculadora: escreve um pequeno script documentado para que qualquer colega consiga auditar e repetir o cálculo um mês depois com novos dados.',
      commonPitfall: 'Ter medo de mexer no código! Aqui nada se estraga: se apagares tudo por engano, basta clicar em "Repor código" e volta ao estado inicial.',
      referenceTitle: 'As 5 ferramentas do teu percurso profissional',
      referenceRows: [
        { syntax: 'Python', meaning: 'Linguagem base para lógica, automação e leitura de ficheiros', example: 'total = 4 * 0.25' },
        { syntax: 'SQL', meaning: 'Linguagem universal para consultar bases de dados nas empresas', example: 'SELECT * FROM vendas;' },
        { syntax: 'Pandas', meaning: 'Biblioteca Python para cruzar e limpar milhões de linhas', example: 'df.groupby("produto").sum()' },
        { syntax: 'Git & BI', meaning: 'Controlo de versões no GitHub e dashboards executivos', example: 'git commit / DAX SUMX' },
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
        description: 'O teu primeiro programa: guarda na variável clientes_hoje o número 25 e na variável gasto_por_cliente o valor 4.50. Depois guarda em receita_dia a multiplicação das duas variáveis.',
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
          { label: 'clientes_hoje == 25', expr: 'clientes_hoje == 25', actualExpr: 'clientes_hoje', hint: 'Escreve 25 sem aspas.' },
          { label: 'gasto_por_cliente == 4.50', expr: 'isinstance(gasto_por_cliente, (int, float)) and math.isclose(gasto_por_cliente, 4.5)', actualExpr: 'gasto_por_cliente', hint: 'Escreve 4.50 (com ponto).' },
          { label: 'receita_dia == 112.5', expr: 'isinstance(receita_dia, (int, float)) and math.isclose(receita_dia, 112.5)', actualExpr: 'receita_dia', hint: 'Multiplica clientes_hoje * gasto_por_cliente.' },
        ],
      },
      quiz: {
        question: 'Qual é a principal razão pela qual um analista profissional escreve código em vez de alterar células manualmente numa folha de cálculo?',
        options: [
          'Apenas para parecer mais difícil.',
          'Porque o código fica documentado, auditável e pode ser reexecutado num segundo quando chegam 50 000 vendas novas.',
          'Porque folhas de cálculo não somam números.',
        ],
        correctIndex: 1,
        explanation: 'Reprodutibilidade e automação são o que separa uma tarefa manual demorada de engenharia/análise de dados profissional.',
      },
    },
    {
      id: 'py-01-sintaxe',
      code: '01',
      title: 'Sintaxe, print() e comentários',
      lede: 'Em Python cada linha é uma instrução direta e a indentação (espaços à esquerda) define os blocos de código.',
      analogyTitle: 'A lista de abertura da loja',
      analogyBody: 'O Python lê o teu ficheiro de cima para baixo como o funcionário que abre a mercearia: acende as luzes, abre a caixa e imprime o talão de teste. Tudo o que começa por cardinal (#) é uma nota a lápis na margem que o computador ignora.',
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
        description: 'Guarde na variável saudacao o texto exato "Bem-vindo à Mercearia" e na variável dobro_quinze o resultado de 15 * 2.',
        starterCode: `# Complete as duas variáveis abaixo
saudacao = None
dobro_quinze = None

print(saudacao, dobro_quinze)`,
        solutionCode: `saudacao = "Bem-vindo à Mercearia"
dobro_quinze = 15 * 2

print(saudacao, dobro_quinze)`,
        checks: [
          { label: 'saudacao', expr: 'saudacao == "Bem-vindo à Mercearia"', actualExpr: 'saudacao', hint: 'Escreva o texto exato entre aspas.' },
          { label: 'dobro_quinze', expr: 'dobro_quinze == 30 and isinstance(dobro_quinze, int)', actualExpr: 'dobro_quinze', hint: 'Multiplique 15 * 2.' },
        ],
      },
      quiz: {
        question: 'O que acontece se escreveres 0,25 com vírgula em vez de 0.25 com ponto em Python?',
        options: [
          'O Python converte automaticamente para número decimal.',
          'O Python interpreta a vírgula como separador e cria um tuplo (0, 25).',
          'O computador apaga a variável.',
        ],
        correctIndex: 1,
        explanation: 'Em Python os decimais usam sempre ponto (0.25). A vírgula separa elementos, criando o par (0, 25).',
      },
    },
    {
      id: 'py-02-variaveis',
      code: '02',
      title: 'Variáveis e tipos de dados (Semana 3)',
      lede: 'Uma variável guarda um valor com nome e tipo bem definidos: inteiros, decimais, texto ou booleanos.',
      analogyTitle: 'Frascos etiquetados na despensa',
      analogyBody: 'Uma variável é um frasco transparente com um rótulo colado fora. O sinal = não significa igualdade matemática: significa guardar o valor da direita dentro do frasco da esquerda.',
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
        description: 'Resolva o exercício oficial da Semana 3: preco_pao (0.25), quantidade (10), total (usando as variáveis), colado ("22"), somado (4) e nome_loja ("Mercearia do Bairro").',
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
          { label: 'preco_pao', expr: 'isinstance(preco_pao, (int, float)) and math.isclose(preco_pao, 0.25, abs_tol=0.005)', actualExpr: 'preco_pao', hint: '25 cêntimos escrevem-se 0.25.' },
          { label: 'quantidade', expr: 'quantidade == 10 and isinstance(quantidade, int)', actualExpr: 'quantidade', hint: 'Use o inteiro 10 sem aspas.' },
          { label: 'total', expr: 'isinstance(total, (int, float)) and math.isclose(total, 2.5, abs_tol=0.005)', actualExpr: 'total', hint: 'Multiplique preco_pao * quantidade.' },
          { label: 'colado', expr: 'colado == "22"', actualExpr: 'colado', hint: 'Some os textos "2" + "2".' },
          { label: 'somado', expr: 'somado == 4 and isinstance(somado, int)', actualExpr: 'somado', hint: 'Converta com int("2") + int("2").' },
          { label: 'nome_loja', expr: 'nome_loja == "Mercearia do Bairro"', actualExpr: 'nome_loja', hint: 'Respeite maiúsculas e espaços.' },
        ],
      },
      quiz: {
        question: 'Qual é o resultado da expressão type("0.89") em Python?',
        options: ['float', 'str', 'int'],
        correctIndex: 1,
        explanation: 'Qualquer sequência rodeada por aspas é texto (str), mesmo que contenha algarismos.',
      },
    },
    {
      id: 'py-03-strings-conversoes',
      code: '03',
      title: 'Texto, limpeza, conversões e f-strings (Semana 4)',
      lede: 'Dados reais chegam como texto com espaços a mais ou casas decimais compridas; limpar e formatar texto é pão nosso do analista.',
      analogyTitle: 'O leitor de código de barras e a impressora de talões',
      analogyBody: 'O teclado e os ficheiros CSV entregam etiquetas de papel (str). Para calcular o troco transformas papel em moedas com float(); para imprimir o talão formatado a duas casas decimais usas uma f-string com :.2f.',
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
        description: 'Complete o exercício da Semana 4: converta valor_pago_texto ("20") em número, calcule o troco para total_compra = 13.75, crie mensagem ("Troco: 6.25 €") e mensagem_divisao ("Preço por pessoa: 4.58 €").',
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
          { label: 'valor_pago', expr: 'isinstance(valor_pago, (int, float)) and math.isclose(valor_pago, 20.0)', actualExpr: 'valor_pago', hint: 'Use float(valor_pago_texto).' },
          { label: 'troco', expr: 'isinstance(troco, (int, float)) and math.isclose(troco, 6.25)', actualExpr: 'troco', hint: 'Subtraia valor_pago - total_compra.' },
          { label: 'mensagem', expr: 'mensagem == "Troco: 6.25 €"', actualExpr: 'mensagem', hint: 'Use f"Troco: {troco} €" ou {troco:.2f}.' },
          { label: 'mensagem_divisao', expr: 'mensagem_divisao == "Preço por pessoa: 4.58 €"', actualExpr: 'mensagem_divisao', hint: 'Use {total_compra / 3:.2f} dentro da f-string.' },
        ],
      },
      quiz: {
        question: 'Em dados/vendas_sujas.csv aparece o preço "2,35". Qual a forma correta de o converter em float?',
        options: [
          'float("2,35")',
          'float("2,35".replace(",", "."))',
          'int("2,35")',
        ],
        correctIndex: 1,
        explanation: 'float("2,35") lança ValueError porque o Python exige ponto decimal. Primeiro substitui-se a vírgula por ponto.',
      },
    },
    {
      id: 'py-04-condicoes',
      code: '04',
      title: 'Comparações e condições if / elif / else (Semana 5)',
      lede: 'As estruturas condicionais permitem aplicar escalões de desconto, regras de entrega e validações de qualidade.',
      analogyTitle: 'O tapete separador de fruta',
      analogyBody: 'As maçãs descem por uma calha com cancelas por tamanho: se passa na primeira abertura cai logo no cesto pequeno; só o que não caiu segue para o elif seguinte, e o resto acaba no else.',
      concepts: [
        'Use == para comparar igualdade (dois sinais de igual) e != para diferente.',
        'Combine regras de negócio com and (ambas verdadeiras) e or (basta uma verdadeira).',
        'Assim que um ramo if ou elif é verdadeiro, o Python ignora todos os restantes ramos desse bloco.',
      ],
      referenceTitle: 'Operadores de comparação e lógica',
      referenceRows: [
        { syntax: 'a == b / a != b', meaning: 'Igual a / Diferente de', example: 'cidade == "Porto"' },
        { syntax: 'a >= b / a <= b', meaning: 'Maior ou igual / Menor ou igual', example: 'idade >= 18' },
        { syntax: 'cond1 and cond2', meaning: 'Verdadeiro só se ambas cumprirem', example: 'total > 30 and cidade == "Porto"' },
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
        description: 'Resolva a Semana 5: escalão desconto_pct (até 20 -> 0, até 50 -> 5, acima -> 10) para total = 37.5, total_final após desconto, pode_entrar (idade 17 >= 18) e entrega_gratis (total > 30 e cidade == "Porto").',
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
          { label: 'desconto_pct', expr: 'desconto_pct == 5', actualExpr: 'desconto_pct', hint: '37.5 fica entre 20 e 50, logo recebe 5.' },
          { label: 'total_final', expr: 'isinstance(total_final, (int, float)) and math.isclose(total_final, 35.625, abs_tol=0.005)', actualExpr: 'total_final', hint: 'Calcule total - total * desconto_pct / 100.' },
          { label: 'pode_entrar', expr: 'pode_entrar is False', actualExpr: 'pode_entrar', hint: 'idade >= 18 devolve False para 17.' },
          { label: 'entrega_gratis', expr: 'entrega_gratis is True', actualExpr: 'entrega_gratis', hint: 'Use total > 30 and cidade == "Porto".' },
        ],
      },
      quiz: {
        question: 'Porque é que if preco = 7.50: dá SyntaxError em Python?',
        options: [
          'Porque falta converter 7.50 para inteiro.',
          'Porque um único = atribui valor; para comparar igualdade usa-se ==.',
          'Porque if não aceita números decimais.',
        ],
        correctIndex: 1,
        explanation: 'Em Python = guarda um valor numa variável, enquanto == compara dois valores.',
      },
    },
    {
      id: 'py-05-ciclo-for',
      code: '05',
      title: 'Ciclo for e range() (Semana 6)',
      lede: 'O ciclo for percorre cada artigo de uma lista ou intervalo numérico sem repetir linhas de código.',
      analogyTitle: 'Passar artigo a artigo no tapete da caixa',
      analogyBody: 'Não constróis uma caixa registadora diferente para um cesto de 3 ou de 50 artigos: passas um artigo de cada vez pelo mesmo leitor até o tapete ficar vazio.',
      concepts: [
        'for venda in vendas: executa o bloco indentado uma vez por cada elemento da lista.',
        'range(1, 101) gera números de 1 até 100 (o limite direito fica sempre de fora).',
        'Padrão do máximo: começas com maior = vendas[0] e atualizas sempre que v > maior.',
      ],
      referenceTitle: 'Padrões essenciais com ciclo for',
      referenceRows: [
        { syntax: 'for item in lista:', meaning: 'Percorre todos os valores', example: 'for v in vendas:' },
        { syntax: 'range(inicio, fim)', meaning: 'Sequência de inicio até fim - 1', example: 'range(1, 101)' },
        { syntax: 'enumerate(lista, 1)', meaning: 'Índice e valor em simultâneo', example: 'for pos, v in enumerate(vendas, 1):' },
      ],
      engine: 'python',
      exampleCode: `vendas = [120, 80, 250, 40, 100, 310]
acima_100 = 0
for v in vendas:
    if v > 100:
        acima_100 += 1

print("Vendas superiores a 100 EUR:", acima_100)`,
      pythonChallenge: {
        description: 'Resolva a Semana 6 com ciclos for: soma_1_a_100 (1 a 100 inclusive), quantas_acima_100, maior_venda em vendas = [120, 80, 250, 40, 100, 310] e lista descontos para totais = [15, 37.5, 80].',
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
          { label: 'soma_1_a_100', expr: 'soma_1_a_100 == 5050', actualExpr: 'soma_1_a_100', hint: 'Use range(1, 101) para incluir o 100.' },
          { label: 'quantas_acima_100', expr: 'quantas_acima_100 == 3', actualExpr: 'quantas_acima_100', hint: 'Use v > 100 (120, 250 e 310).' },
          { label: 'maior_venda', expr: 'maior_venda == 310', actualExpr: 'maior_venda', hint: 'Se v > maior_venda, atualize maior_venda = v.' },
          { label: 'descontos', expr: 'descontos == [0, 5, 10]', actualExpr: 'descontos', hint: 'Use descontos.append(...) para cada valor de totais.' },
        ],
      },
      quiz: {
        question: 'Quantos números gera range(1, 5)?',
        options: ['5 números (1, 2, 3, 4, 5)', '4 números (1, 2, 3, 4)', '3 números (2, 3, 4)'],
        correctIndex: 1,
        explanation: 'O limite superior em range(inicio, fim) é exclusivo: pára imediatamente antes do 5.',
      },
    },
    {
      id: 'py-06-while',
      code: '06',
      title: 'Ciclo while e acumuladores (Semana 7)',
      lede: 'Quando não sabemos à partida quantas voltas serão precisas até atingir uma meta, usamos while.',
      analogyTitle: 'O mealheiro semanal da mercearia',
      analogyBody: 'O ciclo for sabe quantas faturas há na gaveta; o ciclo while continua a juntar moedas todas as semanas enquanto o saldo for inferior a 500 euros.',
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
        description: 'Resolva a Semana 7: calcule total_vendas e media_vendas para [120, 80, 250, 40, 100, 310], e com while conte quantas semanas demora um saldo inicial de 100 € (poupando 35 €/semana) a chegar a 500 € ou mais, guardando saldo_final.',
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
          { label: 'total_vendas', expr: 'math.isclose(total_vendas, 900)', actualExpr: 'total_vendas', hint: 'Some cada venda num acumulador.' },
          { label: 'media_vendas', expr: 'isinstance(media_vendas, (int, float)) and math.isclose(media_vendas, 150)', actualExpr: 'media_vendas', hint: 'Divida total_vendas por len(vendas).' },
          { label: 'semanas', expr: 'semanas == 12', actualExpr: 'semanas', hint: 'Enquanto saldo < 500, some 35 ao saldo e 1 às semanas.' },
          { label: 'saldo_final', expr: 'isinstance(saldo_final, (int, float)) and math.isclose(saldo_final, 520)', actualExpr: 'saldo_final', hint: 'Guarde saldo_final = saldo após o ciclo.' },
        ],
      },
      quiz: {
        question: 'Se inicializares total = 0 DENTRO do ciclo for em vez de fora, o que acontece?',
        options: [
          'O programa corre mais depressa.',
          'O acumulador volta a zero em todas as voltas e guarda apenas o último valor.',
          'O Python soma na mesma.',
        ],
        correctIndex: 1,
        explanation: 'Inicializar dentro do ciclo esvazia o mealheiro a cada volta.',
      },
    },
    {
      id: 'py-07-listas-colecoes',
      code: '07',
      title: 'Listas, fatias e compreensão de listas (Semana 8)',
      lede: 'Domina indexação, slicing, ordenação e list comprehensions para transformar colunas inteiras numa linha.',
      analogyTitle: 'As prateleiras numeradas a partir do zero',
      analogyBody: 'Em Python a primeira prateleira é a posição 0 e a última pode ser lida diretamente com -1. Podes recortar uma fatia inteira da prateleira com lista[inicio:fim].',
      concepts: [
        'lista[0] lê o primeiro item, lista[-1] lê o último e lista[:3] devolve os 3 primeiros.',
        'sorted(lista, reverse=True) devolve uma nova lista ordenada do maior para o menor sem destruir a original.',
        '[p for p in precos if p > 1.50] filtra valores de forma concisa e legível.',
      ],
      referenceTitle: 'Operações de listas e sets (W3Schools)',
      referenceRows: [
        { syntax: 'lista[:3]', meaning: 'Fatia com os primeiros 3 itens', example: 'produtos[:3]' },
        { syntax: 'sorted(lista, reverse=True)', meaning: 'Nova lista ordenada descendente', example: 'sorted(precos, reverse=True)' },
        { syntax: '[x for x in l if cond]', meaning: 'Compreensão de lista com filtro', example: '[p for p in precos if p > 1.5]' },
        { syntax: 'set(lista)', meaning: 'Remove valores duplicados', example: 'len(set(cidades))' },
      ],
      engine: 'python',
      exampleCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Azeite", "Café"]
precos = [0.25, 0.89, 2.35, 1.20, 7.50, 3.40]

print("Top 3 mais caros:", sorted(precos, reverse=True)[:3])
print("Com IVA 6%:", [round(p * 1.06, 2) for p in precos])`,
      pythonChallenge: {
        description: 'Complete a Semana 8: primeiro produto, ultimo produto, fatia tres_primeiros, precos_caros (> 1.50 €) e precos_desc ordenados do maior para o menor.',
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
          { label: 'primeiro', expr: 'primeiro == "Pão"', actualExpr: 'primeiro', hint: 'Use produtos[0].' },
          { label: 'ultimo', expr: 'ultimo == "Café"', actualExpr: 'ultimo', hint: 'Use produtos[-1].' },
          { label: 'tres_primeiros', expr: 'tres_primeiros == ["Pão", "Leite", "Ovos (dúzia)"]', actualExpr: 'tres_primeiros', hint: 'Use produtos[:3].' },
          { label: 'precos_caros', expr: 'precos_caros == [2.35, 7.5, 3.4]', actualExpr: 'precos_caros', hint: 'Filtre com [p for p in precos if p > 1.50].' },
          { label: 'precos_desc', expr: 'precos_desc == [7.5, 3.4, 2.35, 1.2, 0.89, 0.25]', actualExpr: 'precos_desc', hint: 'Use sorted(precos, reverse=True).' },
        ],
      },
      quiz: {
        question: 'Qual a diferença entre lista.sort() e sorted(lista)?',
        options: [
          'Nenhuma, devolvem exatamente o mesmo.',
          'lista.sort() altera a lista original e devolve None; sorted(lista) cria e devolve uma nova lista ordenada.',
          'sorted() só funciona com texto.',
        ],
        correctIndex: 1,
        explanation: 'Guardar x = lista.sort() deixa x a valer None. Para guardar numa variável nova usa-se sorted(lista).',
      },
    },
    {
      id: 'py-08-dicionarios',
      code: '08',
      title: 'Dicionários e agrupamento por chave (Semana 9)',
      lede: 'Os dicionários associam chaves únicas a valores, funcionando como tabelas de consulta rápida e acumuladores por categoria.',
      analogyTitle: 'O preçário afixado na parede',
      analogyBody: 'Em vez de procurar a posição numérica de cada artigo, apontas para a etiqueta "Azeite" e lês imediatamente 7.50. E com .get(chave, 0) somas vendas por artigo sem erro na primeira ocorrência.',
      concepts: [
        'precos["Azeite"] acede diretamente ao valor da chave "Azeite".',
        'precos.get("Chocolate", 0.0) evita KeyError quando a chave ainda não existe.',
        'max(totais, key=totais.get) descobre a chave com maior soma acumulada.',
      ],
      referenceTitle: 'Métodos de dicionário (W3Schools)',
      referenceRows: [
        { syntax: 'd[chave] = valor', meaning: 'Cria ou atualiza um par chave-valor', example: 'precos["Sumo"] = 1.75' },
        { syntax: 'd.get(k, 0)', meaning: 'Lê valor ou devolve 0 se não existir', example: 'totais.get(prod, 0) + qtd' },
        { syntax: 'for k, v in d.items():', meaning: 'Percorre chaves e valores juntos', example: 'print(k, v)' },
        { syntax: 'max(d, key=d.get)', meaning: 'Chave com o valor máximo', example: 'campeao = max(totais, key=totais.get)' },
      ],
      engine: 'python',
      exampleCode: `vendas_amostra = [("Leite", 3), ("Pão", 10), ("Leite", 4), ("Café", 2)]
unidades = {}
for prod, qtd in vendas_amostra:
    unidades[prod] = unidades.get(prod, 0) + qtd

print("Contagem:", unidades)
print("Mais vendido:", max(unidades, key=unidades.get))`,
      pythonChallenge: {
        description: 'Resolva a Semana 9: obtenha preco_azeite, use .get() para preco_chocolate (0.0), acumule unidades_por_produto e calcule total_talao.',
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
          { label: 'preco_azeite', expr: 'preco_azeite == 7.5', actualExpr: 'preco_azeite', hint: 'Consulte precos["Azeite"].' },
          { label: 'preco_chocolate', expr: 'preco_chocolate == 0.0', actualExpr: 'preco_chocolate', hint: 'Use precos.get("Chocolate", 0.0).' },
          { label: 'unidades_por_produto', expr: 'unidades_por_produto == {"Pão": 6, "Leite": 2, "Café": 1, "Azeite": 1}', actualExpr: 'unidades_por_produto', hint: 'Some qtd por chave com .get(prod, 0).' },
          { label: 'total_talao', expr: 'math.isclose(total_talao, 14.18, abs_tol=0.005)', actualExpr: 'total_talao', hint: 'Some qtd * precos[prod] em cada linha.' },
        ],
      },
      quiz: {
        question: 'Em Python, que operação SQL equivale a somar quantidades num dicionário indexado por produto?',
        options: ['ORDER BY produto', 'GROUP BY produto com SUM(quantidade)', 'LEFT JOIN produtos'],
        correctIndex: 1,
        explanation: 'Cada chave única do dicionário forma um grupo, exatamente como o GROUP BY em SQL.',
      },
    },
    {
      id: 'py-09-funcoes',
      code: '09',
      title: 'Funções reutilizáveis e return (Semana 10)',
      lede: 'Organizar cálculos e limpezas em funções torna os scripts testáveis, legíveis e livres de código duplicado.',
      analogyTitle: 'As teclas rápidas da balança',
      analogyBody: 'Quando programas uma função com def, ensinas uma receita nova ao Python. Sempre que chamas a função com ingredientes novos, o return entrega o resultado calculado.',
      concepts: [
        'def nome(param1, param2=padrao): define parâmetros obrigatórios e opcionais.',
        'return devolve o valor para quem chamou a função e termina a execução dessa função.',
        'Funções pequenas com um único objetivo são a base de pipelines de dados limpos.',
      ],
      referenceTitle: 'Anatomia de funções em Python',
      referenceRows: [
        { syntax: 'def fn(a, b=0):', meaning: 'Define função com parâmetro opcional', example: 'def aplicar_iva(v, taxa=0.23):' },
        { syntax: 'return valor', meaning: 'Devolve resultado ao chamador', example: 'return round(q * p, 2)' },
        { syntax: 'lambda x: x[1]', meaning: 'Função anónima curta para ordenação', example: 'sorted(d.items(), key=lambda x: x[1])' },
      ],
      engine: 'python',
      exampleCode: `def limpar_preco(texto):
    valor = float(str(texto).strip().replace(",", "."))
    return valor if valor > 0 else None

amostras = ["0.25", " 2,35 ", "-1.00"]
print([limpar_preco(x) for x in amostras])`,
      pythonChallenge: {
        description: 'Implemente as 3 funções da Semana 10: calcular_subtotal(quantidade, preco), limpar_nome_produto(texto) e aplicar_iva(valor, taxa=0.23).',
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
          { label: 'calcular_subtotal(3, 0.89)', expr: 'callable(calcular_subtotal) and calcular_subtotal(3, 0.89) == 2.67', actualExpr: 'calcular_subtotal(3, 0.89)', hint: 'Devolva round(quantidade * preco, 2).' },
          { label: 'limpar_nome_produto("  pão ")', expr: 'callable(limpar_nome_produto) and limpar_nome_produto("  pão ") == "Pão"', actualExpr: 'limpar_nome_produto("  pão ")', hint: 'Use texto.strip().capitalize().' },
          { label: 'aplicar_iva(10.0)', expr: 'callable(aplicar_iva) and aplicar_iva(10.0) == 12.3 and aplicar_iva(10.0, 0.06) == 10.6', actualExpr: 'aplicar_iva(10.0)', hint: 'Devolva round(valor * (1 + taxa), 2).' },
        ],
      },
      quiz: {
        question: 'O que devolve uma função em Python se nos esquecermos de escrever a instrução return?',
        options: ['0', 'None', 'Erro de sintaxe'],
        correctIndex: 1,
        explanation: 'Sem return explícito, qualquer função Python devolve automaticamente None.',
      },
    },
    {
      id: 'py-10-caixa-csv',
      code: '10',
      title: 'Projeto Caixa Registadora sobre vendas.csv (Semanas 11 e 12)',
      lede: 'Chegou o momento de juntar tudo: ler as 5 078 linhas reais de dados/vendas.csv em Python puro e responder às 4 perguntas da gerência.',
      analogyTitle: 'O fecho anual de contas da Mercearia',
      analogyBody: 'Os ficheiros CSV reais do projeto já estão montados nesta bancada em dados/vendas.csv. Com csv.DictReader, int(), float() e dicionários acumuladores, vais obter os números exatos que depois confirmarás em SQL!',
      concepts: [
        'csv.DictReader(f) lê o cabeçalho na primeira linha e devolve cada venda como um dicionário.',
        'Em vendas.csv todas as colunas vêm como texto: converte sempre int(linha["quantidade"]) e float(linha["preco"]).',
        'Os 4 valores oficiais da semente 42 servem de prova real entre Python, SQL e Pandas.',
      ],
      referenceTitle: 'Leitura de CSV na biblioteca padrão',
      referenceRows: [
        { syntax: 'with open(p, encoding="utf-8") as f:', meaning: 'Abre ficheiro UTF-8 e fecha no fim', example: 'with open("dados/vendas.csv", encoding="utf-8") as f:' },
        { syntax: 'csv.DictReader(f)', meaning: 'Lê linhas como dicionários por coluna', example: 'vendas = list(csv.DictReader(f))' },
        { syntax: 'max(d, key=d.get)', meaning: 'Obtém chave com maior valor acumulado', example: 'dia_topo = max(por_dia, key=por_dia.get)' },
      ],
      engine: 'python',
      exampleCode: `import csv

with open("dados/vendas.csv", encoding="utf-8") as f:
    vendas = list(csv.DictReader(f))

print("Total de linhas carregadas:", len(vendas))
print("Primeira venda:", vendas[0])`,
      pythonChallenge: {
        description: 'Implemente a Caixa Registadora completa (src/caixa.py): calcule faturacao_total, produto_campeao (em unidades), melhor_dia (data com maior faturação) e media_linha sobre dados/vendas.csv.',
        starterCode: `import csv

with open("dados/vendas.csv", encoding="utf-8") as f:
    vendas = list(csv.DictReader(f))

faturacao_total = 0.0
unidades_por_produto = {}
faturacao_por_dia = {}

# Percorra vendas e acumule os valores pedidos:


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
          { label: 'faturacao_total (26902.89 €)', expr: 'math.isclose(faturacao_total, 26902.89, abs_tol=0.02)', actualExpr: 'round(faturacao_total, 2)', hint: 'Some int(v["quantidade"]) * float(v["preco"]).' },
          { label: 'produto_campeao ("Leite")', expr: 'produto_campeao == "Leite"', actualExpr: 'produto_campeao', hint: 'Some a quantidade por produto e tire max(..., key=....get).' },
          { label: 'melhor_dia ("2025-09-14")', expr: 'melhor_dia == "2025-09-14"', actualExpr: 'melhor_dia', hint: 'Some a faturação por v["data"] e obtenha a data com maior soma.' },
          { label: 'media_linha (~5.30 €)', expr: 'isinstance(media_linha, (int, float)) and math.isclose(media_linha, 26902.89 / 5078, abs_tol=0.01)', actualExpr: 'round(media_linha, 4) if media_linha else None', hint: 'Divida faturacao_total por len(vendas).' },
        ],
      },
      quiz: {
        question: 'Qual o produto que mais unidades vendeu em 2025 e qual o que mais euros faturou na Mercearia?',
        options: [
          'Pão em unidades e Leite em euros',
          'Leite em unidades (960 un.) e Azeite em euros (6 262,50 €)',
          'Azeite em ambos',
        ],
        correctIndex: 1,
        explanation: 'O Leite lidera em quantidade (960 unidades), mas o Azeite (a 7,50 € cada) lidera destacadamente em faturação!',
      },
    },
  ],
};
