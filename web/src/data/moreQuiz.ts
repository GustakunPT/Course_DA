// Perguntas extra de revisão nas trilhas SQL e Pandas. Só a primeira pergunta de cada etapa
// (lesson.quiz) conta para o progresso; estas servem para confirmar que o conceito ficou.
import type { QuizSpec } from './types';

export const moreQuiz: Record<string, QuizSpec[]> = {
  'sql-01-select': [
    {
      question: 'Queres saber em que cidades há clientes, sem repetições. Que query usas?',
      options: ['SELECT cidade FROM clientes', 'SELECT DISTINCT cidade FROM clientes', 'SELECT UNIQUE cidade FROM clientes', 'SELECT cidade FROM clientes LIMIT 1'],
      correctIndex: 1,
      explanation: 'DISTINCT tira as linhas repetidas do resultado. UNIQUE não existe no SELECT do SQLite e o LIMIT só corta o número de linhas.',
    },
    {
      question: 'O que devolve SELECT * FROM vendas LIMIT 5?',
      options: ['As 5 vendas mais recentes da tabela', 'As 5 vendas de maior valor da tabela', '5 linhas, pela ordem em que o motor as lê', 'Todas as colunas menos as 5 primeiras'],
      correctIndex: 2,
      explanation: 'Sem ORDER BY a ordem não é garantida. Para as 5 mais recentes precisas de ORDER BY data DESC antes do LIMIT.',
    },
  ],
  'sql-02-where': [
    {
      question: 'Que preços passam em WHERE preco BETWEEN 1 AND 2?',
      options: ['Maiores do que 1 e menores do que 2', 'De 1 a 2, incluindo o 1 e o 2', 'De 1 a 2, mas sem o 2', 'Só os preços iguais a 1 ou a 2'],
      correctIndex: 1,
      explanation: 'BETWEEN inclui os dois limites: é o mesmo que preco >= 1 AND preco <= 2.',
    },
    {
      question: 'Queres os clientes cujo nome começa por Ana. Que condição usas?',
      options: ["WHERE nome = 'Ana%'", "WHERE nome LIKE '%Ana'", "WHERE nome LIKE 'Ana%'", "WHERE nome IN ('Ana')"],
      correctIndex: 2,
      explanation: "No LIKE, % representa qualquer sequência de caracteres: 'Ana%' quer dizer «começa por Ana». Com = o % é lido como texto normal.",
    },
  ],
  'sql-03-orderby-calculos': [
    {
      question: 'Em SELECT produto, quantidade * preco AS subtotal FROM vendas ORDER BY subtotal DESC, o que faz o AS?',
      options: ['Grava a coluna subtotal na tabela vendas', 'Dá um nome à conta, que o ORDER BY pode usar', 'Arredonda o resultado da conta a 2 casas', 'Filtra só as linhas com subtotal positivo'],
      correctIndex: 1,
      explanation: 'O AS dá um nome (alias) à coluna calculada. A tabela não muda: o nome só existe no resultado desta query.',
    },
    {
      question: 'Como fica ordenado o resultado de ORDER BY categoria, preco DESC?',
      options: [
        'Primeiro por preço decrescente e só nos empates de preço por categoria',
        'Por categoria (A a Z) e, em cada uma, do preço maior para o menor',
        'Por categoria e por preço, os dois em ordem decrescente (de Z para A)',
        'Só por preço, porque o último critério é o único que conta',
      ],
      correctIndex: 1,
      explanation: 'O DESC só se aplica à coluna imediatamente antes dele. A categoria fica na ordem por omissão (ASC).',
    },
  ],
  'sql-04-groupby': [
    {
      question: 'Que diferença há entre COUNT(*) e COUNT(email)?',
      options: [
        'Nenhuma: as duas contam todas as linhas, com ou sem NULL',
        'COUNT(*) conta todas as linhas; COUNT(email) ignora os NULL',
        'COUNT(email) conta só os emails diferentes, como um DISTINCT',
        'COUNT(*) ignora qualquer linha que tenha pelo menos um NULL',
      ],
      correctIndex: 1,
      explanation: 'COUNT(coluna) não conta valores NULL. Para contar valores diferentes usa COUNT(DISTINCT coluna).',
    },
    {
      question: 'Qual é o problema de SELECT categoria, produto, SUM(quantidade) FROM vendas_detalhe GROUP BY categoria?',
      options: [
        'SUM não pode ser usado na mesma query que um GROUP BY',
        'produto não está agrupado nem agregado: sai um valor ao acaso',
        'Falta um ORDER BY no fim: sem ele o GROUP BY não agrupa as linhas',
        'Só se pode agrupar por colunas numéricas, e categoria é texto',
      ],
      correctIndex: 1,
      explanation: 'Cada coluna do SELECT deve estar no GROUP BY ou dentro de uma agregação. Muitos motores dão erro; o SQLite aceita e escolhe um produto qualquer, o que é pior porque passa despercebido.',
    },
  ],
  'sql-05-having': [
    {
      question: 'Queres as categorias com faturação acima de 1000 €. Onde fica SUM(subtotal) > 1000?',
      options: ['No WHERE, antes do GROUP BY', 'No HAVING, depois do GROUP BY', 'No ORDER BY, no fim da query', 'No SELECT, com um AS'],
      correctIndex: 1,
      explanation: 'O WHERE filtra linhas antes de agrupar e não conhece somas. O HAVING filtra os grupos já calculados.',
    },
    {
      question: 'Por que ordem o SQL executa as partes de uma query?',
      options: [
        'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY',
        'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY',
        'FROM, GROUP BY, WHERE, SELECT, HAVING, ORDER BY',
        'WHERE, FROM, GROUP BY, SELECT, HAVING, ORDER BY',
      ],
      correctIndex: 1,
      explanation: 'Por isso o WHERE não vê os aliases do SELECT nem as somas, e o ORDER BY já vê as duas coisas.',
    },
  ],
  'sql-06-joins': [
    {
      question: 'Há 120 clientes e só 100 compraram. Quantos clientes diferentes aparecem em clientes LEFT JOIN vendas?',
      options: ['100', '120', '220', 'Depende do número de vendas'],
      correctIndex: 1,
      explanation: 'O LEFT JOIN mantém todas as linhas da tabela da esquerda. Os 20 clientes sem compras aparecem com as colunas de vendas a NULL.',
    },
    {
      question: 'Como encontras os clientes que nunca compraram?',
      options: [
        'INNER JOIN vendas e WHERE v.id IS NULL',
        'LEFT JOIN vendas e WHERE v.id IS NULL',
        'LEFT JOIN vendas e WHERE v.id = NULL',
        'INNER JOIN vendas e WHERE v.id IS NOT NULL',
      ],
      correctIndex: 1,
      explanation: 'Depois de um LEFT JOIN, quem não tem correspondência fica com NULL nas colunas da direita. Compara-se com IS NULL, porque = NULL nunca é verdadeiro.',
    },
  ],
  'sql-07-case-coalesce': [
    {
      question: "O que devolve COALESCE(telefone, email, 'sem contacto')?",
      options: ['Os três valores colados num só texto', 'O primeiro dos três que não seja NULL', "Sempre o texto 'sem contacto'", 'NULL se algum dos três for NULL'],
      correctIndex: 1,
      explanation: "O COALESCE percorre os valores da esquerda para a direita e devolve o primeiro que não é NULL. 'sem contacto' só aparece se os dois primeiros forem NULL.",
    },
    {
      question: "Com CASE WHEN total >= 20 THEN 'Médio' WHEN total >= 50 THEN 'Alto' ELSE 'Baixo' END, que valor tem um total de 75?",
      options: ["'Alto'", "'Médio'", "'Médio' e 'Alto'", "'Baixo'"],
      correctIndex: 1,
      explanation: "O CASE pára no primeiro WHEN verdadeiro, como o if/elif em Python. 75 >= 20 já é verdade, por isso 'Alto' nunca chega a ser testado: põe a condição mais exigente primeiro.",
    },
  ],
  'sql-08-cte-windows': [
    {
      question: 'Qual é a diferença entre SUM(subtotal) com GROUP BY categoria e SUM(subtotal) OVER (PARTITION BY categoria)?',
      options: [
        'Nenhuma: as duas devolvem uma linha por categoria com o total',
        'GROUP BY junta as linhas; OVER mantém-nas e repete o total',
        'O OVER só funciona com colunas de data, o GROUP BY com qualquer coluna',
        'O GROUP BY ignora os NULL e o OVER conta-os como zero na soma',
      ],
      correctIndex: 1,
      explanation: 'A função de janela não reduz linhas: cada venda continua lá e ganha ao lado o total da sua categoria. É o que permite calcular pesos e rankings.',
    },
    {
      question: 'Para que serve WITH totais AS (...) no início de uma query?',
      options: [
        'Cria uma tabela permanente chamada totais na base de dados',
        'Dá nome a uma consulta auxiliar que só vive nesta query',
        'Guarda o resultado em memória para as próximas queries usarem',
        'Substitui a tabela totais, se já existir, pela nova consulta',
      ],
      correctIndex: 1,
      explanation: 'Uma CTE é como uma variável temporária: organiza a query em passos com nome e desaparece quando a query acaba.',
    },
  ],
  'sql-09-subqueries-exists-union': [
    {
      question: 'Qual é a diferença entre UNION e UNION ALL?',
      options: [
        'UNION junta colunas lado a lado e UNION ALL junta linhas por baixo',
        'UNION ALL mantém as linhas repetidas; UNION remove-as',
        'UNION ALL exige as mesmas tabelas; UNION aceita tabelas diferentes',
        'Nenhuma: são sinónimos e dão sempre exatamente o mesmo resultado',
      ],
      correctIndex: 1,
      explanation: 'Os dois empilham linhas. UNION remove os duplicados (e por isso é mais lento); UNION ALL mantém tudo.',
    },
    {
      question: 'O que devolve WHERE preco > (SELECT AVG(preco) FROM produtos)?',
      options: [
        'Os produtos com preço acima do preço médio',
        'O preço médio de cada produto, linha a linha',
        'Um erro, porque não se pode pôr um SELECT dentro do WHERE',
        'Os produtos cujo preço é igual à média',
      ],
      correctIndex: 0,
      explanation: 'A subquery corre primeiro e devolve um só número (a média); o WHERE compara cada preço com esse número.',
    },
  ],
  'sql-10-medias-moveis-rfm': [
    {
      question: 'AVG(total) OVER (ORDER BY dia ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) calcula…',
      options: [
        'a média de todos os dias da tabela, repetida em cada linha',
        'a média do dia atual e dos 6 anteriores (7 dias)',
        'a média dos 6 dias seguintes ao dia atual, sem o incluir',
        'a média dos 6 dias anteriores, deixando o dia atual de fora',
      ],
      correctIndex: 1,
      explanation: '6 PRECEDING AND CURRENT ROW são 7 linhas: as 6 de trás e a atual. É a média móvel de 7 dias que alisa o efeito do dia da semana.',
    },
    {
      question: 'Na matriz RFM, o que mede o R (recência)?',
      options: [
        'Quanto dinheiro o cliente gastou no total do ano',
        'Há quantos dias o cliente comprou pela última vez',
        'Quantas compras o cliente fez ao longo do ano inteiro',
        'Em que região do país mora o cliente',
      ],
      correctIndex: 1,
      explanation: 'R é recência (dias desde a última compra), F é frequência (quantas compras) e M é o valor monetário (quanto gastou).',
    },
  ],
  'pd-01-dataframes': [
    {
      question: 'df.shape devolve (5078, 6). O que quer dizer?',
      options: ['5078 colunas e 6 linhas', '5078 linhas e 6 colunas', '5078 valores em falta em 6 colunas', '6 ficheiros com 5078 linhas cada'],
      correctIndex: 1,
      explanation: 'shape é sempre (linhas, colunas). É a primeira coisa a ver depois de ler um ficheiro.',
    },
    {
      question: 'Qual é a diferença entre df["preco"] e df[["preco"]]?',
      options: [
        'Nenhuma: os dois devolvem exatamente o mesmo objeto do pandas',
        'O primeiro dá uma Series; o segundo, um DataFrame de uma coluna',
        'O segundo devolve a coluna preco duas vezes, lado a lado',
        'O primeiro dá erro, porque o nome da coluna tem de ir numa lista',
      ],
      correctIndex: 1,
      explanation: 'Com um nome tens uma Series (uma coluna solta). Com uma lista de nomes, mesmo de um só, tens um DataFrame.',
    },
  ],
  'pd-02-filtros': [
    {
      question: 'Como filtras as vendas de Pão com quantidade acima de 5?',
      options: [
        'df[df["produto"] == "Pão" and df["quantidade"] > 5]',
        'df[(df["produto"] == "Pão") & (df["quantidade"] > 5)]',
        'df[df["produto"] == "Pão" & df["quantidade"] > 5]',
        'df[df["produto"].isin(["Pão"]) or df["quantidade"] > 5]',
      ],
      correctIndex: 1,
      explanation: 'Em pandas combinas máscaras com & (e) e | (ou), com cada condição entre parênteses. and/or dão erro com Series, e sem parênteses o & é avaliado antes do ==.',
    },
    {
      question: 'O que devolve df.loc[df["cidade"] == "Porto", "nome"]?',
      options: [
        'Todas as colunas, mas só das linhas em que a cidade é Porto',
        'Só a coluna nome, nas linhas em que a cidade é Porto',
        'A linha cujo índice tem o valor Porto, com todas as colunas',
        'Um erro, porque .loc só aceita números de linha e de coluna',
      ],
      correctIndex: 1,
      explanation: '.loc[linhas, colunas]: antes da vírgula escolhes as linhas (aqui com uma máscara), depois as colunas.',
    },
  ],
  'pd-03-texto-datas': [
    {
      question: 'O que faz df["produto"].str.strip().str.lower()?',
      options: [
        'Faz o mesmo, mas só na primeira linha da coluna produto',
        'Tira os espaços das pontas e põe tudo em minúsculas',
        'Remove da tabela as linhas cujo produto tem espaços',
        'Ordena os produtos por ordem alfabética, em minúsculas',
      ],
      correctIndex: 1,
      explanation: 'O acessor .str aplica o método de texto a todas as linhas da coluna de uma vez, e os métodos podem encadear-se.',
    },
    {
      question: 'Depois de df["data"] = pd.to_datetime(df["data"]), como obténs o mês de cada venda?',
      options: ['df["data"].month', 'df["data"].dt.month', 'df["data"].str.month', 'month(df["data"])'],
      correctIndex: 1,
      explanation: 'As propriedades de datas de uma coluna estão no acessor .dt, tal como as de texto estão em .str.',
    },
  ],
  'pd-04-ordenacao-contagens': [
    {
      question: 'O que devolve df["produto"].value_counts()?',
      options: [
        'A soma da coluna quantidade para cada produto da tabela',
        'Quantas linhas há de cada produto, da mais frequente à menos',
        'A lista dos produtos sem repetidos, por ordem alfabética',
        'O número de produtos diferentes, como um único número inteiro',
      ],
      correctIndex: 1,
      explanation: 'value_counts conta linhas, não unidades vendidas. Para somar quantidades usa groupby("produto")["quantidade"].sum().',
    },
    {
      question: 'O que dá df.sort_values("subtotal", ascending=False).head(3)?',
      options: ['As 3 vendas de maior subtotal', 'As 3 vendas de menor subtotal', 'As 3 primeiras vendas do ficheiro', 'Os 3 subtotais diferentes'],
      correctIndex: 0,
      explanation: 'ascending=False ordena do maior para o menor e head(3) fica com as 3 primeiras linhas desse resultado.',
    },
  ],
  'pd-05-groupby-merge': [
    {
      question: 'O que devolve df.groupby("categoria")["subtotal"].sum()?',
      options: [
        'Uma linha por venda com o total da categoria',
        'Um valor por categoria: a soma dos subtotais',
        'O subtotal máximo de cada uma das categorias',
        'Um DataFrame com todas as colunas somadas',
      ],
      correctIndex: 1,
      explanation: 'O groupby reduz a tabela a uma linha por grupo, como o GROUP BY do SQL. O resultado é uma Series com a categoria no índice.',
    },
    {
      question: 'O que faz pd.merge(vendas, produtos, left_on="produto_id", right_on="id", how="left")?',
      options: [
        'Mantém todas as vendas e junta-lhes as colunas do produto',
        'Mantém só os produtos que aparecem nas duas tabelas ao mesmo tempo',
        'Empilha as duas tabelas, uma por baixo da outra',
        'Mantém todos os produtos do catálogo, mesmo os que nunca venderam',
      ],
      correctIndex: 0,
      explanation: 'how="left" é o LEFT JOIN do SQL: todas as linhas da tabela da esquerda (vendas) ficam, com as colunas de produtos ao lado.',
    },
  ],
  'pd-06-limpeza-sujas': [
    {
      question: 'O que devolve df["preco"].isna().sum()?',
      options: [
        'A soma de todos os preços que não estão em falta',
        'Quantos preços estão em falta',
        'Quantos preços são iguais a zero na coluna',
        'A média dos preços que estão em falta',
      ],
      correctIndex: 1,
      explanation: 'isna() dá True onde falta o valor; somar True conta como 1, por isso a soma é o número de valores em falta.',
    },
    {
      question: 'Porque é que o drop_duplicates() deve vir depois de limpar espaços e maiúsculas?',
      options: [
        'Porque o drop_duplicates também tira os espaços das pontas',
        'Porque " Pão" e "pão" só ficam iguais depois de limpos',
        'Porque assim corre mais depressa em tabelas grandes',
        'Não faz diferença: o pandas ignora espaços e maiúsculas',
      ],
      correctIndex: 1,
      explanation: 'Para o pandas, " Pão" e "pão" são textos diferentes. Só depois de os normalizares é que as linhas repetidas ficam iguais e são apanhadas.',
    },
  ],
  'pd-07-pivot-transform': [
    {
      question: 'Qual é a diferença entre groupby(...).sum() e groupby(...).transform("sum")?',
      options: [
        'Nenhuma: as duas devolvem uma linha por grupo com o total',
        'sum() dá uma linha por grupo; transform repete o total em cada linha',
        'transform só aceita médias e contagens; para somas tens de usar sum()',
        'sum() mantém todas as linhas e transform junta-as por grupo',
      ],
      correctIndex: 1,
      explanation: 'Com transform o resultado tem o tamanho da tabela original, por isso podes dividir cada linha pelo total do seu grupo.',
    },
    {
      question: 'Em df.pivot_table(index="mes", columns="categoria", values="subtotal", aggfunc="sum"), o que fica nas colunas?',
      options: ['Os meses', 'As categorias', 'Os subtotais', 'As datas'],
      correctIndex: 1,
      explanation: 'index dá as linhas (um mês por linha), columns dá as colunas (uma por categoria) e values com aggfunc enche as células.',
    },
  ],
  'pd-08-numpy-estatistica': [
    {
      question: 'O que devolve np.percentile(valores, 90)?',
      options: [
        'A soma dos valores multiplicada por 0,9 (90%)',
        'O valor abaixo do qual ficam 90% dos dados',
        'Os 90 maiores valores, por ordem decrescente',
        'A média dos 90 primeiros valores',
      ],
      correctIndex: 1,
      explanation: 'O percentil 90 separa os 10% de valores mais altos do resto. O percentil 50 é a mediana.',
    },
    {
      question: 'O que dão np.array([1, 2, 3]) * 2 e [1, 2, 3] * 2?',
      options: [
        'array([2, 4, 6]) e [2, 4, 6]',
        'array([2, 4, 6]) e [1, 2, 3, 1, 2, 3]',
        'array([1, 2, 3, 1, 2, 3]) e [2, 4, 6]',
        'Os dois dão erro',
      ],
      correctIndex: 1,
      explanation: 'Os arrays NumPy fazem contas elemento a elemento. Uma lista Python multiplicada por 2 repete-se.',
    },
  ],
  'pf-01-limpeza-bicicletas': [
    {
      question: 'Que formato dás ao pd.to_datetime para ler "14-03-2025 8h05"?',
      options: ['"%Y-%m-%d %H:%M"', '"%d/%m/%Y %H:%M"', '"%d-%m-%Y %Hh%M"', '"%d-%m-%Y %H:%M"'],
      correctIndex: 2,
      explanation: 'O dia vem primeiro, separado por hífenes, e entre a hora e os minutos há um "h" em vez de dois pontos. No formato, o "h" escreve-se tal e qual: %Hh%M.',
    },
    {
      question: 'O que faz errors="coerce" no pd.to_datetime(serie, format=...)?',
      options: [
        'Adivinha o formato de cada linha e converte-a sempre',
        'Põe NaT nas linhas que não encaixam no formato',
        'Apaga do DataFrame as linhas com datas inválidas',
        'Para o programa logo na primeira data que não encaixa',
      ],
      correctIndex: 1,
      explanation: 'Com errors="coerce" o que não encaixa no formato fica NaT (a data em falta). É isso que te deixa converter com um formato de cada vez e juntar os resultados com .fillna().',
    },
  ],
};
