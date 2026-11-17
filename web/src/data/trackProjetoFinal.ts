import type { Track } from './types';

// Trilha 8: o projeto final. A etapa 1 é uma limpeza a sério, corrigida no browser, com um
// ficheiro de 20 300 viagens de bicicletas (dados/bicicletas_viagens_sujas.csv), carregado
// só nesta trilha através de ficheirosDados. Os números das verificações vêm de correr o
// gerador (src/gerar_dados.py); o ficheiro limpo de referência fica só para os testes.

export const projetoFinalTrack: Track = {
  id: 'projeto-final',
  shortTitle: '8. Projeto final',
  fullTitle: 'Projeto final: os teus dados, a tua pergunta, o teu portefólio',
  summary: 'Primeiro limpas a sério 20 300 viagens de bicicletas partilhadas, com regras escritas e contas do que sai. Depois escolhes os teus dados e a tua pergunta, fazes a análise no teu computador e publicas o projeto no teu portefólio.',
  engineLabel: 'Projeto no teu computador',
  lessons: [
    {
      id: 'pf-01-limpeza-bicicletas',
      code: '01',
      title: 'Limpeza a sério: 20 300 viagens de bicicletas',
      lede: 'Antes de escolheres os teus dados, treinas com um ficheiro à escala real: 20 300 viagens de uma rede de bicicletas partilhadas, com datas em três formatos, estações escritas de várias maneiras, viagens repetidas e durações impossíveis.',
      analogyTitle: 'A triagem do correio antes da distribuição',
      analogyBody: 'Num centro de correio ninguém distribui as cartas sem antes as separar: tiram-se as repetidas, corrigem-se as moradas mal escritas e põem-se de lado as que não podem seguir, com um registo de quantas ficaram para trás. Limpar dados é igual: cada regra tem um motivo e cada linha retirada fica contada.',
      concepts: [
        'drop_duplicates(subset="viagem_id") olha só para o identificador e fica com a primeira ocorrência (keep="first" é o valor por omissão).',
        'Para os nomes das estações: .str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii") tira os acentos; depois .str.lower().str.strip() e .str.replace("est. ", "estacao ", regex=False). No fim, .map(dicionario) troca a forma normalizada pelo nome oficial.',
        'Datas em vários formatos: um pd.to_datetime(..., format=..., errors="coerce") por formato. Cada um dá NaT onde o formato não encaixa, e .fillna() junta os três resultados numa só coluna.',
        'Contar o que sai: guarda len(antes) - len(depois) em cada passo, ou soma a máscara booleana (True conta 1) antes de filtrar.',
      ],
      beginnerSteps: [
        'Lê o ficheiro com pd.read_csv("dados/bicicletas_viagens_sujas.csv") e espreita-o com .head() e .value_counts().',
        'Tira os duplicados por viagem_id e conta quantas linhas saíram.',
        'Normaliza as duas colunas de estações e troca-as pelo nome oficial com o dicionário estacoes_canonicas.',
        'Converte inicio e fim com os três formatos de data e junta-os com .fillna().',
        'Arruma valor_eur (vírgula para ponto, depois float) e tipo_cliente (strip, capitalize e Desconhecido no vazio).',
        'Tira as durações impossíveis e as viagens com fim antes do início, contando cada grupo.',
        'Guarda o resultado em limpo e as contagens no dicionário removidas.',
      ],
      proPractice: 'Num relatório de limpeza diz-se sempre quantas linhas entraram, quantas saíram e porquê. Quem lê a tua análise tem de poder conferir esses números sem refazer o teu trabalho.',
      commonPitfall: 'Converter datas sem format= e deixar o pandas adivinhar: 03/04/2025 tanto pode ser 3 de abril como 4 de março. Com os formatos escritos à mão não há surpresas.',
      referenceTitle: 'Limpeza a sério em pandas',
      referenceRows: [
        { syntax: 'df.drop_duplicates(subset="viagem_id")', meaning: 'Tira as linhas com um identificador repetido e fica com a primeira', example: 'viagens.drop_duplicates(subset="viagem_id")' },
        { syntax: 's.str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii")', meaning: 'Tira os acentos de uma coluna de texto', example: '"Estação" passa a "Estacao"' },
        { syntax: 's.map(dicionario)', meaning: 'Troca cada valor pelo do dicionário (NaN se não estiver lá)', example: 's.map(estacoes_canonicas)' },
        { syntax: 'pd.to_datetime(s, format="%d/%m/%Y %H:%M", errors="coerce")', meaning: 'Converte só o que encaixa no formato; o resto fica NaT', example: '"14/03/2025 08:05"' },
        { syntax: 'a.fillna(b)', meaning: 'Preenche os vazios de a com os valores de b na mesma linha', example: 'iso.fillna(barras).fillna(com_h)' },
        { syntax: 's.str.strip().str.capitalize()', meaning: 'Tira os espaços das pontas e deixa só a primeira letra em maiúscula', example: '" ANUAL " passa a "Anual"' },
      ],
      engine: 'python',
      ficheirosDados: ['bicicletas_viagens_sujas.csv'],
      exampleCode: `import pandas as pd

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")
print("Linhas:", len(viagens), "| viagem_id repetidos:", viagens["viagem_id"].duplicated().sum())
print(viagens["tipo_cliente"].value_counts(dropna=False))
print(viagens["inicio"].sample(8, random_state=1).tolist())
viagens.head(10)`,
      pythonChallenge: {
        description: 'Limpa dados/bicicletas_viagens_sujas.csv por esta ordem: 1) tira os duplicados por viagem_id (fica a primeira); 2) normaliza estacao_partida e estacao_chegada (sem acentos, minúsculas, sem espaços nas pontas e "est. " passa a "estacao ") e troca-as pelo nome oficial com o dicionário estacoes_canonicas; 3) converte inicio e fim com os três formatos ("%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M" e "%d-%m-%Y %Hh%M"), cada um com errors="coerce", e junta-os; 4) em valor_eur troca a vírgula por ponto e converte para float (o vazio fica NaN); 5) em tipo_cliente faz strip() e capitalize(), e o vazio passa a "Desconhecido"; 6) tira as viagens com duracao_min <= 0 ou > 1440; 7) tira as viagens com fim < inicio. Guarda o resultado em limpo e, em removidas, um dicionário com quantas linhas saíram em cada passo: "duplicadas", "duracao_impossivel" e "fim_antes_inicio".',
        starterCode: `import pandas as pd

# Forma normalizada (sem acentos, minúsculas, "estacao ...") -> nome oficial
estacoes_canonicas = {
    "estacao central": "Estação Central",
    "estacao jardim botanico": "Estação Jardim Botânico",
    "estacao ribeira": "Estação Ribeira",
    "estacao universidade": "Estação Universidade",
    "estacao sao bento": "Estação São Bento",
    "estacao do mercado": "Estação do Mercado",
    "estacao praca nova": "Estação Praça Nova",
    "estacao farol": "Estação Farol",
    "estacao parque verde": "Estação Parque Verde",
    "estacao hospital": "Estação Hospital",
    "estacao avenida da liberdade": "Estação Avenida da Liberdade",
    "estacao cais do sodre": "Estação Cais do Sodré",
}

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

# 1) duplicados por viagem_id   2) estações   3) datas   4) valor_eur
# 5) tipo_cliente   6) durações impossíveis   7) fim antes do início
limpo = None
removidas = None
print(removidas, len(limpo) if limpo is not None else None)`,
        solutionCode: `import pandas as pd

# Forma normalizada (sem acentos, minúsculas, "estacao ...") -> nome oficial
estacoes_canonicas = {
    "estacao central": "Estação Central",
    "estacao jardim botanico": "Estação Jardim Botânico",
    "estacao ribeira": "Estação Ribeira",
    "estacao universidade": "Estação Universidade",
    "estacao sao bento": "Estação São Bento",
    "estacao do mercado": "Estação do Mercado",
    "estacao praca nova": "Estação Praça Nova",
    "estacao farol": "Estação Farol",
    "estacao parque verde": "Estação Parque Verde",
    "estacao hospital": "Estação Hospital",
    "estacao avenida da liberdade": "Estação Avenida da Liberdade",
    "estacao cais do sodre": "Estação Cais do Sodré",
}

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

def normalizar_estacao(serie):
    s = serie.str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii")
    s = s.str.lower().str.strip().str.replace("est. ", "estacao ", regex=False)
    return s.map(estacoes_canonicas)

def converter_datas(serie):
    iso = pd.to_datetime(serie, format="%Y-%m-%d %H:%M", errors="coerce")
    barras = pd.to_datetime(serie, format="%d/%m/%Y %H:%M", errors="coerce")
    com_h = pd.to_datetime(serie, format="%d-%m-%Y %Hh%M", errors="coerce")
    return iso.fillna(barras).fillna(com_h)

removidas = {}

# 1) duplicados por viagem_id (fica a primeira)
df = viagens.drop_duplicates(subset="viagem_id").copy()
removidas["duplicadas"] = len(viagens) - len(df)

# 2) estações  3) datas  4) valor  5) tipo de cliente
df["estacao_partida"] = normalizar_estacao(df["estacao_partida"])
df["estacao_chegada"] = normalizar_estacao(df["estacao_chegada"])
df["inicio"] = converter_datas(df["inicio"])
df["fim"] = converter_datas(df["fim"])
df["valor_eur"] = df["valor_eur"].str.replace(",", ".").astype(float)
df["tipo_cliente"] = df["tipo_cliente"].str.strip().str.capitalize().fillna("Desconhecido")

# 6) durações impossíveis
impossivel = (df["duracao_min"] <= 0) | (df["duracao_min"] > 1440)
removidas["duracao_impossivel"] = int(impossivel.sum())
df = df[~impossivel]

# 7) fim antes do início
ao_contrario = df["fim"] < df["inicio"]
removidas["fim_antes_inicio"] = int(ao_contrario.sum())
limpo = df[~ao_contrario]

print(removidas, len(limpo))
limpo.head()`,
        checks: [
          { label: 'removidas: 300 duplicadas, 200 durações impossíveis e 150 fins antes do início', expr: 'isinstance(removidas, dict) and {k: int(v) for k, v in removidas.items()} == {"duplicadas": 300, "duracao_impossivel": 200, "fim_antes_inicio": 150}', actualExpr: 'removidas', hint: 'Em cada passo conta as linhas que saem: len(antes) - len(depois), ou a soma da máscara antes de filtrar. As chaves são "duplicadas", "duracao_impossivel" e "fim_antes_inicio".' },
          { label: 'limpo tem 19 650 viagens, sem viagem_id repetido', expr: 'len(limpo) == 19650 and limpo["viagem_id"].is_unique', actualExpr: 'len(limpo) if limpo is not None else None', hint: '20 300 linhas menos 300 duplicadas, 200 durações impossíveis e 150 fins antes do início.' },
          { label: 'Só ficam os 12 nomes oficiais das estações', expr: 'limpo["estacao_partida"].notna().all() and limpo["estacao_chegada"].notna().all() and len(set(limpo["estacao_partida"]) | set(limpo["estacao_chegada"])) == 12 and all(str(e).startswith("Estação ") for e in set(limpo["estacao_partida"]) | set(limpo["estacao_chegada"]))', actualExpr: 'sorted(set(limpo["estacao_partida"].astype(str)) | set(limpo["estacao_chegada"].astype(str)))', hint: 'Normaliza (sem acentos, minúsculas, strip e "est. " para "estacao ") e só depois faz .map(estacoes_canonicas). Um NaN quer dizer que a forma normalizada não está no dicionário.' },
          { label: 'inicio e fim são datas, sem falhas, e nenhum fim vem antes do início', expr: 'pd.api.types.is_datetime64_any_dtype(limpo["inicio"]) and pd.api.types.is_datetime64_any_dtype(limpo["fim"]) and limpo["inicio"].notna().all() and limpo["fim"].notna().all() and bool((limpo["fim"] >= limpo["inicio"]).all())', actualExpr: '(str(limpo["inicio"].dtype), int(limpo["inicio"].isna().sum()), int(limpo["fim"].isna().sum()))', hint: 'Um pd.to_datetime(..., format=..., errors="coerce") por formato e depois iso.fillna(barras).fillna(com_h). O terceiro formato é "%d-%m-%Y %Hh%M".' },
          { label: 'valor_eur é número: 500 vazios e soma de 23 704.00 €', expr: 'pd.api.types.is_float_dtype(limpo["valor_eur"]) and int(limpo["valor_eur"].isna().sum()) == 500 and math.isclose(float(limpo["valor_eur"].sum()), 23704.0, abs_tol=0.01)', actualExpr: '(str(limpo["valor_eur"].dtype), int(limpo["valor_eur"].isna().sum()))', hint: 'df["valor_eur"].str.replace(",", ".").astype(float). Os vazios ficam NaN: não os troques por 0.' },
          { label: 'tipo_cliente: Anual (11 507), Ocasional (7 543) e Desconhecido (600)', expr: 'limpo["tipo_cliente"].value_counts().to_dict() == {"Anual": 11507, "Ocasional": 7543, "Desconhecido": 600}', actualExpr: 'limpo["tipo_cliente"].value_counts(dropna=False).to_dict()', hint: '.str.strip().str.capitalize() e depois .fillna("Desconhecido").' },
          { label: 'A limpeza funciona com outro lote de viagens', expr: '(lambda r: {k: int(v) for k, v in r["removidas"].items()} == {"duplicadas": 1, "duracao_impossivel": 1, "fim_antes_inicio": 1} and list(r["limpo"]["viagem_id"]) == ["V1", "V2"] and list(r["limpo"]["estacao_partida"]) == ["Estação Central", "Estação Ribeira"] and list(r["limpo"]["estacao_chegada"]) == ["Estação Farol", "Estação São Bento"] and list(r["limpo"]["tipo_cliente"]) == ["Anual", "Desconhecido"] and abs(float(r["limpo"]["valor_eur"].iloc[1]) - 1.5) < 0.001 and str(r["limpo"]["inicio"].iloc[1]) == "2025-03-14 09:00:00")(correr_com(viagens=pd.DataFrame({"viagem_id": ["V1", "V1", "V2", "V3", "V4"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:05", "14/03/2025 09:00", "14-03-2025 9h05", "2025-03-15 10:00"], "fim": ["2025-03-14 08:20", "2025-03-14 08:20", "14/03/2025 09:30", "14-03-2025 8h55", "2025-03-15 10:00"], "estacao_partida": [" estacao central ", " estacao central ", "EST. RIBEIRA", "Estacao Hospital", "Estação Central"], "estacao_chegada": ["Estação Farol", "Estação Farol", "ESTAÇÃO SÃO BENTO", "Estação Central", "Estação Central"], "duracao_min": [15, 15, 30, 10, 0], "tipo_cliente": ["anual", "anual", None, "Ocasional", "Ocasional"], "valor_eur": ["0.00", "0.00", "1,50", "2.00", "1.00"]})))', actualExpr: 'correr_com(viagens=pd.DataFrame({"viagem_id": ["V1", "V1", "V2", "V3", "V4"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:05", "14/03/2025 09:00", "14-03-2025 9h05", "2025-03-15 10:00"], "fim": ["2025-03-14 08:20", "2025-03-14 08:20", "14/03/2025 09:30", "14-03-2025 8h55", "2025-03-15 10:00"], "estacao_partida": [" estacao central ", " estacao central ", "EST. RIBEIRA", "Estacao Hospital", "Estação Central"], "estacao_chegada": ["Estação Farol", "Estação Farol", "ESTAÇÃO SÃO BENTO", "Estação Central", "Estação Central"], "duracao_min": [15, 15, 30, 10, 0], "tipo_cliente": ["anual", "anual", None, "Ocasional", "Ocasional"], "valor_eur": ["0.00", "0.00", "1,50", "2.00", "1.00"]})).get("removidas")', hint: 'Calcula tudo a partir de viagens, sem escrever os números à mão: num lote de 5 linhas sai 1 duplicada, 1 duração impossível e 1 fim antes do início.' },
        ],
      },
      quiz: {
        question: 'Porque é que guardas quantas linhas saíram por cada motivo, em vez de mostrares só o total final?',
        options: [
          'Porque o pandas só deixa filtrar se guardares a contagem',
          'Para quem lê poder conferir a limpeza e o que se perdeu',
          'Porque assim a limpeza corre mais depressa no browser',
          'Para poderes repor mais tarde as linhas que apagaste do ficheiro',
        ],
        correctIndex: 1,
        explanation: 'As contagens por motivo são o recibo da limpeza: mostram que 650 das 20 300 linhas saíram e porquê. Sem elas, ninguém consegue conferir se a limpeza foi razoável ou se apagou dados a mais.',
      },
    },
  ],
};
