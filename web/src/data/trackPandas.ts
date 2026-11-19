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
        'Em pandas usa-se & em vez de and, | em vez de or e ~ em vez de not, rodeando cada condição com parênteses curvos.',
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
      analogyTitle: 'O tabuleiro de envelopes ordenados por cidade',
      analogyBody: 'Imagina 120 fichas de clientes espalhadas na mesa. Em vez de contares cidade a cidade à mão, distribuis cada ficha por um envelope com o nome da cidade e arrumas os envelopes do mais gordo ao mais fino: isso é value_counts(). Com normalize=True, escreves logo a percentagem em cada envelope.',
      concepts: [
        'df["cidade"].value_counts() conta quantos clientes existem em cada cidade.',
        'value_counts(normalize=True) devolve logo a proporção relativa (entre 0 e 1).',
        'df.sort_values(by="preco", ascending=False) ordena do maior para o menor.',
      ],
      referenceTitle: 'Rankings e frequências',
      referenceRows: [
        { syntax: 's.value_counts()', meaning: 'Frequência absoluta ordenada', example: 'clientes["cidade"].value_counts()' },
        { syntax: 's.value_counts(normalize=True)', meaning: 'Frequência relativa (quota)', example: '(s.value_counts(normalize=True) * 100).round(1)' },
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
          'normalize=True',
          'ratio=True',
          'proportion=True',
        ],
        correctIndex: 1,
        explanation: 'normalize=True divide cada contagem pelo total de elementos válidos (em inglês, com "z").',
      },
    },
    {
      id: 'pd-05-groupby-merge',
      code: '05',
      title: 'Agrupar (.groupby) e juntar tabelas (pd.merge)',
      lede: 'Domina os equivalentes em pandas do GROUP BY e do JOIN do SQL para cruzar vendas com categorias e cidades.',
      analogyTitle: 'Colar etiquetas do catálogo em cada talão antes de empilhar',
      analogyBody: 'Os talões trazem só o código do artigo (#4), sem dizer se é Mercearia ou Charcutaria. O pd.merge() vai ao catálogo buscar a etiqueta certa e cola-a em cada talão; depois, o .groupby() empilha os talões pela etiqueta para somar cada categoria.',
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
      title: 'Oficina de limpeza: vendas_sujas.csv',
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
        explanation: 'Para o computador, " Pão ", "pão" e "Pão" seriam três artigos diferentes num groupby.',
      },
    },
    {
      id: 'pd-07-pivot-transform',
      code: '07',
      title: 'Tabelas dinâmicas (pivot_table) e pesos de grupo (.transform)',
      lede: 'Domina as duas ferramentas favoritas dos analistas seniores em Pandas: criar matrizes cruzadas estilo Excel e calcular quotas dentro de cada grupo sem perder linhas.',
      analogyTitle: 'O tabuleiro de xadrez das vendas e o total anotado a lápis no canto do talão',
      analogyBody: 'O pivot_table transforma uma lista comprida num tabuleiro onde as linhas são cidades e as colunas são categorias — vês tudo de relance. Já o .transform("sum") é como escrever o total do dia a lápis no canto de cada talão: não apaga nenhum talão, mas permite ver logo quanto vale aquele talão no dia.',
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
      analogyTitle: 'Afiar os instrumentos antes de entrar no laboratório',
      analogyBody: 'Um carpinteiro não aprende a ler a planta e a usar o esquadro no mesmo minuto. Aqui afias os instrumentos: cada peça desta etapa (arrays, cestos, quantis, crosstab e matrizes) reaparece em Estatística, para que lá a tua atenção vá toda para o raciocínio e não para a sintaxe.',
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
    {
      id: 'pd-09-revisao',
      code: '09',
      title: 'Revisão geral: faturação por categoria e trimestre',
      lede: 'Antes de passar ao Git, juntas numa só análise o que treinaste na trilha: ler ficheiros, criar colunas, juntar tabelas, agrupar, ordenar e montar uma tabela dinâmica.',
      analogyTitle: 'Arrumar o armazém de uma ponta à outra',
      analogyBody: 'Em cada etapa arrumaste uma prateleira. Agora o pedido é o armazém inteiro: o dono quer saber que categorias faturam mais, como se repartem pelos quatro trimestres e qual delas cresceu mais do primeiro para o último. Cada pergunta é uma linha de pandas que já conheces.',
      beginnerSteps: [
        'Lê vendas.csv e produtos.csv e cria a coluna subtotal = quantidade * preco.',
        'Cria a coluna trimestre ("T1" a "T4") a partir do mês da data.',
        'Junta a categoria com pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id").',
        'Agrupa por categoria, soma o subtotal e ordena do maior para o menor.',
        'Monta a tabela dinâmica categoria × trimestre e compara T4 com T1.',
      ],
      concepts: [
        'Uma análise em pandas é uma sequência de passos pequenos, cada um com o resultado guardado num nome claro. Se um número sair estranho, imprimes o passo anterior e encontras o problema.',
        'O trimestre calcula-se a partir do mês: (mes - 1) // 3 + 1 dá 1 para janeiro a março, 2 para abril a junho, e assim por diante.',
        'groupby responde a "quanto por categoria"; pivot_table responde a "quanto por categoria e por trimestre", com uma categoria por linha e um trimestre por coluna.',
        'Para comparar períodos dentro de cada categoria, divide colunas da tabela dinâmica: (matriz["T4"] / matriz["T1"] - 1) * 100 dá a variação em percentagem.',
        'idxmax() devolve o rótulo do maior valor (o nome da categoria), enquanto max() devolve o próprio valor.',
      ],
      proPractice: 'Uma variação percentual grande pode vir de uma base pequena. Ao apresentar "a categoria que mais cresceu", mostra também o valor em euros, para ninguém tomar uma decisão por causa de 15 €.',
      commonPitfall: 'Comparar trimestres pela soma do ano inteiro, ou esquecer o merge e agrupar pela coluna produto em vez da categoria.',
      referenceTitle: 'O percurso completo em pandas',
      referenceRows: [
        { syntax: 'pd.to_datetime(df["data"]).dt.month', meaning: 'Mês de cada data', example: '1 a 12' },
        { syntax: '"T" + ((mes - 1) // 3 + 1).astype(str)', meaning: 'Trimestre como texto', example: 'T1, T2, T3, T4' },
        { syntax: 'pd.merge(v, p, left_on="produto_id", right_on="id")', meaning: 'Junta a categoria', example: 'Uma categoria por venda' },
        { syntax: 'df.pivot_table(index=..., columns=..., values=..., aggfunc="sum")', meaning: 'Tabela dinâmica', example: 'Categoria × trimestre' },
        { syntax: 'serie.idxmax()', meaning: 'Rótulo do maior valor', example: '"Padaria"' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["mes"] = pd.to_datetime(vendas["data"]).dt.month
vendas["trimestre"] = "T" + ((vendas["mes"] - 1) // 3 + 1).astype(str)
print(vendas[["data", "mes", "trimestre"]].drop_duplicates("trimestre"))`,
      pythonChallenge: {
        description: 'Sobre dados/vendas.csv e dados/produtos.csv:\n1) cria subtotal e trimestre ("T1" a "T4") e junta a categoria com pd.merge;\n2) em faturacao_categoria guarda a soma do subtotal por categoria, ordenada do maior para o menor, e em categoria_top o nome da primeira;\n3) em matriz guarda a tabela dinâmica com uma categoria por linha, um trimestre por coluna e a soma do subtotal;\n4) em quota_t4_top_pct guarda o peso do T4 no total anual da categoria_top, em percentagem com 2 casas;\n5) em categoria_maior_subida guarda a categoria com maior variação percentual de T1 para T4.',
        starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")

# 1) subtotal, trimestre e categoria
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

# 2) faturação por categoria (do maior para o menor)
faturacao_categoria = None
categoria_top = None

# 3) tabela dinâmica categoria x trimestre
matriz = None

# 4) peso do T4 na categoria_top
quota_t4_top_pct = None

# 5) categoria que mais cresceu de T1 para T4
categoria_maior_subida = None
print(categoria_top, quota_t4_top_pct, categoria_maior_subida)`,
        solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")

vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]
vendas["mes"] = pd.to_datetime(vendas["data"]).dt.month
vendas["trimestre"] = "T" + ((vendas["mes"] - 1) // 3 + 1).astype(str)
juntas = pd.merge(vendas, produtos[["id", "categoria"]], left_on="produto_id", right_on="id")

faturacao_categoria = juntas.groupby("categoria")["subtotal"].sum().sort_values(ascending=False)
categoria_top = faturacao_categoria.index[0]

matriz = juntas.pivot_table(index="categoria", columns="trimestre", values="subtotal", aggfunc="sum", fill_value=0)

quota_t4_top_pct = round(float(matriz.loc[categoria_top, "T4"] / matriz.loc[categoria_top].sum() * 100), 2)

variacao = (matriz["T4"] / matriz["T1"] - 1) * 100
categoria_maior_subida = variacao.idxmax()
print(categoria_top, quota_t4_top_pct, categoria_maior_subida)`,
        checks: [
          { label: 'faturacao_categoria tem 6 categorias, do maior para o menor', expr: 'hasattr(faturacao_categoria, "is_monotonic_decreasing") and len(faturacao_categoria) == 6 and faturacao_categoria.is_monotonic_decreasing and abs(float(faturacao_categoria.sum()) - 26902.89) < 0.01', actualExpr: 'faturacao_categoria', hint: 'juntas.groupby("categoria")["subtotal"].sum().sort_values(ascending=False)' },
          { label: 'categoria_top ("Mercearia")', expr: 'categoria_top == "Mercearia"', actualExpr: 'categoria_top', hint: 'É o primeiro rótulo da série ordenada: faturacao_categoria.index[0].' },
          { label: 'matriz tem 6 categorias × 4 trimestres', expr: 'hasattr(matriz, "shape") and tuple(matriz.shape) == (6, 4) and list(matriz.columns) == ["T1", "T2", "T3", "T4"]', actualExpr: 'getattr(matriz, "shape", matriz)', hint: 'juntas.pivot_table(index="categoria", columns="trimestre", values="subtotal", aggfunc="sum")' },
          { label: 'quota_t4_top_pct (26.07)', expr: 'quota_t4_top_pct is not None and math.isclose(float(quota_t4_top_pct), 26.07, abs_tol=0.01)', actualExpr: 'quota_t4_top_pct', hint: 'matriz.loc[categoria_top, "T4"] / matriz.loc[categoria_top].sum() * 100' },
          { label: 'categoria_maior_subida ("Padaria", +36%)', expr: 'categoria_maior_subida == "Padaria"', actualExpr: 'categoria_maior_subida', hint: 'Calcula (matriz["T4"] / matriz["T1"] - 1) * 100 e usa .idxmax().' },
          { label: 'A análise funciona com outras vendas', expr: '(lambda r: r["categoria_top"] == "Padaria" and r["categoria_maior_subida"] == "Bebidas")(correr_com(vendas=pd.DataFrame({"data": ["2025-01-10", "2025-12-10", "2025-02-01", "2025-11-01"], "cliente_id": [1, 1, 2, 2], "produto_id": [1, 1, 14, 14], "produto": ["Pão", "Pão", "Água", "Água"], "quantidade": [100, 100, 1, 5], "preco": [1.0, 1.0, 1.0, 1.0]})))', actualExpr: '(lambda r: (r["categoria_top"], r["categoria_maior_subida"]))(correr_com(vendas=pd.DataFrame({"data": ["2025-01-10", "2025-12-10", "2025-02-01", "2025-11-01"], "cliente_id": [1, 1, 2, 2], "produto_id": [1, 1, 14, 14], "produto": ["Pão", "Pão", "Água", "Água"], "quantidade": [100, 100, 1, 5], "preco": [1.0, 1.0, 1.0, 1.0]})))', hint: 'Não escrevas os nomes à mão: calcula-os a partir de faturacao_categoria e da variação T1 → T4.' },
        ],
      },
      quiz: {
        question: 'matriz["T4"] / matriz["T1"] - 1 dá 0.36 para a Padaria e 0.09 para a Mercearia. O que podes concluir?',
        options: [
          'A Padaria ganhou mais euros do que a Mercearia entre T1 e T4',
          'A Padaria cresceu mais em percentagem; em euros, não sabes',
          'A Mercearia perdeu faturação entre o T1 e o T4',
          'As duas categorias faturaram o mesmo no T4',
        ],
        correctIndex: 1,
        explanation: 'A percentagem depende da base. A Padaria passou de 43 € para 58,50 € (+36%); a Mercearia subiu só 9%, mas isso são mais 305 €.',
      },
    },
  ],
};
