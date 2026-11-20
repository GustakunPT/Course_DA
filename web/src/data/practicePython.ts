// Exercícios de treino da trilha Python: repetem o conceito de cada etapa com outros dados.
// São opcionais: o progresso da etapa continua a depender só do desafio principal.
// As verificações com correr_com(...) voltam a correr o código com outros valores,
// por isso só passa quem escreve a lógica (e não o resultado à mão).
import type { PythonChallengeSpec } from './types';

export const pythonPractice: Record<string, PythonChallengeSpec[]> = {
  'py-01-sintaxe': [
    {
      title: 'Talão do café',
      description:
        'Guarda em cafes o número 3 e em preco_cafe o valor 0.70. Guarda em total_cafes a multiplicação das duas variáveis e mostra-o com print().',
      starterCode: `# Escreve aqui o teu código
cafes = None
preco_cafe = None
total_cafes = None
`,
      solutionCode: `cafes = 3
preco_cafe = 0.70
total_cafes = cafes * preco_cafe
print(total_cafes)`,
      checks: [
        {
          label: 'cafes = 3 e preco_cafe = 0.70',
          expr: 'cafes == 3 and math.isclose(preco_cafe, 0.70)',
          actualExpr: '(cafes, preco_cafe)',
          hint: 'Números decimais usam ponto: 0.70.',
        },
        {
          label: 'total_cafes calculado a partir das variáveis',
          expr: 'math.isclose(total_cafes, 2.10) and math.isclose(correr_com(cafes=5)["total_cafes"], 3.50)',
          actualExpr: 'total_cafes',
          hint: 'Escreve total_cafes = cafes * preco_cafe (e não o número 2.1 à mão).',
        },
      ],
    },
    {
      title: 'Cartaz da porta',
      description: 'Guarda em horario o texto exato "Aberto das 8h às 20h" e em horas_abertas o resultado de 20 - 8.',
      starterCode: `horario = None
horas_abertas = None
print(horario, horas_abertas)`,
      solutionCode: `horario = "Aberto das 8h às 20h"
horas_abertas = 20 - 8
print(horario, horas_abertas)`,
      checks: [
        {
          label: 'horario com o texto exato',
          expr: 'horario == "Aberto das 8h às 20h"',
          actualExpr: 'horario',
          hint: 'O texto vai entre aspas e tem de ser igual, incluindo acentos e maiúsculas.',
        },
        {
          label: 'horas_abertas = 12 (número inteiro)',
          expr: 'horas_abertas == 12 and isinstance(horas_abertas, int)',
          actualExpr: 'horas_abertas',
          hint: 'Sem aspas: 20 - 8 é uma conta, "20 - 8" seria texto.',
        },
      ],
    },
  ],
  'py-02-variaveis': [
    {
      title: 'Tipos à prova',
      description:
        'Guarda em tipo_preco o tipo de 2.35, em tipo_qtd o tipo de 4 e em tipo_codigo o tipo de "4". Usa type(...).__name__ para obter o nome do tipo em texto.',
      starterCode: `tipo_preco = None
tipo_qtd = None
tipo_codigo = None
print(tipo_preco, tipo_qtd, tipo_codigo)`,
      solutionCode: `tipo_preco = type(2.35).__name__
tipo_qtd = type(4).__name__
tipo_codigo = type("4").__name__
print(tipo_preco, tipo_qtd, tipo_codigo)`,
      checks: [
        {
          label: 'tipo_preco = "float"',
          expr: 'tipo_preco == "float"',
          actualExpr: 'tipo_preco',
          hint: 'type(2.35).__name__ dá o nome do tipo.',
        },
        {
          label: 'tipo_qtd = "int" e tipo_codigo = "str"',
          expr: 'tipo_qtd == "int" and tipo_codigo == "str"',
          actualExpr: '(tipo_qtd, tipo_codigo)',
          hint: 'Com aspas, "4" é texto (str), mesmo tendo só algarismos.',
        },
      ],
    },
    {
      title: 'Cesto da fruta',
      description:
        'Guarda em kg_macas o valor 1.5 e em preco_kg o valor 2.10. Guarda em custo o preço do cesto (kg_macas * preco_kg) e em custo_arredondado o custo com round(..., 2).',
      starterCode: `kg_macas = 1.5
preco_kg = 2.10
custo = None
custo_arredondado = None
print(custo, custo_arredondado)`,
      solutionCode: `kg_macas = 1.5
preco_kg = 2.10
custo = kg_macas * preco_kg
custo_arredondado = round(custo, 2)
print(custo, custo_arredondado)`,
      checks: [
        {
          label: 'custo_arredondado = 3.15',
          expr: 'custo_arredondado == 3.15',
          actualExpr: 'custo_arredondado',
          hint: 'round(custo, 2) arredonda a 2 casas decimais.',
        },
        {
          label: 'A conta usa as variáveis (2 kg a 2.50 € dá 5.0)',
          expr: 'correr_com(kg_macas=2, preco_kg=2.50)["custo_arredondado"] == 5.0',
          actualExpr: 'correr_com(kg_macas=2, preco_kg=2.50).get("custo_arredondado")',
          hint: 'Escreve custo = kg_macas * preco_kg.',
        },
      ],
    },
  ],
  'py-03-strings-conversoes': [
    {
      title: 'Preço sujo do CSV',
      description:
        'Em preco_texto tens " 3,40 " (com espaços e vírgula). Converte para número em preco e guarda em etiqueta o texto "Café: 3.40 €" com uma f-string (2 casas decimais).',
      starterCode: `preco_texto = " 3,40 "

preco = None
etiqueta = None
print(preco, etiqueta)`,
      solutionCode: `preco_texto = " 3,40 "

preco = float(preco_texto.strip().replace(",", "."))
etiqueta = f"Café: {preco:.2f} €"
print(preco, etiqueta)`,
      checks: [
        {
          label: 'preco = 3.4 (número)',
          expr: 'isinstance(preco, float) and math.isclose(preco, 3.4)',
          actualExpr: 'preco',
          hint: 'Primeiro .strip(), depois .replace(",", ".") e só no fim float(...).',
        },
        {
          label: 'etiqueta = "Café: 3.40 €"',
          expr: 'etiqueta == "Café: 3.40 €"',
          actualExpr: 'etiqueta',
          hint: 'Usa f"Café: {preco:.2f} €".',
        },
        {
          label: 'Funciona com outro preço (" 12,5 ")',
          expr: 'correr_com(preco_texto=" 12,5 ")["etiqueta"] == "Café: 12.50 €"',
          actualExpr: 'correr_com(preco_texto=" 12,5 ").get("etiqueta")',
          hint: 'Calcula a partir de preco_texto em vez de escrever 3.4 à mão.',
        },
      ],
    },
    {
      title: 'Nome do cliente',
      description:
        'Em nome_bruto tens "  ana SILVA ". Guarda em nome_limpo o nome sem espaços nas pontas e com cada palavra a começar por maiúscula (.title()), e em iniciais as duas iniciais ("AS").',
      starterCode: `nome_bruto = "  ana SILVA "

nome_limpo = None
iniciais = None
print(nome_limpo, iniciais)`,
      solutionCode: `nome_bruto = "  ana SILVA "

nome_limpo = nome_bruto.strip().title()
partes = nome_limpo.split()
iniciais = partes[0][0] + partes[-1][0]
print(nome_limpo, iniciais)`,
      checks: [
        {
          label: 'nome_limpo = "Ana Silva"',
          expr: 'nome_limpo == "Ana Silva"',
          actualExpr: 'nome_limpo',
          hint: 'nome_bruto.strip().title().',
        },
        {
          label: 'iniciais = "AS" e funciona com outro nome',
          expr: 'iniciais == "AS" and correr_com(nome_bruto=" rui costa ")["iniciais"] == "RC"',
          actualExpr: '(iniciais, correr_com(nome_bruto=" rui costa ").get("iniciais"))',
          hint: 'Usa .split() para separar as palavras e [0] para a primeira letra de cada uma.',
        },
      ],
    },
  ],
  'py-04-condicoes': [
    {
      title: 'Portes de envio',
      description:
        'Calcula portes para uma encomenda de total euros: até 15 € custa 3.50 €, até 40 € custa 1.50 € e acima de 40 € é grátis (0). Guarda em total_a_pagar o total mais os portes.',
      starterCode: `total = 22.0

portes = None
total_a_pagar = None
print(portes, total_a_pagar)`,
      solutionCode: `total = 22.0

if total <= 15:
    portes = 3.50
elif total <= 40:
    portes = 1.50
else:
    portes = 0

total_a_pagar = total + portes
print(portes, total_a_pagar)`,
      checks: [
        {
          label: 'portes = 1.50 e total_a_pagar = 23.5',
          expr: 'math.isclose(portes, 1.5) and math.isclose(total_a_pagar, 23.5)',
          actualExpr: '(portes, total_a_pagar)',
          hint: '22 € está entre 15 e 40.',
        },
        {
          label: 'Funciona nos limites (15, 40 e 41 €)',
          expr: '[correr_com(total=t)["portes"] for t in (15, 40, 41)] == [3.5, 1.5, 0]',
          actualExpr: '[correr_com(total=t).get("portes") for t in (15, 40, 41)]',
          hint: 'Usa <= nos limites: "até 15 €" inclui os 15.',
        },
      ],
    },
    {
      title: 'Cartão de cliente',
      description:
        'Um cliente tem desconto de 10% se tiver cartao (True/False) e compras_mes >= 4, ou se for funcionario. Guarda em tem_desconto o resultado (True/False).',
      starterCode: `cartao = True
compras_mes = 5
funcionario = False

tem_desconto = None
print(tem_desconto)`,
      solutionCode: `cartao = True
compras_mes = 5
funcionario = False

tem_desconto = (cartao and compras_mes >= 4) or funcionario
print(tem_desconto)`,
      checks: [
        {
          label: 'tem_desconto = True neste cliente',
          expr: 'tem_desconto is True',
          actualExpr: 'tem_desconto',
          hint: 'Junta as condições com and e or, com parênteses.',
        },
        {
          label: 'Funciona com outros clientes',
          expr: 'correr_com(compras_mes=3)["tem_desconto"] is False and correr_com(cartao=False, funcionario=True)["tem_desconto"] is True and correr_com(cartao=False)["tem_desconto"] is False',
          actualExpr:
            '(correr_com(compras_mes=3).get("tem_desconto"), correr_com(cartao=False, funcionario=True).get("tem_desconto"))',
          hint: '(cartao and compras_mes >= 4) or funcionario.',
        },
      ],
    },
  ],
  'py-05-ciclo-for': [
    {
      title: 'Contar o pão',
      description:
        'Em talao tens os produtos de um dia. Com um ciclo for, conta em quantos_pao quantas vezes aparece "Pão".',
      starterCode: `talao = ["Pão", "Leite", "Pão", "Café", "Pão", "Ovos (dúzia)"]

quantos_pao = None
print(quantos_pao)`,
      solutionCode: `talao = ["Pão", "Leite", "Pão", "Café", "Pão", "Ovos (dúzia)"]

quantos_pao = 0
for produto in talao:
    if produto == "Pão":
        quantos_pao += 1
print(quantos_pao)`,
      checks: [
        {
          label: 'quantos_pao = 3',
          expr: 'quantos_pao == 3',
          actualExpr: 'quantos_pao',
          hint: 'Começa em 0 e soma 1 sempre que produto == "Pão".',
        },
        {
          label: 'Funciona com outro talão',
          expr: 'correr_com(talao=["Pão", "Pão"])["quantos_pao"] == 2 and correr_com(talao=["Leite"])["quantos_pao"] == 0',
          actualExpr: 'correr_com(talao=["Pão", "Pão"]).get("quantos_pao")',
          hint: 'Percorre a lista talao com for em vez de contar à mão.',
        },
      ],
    },
    {
      title: 'Tabuada dos preços',
      description:
        'Com range() e um ciclo for, cria a lista precos_por_qtd com o preço de 1, 2, 3, 4 e 5 unidades de um produto a preco euros (arredondado a 2 casas).',
      starterCode: `preco = 0.89

precos_por_qtd = []
print(precos_por_qtd)`,
      solutionCode: `preco = 0.89

precos_por_qtd = []
for qtd in range(1, 6):
    precos_por_qtd.append(round(qtd * preco, 2))
print(precos_por_qtd)`,
      checks: [
        {
          label: 'precos_por_qtd = [0.89, 1.78, 2.67, 3.56, 4.45]',
          expr: 'precos_por_qtd == [0.89, 1.78, 2.67, 3.56, 4.45]',
          actualExpr: 'precos_por_qtd',
          hint: 'range(1, 6) dá 1, 2, 3, 4 e 5 (o 6 fica de fora).',
        },
        {
          label: 'Funciona com outro preço (0.25 €)',
          expr: 'correr_com(preco=0.25)["precos_por_qtd"] == [0.25, 0.5, 0.75, 1.0, 1.25]',
          actualExpr: 'correr_com(preco=0.25).get("precos_por_qtd")',
          hint: 'Usa round(qtd * preco, 2) dentro do ciclo.',
        },
      ],
    },
  ],
  'py-06-while': [
    {
      title: 'Stock a acabar',
      description:
        'Há stock caixas de leite e vendem-se 7 por dia. Com while, conta em dias quantos dias passam até o stock ficar abaixo de 10 caixas e guarda o que sobra em stock_final.',
      starterCode: `stock = 60

dias = 0
stock_final = None
print(dias, stock_final)`,
      solutionCode: `stock = 60

dias = 0
while stock >= 10:
    stock -= 7
    dias += 1
stock_final = stock
print(dias, stock_final)`,
      checks: [
        {
          label: 'dias = 8 e stock_final = 4',
          expr: 'dias == 8 and stock_final == 4',
          actualExpr: '(dias, stock_final)',
          hint: 'Enquanto stock >= 10, tira 7 ao stock e soma 1 aos dias.',
        },
        {
          label: 'Funciona com outro stock inicial (20)',
          expr: '(lambda r: (r["dias"], r["stock_final"]))(correr_com(stock=20)) == (2, 6)',
          actualExpr: '(lambda r: (r.get("dias"), r.get("stock_final")))(correr_com(stock=20))',
          hint: 'O ciclo tem de depender da variável stock.',
        },
      ],
    },
    {
      title: 'Maior e menor do dia',
      description:
        'Sem usar max() nem min(), percorre faturas e guarda em maior e menor o maior e o menor valor, e em media a média arredondada a 2 casas.',
      starterCode: `faturas = [12.5, 3.2, 48.0, 7.75, 19.9]

maior = None
menor = None
media = None
print(maior, menor, media)`,
      solutionCode: `faturas = [12.5, 3.2, 48.0, 7.75, 19.9]

maior = faturas[0]
menor = faturas[0]
soma = 0
for f in faturas:
    if f > maior:
        maior = f
    if f < menor:
        menor = f
    soma += f
media = round(soma / len(faturas), 2)
print(maior, menor, media)`,
      checks: [
        {
          label: 'maior = 48.0, menor = 3.2 e media = 18.27',
          expr: 'maior == 48.0 and menor == 3.2 and media == 18.27',
          actualExpr: '(maior, menor, media)',
          hint: 'Começa maior e menor no primeiro elemento: faturas[0].',
        },
        {
          label: 'Funciona com outra lista',
          expr: '(lambda r: (r["maior"], r["menor"], r["media"]))(correr_com(faturas=[5, 1, 9])) == (9, 1, 5.0)',
          actualExpr: '(lambda r: (r.get("maior"), r.get("menor"), r.get("media")))(correr_com(faturas=[5, 1, 9]))',
          hint: 'Percorre a lista com for e compara cada valor.',
        },
      ],
    },
  ],
  'py-07-listas-colecoes': [
    {
      title: 'Montra dos baratos',
      description:
        'Com uma list comprehension, guarda em baratos os nomes dos produtos com preço abaixo de 1 €. Guarda em quantos_baratos quantos são.',
      starterCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Iogurte"]
precos = [0.25, 0.89, 2.35, 1.20, 0.55]

baratos = None
quantos_baratos = None
print(baratos, quantos_baratos)`,
      solutionCode: `produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Iogurte"]
precos = [0.25, 0.89, 2.35, 1.20, 0.55]

baratos = [nome for nome, preco in zip(produtos, precos) if preco < 1]
quantos_baratos = len(baratos)
print(baratos, quantos_baratos)`,
      checks: [
        {
          label: 'baratos = ["Pão", "Leite", "Iogurte"] e quantos_baratos = 3',
          expr: 'baratos == ["Pão", "Leite", "Iogurte"] and quantos_baratos == 3',
          actualExpr: '(baratos, quantos_baratos)',
          hint: 'zip(produtos, precos) junta cada nome ao seu preço.',
        },
        {
          label: 'Funciona com outras listas',
          expr: 'correr_com(produtos=["A", "B"], precos=[2.0, 0.5])["baratos"] == ["B"]',
          actualExpr: 'correr_com(produtos=["A", "B"], precos=[2.0, 0.5]).get("baratos")',
          hint: '[nome for nome, preco in zip(produtos, precos) if preco < 1].',
        },
      ],
    },
    {
      title: 'Últimas vendas',
      description:
        'Em vendas tens os totais do dia por ordem. Guarda em ultimas_3 as 3 últimas vendas (fatia) e em top_2 as 2 maiores vendas, do maior para o menor, sem alterar a lista original.',
      starterCode: `vendas = [14.2, 3.5, 27.0, 8.9, 31.4, 5.0]

ultimas_3 = None
top_2 = None
print(ultimas_3, top_2, vendas)`,
      solutionCode: `vendas = [14.2, 3.5, 27.0, 8.9, 31.4, 5.0]

ultimas_3 = vendas[-3:]
top_2 = sorted(vendas, reverse=True)[:2]
print(ultimas_3, top_2, vendas)`,
      checks: [
        {
          label: 'ultimas_3 = [8.9, 31.4, 5.0] e top_2 = [31.4, 27.0]',
          expr: 'ultimas_3 == [8.9, 31.4, 5.0] and top_2 == [31.4, 27.0]',
          actualExpr: '(ultimas_3, top_2)',
          hint: 'vendas[-3:] e sorted(vendas, reverse=True)[:2].',
        },
        {
          label: 'A lista vendas ficou igual',
          expr: 'vendas == [14.2, 3.5, 27.0, 8.9, 31.4, 5.0]',
          actualExpr: 'vendas',
          hint: 'Usa sorted(vendas) e não vendas.sort(), que altera a lista original.',
        },
      ],
    },
  ],
  'py-08-dicionarios': [
    {
      title: 'Clientes por cidade',
      description:
        'Com um dicionário e .get(), conta em por_cidade quantos clientes há em cada cidade da lista cidades. Guarda em cidade_top a cidade com mais clientes (max com key=por_cidade.get).',
      starterCode: `cidades = ["Porto", "Gaia", "Porto", "Lisboa", "Porto", "Gaia"]

por_cidade = {}
cidade_top = None
print(por_cidade, cidade_top)`,
      solutionCode: `cidades = ["Porto", "Gaia", "Porto", "Lisboa", "Porto", "Gaia"]

por_cidade = {}
for c in cidades:
    por_cidade[c] = por_cidade.get(c, 0) + 1
cidade_top = max(por_cidade, key=por_cidade.get)
print(por_cidade, cidade_top)`,
      checks: [
        {
          label: 'por_cidade = {"Porto": 3, "Gaia": 2, "Lisboa": 1}',
          expr: 'por_cidade == {"Porto": 3, "Gaia": 2, "Lisboa": 1}',
          actualExpr: 'por_cidade',
          hint: 'por_cidade[c] = por_cidade.get(c, 0) + 1 dentro de um for.',
        },
        {
          label: 'cidade_top certa, também com outra lista',
          expr: 'cidade_top == "Porto" and correr_com(cidades=["Braga", "Maia", "Braga"])["cidade_top"] == "Braga"',
          actualExpr: '(cidade_top, correr_com(cidades=["Braga", "Maia", "Braga"]).get("cidade_top"))',
          hint: 'max(por_cidade, key=por_cidade.get) devolve a chave com o maior valor.',
        },
      ],
    },
    {
      title: 'Atualizar a tabela de preços',
      description:
        'Sobe 10% o preço de todos os produtos do dicionário precos e guarda o resultado em novos_precos (arredondado a 2 casas), sem alterar precos. Guarda em produtos_caros a lista dos nomes com novo preço acima de 3 €.',
      starterCode: `precos = {"Pão": 0.25, "Café": 3.40, "Azeite": 7.50, "Leite": 0.89}

novos_precos = {}
produtos_caros = []
print(novos_precos, produtos_caros)`,
      solutionCode: `precos = {"Pão": 0.25, "Café": 3.40, "Azeite": 7.50, "Leite": 0.89}

novos_precos = {}
for nome, preco in precos.items():
    novos_precos[nome] = round(preco * 1.10, 2)
produtos_caros = [nome for nome, preco in novos_precos.items() if preco > 3]
print(novos_precos, produtos_caros)`,
      checks: [
        {
          label: 'novos_precos com +10%',
          expr: 'novos_precos == {"Pão": 0.28, "Café": 3.74, "Azeite": 8.25, "Leite": 0.98}',
          actualExpr: 'novos_precos',
          hint: 'Percorre precos.items() e guarda round(preco * 1.10, 2).',
        },
        {
          label: 'produtos_caros = ["Café", "Azeite"] e precos ficou igual',
          expr: 'produtos_caros == ["Café", "Azeite"] and precos["Pão"] == 0.25',
          actualExpr: '(produtos_caros, precos)',
          hint: 'Escreve num dicionário novo em vez de alterar precos.',
        },
      ],
    },
  ],
  'py-09-funcoes': [
    {
      title: 'Preço com desconto',
      description:
        'Escreve a função preco_com_desconto(preco, pct) que devolve o preço depois de um desconto de pct por cento, arredondado a 2 casas. Ex.: preco_com_desconto(10, 20) devolve 8.0.',
      starterCode: `def preco_com_desconto(preco, pct):
    pass


print(preco_com_desconto(10, 20))`,
      solutionCode: `def preco_com_desconto(preco, pct):
    return round(preco * (1 - pct / 100), 2)


print(preco_com_desconto(10, 20))`,
      checks: [
        {
          label: 'preco_com_desconto(10, 20) = 8.0',
          expr: 'preco_com_desconto(10, 20) == 8.0',
          actualExpr: 'preco_com_desconto(10, 20)',
          hint: 'Usa return (e não só print) com round(preco * (1 - pct / 100), 2).',
        },
        {
          label: 'Funciona com outros valores',
          expr: 'preco_com_desconto(7.5, 10) == 6.75 and preco_com_desconto(3.4, 0) == 3.4',
          actualExpr: '(preco_com_desconto(7.5, 10), preco_com_desconto(3.4, 0))',
          hint: 'Usa os parâmetros preco e pct dentro da função.',
        },
      ],
    },
    {
      title: 'Classificar a venda',
      description:
        'Escreve a função classificar_venda(total) que devolve "pequena" até 5 €, "média" até 20 € e "grande" acima disso. Depois guarda em classes a lista de classes para os totais da lista totais.',
      starterCode: `def classificar_venda(total):
    pass


totais = [3.2, 5.0, 12.5, 48.0]
classes = []
print(classes)`,
      solutionCode: `def classificar_venda(total):
    if total <= 5:
        return "pequena"
    elif total <= 20:
        return "média"
    return "grande"


totais = [3.2, 5.0, 12.5, 48.0]
classes = [classificar_venda(t) for t in totais]
print(classes)`,
      checks: [
        {
          label: 'classes = ["pequena", "pequena", "média", "grande"]',
          expr: 'classes == ["pequena", "pequena", "média", "grande"]',
          actualExpr: 'classes',
          hint: 'Chama a função para cada total: [classificar_venda(t) for t in totais].',
        },
        {
          label: 'A função funciona nos limites',
          expr: '[classificar_venda(t) for t in (0.5, 20, 20.01)] == ["pequena", "média", "grande"]',
          actualExpr: '[classificar_venda(t) for t in (0.5, 20, 20.01)]',
          hint: 'Usa if / elif com <= 5 e <= 20 e devolve o texto com return.',
        },
      ],
    },
  ],
};
