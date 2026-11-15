import type { PythonChallengeSpec } from './types';

// Treinos da trilha Pandas. As verificações com correr_com(...) trocam a tabela lida do CSV
// por uma tabela pequena inventada: só passa quem calcula a partir dos dados.

export const pandasPractice: Record<string, PythonChallengeSpec[]> = {
  'pd-01-dataframes': [
    {
      title: 'Clientes à primeira vista',
      description: 'Lê dados/clientes.csv e guarda num_clientes (número de linhas), num_cidades (cidades diferentes, com .nunique()) e ultimo_nome (o nome na última linha, com .iloc[-1]).',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

num_clientes = None
num_cidades = None
ultimo_nome = None
print(num_clientes, num_cidades, ultimo_nome)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

num_clientes = len(clientes)
num_cidades = clientes["cidade"].nunique()
ultimo_nome = clientes["nome"].iloc[-1]
print(num_clientes, num_cidades, ultimo_nome)`,
      checks: [
        { label: 'num_clientes (120) e num_cidades (6)', expr: 'num_clientes == 120 and num_cidades == 6', actualExpr: '(num_clientes, num_cidades)', hint: 'len(clientes) e clientes["cidade"].nunique().' },
        { label: 'ultimo_nome ("Bruno Santos")', expr: 'ultimo_nome == "Bruno Santos"', actualExpr: 'ultimo_nome', hint: 'clientes["nome"].iloc[-1] lê a última linha.' },
        { label: 'Funciona com outra tabela', expr: '(lambda r: r["num_clientes"] == 2 and r["num_cidades"] == 1 and r["ultimo_nome"] == "Rita")(correr_com(clientes=pd.DataFrame({"id": [1, 2], "nome": ["Ana", "Rita"], "cidade": ["Faro", "Faro"]})))', actualExpr: 'correr_com(clientes=pd.DataFrame({"id": [1, 2], "nome": ["Ana", "Rita"], "cidade": ["Faro", "Faro"]})).get("ultimo_nome")', hint: 'Calcula tudo a partir de clientes, sem escrever os números à mão.' },
      ],
    },
    {
      title: 'Unidades e preço médio',
      description: 'Em dados/vendas.csv, guarda unidades_total (soma da coluna quantidade) e preco_medio_linha (média da coluna preco, arredondada a 2 casas).',
      starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

unidades_total = None
preco_medio_linha = None
print(unidades_total, preco_medio_linha)`,
      solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

unidades_total = int(df["quantidade"].sum())
preco_medio_linha = round(float(df["preco"].mean()), 2)
print(unidades_total, preco_medio_linha)`,
      checks: [
        { label: 'unidades_total (12 813)', expr: 'int(unidades_total) == 12813', actualExpr: 'unidades_total', hint: 'df["quantidade"].sum().' },
        { label: 'preco_medio_linha (2.10 €)', expr: 'abs(float(preco_medio_linha) - 2.10) < 0.001', actualExpr: 'preco_medio_linha', hint: 'round(df["preco"].mean(), 2).' },
        { label: 'Funciona com outra tabela', expr: '(lambda r: int(r["unidades_total"]) == 5 and abs(float(r["preco_medio_linha"]) - 2.0) < 0.001)(correr_com(df=pd.DataFrame({"quantidade": [2, 3], "preco": [1.0, 3.0]})))', actualExpr: 'correr_com(df=pd.DataFrame({"quantidade": [2, 3], "preco": [1.0, 3.0]})).get("unidades_total")', hint: 'Usa as colunas de df, não os números do resultado.' },
      ],
    },
  ],
  'pd-02-filtros': [
    {
      title: 'Linhas com muitas unidades',
      description: 'Em dados/vendas.csv, filtra as linhas com quantidade de 3 ou mais. Guarda num_linhas_grandes e faturacao_grandes (soma de quantidade × preco dessas linhas, 2 casas).',
      starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

grandes = None
num_linhas_grandes = None
faturacao_grandes = None
print(num_linhas_grandes, faturacao_grandes)`,
      solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

grandes = df[df["quantidade"] >= 3]
num_linhas_grandes = len(grandes)
faturacao_grandes = round(float((grandes["quantidade"] * grandes["preco"]).sum()), 2)
print(num_linhas_grandes, faturacao_grandes)`,
      checks: [
        { label: 'num_linhas_grandes (2 575)', expr: 'int(num_linhas_grandes) == 2575', actualExpr: 'num_linhas_grandes', hint: 'grandes = df[df["quantidade"] >= 3] e len(grandes).' },
        { label: 'faturacao_grandes (19 065.78 €)', expr: 'abs(float(faturacao_grandes) - 19065.78) < 0.01', actualExpr: 'faturacao_grandes', hint: '(grandes["quantidade"] * grandes["preco"]).sum().' },
        { label: 'O filtro usa >= 3', expr: '(lambda r: int(r["num_linhas_grandes"]) == 2 and abs(float(r["faturacao_grandes"]) - 7.0) < 0.001)(correr_com(df=pd.DataFrame({"quantidade": [2, 3, 4], "preco": [9.0, 1.0, 1.0]})))', actualExpr: 'correr_com(df=pd.DataFrame({"quantidade": [2, 3, 4], "preco": [9.0, 1.0, 1.0]})).get("num_linhas_grandes")', hint: 'Com quantidades 2, 3 e 4 só entram as duas últimas.' },
      ],
    },
    {
      title: 'Porto ou Braga com .isin()',
      description: 'Em dados/clientes.csv, usa .isin() para ficar com os clientes do Porto ou de Braga. Guarda num_porto_braga e primeiros_nomes (lista com os 3 primeiros nomes desse filtro, com .loc e .head(3).tolist()).',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

mascara = None
num_porto_braga = None
primeiros_nomes = None
print(num_porto_braga, primeiros_nomes)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

mascara = clientes["cidade"].isin(["Porto", "Braga"])
num_porto_braga = int(mascara.sum())
primeiros_nomes = clientes.loc[mascara, "nome"].head(3).tolist()
print(num_porto_braga, primeiros_nomes)`,
      checks: [
        { label: 'num_porto_braga (40)', expr: 'int(num_porto_braga) == 40', actualExpr: 'num_porto_braga', hint: 'clientes["cidade"].isin(["Porto", "Braga"]) dá True/False; .sum() conta os True.' },
        { label: 'primeiros_nomes é uma lista de 3 nomes', expr: 'isinstance(primeiros_nomes, list) and len(primeiros_nomes) == 3 and primeiros_nomes == clientes.loc[clientes["cidade"].isin(["Porto", "Braga"]), "nome"].head(3).tolist()', actualExpr: 'primeiros_nomes', hint: 'clientes.loc[mascara, "nome"].head(3).tolist().' },
        { label: 'Funciona com outra tabela', expr: 'correr_com(clientes=pd.DataFrame({"nome": ["A", "B", "C"], "cidade": ["Braga", "Faro", "Porto"]}))["primeiros_nomes"] == ["A", "C"]', actualExpr: 'correr_com(clientes=pd.DataFrame({"nome": ["A", "B", "C"], "cidade": ["Braga", "Faro", "Porto"]})).get("primeiros_nomes")', hint: 'Filtra a partir de clientes, sem escrever os nomes à mão.' },
      ],
    },
  ],
  'pd-03-texto-datas': [
    {
      title: 'Apelidos mais comuns',
      description: 'Em dados/clientes.csv, cria a série apelidos com a última palavra de cada nome (.str.split().str[-1]). Guarda apelido_top (o mais frequente), vezes_top e num_apelidos (apelidos diferentes).',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

apelidos = None
apelido_top = None
vezes_top = None
num_apelidos = None
print(apelido_top, vezes_top, num_apelidos)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

apelidos = clientes["nome"].str.split().str[-1]
contagem = apelidos.value_counts()
apelido_top = contagem.index[0]
vezes_top = int(contagem.iloc[0])
num_apelidos = apelidos.nunique()
print(apelido_top, vezes_top, num_apelidos)`,
      checks: [
        { label: 'apelido_top ("Santos", 24 vezes)', expr: 'apelido_top == "Santos" and int(vezes_top) == 24', actualExpr: '(apelido_top, vezes_top)', hint: 'apelidos.value_counts() ordena do mais frequente para o menos.' },
        { label: 'num_apelidos (8)', expr: 'int(num_apelidos) == 8', actualExpr: 'num_apelidos', hint: 'apelidos.nunique().' },
        { label: 'Funciona com outra tabela', expr: 'correr_com(clientes=pd.DataFrame({"nome": ["Ana Costa", "Rui Costa", "Eva Lima"]}))["apelido_top"] == "Costa"', actualExpr: 'correr_com(clientes=pd.DataFrame({"nome": ["Ana Costa", "Rui Costa", "Eva Lima"]})).get("apelido_top")', hint: 'Parte os nomes com .str.split() e fica com .str[-1].' },
      ],
    },
    {
      title: 'O dia da semana mais forte',
      description: 'Em dados/vendas.csv, cria a coluna dia_semana com pd.to_datetime(...).dt.day_of_week (0 = segunda, 6 = domingo) e a coluna sub = quantidade × preco. Guarda dia_top (o dia da semana com mais faturação) e faturacao_dia_top (2 casas).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")

dia_top = None
faturacao_dia_top = None
print(dia_top, faturacao_dia_top)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["dia_semana"] = pd.to_datetime(vendas["data"]).dt.day_of_week
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

por_dia_semana = vendas.groupby("dia_semana")["sub"].sum()
dia_top = int(por_dia_semana.idxmax())
faturacao_dia_top = round(float(por_dia_semana.max()), 2)
print(dia_top, faturacao_dia_top)`,
      checks: [
        { label: 'dia_top (6 = domingo) e faturacao_dia_top (4 937.71 €)', expr: 'int(dia_top) == 6 and abs(float(faturacao_dia_top) - 4937.71) < 0.01', actualExpr: '(dia_top, faturacao_dia_top)', hint: 'vendas.groupby("dia_semana")["sub"].sum(), depois .idxmax() e .max().' },
        { label: 'Funciona com outras datas', expr: 'int(correr_com(vendas=pd.DataFrame({"data": ["2025-01-06", "2025-01-07", "2025-01-13"], "quantidade": [1, 5, 1], "preco": [1.0, 1.0, 1.0]}))["dia_top"]) == 1', actualExpr: 'correr_com(vendas=pd.DataFrame({"data": ["2025-01-06", "2025-01-07", "2025-01-13"], "quantidade": [1, 5, 1], "preco": [1.0, 1.0, 1.0]})).get("dia_top")', hint: 'Converte a coluna data com pd.to_datetime e usa .dt.day_of_week.' },
      ],
    },
  ],
  'pd-04-ordenacao-contagens': [
    {
      title: 'Top 3 em unidades',
      description: 'Em dados/vendas.csv, soma a quantidade por produto, ordena do maior para o menor e guarda top3 (lista com os 3 nomes, por ordem).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")

unidades = None
top3 = None
print(top3)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")

unidades = vendas.groupby("produto")["quantidade"].sum().sort_values(ascending=False)
top3 = unidades.head(3).index.tolist()
print(unidades.head(5))
print(top3)`,
      checks: [
        { label: 'top3 = Leite, Açúcar, Queijo', expr: 'top3 == ["Leite", "Açúcar", "Queijo"]', actualExpr: 'top3', hint: '.sort_values(ascending=False).head(3).index.tolist().' },
        { label: 'Funciona com outra tabela', expr: 'correr_com(vendas=pd.DataFrame({"produto": ["A", "B", "C", "D", "A"], "quantidade": [1, 5, 4, 3, 1]}))["top3"] == ["B", "C", "D"]', actualExpr: 'correr_com(vendas=pd.DataFrame({"produto": ["A", "B", "C", "D", "A"], "quantidade": [1, 5, 4, 3, 1]})).get("top3")', hint: 'Agrupa, soma e ordena a partir de vendas.' },
      ],
    },
    {
      title: 'Percentagem por cidade',
      description: 'Em dados/clientes.csv, usa .value_counts(normalize=True) para obter a fração de clientes de cada cidade. Guarda pct_por_cidade (a série em percentagem, 1 casa decimal) e pct_lisboa.',
      starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

pct_por_cidade = None
pct_lisboa = None
print(pct_por_cidade)`,
      solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

pct_por_cidade = (clientes["cidade"].value_counts(normalize=True) * 100).round(1)
pct_lisboa = float(pct_por_cidade["Lisboa"])
print(pct_por_cidade)`,
      checks: [
        { label: 'pct_lisboa (21.7%) e a série soma cerca de 100', expr: 'abs(float(pct_lisboa) - 21.7) < 0.05 and abs(float(pct_por_cidade.sum()) - 100) < 0.5', actualExpr: '(pct_lisboa, float(pct_por_cidade.sum()) if pct_por_cidade is not None else None)', hint: '(clientes["cidade"].value_counts(normalize=True) * 100).round(1).' },
        { label: 'Funciona com outra tabela', expr: 'abs(float(correr_com(clientes=pd.DataFrame({"cidade": ["Lisboa", "Porto", "Porto", "Porto"]}))["pct_lisboa"]) - 25.0) < 0.001', actualExpr: 'correr_com(clientes=pd.DataFrame({"cidade": ["Lisboa", "Porto", "Porto", "Porto"]})).get("pct_lisboa")', hint: 'normalize=True divide cada contagem pelo total.' },
      ],
    },
  ],
  'pd-05-groupby-merge': [
    {
      title: 'Faturação por cidade',
      description: 'Junta dados/vendas.csv a dados/clientes.csv (cliente_id com id) e soma quantidade × preco por cidade. Guarda cidade_top e faturacao_top (2 casas).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
clientes = pd.read_csv("dados/clientes.csv")

cidade_top = None
faturacao_top = None
print(cidade_top, faturacao_top)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

juntas = pd.merge(vendas, clientes, left_on="cliente_id", right_on="id")
por_cidade = juntas.groupby("cidade")["sub"].sum()
cidade_top = por_cidade.idxmax()
faturacao_top = round(float(por_cidade.max()), 2)
print(cidade_top, faturacao_top)`,
      checks: [
        { label: 'cidade_top ("Lisboa") e faturacao_top (5 885.34 €)', expr: 'cidade_top == "Lisboa" and abs(float(faturacao_top) - 5885.34) < 0.01', actualExpr: '(cidade_top, faturacao_top)', hint: 'pd.merge(vendas, clientes, left_on="cliente_id", right_on="id"), depois groupby("cidade").' },
        { label: 'Funciona com outras tabelas', expr: 'correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 2], "quantidade": [9, 1, 1], "preco": [1.0, 2.0, 2.0]}), clientes=pd.DataFrame({"id": [1, 2], "nome": ["A", "B"], "cidade": ["Faro", "Beja"]}))["cidade_top"] == "Faro"', actualExpr: 'correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 2], "quantidade": [9, 1, 1], "preco": [1.0, 2.0, 2.0]}), clientes=pd.DataFrame({"id": [1, 2], "nome": ["A", "B"], "cidade": ["Faro", "Beja"]})).get("cidade_top")', hint: 'O merge e o groupby têm de partir de vendas e clientes.' },
      ],
    },
    {
      title: 'Quantos clientes compram cada categoria?',
      description: 'Junta dados/vendas.csv a dados/produtos.csv (produto_id com id) e conta, por categoria, os clientes diferentes (.nunique()). Guarda clientes_por_categoria e categoria_menos_clientes.',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")

clientes_por_categoria = None
categoria_menos_clientes = None
print(clientes_por_categoria)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")

juntas = pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
clientes_por_categoria = juntas.groupby("categoria")["cliente_id"].nunique()
categoria_menos_clientes = clientes_por_categoria.idxmin()
print(clientes_por_categoria)`,
      checks: [
        { label: 'Padaria tem menos clientes (111) e Charcutaria tem 120', expr: 'categoria_menos_clientes == "Padaria" and int(clientes_por_categoria["Padaria"]) == 111 and int(clientes_por_categoria["Charcutaria"]) == 120', actualExpr: '(categoria_menos_clientes, dict(clientes_por_categoria) if clientes_por_categoria is not None else None)', hint: 'groupby("categoria")["cliente_id"].nunique() conta cada cliente uma vez por categoria.' },
        { label: 'Conta clientes diferentes, não linhas', expr: 'int(correr_com(vendas=pd.DataFrame({"produto_id": [1, 1, 1], "cliente_id": [7, 7, 8]}), produtos=pd.DataFrame({"id": [1], "categoria": ["Bebidas"]}))["clientes_por_categoria"]["Bebidas"]) == 2', actualExpr: 'correr_com(vendas=pd.DataFrame({"produto_id": [1, 1, 1], "cliente_id": [7, 7, 8]}), produtos=pd.DataFrame({"id": [1], "categoria": ["Bebidas"]})).get("clientes_por_categoria")', hint: 'Com .count() o cliente 7 contava duas vezes; .nunique() conta-o uma.' },
      ],
    },
  ],
  'pd-06-limpeza-sujas': [
    {
      title: 'Normalizar nomes de produtos',
      description: 'Em dados/vendas_sujas.csv há " Pão ", "pão" e "Pão" como se fossem produtos diferentes. Guarda nomes_antes (produtos diferentes no ficheiro original) e nomes_depois (depois de .str.strip().str.capitalize()).',
      starterCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")

nomes_antes = None
nomes_depois = None
print(nomes_antes, nomes_depois)`,
      solutionCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")

nomes_antes = sujas["produto"].nunique()
limpos = sujas["produto"].str.strip().str.capitalize()
nomes_depois = limpos.nunique()
print(nomes_antes, nomes_depois, sorted(limpos.dropna().unique()))`,
      checks: [
        { label: 'nomes_antes (8) e nomes_depois (6)', expr: 'int(nomes_antes) == 8 and int(nomes_depois) == 6', actualExpr: '(nomes_antes, nomes_depois)', hint: 'sujas["produto"].nunique() antes e depois de .str.strip().str.capitalize().' },
        { label: 'Funciona com outra tabela', expr: '(lambda r: int(r["nomes_antes"]) == 3 and int(r["nomes_depois"]) == 1)(correr_com(sujas=pd.DataFrame({"produto": [" leite", "Leite ", "LEITE"]})))', actualExpr: 'correr_com(sujas=pd.DataFrame({"produto": [" leite", "Leite ", "LEITE"]})).get("nomes_depois")', hint: 'Limpa a coluna de sujas, não escrevas os números.' },
      ],
    },
    {
      title: 'Relatório de problemas',
      description: 'Antes de limpar, mede o estrago em dados/vendas_sujas.csv. Guarda linhas_com_vazios (linhas com pelo menos um valor em falta), duplicados (linhas exatamente repetidas) e precos_com_virgula (preços escritos com vírgula).',
      starterCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")

linhas_com_vazios = None
duplicados = None
precos_com_virgula = None
print(linhas_com_vazios, duplicados, precos_com_virgula)`,
      solutionCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")

linhas_com_vazios = int(sujas.isna().any(axis=1).sum())
duplicados = int(sujas.duplicated().sum())
precos_com_virgula = int(sujas["preco"].astype(str).str.contains(",").sum())
print(linhas_com_vazios, duplicados, precos_com_virgula)`,
      checks: [
        { label: 'linhas_com_vazios (2) e duplicados (2)', expr: 'int(linhas_com_vazios) == 2 and int(duplicados) == 2', actualExpr: '(linhas_com_vazios, duplicados)', hint: 'sujas.isna().any(axis=1).sum() e sujas.duplicated().sum().' },
        { label: 'precos_com_virgula (1)', expr: 'int(precos_com_virgula) == 1', actualExpr: 'precos_com_virgula', hint: 'sujas["preco"].astype(str).str.contains(",").sum().' },
        { label: 'Funciona com outra tabela', expr: '(lambda r: int(r["linhas_com_vazios"]) == 1 and int(r["duplicados"]) == 1 and int(r["precos_com_virgula"]) == 2)(correr_com(sujas=pd.DataFrame({"produto": ["A", "A", None], "preco": ["1,5", "1,5", "2"]})))', actualExpr: 'correr_com(sujas=pd.DataFrame({"produto": ["A", "A", None], "preco": ["1,5", "1,5", "2"]})).get("duplicados")', hint: 'Mede a partir de sujas, sem escrever os números.' },
      ],
    },
  ],
  'pd-07-pivot-transform': [
    {
      title: 'Peso de cada categoria',
      description: 'Junta vendas.csv a produtos.csv e calcula a quota de cada categoria na faturação total, em percentagem com 2 casas. Guarda quotas (série por categoria) e quota_mercearia.',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")

quotas = None
quota_mercearia = None
print(quotas)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

juntas = pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
por_categoria = juntas.groupby("categoria")["sub"].sum()
quotas = (por_categoria / por_categoria.sum() * 100).round(2)
quota_mercearia = float(quotas["Mercearia"])
print(quotas.sort_values(ascending=False))`,
      checks: [
        { label: 'quota_mercearia (51.59%) e as quotas somam 100', expr: 'abs(float(quota_mercearia) - 51.59) < 0.01 and abs(float(quotas.sum()) - 100) < 0.05', actualExpr: '(quota_mercearia, float(quotas.sum()) if quotas is not None else None)', hint: 'Divide a soma de cada categoria pela soma total e multiplica por 100.' },
        { label: 'Funciona com outras tabelas', expr: 'abs(float(correr_com(vendas=pd.DataFrame({"produto_id": [1, 2], "quantidade": [3, 1], "preco": [1.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]}))["quota_mercearia"]) - 75.0) < 0.001', actualExpr: 'correr_com(vendas=pd.DataFrame({"produto_id": [1, 2], "quantidade": [3, 1], "preco": [1.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]})).get("quota_mercearia")', hint: 'Calcula a quota a partir dos totais, sem números escritos à mão.' },
      ],
    },
    {
      title: 'Matriz cidade × categoria',
      description: 'Junta vendas.csv a produtos.csv e a clientes.csv e cria matriz = pivot_table da faturação com cidade nas linhas e categoria nas colunas (fill_value=0). Guarda lisboa_charcutaria (2 casas) e celula_maior (tuplo (cidade, categoria) com o valor mais alto, com .stack().idxmax()).',
      starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")

matriz = None
lisboa_charcutaria = None
celula_maior = None
print(matriz)`,
      solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

juntas = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
juntas = juntas.merge(clientes[["id", "cidade"]], left_on="cliente_id", right_on="id")
matriz = juntas.pivot_table(values="sub", index="cidade", columns="categoria", aggfunc="sum", fill_value=0)
lisboa_charcutaria = round(float(matriz.loc["Lisboa", "Charcutaria"]), 2)
celula_maior = matriz.stack().idxmax()
print(matriz.round(2))`,
      checks: [
        { label: 'matriz 6 × 6 e lisboa_charcutaria (1 655.70 €)', expr: 'tuple(matriz.shape) == (6, 6) and abs(float(lisboa_charcutaria) - 1655.70) < 0.01', actualExpr: '(getattr(matriz, "shape", None), lisboa_charcutaria)', hint: 'pivot_table(values="sub", index="cidade", columns="categoria", aggfunc="sum", fill_value=0).' },
        { label: 'celula_maior = (Lisboa, Mercearia)', expr: 'tuple(celula_maior) == ("Lisboa", "Mercearia")', actualExpr: 'celula_maior', hint: 'matriz.stack() transforma a matriz numa série com índice (cidade, categoria); .idxmax() dá o par do maior valor.' },
      ],
    },
  ],
  'pd-08-numpy-estatistica': [
    {
      title: 'Uma amostra e a população',
      description: 'Em dados/vendas.csv (sub = quantidade × preco), tira amostra = df.sample(500, random_state=1). Guarda media_populacao (média de sub em todas as linhas), media_amostra (média de sub na amostra) e erro_amostra (diferença absoluta entre as duas, com abs()).',
      starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

amostra = None
media_populacao = None
media_amostra = None
erro_amostra = None
print(media_populacao, media_amostra, erro_amostra)`,
      solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

amostra = df.sample(500, random_state=1)
media_populacao = df["sub"].mean()
media_amostra = amostra["sub"].mean()
erro_amostra = abs(media_amostra - media_populacao)
print(round(media_populacao, 3), round(media_amostra, 3), round(erro_amostra, 3))`,
      checks: [
        { label: 'Amostra de 500 linhas e media_populacao (5.298 €)', expr: 'len(amostra) == 500 and abs(float(media_populacao) - 5.2979) < 0.001', actualExpr: '(len(amostra) if amostra is not None else None, media_populacao)', hint: 'df.sample(500, random_state=1) e df["sub"].mean().' },
        { label: 'media_amostra e erro_amostra calculados da amostra', expr: 'abs(float(media_amostra) - amostra["sub"].mean()) < 1e-9 and abs(float(erro_amostra) - abs(amostra["sub"].mean() - df["sub"].mean())) < 1e-9', actualExpr: '(media_amostra, erro_amostra)', hint: 'erro_amostra = abs(media_amostra - media_populacao).' },
      ],
    },
    {
      title: 'Contagens esperadas com np.outer',
      description: 'Numa loja, 30% das compras são de manhã e 70% à tarde; 40% são de Pão e 60% de Leite. Em 100 compras, se a hora e o produto não tivessem relação, quantas esperaríamos em cada combinação? Usa np.outer(linhas, colunas) / total para guardar esperados (array 2 × 2) e esperado_tarde_leite.',
      starterCode: `import numpy as np

total = 100
totais_linhas = np.array([30, 70])    # manhã, tarde
totais_colunas = np.array([40, 60])   # Pão, Leite

esperados = None
esperado_tarde_leite = None
print(esperados)`,
      solutionCode: `import numpy as np

total = 100
totais_linhas = np.array([30, 70])    # manhã, tarde
totais_colunas = np.array([40, 60])   # Pão, Leite

esperados = np.outer(totais_linhas, totais_colunas) / total
esperado_tarde_leite = esperados[1, 1]
print(esperados)`,
      checks: [
        { label: 'esperados = [[12, 18], [28, 42]]', expr: 'np.allclose(esperados, [[12, 18], [28, 42]])', actualExpr: 'esperados.tolist() if hasattr(esperados, "tolist") else esperados', hint: 'np.outer(totais_linhas, totais_colunas) / total.' },
        { label: 'esperado_tarde_leite (42) lido do array', expr: 'abs(float(esperado_tarde_leite) - 42) < 1e-9', actualExpr: 'esperado_tarde_leite', hint: 'Linha 1 (tarde), coluna 1 (Leite): esperados[1, 1].' },
        { label: 'Funciona com outros totais', expr: 'np.allclose(correr_com(totais_linhas=np.array([50, 50]))["esperados"], [[20, 30], [20, 30]])', actualExpr: 'correr_com(totais_linhas=np.array([50, 50])).get("esperados")', hint: 'Usa as variáveis totais_linhas, totais_colunas e total.' },
      ],
    },
  ],
};
