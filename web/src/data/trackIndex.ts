import type { EngineKind } from './types';

export interface LessonIndexEntry {
  id: string;
  code: string;
  title: string;
  engine: EngineKind;
  estimatedMinutes?: number;
  quiz: { correctIndex: number };
}

export interface TrackIndexEntry {
  id: string;
  shortTitle: string;
  fullTitle: string;
  summary: string;
  engineLabel: string;
  lessons: LessonIndexEntry[];
}

export const TRACK_INDEX: TrackIndexEntry[] = [
  {
    id: 'python',
    shortTitle: '1. Python',
    fullTitle: 'Python do Zero Absoluto à Caixa Registadora',
    summary:
      'Pensamento computacional desde a primeira linha de código até à leitura e validação real das 5 078 vendas da Mercearia.',
    engineLabel: 'Python 3.12 (Pyodide)',
    lessons: [
      {
        id: 'py-00-pensamento',
        code: '01',
        title: 'Ponto zero: como o computador pensa e o que faz um analista',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-01-sintaxe',
        code: '02',
        title: 'Sintaxe, print() e comentários',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-02-variaveis',
        code: '03',
        title: 'Variáveis e tipos de dados',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-03-strings-conversoes',
        code: '04',
        title: 'Texto, limpeza, conversões e f-strings',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-04-condicoes',
        code: '05',
        title: 'Comparações e condições if / elif / else',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-05-ciclo-for',
        code: '06',
        title: 'Ciclo for e range()',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-06-while',
        code: '07',
        title: 'Ciclo while e acumuladores',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-07-listas-colecoes',
        code: '08',
        title: 'Listas, fatias e compreensão de listas',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-08-dicionarios',
        code: '09',
        title: 'Dicionários e agrupamento por chave',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-09-funcoes',
        code: '10',
        title: 'Funções reutilizáveis e return',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-11-revisao',
        code: '11',
        title: 'Revisão geral: o talão de compra completo',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'py-10-caixa-csv',
        code: '12',
        title: 'Projeto Caixa Registadora sobre vendas.csv',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'sql',
    shortTitle: '2. SQL',
    fullTitle: 'SQL para Analistas de Dados',
    summary:
      'Consultas relacionais ao vivo sobre produtos (15), clientes (120) e vendas (5 078): filtros, agregações, JOINs, CTEs e Window Functions.',
    engineLabel: 'SQLite WebAssembly (5 078 vendas)',
    lessons: [
      {
        id: 'sql-01-select',
        code: '01',
        title: 'SELECT, DISTINCT e LIMIT: explorar tabelas',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-02-where',
        code: '02',
        title: 'WHERE, IN, BETWEEN e LIKE: filtrar registos',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-03-orderby-calculos',
        code: '03',
        title: 'ORDER BY e colunas calculadas com AS',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-04-groupby',
        code: '04',
        title: 'GROUP BY e funções de agregação',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-05-having',
        code: '05',
        title: 'HAVING vs WHERE: filtrar grupos agregados',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-06-joins',
        code: '06',
        title: 'INNER JOIN e LEFT JOIN: cruzar tabelas',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-07-case-coalesce',
        code: '07',
        title: 'CASE WHEN, COALESCE e limpeza em SQL',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-08-cte-windows',
        code: '08',
        title: 'CTEs (WITH) e Window Functions (OVER)',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-09-subqueries-exists-union',
        code: '09',
        title: 'Subqueries, EXISTS vs IN e UNION ALL',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-10-medias-moveis-rfm',
        code: '10',
        title: 'Médias móveis (ROWS BETWEEN) e matriz RFM de clientes',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'sql-11-revisao',
        code: '11',
        title: 'Revisão geral: o relatório por cidade',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'pandas',
    shortTitle: '3. Pandas',
    fullTitle: 'Pandas e Oficina de Limpeza de Dados',
    summary:
      'DataFrames, filtros, texto e datas, groupby, merge e limpeza de vendas_sujas.csv, praticados aqui no browser. Para treinar mais, cada tema tem um caderno Jupyter com 16 tarefas na pasta cadernos/ do projeto.',
    engineLabel: 'Python + pandas (WebAssembly)',
    lessons: [
      {
        id: 'pd-01-dataframes',
        code: '01',
        title: 'DataFrames, colunas e contagens',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-02-filtros',
        code: '02',
        title: 'Máscaras booleanas, .loc e .isin()',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-03-texto-datas',
        code: '03',
        title: 'Acessores .str e datas com pd.to_datetime',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-04-ordenacao-contagens',
        code: '04',
        title: 'Ordenação (.sort_values) e frequências (.value_counts)',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-05-groupby-merge',
        code: '05',
        title: 'Agrupar (.groupby) e juntar tabelas (pd.merge)',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-06-limpeza-sujas',
        code: '06',
        title: 'Oficina de limpeza: vendas_sujas.csv',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-07-pivot-transform',
        code: '07',
        title: 'Tabelas dinâmicas (pivot_table) e pesos de grupo (.transform)',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-08-numpy-estatistica',
        code: '08',
        title: 'NumPy e as ferramentas de pandas para estatística',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pd-09-revisao',
        code: '09',
        title: 'Revisão geral: faturação por categoria e trimestre',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'git',
    shortTitle: '4. Git & GitHub',
    fullTitle: 'Git, GitHub e Portefólio para Analistas de Dados',
    summary:
      'Controlo de versões ao vivo no terminal simulado: commits limpos, proteção de dados com .gitignore, branches e publicação de portefólio.',
    engineLabel: 'Simulador Terminal Git',
    lessons: [
      {
        id: 'git-01-init-status',
        code: '01',
        title: 'Linha de comandos, git init e git status',
        engine: 'git',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'git-02-add-commit',
        code: '02',
        title: 'Staging e histórico: git add, commit e log',
        engine: 'git',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'git-03-gitignore',
        code: '03',
        title: '.gitignore e privacidade em projetos de dados',
        engine: 'git',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'git-04-branches',
        code: '04',
        title: 'Ramos (branches) e fusão (git merge)',
        engine: 'git',
        quiz: {
          correctIndex: 0,
        },
      },
      {
        id: 'git-05-github-portfolio',
        code: '05',
        title: 'GitHub remoto e como montar um portefólio de analista',
        engine: 'git',
        quiz: {
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'bi',
    shortTitle: '5. Visualização & BI',
    fullTitle: 'Visualização, Excel/Power Query e Power BI para Analistas',
    summary:
      'Curva ABC, relatório executivo e gráficos honestos com matplotlib, Star Schema, DAX, Inteligência de Tempo e 4 oficinas práticas de Excel, Power Query e Power BI com conferência numérica.',
    engineLabel: 'Python + SQLite Analítico',
    lessons: [
      {
        id: 'bi-03-curva-abc',
        code: '01',
        title: 'Curva ABC: o princípio de Pareto (80/20) na Mercearia',
        engine: 'python',
        quiz: {
          correctIndex: 0,
        },
      },
      {
        id: 'bi-06-storytelling',
        code: '02',
        title: 'Visualização honesta e relatório para a direção',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-07-graficos-matplotlib',
        code: '03',
        title: 'Desenhar gráficos honestos com matplotlib',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-04-star-schema',
        code: '04',
        title: 'Modelação dimensional (esquema em estrela) para Power BI',
        engine: 'sql',
        quiz: {
          correctIndex: 0,
        },
      },
      {
        id: 'bi-05-excel-dax',
        code: '05',
        title: 'Do SQL e pandas para o Excel moderno e o DAX',
        engine: 'sql',
        quiz: {
          correctIndex: 0,
        },
      },
      {
        id: 'bi-10-pratica-excel-powerbi',
        code: '06',
        title: 'Prática guiada: Excel e Power BI com os dados da Mercearia',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-20-excel-powerquery-limpeza',
        code: '07',
        title: 'Prática Excel & Power Query: importar, limpar e reconciliar dados novos',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-21-excel-dinamicas-procx',
        code: '08',
        title: 'Prática Excel: Tabelas Dinâmicas, SOMA.SE.S e vários critérios',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-22-powerbi-dax-relatorio',
        code: '09',
        title: 'Prática Power BI: medidas DAX (CALCULATE, DIVIDE, %) e opções sem Windows',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-18-inteligencia-tempo',
        code: '10',
        title: 'Inteligência de tempo: acumulado do ano, mês anterior e média móvel',
        engine: 'python',
        quiz: {
          correctIndex: 2,
        },
      },
    ],
  },
  {
    id: 'estatistica',
    shortTitle: '6. Estatística',
    fullTitle: 'Estatística para Analistas: do descritivo às perguntas de entrevista',
    summary:
      'Média e mediana, quartis, probabilidade e Bayes, correlação e intervalos de confiança, simulação e bootstrap, testes A/B, qui-quadrado e ANOVA, regressão simples e múltipla, e perguntas rápidas de entrevista.',
    engineLabel: 'Python + SQLite Analítico',
    lessons: [
      {
        id: 'bi-01-media-mediana',
        code: '01',
        title: 'Média vs Mediana: quando os extremos enganam',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-02-quartis-outliers',
        code: '02',
        title: 'Quartis, IQR e deteção de valores atípicos (outliers)',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-12-probabilidade-simpson',
        code: '03',
        title: 'Probabilidade condicional, Bayes e o paradoxo de Simpson',
        engine: 'python',
        quiz: {
          correctIndex: 0,
        },
      },
      {
        id: 'bi-09-correlacao-confianca',
        code: '04',
        title: 'Correlação, amostras e intervalos de confiança',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-17-simulacao-bootstrap',
        code: '05',
        title: 'Ver a incerteza: simulação, bootstrap e testes de permutação',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-08-teste-ab',
        code: '06',
        title: 'Diferença real ou acaso? Introdução ao teste A/B',
        engine: 'python',
        quiz: {
          correctIndex: 2,
        },
      },
      {
        id: 'bi-11-ab-proporcoes',
        code: '07',
        title: 'Teste A/B de proporções e tamanho de amostra',
        engine: 'python',
        quiz: {
          correctIndex: 3,
        },
      },
      {
        id: 'bi-15-qui-quadrado-anova',
        code: '08',
        title: 'Mais de dois grupos: qui-quadrado e ANOVA',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-13-regressao-linear',
        code: '09',
        title: 'Desvio padrão, z-score e regressão linear simples',
        engine: 'python',
        quiz: {
          correctIndex: 2,
        },
      },
      {
        id: 'bi-16-regressao-multipla',
        code: '10',
        title: 'Regressão linear múltipla: separar efeitos',
        engine: 'python',
        quiz: {
          correctIndex: 2,
        },
      },
      {
        id: 'bi-19-series-temporais',
        code: '11',
        title: 'Séries temporais: tendência, sazonalidade e uma previsão simples',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'bi-14-perguntas-entrevista',
        code: '12',
        title: 'Perguntas rápidas de entrevista: enviesamentos, percentis e valor esperado',
        engine: 'python',
        quiz: {
          correctIndex: 0,
        },
      },
    ],
  },
  {
    id: 'carreira',
    shortTitle: '7. Nível Profissional',
    fullTitle: 'Prática Profissional: ETL, Testes de Dados, Coortes e Entrevista',
    summary:
      'A ponte final entre saber sintaxe e trabalhar como Analista de Dados numa empresa: pipelines ETL, testes de qualidade, retenção de clientes, SQL otimizado e casos de entrevista.',
    engineLabel: 'Python + SQL Profissional',
    lessons: [
      {
        id: 'pro-01-pipeline-etl',
        code: '01',
        title: 'Pipeline ETL: extrair, transformar e carregar',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-02-data-quality-tests',
        code: '02',
        title: 'Testes de qualidade de dados: chaves, nulos e intervalos',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-10-rgpd-anonimizacao',
        code: '03',
        title: 'RGPD na prática: pseudonimizar, minimizar e agrupar antes de partilhar',
        engine: 'python',
        quiz: {
          correctIndex: 3,
        },
      },
      {
        id: 'pro-03-coortes-retencao',
        code: '04',
        title: 'Métricas de clientes: retenção, recorrência e valor por cliente',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-04-sql-performance',
        code: '05',
        title: 'SQL mais rápido: índices, filtros que usam o índice e EXPLAIN QUERY PLAN',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-05-entrevista-sql',
        code: '06',
        title: 'Perguntas clássicas de entrevista SQL: top N por categoria e variação mensal com LAG',
        engine: 'sql',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-06-caso-executivo',
        code: '07',
        title: 'Caso final: diagnóstico completo para a direção',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-07-json-exceptions',
        code: '08',
        title: 'Ficheiros JSON, APIs e tratamento de erros com try / except',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-08-python-sqlite-dbapi',
        code: '09',
        title: 'Python e SQL juntos: sqlite3, queries parametrizadas e pd.read_sql',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-09-projeto-final',
        code: '10',
        title: 'Projeto final guiado: da pergunta à recomendação',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pro-11-portefolio-readme',
        code: '11',
        title: 'Apresentar o projeto: o README que um recrutador lê em 2 minutos',
        engine: 'python',
        quiz: {
          correctIndex: 3,
        },
      },
      {
        id: 'pro-12-desafio-recrutamento',
        code: '12',
        title: 'Desafio de recrutamento simulado: "Porque é que as vendas caíram em março?"',
        engine: 'python',
        quiz: {
          correctIndex: 2,
        },
      },
    ],
  },
  {
    id: 'projeto-final',
    shortTitle: '8. Projeto final',
    fullTitle: 'Projeto final: os teus dados, a tua pergunta, o teu portefólio',
    summary:
      'Primeiro limpas a sério 20 300 viagens de bicicletas partilhadas, com regras escritas e contas do que sai. Depois escolhes os teus dados e a tua pergunta, fazes a análise no teu computador e publicas o projeto no teu portefólio.',
    engineLabel: 'Projeto no teu computador',
    lessons: [
      {
        id: 'pf-01-limpeza-bicicletas',
        code: '01',
        title: 'Limpeza a sério: 20 300 viagens de bicicletas',
        engine: 'python',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-00-preparar-computador',
        code: '02',
        title: 'Preparar o computador: Python, VS Code, Jupyter e Git',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-02-pergunta-dados',
        code: '03',
        title: 'O teu projeto: escolher a pergunta e os dados',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-03-explorar-limpar',
        code: '04',
        title: 'Explorar e limpar os teus dados',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-04-analisar-recomendar',
        code: '05',
        title: 'Analisar e recomendar: um número, um gráfico, uma frase',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-05-publicar',
        code: '06',
        title: 'Publicar: o README e o repositório que um recrutador abre',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-08-portfolio-3-projetos',
        code: '07',
        title: 'Portefólio sólido: fechar 3 a 4 projetos completos no GitHub',
        engine: 'projeto',
        quiz: {
          correctIndex: 1,
        },
      },
      {
        id: 'pf-06-cv-linkedin',
        code: '08',
        title: 'CV de analista e LinkedIn: projetos com números',
        engine: 'projeto',
        quiz: {
          correctIndex: 2,
        },
      },
      {
        id: 'pf-07-anuncios-entrevista',
        code: '09',
        title: 'Ler anúncios, entrevista comportamental e pitch de 2 minutos',
        engine: 'projeto',
        quiz: {
          correctIndex: 2,
        },
      },
    ],
  },
];

export const TOTAL_LESSONS_COUNT = TRACK_INDEX.reduce((sum, t) => sum + t.lessons.length, 0);
