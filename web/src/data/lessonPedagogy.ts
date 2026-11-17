import type { Lesson, Track } from './types';

export interface PedagogicalNotes {
  beginnerSteps: string[];
  proPractice: string;
  commonPitfall: string;
}

export const lessonPedagogyMap: Record<string, PedagogicalNotes> = {
  'py-01-sintaxe': {
    beginnerSteps: [
      'Escreve print( e fecha sempre com ) no fim.',
      'Se quiseres mostrar uma frase, envolve-a em aspas duplas: "Mercearia".',
      'Podes separar vários itens dentro do mesmo print() usando vírgulas.',
    ],
    proPractice: 'Em produção, os analistas usam logs estruturados e comentários que explicam a regra de negócio (ex.: "# Exclui devoluções antes do fecho fiscal"), nunca comentários óbvios.',
    commonPitfall: 'Esquecer de fechar aspas ou parênteses, ou escrever Print com P maiúsculo (Python distingue maiúsculas de minúsculas).',
  },
  'py-02-variaveis': {
    beginnerSteps: [
      'Escolhe um nome claro em minúsculas com underscore: preco_pao.',
      'Coloca o sinal = e à direita o valor que queres guardar.',
      'Usa int("2") ou float("0.25") quando precisares de transformar texto em número.',
    ],
    proPractice: 'Equipas profissionais usam nomes semânticos com a unidade incluída (faturacao_eur, desconto_pct, data_venda) para evitar erros de interpretação entre departamentos.',
    commonPitfall: 'Usar vírgula nos decimais (0,25 cria um tuplo!) ou somar um número com texto sem converter primeiro.',
  },
  'py-03-strings-conversoes': {
    beginnerSteps: [
      'Aplica .strip() para cortar espaços invisíveis no início e no fim do texto.',
      'Encadeia .replace(",", ".") antes de chamar float() em preços vindos de ficheiros.',
      'Usa f"Texto {variavel:.2f} €" para mostrar valores monetários sempre com 2 casas decimais.',
    ],
    proPractice: 'Na ingestão de dados (ETL), limpar espaços (.strip()) e normalizar capitalização evita que o mesmo produto apareça duplicado nos relatórios da administração.',
    commonPitfall: 'Arredondar valores a meio de um cálculo financeiro longo em vez de arredondar apenas no resultado final ou na formatação.',
  },
  'py-04-condicoes': {
    beginnerSteps: [
      'Começa a primeira condição com if condicao: (não te esqueças dos dois pontos : no fim da linha!).',
      'As linhas dentro do if têm de ficar recuadas 4 espaços para a direita (indentação).',
      'Usa elif para testar escalões intermédios e else para todos os restantes casos.',
    ],
    proPractice: 'Regras de negócio críticas (escalões de comissão, risco de crédito, elegibilidade promocional) são escritas com limites explícitos e testadas nos valores de fronteira (ex.: exatamente 20.00 € e 50.00 €).',
    commonPitfall: 'Escrever = em vez de == na comparação, ou inverter a ordem dos escalões (testar <= 50 antes de <= 20).',
  },
  'py-05-ciclo-for': {
    beginnerSteps: [
      'Cria a variável acumuladora ou lista vazia ANTES da linha do for.',
      'Escreve for elemento in colecao: para percorrer item a item.',
      'Para contagens numéricas lembra-te que range(1, 101) começa no 1 e pára no 100.',
    ],
    proPractice: 'Compreender ciclos for é a base para depurar transformações linha a linha quando uma regra é demasiado específica para uma função pronta.',
    commonPitfall: 'Colocar o return ou a inicialização soma = 0 dentro do ciclo for, fazendo com que reinicie a cada volta.',
  },
  'py-06-while': {
    beginnerSteps: [
      'Define o valor inicial da variável de controlo antes do while (ex.: saldo = 100).',
      'Escreve a condição de continuação: while saldo < 500:.',
      'Garante que dentro do bloco atualizas a variável (saldo += 35) para o ciclo terminar.',
    ],
    proPractice: 'No dia a dia profissional, o ciclo while é muito usado para consumir APIs paginadas (pedir páginas de vendas enquanto houver próxima página) e simulações financeiras.',
    commonPitfall: 'Esquecer de atualizar a variável da condição dentro do while, criando um ciclo infinito.',
  },
  'py-07-listas-colecoes': {
    beginnerSteps: [
      'Lembra-te que o primeiro elemento está na posição [0] e o último na posição [-1].',
      'Usa lista[:3] para extrair os 3 primeiros elementos sem alterar a lista original.',
      'Experimenta [expr for item in lista if condicao] para criar listas filtradas numa linha.',
    ],
    proPractice: 'Analistas usam conjuntos (set) para verificar rapidamente que códigos de cliente ou produto apareceram num lote novo mas faltam no catálogo mestre.',
    commonPitfall: 'Fazer nova = lista.sort() (que devolve None!) em vez de nova = sorted(lista).',
  },
  'py-08-dicionarios': {
    beginnerSteps: [
      'Cria um dicionário vazio com contagens = {}.',
      'Para somar valores por chave usa sempre d[chave] = d.get(chave, 0) + valor.',
      'Para encontrar a chave vencedora usa max(d, key=d.get).',
    ],
    proPractice: 'Os dicionários em Python funcionam por tabela de dispersão (hash table): procurar um preço por código em 1 milhão de produtos é instantâneo O(1).',
    commonPitfall: 'Aceder diretamente a d[chave] numa chave que pode não existir sem usar .get(chave, padrao).',
  },
  'py-09-funcoes': {
    beginnerSteps: [
      'Define a função com def nome_da_funcao(parametro1, parametro2):.',
      'Faz os cálculos necessários dentro do bloco indentado.',
      'Termina com return resultado para devolver o valor a quem chamou a função.',
    ],
    proPractice: 'Código profissional é modular: cada regra de limpeza ou cálculo de KPI vive numa função pura com docstring e testes unitários.',
    commonPitfall: 'Usar print(resultado) dentro da função e esquecer o return, fazendo com que a função devolva None.',
  },
  'py-10-caixa-csv': {
    beginnerSteps: [
      'Abre o ficheiro com with open("dados/vendas.csv", encoding="utf-8") as f:.',
      'Transforma o leitor em lista de dicionários: vendas = list(csv.DictReader(f)).',
      'Converte sempre int(v["quantidade"]) e float(v["preco"]) antes de multiplicar.',
    ],
    proPractice: 'Validar os totais de um ficheiro bruto em Python puro antes de o carregar na base de dados é uma técnica clássica de reconciliação de dados.',
    commonPitfall: 'Multiplicar linha["quantidade"] * float(linha["preco"]) sem converter a quantidade para int, o que repete o texto.',
  },
  'sql-01-select': {
    beginnerSteps: [
      'Indica as colunas após SELECT e a tabela após FROM.',
      'Usa SELECT DISTINCT coluna para ver apenas valores únicos sem repetição.',
      'Termina sempre consultas exploratórias com LIMIT 10 para não sobrecarregar o ecrã.',
    ],
    proPractice: 'Em bases de dados empresariais (Snowflake, BigQuery, PostgreSQL), nunca se faz SELECT * sem LIMIT porque ler todas as colunas custa tempo e dinheiro.',
    commonPitfall: 'Esquecer a vírgula entre nomes de colunas no SELECT ou pôr uma vírgula a mais antes do FROM.',
  },
  'sql-02-where': {
    beginnerSteps: [
      'Escreve WHERE logo a seguir ao FROM para filtrar as linhas desejadas.',
      'Textos e datas em SQL usam aspas simples: WHERE cidade = \'Porto\'.',
      'Usa IN (\'Porto\', \'Gaia\') quando quiseres aceitar vários valores para a mesma coluna.',
    ],
    proPractice: 'Filtrar cedo no WHERE (especialmente por partição de data) reduz drasticamente o volume de dados processado pela query.',
    commonPitfall: 'Misturar AND e OR sem parênteses, ou comparar nulos com = NULL em vez de IS NULL.',
  },
  'sql-03-orderby-calculos': {
    beginnerSteps: [
      'Multiplica colunas diretamente no SELECT: ROUND(quantidade * preco, 2) AS subtotal.',
      'Usa AS para dar um nome limpo à coluna calculada.',
      'Coloca ORDER BY coluna DESC antes do LIMIT para obter os maiores valores.',
    ],
    proPractice: 'Relatórios executivos nunca entregam números com 8 casas decimais: usa sempre ROUND(..., 2) e nomes de coluna autoexplicativos (faturacao_eur).',
    commonPitfall: 'Esquecer que ORDER BY ordena de forma crescente (ASC) por defeito, devolvendo os menores em vez do Top N.',
  },
  'sql-04-groupby': {
    beginnerSteps: [
      'Escolhe a coluna de agrupamento (ex.: produto) e as funções agregadas (SUM, COUNT, AVG).',
      'Repete obrigatoriamente a coluna de agrupamento na cláusula GROUP BY produto.',
      'Ordena pelo resultado agregado para ver os líderes no topo.',
    ],
    proPractice: 'Cruzar os resultados do GROUP BY com os números conhecidos do negócio (26 902,89 € na Mercearia) garante que a tua query não duplicou nem perdeu linhas.',
    commonPitfall: 'Colocar uma coluna não agregada no SELECT e esquecer de a incluir no GROUP BY.',
  },
  'sql-05-having': {
    beginnerSteps: [
      'Pergunta: o filtro é sobre linhas individuais ou sobre a soma/contagem de um grupo?',
      'Se for sobre linhas individuais, coloca no WHERE (antes do GROUP BY).',
      'Se for sobre o total do grupo (ex.: SUM(quantidade) > 880), coloca no HAVING (depois do GROUP BY).',
    ],
    proPractice: 'HAVING é essencial para segmentar clientes VIP (ex.: clientes com mais de 10 compras anuais) ou detetar códigos duplicados (HAVING COUNT(*) > 1).',
    commonPitfall: 'Tentar usar SUM() ou COUNT() dentro da cláusula WHERE.',
  },
  'sql-06-joins': {
    beginnerSteps: [
      'Dá apelidos curtos às tabelas: FROM vendas v INNER JOIN clientes c.',
      'Explicita sempre a condição de ligação com ON: ON c.id = v.cliente_id.',
      'Usa LEFT JOIN quando quiseres manter todos os registos da tabela principal mesmo sem correspondência.',
    ],
    proPractice: 'Antes de fechar uma query com JOIN, um analista profissional verifica sempre se o número de linhas da tabela de factos aumentou por causa de chaves duplicadas na dimensão (fan-out).',
    commonPitfall: 'Fazer INNER JOIN quando o negócio pediu "todos os clientes, incluindo os que têm zero compras" (que exige LEFT JOIN).',
  },
  'sql-07-case-coalesce': {
    beginnerSteps: [
      'Abre a condição com CASE, escreve cada regra WHEN ... THEN ... e fecha sempre com END AS nome_coluna.',
      'Para limpar textos vazios usa NULLIF(coluna, \'\') e envolve em COALESCE(..., valor_padrao).',
      'Podes agrupar diretamente pelo alias criado pelo CASE WHEN.',
    ],
    proPractice: 'Padrão pivot em SQL profissional: SUM(CASE WHEN mes = \'01\' THEN valor ELSE 0 END) permite criar colunas mensais lado a lado diretamente na query.',
    commonPitfall: 'Esquecer a palavra END no fim do CASE WHEN ou não definir o ramo ELSE.',
  },
  'sql-08-cte-windows': {
    beginnerSteps: [
      'Usa WITH nome_etapa AS (SELECT ...) no topo para preparar uma tabela intermédia limpa.',
      'Na query final, usa SUM(coluna) OVER (ORDER BY mes) para somar acumulados sem perder linhas.',
      'Usa RANK() OVER (PARTITION BY categoria ORDER BY faturacao DESC) para numerar o ranking dentro de cada categoria.',
    ],
    proPractice: 'CTEs e Window Functions são o tema número 1 em testes técnicos para vagas de Analista de Dados Intermédio e Sénior.',
    commonPitfall: 'Pôr ponto e vírgula dentro do parênteses da CTE em vez de apenas no final da query principal.',
  },
  'pd-01-dataframes': {
    beginnerSteps: [
      'Importa a biblioteca com import pandas as pd e lê o ficheiro com df = pd.read_csv("dados/vendas.csv").',
      'Inspeciona sempre df.shape e df.head() antes de fazer contas.',
      'Multiplica colunas inteiras diretamente: df["quantidade"] * df["preco"].',
    ],
    proPractice: 'Operações vetorizadas em pandas correm em código C otimizado por baixo do capô: são até 100x mais rápidas do que percorrer um DataFrame com for.',
    commonPitfall: 'Escrever df.shape() com parênteses (shape é um atributo, não um método).',
  },
  'pd-02-filtros': {
    beginnerSteps: [
      'Escreve a condição dentro de df[...]: ex. df[df["produto"] == "Café"].',
      'Quando juntares duas condições, coloca cada uma entre parênteses curvos e liga com & (E) ou | (OU).',
      'Usa .isin(["Porto", "Gaia"]) para filtrar vários valores de forma limpa.',
    ],
    proPractice: 'Criar máscaras booleanas com nomes claros (mask_dezembro = df["data"] >= "2025-12-01") torna o código de análise muito mais legível em equipa.',
    commonPitfall: 'Usar a palavra and em vez do símbolo & ao filtrar colunas do pandas, ou esquecer os parênteses em redor de cada condição.',
  },
  'pd-03-texto-datas': {
    beginnerSteps: [
      'Acede aos métodos de texto da coluna inteira através de .str (ex.: df["nome"].str.contains(...)).',
      'Converte colunas de data com pd.to_datetime(df["data"]).',
      'Extrai ano, mês ou dia da semana com o acessor .dt (ex.: .dt.month).',
    ],
    proPractice: 'Passar regex=False em .str.contains("(kg)", regex=False) evita que parênteses sejam interpretados como grupos de expressão regular.',
    commonPitfall: 'Chamar df["produto"].strip() diretamente na Series em vez de df["produto"].str.strip().',
  },
  'pd-04-ordenacao-contagens': {
    beginnerSteps: [
      'Usa df["coluna"].value_counts() para ver a tabela de frequências já ordenada.',
      'O primeiro rótulo mais frequente está em .index[0] e a sua contagem em .iloc[0].',
      'Para ordenar um DataFrame inteiro usa df.sort_values("coluna", ascending=False).',
    ],
    proPractice: 'Em análise exploratória (EDA), value_counts(dropna=False) é indispensável porque mostra também quantos valores nulos existem na coluna.',
    commonPitfall: 'Esquecer que value_counts() por defeito esconde os valores NaN a menos que passes dropna=False.',
  },
  'pd-05-groupby-merge': {
    beginnerSteps: [
      'Cruza tabelas com pd.merge(tabela_esq, tabela_dir, left_on="chave_esq", right_on="chave_dir").',
      'Agrupa com df.groupby("coluna_grupo")["coluna_valor"].sum().',
      'Usa .idxmax() numa Series agrupada para descobrir o nome do grupo com maior valor.',
    ],
    proPractice: 'Usar named aggregation (.agg(unidades=("quantidade", "sum"), receita=("subtotal", "sum"))) produz tabelas prontas para exportar para Excel ou BI.',
    commonPitfall: 'Não especificar left_on e right_on quando as chaves têm nomes diferentes nas duas tabelas (produto_id vs id).',
  },
  'pd-06-limpeza-sujas': {
    beginnerSteps: [
      '1.º Passo: limpa espaços e uniformiza maiúsculas na coluna de texto (.str.strip().str.capitalize()).',
      '2.º Passo: troca vírgula por ponto e converte números com pd.to_numeric(..., errors="coerce").',
      '3.º Passo: remove duplicados (.drop_duplicates()), nulos (.dropna()) e valores inválidos (preco > 0).',
    ],
    proPractice: 'Numa empresa, nunca se apagam linhas silenciosamente: regista-se quantas linhas entraram (12), quantas saíram para quarentena (5) e quantas seguiram limpas (7).',
    commonPitfall: 'Remover duplicados antes de limpar espaços e maiúsculas, deixando passar duplicados disfarçados como " Pão " e "pão".',
  },
  'git-01-init-status': {
    beginnerSteps: [
      'Usa pwd e ls para te orientares na pasta do projeto.',
      'Corre git init uma única vez para ativar o controlo de versões.',
      'Corre git status sempre antes e depois de qualquer comando Git.',
    ],
    proPractice: 'Qualquer projeto profissional de dados começa com um repositório Git estruturado com pastas claras: dados/, sql/, src/, notebooks/ e relatorios/.',
    commonPitfall: 'Executar git init dentro da subpasta errada em vez da raiz do projeto.',
  },
  'git-02-add-commit': {
    beginnerSteps: [
      'Inspeciona o que alteraste com git diff.',
      'Prepara os ficheiros que queres guardar com git add nome_do_ficheiro ou git add .',
      'Grava a versão com git commit -m "Explicação curta e clara".',
    ],
    proPractice: 'Commits atómicos: um commit para corrigir uma query SQL, outro commit separado para atualizar o relatório — assim é fácil reverter se algo correr mal.',
    commonPitfall: 'Fazer git commit sem ter feito git add primeiro.',
  },
  'git-03-gitignore': {
    beginnerSteps: [
      'Lê o ficheiro .gitignore com cat .gitignore para veres que ficheiros estão protegidos.',
      'Adiciona novas extensões sensíveis ou temporárias (ex.: *.bak, .env) ao .gitignore.',
      'Confirma com git status que ficheiros ignorados não entram no staging.',
    ],
    proPractice: 'Regra de ouro de segurança e RGPD: nunca enviar dados pessoais de clientes reais nem ficheiros .env com passwords para o GitHub.',
    commonPitfall: 'Adicionar um ficheiro ao .gitignore depois de já lhe ter feito commit (é preciso removê-lo do índice primeiro).',
  },
  'git-04-branches': {
    beginnerSteps: [
      'Cria e muda para um ramo de trabalho com git switch -c nome-do-ramo.',
      'Faz git add . e git commit -m "..." dentro desse ramo.',
      'Volta ao ramo principal (git switch main) e junta o trabalho (git merge nome-do-ramo).',
    ],
    proPractice: 'Nas empresas o ramo main é protegido: todo o código novo entra através de um feature branch revisto por um colega num Pull Request.',
    commonPitfall: 'Esquecer de fazer commit das alterações antes de mudar de ramo.',
  },
  'git-05-github-portfolio': {
    beginnerSteps: [
      'Liga o repositório local ao GitHub com git remote add origin <url>.',
      'Envia o histórico com git push -u origin main.',
      'Mantém o README.md na raiz com objetivos, KPIs encontrados e instruções de execução.',
    ],
    proPractice: 'O teu GitHub é o teu currículo vivo: recrutadores procuram projetos que resolvam problemas de negócio completos do CSV sujo até à recomendação final.',
    commonPitfall: 'Publicar notebooks com células desordenadas ou caminhos absolutos que só funcionam no computador do autor.',
  },
  'bi-01-media-mediana': {
    beginnerSteps: [
      'Usa statistics.mean(lista) para a média aritmética e statistics.median(lista) para o valor central.',
      'Usa statistics.stdev(lista) para medir a dispersão em torno da média.',
      'Compara sempre média e mediana antes de tirar conclusões sobre o cliente típico.',
    ],
    proPractice: 'Em reuniões executivas, apresentar apenas a média quando os dados têm assimetria forte leva a decisões de preço erradas; analistas seniores reportam Média + Mediana (P50) + P90.',
    commonPitfall: 'Confundir desvio-padrão elevado com erro de cálculo, quando na verdade reflete perfis de compra muito diferentes.',
  },
  'bi-02-quartis-outliers': {
    beginnerSteps: [
      'Calcula o 1.º quartil Q1 = sub.quantile(0.25) e o 3.º quartil Q3 = sub.quantile(0.75).',
      'Subtrai IQR = Q3 - Q1 para achar a largura dos 50% centrais.',
      'Filtra valores acima de Q3 + 1.5 * IQR para identificar transações atípicas.',
    ],
    proPractice: 'Separa sempre outliers de erro (preço -1.00 €) de outliers de negócio (compra grossista de Azeite): os primeiros limpam-se, os segundos analisam-se como segmento VIP.',
    commonPitfall: 'Eliminar outliers legítimos de vendas e apresentar à direção uma faturação total inferior à real.',
  },
  'bi-03-curva-abc': {
    beginnerSteps: [
      'Agrupa a faturação por produto e ordena do maior para o menor.',
      'Divide cada produto pela soma total e multiplica por 100 para ter a quota individual.',
      'Usa .cumsum() para obter a percentagem acumulada.',
    ],
    proPractice: 'A Curva ABC orienta decisões de stock e negociação com fornecedores: rutura de stock num artigo Classe A (Azeite ou Queijo) tem impacto imediato na caixa.',
    commonPitfall: 'Olhar apenas para a classe C em euros sem reparar que o Pão é o produto de maior frequência que gera visitas à loja.',
  },
  'bi-04-star-schema': {
    beginnerSteps: [
      'Identifica a tabela de factos central (vendas) e as dimensões descritivas (produtos, clientes).',
      'Liga cada dimensão à tabela de factos através da respetiva chave (id = produto_id).',
      'Agrega pelas colunas das dimensões (categoria, cidade) e soma as métricas da tabela de factos.',
    ],
    proPractice: 'Modelar um Star Schema limpo é o segredo para relatórios Power BI rápidos e medidas DAX simples sem relações bidirecionais perigosas.',
    commonPitfall: 'Importar apenas um tabelão único no Power BI sem tabela de Calendário dedicada.',
  },
  'bi-05-excel-dax': {
    beginnerSteps: [
      'Quando precisas de multiplicar duas colunas linha a linha em SQL usas SUM(a * b); em DAX usas SUMX(tabela, a * b).',
      'Para médias por entidade distinta usa COUNT(DISTINCT id) em SQL ou DISTINCTCOUNT() em DAX.',
      'Valida sempre o número do teu dashboard Power BI com uma query SQL de controlo.',
    ],
    proPractice: 'Analistas seniores mantêm um script SQL de validação para garantir que todas as medidas DAX batem certo ao cêntimo com a base de dados.',
    commonPitfall: 'Escrever SUM(quantidade) * SUM(preco) em DAX em vez de SUMX.',
  },
  'bi-06-storytelling': {
    beginnerSteps: [
      'Começa pela pergunta da direção: qual a variação entre o melhor e o pior mês?',
      'Agrupa os dados ao nível temporal certo (mês) e identifica os extremos (.max() e .min()).',
      'Traduz o número numa frase acionável: quando reforçar stock e que campanha lançar no mês mais fraco.',
    ],
    proPractice: 'Storytelling com dados segue a estrutura Situação -> Complicação -> Recomendação Quantificada (ex.: "Fevereiro cai 493,83 € face ao pico de Setembro; recomendamos cabaz promocional de inverno").',
    commonPitfall: 'Mostrar 20 gráficos num dashboard sem indicar qual é a conclusão ou ação recomendada.',
  },
  'pd-07-pivot-transform': {
    beginnerSteps: [
      'Usa pd.pivot_table(df, index="...", columns="...", values="...", aggfunc="sum", fill_value=0) para cruzar duas dimensões.',
      'Quando precisares de calcular o total do grupo em cada linha sem colapsar o DataFrame, usa .groupby(...)[col].transform("sum").',
      'Divide a coluna original pelo resultado do transform para obteres imediatamente a quota percentual (%) por linha.',
    ],
    proPractice: 'Em análise de retalho, pivot_table gera matrizes mês x categoria prontas para mapas de calor e Excel, enquanto groupby().transform() permite calcular pesos e rankings mantendo o grão transacional.',
    commonPitfall: 'Esquecer fill_value=0 no pivot_table e acabar com valores NaN nas combinações sem vendas.',
  },
  'sql-09-subqueries-exists-union': {
    beginnerSteps: [
      'Escreve primeiro a query interior entre parênteses (ex.: SELECT AVG(preco) FROM produtos) e testa-a isoladamente.',
      'Usa WHERE preco > (SELECT ...) quando a subquery devolve um único valor escalar, ou IN / EXISTS quando devolve uma lista ou verifica existência.',
      'Usa UNION ALL para empilhar dois resultados com o mesmo número e tipo de colunas sem gastar tempo a remover duplicados.',
    ],
    proPractice: 'Em bases de dados grandes, EXISTS costuma ser mais rápido que IN ou NOT IN porque pára na primeira correspondência e não sofre com valores NULL (NOT IN com NULL devolve zero linhas!).',
    commonPitfall: 'Usar NOT IN (SELECT ...) quando a subquery pode conter NULL — prefere sempre NOT EXISTS.',
  },
  'sql-10-medias-moveis-rfm': {
    beginnerSteps: [
      'Constrói primeiro uma CTE mensal ou por cliente (WITH resumo AS (...)) para teres um valor agregado limpo por período/cliente.',
      'Para médias móveis, usa OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW).',
      'Para RFM, calcula Recência (dias desde a última compra), Frequência (COUNT) e Monetário (SUM) por cliente_id.',
    ],
    proPractice: 'Médias móveis de 3 meses suavizam ruído sazonal em reuniões executivas, e a segmentação RFM é o padrão da indústria para campanhas de retenção e reativação de clientes.',
    commonPitfall: 'Esquecer ROWS BETWEEN 2 PRECEDING AND CURRENT ROW na janela — sem ela, o SQL calcula a média acumulada desde o início até à linha atual.',
  },
};

export function enrichTrackWithPedagogy(track: Track): Track {
  return {
    ...track,
    lessons: track.lessons.map((le): Lesson => {
      const extra = lessonPedagogyMap[le.id];
      if (!extra) return le;
      return {
        ...le,
        beginnerSteps: le.beginnerSteps ?? extra.beginnerSteps,
        proPractice: le.proPractice ?? extra.proPractice,
        commonPitfall: le.commonPitfall ?? extra.commonPitfall,
      };
    }),
  };
}

export function enrichTracksWithPedagogy(tracks: Track[]): Track[] {
  return tracks.map(enrichTrackWithPedagogy);
}
