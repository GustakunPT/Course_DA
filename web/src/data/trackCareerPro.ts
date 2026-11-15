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
    commonPitfall: 'Multiplicar linha["quantidade"] * float(linha["preco"]) sem converter a quantidade para int, o que repete o texto!',
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
    proPractice: 'CTEs e Window Functions são o tema número 1 em testes técnicos para vagas de Analista de Dados Pleno e Sénior.',
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

export const careerProTrack: Track = {
  id: 'carreira',
  shortTitle: '6. Nível Profissional',
  fullTitle: 'Prática Profissional: ETL, Testes de Dados, Coortes e Entrevista',
  summary: 'A ponte final entre saber sintaxe e trabalhar como Analista de Dados numa empresa: pipelines ETL, testes de qualidade, retenção de clientes, SQL otimizado e casos de entrevista.',
  engineLabel: 'Python + SQL Profissional',
  lessons: [
    {
      id: 'pro-01-pipeline-etl',
      code: '01',
      title: 'Arquitetura ETL em Produção: Extrair, Transformar e Carregar',
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
      commonPitfall: 'Substituir o ficheiro original com os dados limpos: se descobrires um bug na tua regra amanhã, perdeste os dados brutos para reprocessar!',
      referenceTitle: 'Arquitetura Medalhão (Bronze / Silver / Gold)',
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
        description: 'Construa o relatório de auditoria do pipeline sobre dados/vendas_sujas.csv: guarde em linhas_bronze o total inicial (12), em linhas_rejeitadas quantas linhas foram descartadas na passagem para Silver (5) e em taxa_aproveitamento_pct a percentagem de linhas válidas arredondada a 2 casas (7 / 12 * 100).',
        starterCode: `import pandas as pd

bronze = pd.read_csv("dados/vendas_sujas.csv")

# Calcule linhas_bronze, linhas_rejeitadas e taxa_aproveitamento_pct:
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
        ],
      },
      quiz: {
        question: 'Na arquitetura de dados profissional (Bronze -> Silver -> Gold), onde devem ser guardados os dados brutos originais sem qualquer alteração?',
        options: ['Na camada Gold', 'Na camada Bronze (Raw)', 'Apagam-se logo após ler'],
        correctIndex: 1,
        explanation: 'A camada Bronze preserva a história bruta exata para permitir auditorias e reprocessamentos futuros.',
      },
    },
    {
      id: 'pro-02-data-quality-tests',
      code: '02',
      title: 'Testes Automáticos de Qualidade de Dados (Data Contracts)',
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
      referenceTitle: 'Os 4 Testes Universais de Qualidade de Dados',
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
        description: 'Escreva uma bateria de 3 verificações sobre os CSVs oficiais: guarde True/False em catalogo_unico (se produtos["id"] não tem repetidos), precos_consistentes (se em todas as linhas de vendas o preco coincide com o preço oficial desse produto_id em produtos.csv) e zero_orfaos (se todos os produto_id de vendas existem em produtos["id"]).',
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
          { label: 'catalogo_unico is True', expr: 'catalogo_unico is True', actualExpr: 'catalogo_unico', hint: 'Use bool(produtos["id"].is_unique).' },
          { label: 'zero_orfaos is True', expr: 'zero_orfaos is True', actualExpr: 'zero_orfaos', hint: 'Use bool(vendas["produto_id"].isin(produtos["id"]).all()).' },
          { label: 'precos_consistentes is True', expr: 'precos_consistentes is True', actualExpr: 'precos_consistentes', hint: 'Mapeie o preço de produtos por produto_id e compare com vendas["preco"].' },
        ],
      },
      quiz: {
        question: 'O que testa uma regra de Integridade Referencial (relationships test) numa base de dados analítica?',
        options: [
          'Se o ficheiro tem cores bonitas.',
          'Se todos os códigos de chave estrangeira na tabela de factos (ex.: cliente_id em vendas) existem na respetiva tabela de dimensão (clientes).',
          'Se a tabela tem menos de 10 linhas.',
        ],
        correctIndex: 1,
        explanation: 'Garante que nenhum INNER JOIN perde vendas por falta de ficha na tabela de dimensão.',
      },
    },
    {
      id: 'pro-03-coortes-retencao',
      code: '03',
      title: 'Métricas de Produto e Negócio: Retenção, Recorrência e Ticket por Cliente',
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
      referenceTitle: 'Métricas de Clientes em SQL',
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
        description: 'Identifique os clientes hiper-fiéis que fizeram compras nos 12 meses do ano (COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12): devolva cliente_id, nome e ltv_eur (faturação anual arredondada a 2 casas), ordenados por ltv_eur DESC.',
        starterSql: `SELECT
  c.id AS cliente_id,
  c.nome,
  ROUND(SUM(v.quantidade * v.preco), 2) AS ltv_eur
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.id, c.nome
-- Filtre com HAVING apenas quem esteve ativo nos 12 meses e ordene por ltv_eur DESC
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
        hint: 'Adicione HAVING COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12 ORDER BY ltv_eur DESC;',
        validate: (cols, rows) => {
          const ok = rows.length > 0 && cols.length === 3 && Number(rows[0][2]) >= Number(rows[rows.length - 1][2]);
          return {
            passed: ok,
            message: ok
              ? `Excelente! Encontraste os ${rows.length} clientes que visitaram a Mercearia em todos os 12 meses do ano.`
              : 'Usa HAVING COUNT(DISTINCT SUBSTR(v.data, 1, 7)) = 12 e ordena por ltv_eur DESC.',
          };
        },
      },
      quiz: {
        question: 'O que representa a "Coorte de Janeiro" (January Cohort) numa análise de retenção?',
        options: [
          'Todos os produtos vendidos em janeiro.',
          'O grupo de clientes cuja primeira compra de sempre ocorreu no mês de janeiro.',
          'Os clientes que deixaram de comprar em janeiro.',
        ],
        correctIndex: 1,
        explanation: 'Uma coorte agrupa utilizadores pelo período do seu primeiro evento (aquisição) para acompanhar o seu comportamento ao longo dos meses seguintes.',
      },
    },
    {
      id: 'pro-04-sql-performance',
      code: '04',
      title: 'SQL de Alta Performance: Índices, SARGability e EXPLAIN QUERY PLAN',
      lede: 'Quando a tabela cresce de 5 000 para 500 milhões de linhas, a forma como escreves o WHERE decide se a query demora 20 milissegundos ou 40 minutos.',
      analogyTitle: 'Procurar no índice alfabético vs folhear a lista telefónica página a página',
      analogyBody: 'Um índice (INDEX) é o separador ordenado da base de dados. Se pedires WHERE data BETWEEN "2025-09-01" AND "2025-09-30", o motor vai direto à página de setembro; se aplicares uma função sobre a coluna antes de comparar, obrigas o motor a ler a tabela inteira (Full Table Scan).',
      concepts: [
        'EXPLAIN QUERY PLAN mostra como o motor SQL vai executar a consulta (SEARCH com índice vs SCAN da tabela completa).',
        'Filtros SARGable (Search Argument Able): mantém a coluna isolada no lado esquerdo do operador (data >= "2025-09-01" em vez de SUBSTR(data, 1, 7) = "2025-09").',
        'SELECT apenas das colunas necessárias e filtragem antes de JOINs pesados reduzem uso de memória.',
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
        { syntax: "WHERE data BETWEEN '2025-09-01' AND '2025-09-30'", meaning: 'Rápido (SARGable): aproveita índice de data', example: 'Pesquisa direta por intervalo' },
        { syntax: "WHERE SUBSTR(data, 1, 7) = '2025-09'", meaning: 'Lento em tabelas gigantes: calcula função linha a linha', example: 'Obriga a Full Scan' },
        { syntax: 'CREATE INDEX idx_vendas_data ON vendas(data);', meaning: 'Cria índice B-Tree na coluna data', example: 'Acelera filtros e ordenações' },
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
        description: 'Escreva uma query otimizada (usando intervalo direto em data) para o 3.º trimestre de 2025 (de "2025-07-01" a "2025-09-30"): devolva a categoria do produto (de produtos) e a faturacao_q3 arredondada a 2 casas, ordenada por faturacao_q3 DESC.',
        starterSql: `SELECT
  p.categoria,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_q3
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
-- Filtre o 3.º trimestre (2025-07-01 a 2025-09-30), agrupe e ordene
`,
        solutionSql: `SELECT
  p.categoria,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_q3
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
WHERE v.data >= '2025-07-01' AND v.data <= '2025-09-30'
GROUP BY p.categoria
ORDER BY faturacao_q3 DESC;`,
        hint: "Use WHERE v.data BETWEEN '2025-07-01' AND '2025-09-30' GROUP BY p.categoria ORDER BY faturacao_q3 DESC;",
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 2 && rows[0][0] === 'Mercearia' && Number(rows[0][1]) > 3500;
          return {
            passed: ok,
            message: ok
              ? 'Perfeito! Consulta limpa, rápida e compatível com índices de data em produção (as 6 categorias da mercearia foram agregadas no Q3).'
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
        ],
        correctIndex: 1,
        explanation: 'Manter a coluna data limpa de funções permite ao motor saltar diretamente para o intervalo no índice B-Tree.',
      },
    },
    {
      id: 'pro-05-entrevista-sql',
      code: '05',
      title: 'Desafio Clássico de Entrevista Técnica: Top N por Categoria e Variação Mensal (LAG)',
      lede: 'Prepara-te para as duas perguntas mais frequentes em provas técnicas de recrutamento para Analista de Dados.',
      analogyTitle: 'A prova prática de contratação',
      analogyBody: 'Em quase todas as entrevistas técnicas de SQL vão pedir-te duas coisas: 1) encontrar os Top 2 produtos dentro de cada categoria (com RANK/ROW_NUMBER + CTE), ou 2) comparar cada mês com o mês imediatamente anterior (com LAG).',
      concepts: [
        'LAG(coluna, 1) OVER (ORDER BY mes) vai buscar o valor da linha anterior sem precisar de auto-join.',
        'Variação mensal (MoM %): (faturacao_atual - faturacao_anterior) / faturacao_anterior * 100.',
        'Para filtrar o resultado de uma Window Function (ex.: ficar apenas com pos <= 2), coloca a Window Function numa CTE e filtra no WHERE exterior!',
      ],
      beginnerSteps: [
        'Na CTE, calcula a métrica agrupada e a coluna de janela (RANK ou LAG).',
        'Na consulta principal fora da CTE, aplica o filtro WHERE pos <= 2 ou calcula a diferença face ao mês anterior.',
        'Ordena o resultado final para leitura imediata.',
      ],
      proPractice: 'Dominar CTE + RANK() OVER (PARTITION BY ...) e LAG() OVER (ORDER BY ...) coloca-te imediatamente no topo dos candidatos em entrevistas técnicas de dados.',
      commonPitfall: 'Tentar usar WHERE RANK() OVER (...) <= 2 na mesma query sem envolver primeiro numa CTE ou subquery.',
      referenceTitle: 'Padrões de Entrevista Técnica SQL',
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
        description: 'Resolva o problema clássico de entrevista "Top 1 de cada categoria": usando uma CTE, descubra qual é o produto campeão de faturação dentro de cada uma das 6 categorias. Devolva categoria, produto e faturacao (6 linhas ordenadas por faturacao DESC).',
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
-- Selecione categoria, produto e faturacao apenas para o 1.º classificado de cada categoria:
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
        hint: 'Adicione WHERE pos = 1 ORDER BY faturacao DESC na consulta final.',
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 3 && rows[0][1] === 'Azeite' && rows[1][1] === 'Queijo';
          return {
            passed: ok,
            message: ok
              ? 'Brilhante! Usaste CTE com ROW_NUMBER() para encontrar o campeão de cada uma das 6 categorias.'
              : `Obtiveste ${rows.length} linhas. Filtra WHERE pos = 1 e ordena por faturacao DESC para devolver os 6 líderes das 6 categorias do catálogo.`,
          };
        },
      },
      quiz: {
        question: 'Que função de janela (Window Function) usas em SQL para trazer o valor da linha anterior (por exemplo, a faturação do mês passado) sem fazer JOIN?',
        options: ['PREVIOUS()', 'LAG()', 'BEFORE()'],
        correctIndex: 1,
        explanation: 'LAG(coluna, 1) OVER (ORDER BY data) acede diretamente ao registo anterior na janela ordenada.',
      },
    },
    {
      id: 'pro-06-caso-executivo',
      code: '06',
      title: 'Caso Final de Portfólio: Diagnóstico 360º para a Direção',
      lede: 'Consolida todo o teu percurso do zero ao profissional resolvendo um pedido executivo completo que combina Python, Pandas, SQL e visão de negócio.',
      analogyTitle: 'A tua primeira apresentação como Analista de Dados da equipa',
      analogyBody: 'A gerência quer abrir uma segunda loja e pediu-te 4 indicadores auditados num único script Python/Pandas: faturação anual, cidade com maior gasto médio por cliente, peso da categoria líder e ticket mediano.',
      concepts: [
        'Um analista profissional cruza múltiplas tabelas (vendas, produtos, clientes) para responder a perguntas estratégicas.',
        'Validação cruzada: confirmar que os resultados do teu script batem ao cêntimo com o SQL.',
        'Com estas 6 trilhas concluídas, dominas o ciclo real de trabalho de um Analista de Dados Júnior/Pleno.',
      ],
      beginnerSteps: [
        'Carrega os 3 ficheiros CSV oficiais com pd.read_csv().',
        'Cruza vendas com produtos e clientes usando pd.merge().',
        'Calcula cada indicador pedido e guarda nas variáveis indicadas para validação.',
      ],
      proPractice: 'Ao publicares este projeto no teu GitHub e Vercel, tens um caso prático completo que podes demonstrar ao vivo em qualquer entrevista.',
      commonPitfall: 'Dividir a faturação da cidade pelo número de vendas em vez de dividir pelo número de clientes únicos (.nunique()) dessa cidade.',
      referenceTitle: 'Checklist de Competências Profissionais Adquiridas',
      referenceRows: [
        { syntax: 'Lógica e Automação Python', meaning: 'Tipos, ciclos, coleções, funções e módulo csv', example: 'Trilha 1 completa' },
        { syntax: 'SQL Relacional e Analítico', meaning: 'JOINs, GROUP BY, HAVING, CASE, CTEs, Window Functions e Performance', example: 'Trilhas 2 e 6' },
        { syntax: 'Engenharia / Limpeza Pandas', meaning: 'DataFrames, merge, séries temporais, pipeline Bronze/Silver/Gold e Data Quality', example: 'Trilhas 3 e 6' },
        { syntax: 'Git, Estatística e BI', meaning: 'Git/GitHub, IQR/Outliers, Curva ABC, Star Schema e DAX', example: 'Trilhas 4 e 5' },
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
        description: 'Feche o diagnóstico executivo 360º: guarde em receita_anual (26902.89), ticket_mediano (mediana de quantidade * preco arredondada a 2 casas), quota_mercearia_pct (peso percentual da categoria "Mercearia" na receita total arredondado a 2 casas) e cidade_maior_ltv (nome da cidade com maior gasto médio por cliente ativo).',
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
          { label: 'cidade_maior_ltv ("Braga")', expr: 'cidade_maior_ltv == "Braga"', actualExpr: 'cidade_maior_ltv', hint: 'Divida a soma de subtotal pelo nunique de cliente_id em cada cidade (Braga tem 254.18 € / cliente).' },
        ],
      },
      quiz: {
        question: 'Ao responder a uma pergunta vaga da direção ("Qual é a melhor cidade?"), como deve agir um Analista de Dados profissional?',
        options: [
          'Escolher qualquer cidade ao acaso.',
          'Clarificar e apresentar as duas óticas: volume total de faturação (Lisboa: 5 885,34 €) vs gasto médio por cliente ativo (Gaia: 237,97 €/cliente).',
          'Dizer que não é possível calcular.',
        ],
        correctIndex: 1,
        explanation: 'Traduzir perguntas vagas em métricas precisas e complementares é a assinatura de um grande Analista de Dados.',
      },
    },
    {
      id: 'pro-07-json-exceptions',
      code: '07',
      title: 'Python em Produção: Ficheiros JSON, APIs e Tratamento de Erros (try / except)',
      lede: 'No mundo profissional, metade dos dados não vem em CSV mas sim em formato JSON de APIs web, e o teu código tem de saber lidar com erros sem parar o servidor.',
      analogyTitle: 'Receber encomendas em caixas dentro de caixas e isolar pacotes danificados',
      analogyBody: 'Um JSON é uma combinação de listas e dicionários uns dentro dos outros (como uma encomenda com dados do fornecedor e uma lista de artigos lá dentro). Com try / except, se uma linha vier avariada, o programa regista o erro e continua a processar as restantes!',
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
      referenceTitle: 'JSON e Tratamento de Exceções em Python',
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
        description: 'Processe o JSON entregas_json usando json.loads e um bloco try / except ValueError: some em valor_valido o total (unidades * preco) apenas dos artigos válidos e conte em registos_invalidos quantos artigos deram erro de conversão.',
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

# Converta entregas_json com json.loads e processe com try / except ValueError:


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
        ],
      },
      quiz: {
        question: 'Porque é que num pipeline profissional de dados devemos capturar exceções específicas como except (ValueError, KeyError): em vez de um except: genérico?',
        options: [
          'Porque except: genérico não existe em Python.',
          'Porque um except: vazio esconde até erros graves de programação (como variáveis mal escritas ou falta de memória), dificultando a depuração.',
          'Para o código ficar mais colorido.',
        ],
        correctIndex: 1,
        explanation: 'Capturar apenas a exceção esperada garante que bugs inesperados continuam visíveis.',
      },
    },
    {
      id: 'pro-08-python-sqlite-dbapi',
      code: '08',
      title: 'Python + SQL Integrados: sqlite3, Queries Parametrizadas (?) e pd.read_sql',
      lede: 'Aprende a ligar Python diretamente a uma base de dados SQL, executar queries seguras contra SQL Injection e carregar o resultado direto para um DataFrame Pandas.',
      analogyTitle: 'O Python como maestro que comanda a base de dados SQL',
      analogyBody: 'Em vez de correres SQL num programa e Python noutro, o módulo sqlite3 (ou psycopg2/SQLAlchemy em PostgreSQL) permite ao teu script Python enviar queries SQL parametrizadas com ? e receber uma tabela Pandas pronta!',
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
      commonPitfall: 'Escrever f"SELECT * FROM vendas WHERE produto = \'{input_utilizador}\'" — vulnerabilidade grave de segurança (SQL Injection)!',
      referenceTitle: 'Integração Python + SQL (DB-API 2.0 & Pandas)',
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
        description: 'Usando sqlite3 e pandas: carregue dados/vendas.csv para uma tabela SQL "vendas" numa ligação em memória e use pd.read_sql_query com parâmetros seguros (?) para calcular em faturacao_queijo_q4 a faturação total (ROUND(SUM(quantidade * preco), 2)) do produto "Queijo" no 4.º trimestre (data >= "2025-10-01").',
        starterCode: `import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
df = pd.read_csv("dados/vendas.csv")
df.to_sql("vendas", con, index=False)

# Execute uma query parametrizada (?) para obter a faturação de "Queijo" com data >= "2025-10-01":
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
          { label: 'faturacao_queijo_q4 calculada via SQL + Python', expr: 'faturacao_queijo_q4 is not None and math.isclose(float(faturacao_queijo_q4), float(pd.read_csv("dados/vendas.csv").query("produto == \'Queijo\' and data >= \'2025-10-01\'").eval("quantidade * preco").sum()), abs_tol=0.05)', actualExpr: 'faturacao_queijo_q4', hint: 'Filtre WHERE produto = ? AND data >= ? com params=["Queijo", "2025-10-01"].' },
        ],
      },
      quiz: {
        question: 'Porque devemos passar filtros dinâmicos através de params=["Queijo"] com ? em vez de colar texto diretamente na string SQL com f-strings?',
        options: [
          'Porque as f-strings são mais lentas.',
          'Porque os parâmetros ? separam o comando SQL dos dados, prevenindo ataques de SQL Injection e tratando aspas automaticamente.',
          'Porque o SQL não aceita texto.',
        ],
        correctIndex: 1,
        explanation: 'Queries parametrizadas são regra obrigatória de segurança em qualquer empresa.',
      },
    },
  ],
};

export function enrichTracksWithPedagogy(tracks: Track[]): Track[] {
  return tracks.map((tr) => ({
    ...tr,
    lessons: tr.lessons.map((le): Lesson => {
      const extra = lessonPedagogyMap[le.id];
      if (!extra) return le;
      return {
        ...le,
        beginnerSteps: le.beginnerSteps ?? extra.beginnerSteps,
        proPractice: le.proPractice ?? extra.proPractice,
        commonPitfall: le.commonPitfall ?? extra.commonPitfall,
      };
    }),
  }));
}
