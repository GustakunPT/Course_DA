import type { PythonChallengeSpec, SqlChallengeSpec } from './types';

// Treinos das trilhas Visualização & BI e Nível Profissional.

type Linhas = (string | number | null)[][];
const num = (v: unknown) => Number(v);
const perto = (a: unknown, b: number, tol = 0.011) => Math.abs(num(a) - b) < tol;
const ok = (passed: boolean, certo: string, errado: string) => ({ passed, message: passed ? certo : errado });
const linha = (rows: Linhas, chave: string | number) => rows.find((r) => String(r[0]) === String(chave));

export const biProPractice: Record<string, PythonChallengeSpec[]> = {
  'bi-03-curva-abc': [
    {
      title: 'Classificar todos os produtos em A, B e C',
      description: 'Em vendas.csv, ordena a faturação por produto do maior para o menor e calcula a percentagem acumulada. Classe A: acumulado até 80%; B: até 95%; C: o resto. Guarda classes (série produto → letra), num_a, num_b e num_c.',
      starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

classes = None
num_a = None
num_b = None
num_c = None
print(classes)`,
      solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

por_produto = df.groupby("produto")["sub"].sum().sort_values(ascending=False)
acumulado = por_produto.cumsum() / por_produto.sum() * 100
classes = acumulado.apply(lambda x: "A" if x <= 80 else ("B" if x <= 95 else "C"))
num_a = int((classes == "A").sum())
num_b = int((classes == "B").sum())
num_c = int((classes == "C").sum())
print(pd.DataFrame({"acumulado_pct": acumulado.round(1), "classe": classes}))`,
      checks: [
        { label: '7 produtos A, 4 B e 4 C', expr: 'num_a == 7 and num_b == 4 and num_c == 4', actualExpr: '(num_a, num_b, num_c)', hint: 'acumulado = por_produto.cumsum() / por_produto.sum() * 100 e depois classifica com os limites 80 e 95.' },
        { label: 'Azeite é A e Pão é C', expr: 'classes["Azeite"] == "A" and classes["Pão"] == "C"', actualExpr: '(classes["Azeite"], classes["Pão"]) if classes is not None else None', hint: 'classes é uma série com o produto no índice.' },
        { label: 'A classificação vem dos dados', expr: 'dict(correr_com(df=pd.DataFrame({"produto": ["X", "Y", "Z"], "quantidade": [1, 1, 1], "preco": [70.0, 20.0, 10.0]}))["classes"]) == {"X": "A", "Y": "B", "Z": "C"}', actualExpr: 'correr_com(df=pd.DataFrame({"produto": ["X", "Y", "Z"], "quantidade": [1, 1, 1], "preco": [70.0, 20.0, 10.0]})).get("classes")', hint: 'Calcula o acumulado a partir de df, sem escrever as letras à mão.' },
      ],
    },
  ],
  'bi-06-storytelling': [
    {
      title: 'A maior subida e a maior queda',
      description: 'Num relatório, "setembro foi o melhor mês" diz pouco; "março subiu 13% face a fevereiro" diz mais. Em vendas.csv, soma a faturação por mês, calcula a variação face ao mês anterior com .pct_change() * 100 e guarda mes_maior_subida, maior_subida_pct, mes_maior_queda e maior_queda_pct (2 casas).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

mes_maior_subida = None
maior_subida_pct = None
mes_maior_queda = None
maior_queda_pct = None
print(mes_maior_subida, maior_subida_pct, mes_maior_queda, maior_queda_pct)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

por_mes = vendas.groupby(vendas["data"].str.slice(0, 7))["sub"].sum()
variacao = por_mes.pct_change() * 100
mes_maior_subida = variacao.idxmax()
maior_subida_pct = round(float(variacao.max()), 2)
mes_maior_queda = variacao.idxmin()
maior_queda_pct = round(float(variacao.min()), 2)
print(variacao.round(1))`,
      checks: [
        { label: 'Maior subida: 2025-03 (+13.05%)', expr: 'mes_maior_subida == "2025-03" and abs(float(maior_subida_pct) - 13.05) < 0.01', actualExpr: '(mes_maior_subida, maior_subida_pct)', hint: 'variacao = por_mes.pct_change() * 100 e depois .idxmax() e .max().' },
        { label: 'Maior queda: 2025-02 (-10.33%)', expr: 'mes_maior_queda == "2025-02" and abs(float(maior_queda_pct) - (-10.33)) < 0.01', actualExpr: '(mes_maior_queda, maior_queda_pct)', hint: '.idxmin() e .min() da mesma série.' },
        { label: 'As variações vêm dos dados', expr: '(lambda r: r["mes_maior_subida"] == "2025-02" and abs(float(r["maior_queda_pct"]) - (-75.0)) < 0.01)(correr_com(vendas=pd.DataFrame({"data": ["2025-01-05", "2025-02-05", "2025-03-05"], "quantidade": [1, 1, 1], "preco": [10.0, 20.0, 5.0]})))', actualExpr: 'correr_com(vendas=pd.DataFrame({"data": ["2025-01-05", "2025-02-05", "2025-03-05"], "quantidade": [1, 1, 1], "preco": [10.0, 20.0, 5.0]})).get("mes_maior_subida")', hint: 'Calcula a partir de vendas, sem escrever os meses à mão.' },
      ],
    },
  ],
  'bi-07-graficos-matplotlib': [
    {
      title: 'Linha da faturação mensal',
      description: 'Para mostrar uma evolução no tempo usa-se uma linha. Desenha a faturação de cada mês de vendas.csv com ax.plot (marcadores com marker="o"), com o eixo vertical a começar no zero, um título com a conclusão e o rótulo do eixo vertical em euros.',
      starterCode: `import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

por_mes = None
fig, ax = plt.subplots(figsize=(7, 3.5))
# Desenha aqui a linha`,
      solutionCode: `import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

por_mes = vendas.groupby(vendas["data"].str.slice(5, 7))["sub"].sum()
fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(por_mes.index, por_mes.values, marker="o")
ax.set_ylim(bottom=0)
ax.set_title("Faturação estável ao longo de 2025, com pico em setembro")
ax.set_xlabel("Mês")
ax.set_ylabel("Faturação (€)")
fig.tight_layout()`,
      checks: [
        { label: 'Uma linha com 12 meses, a mais alta em 2 462.82 €', expr: 'len(ax.get_lines()) >= 1 and len(ax.get_lines()[0].get_ydata()) == 12 and abs(max(ax.get_lines()[0].get_ydata()) - 2462.82) < 0.01', actualExpr: '[len(l.get_ydata()) for l in ax.get_lines()]', hint: 'Soma por mês e usa ax.plot(por_mes.index, por_mes.values, marker="o").' },
        { label: 'O eixo vertical começa no zero', expr: 'ax.get_ylim()[0] <= 0', actualExpr: 'ax.get_ylim()', hint: 'ax.set_ylim(bottom=0). Sem isso, pequenas diferenças parecem enormes.' },
        { label: 'Título com a conclusão e eixo vertical em €', expr: 'len(ax.get_title().strip()) >= 15 and "€" in ax.get_ylabel()', actualExpr: '(ax.get_title(), ax.get_ylabel())', hint: 'ax.set_title("...") com uma frase e ax.set_ylabel("Faturação (€)").' },
      ],
    },
  ],
  'bi-10-pratica-excel-powerbi': [
    {
      title: 'As fórmulas do Excel em pandas',
      description: 'Reconcilia as fórmulas do Excel com pandas. soma_se_leite: =SOMA.SE.S(Subtotal; produto; "Leite"). faturacao_bebidas: categoria buscada com PROCX (em pandas: .map) e somada para Bebidas. contar_se_lisboa: =CONTAR.SE(Clientes[cidade]; "Lisboa").',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["Subtotal"] = vendas["quantidade"] * vendas["preco"]

soma_se_leite = None
faturacao_bebidas = None
contar_se_lisboa = None
print(soma_se_leite, faturacao_bebidas, contar_se_lisboa)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["Subtotal"] = vendas["quantidade"] * vendas["preco"]

# =SOMA.SE.S(Vendas[Subtotal]; Vendas[produto]; "Leite")
soma_se_leite = round(float(vendas.loc[vendas["produto"] == "Leite", "Subtotal"].sum()), 2)

# =PROCX([@produto_id]; Produtos[id]; Produtos[categoria]) e depois SOMA.SE.S
vendas["Categoria"] = vendas["produto_id"].map(produtos.set_index("id")["categoria"])
faturacao_bebidas = round(float(vendas.loc[vendas["Categoria"] == "Bebidas", "Subtotal"].sum()), 2)

# =CONTAR.SE(Clientes[cidade]; "Lisboa")
contar_se_lisboa = int((clientes["cidade"] == "Lisboa").sum())
print(soma_se_leite, faturacao_bebidas, contar_se_lisboa)`,
      checks: [
        { label: 'soma_se_leite (854.40 €) e contar_se_lisboa (26)', expr: 'abs(float(soma_se_leite) - 854.40) < 0.01 and int(contar_se_lisboa) == 26', actualExpr: '(soma_se_leite, contar_se_lisboa)', hint: 'vendas.loc[vendas["produto"] == "Leite", "Subtotal"].sum() e (clientes["cidade"] == "Lisboa").sum().' },
        { label: 'faturacao_bebidas com a categoria buscada (1 965.80 €)', expr: 'abs(float(faturacao_bebidas) - 1965.80) < 0.01', actualExpr: 'faturacao_bebidas', hint: 'vendas["produto_id"].map(produtos.set_index("id")["categoria"]) faz o mesmo que o PROCX.' },
        { label: 'O PROCX funciona com outro catálogo', expr: 'abs(float(correr_com(produtos=pd.DataFrame({"id": list(range(1, 16)), "categoria": ["Bebidas"] * 15}))["faturacao_bebidas"]) - 26902.89) < 0.01', actualExpr: 'correr_com(produtos=pd.DataFrame({"id": list(range(1, 16)), "categoria": ["Bebidas"] * 15})).get("faturacao_bebidas")', hint: 'Busca a categoria a partir de produtos, sem escrever o total à mão.' },
      ],
    },
  ],
  'pro-01-pipeline-etl': [
    {
      title: 'Camada Gold: um agregado reconciliado',
      description: 'A partir da camada Silver (vendas.csv, já limpa), cria a camada Gold: gold = faturação por mês (soma de quantidade × preco, 2 casas). Guarda total_gold e reconciliado (True se a soma da Gold bater com a soma da Silver ao cêntimo).',
      starterCode: `import pandas as pd

silver = pd.read_csv("dados/vendas.csv")

gold = None
total_gold = None
reconciliado = None
print(gold)`,
      solutionCode: `import pandas as pd

silver = pd.read_csv("dados/vendas.csv")
silver["sub"] = silver["quantidade"] * silver["preco"]

gold = silver.groupby(silver["data"].str.slice(0, 7))["sub"].sum().round(2)
total_gold = round(float(gold.sum()), 2)
reconciliado = abs(total_gold - silver["sub"].sum()) < 0.01
print(gold)
print("Total Gold:", total_gold, "| reconciliado:", reconciliado)`,
      checks: [
        { label: 'gold tem 12 meses e total_gold = 26 902.89 €', expr: 'len(gold) == 12 and abs(float(total_gold) - 26902.89) < 0.01', actualExpr: '(len(gold) if gold is not None else None, total_gold)', hint: 'silver.groupby(silver["data"].str.slice(0, 7))["sub"].sum().round(2).' },
        { label: 'A reconciliação é calculada e detecta diferenças', expr: 'bool(reconciliado) is True and len(correr_com(silver=pd.DataFrame({"data": ["2025-01-01", "2025-02-01"], "quantidade": [1, 2], "preco": [1.0, 1.5]}))["gold"]) == 2', actualExpr: 'reconciliado', hint: 'reconciliado = abs(total_gold - silver["sub"].sum()) < 0.01.' },
      ],
    },
  ],
  'pro-02-data-quality-tests': [
    {
      title: 'Contrato de dados para clientes',
      description: 'Escreve 3 testes de qualidade para clientes.csv: ids_unicos (a coluna id não tem repetidos), cidades_validas (todas as cidades estão em cidades_permitidas) e nomes_limpos (nenhum nome tem espaços no início ou no fim).',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
cidades_permitidas = ["Lisboa", "Porto", "Gaia", "Matosinhos", "Braga", "Maia"]

ids_unicos = None
cidades_validas = None
nomes_limpos = None
print(ids_unicos, cidades_validas, nomes_limpos)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
cidades_permitidas = ["Lisboa", "Porto", "Gaia", "Matosinhos", "Braga", "Maia"]

ids_unicos = bool(clientes["id"].is_unique)
cidades_validas = bool(clientes["cidade"].isin(cidades_permitidas).all())
nomes_limpos = bool((clientes["nome"] == clientes["nome"].str.strip()).all())
print(ids_unicos, cidades_validas, nomes_limpos)`,
      checks: [
        { label: 'Os dados reais passam nos 3 testes', expr: 'ids_unicos is True and cidades_validas is True and nomes_limpos is True', actualExpr: '(ids_unicos, cidades_validas, nomes_limpos)', hint: 'is_unique, .isin(...).all() e comparar o nome com .str.strip().' },
        { label: 'Os testes falham com dados errados', expr: '(lambda r: r["ids_unicos"] is False and r["cidades_validas"] is False and r["nomes_limpos"] is False)(correr_com(clientes=pd.DataFrame({"id": [1, 1], "nome": [" Ana", "Rui"], "cidade": ["Faro", "Porto"]})))', actualExpr: 'correr_com(clientes=pd.DataFrame({"id": [1, 1], "nome": [" Ana", "Rui"], "cidade": ["Faro", "Porto"]}))', hint: 'Um teste que diz sempre True não protege nada: calcula cada resultado a partir da tabela.' },
      ],
    },
  ],
  'pro-06-caso-executivo': [
    {
      title: 'Há Pareto nos clientes?',
      description: 'A direção acha que 20% dos clientes fazem 80% da faturação. Em vendas.csv, soma a faturação por cliente, ordena do maior para o menor e guarda num_top (20% dos clientes, arredondado para baixo com int), quota_top20_pct (2 casas), cliente_top (id do maior cliente) e pareto_nos_clientes (True se a quota for de pelo menos 80%).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

num_top = None
quota_top20_pct = None
cliente_top = None
pareto_nos_clientes = None
print(num_top, quota_top20_pct, cliente_top, pareto_nos_clientes)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

por_cliente = vendas.groupby("cliente_id")["sub"].sum().sort_values(ascending=False)
num_top = int(len(por_cliente) * 0.2)
quota_top20_pct = round(float(por_cliente.iloc[:num_top].sum() / por_cliente.sum() * 100), 2)
cliente_top = int(por_cliente.index[0])
pareto_nos_clientes = quota_top20_pct >= 80
print(f"Os {num_top} maiores clientes fazem {quota_top20_pct}% da faturação")`,
      checks: [
        { label: 'num_top (24) e quota_top20_pct (28.7%)', expr: 'int(num_top) == 24 and abs(float(quota_top20_pct) - 28.70) < 0.01', actualExpr: '(num_top, quota_top20_pct)', hint: 'num_top = int(len(por_cliente) * 0.2) e soma os primeiros num_top da série ordenada.' },
        { label: 'cliente_top (27) e não há Pareto nos clientes', expr: 'int(cliente_top) == 27 and bool(pareto_nos_clientes) is False', actualExpr: '(cliente_top, pareto_nos_clientes)', hint: 'A faturação está espalhada pelos clientes: a regra 80/20 vale para produtos (Curva ABC), não aqui.' },
        { label: 'A decisão vem dos dados', expr: 'bool(correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 3, 4, 5], "quantidade": [1, 1, 1, 1, 1], "preco": [80.0, 5.0, 5.0, 5.0, 5.0]}))["pareto_nos_clientes"]) is True', actualExpr: 'correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 3, 4, 5], "quantidade": [1, 1, 1, 1, 1], "preco": [80.0, 5.0, 5.0, 5.0, 5.0]})).get("quota_top20_pct")', hint: 'pareto_nos_clientes = quota_top20_pct >= 80.' },
      ],
    },
  ],
  'pro-07-json-exceptions': [
    {
      title: 'Registos com campos em falta (KeyError)',
      description: 'O ficheiro de devoluções chega com registos incompletos. Percorre json.loads(devolucoes_json): soma as unidades em total_unidades e conta em registos_incompletos os que não têm "artigo" ou "unidades" (apanha o KeyError).',
      starterCode: `import json

devolucoes_json = '[{"artigo": "Pão", "unidades": 2}, {"artigo": "Leite"}, {"unidades": 3}, {"artigo": "Café", "unidades": 1}]'

total_unidades = 0
registos_incompletos = 0
# Percorre os registos aqui

print(total_unidades, registos_incompletos)`,
      solutionCode: `import json

devolucoes_json = '[{"artigo": "Pão", "unidades": 2}, {"artigo": "Leite"}, {"unidades": 3}, {"artigo": "Café", "unidades": 1}]'

total_unidades = 0
registos_incompletos = 0
for registo in json.loads(devolucoes_json):
    try:
        artigo = registo["artigo"]
        total_unidades += registo["unidades"]
    except KeyError:
        registos_incompletos += 1

print(total_unidades, registos_incompletos)`,
      checks: [
        { label: 'total_unidades (3) e registos_incompletos (2)', expr: 'total_unidades == 3 and registos_incompletos == 2', actualExpr: '(total_unidades, registos_incompletos)', hint: 'Lê registo["artigo"] e registo["unidades"] dentro do try; except KeyError conta o registo.' },
        { label: 'Funciona com outro ficheiro', expr: '(lambda r: r["total_unidades"] == 5 and r["registos_incompletos"] == 0)(correr_com(devolucoes_json=\'[{"artigo": "A", "unidades": 5}]\'))', actualExpr: 'correr_com(devolucoes_json=\'[{"artigo": "A", "unidades": 5}]\').get("total_unidades")', hint: 'Percorre json.loads(devolucoes_json), sem escrever os números à mão.' },
      ],
    },
  ],
  'pro-08-python-sqlite-dbapi': [
    {
      title: 'Uma função com consulta parametrizada',
      description: 'Escreve faturacao_produto(produto), que corre na ligação con a consulta "faturação total de um produto" com um parâmetro ? e devolve o valor como float (2 casas).',
      starterCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
pd.read_csv("dados/vendas.csv").to_sql("vendas", con, index=False)


def faturacao_produto(produto):
    return None


print(faturacao_produto("Leite"), faturacao_produto("Café"))`,
      solutionCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
pd.read_csv("dados/vendas.csv").to_sql("vendas", con, index=False)


def faturacao_produto(produto):
    sql = "SELECT ROUND(SUM(quantidade * preco), 2) FROM vendas WHERE produto = ?"
    return float(con.execute(sql, [produto]).fetchone()[0])


print(faturacao_produto("Leite"), faturacao_produto("Café"))`,
      checks: [
        { label: 'Leite (854.40 €) e Café (2 832.20 €)', expr: 'abs(faturacao_produto("Leite") - 854.40) < 0.01 and abs(faturacao_produto("Café") - 2832.20) < 0.01', actualExpr: '(faturacao_produto("Leite"), faturacao_produto("Café"))', hint: 'con.execute("... WHERE produto = ?", [produto]).fetchone()[0].' },
        { label: 'Funciona para qualquer produto (Pão: 205.50 €)', expr: 'abs(faturacao_produto("Pão") - 205.50) < 0.01', actualExpr: 'faturacao_produto("Pão")', hint: 'O nome do produto entra pelo parâmetro ?, nunca colado ao texto da consulta.' },
      ],
    },
  ],
  'pro-09-projeto-final': [
    {
      title: 'Mini-projeto: o que reforçar no verão?',
      description: 'Repete o raciocínio do projeto para o 3.º trimestre. Em vendas_sazonais.csv com a categoria de produtos.csv, cria matriz (trimestre × categoria, soma da faturação), compara o T3 com a média dos outros trimestres e guarda categoria_verao (maior subida) e subida_verao_pct (1 casa).',
      starterCode: `import pandas as pd

saz = pd.read_csv("dados/vendas_sazonais.csv")
produtos = pd.read_csv("dados/produtos.csv")
saz["sub"] = saz["quantidade"] * saz["preco"]
saz["trimestre"] = (saz["data"].str.slice(5, 7).astype(int) - 1) // 3 + 1

matriz = None
categoria_verao = None
subida_verao_pct = None
print(categoria_verao, subida_verao_pct)`,
      solutionCode: `import pandas as pd

saz = pd.read_csv("dados/vendas_sazonais.csv")
produtos = pd.read_csv("dados/produtos.csv")
saz["sub"] = saz["quantidade"] * saz["preco"]
saz["trimestre"] = (saz["data"].str.slice(5, 7).astype(int) - 1) // 3 + 1

juntas = saz.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
matriz = juntas.pivot_table(values="sub", index="trimestre", columns="categoria", aggfunc="sum")
subida = (matriz.loc[3] / matriz.drop(index=3).mean() - 1) * 100
categoria_verao = str(subida.idxmax())
subida_verao_pct = round(float(subida.max()), 1)
print(subida.round(1).sort_values(ascending=False))
print(f"Reforçar {categoria_verao} no verão: +{subida_verao_pct}% face a um trimestre normal")`,
      checks: [
        { label: 'matriz 4 × 6', expr: 'tuple(matriz.shape) == (4, 6)', actualExpr: 'getattr(matriz, "shape", matriz)', hint: 'juntas.pivot_table(values="sub", index="trimestre", columns="categoria", aggfunc="sum").' },
        { label: 'Bebidas sobem 169.9% no verão', expr: 'categoria_verao == "Bebidas" and abs(float(subida_verao_pct) - 169.9) < 0.05', actualExpr: '(categoria_verao, subida_verao_pct)', hint: 'subida = (matriz.loc[3] / matriz.drop(index=3).mean() - 1) * 100.' },
      ],
    },
  ],
  'pro-10-rgpd-anonimizacao': [
    {
      title: 'Direito ao esquecimento',
      description: 'O cliente com id_a_apagar = 27 pediu para ser apagado. Remove-o de clientes e de vendas e guarda clientes_depois (número de clientes), linhas_apagadas (linhas de venda removidas) e faturacao_depois (faturação que fica, 2 casas).',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
vendas = pd.read_csv("dados/vendas.csv")
id_a_apagar = 27

clientes_depois = None
linhas_apagadas = None
faturacao_depois = None
print(clientes_depois, linhas_apagadas, faturacao_depois)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
vendas = pd.read_csv("dados/vendas.csv")
id_a_apagar = 27

clientes_limpos = clientes[clientes["id"] != id_a_apagar]
vendas_limpas = vendas[vendas["cliente_id"] != id_a_apagar]

clientes_depois = len(clientes_limpos)
linhas_apagadas = len(vendas) - len(vendas_limpas)
faturacao_depois = round(float((vendas_limpas["quantidade"] * vendas_limpas["preco"]).sum()), 2)
print(clientes_depois, linhas_apagadas, faturacao_depois)`,
      checks: [
        { label: '119 clientes e 65 linhas de venda apagadas', expr: 'int(clientes_depois) == 119 and int(linhas_apagadas) == 65', actualExpr: '(clientes_depois, linhas_apagadas)', hint: 'Filtra as duas tabelas com != id_a_apagar e compara os tamanhos.' },
        { label: 'faturacao_depois (26 485.78 €)', expr: 'abs(float(faturacao_depois) - 26485.78) < 0.01', actualExpr: 'faturacao_depois', hint: 'Soma quantidade × preco só nas vendas que ficam.' },
        { label: 'Funciona para qualquer cliente', expr: 'int(correr_com(id_a_apagar=1)["clientes_depois"]) == 119 and int(correr_com(id_a_apagar=999)["linhas_apagadas"]) == 0', actualExpr: 'correr_com(id_a_apagar=999).get("linhas_apagadas")', hint: 'Usa a variável id_a_apagar nos filtros, sem escrever 27 à mão.' },
      ],
    },
  ],
  'pro-11-portefolio-readme': [
    {
      title: 'Uma frase para o CV',
      description: 'Escreve frase_cv: uma frase com até 200 caracteres que diga o que fizeste (um verbo no passado na 1.ª pessoa, como "Analisei"), com que ferramentas (SQL e Python) e um resultado com número e %. Usa as variáveis linhas e quota_top2 já dadas.',
      starterCode: `linhas = 5078
quota_top2 = 39.8

frase_cv = None
print(frase_cv, len(frase_cv or ""))`,
      solutionCode: `linhas = 5078
quota_top2 = 39.8

frase_cv = f"Analisei {linhas} vendas com SQL e Python e mostrei que 2 produtos valem {quota_top2}% da faturação."
print(frase_cv, len(frase_cv))`,
      checks: [
        { label: 'Até 200 caracteres, com SQL e Python', expr: 'isinstance(frase_cv, str) and 30 <= len(frase_cv) <= 200 and "SQL" in frase_cv and "Python" in frase_cv', actualExpr: 'len(frase_cv) if isinstance(frase_cv, str) else frase_cv', hint: 'Uma só frase, curta, com as ferramentas pelo nome.' },
        { label: 'Começa por uma ação e mostra o resultado com %', expr: 'frase_cv.split()[0].endswith("ei") and f"{quota_top2}%" in frase_cv and str(linhas) in frase_cv', actualExpr: 'frase_cv.split()[0] if isinstance(frase_cv, str) else None', hint: 'Começa por "Analisei", "Construí" ou "Mostrei" e usa {linhas} e {quota_top2}% numa f-string.' },
        { label: 'Os números vêm das variáveis', expr: '"41.5%" in correr_com(quota_top2=41.5)["frase_cv"]', actualExpr: 'correr_com(quota_top2=41.5).get("frase_cv")', hint: 'Escreve a frase como f-string com {quota_top2}.' },
      ],
    },
  ],
};

export const biProSqlPractice: Record<string, SqlChallengeSpec[]> = {
  'bi-04-star-schema': [
    {
      title: 'Dimensão tempo: faturação por dia da semana',
      description: "Numa Star Schema, a dimensão tempo dá atributos como o dia da semana. Em SQLite, CAST(strftime('%w', data) AS INTEGER) dá 0 (domingo) a 6 (sábado). Mostra dia_semana e faturacao (2 casas) da tabela vendas, por ordem de dia_semana.",
      starterSql: "SELECT data, quantidade * preco AS subtotal\nFROM vendas\nLIMIT 5;",
      solutionSql: "SELECT\n  CAST(strftime('%w', data) AS INTEGER) AS dia_semana,\n  ROUND(SUM(quantidade * preco), 2) AS faturacao\nFROM vendas\nGROUP BY dia_semana\nORDER BY dia_semana;",
      hint: "SELECT CAST(strftime('%w', data) AS INTEGER) AS dia_semana, ROUND(SUM(quantidade * preco), 2) AS faturacao FROM vendas GROUP BY dia_semana ORDER BY dia_semana;",
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 7 && perto(linha(rows, 0)?.[1], 4937.71) && perto(linha(rows, 6)?.[1], 4928.97) && perto(linha(rows, 3)?.[1], 3177.8);
        return ok(certo, 'Domingo e sábado valem quase 5 000 € cada; a quarta-feira é o dia mais fraco.', 'Esperava 7 linhas (0 = domingo a 6 = sábado) com a faturação de cada dia da semana.');
      },
    },
  ],
  'bi-05-excel-dax': [
    {
      title: 'CALCULATE com filtro: Charcutaria por cidade',
      description: 'Valida em SQL a medida DAX CALCULATE([Faturação], produtos[categoria] = "Charcutaria") por cidade: mostra cidade e faturacao_charcutaria (2 casas), da maior para a menor.',
      starterSql: "SELECT c.cidade, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao\nFROM vendas v\nJOIN clientes c ON c.id = v.cliente_id\nGROUP BY c.cidade;",
      solutionSql: "SELECT c.cidade, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_charcutaria\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nJOIN clientes c ON c.id = v.cliente_id\nWHERE p.categoria = 'Charcutaria'\nGROUP BY c.cidade\nORDER BY faturacao_charcutaria DESC;",
      hint: "Junta também produtos (JOIN produtos p ON p.id = v.produto_id) e filtra com WHERE p.categoria = 'Charcutaria': é o filtro do CALCULATE.",
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 6 && rows[0][0] === 'Lisboa' && perto(rows[0][1], 1655.7) && rows[5][0] === 'Maia' && perto(rows[5][1], 522.4);
        return ok(certo, 'Lisboa lidera a Charcutaria com 1 655,70 €, tal como a matriz do Power BI mostraria.', rows.length === 6 && perto(rows[0][1], 5885.34) ? 'Ainda tens a faturação total por cidade: falta o filtro da categoria Charcutaria.' : 'Esperava 6 cidades com a faturação de Charcutaria, da maior para a menor.');
      },
    },
  ],
  'pro-03-coortes-retencao': [
    {
      title: 'Clientes ativos por mês',
      description: 'Antes das coortes, conta quantos clientes diferentes compram em cada mês de vendas_sazonais: mes e clientes_ativos, por ordem de mês.',
      starterSql: "SELECT SUBSTR(data, 1, 7) AS mes, COUNT(*) AS linhas\nFROM vendas_sazonais\nGROUP BY mes\nORDER BY mes;",
      solutionSql: "SELECT SUBSTR(data, 1, 7) AS mes, COUNT(DISTINCT cliente_id) AS clientes_ativos\nFROM vendas_sazonais\nGROUP BY mes\nORDER BY mes;",
      hint: 'COUNT(DISTINCT cliente_id) conta cada cliente uma vez por mês; COUNT(*) contaria linhas de venda.',
      validate: (cols, rows) => {
        const certo = cols.length === 2 && rows.length === 12 && num(linha(rows, '2025-01')?.[1]) === 53 && num(linha(rows, '2025-12')?.[1]) === 112;
        return ok(certo, 'De 53 clientes ativos em janeiro para 112 em dezembro: a base de clientes duplicou ao longo do ano.', 'Esperava 12 meses com os clientes diferentes de cada mês (janeiro: 53).');
      },
    },
  ],
  'pro-04-sql-performance': [
    {
      title: 'Filtro de datas que usa o índice',
      description: "SUBSTR(data, 1, 7) IN ('2025-10', ...) obriga a calcular a função em todas as linhas e não usa índices. Reescreve o filtro do 4.º trimestre com uma comparação direta na coluna (data >= ... AND data < ...) e mostra linhas e faturacao (2 casas) de vendas.",
      starterSql: "SELECT COUNT(*) AS linhas, ROUND(SUM(quantidade * preco), 2) AS faturacao\nFROM vendas\nWHERE SUBSTR(data, 1, 7) IN ('2025-10', '2025-11');",
      solutionSql: "SELECT COUNT(*) AS linhas, ROUND(SUM(quantidade * preco), 2) AS faturacao\nFROM vendas\nWHERE data >= '2025-10-01' AND data < '2026-01-01';",
      hint: "WHERE data >= '2025-10-01' AND data < '2026-01-01'. O limite superior é exclusivo, para não perder o dia 31.",
      validate: (cols, rows) => {
        const certo = rows.length === 1 && num(rows[0][0]) === 1266 && perto(rows[0][1], 6728.25);
        return ok(certo, 'Mesmo resultado (1 266 linhas, 6 728,25 €) e agora o filtro pode usar um índice em data.', 'Esperava 1 linha com 1 266 vendas e 6 728,25 € no 4.º trimestre (outubro a dezembro).');
      },
    },
  ],
  'pro-05-entrevista-sql': [
    {
      title: 'O segundo mais vendido de cada categoria',
      description: 'Pergunta clássica: mostra o 2.º produto mais vendido (em unidades) de cada categoria, com DENSE_RANK() OVER (PARTITION BY categoria ...). Colunas: categoria, nome e unidades, por ordem de categoria.',
      starterSql: "SELECT p.categoria, p.nome, SUM(v.quantidade) AS unidades\nFROM vendas v\nJOIN produtos p ON p.id = v.produto_id\nGROUP BY p.categoria, p.nome\nORDER BY p.categoria, unidades DESC;",
      solutionSql: "WITH unidades AS (\n  SELECT p.categoria, p.nome, SUM(v.quantidade) AS unidades\n  FROM vendas v\n  JOIN produtos p ON p.id = v.produto_id\n  GROUP BY p.categoria, p.nome\n),\nranking AS (\n  SELECT *, DENSE_RANK() OVER (PARTITION BY categoria ORDER BY unidades DESC) AS pos\n  FROM unidades\n)\nSELECT categoria, nome, unidades\nFROM ranking\nWHERE pos = 2\nORDER BY categoria;",
      hint: 'Calcula a posição com DENSE_RANK() OVER (PARTITION BY categoria ORDER BY unidades DESC) numa CTE e filtra WHERE pos = 2.',
      validate: (cols, rows) => {
        const nome = (cat: string) => linha(rows, cat)?.[1];
        const certo = cols.length === 3 && rows.length === 5 && nome('Laticínios') === 'Iogurte' && nome('Mercearia') === 'Arroz' && !linha(rows, 'Padaria');
        return ok(certo, 'Cinco categorias têm um segundo lugar; a Padaria só tem o Pão, por isso não aparece. Detalhe que os entrevistadores adoram.', 'Esperava 5 linhas (a Padaria só tem um produto). Confirma o filtro pos = 2.');
      },
    },
  ],
};
