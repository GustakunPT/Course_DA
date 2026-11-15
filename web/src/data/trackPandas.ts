import type { Track } from './types';

export const pandasTrack: Track = {
  id: 'pandas',
  shortTitle: '3. Pandas',
  fullTitle: 'Pandas e Oficina de Limpeza de Dados',
  summary: 'DataFrames, filtros, texto e datas, groupby, merge e limpeza de vendas_sujas.csv, praticados aqui no browser. Para treinar mais, cada tema tem um caderno Jupyter com 16 tarefas na pasta cadernos/ do projeto.',
  engineLabel: 'Python + pandas (WebAssembly)',
  lessons: [
    {
      id: 'pd-01-dataframes',
      code: '01',
      title: 'DataFrames, colunas e contagens',
      lede: 'Enquanto em Python puro percorres linhas num ciclo for, o pandas carrega a tabela inteira num DataFrame e opera sobre colunas completas de uma só vez.',
      analogyTitle: 'Uma folha de cálculo superpoderosa controlada por código',
      analogyBody: 'Um DataFrame tem linhas numeradas e colunas com nome. Podes multiplicar a coluna quantidade inteira pela coluna preco numa única instrução vetorizada.',
      concepts: [
        'pd.read_csv("dados/vendas.csv") lê as 5 078 linhas e deteta automaticamente inteiros e decimais.',
        'df.shape devolve (linhas, colunas), df.columns lista os cabeçalhos e df["produto"].iloc[0] lê a primeira célula.',
        'Operações vetorizadas: df["subtotal"] = df["quantidade"] * df["preco"] calcula 5 078 subtotais instantaneamente.',
      ],
      referenceTitle: 'Inspeção de DataFrames (W3Schools Pandas)',
      referenceRows: [
        { syntax: 'pd.read_csv(caminho)', meaning: 'Carrega CSV para DataFrame', example: 'df = pd.read_csv("dados/vendas.csv")' },
        { syntax: 'df.shape / len(df)', meaning: 'Dimensões (linhas, colunas) / total de linhas', example: '(5078, 6)' },
        { syntax: 'df["col"].sum() / .mean()', meaning: 'Soma ou média de uma Series', example: 'df["quantidade"].sum()' },
        { syntax: 'df["col"].nunique()', meaning: 'Contagem de valores únicos', example: 'df["produto"].nunique() -> 15' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["subtotal"] = df["quantidade"] * df["preco"]
print("Formato:", df.shape, "| Faturação:", round(df["subtotal"].sum(), 2))
df.head(5)`,
      pythonChallenge: {
        description: 'Sobre dados/vendas.csv: guarda em linhas o número de linhas, em colunas a lista de nomes de colunas, em primeiro_produto o produto da linha 0 e em faturacao_total a soma arredondada a 2 casas de quantidade * preco.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

linhas = None
colunas = None
primeiro_produto = None
faturacao_total = None

print(linhas, primeiro_produto, faturacao_total)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

linhas = len(df)
colunas = list(df.columns)
primeiro_produto = df["produto"].iloc[0]
faturacao_total = round(float((df["quantidade"] * df["preco"]).sum()), 2)

print(linhas, primeiro_produto, faturacao_total)`,
        checks: [
          { label: 'linhas (5078)', expr: 'int(linhas) == 5078', actualExpr: 'linhas', hint: 'Usa len(df).' },
          { label: 'colunas', expr: 'colunas == ["data", "cliente_id", "produto_id", "produto", "quantidade", "preco"]', actualExpr: 'colunas', hint: 'Usa list(df.columns).' },
          { label: 'primeiro_produto ("Pão")', expr: 'primeiro_produto == "Pão"', actualExpr: 'primeiro_produto', hint: 'Usa df["produto"].iloc[0].' },
          { label: 'faturacao_total (26902.89)', expr: 'math.isclose(float(faturacao_total), 26902.89, abs_tol=0.02)', actualExpr: 'faturacao_total', hint: 'Calcula round((df["quantidade"] * df["preco"]).sum(), 2).' },
          { label: 'O código funciona com outra tabela de vendas', expr: '(lambda r: int(r["linhas"]) == 1 and r["primeiro_produto"] == "Leite" and abs(float(r["faturacao_total"]) - 1.5) < 0.001)(correr_com(df=pd.DataFrame({"data": ["2025-01-01"], "cliente_id": [1], "produto_id": [2], "produto": ["Leite"], "quantidade": [3], "preco": [0.5]})))', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-01-01"], "cliente_id": [1], "produto_id": [2], "produto": ["Leite"], "quantidade": [3], "preco": [0.5]})).get("faturacao_total")', hint: 'Calcula tudo a partir de df (len, .iloc[0], soma de quantidade × preco), sem escrever os números à mão.' },
        ],
      },
      quiz: {
        question: 'Qual atributo do pandas devolve o par (número_de_linhas, número_de_colunas) sem parênteses?',
        options: [
          'df.size()',
          'df.shape',
          'df.count()',
          'len(df)',
        ],
        correctIndex: 1,
        explanation: 'df.shape é um atributo (não leva parênteses) e devolve um tuplo como (5078, 6).',
      },
    },
    {
      id: 'pd-02-filtros',
      code: '02',
      title: 'Máscaras booleanas, .loc e .isin()',
      lede: 'Filtra milhares de registos combinando condições com & (e), | (ou) e listas de pertença com .isin().',
      analogyTitle: 'O crivo transparente sobre a tabela',
      analogyBody: 'Uma condição como df["preco"] > 3.00 cria uma coluna de True e False. Quando passas essa máscara dentro de df[...], só ficam visíveis as linhas marcadas com True.',
      concepts: [
        'Em pandas usa-se & em vez de and, | em vez de or e ~ em vez de not, rodeando cada condição com parênteses curvos!',
        'df[df["produto"].isin(["Azeite", "Café"])] é o equivalente direto do WHERE produto IN (...) do SQL.',
        '.loc seleciona por rótulo/condição e .iloc seleciona por posição inteira.',
      ],
      referenceTitle: 'Filtragem em pandas (W3Schools)',
      referenceRows: [
        { syntax: 'df[df["preco"] > 2]', meaning: 'Filtro simples por condição', example: 'Artigos acima de 2 €' },
        { syntax: 'df[(c1) & (c2)]', meaning: 'Duas condições em simultâneo (parênteses obrigatórios)', example: 'df[(df["produto"] == "Azeite") & (df["quantidade"] >= 3)]' },
        { syntax: 'df["col"].isin(lista)', meaning: 'Filtra valores presentes numa lista', example: 'df["cidade"].isin(["Porto", "Gaia"])' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
azeite_grande = df[(df["produto"] == "Azeite") & (df["quantidade"] >= 4)]
print("Vendas grandes de Azeite:", len(azeite_grande))
azeite_grande.head(5)`,
      pythonChallenge: {
        description: 'Filtra dados/vendas.csv: conta em qtd_vendas_cafe quantas linhas são do produto "Café" e calcula em unidades_dezembro a soma de quantidade das vendas ocorridas em dezembro de 2025 (data >= "2025-12-01").',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

qtd_vendas_cafe = None
unidades_dezembro = None

print(qtd_vendas_cafe, unidades_dezembro)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")

qtd_vendas_cafe = int(len(df[df["produto"] == "Café"]))
unidades_dezembro = int(df[df["data"] >= "2025-12-01"]["quantidade"].sum())

print(qtd_vendas_cafe, unidades_dezembro)`,
        checks: [
          { label: 'qtd_vendas_cafe', expr: 'int(qtd_vendas_cafe) == int((pd.read_csv("dados/vendas.csv")["produto"] == "Café").sum())', actualExpr: 'qtd_vendas_cafe', hint: 'Usa len(df[df["produto"] == "Café"]).' },
          { label: 'unidades_dezembro', expr: 'int(unidades_dezembro) == int(pd.read_csv("dados/vendas.csv").query("data >= \'2025-12-01\'")["quantidade"].sum())', actualExpr: 'unidades_dezembro', hint: 'Filtra df[df["data"] >= "2025-12-01"]["quantidade"].sum().' },
          { label: 'Os filtros funcionam com outra tabela', expr: '(lambda r: int(r["qtd_vendas_cafe"]) == 2 and int(r["unidades_dezembro"]) == 6)(correr_com(df=pd.DataFrame({"data": ["2025-12-05", "2025-11-30", "2025-12-20"], "produto": ["Café", "Café", "Pão"], "quantidade": [2, 5, 4]})))', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-12-05", "2025-11-30", "2025-12-20"], "produto": ["Café", "Café", "Pão"], "quantidade": [2, 5, 4]})).get("unidades_dezembro")', hint: 'Usa máscaras sobre df: df[df["produto"] == "Café"] e df[df["data"] >= "2025-12-01"].' },
        ],
      },
      quiz: {
        question: 'Porque é que df[df["preco"] > 1 & df["quantidade"] > 2] dá erro em pandas?',
        options: [
          'Porque o pandas usa and em vez de &.',
          'Porque o & é avaliado antes do >; faltam parênteses.',
          'Porque não se pode filtrar duas colunas ao mesmo tempo.',
          'Porque falta escrever .loc antes dos parênteses retos.',
        ],
        correctIndex: 1,
        explanation: 'Em pandas envolve sempre cada comparação entre parênteses curvos antes de ligar com & ou |.',
      },
    },
    {
      id: 'pd-03-texto-datas',
      code: '03',
      title: 'Acessores .str e datas com pd.to_datetime',
      lede: 'Transforma colunas inteiras de texto com .str e extrai ano, mês e dia da semana com .dt.',
      analogyTitle: 'Carimbo automático em toda a coluna',
      analogyBody: 'Em vez de escrever um ciclo para limpar espaços ou extrair o mês de 5 078 datas, os acessores .str e .dt aplicam a operação à coluna inteira.',
      concepts: [
        'df["produto"].str.strip().str.capitalize() limpa espaços e uniformiza maiúsculas.',
        'pd.to_datetime(df["data"]) converte texto ISO em datas reais do pandas.',
        'Com uma coluna datetime, .dt.month devolve o mês (1 a 12) e .dt.day_name() devolve o dia da semana.',
      ],
      referenceTitle: 'Operações vetorizadas de texto e tempo',
      referenceRows: [
        { syntax: 's.str.strip() / .str.lower()', meaning: 'Limpa espaços / converte para minúsculas', example: 'sujas["produto"].str.strip()' },
        { syntax: 's.str.contains("kg", regex=False)', meaning: 'Procura substring em cada linha', example: 'Produtos vendidos ao quilo' },
        { syntax: 'pd.to_datetime(s).dt.month', meaning: 'Converte data e extrai número do mês', example: 'df["mes"] = datas.dt.month' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["data"] = pd.to_datetime(df["data"])
df["mes"] = df["data"].dt.month
df["subtotal"] = df["quantidade"] * df["preco"]

df.groupby("mes", as_index=False)["subtotal"].sum().round(2).head(6)`,
      pythonChallenge: {
        description: 'Em dados/produtos.csv, conta em produtos_ao_quilo quantos produtos têm "(kg)" no nome (usa .str.contains("(kg)", regex=False)) e guarda em mes_pico o número do mês (1 a 12) com maior faturação em vendas.csv.',
        starterCode: `import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
vendas = pd.read_csv("dados/vendas.csv")

produtos_ao_quilo = None
mes_pico = None

print(produtos_ao_quilo, mes_pico)`,
        solutionCode: `import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
vendas = pd.read_csv("dados/vendas.csv")

produtos_ao_quilo = int(produtos["nome"].str.contains("(kg)", regex=False).sum())
vendas["mes"] = pd.to_datetime(vendas["data"]).dt.month
vendas["sub"] = vendas["quantidade"] * vendas["preco"]
mes_pico = int(vendas.groupby("mes")["sub"].sum().idxmax())

print(produtos_ao_quilo, mes_pico)`,
        checks: [
          { label: 'produtos_ao_quilo (2)', expr: 'int(produtos_ao_quilo) == 2', actualExpr: 'produtos_ao_quilo', hint: 'Maçãs (kg) e Bananas (kg): usa produtos["nome"].str.contains("(kg)", regex=False).sum().' },
          { label: 'mes_pico (9 - setembro)', expr: 'int(mes_pico) == 9', actualExpr: 'mes_pico', hint: 'Setembro (mês 9) lidera com 2 462,82 €.' },
          { label: 'Funciona com outros produtos e vendas', expr: '(lambda r: int(r["produtos_ao_quilo"]) == 1 and int(r["mes_pico"]) == 7)(correr_com(produtos=pd.DataFrame({"nome": ["Uvas (kg)", "Pão"]}), vendas=pd.DataFrame({"data": ["2025-03-01", "2025-07-02", "2025-07-09"], "quantidade": [1, 2, 2], "preco": [1.0, 3.0, 1.0]})))', actualExpr: 'correr_com(produtos=pd.DataFrame({"nome": ["Uvas (kg)", "Pão"]}), vendas=pd.DataFrame({"data": ["2025-03-01", "2025-07-02", "2025-07-09"], "quantidade": [1, 2, 2], "preco": [1.0, 3.0, 1.0]})).get("mes_pico")', hint: 'Conta com .str.contains("(kg)", regex=False) e encontra o mês com .dt.month e .idxmax().' },
        ],
      },
      quiz: {
        question: 'Depois de converter df["data"] = pd.to_datetime(df["data"]), como obténs o mês numérico de cada linha?',
        options: [
          'df["data"].month',
          'df["data"].dt.month',
          'df["data"].str.month',
          'df["data"].month()',
        ],
        correctIndex: 1,
        explanation: 'O acessor .dt expõe propriedades temporais (year, month, day, dayofweek) para toda a Series.',
      },
    },
    {
      id: 'pd-04-ordenacao-contagens',
      code: '04',
      title: 'Ordenação (.sort_values) e frequências (.value_counts)',
      lede: 'Descobre rapidamente distribuições de frequência, percentagens por cidade e rankings multi-coluna.',
      analogyTitle: 'Contar fichas por cidade num segundo',
      analogyBody: 'value_counts() é o atalho favorito dos analistas em exploração inicial: conta ocorrências e ordena automaticamente do mais frequente para o mais raro.',
      concepts: [
        'df["cidade"].value_counts() conta quantos clientes existem em cada cidade.',
        'value_counts(normaliza=True) devolve logo a proporção relativa (entre 0 e 1).',
        'df.sort_values(by="preco", ascending=False) ordena do maior para o menor.',
      ],
      referenceTitle: 'Rankings e frequências',
      referenceRows: [
        { syntax: 's.value_counts()', meaning: 'Frequência absoluta ordenada', example: 'clientes["cidade"].value_counts()' },
        { syntax: 's.value_counts(normaliza=True)', meaning: 'Frequência relativa (quota)', example: '(s.value_counts(normaliza=True) * 100).round(1)' },
        { syntax: 'df.sort_values("col", ascending=False)', meaning: 'Ordena DataFrame decrescente', example: 'produtos.sort_values("preco", ascending=False)' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
resumo = clientes["cidade"].value_counts().rename_axis("cidade").reset_index(name="num_clientes")
resumo`,
      pythonChallenge: {
        description: 'A partir de dados/clientes.csv, guarda em cidade_mais_clientes o nome da cidade com mais fichas de cliente (usa .value_counts().index[0]) e em qtd_nessa_cidade o número de clientes dessa cidade.',
        starterCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")

cidade_mais_clientes = None
qtd_nessa_cidade = None

print(cidade_mais_clientes, qtd_nessa_cidade)`,
        solutionCode: `import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
contagem = clientes["cidade"].value_counts()

cidade_mais_clientes = str(contagem.index[0])
qtd_nessa_cidade = int(contagem.iloc[0])

print(cidade_mais_clientes, qtd_nessa_cidade)`,
        checks: [
          { label: 'cidade_mais_clientes', expr: 'cidade_mais_clientes == str(pd.read_csv("dados/clientes.csv")["cidade"].value_counts().index[0])', actualExpr: 'cidade_mais_clientes', hint: 'Usa clientes["cidade"].value_counts().index[0].' },
          { label: 'qtd_nessa_cidade', expr: 'int(qtd_nessa_cidade) == int(pd.read_csv("dados/clientes.csv")["cidade"].value_counts().iloc[0])', actualExpr: 'qtd_nessa_cidade', hint: 'Usa clientes["cidade"].value_counts().iloc[0].' },
          { label: 'Funciona com outra tabela de clientes', expr: '(lambda r: r["cidade_mais_clientes"] == "Faro" and int(r["qtd_nessa_cidade"]) == 2)(correr_com(clientes=pd.DataFrame({"cidade": ["Faro", "Porto", "Faro"]})))', actualExpr: 'correr_com(clientes=pd.DataFrame({"cidade": ["Faro", "Porto", "Faro"]})).get("cidade_mais_clientes")', hint: 'Lê a resposta de clientes["cidade"].value_counts(): .index[0] e .iloc[0].' },
        ],
      },
      quiz: {
        question: 'Que parâmetro de value_counts() devolve percentagens/proporções em vez de contagens absolutas?',
        options: [
          'percent=True',
          'normaliza=True',
          'ratio=True',
          'proportion=True',
        ],
        correctIndex: 1,
        explanation: 'normaliza=True divide cada contagem pelo total de elementos válidos.',
      },
    },
    {
      id: 'pd-05-groupby-merge',
      code: '05',
      title: 'Agrupar (.groupby) e juntar tabelas (pd.merge)',
      lede: 'Domina os equivalentes em pandas do GROUP BY e do JOIN do SQL para cruzar vendas com categorias e cidades.',
      analogyTitle: 'Cruzar folhas diferentes como um PROCX relacional',
      analogyBody: 'pd.merge() junta a tabela de vendas com o catálogo de produtos ou fichas de clientes pela chave partilhada, permitindo calcular faturação por categoria ou cidade.',
      concepts: [
        'pd.merge(vendas, produtos, left_on="produto_id", right_on="id", how="inner") liga chaves com nomes diferentes.',
        'how="left" funciona exatamente como o LEFT JOIN do SQL.',
        '.groupby("categoria").agg(unidades=("quantidade", "sum"), faturacao=("subtotal", "sum")) calcula várias métricas num só passo.',
      ],
      referenceTitle: 'Agrupamento e junções (W3Schools Pandas)',
      referenceRows: [
        { syntax: 'df.groupby("col")["val"].sum()', meaning: 'Soma agrupada por chave', example: 'vendas.groupby("produto")["quantidade"].sum()' },
        { syntax: 'df.groupby("c").agg(...)', meaning: 'Múltiplas agregações nomeadas', example: '.agg(total=("sub", "sum"), media=("sub", "mean"))' },
        { syntax: 'pd.merge(a, b, left_on=..., right_on=...)', meaning: 'JOIN relacional entre dois DataFrames', example: 'pd.merge(vendas, clientes, left_on="cliente_id", right_on="id")' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

cruzado = pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
cruzado.groupby("categoria", as_index=False).agg(
    unidades=("quantidade", "sum"),
    faturacao=("subtotal", "sum")
).sort_values("faturacao", ascending=False).round(2)`,
      pythonChallenge: {
        description: 'Cruza vendas.csv com produtos.csv e guarda em categoria_lider o nome da categoria com maior faturação total e em faturacao_mercearia o valor faturado pela categoria "Mercearia" arredondado a 2 casas.',
        starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

categoria_lider = None
faturacao_mercearia = None

print(categoria_lider, faturacao_mercearia)`,
        solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

df_cat = pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
por_cat = df_cat.groupby("categoria")["subtotal"].sum()

categoria_lider = str(por_cat.idxmax())
faturacao_mercearia = round(float(por_cat["Mercearia"]), 2)

print(categoria_lider, faturacao_mercearia)`,
        checks: [
          { label: 'categoria_lider ("Mercearia")', expr: 'categoria_lider == "Mercearia"', actualExpr: 'categoria_lider', hint: 'A categoria Mercearia inclui Azeite, Café e Ovos.' },
          { label: 'faturacao_mercearia (13879.84)', expr: 'math.isclose(float(faturacao_mercearia), 13879.84, abs_tol=0.5)', actualExpr: 'faturacao_mercearia', hint: 'Soma subtotal para a categoria "Mercearia" e arredonda a 2 casas (esperado: 13 879,84 €).' },
          { label: 'O merge e o groupby funcionam com outras tabelas', expr: '(lambda r: r["categoria_lider"] == "Bebidas" and abs(float(r["faturacao_mercearia"]) - 5.0) < 0.001)(correr_com(vendas=pd.DataFrame({"produto_id": [1, 2], "quantidade": [1, 10], "preco": [5.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]})))', actualExpr: 'correr_com(vendas=pd.DataFrame({"produto_id": [1, 2], "quantidade": [1, 10], "preco": [5.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]})).get("categoria_lider")', hint: 'Junta com pd.merge(vendas, produtos, left_on="produto_id", right_on="id") e soma por categoria.' },
        ],
      },
      quiz: {
        question: 'Em pd.merge(vendas, clientes, left_on="cliente_id", right_on="id", how="left"), que parâmetro define o tipo de JOIN?',
        options: [
          'join="left"',
          'how="left"',
          'mode="left"',
          'on="left"',
        ],
        correctIndex: 1,
        explanation: 'No pandas o parâmetro how aceita "inner" (padrão), "left", "right" ou "outer".',
      },
    },
    {
      id: 'pd-06-limpeza-sujas',
      code: '06',
      title: 'Oficina de Limpeza: vendas_sujas.csv',
      lede: 'Na vida real, limpar dados ocupa grande parte do tempo de um analista: células vazias, linhas duplicadas, vírgulas decimais, espaços e preços impossíveis.',
      analogyTitle: 'Escolher o feijão antes de o pôr na panela',
      analogyBody: 'O ficheiro dados/vendas_sujas.csv tem 12 linhas com todas as armadilhas reais de um ficheiro vindo de fora: " Pão ", "pão", "2,35", preços negativos (-1.00), vazios e duplicados exatos.',
      concepts: [
        'sujas.isna().sum() audita valores em falta por coluna e sujas.duplicated().sum() conta linhas repetidas.',
        'pd.to_numeric(s.astype(str).str.replace(",", "."), errors="coerce") converte vírgulas decimais em float.',
        'Pipeline completo: padronizar texto -> converter números -> remover duplicados -> filtrar nulos e preços <= 0.',
      ],
      referenceTitle: 'Caixa de ferramentas de limpeza em pandas',
      referenceRows: [
        { syntax: 'df.isna().sum()', meaning: 'Conta valores nulos por coluna', example: 'sujas.isna().sum()' },
        { syntax: 'df.drop_duplicates()', meaning: 'Remove linhas repetidas', example: 'limpa = sujas.drop_duplicates()' },
        { syntax: 'df.dropna(subset=[...])', meaning: 'Remove linhas com vazio nas colunas críticas', example: 'limpa.dropna(subset=["produto", "quantidade"])' },
        { syntax: 'pd.to_numeric(s, errors="coerce")', meaning: 'Converte para número ou NaN se inválido', example: 'Converte "2,35" após replace' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")
print("Linhas brutas:", len(sujas), "| Vazios totais:", int(sujas.isna().sum().sum()))
sujas`,
      pythonChallenge: {
        description: 'Limpa dados/vendas_sujas.csv passo a passo: 1) limpa espaços e faz .str.capitalize() em produto (mantendo NaN onde está vazio); 2) converte preco trocando "," por "."; 3) remove duplicados exatos; 4) descarte linhas com valores nulos ou preco <= 0. Guarda o DataFrame final em limpas e a faturação limpa arredondada em total_limpo.',
        starterCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")

# Escreve aqui o pipeline de limpeza para criar limpas e total_limpo:
limpas = None
total_limpo = None

print("Linhas válidas:", len(limpas) if limpas is not None else None, "| Total:", total_limpo)`,
        solutionCode: `import pandas as pd

sujas = pd.read_csv("dados/vendas_sujas.csv")
df = sujas.copy()
df["produto"] = df["produto"].str.strip().str.capitalize()
df["preco"] = pd.to_numeric(df["preco"].astype(str).str.replace(",", "."), errors="coerce")
df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce")
df = df.drop_duplicates()
limpas = df.dropna(subset=["data", "produto", "quantidade", "preco"])
limpas = limpas[(limpas["preco"] > 0) & (limpas["quantidade"] > 0)].copy()

total_limpo = round(float((limpas["quantidade"] * limpas["preco"]).sum()), 2)
print("Linhas válidas:", len(limpas), "| Total:", total_limpo)
limpas`,
        checks: [
          { label: 'len(limpas) == 7 linhas válidas', expr: 'limpas is not None and len(limpas) == 7', actualExpr: 'len(limpas) if limpas is not None else None', hint: 'Das 12 linhas saem 2 duplicadas, 2 com nulos e 1 com preço -1.00, restando 7.' },
          { label: 'total_limpo == 18.18 €', expr: 'total_limpo is not None and math.isclose(float(total_limpo), 18.18, abs_tol=0.02)', actualExpr: 'total_limpo', hint: 'Soma quantidade * preco das 7 linhas limpas (0.50 + 0.75 + 2.35 + 7.50 + 1.78 + 4.80 + 0.50 = 18.18).' },
          { label: 'A limpeza funciona com outro lote sujo', expr: '(lambda r: len(r["limpas"]) == 1 and abs(float(r["total_limpo"]) - 3.0) < 0.001)(correr_com(sujas=pd.DataFrame({"data": ["2025-01-01", "2025-01-01", "2025-01-02"], "produto": [" leite ", " leite ", "Pão"], "quantidade": [2, 2, 1], "preco": ["1,5", "1,5", "-1"]})))', actualExpr: 'correr_com(sujas=pd.DataFrame({"data": ["2025-01-01", "2025-01-01", "2025-01-02"], "produto": [" leite ", " leite ", "Pão"], "quantidade": [2, 2, 1], "preco": ["1,5", "1,5", "-1"]})).get("total_limpo")', hint: 'Normaliza texto e vírgulas, tira duplicados e preços negativos, sempre a partir de sujas.' },
        ],
      },
      quiz: {
        question: 'Porque devemos padronizar texto (.str.strip().str.capitalize()) ANTES ou em conjunto com drop_duplicates()?',
        options: [
          'Porque drop_duplicates() só funciona em colunas numéricas.',
          'Porque " Pão " e "Pão" são valores diferentes para o pandas.',
          'Porque drop_duplicates() também apaga os espaços sozinho.',
          'Porque o strip() deixa de funcionar depois de remover duplicados.',
        ],
        correctIndex: 1,
        explanation: 'Para o computador, " Pão ", "pão" e "Pão" seriam três artigos diferentes num groupby!',
      },
    },
    {
      id: 'pd-07-pivot-transform',
      code: '07',
      title: 'Tabelas Dinâmicas (pivot_table) e Pesos de Grupo (.transform)',
      lede: 'Domina as duas ferramentas favoritas dos analistas seniores em Pandas: criar matrizes cruzadas estilo Excel e calcular quotas dentro de cada grupo sem perder linhas.',
      analogyTitle: 'O quadro cruzado Cidade × Categoria e a percentagem no próprio talão',
      analogyBody: 'Enquanto o groupby devolve uma lista vertical comprida, o pivot_table arruma as cidades nas linhas e as categorias nas colunas. E o .transform("sum") funciona exatamente como o SUM() OVER (PARTITION BY ...) do SQL!',
      concepts: [
        'pd.pivot_table(df, values="sub", index="cidade", columns="categoria", aggfunc="sum", fill_value=0) cria uma tabela dinâmica completa.',
        'df.groupby("produto")["sub"].transform("sum") devolve uma Series do mesmo tamanho de df com o total do respetivo produto em cada linha.',
        'Isso permite calcular o peso de uma linha no total do seu dia ou categoria numa única instrução vetorizada.',
      ],
      beginnerSteps: [
        'Cruza vendas com produtos e clientes para teres categoria e cidade no mesmo DataFrame.',
        'Chama df.pivot_table(values="sub", index="cidade", columns="categoria", aggfunc="sum").',
        'Para somas por grupo mantendo o tamanho original da tabela, usa df.groupby("coluna")["valor"].transform("sum").',
      ],
      proPractice: '.transform() evita ter de fazer um groupby seguido de um merge de volta para a tabela original quando queres comparar cada transação com a média do seu produto ou cliente.',
      commonPitfall: 'Esquecer fill_value=0 no pivot_table quando há cruzamentos sem vendas, gerando células NaN.',
      referenceTitle: 'Matrizes e Transformações de Janela em Pandas',
      referenceRows: [
        { syntax: 'df.pivot_table(values, index, columns, aggfunc)', meaning: 'Tabela dinâmica cruzada estilo Excel', example: 'Faturação Cidade x Categoria' },
        { syntax: 'df.groupby("g")["v"].transform("sum")', meaning: 'Equivalente Pandas a SUM(v) OVER (PARTITION BY g)', example: 'Total do dia em cada linha' },
        { syntax: 'df.groupby("g")["v"].transform("mean")', meaning: 'Média do grupo alinhada linha a linha', example: 'Desvio face à média do artigo' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas_sazonais.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

df = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
df = df.merge(clientes[["id", "cidade"]], left_on="cliente_id", right_on="id")

matriz = df.pivot_table(values="sub", index="cidade", columns="categoria", aggfunc="sum", fill_value=0).round(2)
matriz.reset_index()`,
            pythonChallenge: {
        description: 'Sobre dados/vendas.csv (sub = quantidade * preco): 1) com .groupby("data")["sub"].transform("sum") cria a coluna total_do_dia e guarda em maior_quota_no_dia_pct a maior percentagem (arredondada a 2 casas) que uma linha representou no total do seu dia; 2) com pivot_table cria matriz, com um produto por linha, um mês ("01" a "12") por coluna e a soma de sub em cada célula, e guarda em azeite_dezembro o valor da célula Azeite × "12".',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
df["mes"] = df["data"].str.slice(5, 7)   # "01" a "12"

# 1) total_do_dia com .transform("sum") e a percentagem máxima (sub / total_do_dia * 100)
maior_quota_no_dia_pct = None

# 2) matriz produto x mês com pivot_table e a célula Azeite / "12"
matriz = None
azeite_dezembro = None
print(maior_quota_no_dia_pct, azeite_dezembro)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
df["mes"] = df["data"].str.slice(5, 7)

df["total_do_dia"] = df.groupby("data")["sub"].transform("sum")
df["quota_dia_pct"] = df["sub"] / df["total_do_dia"] * 100
maior_quota_no_dia_pct = round(float(df["quota_dia_pct"].max()), 2)

matriz = df.pivot_table(values="sub", index="produto", columns="mes", aggfunc="sum", fill_value=0)
azeite_dezembro = round(float(matriz.loc["Azeite", "12"]), 2)
print(maior_quota_no_dia_pct, azeite_dezembro)`,
        checks: [
          { label: 'maior_quota_no_dia_pct calculada com .transform() (66.06)', expr: 'maior_quota_no_dia_pct is not None and math.isclose(float(maior_quota_no_dia_pct), 66.06, abs_tol=0.01)', actualExpr: 'maior_quota_no_dia_pct', hint: 'Divide df["sub"] pelo total do dia obtido com .transform("sum"), multiplica por 100 e tira o .max().' },
          { label: 'matriz tem 15 produtos x 12 meses', expr: 'hasattr(matriz, "shape") and tuple(matriz.shape) == (15, 12)', actualExpr: 'getattr(matriz, "shape", matriz)', hint: 'Usa df.pivot_table(values="sub", index="produto", columns="mes", aggfunc="sum").' },
          { label: 'azeite_dezembro lido da matriz (562.5)', expr: 'azeite_dezembro is not None and math.isclose(float(azeite_dezembro), 562.5, abs_tol=0.01)', actualExpr: 'azeite_dezembro', hint: 'Lê a célula com matriz.loc["Azeite", "12"].' },
          { label: '.transform e pivot_table funcionam com outra tabela', expr: '(lambda r: abs(float(r["maior_quota_no_dia_pct"]) - 75.0) < 0.01 and abs(float(r["azeite_dezembro"]) - 3.0) < 0.001)(correr_com(df=pd.DataFrame({"data": ["2025-12-01", "2025-12-01"], "produto": ["Azeite", "Pão"], "quantidade": [1, 1], "preco": [3.0, 1.0]})))', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-12-01", "2025-12-01"], "produto": ["Azeite", "Pão"], "quantidade": [1, 1], "preco": [3.0, 1.0]})).get("maior_quota_no_dia_pct")', hint: 'Usa groupby("data")["sub"].transform("sum") e lê o Azeite da matriz com .loc.' },
        ],
      },
      quiz: {
        question: 'Qual é a principal diferença entre df.groupby("data")["sub"].sum() e df.groupby("data")["sub"].transform("sum")?',
        options: [
          'Nenhuma: as duas devolvem um total por dia.',
          '.sum() dá uma linha por dia; .transform() mantém as 5 078 linhas.',
          '.transform() dá uma linha por dia; .sum() mantém as 5 078 linhas.',
          '.transform() só funciona com funções escritas por nós.',
        ],
        correctIndex: 1,
        explanation: '.sum() reduz a tabela a 365 linhas; .transform("sum") repete o total do dia em cada uma das 5 078 linhas. É o equivalente às Window Functions OVER (PARTITION BY ...) do SQL.',
      },
    },
    {
      id: 'pd-08-numpy-estatistica',
      code: '08',
      title: 'NumPy e as ferramentas de pandas para estatística',
      lede: 'Antes da trilha de Estatística, aprende as peças que ela usa: arrays NumPy, agregações com nome, cestos por cliente e dia, quantis, dias da semana, tabelas cruzadas (pd.crosstab) e matrizes para regressão.',
      analogyTitle: 'Arrumar a bancada antes de cozinhar',
      analogyBody: 'Um cozinheiro não aprende a receita e a faca ao mesmo tempo. Aqui afias as facas: cada ferramenta desta etapa vai aparecer nas etapas de estatística, onde a atenção deve ir para o raciocínio e não para a sintaxe.',
      concepts: [
        'Um array NumPy (np.array, serie.to_numpy()) faz contas com a coluna inteira de uma vez: np.round(precos * 1.23, 2) aplica o IVA a todos os preços.',
        'df.groupby(["data", "cliente_id"]).agg(linhas=("produto", "size"), total=("sub", "sum")) cria uma tabela por cesto com colunas de nome escolhido.',
        's.quantile(0.75) dá o percentil 75 (o 3.º quartil); s.quantile(0.5) é a mediana.',
        'pd.to_datetime(df["data"]).dt.day_of_week dá o dia da semana (0 = segunda, 6 = domingo). Fim de semana: >= 5.',
        'pd.crosstab(linhas, colunas) conta quantas vezes aparece cada combinação: é a tabela de contagens dos testes de qui-quadrado.',
        'np.column_stack([np.ones(n), x]) junta colunas numa matriz; np.outer(a, b) multiplica cada valor de a por cada valor de b.',
      ],
      beginnerSteps: [
        'Converte a coluna preco de produtos com .to_numpy() e aplica o IVA a todos de uma vez.',
        'Cria a coluna sub e agrupa por data e cliente_id com .agg(linhas=..., total=...).',
        'Calcula o percentil 75 do total por cesto com .quantile(0.75).',
        'Cria a coluna fim_de_semana e usa pd.crosstab(df["fim_de_semana"], df["produto"]).',
        'Agrupa por data para contar clientes por dia e monta X com np.column_stack.',
      ],
      proPractice: 'O pandas está construído por cima do NumPy: cada coluna é um array. Quando uma conta fica lenta num ciclo for, passa-a para operações de array inteiro (vetorização): costuma ficar 10 a 100 vezes mais rápida.',
      commonPitfall: 'Confundir np.ones(n) com uma coluna de dados: ela serve para a ordenada da regressão. E esquecer que .dt.day_of_week começa em 0 (segunda-feira), não em 1.',
      referenceTitle: 'Ferramentas usadas na trilha de Estatística',
      referenceRows: [
        { syntax: 'serie.to_numpy()', meaning: 'Coluna como array NumPy', example: 'precos = produtos["preco"].to_numpy()' },
        { syntax: '.agg(nome=("coluna", "função"))', meaning: 'Agregação com nome', example: 'total=("sub", "sum")' },
        { syntax: 's.quantile(0.75)', meaning: 'Percentil 75', example: '14.71 € por cesto' },
        { syntax: '.dt.day_of_week', meaning: 'Dia da semana (0 a 6)', example: '>= 5 é fim de semana' },
        { syntax: 'pd.crosstab(a, b)', meaning: 'Tabela de contagens', example: 'fim de semana × produto' },
        { syntax: 'np.column_stack([np.ones(n), x])', meaning: 'Matriz para regressão', example: 'forma (365, 2)' },
      ],
      engine: 'python',
      exampleCode: `import numpy as np
import pandas as pd

# Arrays: contas com a coluna inteira
precos = np.array([0.25, 0.89, 7.50])
print(precos * 2, precos.mean(), np.sqrt(precos))

# Agregações com nome, por cesto
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
cestos = df.groupby(["data", "cliente_id"]).agg(linhas=("produto", "size"), total=("sub", "sum"))
print(cestos.head())

# Tabela cruzada
df["fim_de_semana"] = pd.to_datetime(df["data"]).dt.day_of_week >= 5
print(pd.crosstab(df["fim_de_semana"], df["produto"]).iloc[:, :5])`,
      pythonChallenge: {
        description: '1) precos_com_iva: array com os preços de produtos.csv × 1.23, arredondados a 2 casas (np.round), e iva_maximo. 2) cestos: em vendas.csv, uma linha por data e cliente_id com as colunas linhas (número de linhas) e total (soma de sub). 3) p75_cesto: percentil 75 de total. 4) tabela = pd.crosstab(fim_de_semana, produto) e cafe_fim_de_semana. 5) X: matriz com uma coluna de 1 e a coluna de clientes diferentes por dia.',
        starterCode: `import numpy as np
import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Arrays NumPy
precos_com_iva = None
iva_maximo = None

# 2) e 3) Cestos e percentil 75
cestos = None
p75_cesto = None

# 4) Tabela cruzada
tabela = None
cafe_fim_de_semana = None

# 5) Matriz para regressão
X = None
print(iva_maximo, p75_cesto, cafe_fim_de_semana)`,
        solutionCode: `import numpy as np
import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Arrays NumPy
precos_com_iva = np.round(produtos["preco"].to_numpy() * 1.23, 2)
iva_maximo = precos_com_iva.max()

# 2) e 3) Cestos e percentil 75
cestos = df.groupby(["data", "cliente_id"]).agg(linhas=("produto", "size"), total=("sub", "sum"))
p75_cesto = cestos["total"].quantile(0.75)

# 4) Tabela cruzada
df["fim_de_semana"] = pd.to_datetime(df["data"]).dt.day_of_week >= 5
tabela = pd.crosstab(df["fim_de_semana"], df["produto"])
cafe_fim_de_semana = int(tabela.loc[True, "Café"])

# 5) Matriz para regressão
por_dia = df.groupby("data").agg(clientes=("cliente_id", "nunique"))
X = np.column_stack([np.ones(len(por_dia)), por_dia["clientes"]])
print(iva_maximo, round(p75_cesto, 2), cafe_fim_de_semana, X.shape)`,
        checks: [
          { label: 'precos_com_iva é um array com 15 preços (máximo 9.22 €)', expr: 'isinstance(precos_com_iva, np.ndarray) and len(precos_com_iva) == 15 and abs(float(iva_maximo) - 9.22) < 1e-9 and abs(float(precos_com_iva.sum()) - 38.72) < 0.001', actualExpr: '(type(precos_com_iva).__name__, iva_maximo)', hint: 'np.round(produtos["preco"].to_numpy() * 1.23, 2) e depois .max().' },
          { label: 'cestos: 2 447 cestos com as colunas linhas e total', expr: 'len(cestos) == 2447 and {"linhas", "total"} <= set(cestos.columns) and abs(float(cestos["linhas"].mean()) - 2.0752) < 0.001', actualExpr: '(len(cestos), list(cestos.columns)) if cestos is not None else None', hint: 'df.groupby(["data", "cliente_id"]).agg(linhas=("produto", "size"), total=("sub", "sum")).' },
          { label: 'p75_cesto (14.71 €)', expr: 'abs(float(p75_cesto) - 14.71) < 0.001', actualExpr: 'p75_cesto', hint: 'cestos["total"].quantile(0.75).' },
          { label: 'tabela 2 × 15 e cafe_fim_de_semana (129)', expr: 'tuple(tabela.shape) == (2, 15) and int(cafe_fim_de_semana) == 129', actualExpr: '(getattr(tabela, "shape", None), cafe_fim_de_semana)', hint: 'df["fim_de_semana"] = pd.to_datetime(df["data"]).dt.day_of_week >= 5 e tabela.loc[True, "Café"].' },
          { label: 'X tem 365 linhas e 2 colunas, a primeira só com 1', expr: 'tuple(X.shape) == (365, 2) and bool((X[:, 0] == 1).all()) and abs(float(X[:, 1].sum()) - 2447) < 1e-9', actualExpr: 'getattr(X, "shape", X)', hint: 'np.column_stack([np.ones(len(por_dia)), por_dia["clientes"]]).' },
          { label: 'O código funciona com outras vendas', expr: '(lambda r: len(r["cestos"]) == 2 and int(r["cafe_fim_de_semana"]) == 1)(correr_com(df=pd.DataFrame({"data": ["2025-01-04", "2025-01-04", "2025-01-06"], "cliente_id": [1, 1, 2], "produto": ["Café", "Pão", "Café"], "quantidade": [1, 2, 1], "preco": [3.4, 0.25, 3.4]})))', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-01-04", "2025-01-04", "2025-01-06"], "cliente_id": [1, 1, 2], "produto": ["Café", "Pão", "Café"], "quantidade": [1, 2, 1], "preco": [3.4, 0.25, 3.4]})).get("cafe_fim_de_semana")', hint: 'Calcula tudo a partir de df: nada de números escritos à mão.' },
        ],
      },
      quiz: {
        question: 'O que devolve pd.crosstab(df["fim_de_semana"], df["produto"])?',
        options: [
          'A soma da faturação de cada produto ao fim de semana.',
          'Uma tabela com o número de linhas de cada produto, separadas por fim de semana e dias úteis.',
          'A correlação entre o fim de semana e cada produto.',
          'A lista de produtos vendidos só ao fim de semana.',
        ],
        correctIndex: 1,
        explanation: 'pd.crosstab conta as ocorrências de cada combinação de valores. Para somar outra coluna em vez de contar, usa-se values= e aggfunc=, ou um pivot_table.',
      },
    },
  ],
};
