import type { Track } from './types';
export { enrichTracksWithPedagogy, enrichTrackWithPedagogy, lessonPedagogyMap, type PedagogicalNotes } from './lessonPedagogy';

export const careerProTrack: Track = {
  id: 'carreira',
  shortTitle: '7. Nível Profissional',
  fullTitle: 'Prática Profissional: ETL, Testes de Dados, Coortes e Entrevista',
  summary: 'A ponte final entre saber sintaxe e trabalhar como Analista de Dados numa empresa: pipelines ETL, testes de qualidade, retenção de clientes, SQL otimizado e casos de entrevista.',
  engineLabel: 'Python + SQL Profissional',
  lessons: [
    {
      id: 'pro-01-pipeline-etl',
      code: '01',
      title: 'Pipeline ETL: extrair, transformar e carregar',
      lede: 'Nas empresas o analista constrói pipelines divididos em 3 camadas claras (Bronze -> Silver -> Gold) para transformar ficheiros brutos em tabelas prontas para decisão.',
      analogyTitle: 'Da receção da mercadoria na doca até à prateleira limpa',
      analogyBody: 'Camada Bronze é o caixote tal como chegou do fornecedor (vendas_sujas.csv intacto). Camada Silver é o produto limpo, inspecionado e sem estragados. Camada Gold é a montra agregada pronta para a gerência.',
      concepts: [
        'Nunca sobrescrevas o ficheiro bruto original (Bronze): lê de vendas_sujas.csv e gera uma estrutura limpa separada (Silver).',
        'Uma função ETL profissional devolve tanto os dados limpos como métricas de observabilidade (quantas linhas entraram e quantas foram rejeitadas).',
        'Padronizar esquemas e tipos de dados garante que o Power BI ou a base de dados nunca falha no carregamento.',
      ],
      beginnerSteps: [
        'Escreve uma função extrair_transformar() que lê o CSV bruto sem o alterar no disco.',
        'Aplica as regras de limpeza (strip, capitalize, conversão numérica, remoção de duplicados e preços inválidos).',
        'Devolve um dicionário ou resumo com as métricas de execução do pipeline.',
      ],
      proPractice: 'Em equipas de Engenharia e Análise de Dados (dbt, Airflow, Fabric), todo o pipeline regista logs de contagem antes e depois da transformação.',
      commonPitfall: 'Substituir o ficheiro original com os dados limpos: se descobrires um bug na tua regra amanhã, perdeste os dados brutos para reprocessar.',
      referenceTitle: 'Arquitetura medalhão (bronze / silver / gold)',
      referenceRows: [
        { syntax: 'Camada Bronze (Raw)', meaning: 'Dados brutos imutáveis tal como chegaram', example: 'dados/vendas_sujas.csv (12 linhas)' },
        { syntax: 'Camada Silver (Cleaned)', meaning: 'Dados tipados, sem duplicados e validados', example: 'df_silver (7 linhas válidas)' },
        { syntax: 'Camada Gold (Curated)', meaning: 'Tabelas agregadas por negócio / KPIs', example: 'Faturação diária ou por produto' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

def pipeline_mercearia(caminho_bronze):
    bronze = pd.read_csv(caminho_bronze)
    df = bronze.copy()
    df["produto"] = df["produto"].str.strip().str.capitalize()
    df["preco"] = pd.to_numeric(df["preco"].astype(str).str.replace(",", "."), errors="coerce")
    df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce")
    silver = df.drop_duplicates().dropna(subset=["data", "produto", "quantidade", "preco"])
    silver = silver[(silver["preco"] > 0) & (silver["quantidade"] > 0)].copy()
    silver["subtotal"] = (silver["quantidade"] * silver["preco"]).round(2)
    gold = silver.groupby("produto", as_index=False)["subtotal"].sum()
    return len(bronze), len(silver), gold

brutas, limpas, gold_df = pipeline_mercearia("dados/vendas_sujas.csv")
print(f"Bronze: {brutas} linhas -> Silver: {limpas} linhas")
gold_df`,
      pythonChallenge: {
        description: 'Constrói o relatório de auditoria do pipeline sobre dados/vendas_sujas.csv: guarda em linhas_bronze o total inicial (12), em linhas_rejeitadas quantas linhas foram descartadas na passagem para Silver (5) e em taxa_aproveitamento_pct a percentagem de linhas válidas arredondada a 2 casas (7 / 12 * 100).',
        starterCode: `import pandas as pd

bronze = pd.read_csv("dados/vendas_sujas.csv")

# Calcula linhas_bronze, linhas_rejeitadas e taxa_aproveitamento_pct:
linhas_bronze = None
linhas_rejeitadas = None
taxa_aproveitamento_pct = None

print(linhas_bronze, linhas_rejeitadas, taxa_aproveitamento_pct)`,
        solutionCode: `import pandas as pd

bronze = pd.read_csv("dados/vendas_sujas.csv")
df = bronze.copy()
df["produto"] = df["produto"].str.strip().str.capitalize()
df["preco"] = pd.to_numeric(df["preco"].astype(str).str.replace(",", "."), errors="coerce")
df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce")
silver = df.drop_duplicates().dropna(subset=["data", "produto", "quantidade", "preco"])
silver = silver[(silver["preco"] > 0) & (silver["quantidade"] > 0)]

linhas_bronze = len(bronze)
linhas_rejeitadas = len(bronze) - len(silver)
taxa_aproveitamento_pct = round(len(silver) / len(bronze) * 100, 2)

print(linhas_bronze, linhas_rejeitadas, taxa_aproveitamento_pct)`,
        checks: [
          { label: 'linhas_bronze == 12', expr: 'int(linhas_bronze) == 12', actualExpr: 'linhas_bronze', hint: 'len(bronze) é 12.' },
          { label: 'linhas_rejeitadas == 5', expr: 'int(linhas_rejeitadas) == 5', actualExpr: 'linhas_rejeitadas', hint: '12 linhas brutas menos 7 linhas válidas = 5 rejeitadas.' },
          { label: 'taxa_aproveitamento_pct == 58.33', expr: 'math.isclose(float(taxa_aproveitamento_pct), 58.33, abs_tol=0.02)', actualExpr: 'taxa_aproveitamento_pct', hint: 'round(7 / 12 * 100, 2) = 58.33.' },
          { label: 'O pipeline funciona com outro lote Bronze', expr: '(lambda r: int(r["linhas_bronze"]) == 4 and int(r["linhas_rejeitadas"]) == 2 and abs(float(r["taxa_aproveitamento_pct"]) - 50.0) < 0.01)(correr_com(bronze=pd.DataFrame({"data": ["2025-01-01", "2025-01-01", "2025-01-02", "2025-01-03"], "produto": [" pão ", "Pão", "Leite", "Café"], "quantidade": [2, 2, 1, 1], "preco": ["0,25", "0.25", "-1", "3.4"]})))', actualExpr: 'correr_com(bronze=pd.DataFrame({"data": ["2025-01-01", "2025-01-01", "2025-01-02", "2025-01-03"], "produto": [" pão ", "Pão", "Leite", "Café"], "quantidade": [2, 2, 1, 1], "preco": ["0,25", "0.25", "-1", "3.4"]})).get("linhas_rejeitadas")', hint: 'Calcula as contagens a partir de bronze e silver: normaliza, tira duplicados e rejeita preços ou quantidades inválidos.' },
        ],
      },
      quiz: {
        question: 'Na arquitetura de dados profissional (Bronze -> Silver -> Gold), onde devem ser guardados os dados brutos originais sem qualquer alteração?',
        options: [
          'Na camada Gold',
          'Na camada Bronze (Raw)',
          'Na camada Silver',
          'Em nenhuma: apagam-se depois de ler',
        ],
        correctIndex: 1,
        explanation: 'A camada Bronze preserva a história bruta exata para permitir auditorias e reprocessamentos futuros.',
      },
    },
    {
      id: 'pro-02-data-quality-tests',
      code: '02',
      title: 'Testes de qualidade de dados: chaves, nulos e intervalos',
      lede: 'Um profissional não espera que o diretor descubra um número errado no dashboard: escreve testes automáticos que validam chaves únicas, nulos, intervalos e integridade referencial.',
      analogyTitle: 'O controlo de qualidade antes de abrir as portas da loja',
      analogyBody: 'Antes de atualizar o painel da administração às 8h00, o script verifica automaticamente: há algum preço negativo? Há algum produto_id em vendas que não exista em produtos.csv? Se houver, trava e avisa.',
      concepts: [
        'As quatro dimensões de Data Quality: Unicidade (sem IDs repetidos), Completude (sem nulos), Validade (preço > 0) e Integridade Referencial (todas as chaves estrangeiras existem).',
        'Em Python usamos expressões booleanas e assert para garantir contratos de dados.',
        'Em ferramentas como dbt, estes 4 testes chamam-se unique, not_null, accepted_values e relationships.',
      ],
      beginnerSteps: [
        'Verifica se todos os IDs são únicos comparando df["id"].is_unique.',
        'Verifica se todos os preços são positivos com bool((df["preco"] > 0).all()).',
        'Verifica a integridade referencial com bool(vendas["produto_id"].isin(produtos["id"]).all()).',
      ],
      proPractice: 'Testar dados automaticamente a cada atualização diária é a prática que gera confiança executiva no trabalho do analista.',
      commonPitfall: 'Usar .any() (algum cumpre) quando querias testar .all() (todos os registos cumprem a regra).',
      referenceTitle: 'Os 4 testes de qualidade de dados que se usam em todo o lado',
      referenceRows: [
        { syntax: 's.is_unique', meaning: 'Teste unique: nenhum ID repetido', example: 'produtos["id"].is_unique -> True' },
        { syntax: 's.isna().sum() == 0', meaning: 'Teste not_null: zero células vazias', example: 'vendas["data"].isna().sum() == 0' },
        { syntax: '(s > 0).all()', meaning: 'Teste de domínio: todos os valores positivos', example: '(vendas["quantidade"] > 0).all()' },
        { syntax: 'v["fk"].isin(dim["id"]).all()', meaning: 'Teste relationships: sem chaves órfãs', example: 'vendas["cliente_id"].isin(clientes["id"]).all()' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas = pd.read_csv("dados/vendas.csv")

print("IDs produtos únicos:", produtos["id"].is_unique)
print("Sem nulos em vendas:", int(vendas.isna().sum().sum()) == 0)
print("FK clientes íntegra:", bool(vendas["cliente_id"].isin(clientes["id"]).all()))`,
      pythonChallenge: {
        description: 'Escreve uma bateria de 3 verificações sobre os CSVs oficiais: guarda True/False em catalogo_unico (se produtos["id"] não tem repetidos), precos_consistentes (se em todas as linhas de vendas o preco coincide com o preço oficial desse produto_id em produtos.csv) e zero_orfaos (se todos os produto_id de vendas existem em produtos["id"]).',
        starterCode: `import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
vendas = pd.read_csv("dados/vendas.csv")

catalogo_unico = None
zero_orfaos = None
precos_consistentes = None

print(catalogo_unico, zero_orfaos, precos_consistentes)`,
        solutionCode: `import pandas as pd

produtos = pd.read_csv("dados/produtos.csv")
vendas = pd.read_csv("dados/vendas.csv")

catalogo_unico = bool(produtos["id"].is_unique)
zero_orfaos = bool(vendas["produto_id"].isin(produtos["id"]).all())

mapa_precos = produtos.set_index("id")["preco"]
precos_esperados = vendas["produto_id"].map(mapa_precos)
precos_consistentes = bool((vendas["preco"] == precos_esperados).all())

print(catalogo_unico, zero_orfaos, precos_consistentes)`,
        checks: [
          { label: 'catalogo_unico is True', expr: 'catalogo_unico is True', actualExpr: 'catalogo_unico', hint: 'Usa bool(produtos["id"].is_unique).' },
          { label: 'zero_orfaos is True', expr: 'zero_orfaos is True', actualExpr: 'zero_orfaos', hint: 'Usa bool(vendas["produto_id"].isin(produtos["id"]).all()).' },
          { label: 'precos_consistentes is True', expr: 'precos_consistentes is True', actualExpr: 'precos_consistentes', hint: 'Mapeie o preço de produtos por produto_id e compara com vendas["preco"].' },
          { label: 'Os testes apanham dados com problemas', expr: '(lambda r: r["catalogo_unico"] is True and r["zero_orfaos"] is False and r["precos_consistentes"] is False)(correr_com(produtos=pd.DataFrame({"id": [1, 2], "nome": ["A", "B"], "categoria": ["X", "X"], "preco": [1.0, 2.0]}), vendas=pd.DataFrame({"produto_id": [1, 9], "preco": [1.5, 2.0]})))', actualExpr: 'correr_com(produtos=pd.DataFrame({"id": [1, 2], "nome": ["A", "B"], "categoria": ["X", "X"], "preco": [1.0, 2.0]}), vendas=pd.DataFrame({"produto_id": [1, 9], "preco": [1.5, 2.0]}))', hint: 'Um teste de qualidade tem de falhar quando os dados estão errados: calcula cada resultado a partir das tabelas (is_unique, isin, map), em vez de escrever True.' },
        ],
      },
      quiz: {
        question: 'O que testa uma regra de Integridade Referencial (relationships test) numa base de dados analítica?',
        options: [
          'Se não há linhas repetidas nem chaves duplicadas na tabela de factos.',
          'Se cada chave estrangeira existe na tabela de dimensão.',
          'Se as colunas numéricas não têm valores negativos.',
          'Se as datas estão todas dentro do ano certo.',
        ],
        correctIndex: 1,
        explanation: 'Garante que nenhum INNER JOIN perde vendas por falta de ficha na tabela de dimensão.',
      },
    },
    {
      id: 'pro-10-rgpd-anonimizacao',
      code: '10',
      title: 'RGPD na prática: pseudonimizar, minimizar e agrupar antes de partilhar',
      lede: 'Um parceiro pede os dados de clientes para estudar a faturação por zona. Antes de enviar o que quer que seja, aplicas três regras do RGPD: tirar o que identifica a pessoa, enviar só o necessário e não deixar grupos tão pequenos que se adivinhe quem lá está.',
      analogyTitle: 'A lista da turma afixada na porta',
      analogyBody: 'Uma escola pode afixar "a turma B teve média 14", mas não a nota de cada aluno com o nome ao lado. E se a turma tiver só 2 alunos, até a média revela demasiado. Com dados de clientes é igual: troca os nomes por códigos, envia só as colunas pedidas e junta os grupos pequenos.',
      concepts: [
        'O RGPD (Regulamento Geral sobre a Proteção de Dados) aplica-se a qualquer dado que identifique uma pessoa, direta ou indiretamente: nome, contacto, morada, ou um conjunto de dados que, juntos, apontam para alguém.',
        'Pseudonimização: trocar o identificador por um código, por exemplo os primeiros caracteres de hashlib.sha256((sal + id).encode()).hexdigest(). Sem o "sal" secreto, não se consegue voltar ao cliente. Atenção: dados pseudonimizados continuam a ser dados pessoais.',
        'Minimização: partilha apenas as colunas de que o destinatário precisa para a finalidade combinada. Se o estudo é por zona, o nome nunca sai.',
        'Grupos pequenos: se uma cidade tiver poucos clientes, junta-a numa categoria "Outras". É a ideia do k-anonimato (cada grupo tem pelo menos k pessoas).',
        'Direitos do titular: qualquer cliente pode pedir para ver, corrigir ou apagar os seus dados. Um bom processo de dados permite apagar uma pessoa de todas as tabelas.',
      ],
      beginnerSteps: [
        'Escreve pseudonimo(cliente_id), que junta o sal ao id, aplica sha256 e devolve os primeiros 10 caracteres.',
        'Soma a faturação por cliente em vendas.csv e junta a cidade de clientes.csv.',
        'Conta os clientes por cidade e troca por "Outras" as cidades com menos de k clientes.',
        'Monta partilha só com as colunas cliente (pseudónimo), cidade e faturacao.',
      ],
      proPractice: 'Nas empresas, partilhas de dados com terceiros exigem um acordo (subcontratação ou partilha) e, muitas vezes, a validação do Encarregado de Proteção de Dados (DPO). Documenta sempre a finalidade, as colunas enviadas e o prazo de conservação.',
      commonPitfall: 'Achar que tirar a coluna do nome chega. Cidade, data de nascimento e género juntos identificam muitas pessoas; numa cidade com 3 clientes, a faturação "anónima" de cada um é fácil de atribuir.',
      referenceTitle: 'Proteção de dados em pandas',
      referenceRows: [
        { syntax: 'hashlib.sha256((sal + str(id)).encode()).hexdigest()[:10]', meaning: 'Pseudónimo estável e não reversível sem o sal', example: 'b83ad1de98' },
        { syntax: 'df[["cliente", "cidade", "faturacao"]]', meaning: 'Minimização: só as colunas necessárias', example: 'Sem nome nem id' },
        { syntax: 'contagem = df["cidade"].map(df["cidade"].value_counts())', meaning: 'Tamanho do grupo de cada linha', example: 'Maia: 10' },
        { syntax: 'df["cidade"].where(contagem >= k, "Outras")', meaning: 'Agrupar grupos pequenos', example: 'k = 15' },
      ],
      engine: 'python',
      exampleCode: `import hashlib

# O mesmo id dá sempre o mesmo pseudónimo; outro sal dá outro pseudónimo.
for sal in ["sal-secreto-A", "sal-secreto-B"]:
    codigos = [hashlib.sha256((sal + str(i)).encode()).hexdigest()[:10] for i in [1, 2, 3]]
    print(sal, codigos)`,
      pythonChallenge: {
        description: 'Prepara os dados para o parceiro:\n1) pseudonimo(cliente_id): os primeiros 10 caracteres de sha256(sal + str(cliente_id)).\n2) partilha: uma linha por cliente com as colunas cliente (pseudónimo), cidade e faturacao (soma de quantidade × preco), por esta ordem e sem nome nem id.\n3) As cidades com menos de k clientes passam a "Outras".\nO direito ao esquecimento está no treino 1.',
        starterCode: `import hashlib
import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
vendas = pd.read_csv("dados/vendas.csv")
sal = "mercearia-2025"
k = 15


def pseudonimo(cliente_id):
    return None


partilha = None
print(partilha)`,
        solutionCode: `import hashlib
import pandas as pd

clientes = pd.read_csv("dados/clientes.csv")
vendas = pd.read_csv("dados/vendas.csv")
sal = "mercearia-2025"
k = 15


def pseudonimo(cliente_id):
    return hashlib.sha256((sal + str(cliente_id)).encode()).hexdigest()[:10]


vendas["sub"] = vendas["quantidade"] * vendas["preco"]
por_cliente = vendas.groupby("cliente_id")["sub"].sum().reset_index()
juntos = por_cliente.merge(clientes, left_on="cliente_id", right_on="id")

tamanho = juntos["cidade"].map(juntos["cidade"].value_counts())
juntos["cidade"] = juntos["cidade"].where(tamanho >= k, "Outras")
juntos["cliente"] = juntos["cliente_id"].map(pseudonimo)

partilha = juntos[["cliente", "cidade", "sub"]].rename(columns={"sub": "faturacao"})
print(partilha.head())
print(partilha["cidade"].value_counts())`,
        checks: [
          { label: 'pseudonimo: 10 caracteres de sha256(sal + id)', expr: 'pseudonimo(1) == hashlib.sha256(("mercearia-2025" + "1").encode()).hexdigest()[:10] and pseudonimo(1) != pseudonimo(2)', actualExpr: 'pseudonimo(1)', hint: 'return hashlib.sha256((sal + str(cliente_id)).encode()).hexdigest()[:10]' },
          { label: 'partilha: 120 clientes, só as colunas cliente, cidade e faturacao', expr: 'len(partilha) == 120 and list(partilha.columns) == ["cliente", "cidade", "faturacao"] and abs(float(partilha["faturacao"].sum()) - 26902.89) < 0.01', actualExpr: '(len(partilha), list(partilha.columns)) if partilha is not None else None', hint: 'Seleciona e renomeia no fim: juntos[["cliente", "cidade", "sub"]].rename(columns={"sub": "faturacao"}).' },
          { label: 'Nenhum nome nem id sai e a Maia (10 clientes) passa a "Outras"', expr: 'not partilha["cliente"].isin(clientes["nome"]).any() and "Maia" not in set(partilha["cidade"]) and int((partilha["cidade"] == "Outras").sum()) == 10', actualExpr: 'dict(partilha["cidade"].value_counts()) if partilha is not None else None', hint: 'Troca por "Outras" as cidades com menos de k clientes, usando o tamanho de cada grupo.' },
          { label: 'O agrupamento usa k (com k = 20 juntam-se 48 clientes)', expr: 'int((correr_com(k=20)["partilha"]["cidade"] == "Outras").sum()) == 48', actualExpr: 'dict(correr_com(k=20)["partilha"]["cidade"].value_counts())', hint: 'Compara o tamanho de cada cidade com k, sem escrever "Maia" à mão.' },
        ],
      },
      quiz: {
        question: 'Uma tabela tem o nome dos clientes trocado por um código, mas mantém a data de nascimento e a rua. Ainda está abrangida pelo RGPD?',
        options: [
          'Não: sem o nome, os dados são anónimos.',
          'Só se a tabela for publicada na internet ou partilhada com empresas fora da União Europeia.',
          'Não, desde que o código seja um hash.',
          'Sim: data de nascimento e rua juntas podem identificar a pessoa.',
        ],
        correctIndex: 3,
        explanation: 'Dados pseudonimizados continuam a ser dados pessoais. Combinações de atributos (data, rua, género) identificam pessoas mesmo sem o nome.',
      },
    },
    {
      id: 'pro-03-coortes-retencao',
      code: '03',
      title: 'Métricas de clientes: retenção, recorrência e valor por cliente',
      lede: 'Aprende as métricas que as empresas mais acompanham: frequência de compra, taxa de repetição (retention), primeiro mês de compra (cohort) e valor anual do cliente (LTV).',
      analogyTitle: 'Distinguir quem entrou na loja uma vez de quem cá vem todas as semanas',
      analogyBody: 'Uma mercearia não sobrevive de clientes que entram uma única vez no ano: medir quantos meses distintos cada cliente faz compras revela a fidelidade real da carteira.',
      concepts: [
        'Mês de Coorte (Cohort): o primeiro mês em que o cliente fez a sua primeira compra (MIN(SUBSTR(data, 1, 7))).',
        'Meses Ativos: em quantos meses diferentes do ano o cliente voltou à loja (COUNT(DISTINCT SUBSTR(data, 1, 7))).',
        'LTV / Receita por Cliente: soma total gasta pelo cliente ao longo do período analisado.',
      ],
      beginnerSteps: [
        'Agrupa as vendas por cliente_id.',
        'Calcula o primeiro mês de compra com MIN(SUBSTR(data, 1, 7)).',
        'Conta em quantos meses distintos cada cliente comprou com COUNT(DISTINCT SUBSTR(data, 1, 7)).',
      ],
      proPractice: 'Em empresas de retalho, e-commerce e SaaS, a análise de retenção e frequência por cliente é a base para campanhas de CRM e prevenção de abandono (churn).',
      commonPitfall: 'Contar COUNT(data) em vez de COUNT(DISTINCT SUBSTR(data, 1, 7)) quando se quer medir o número de meses ativos.',
      referenceTitle: 'Métricas de clientes em SQL',
      referenceRows: [
        { syntax: 'MIN(SUBSTR(data, 1, 7))', meaning: 'Mês de aquisição / entrada do cliente (Cohort)', example: '2025-01' },
        { syntax: 'COUNT(DISTINCT SUBSTR(data, 1, 7))', meaning: 'Número de meses ativos no ano', example: 'Fidelidade mensal (1 a 12)' },
        { syntax: 'COUNT(DISTINCT data)', meaning: 'Visitas / dias distintos de compra', example: 'Frequência anual de visitas' },
      ],
      engine: 'sql',
      exampleCode: `SELECT
  c.id AS cliente_id,
  c.nome,
  c.cidade,
  MIN(SUBSTR(v.data, 1, 7)) AS mes_entrada,
  COUNT(DISTINCT SUBSTR(v.data, 1, 7)) AS meses_ativos,
  ROUND(SUM(v.quantidade * v.preco), 2) AS ltv_2025_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome, c.cidade
ORDER BY ltv_2025_eur DESC
LIMIT 8;`,
      sqlChallenge: {
        description: 'Identifica os clientes hiper-fiéis que fizeram compras nos 12 meses do ano (COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12): devolve cliente_id, nome e ltv_eur (faturação anual arredondada a 2 casas), ordenados por ltv_eur DESC.',
        starterSql: `SELECT
  c.id AS cliente_id,
  c.nome,
  ROUND(SUM(v.quantidade * v.preco), 2) AS ltv_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome
-- Filtra com HAVING apenas quem esteve ativo nos 12 meses e ordena por ltv_eur DESC
`,
        solutionSql: `SELECT
  c.id AS cliente_id,
  c.nome,
  ROUND(SUM(v.quantidade * v.preco), 2) AS ltv_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome
HAVING COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12
ORDER BY ltv_eur DESC;`,
        hint: 'Adiciona HAVING COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12 ORDER BY ltv_eur DESC;',
        validate: (cols, rows) => {
          // Nos dados de 2025 há exatamente 12 clientes (de 120) com compras em todos os meses.
          const ordenado = rows.every((r, i) => i === 0 || Number(rows[i - 1][2]) >= Number(r[2]));
          const ok = rows.length === 12 && cols.length === 3 && ordenado;
          return {
            passed: ok,
            message: ok
              ? `Encontraste os ${rows.length} clientes que visitaram a Mercearia em todos os 12 meses do ano.`
              : rows.length !== 12
                ? `Obtiveste ${rows.length} clientes; devem ser 12. Usa HAVING COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12.`
                : 'Os 12 clientes estão certos: falta ordenar por ltv_eur DESC.',
          };
        },
      },
      quiz: {
        question: 'O que representa a "Coorte de Janeiro" (January Cohort) numa análise de retenção?',
        options: [
          'Todas as vendas feitas em janeiro.',
          'Os clientes cuja primeira compra foi em janeiro.',
          'Os clientes que deixaram de comprar em janeiro.',
          'Os clientes que compraram em todos os meses desde janeiro.',
        ],
        correctIndex: 1,
        explanation: 'Uma coorte agrupa utilizadores pelo período do seu primeiro evento (aquisição) para acompanhar o seu comportamento ao longo dos meses seguintes.',
      },
    },
    {
      id: 'pro-04-sql-performance',
      code: '04',
      title: 'SQL mais rápido: índices, filtros que usam o índice e EXPLAIN QUERY PLAN',
      lede: 'Quando a tabela cresce de 5 000 para 500 milhões de linhas, a forma como escreves o WHERE decide se a query demora 20 milissegundos ou 40 minutos.',
      analogyTitle: 'Procurar no índice alfabético vs folhear a lista telefónica página a página',
      analogyBody: 'Um índice (INDEX) é o separador ordenado da base de dados. Se pedires WHERE data BETWEEN \'2025-09-01\' AND \'2025-09-30\', o motor vai direto à página de setembro; se aplicares uma função sobre a coluna antes de comparar, obrigas o motor a ler a tabela inteira (Full Table Scan).',
      concepts: [
        'EXPLAIN QUERY PLAN mostra como o motor SQL vai executar a consulta (SEARCH com índice vs SCAN da tabela completa).',
        'Filtros SARGable (Search Argument Able): mantém a coluna isolada no lado esquerdo do operador (data >= \'2025-09-01\' em vez de SUBSTR(data, 1, 7) = \'2025-09\'). Em SQL o texto leva aspas simples; as aspas duplas são para nomes de colunas.',
        'SELECT apenas das colunas necessárias e filtragem antes de JOINs pesados reduzem uso de memória.',
        'Sintaxe de datas noutros motores (além do SQLite): no dia a dia vais encontrar PostgreSQL (DATE_TRUNC(\'month\', data) ou TO_CHAR), BigQuery (FORMAT_DATE(\'%Y-%m\', data)) e SQL Server (FORMAT(data, \'yyyy-MM\')). O filtro por intervalo (>= e <=) funciona igual em todos.',
      ],
      beginnerSteps: [
        'Evita envolver colunas indexadas em funções dentro do WHERE.',
        'Prefere intervalos diretos: WHERE data >= \'2025-09-01\' AND data <= \'2025-09-30\'.',
        'Antecede qualquer query com EXPLAIN QUERY PLAN para veres o plano de execução do motor.',
      ],
      proPractice: 'Em bases de dados cloud pagas por volume lido ou CPU, escrever predicados SARGable e usar partições de data poupa milhares de euros mensais à empresa.',
      commonPitfall: 'Aplicar YEAR(data) = 2025 ou SUBSTR(data, 1, 4) = \'2025\' no WHERE de uma tabela gigante, inutilizando o índice da coluna data.',
      referenceTitle: 'Boas práticas de otimização SQL',
      referenceRows: [
        { syntax: "WHERE data BETWEEN '2025-09-01' AND '2025-09-30'", meaning: 'Rápido (SARGable): aproveita índice de data em qualquer motor SQL', example: 'Pesquisa direta por intervalo' },
        { syntax: "WHERE SUBSTR(data, 1, 7) = '2025-09'", meaning: 'Lento em tabelas gigantes: calcula função linha a linha', example: 'Obriga a Full Scan' },
        { syntax: 'CREATE INDEX idx_vendas_data ON vendas(data);', meaning: 'Cria índice B-Tree na coluna data', example: 'Acelera filtros e ordenações' },
        { syntax: "SQLite: strftime('%Y-%m', data) | Postgres: TO_CHAR(data, 'YYYY-MM') | BigQuery: FORMAT_DATE('%Y-%m', data)", meaning: 'Equivalentes para extrair ano-mês noutros motores reais', example: '2025-09' },
      ],
      engine: 'sql',
      exampleCode: `-- Compara a consulta otimizada por intervalo direto em Setembro de 2025:
SELECT
  produto,
  SUM(quantidade) AS unidades_setembro,
  ROUND(SUM(quantidade * preco), 2) AS faturacao_setembro
FROM vendas
WHERE data >= '2025-09-01' AND data <= '2025-09-30'
GROUP BY produto
ORDER BY faturacao_setembro DESC
LIMIT 5;`,
      sqlChallenge: {
        description: 'Escreve uma query otimizada (usando intervalo direto em data) para o 3.º trimestre de 2025 (de "2025-07-01" a "2025-09-30"): devolve a categoria do produto (de produtos) e a faturacao_q3 arredondada a 2 casas, ordenada por faturacao_q3 DESC.',
        starterSql: `SELECT
  p.categoria,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_q3
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
-- Filtra o 3.º trimestre (2025-07-01 a 2025-09-30), agrupa e ordena
`,
        solutionSql: `SELECT
  p.categoria,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_q3
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
WHERE v.data >= '2025-07-01' AND v.data <= '2025-09-30'
GROUP BY p.categoria
ORDER BY faturacao_q3 DESC;`,
        hint: "Usa WHERE v.data BETWEEN '2025-07-01' AND '2025-09-30' GROUP BY p.categoria ORDER BY faturacao_q3 DESC;",
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 2 && rows[0][0] === 'Mercearia' && Number(rows[0][1]) > 3500;
          return {
            passed: ok,
            message: ok
              ? 'Consulta limpa e compatível com índices de data em produção (as 6 categorias da mercearia foram agregadas no Q3).'
              : `Obtiveste ${rows.length} categorias. Verifica o filtro entre 2025-07-01 e 2025-09-30, o GROUP BY p.categoria e o ORDER BY faturacao_q3 DESC (são esperadas as 6 categorias).`,
          };
        },
      },
      quiz: {
        question: 'Qual destas condições WHERE permite à base de dados utilizar diretamente um índice B-Tree criado sobre a coluna data?',
        options: [
          "WHERE SUBSTR(data, 6, 2) = '09'",
          "WHERE data >= '2025-09-01' AND data <= '2025-09-30'",
          "WHERE REPLACE(data, '-', '') LIKE '202509%'",
          "WHERE strftime('%m', data) = '09'",
        ],
        correctIndex: 1,
        explanation: 'Manter a coluna data limpa de funções permite ao motor saltar diretamente para o intervalo no índice B-Tree.',
      },
    },
    {
      id: 'pro-05-entrevista-sql',
      code: '05',
      title: 'Perguntas clássicas de entrevista SQL: top N por categoria e variação mensal com LAG',
      lede: 'Prepara-te para as duas perguntas mais frequentes em provas técnicas de recrutamento para Analista de Dados.',
      analogyTitle: 'O pódio por escalão e o espelho retrovisor',
      analogyBody: 'Numa corrida com 6 escalões, RANK() OVER (PARTITION BY categoria ...) entrega uma medalha de ouro em cada escalão sem misturar atletas. Já o LAG() funciona como o espelho retrovisor do carro: enquanto olhas para o mês atual, vês o mês anterior lado a lado para saber se aceleraste ou travaste.',
      concepts: [
        'LAG(coluna, 1) OVER (ORDER BY mes) vai buscar o valor da linha anterior sem precisar de auto-join.',
        'Variação mensal (MoM %): (faturacao_atual - faturacao_anterior) / faturacao_anterior * 100.',
        'Para filtrar o resultado de uma Window Function (ex.: ficar apenas com pos <= 2), coloca a Window Function numa CTE e filtra no WHERE exterior.',
      ],
      beginnerSteps: [
        'Na CTE, calcula a métrica agrupada e a coluna de janela (RANK ou LAG).',
        'Na consulta principal fora da CTE, aplica o filtro WHERE pos <= 2 ou calcula a diferença face ao mês anterior.',
        'Ordena o resultado final para leitura imediata.',
      ],
      proPractice: 'Dominar CTE + RANK() OVER (PARTITION BY ...) e LAG() OVER (ORDER BY ...) coloca-te imediatamente no topo dos candidatos em entrevistas técnicas de dados.',
      commonPitfall: 'Tentar usar WHERE RANK() OVER (...) <= 2 na mesma query sem envolver primeiro numa CTE ou subquery.',
      referenceTitle: 'Padrões de entrevista técnica em SQL',
      referenceRows: [
        { syntax: 'LAG(fat, 1) OVER (ORDER BY mes)', meaning: 'Valor do mês anterior na mesma linha', example: 'Cálculo de crescimento MoM' },
        { syntax: 'LEAD(fat, 1) OVER (ORDER BY mes)', meaning: 'Valor do mês seguinte na mesma linha', example: 'Próxima compra do cliente' },
        { syntax: 'WHERE ranking <= 2 (sobre CTE)', meaning: 'Top 2 de cada grupo ou categoria', example: 'Os 2 líderes por prateleira' },
      ],
      engine: 'sql',
      exampleCode: `WITH mensal AS (
  SELECT
    SUBSTR(data, 1, 7) AS mes,
    ROUND(SUM(quantidade * preco), 2) AS faturacao
  FROM vendas
  GROUP BY SUBSTR(data, 1, 7)
)
SELECT
  mes,
  faturacao,
  LAG(faturacao, 1) OVER (ORDER BY mes) AS mes_anterior,
  ROUND(faturacao - LAG(faturacao, 1) OVER (ORDER BY mes), 2) AS variacao_eur
FROM mensal
ORDER BY mes;`,
      sqlChallenge: {
        description: 'Resolve o problema clássico de entrevista "Top 1 de cada categoria": usando uma CTE, descobre qual é o produto campeão de faturação dentro de cada uma das 6 categorias. Devolve categoria, produto e faturacao (6 linhas ordenadas por faturacao DESC).',
        starterSql: `WITH ranking_cat AS (
  SELECT
    p.categoria,
    p.nome AS produto,
    ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao,
    RANK() OVER (PARTITION BY p.categoria ORDER BY SUM(v.quantidade * v.preco) DESC) AS pos
  FROM vendas v
  INNER JOIN produtos p ON p.id = v.produto_id
  GROUP BY p.categoria, p.nome
)
-- Seleciona categoria, produto e faturacao apenas para o 1.º classificado de cada categoria:
SELECT categoria, produto, faturacao
FROM ranking_cat;`,
        solutionSql: `WITH ranking_cat AS (
  SELECT
    p.categoria,
    p.nome AS produto,
    ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao,
    RANK() OVER (PARTITION BY p.categoria ORDER BY SUM(v.quantidade * v.preco) DESC) AS pos
  FROM vendas v
  INNER JOIN produtos p ON p.id = v.produto_id
  GROUP BY p.categoria, p.nome
)
SELECT categoria, produto, faturacao
FROM ranking_cat
WHERE pos = 1
ORDER BY faturacao DESC;`,
        hint: 'Adiciona WHERE pos = 1 ORDER BY faturacao DESC na consulta final.',
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 3 && rows[0][1] === 'Azeite' && rows[1][1] === 'Queijo';
          return {
            passed: ok,
            message: ok
              ? 'Usaste uma CTE com ROW_NUMBER() para encontrar o campeão de cada uma das 6 categorias.'
              : `Obtiveste ${rows.length} linhas. Filtra WHERE pos = 1 e ordena por faturacao DESC para devolver os 6 líderes das 6 categorias do catálogo.`,
          };
        },
      },
      quiz: {
        question: 'Que função de janela (Window Function) usas em SQL para trazer o valor da linha anterior (por exemplo, a faturação do mês passado) sem fazer JOIN?',
        options: [
          'PREVIOUS()',
          'LAG()',
          'LEAD()',
          'BEFORE()',
        ],
        correctIndex: 1,
        explanation: 'LAG(coluna, 1) OVER (ORDER BY data) acede diretamente ao registo anterior na janela ordenada.',
      },
    },
    {
      id: 'pro-06-caso-executivo',
      code: '06',
      title: 'Caso final: diagnóstico completo para a direção',
      lede: 'Consolida todo o teu percurso do zero ao profissional resolvendo um pedido executivo completo que combina Python, Pandas, SQL e visão de negócio.',
      analogyTitle: 'O relatório de viabilidade antes de abrir a segunda loja',
      analogyBody: 'Antes de assinar o contrato de uma nova loja, o proprietário pede uma folha única com quatro números conferidos por duas equipas independentes. Aqui o teu script Python/Pandas gera esse boletim de decisão e confirma que cada indicador bate certo ao cêntimo com o SQL.',
      concepts: [
        'Um analista profissional cruza múltiplas tabelas (vendas, produtos, clientes) para responder a perguntas estratégicas.',
        'Validação cruzada: confirmar que os resultados do teu script batem ao cêntimo com o SQL.',
        'Com estas 7 trilhas técnicas concluídas (antes do Projeto final), dominas o ciclo real de trabalho de um Analista de Dados Júnior a Intermédio.',
      ],
      beginnerSteps: [
        'Carrega os 3 ficheiros CSV oficiais com pd.read_csv().',
        'Cruza vendas com produtos e clientes usando pd.merge().',
        'Calcula cada indicador pedido e guarda nas variáveis indicadas para validação.',
      ],
      proPractice: 'Ao publicares este projeto no teu GitHub e Vercel, tens um caso prático completo que podes demonstrar ao vivo em qualquer entrevista.',
      commonPitfall: 'Dividir a faturação da cidade pelo número de vendas em vez de dividir pelo número de clientes únicos (.nunique()) dessa cidade.',
      referenceTitle: 'Lista de competências que já tens',
      referenceRows: [
        { syntax: 'Lógica e Automação Python', meaning: 'Tipos, ciclos, coleções, funções e módulo csv', example: 'Trilha 1 completa' },
        { syntax: 'SQL Relacional e Analítico', meaning: 'JOINs, GROUP BY, HAVING, CASE, CTEs, Window Functions e Performance', example: 'Trilhas 2 e 7' },
        { syntax: 'Engenharia / Limpeza Pandas', meaning: 'DataFrames, merge, séries temporais, pipeline Bronze/Silver/Gold e Data Quality', example: 'Trilhas 3 e 7' },
        { syntax: 'Git, BI e Estatística', meaning: 'Git/GitHub, Curva ABC, Star Schema, DAX, Testes A/B e Regressão', example: 'Trilhas 4, 5 e 6' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

completo = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
completo = completo.merge(clientes[["id", "cidade"]], left_on="cliente_id", right_on="id")
completo.head(5)`,
      pythonChallenge: {
        description: 'Fecha o diagnóstico executivo 360º: guarda em receita_anual (26902.89), ticket_mediano (mediana de quantidade * preco arredondada a 2 casas), quota_mercearia_pct (peso percentual da categoria "Mercearia" na receita total arredondado a 2 casas) e cidade_maior_ltv (nome da cidade com maior gasto médio por cliente ativo).',
        starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

receita_anual = None
ticket_mediano = None
quota_mercearia_pct = None
cidade_maior_ltv = None

print(receita_anual, ticket_mediano, quota_mercearia_pct, cidade_maior_ltv)`,
        solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
clientes = pd.read_csv("dados/clientes.csv")
vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]

receita_anual = round(float(vendas["subtotal"].sum()), 2)
ticket_mediano = round(float(vendas["subtotal"].median()), 2)

v_prod = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
fat_mercearia = v_prod[v_prod["categoria"] == "Mercearia"]["subtotal"].sum()
quota_mercearia_pct = round(float(fat_mercearia / vendas["subtotal"].sum() * 100), 2)

v_cli = vendas.merge(clientes[["id", "cidade"]], left_on="cliente_id", right_on="id")
por_cid = v_cli.groupby("cidade").agg(fat=("subtotal", "sum"), cli=("cliente_id", "nunique"))
por_cid["ltv_medio"] = por_cid["fat"] / por_cid["cli"]
cidade_maior_ltv = str(por_cid["ltv_medio"].idxmax())

print(receita_anual, ticket_mediano, quota_mercearia_pct, cidade_maior_ltv)`,
        checks: [
          { label: 'receita_anual (26902.89)', expr: 'math.isclose(float(receita_anual), 26902.89, abs_tol=0.05)', actualExpr: 'receita_anual', hint: 'round(float(vendas["subtotal"].sum()), 2).' },
          { label: 'ticket_mediano (3.50)', expr: 'math.isclose(float(ticket_mediano), 3.50, abs_tol=0.02)', actualExpr: 'ticket_mediano', hint: 'round(float(vendas["subtotal"].median()), 2).' },
          { label: 'quota_mercearia_pct (51.59%)', expr: 'math.isclose(float(quota_mercearia_pct), 51.59, abs_tol=0.05)', actualExpr: 'quota_mercearia_pct', hint: 'Faturação da categoria Mercearia a dividir pela faturação total * 100.' },
          { label: 'cidade_maior_ltv ("Braga")', expr: 'cidade_maior_ltv == "Braga"', actualExpr: 'cidade_maior_ltv', hint: 'Divide a soma de subtotal pelo nunique de cliente_id em cada cidade (Braga tem 254.18 € / cliente).' },
          { label: 'O diagnóstico funciona com outras tabelas', expr: '(lambda r: abs(float(r["receita_anual"]) - 5.0) < 0.01 and abs(float(r["ticket_mediano"]) - 1.0) < 0.01 and abs(float(r["quota_mercearia_pct"]) - 60.0) < 0.01 and r["cidade_maior_ltv"] == "Faro")(correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 3], "produto_id": [1, 2, 2], "quantidade": [1, 1, 1], "preco": [3.0, 1.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]}), clientes=pd.DataFrame({"id": [1, 2, 3], "cidade": ["Faro", "Beja", "Beja"]})))', actualExpr: 'correr_com(vendas=pd.DataFrame({"cliente_id": [1, 2, 3], "produto_id": [1, 2, 2], "quantidade": [1, 1, 1], "preco": [3.0, 1.0, 1.0]}), produtos=pd.DataFrame({"id": [1, 2], "categoria": ["Mercearia", "Bebidas"]}), clientes=pd.DataFrame({"id": [1, 2, 3], "cidade": ["Faro", "Beja", "Beja"]})).get("cidade_maior_ltv")', hint: 'Cada indicador tem de sair de vendas, produtos e clientes, sem números escritos à mão.' },
        ],
      },
      quiz: {
        question: 'Ao responder a uma pergunta vaga da direção ("Qual é a melhor cidade?"), como deve agir um Analista de Dados profissional?',
        options: [
          'Responder logo com a cidade de maior faturação total, sem mais.',
          'Clarificar o critério e mostrar total e média por cliente.',
          'Dizer que a pergunta não tem resposta possível.',
          'Escolher a cidade com mais clientes registados.',
        ],
        correctIndex: 1,
        explanation: 'Em faturação total ganha Lisboa (5 885,34 €); em gasto médio por cliente ativo ganha Braga (254,18 €). Traduzir perguntas vagas em métricas precisas é a assinatura de um bom analista.',
      },
    },
    {
      id: 'pro-07-json-exceptions',
      code: '07',
      title: 'Ficheiros JSON, APIs e tratamento de erros com try / except',
      lede: 'No trabalho, muitos dados não chegam em CSV mas em JSON, vindos de APIs web, e o teu código tem de saber lidar com erros sem parar o servidor.',
      analogyTitle: 'Receber encomendas em caixas dentro de caixas e isolar pacotes danificados',
      analogyBody: 'Um JSON é uma combinação de listas e dicionários uns dentro dos outros (como uma encomenda com dados do fornecedor e uma lista de artigos lá dentro). Com try / except, se uma linha vier avariada, o programa regista o erro e continua a processar as restantes.',
      concepts: [
        'import json: json.loads(texto) transforma texto JSON em dicionários/listas Python; json.dumps(obj) faz o inverso.',
        'try / except ValueError: captura erros de conversão sem deixar o programa rebentar a meio de um lote de 10 000 registos.',
        'pd.json_normalize() ou compreensões de listas achatam JSONs aninhados numa tabela plana pronta para SQL ou BI.',
      ],
      beginnerSteps: [
        'Carrega o texto JSON com dados = json.loads(resposta_api).',
        'Percorre a lista de registos e envolve as conversões arriscadas num bloco try: ... except (ValueError, KeyError):.',
        'Acumula os registos limpos numa lista e conta quantos erros foram intercetados.',
      ],
      proPractice: 'Nunca uses um except: vazio que esconde todos os erros silenciosamente: captura as exceções específicas (ValueError, KeyError) e guarda os registos defeituosos numa fila de quarentena (Dead-Letter Queue).',
      commonPitfall: 'Confundir um dicionário Python em memória com uma string JSON (usa sempre json.loads para ler texto JSON).',
      referenceTitle: 'JSON e tratamento de exceções em Python',
      referenceRows: [
        { syntax: 'json.loads(texto_json)', meaning: 'Converte string JSON para dict/list Python', example: 'payload = json.loads(raw)' },
        { syntax: 'json.dumps(dicionario, indent=2)', meaning: 'Serializa objeto Python para texto JSON', example: 'Exportar configuração' },
        { syntax: 'try: ... except ValueError:', meaning: 'Interceta erro sem abortar o programa', example: 'Tratar preço corrompido' },
      ],
      engine: 'python',
      exampleCode: `import json

resposta_api = '''
{
  "fornecedor": "Cooperativa do Douro",
  "lote": [
    {"produto": "Azeite", "qtd": "10", "custo": "5.20"},
    {"produto": "Queijo", "qtd": "erro", "custo": "3.40"},
    {"produto": "Café", "qtd": "15", "custo": "2.10"}
  ]
}
'''

dados = json.loads(resposta_api)
total_custo = 0.0
erros = 0

for item in dados["lote"]:
    try:
        total_custo += int(item["qtd"]) * float(item["custo"])
    except ValueError:
        erros += 1

print(f"Fornecedor: {dados['fornecedor']} | Custo válido: {total_custo:.2f} € | Registos c/ erro: {erros}")`,
      pythonChallenge: {
        description: 'Processe o JSON entregas_json usando json.loads e um bloco try / except ValueError: soma em valor_valido o total (unidades * preco) apenas dos artigos válidos e conta em registos_invalidos quantos artigos deram erro de conversão.',
        starterCode: `import json

entregas_json = '''
[
  {"artigo": "Pão", "unidades": "40", "preco": "0.25"},
  {"artigo": "Leite", "unidades": "vinte", "preco": "0.89"},
  {"artigo": "Azeite", "unidades": "4", "preco": "7.50"},
  {"artigo": "Sumo", "unidades": "10", "preco": "N/A"}
]
'''

valor_valido = 0.0
registos_invalidos = 0

# Converte entregas_json com json.loads e processe com try / except ValueError:


print(valor_valido, registos_invalidos)`,
        solutionCode: `import json

entregas_json = '''
[
  {"artigo": "Pão", "unidades": "40", "preco": "0.25"},
  {"artigo": "Leite", "unidades": "vinte", "preco": "0.89"},
  {"artigo": "Azeite", "unidades": "4", "preco": "7.50"},
  {"artigo": "Sumo", "unidades": "10", "preco": "N/A"}
]
'''

valor_valido = 0.0
registos_invalidos = 0

for item in json.loads(entregas_json):
    try:
        valor_valido += int(item["unidades"]) * float(item["preco"])
    except ValueError:
        registos_invalidos += 1

print(valor_valido, registos_invalidos)`,
        checks: [
          { label: 'valor_valido == 40.0 €', expr: 'math.isclose(float(valor_valido), 40.0, abs_tol=0.01)', actualExpr: 'valor_valido', hint: '40 * 0.25 (10 €) + 4 * 7.50 (30 €) = 40.0 €.' },
          { label: 'registos_invalidos == 2', expr: 'int(registos_invalidos) == 2', actualExpr: 'registos_invalidos', hint: '"vinte" e "N/A" disparam ValueError, somando 2 inválidos.' },
          { label: 'O try / except funciona com outro ficheiro JSON', expr: '(lambda r: abs(float(r["valor_valido"]) - 3.0) < 0.001 and int(r["registos_invalidos"]) == 1)(correr_com(entregas_json=\'[{"artigo": "A", "unidades": "2", "preco": "1.5"}, {"artigo": "B", "unidades": "x", "preco": "1"}]\'))', actualExpr: 'correr_com(entregas_json=\'[{"artigo": "A", "unidades": "2", "preco": "1.5"}, {"artigo": "B", "unidades": "x", "preco": "1"}]\').get("valor_valido")', hint: 'Percorre json.loads(entregas_json) e soma dentro do try; conta os ValueError no except.' },
        ],
      },
      quiz: {
        question: 'Porque é que num pipeline profissional de dados devemos capturar exceções específicas como except (ValueError, KeyError): em vez de um except: genérico?',
        options: [
          'Porque o except: genérico não existe em Python 3.',
          'Porque um except: vazio esconde também erros de programação.',
          'Porque assim o programa corre mais depressa.',
          'Porque o except: genérico não consegue apanhar ValueError nem KeyError.',
        ],
        correctIndex: 1,
        explanation: 'Um except: vazio apanha tudo, até nomes de variáveis mal escritos. Capturar só a exceção esperada mantém os bugs visíveis.',
      },
    },
    {
      id: 'pro-08-python-sqlite-dbapi',
      code: '08',
      title: 'Python e SQL juntos: sqlite3, queries parametrizadas e pd.read_sql',
      lede: 'Aprende a ligar Python diretamente a uma base de dados SQL, executar queries seguras contra SQL Injection e carregar o resultado direto para um DataFrame Pandas.',
      analogyTitle: 'O Python como maestro que comanda a base de dados SQL',
      analogyBody: 'Em vez de correres SQL num programa e Python noutro, o módulo sqlite3 (ou psycopg2/SQLAlchemy em PostgreSQL) permite ao teu script Python enviar queries SQL parametrizadas com ? e receber uma tabela Pandas pronta.',
      concepts: [
        'sqlite3.connect(":memory:") cria uma base de dados SQL rápida em memória controlada pelo Python.',
        'df.to_sql("vendas", con, index=False) grava qualquer DataFrame Pandas como tabela SQL; pd.read_sql_query(sql, con, params=...) lê de SQL para Pandas.',
        'Segurança máxima: NUNCA uses f-strings para injetar variáveis num WHERE SQL! Usa sempre marcadores ? (ou :nome) passando os parâmetros separadamente para impedir ataques de SQL Injection.',
      ],
      beginnerSteps: [
        'Abre uma ligação SQL com con = sqlite3.connect(":memory:").',
        'Carrega o CSV com pandas e grava na base de dados com df.to_sql("vendas", con, index=False).',
        'Executa consultas seguras com pd.read_sql_query("SELECT ... WHERE produto = ?", con, params=["Azeite"]).',
      ],
      proPractice: 'No dia a dia empresarial, este é o fluxo mais usado do mundo: o SQL faz os filtros e JOINs pesados dentro do servidor de base de dados e entrega apenas o resultado agregado ao Python/Pandas.',
      commonPitfall: 'Escrever f"SELECT * FROM vendas WHERE produto = \'{input_utilizador}\'" — vulnerabilidade grave de segurança (SQL Injection).',
      referenceTitle: 'Python e SQL juntos (DB-API 2.0 e pandas)',
      referenceRows: [
        { syntax: 'con = sqlite3.connect(":memory:")', meaning: 'Abre ligação SQLite em Python', example: 'Motor relacional embutido' },
        { syntax: 'df.to_sql("tab", con, index=False)', meaning: 'Exporta DataFrame Pandas para tabela SQL', example: 'vendas.to_sql("vendas", con)' },
        { syntax: 'pd.read_sql_query(sql, con, params=[...])', meaning: 'Executa SQL parametrizado e devolve DataFrame', example: 'params=["Azeite", 3]' },
      ],
      engine: 'python',
      exampleCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
vendas = pd.read_csv("dados/vendas_sazonais.csv")
vendas.to_sql("vendas_sazonais", con, index=False)

query = """
SELECT produto, SUM(quantidade) AS unidades, ROUND(SUM(quantidade * preco), 2) AS faturacao
FROM vendas_sazonais
WHERE data >= ? AND quantidade >= ?
GROUP BY produto
ORDER BY faturacao DESC
LIMIT 5
"""

resultado = pd.read_sql_query(query, con, params=["2025-11-01", 2])
resultado`,
      pythonChallenge: {
        description: 'Usando sqlite3 e pandas: carrega dados/vendas.csv para uma tabela SQL "vendas" numa ligação em memória e usa pd.read_sql_query com parâmetros seguros (?) para calcular em faturacao_queijo_q4 a faturação total (ROUND(SUM(quantidade * preco), 2)) do produto "Queijo" no 4.º trimestre (data >= "2025-10-01").',
        starterCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
df = pd.read_csv("dados/vendas.csv")
df.to_sql("vendas", con, index=False)

# Executa uma query parametrizada (?) para obter a faturação de "Queijo" com data >= "2025-10-01":
faturacao_queijo_q4 = None

print(faturacao_queijo_q4)`,
        solutionCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
df = pd.read_csv("dados/vendas.csv")
df.to_sql("vendas", con, index=False)

sql = """
SELECT ROUND(SUM(quantidade * preco), 2) AS total
FROM vendas
WHERE produto = ? AND data >= ?
"""
res = pd.read_sql_query(sql, con, params=["Queijo", "2025-10-01"])
faturacao_queijo_q4 = float(res["total"].iloc[0])

print(faturacao_queijo_q4)`,
        checks: [
          { label: 'faturacao_queijo_q4 calculada via SQL + Python', expr: 'faturacao_queijo_q4 is not None and math.isclose(float(faturacao_queijo_q4), float(pd.read_csv("dados/vendas.csv").query("produto == \'Queijo\' and data >= \'2025-10-01\'").eval("quantidade * preco").sum()), abs_tol=0.05)', actualExpr: 'faturacao_queijo_q4', hint: 'Filtra WHERE produto = ? AND data >= ? com params=["Queijo", "2025-10-01"].' },
          { label: 'A consulta parametrizada funciona com outros dados', expr: 'abs(float(correr_com(df=pd.DataFrame({"data": ["2025-10-05", "2025-09-01"], "produto": ["Queijo", "Queijo"], "quantidade": [2, 5], "preco": [4.9, 4.9]}))["faturacao_queijo_q4"]) - 9.8) < 0.001', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-10-05", "2025-09-01"], "produto": ["Queijo", "Queijo"], "quantidade": [2, 5], "preco": [4.9, 4.9]})).get("faturacao_queijo_q4")', hint: 'Carrega df com to_sql e lê o resultado da query com read_sql_query, sem escrever o número à mão.' },
        ],
      },
      quiz: {
        question: 'Porque devemos passar filtros dinâmicos através de params=["Queijo"] com ? em vez de colar texto diretamente na string SQL com f-strings?',
        options: [
          'Porque as f-strings são mais lentas do que o ?.',
          'Porque o ? separa os dados do comando e evita SQL Injection.',
          'Porque o SQLite não aceita texto que venha de f-strings do Python.',
          'Porque só assim a query funciona com acentos.',
        ],
        correctIndex: 1,
        explanation: 'Com ? o SQLite recebe o comando e os dados em separado, por isso um texto com aspas ou com código malicioso nunca é executado. É regra obrigatória em qualquer empresa.',
      },
    },
    {
      id: 'pro-09-projeto-final',
      code: '09',
      title: 'Projeto final guiado: da pergunta à recomendação',
      lede: 'Junta tudo num só projeto: uma pergunta do dono, uma query SQL, uma transformação em pandas, um gráfico honesto e uma recomendação escrita que alguém consegue usar na segunda-feira.',
      analogyTitle: 'Do pedido ao balcão',
      analogyBody: 'O dono pergunta: "Quando e em que categoria devo reforçar o stock?". O SQL vai ao armazém buscar os números certos, o pandas arruma-os na prateleira, o gráfico põe-nos na montra e a recomendação é a frase que dizes ao dono em 10 segundos. Cada ferramenta faz o que faz melhor.',
      concepts: [
        'Começa sempre pela pergunta de negócio e só depois escolhe as ferramentas.',
        'SQL para extrair e agregar (JOIN + GROUP BY); pandas para remodelar e comparar (pivot_table, médias, percentagens).',
        'pd.read_sql_query(consulta, ligacao) traz o resultado de uma query SQL diretamente para um DataFrame.',
        'Um gráfico por mensagem: aqui, uma linha mês a mês com o eixo no zero mostra o pico de dezembro.',
        'A recomendação diz o quê, quando e porquê, com um número: "Reforçar Charcutaria em dezembro: vende +194% do que num mês normal."',
      ],
      beginnerSteps: [
        'Escreve a consulta SQL: faturação por mes (SUBSTR(v.data, 1, 7)) e categoria, com JOIN entre vendas_sazonais e produtos.',
        'Lê o resultado com pd.read_sql_query(consulta, ligacao) para o DataFrame mensal.',
        'Cria matriz = mensal.pivot_table(values="faturacao", index="mes", columns="categoria", aggfunc="sum").',
        'Compara dezembro com a média de janeiro a novembro em cada categoria e escolhe a maior subida.',
        'Desenha a faturação total por mês com ax.plot(...), eixo no zero e título com a conclusão.',
        'Escreve a recomendação numa frase com a categoria, o mês e a percentagem.',
      ],
      proPractice: 'Este é o formato de um caso técnico de entrevista: pergunta, método, resultado, gráfico e recomendação. Publica-o no GitHub com um README de 5 linhas a seguir esta mesma ordem.',
      commonPitfall: 'Comparar dezembro com a média dos 12 meses (incluindo o próprio dezembro): o pico entra na média e a subida parece menor do que é.',
      referenceTitle: 'Roteiro do projeto final',
      referenceRows: [
        { syntax: '1. Pergunta', meaning: 'Quando e em que categoria reforçar o stock?', example: 'Pedido do dono' },
        { syntax: '2. SQL', meaning: 'JOIN + GROUP BY mes, categoria', example: '72 linhas (12 meses x 6 categorias)' },
        { syntax: '3. pandas', meaning: 'pivot_table e comparação com a média', example: 'Subida de dezembro por categoria' },
        { syntax: '4. Gráfico', meaning: 'Linha mês a mês com eixo no zero', example: 'Pico de 6 317,85 € em dezembro' },
        { syntax: '5. Recomendação', meaning: 'O quê, quando e porquê, com um número', example: 'Charcutaria em dezembro (+194%)' },
      ],
      engine: 'python',
      exampleCode: `import sqlite3
import pandas as pd

# Carregar os CSV para uma base SQLite em memória (o mesmo que fizeste na etapa sqlite3)
ligacao = sqlite3.connect(":memory:")
for nome in ["vendas_sazonais", "produtos"]:
    pd.read_csv(f"dados/{nome}.csv").to_sql(nome, ligacao, index=False)

consulta = """
SELECT p.categoria, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao
FROM vendas_sazonais v
JOIN produtos p ON p.id = v.produto_id
GROUP BY p.categoria
ORDER BY faturacao DESC
"""
pd.read_sql_query(consulta, ligacao)`,
      pythonChallenge: {
        description: 'Responde ao dono: "Quando e em que categoria devo reforçar o stock?" com vendas_sazonais.csv. 1) Em consulta, escreve o SQL que devolve mes (AAAA-MM), categoria e faturacao, e lê-o para mensal com pd.read_sql_query. 2) Com pivot_table cria matriz (meses x categorias). 3) Guarda em categoria_reforco a categoria com maior subida de dezembro face à média de janeiro a novembro e em subida_reforco_pct essa subida em % (1 casa decimal). 4) Desenha a faturação total por mês em fig, ax (linha, eixo no zero, título). 5) Escreve a recomendacao numa frase com a categoria, o mês e a percentagem.',
        starterCode: `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

ligacao = sqlite3.connect(":memory:")
for nome in ["vendas_sazonais", "produtos"]:
    pd.read_csv(f"dados/{nome}.csv").to_sql(nome, ligacao, index=False)

# 1) SQL: mes (SUBSTR(v.data, 1, 7)), categoria e faturacao, com JOIN e GROUP BY
consulta = """
"""
mensal = None

# 2) pandas: matriz meses x categorias
matriz = None

# 3) Subida de dezembro face à média de janeiro a novembro
categoria_reforco = None
subida_reforco_pct = None

# 4) Gráfico da faturação total por mês (fig, ax)

# 5) Recomendação numa frase
recomendacao = ""
print(categoria_reforco, subida_reforco_pct)
print(recomendacao)`,
        solutionCode: `import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

ligacao = sqlite3.connect(":memory:")
for nome in ["vendas_sazonais", "produtos"]:
    pd.read_csv(f"dados/{nome}.csv").to_sql(nome, ligacao, index=False)

consulta = """
SELECT SUBSTR(v.data, 1, 7) AS mes, p.categoria, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao
FROM vendas_sazonais v
JOIN produtos p ON p.id = v.produto_id
GROUP BY mes, p.categoria
ORDER BY mes
"""
mensal = pd.read_sql_query(consulta, ligacao)

matriz = mensal.pivot_table(values="faturacao", index="mes", columns="categoria", aggfunc="sum")

media_resto = matriz.loc[matriz.index != "2025-12"].mean()
subida = (matriz.loc["2025-12"] / media_resto - 1) * 100
categoria_reforco = str(subida.idxmax())
subida_reforco_pct = round(float(subida.max()), 1)

total_mes = matriz.sum(axis=1)
fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(total_mes.index.str.slice(5, 7), total_mes.values, marker="o")
ax.set_ylim(bottom=0)
ax.set_title("Dezembro é o mês mais forte do ano")
ax.set_xlabel("Mês de 2025")
ax.set_ylabel("Faturação (€)")
fig.tight_layout()

recomendacao = (
    f"Reforçar o stock de {categoria_reforco} em dezembro: "
    f"vende +{subida_reforco_pct}% do que num mês normal."
)
print(categoria_reforco, subida_reforco_pct)
print(recomendacao)`,
        checks: [
          { label: 'consulta usa JOIN e GROUP BY e mensal tem 72 linhas (12 meses x 6 categorias)', expr: '"JOIN" in consulta.upper() and "GROUP BY" in consulta.upper() and hasattr(mensal, "shape") and mensal.shape[0] == 72 and {"mes", "categoria", "faturacao"} <= set(mensal.columns)', actualExpr: 'getattr(mensal, "shape", mensal)', hint: 'SELECT SUBSTR(v.data, 1, 7) AS mes, p.categoria, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao ... GROUP BY mes, p.categoria.' },
          { label: 'matriz tem 12 meses x 6 categorias', expr: 'hasattr(matriz, "shape") and tuple(matriz.shape) == (12, 6)', actualExpr: 'getattr(matriz, "shape", matriz)', hint: 'mensal.pivot_table(values="faturacao", index="mes", columns="categoria", aggfunc="sum").' },
          { label: 'categoria_reforco ("Charcutaria") e subida_reforco_pct (194.0)', expr: 'categoria_reforco == "Charcutaria" and math.isclose(float(subida_reforco_pct), 194.0, abs_tol=0.15)', actualExpr: '(categoria_reforco, subida_reforco_pct)', hint: 'Divide a linha "2025-12" da matriz pela média dos outros 11 meses, subtrai 1 e multiplica por 100; depois .idxmax() e .max().' },
          { label: 'Gráfico de linha com 12 meses e eixo no zero', expr: 'len(ax.get_lines()) >= 1 and len(ax.get_lines()[0].get_xdata()) == 12 and ax.get_ylim()[0] <= 0 and len(ax.get_title().strip()) >= 10', actualExpr: '(len(ax.get_lines()), ax.get_ylim(), ax.get_title())', hint: 'fig, ax = plt.subplots(); ax.plot(meses, totais, marker="o"); ax.set_ylim(bottom=0); ax.set_title("...").' },
          { label: 'A recomendação diz a categoria, o mês e a percentagem', expr: 'isinstance(recomendacao, str) and "charcutaria" in recomendacao.lower() and "dezembro" in recomendacao.lower() and "%" in recomendacao and "194" in recomendacao', actualExpr: 'recomendacao', hint: 'Usa uma f-string: f"Reforçar o stock de {categoria_reforco} em dezembro: vende +{subida_reforco_pct}% do que num mês normal."' },
        ],
      },
      quiz: {
        question: 'Qual destas recomendações finais é a mais útil para o dono da mercearia?',
        options: [
          '"A faturação varia ao longo do ano e algumas categorias crescem."',
          '"Reforçar Charcutaria em dezembro: vende +194% do que num mês normal."',
          '"Ver o gráfico em anexo para perceber a evolução das categorias."',
          '"Os dados mostram tendências interessantes que convém acompanhar."',
        ],
        correctIndex: 1,
        explanation: 'Uma boa recomendação diz o quê, quando e porquê, com um número que a sustenta. As outras descrevem os dados mas não dizem ao dono o que fazer.',
      },
    },
    {
      id: 'pro-11-portefolio-readme',
      code: '11',
      title: 'Apresentar o projeto: o README que um recrutador lê em 2 minutos',
      lede: 'Um recrutador abre o teu GitHub e decide em poucos minutos. Geras, a partir dos dados, um README curto com a pergunta de negócio, os dados, as conclusões com números e como correr o projeto.',
      analogyTitle: 'A capa e o resumo executivo de um livro técnico',
      analogyBody: 'Ninguém lê 300 páginas de apêndice sem antes ler a contracapa. Os cadernos e scripts são os apêndices; o README é a contracapa executiva que, em 30 segundos, diz que problema resolveste, que número encontraste e como confirmar tudo.',
      concepts: [
        'Estrutura que funciona: título, pergunta de negócio, dados usados, conclusões (3 a 5 frases com números), como correr e ferramentas usadas.',
        'Começa pelas conclusões, não pelo método: "A Mercearia vale 52% da faturação" interessa mais do que "usei groupby".',
        'Os números do README devem vir do código (f-strings), não de cópias à mão: se os dados mudarem, o README continua certo.',
        'Formato português nos números para leitores portugueses: 26 902,89 € (espaço nos milhares, vírgula decimal).',
        'Curto e visual: até 40 linhas, um gráfico e links para os cadernos e o dashboard. O detalhe fica nos ficheiros.',
      ],
      beginnerSteps: [
        'Calcula os 3 números principais: faturação total, categoria líder com a sua quota e o mês de pico.',
        'Usa a função euros(valor) já dada para formatar em português.',
        'Monta o README com uma f-string de várias linhas e as secções ## Pergunta, ## Dados, ## Conclusões e ## Como correr.',
        'Confirma que tem menos de 40 linhas.',
      ],
      proPractice: 'No CV e no LinkedIn, descreve cada projeto numa frase com ação, ferramenta e resultado: "Analisei 5 078 vendas com SQL e pandas e mostrei que 2 produtos valem 40% da faturação". Leva o link para o README.',
      commonPitfall: 'README só com instruções de instalação, ou com números escritos à mão que deixaram de bater certo com o código. Quem lê quer saber primeiro o que descobriste.',
      referenceTitle: 'Gerar texto a partir dos dados',
      referenceRows: [
        { syntax: 'f"""...{valor}..."""', meaning: 'f-string de várias linhas', example: 'O README inteiro' },
        { syntax: 'f"{x:,.2f}".replace(",", " ").replace(".", ",")', meaning: 'Número em formato português', example: '26 902,89' },
        { syntax: 'texto.count("\\n")', meaning: 'Contar linhas', example: 'Até 40' },
        { syntax: 'open("README.md", "w", encoding="utf-8").write(readme)', meaning: 'Gravar o ficheiro (no teu computador)', example: 'README.md do projeto' },
      ],
      engine: 'python',
      exampleCode: `def euros(valor):
    return f"{valor:,.2f} €".replace(",", " ").replace(".", ",", 1)

projeto = "Caixa Registadora"
linhas = 5078
print(f"""# {projeto}

## Pergunta
Que produtos sustentam a faturação da loja?

## Conclusões
- Analisei {linhas} linhas de vendas.
- Faturação total: {euros(26902.89)}.
""")`,
      pythonChallenge: {
        description: 'Gera o README do teu projeto a partir de vendas.csv e produtos.csv:\n1) faturacao_total, categoria_top, quota_top_pct (1 casa) e mes_pico (o mês com mais faturação, no formato 2025-09).\n2) readme: texto que começa por "# ", com as secções ## Pergunta, ## Dados, ## Conclusões e ## Como correr, e menos de 40 linhas.\n3) As conclusões mostram a faturação total com euros(...), a categoria líder com a quota em % e o mês de pico.\nA frase para o CV está no treino 1.',
        starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]


def euros(valor):
    return f"{valor:,.2f} €".replace(",", " ").replace(".", ",", 1)


faturacao_total = None
categoria_top = None
quota_top_pct = None
mes_pico = None
readme = None
print(readme)`,
        solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]


def euros(valor):
    return f"{valor:,.2f} €".replace(",", " ").replace(".", ",", 1)


faturacao_total = vendas["sub"].sum()
por_categoria = vendas.merge(produtos, left_on="produto_id", right_on="id").groupby("categoria")["sub"].sum()
categoria_top = por_categoria.idxmax()
quota_top_pct = round(float(por_categoria.max() / por_categoria.sum() * 100), 1)
mes_pico = vendas.groupby(vendas["data"].str.slice(0, 7))["sub"].sum().idxmax()

readme = f"""# Mercearia do Bairro: o que sustenta a faturação?

## Pergunta
Que categorias e meses pesam mais na faturação de 2025?

## Dados
{len(vendas)} linhas de vendas de 2025 (dados/vendas.csv) e o catálogo de {len(produtos)} produtos.

## Conclusões
- Faturação total do ano: {euros(faturacao_total)}.
- A categoria {categoria_top} vale {quota_top_pct}% da faturação.
- O mês mais forte foi {mes_pico}.

## Como correr
pip install -r requirements.txt e depois python src/caixa.py.

Ferramentas: Python, pandas, SQL e Power BI.
"""
print(readme)`,
        checks: [
          { label: 'Números: 26 902,89 €, Mercearia com 51.6% e pico em 2025-09', expr: 'abs(float(faturacao_total) - 26902.89) < 0.01 and categoria_top == "Mercearia" and abs(float(quota_top_pct) - 51.6) < 0.05 and mes_pico == "2025-09"', actualExpr: '(faturacao_total, categoria_top, quota_top_pct, mes_pico)', hint: 'Soma por categoria (com merge) e por mês (data.str.slice(0, 7)) e usa .idxmax().' },
          { label: 'Título e as 4 secções, em menos de 40 linhas', expr: 'isinstance(readme, str) and readme.startswith("# ") and all(s in readme for s in ["## Pergunta", "## Dados", "## Conclusões", "## Como correr"]) and readme.count("\\n") < 40', actualExpr: '(readme[:40] + "...", readme.count("\\n")) if isinstance(readme, str) else readme', hint: 'Usa uma f-string de várias linhas (três aspas) com as secções ## Pergunta, ## Dados, ## Conclusões e ## Como correr.' },
          { label: 'As conclusões mostram os números calculados', expr: 'euros(faturacao_total) in readme and categoria_top in readme and f"{quota_top_pct}%" in readme and mes_pico in readme', actualExpr: 'euros(faturacao_total) in readme if isinstance(readme, str) else None', hint: 'Escreve {euros(faturacao_total)}, {categoria_top}, {quota_top_pct}% e {mes_pico} dentro da f-string.' },
          { label: 'O README acompanha os dados', expr: 'euros(10.0) in correr_com(vendas=pd.DataFrame({"data": ["2025-03-01"], "produto_id": [1], "quantidade": [4], "preco": [2.5]}))["readme"]', actualExpr: 'correr_com(vendas=pd.DataFrame({"data": ["2025-03-01"], "produto_id": [1], "quantidade": [4], "preco": [2.5]})).get("faturacao_total")', hint: 'Os números do README têm de vir das variáveis, não escritos à mão.' },
        ],
      },
      quiz: {
        question: 'Qual destas frases é melhor para abrir as conclusões de um README de portefólio?',
        options: [
          'Usei pandas, groupby e merge para processar os ficheiros CSV.',
          'Este projeto foi feito no âmbito de um curso de análise de dados, com Python, SQL e Power BI.',
          'Os dados têm 5 078 linhas e 6 colunas.',
          'Dois produtos (Azeite e Queijo) valem 40% da faturação: são os que não podem faltar.',
        ],
        correctIndex: 3,
        explanation: 'Quem lê quer saber o que descobriste e porque importa. O método e o tamanho dos dados vêm depois.',
      },
    },
    {
      id: 'pro-12-desafio-recrutamento',
      code: '12',
      title: 'Desafio de recrutamento simulado: "Porque é que as vendas caíram em março?"',
      lede: 'Num processo de seleção real não recebes um enunciado com 7 passos: recebes um pedido vago ("A faturação caiu em março, descobre porquê") e um ficheiro novo. Tempo estimado: 2 a 3 horas no computador (ou 45–60 min aqui), sem pistas de código.',
      analogyTitle: 'O motor de 3 engrenagens quando o carro perde força',
      analogyBody: 'Quando a faturação cai, trata o negócio como um motor de três engrenagens ligadas: Pedidos tentados × (1 - Taxa de cancelamento) × Ticket médio. Se o carro abrandou em março, não adivinhas — medes cada engrenagem por canal até encontrares exatamente a peça que partiu.',
      concepts: [
        'Decompor um pedido vago: Faturação = Pedidos tentados × (1 - Taxa de cancelamento) × Ticket médio. Mede cada peça separadamente.',
        'Filtrar pelo estado certo: somar pedidos "Cancelado" esconde a queda real ou distorce o diagnóstico.',
        'Segmentar por canal, categoria e dia: uma queda abrupta num único canal a partir de um dia específico aponta para uma falha técnica (checkout/pagamento) e não para sazonalidade.',
        'Comunicar para quem decide: abre o relatório com o diagnóstico e o número principal, mostra a evidência (canal, taxa antes/depois, ticket) e fecha com o próximo passo concreto.',
      ],
      beginnerSteps: [
        'Lê dados/loja_online_pedidos.csv e espreita as colunas, os valores de estado, canal e os meses disponíveis.',
        'Calcula a faturação líquida (apenas estado == "Concluído") de fevereiro (2025-02) e março (2025-03) e a variação percentual.',
        'Compara o número de pedidos tentados, o ticket médio dos concluídos e a taxa de cancelamento por mês e por canal (App vs Web).',
        'Escreve relatorio com as secções ## Diagnóstico, ## Evidência e ## Recomendação usando os números calculados.',
      ],
      proPractice: 'Num teste real de recrutamento, nunca entregues só um caderno cheio de código: entrega um resumo executivo de meia página no topo (ou num PDF/README curto) e deixa o código limpo por baixo.',
      commonPitfall: 'Somar quantidade * preco_unit sem filtrar estado == "Concluído", ou concluir que "os clientes deixaram de comprar" quando o número de tentativas até se manteve igual.',
      referenceTitle: 'Roteiro de diagnóstico comercial',
      referenceRows: [
        { syntax: 'df[df["estado"] == "Concluído"]', meaning: 'Isola a faturação real, excluindo cancelamentos', example: 'conc = df[df["estado"] == "Concluído"]' },
        { syntax: 'df.assign(cancel=df["estado"] == "Cancelado").pivot_table(...)', meaning: 'Cruza taxa de cancelamento por mês e canal', example: 'pivot_table(index="mes", columns="canal", values="cancel", aggfunc="mean")' },
        { syntax: '(fat_mar - fat_fev) / fat_fev * 100', meaning: 'Variação percentual mês a mês', example: '-17.36%' },
        { syntax: '## Diagnóstico / ## Evidência / ## Recomendação', meaning: 'Estrutura executiva para entregar conclusões escritas', example: 'Usar f-string com números reais' },
      ],
      engine: 'python',
      ficheirosDados: ['loja_online_pedidos.csv'],
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/loja_online_pedidos.csv")
print("Linhas:", len(df), "| Meses:", sorted(df["data"].str.slice(0, 7).unique()))
print(df["estado"].value_counts())
print(df["canal"].value_counts())
df.head(5)`,
      pythonChallenge: {
        description: 'Investiga dados/loja_online_pedidos.csv sem pistas de código (tempo estimado: 45–60 min aqui, ou 2–3 h no teu computador) e responde à pergunta da direção: "Porque é que a faturação caiu em março?". Calcula:\n1) fat_fev e fat_mar: faturação líquida (apenas estado == "Concluído") em 2025-02 e 2025-03 (arredondadas a 2 casas), e variacao_pct (variação % de fev para mar, arredondada a 2 casas).\n2) canal_problema: nome do canal onde ocorreu a queda ("App" ou "Web"), taxa_cancel_app_fev e taxa_cancel_app_mar (taxa de cancelamento % na App em fev e mar, 2 casas).\n3) ticket_medio_fev e ticket_medio_mar: média do valor por pedido concluído em fev e mar (2 casas).\n4) relatorio: texto com as secções ## Diagnóstico, ## Evidência e ## Recomendação que inclua o canal afetado, a variação %, as duas taxas de cancelamento e um próximo passo prático.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/loja_online_pedidos.csv")

# Sem pistas: investiga os dados e calcula os indicadores + relatório escrito.
fat_fev = None
fat_mar = None
variacao_pct = None
canal_problema = None
taxa_cancel_app_fev = None
taxa_cancel_app_mar = None
ticket_medio_fev = None
ticket_medio_mar = None
relatorio = None

print(fat_fev, fat_mar, variacao_pct, canal_problema)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/loja_online_pedidos.csv")
df["mes"] = df["data"].str.slice(0, 7)
df["valor"] = df["quantidade"] * df["preco_unit"]

conc = df[df["estado"] == "Concluído"]
por_mes = conc.groupby("mes")["valor"].agg(["sum", "mean"])

fat_fev = round(float(por_mes.loc["2025-02", "sum"]), 2)
fat_mar = round(float(por_mes.loc["2025-03", "sum"]), 2)
variacao_pct = round((fat_mar - fat_fev) / fat_fev * 100, 2)

ticket_medio_fev = round(float(por_mes.loc["2025-02", "mean"]), 2)
ticket_medio_mar = round(float(por_mes.loc["2025-03", "mean"]), 2)

canc = df.assign(c=df["estado"] == "Cancelado").pivot_table(
    index="mes", columns="canal", values="c", aggfunc="mean"
) * 100
taxa_cancel_app_fev = round(float(canc.loc["2025-02", "App"]), 2)
taxa_cancel_app_mar = round(float(canc.loc["2025-03", "App"]), 2)

fat_canal = conc.pivot_table(index="mes", columns="canal", values="valor", aggfunc="sum")
quedas = fat_canal.loc["2025-03"] - fat_canal.loc["2025-02"]
canal_problema = str(quedas.idxmin())

relatorio = f"""## Diagnóstico
A faturação líquida caiu {variacao_pct}% de fevereiro ({fat_fev:.2f} €) para março ({fat_mar:.2f} €), puxada pelo canal {canal_problema}.

## Evidência
- O ticket médio manteve-se estável ({ticket_medio_fev:.2f} € em fev vs {ticket_medio_mar:.2f} € em mar) e o volume de tentativas não caiu.
- Na {canal_problema}, a taxa de cancelamento subiu de {taxa_cancel_app_fev}% em fevereiro para {taxa_cancel_app_mar}% em março (com salto abrupto a partir de 2025-03-10).

## Recomendação
Rever de imediato o fluxo de checkout e pagamentos na {canal_problema} a partir de 10 de março para recuperar os pedidos perdidos.
"""
print(relatorio)`,
        checks: [
          { label: 'fat_fev (88 492,11 €), fat_mar (73 130,13 €) e variacao_pct (-17,36%)', expr: 'math.isclose(float(fat_fev), 88492.11, abs_tol=0.05) and math.isclose(float(fat_mar), 73130.13, abs_tol=0.05) and math.isclose(float(variacao_pct), -17.36, abs_tol=0.05)', actualExpr: '(fat_fev, fat_mar, variacao_pct)', hint: 'Filtra estado == "Concluído" antes de somar quantidade * preco_unit.' },
          { label: 'canal_problema ("App") e taxas de cancelamento (3.36% -> 44.85%)', expr: 'canal_problema == "App" and math.isclose(float(taxa_cancel_app_fev), 3.36, abs_tol=0.05) and math.isclose(float(taxa_cancel_app_mar), 44.85, abs_tol=0.05)', actualExpr: '(canal_problema, taxa_cancel_app_fev, taxa_cancel_app_mar)', hint: 'Calcula a percentagem de pedidos com estado == "Cancelado" dentro do canal App em 2025-02 e 2025-03.' },
          { label: 'ticket_medio_fev (102.18 €) e ticket_medio_mar (102.57 €)', expr: 'math.isclose(float(ticket_medio_fev), 102.18, abs_tol=0.05) and math.isclose(float(ticket_medio_mar), 102.57, abs_tol=0.05)', actualExpr: '(ticket_medio_fev, ticket_medio_mar)', hint: 'Média de quantidade * preco_unit nos pedidos concluídos de cada mês.' },
          { label: 'relatorio escrito com as 3 secções, o canal e os números', expr: 'isinstance(relatorio, str) and all(s in relatorio for s in ["## Diagnóstico", "## Evidência", "## Recomendação"]) and canal_problema in relatorio and f"{variacao_pct}" in relatorio and f"{taxa_cancel_app_mar}" in relatorio', actualExpr: 'relatorio[:120] if isinstance(relatorio, str) else relatorio', hint: 'Usa uma f-string com ## Diagnóstico, ## Evidência e ## Recomendação e inclui {canal_problema}, {variacao_pct} e {taxa_cancel_app_mar}.' },
        ],
      },
      quiz: {
        question: 'Ao investigar uma queda súbita de faturação em março, notas que o número de pedidos tentados e o ticket médio não mudaram, mas os cancelamentos na App subiram de 3,4% para 44,9% a partir de 10 de março. Qual é o diagnóstico mais provável?',
        options: [
          'Os clientes perderam interesse nos produtos da loja.',
          'Os preços estão demasiado altos face à concorrência.',
          'Uma falha técnica ou de pagamento na App a partir de 10 de março está a impedir a conclusão dos pedidos.',
          'É um efeito normal de sazonalidade entre fevereiro e março.',
        ],
        correctIndex: 2,
        explanation: 'Quando a procura (tentativas) e o ticket se mantêm, mas os cancelamentos disparam num único canal a partir de um dia específico, a causa provável é técnica ou operacional (ex.: bug no checkout da App) e não comercial.',
      },
    },
  ],
};
