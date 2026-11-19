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

  // ---- Trilha 1: Python (perguntas de raciocínio aplicado) ----
  'py-00-pensamento': [
    {
      question: 'Qual é o risco mais caro quando um principiante tenta aprender Análise de Dados?',
      options: [
        'Começar por tabelas pequenas antes de passar para ficheiros de 1 milhão de linhas',
        'Passar meses em cursos sem fazer projetos reais',
        'Aprender SQL e Excel antes de estudar modelos de redes neuronais',
        'Escrever comentários em português para documentar regras de negócio',
      ],
      correctIndex: 1,
      explanation: 'Tutorial Hell (consumir horas de vídeo sem resolver problemas em dados imperfeitos) atrasa a autonomia real.',
    },
    {
      question: 'Entregas um número exato ao dono da loja, mas ele pergunta "e daí?". O que faltou?',
      options: [
        'Usar mais casas decimais no cálculo da faturação anual',
        'Ligar o número a uma decisão prática de negócio',
        'Trocar o Python por uma linguagem compilada mais rápida',
        'Mostrar o código-fonte completo durante a reunião de gestão',
      ],
      correctIndex: 1,
      explanation: 'Análise de dados só gera valor quando traduz o número numa ação concreta (ex.: reforçar stock ou ajustar preço).',
    },
  ],
  'py-01-sintaxe': [
    {
      question: 'O que imprime print("2 + 3") em Python?',
      options: ['5', '2 + 3', 'Erro de sintaxe', 'None'],
      correctIndex: 1,
      explanation: 'Entre aspas o Python trata o conteúdo como texto literal e não faz a conta.',
    },
    {
      question: 'Qual destes comentários acrescenta valor real a um script de faturação?',
      options: [
        '# Multiplica quantidade por preco',
        '# Soma 1 à variável contador',
        '# Exclui devoluções antes do fecho fiscal',
        '# Imprime o resultado final no ecrã',
      ],
      correctIndex: 2,
      explanation: 'Bons comentários explicam o porquê da regra de negócio, não repetem o que o código já diz.',
    },
  ],
  'py-02-variaveis': [
    {
      question: 'Um ficheiro entrega quantidade = "3" e preco = 2. O que devolve quantidade * preco?',
      options: ['6', '"33"', 'Erro de tipo (TypeError)', '3.2'],
      correctIndex: 1,
      explanation: 'Multiplicar uma string por um inteiro repete o texto ("3" * 2 dá "33"). Converte sempre com int().',
    },
    {
      question: 'Se escreveres preco = 0,25 em Python, o que criaste na realidade?',
      options: ['Um número decimal (float)', 'Um tuplo (0, 25)', 'Um erro de nome (NameError)', 'Uma lista com dois elementos'],
      correctIndex: 1,
      explanation: 'Em Python os decimais usam ponto (0.25); a vírgula cria um tuplo com dois inteiros.',
    },
  ],
  'py-03-strings-conversoes': [
    {
      question: 'Escreves nome = "  pão " e na linha seguinte apenas nome.strip(). O que vale nome depois?',
      options: ['"pão"', '"  pão "', '"Pão"', 'None'],
      correctIndex: 1,
      explanation: 'Métodos de string não alteram a variável original: tens de guardar o resultado em nome = nome.strip().',
    },
    {
      question: 'Num cálculo financeiro com 5 000 linhas, quando deves arredondar a 2 casas decimais?',
      options: [
        'Antes de multiplicar cada preço pela respetiva quantidade',
        'Apenas no total final ou na apresentação',
        'A cada 100 linhas para reduzir o erro acumulado',
        'Nunca: devolvem-se sempre 10 casas decimais no relatório',
      ],
      correctIndex: 1,
      explanation: 'Arredondar passos intermédios acumula erros de cêntimos em somas grandes.',
    },
  ],
  'py-04-condicoes': [
    {
      question: 'Numa escada de descontos (>= 50 € dá 10%, >= 20 € dá 5%), o que acontece se testares >= 20 primeiro?',
      options: [
        'Compras de 60 € recebem 5% em vez de 10%',
        'O Python soma os dois descontos e aplica 15%',
        'O código dá erro de sintaxe ao encontrar o elif',
        'Não faz diferença porque o Python avalia o maior valor',
      ],
      correctIndex: 0,
      explanation: 'O if/elif pára no primeiro ramo verdadeiro. Coloca sempre a faixa mais exigente (>= 50) no topo.',
    },
    {
      question: 'Queres selecionar clientes do Porto ou de Braga com gasto acima de 100 €. Qual expressão está certa?',
      options: [
        'cidade == "Porto" or "Braga" and gasto > 100',
        '(cidade == "Porto" or cidade == "Braga") and gasto > 100',
        'cidade == "Porto" or cidade == "Braga" and gasto > 100',
        'cidade = "Porto" or cidade = "Braga" and gasto > 100',
      ],
      correctIndex: 1,
      explanation: 'O operador and tem precedência sobre or; os parênteses garantem que o filtro de gasto se aplica às duas cidades.',
    },
  ],
  'py-05-ciclo-for': [
    {
      question: 'Um ciclo for para somar vendas devolve apenas o valor da última venda. Qual é a causa provável?',
      options: [
        'Faltou usar range() em vez de percorrer a lista',
        'total = 0 foi escrito dentro do ciclo',
        'A lista tem números decimais em vez de inteiros',
        'O ciclo for só consegue somar até 100 elementos',
      ],
      correctIndex: 1,
      explanation: 'Se inicializares o acumulador dentro do for, ele volta a zero em cada iteração.',
    },
    {
      question: 'Quantos números gera range(1, 13) para representar os meses do ano?',
      options: ['11 números (1 a 11)', '12 números (1 a 12)', '13 números (1 a 13)', '13 números (0 a 12)'],
      correctIndex: 1,
      explanation: 'Em range(inicio, fim), o limite direito fica sempre de fora: de 1 até 12.',
    },
  ],
  'py-06-while': [
    {
      question: 'Quando faz mais sentido escolher while em vez de for num trabalho de dados?',
      options: [
        'Quando já tens uma lista fechada com 5 078 vendas',
        'Quando não sabes quantas voltas faltam até atingir uma meta',
        'Quando queres percorrer as chaves de um dicionário',
        'Sempre que precisas de somar números com casas decimais',
      ],
      correctIndex: 1,
      explanation: 'O while brilha em metas de paragem ou APIs paginadas onde o número de iterações não é conhecido à partida.',
    },
    {
      question: 'Escreves while saldo < 500: mas esqueces-te de somar ao saldo lá dentro. O que acontece?',
      options: [
        'O ciclo corre apenas uma vez e pára',
        'Entra em ciclo infinito até ser interrompido',
        'O Python deteta automaticamente e sai ao fim de 100 voltas',
        'O saldo passa automaticamente para 500',
      ],
      correctIndex: 1,
      explanation: 'A condição mantém-se sempre verdadeira; num Worker com timeout, a execução é travada ao fim do tempo limite.',
    },
  ],
  'py-07-listas-colecoes': [
    {
      question: 'Escreves ordenados = precos.sort(). O que fica guardado em ordenados?',
      options: ['A lista ordenada do menor para o maior', 'None', 'Uma cópia ordenada sem mudar precos', 'O maior preço da lista'],
      correctIndex: 1,
      explanation: '.sort() altera a lista no próprio sítio e devolve None. Para guardar numa nova variável usa sorted(precos).',
    },
    {
      question: 'Tens duas listas de códigos de produto (lote novo vs catálogo) e queres achar os desconhecidos rápido. O que usas?',
      options: ['Um tuplo ordenado alfabeticamente', 'Diferença entre conjuntos (set)', 'Uma string concatenada com vírgulas', 'Duas fatias negativas com [-1]'],
      correctIndex: 1,
      explanation: 'set(novo) - set(catalogo) encontra códigos em falta de forma legível e imediata.',
    },
  ],
  'py-08-dicionarios': [
    {
      question: 'Porque é preferível usar totais[k] = totais.get(k, 0) + valor em vez de totais[k] += valor?',
      options: [
        'Porque o operador += não funciona com valores decimais',
        'Evita KeyError na primeira vez que a chave aparece',
        'Porque ordena automaticamente o dicionário por valor',
        'Porque remove chaves com valor igual a zero no fim',
      ],
      correctIndex: 1,
      explanation: 'Na primeira ocorrência de uma categoria, totais[k] ainda não existe e += lançaria KeyError.',
    },
    {
      question: 'Em vendas por categoria, o que devolve max(totais, key=totais.get)?',
      options: [
        'O valor numérico da maior faturação',
        'O nome da categoria com maior faturação',
        'Uma lista com todas as categorias acima da média',
        'O número total de chaves no dicionário',
      ],
      correctIndex: 1,
      explanation: 'Percorre as chaves do dicionário e devolve a chave cujo valor (totais.get) é o maior.',
    },
  ],
  'py-09-funcoes': [
    {
      question: 'Qual é a vantagem prática de encapsular uma regra de limpeza numa função pura (sem variáveis globais)?',
      options: [
        'Impede o Python de usar memória RAM ao ler ficheiros CSV',
        'Fica fácil de testar e reutilizar noutras tabelas',
        'Dispensa a utilização da palavra-chave return no final',
        'Torna o código 100 vezes mais rápido do que NumPy',
      ],
      correctIndex: 1,
      explanation: 'Uma função que depende só dos seus parâmetros dá sempre o mesmo resultado para a mesma entrada.',
    },
    {
      question: 'Defines def com_iva(v, taxa=0.23): return round(v * (1 + taxa), 2). O que dá com_iva(10, 0.06)?',
      options: ['12.3', '10.6', 'Erro por excesso de argumentos', '10.23'],
      correctIndex: 1,
      explanation: 'O segundo argumento substitui o valor por omissão (0.23) pela taxa reduzida de 6% (0.06).',
    },
  ],
  'py-10-caixa-csv': [
    {
      question: 'Porque é que o total de 26 902,89 € em Python puro é tão valioso quando passas para SQL e Pandas?',
      options: [
        'Porque o SQLite não consegue somar números decimais',
        'Serve de número de reconciliação entre ferramentas',
        'Porque o ficheiro CSV muda de valores sempre que se abre',
        'Porque evita ter de converter tipos de texto para número',
      ],
      correctIndex: 1,
      explanation: 'Confirmar que o mesmo total bate certo ao cêntimo em Python, SQL e Pandas garante que não houve erros de leitura ou JOIN.',
    },
    {
      question: 'Numa leitura com csv.DictReader(f), qual é o tipo inicial de linha["preco"]?',
      options: ['float', 'str (texto)', 'int', 'Decimal'],
      correctIndex: 1,
      explanation: 'O módulo csv lê todos os campos como texto; cabe ao analista converter com int() ou float().',
    },
  ],

  // ---- Trilha 4: Git & GitHub ----
  'git-01-init-status': [
    {
      question: 'Se apagares a pasta escondida .git de um projeto, o que perdes?',
      options: [
        'Os ficheiros atuais de código e os CSV da pasta',
        'Todo o histórico de commits e ramos locais',
        'Apenas os ficheiros listados dentro do .gitignore',
        'A conta do GitHub associada ao teu endereço de email',
      ],
      correctIndex: 1,
      explanation: 'Os ficheiros atuais continuam na pasta, mas toda a memória de versões e ramos vive em .git.',
    },
    {
      question: 'Qual é o primeiro comando seguro a correr quando não sabes o que alteraste desde ontem?',
      options: ['git init', 'git status', 'git push --force', 'git merge main'],
      correctIndex: 1,
      explanation: 'git status é só de leitura e mostra o que está modificado, preparado (staged) ou não seguido.',
    },
  ],
  'git-02-add-commit': [
    {
      question: 'Alteraste 2 ficheiros: uma query pronta e um rascunho a meio. Como gravas só a query?',
      options: [
        'git add . seguido de git commit -m "Query"',
        'git add <query> seguido de git commit',
        'git commit -a para gravar apenas o primeiro ficheiro',
        'Não é possível: o Git grava sempre a pasta inteira',
      ],
      correctIndex: 1,
      explanation: 'A área de staging existe exatamente para escolheres quais alterações entram em cada commit.',
    },
    {
      question: 'Antes de correr git add, que comando mostra exatamente que linhas adicionaste ou apagaste?',
      options: ['git log', 'git diff', 'git branch', 'git remote -v'],
      correctIndex: 1,
      explanation: 'git diff permite rever cada linha alterada antes de a colocar no commit.',
    },
  ],
  'git-03-gitignore': [
    {
      question: 'Um colega já fez commit de clientes_reais.csv antes de o pôr no .gitignore. O que precisas de fazer?',
      options: [
        'Apenas acrescentar o nome ao .gitignore chega para o deixar de seguir',
        'Tirar do índice com git rm --cached (e limpar credenciais/histórico)',
        'Correr git status para o Git o esconder automaticamente',
        'Mudar a extensão do ficheiro de .csv para .xlsx',
      ],
      correctIndex: 1,
      explanation: 'O .gitignore só ignora ficheiros que ainda não estão seguidos; ficheiros já versionados precisam de git rm --cached.',
    },
    {
      question: 'Porque é que os dados da Mercearia podem estar num repositório público no GitHub?',
      options: [
        'Porque o ficheiro tem menos de 10 000 linhas de vendas',
        'Porque são dados sintéticos sem pessoas reais',
        'Porque ficheiros CSV não estão abrangidos pelo RGPD',
        'Porque o GitHub encripta automaticamente pastas chamadas dados/',
      ],
      correctIndex: 1,
      explanation: 'Dados reais de clientes (nomes, moradas, emails) estão protegidos pelo RGPD e nunca devem ir para repositórios públicos.',
    },
  ],
  'git-04-branches': [
    {
      question: 'Estás no ramo analise-natal a testar uma limpeza nova e precisas de corrigir um erro urgente em main. O que fazes?',
      options: [
        'Apagas o trabalho novo para voltar ao estado anterior',
        'Fazes commit no ramo atual e mudas para main',
        'Corres git init numa subpasta dentro do projeto',
        'Fazes merge do trabalho incompleto para o main',
      ],
      correctIndex: 1,
      explanation: 'Guardar o commit no ramo isolado mantém main intacto e permite-te voltar ao trabalho depois sem perder nada.',
    },
    {
      question: 'Quando acontece um conflito durante um git merge?',
      options: [
        'Sempre que dois ramos criam ficheiros novos com nomes diferentes',
        'Quando os dois ramos alteraram as mesmas linhas do mesmo ficheiro',
        'Quando o nome do ramo tem mais de 10 caracteres',
        'Sempre que se tenta fundir um ramo no ramo main',
      ],
      correctIndex: 1,
      explanation: 'O Git integra automaticamente mudanças em zonas diferentes; só pede decisão humana quando duas edições colidem na mesma linha.',
    },
  ],
  'git-05-github-portfolio': [
    {
      question: 'Trabalhaste no projeto no portátil de casa e fizeste push. Ao chegar ao escritório, o que corres antes de editar?',
      options: ['git init', 'git pull', 'git push -u origin main', 'git merge origin'],
      correctIndex: 1,
      explanation: 'git pull traz as alterações mais recentes do GitHub para não trabalhares sobre uma versão desatualizada.',
    },
    {
      question: 'Um recrutador clona o teu repositório mas o script falha com "FileNotFoundError: C:\\Users\\Joao\\vendas.csv". Qual foi o erro?',
      options: [
        'O recrutador não tem permissões de administrador no GitHub',
        'Usar caminho absoluto local em vez de caminho relativo',
        'Faltou colocar o ficheiro CSV dentro da pasta .git',
        'O Python no Windows não consegue ler ficheiros CSV',
      ],
      correctIndex: 1,
      explanation: 'Usa sempre caminhos relativos como "dados/vendas.csv" para o projeto correr em qualquer computador.',
    },
  ],

  // ---- Trilha 5: Visualização & BI ----
  'bi-03-curva-abc': [
    {
      question: 'A faturação caiu 12% este mês. Usando a Árvore de KPIs (Clientes × Frequência × Ticket), qual é o passo seguinte?',
      options: [
        'Lançar imediatamente um desconto de 20% em toda a loja',
        'Medir qual das 3 peças caiu primeiro',
        'Remover os produtos Classe C do catálogo da mercearia',
        'Trocar o gráfico de barras por um gráfico circular',
      ],
      correctIndex: 1,
      explanation: 'Decompor a Métrica Norte evita tiros no escuro: uma queda de tráfego pede uma ação diferente de uma queda no ticket médio.',
    },
    {
      question: 'Uma campanha subiu as encomendas +18%, mas a taxa de devolução triplicou. O que falhou no desenho das métricas?',
      options: [
        'Faltou acompanhar uma métrica guardrail',
        'Faltou calcular a soma acumulada com .cumsum() sobre os produtos',
        'A amostra analisada tinha demasiados produtos de Classe A na loja',
        'Usaram-se percentagens relativas em vez de euros absolutos',
      ],
      correctIndex: 0,
      explanation: 'Métricas guardrail garantem que melhorar o KPI principal não destrói margem, qualidade ou satisfação do cliente.',
    },
  ],
  'bi-06-storytelling': [
    {
      question: 'Um gráfico de barras mostra o eixo Y a começar em 2 000 € para comparar meses entre 2 100 € e 2 450 €. Qual é o problema?',
      options: [
        'Fica mais difícil ler o nome dos meses no eixo horizontal',
        'Exagera visualmente uma diferença pequena',
        'Impede de ordenar as barras do maior para o menor',
        'Não há problema nenhum desde que o título esteja a negrito',
      ],
      correctIndex: 1,
      explanation: 'Em gráficos de barras o comprimento representa a magnitude: cortar o zero distorce a proporção real.',
    },
    {
      question: 'Estás a desenhar um dashboard executivo com alertas. Que boa prática evita problemas de leitura para pessoas daltónicas?',
      options: [
        'Usar apenas vermelho vivo e verde vivo sem qualquer texto de apoio',
        'Combinar paleta acessível com rótulo ou ícone',
        'Colocar 15 cartões KPI diferentes na primeira linha do ecrã principal',
        'Usar efeitos 3D e sombras fortes para distinguir as barras do gráfico',
      ],
      correctIndex: 1,
      explanation: 'Nunca dependas só de vermelho vs verde: combina paletas seguras com símbolos ou rótulos diretos e limita o topo a 3–5 KPIs.',
    },
  ],
  'bi-07-graficos-matplotlib': [
    {
      question: 'Qual destes títulos segue melhor o princípio de storytelling executivo num gráfico?',
      options: [
        'Gráfico 1: Faturação por categoria (2025)',
        'Mercearia gera 51,6% da faturação anual da loja',
        'Dados retirados de vendas.csv em matplotlib',
        'Análise exploratória de barras horizontais por categoria',
      ],
      correctIndex: 1,
      explanation: 'O título deve afirmar a conclusão principal com um número, poupando o leitor a decifrar a mensagem sozinho.',
    },
    {
      question: 'Ao usar ax.barh() em matplotlib, como garantes que a categoria líder aparece no topo do gráfico?',
      options: [
        'Ordenar do maior para o menor antes de chamar barh',
        'Ordenar do menor para o maior (ou inverter o eixo Y)',
        'Passar reverse=True dentro de plt.subplots()',
        'Usar ax.plot() em vez de ax.barh()',
      ],
      correctIndex: 1,
      explanation: 'barh desenha o primeiro item em baixo; ordenar de forma crescente (ou usar ax.invert_yaxis()) coloca o maior no topo.',
    },
  ],
  'bi-04-star-schema': [
    {
      question: 'Num modelo Star Schema no Power BI, porque evitamos relacionamentos bidirecionais por defeito?',
      options: [
        'Porque o Power BI não permite ligar mais do que duas tabelas',
        'Podem criar filtros ambíguos e degradar o desempenho',
        'Porque impedem o uso da função SUMX em medidas DAX',
        'Porque obrigam a duplicar as chaves estrangeiras nos factos',
      ],
      correctIndex: 1,
      explanation: 'Com filtro unidirecional (Dimensão → Facto), o caminho de filtragem é previsível e rápido mesmo com várias tabelas de factos.',
    },
    {
      question: 'Onde deve viver a coluna "cidade" do cliente num Star Schema bem desenhado?',
      options: [
        'Repetida em todas as linhas da tabela de factos fVendas',
        'Na tabela de dimensão dClientes',
        'Numa tabela de factos separada apenas para moradas',
        'Dentro da tabela dCalendario ligada pela data da venda',
      ],
      correctIndex: 1,
      explanation: 'Atributos descritivos usados para filtrar e agrupar pertencem às dimensões; factos guardam chaves e métricas numéricas.',
    },
  ],
  'bi-05-excel-dax': [
    {
      question: 'Em DAX, qual é o erro de calcular Faturação com SUM(vendas[quantidade]) * SUM(vendas[preco])?',
      options: [
        'O DAX não suporta o operador de multiplicação * entre colunas numéricas',
        'Multiplica os totais em vez de linha a linha',
        'Ignora automaticamente os filtros de cidade aplicados na página inteira',
        'Devolve sempre zero quando existe mais do que um produto no catálogo',
      ],
      correctIndex: 1,
      explanation: 'A soma dos produtos não é o produto das somas: precisas do iterador SUMX(vendas, vendas[quantidade] * vendas[preco]).',
    },
    {
      question: 'Como garantes que uma medida DAX nova no Power BI não tem erro de lógica antes de a apresentar à direção?',
      options: [
        'Formatar o cartão com 2 casas decimais e símbolo €',
        'Reconciliar 2 ou 3 totais com uma query SQL de controlo',
        'Converter todas as medidas em colunas calculadas fixas',
        'Retirar todos os slicers de filtro da página do relatório',
      ],
      correctIndex: 1,
      explanation: 'Cruzar o total do dashboard contra uma query SQL auditada apanha erros de relação ou contexto de filtro antes da reunião.',
    },
  ],
  'bi-10-pratica-excel-powerbi': [
    {
      question: 'No Excel, qual é a vantagem imediata de converter um intervalo importado em Tabela (Ctrl + T)?',
      options: [
        'Os dados ficam automaticamente protegidos contra edições manuais',
        'Fórmulas e Tabelas Dinâmicas crescem sozinhas quando entram linhas novas',
        'Substitui por completo a necessidade de usar Power Query',
        'Converte pontos decimais ingleses em vírgulas automaticamente',
      ],
      correctIndex: 1,
      explanation: 'Tabelas estruturadas usam referências por nome de coluna e expandem-se automaticamente em novos carregamentos.',
    },
    {
      question: 'Quando os números de SQL, pandas e Power BI coincidem ao cêntimo, o que provaste?',
      options: [
        'Que as três ferramentas usam exatamente a mesma sintaxe',
        'Que a regra de negócio e os cruzamentos estão consistentes',
        'Que o ficheiro CSV original não tinha valores nulos nem outliers',
        'Que não é necessário criar tabela de Calendário no Power BI',
      ],
      correctIndex: 1,
      explanation: 'Reconciliação entre ferramentas independentes é o padrão profissional para validar relatórios.',
    },
  ],
  'bi-20-excel-powerquery-limpeza': [
    {
      question: 'Uma fórmula =A2*B2 no Excel devolve #VALOR! apesar de B2 mostrar "115.40". Qual é a causa provável?',
      options: [
        'A célula A2 contém um número inteiro em vez de decimal',
        'B2 foi importado como texto por causa do ponto decimal',
        'A coluna B está demasiado estreita para mostrar o valor',
        'O Excel exige usar SUMX em vez do operador *',
      ],
      correctIndex: 1,
      explanation: 'Em Windows/Excel em português, "115.40" pode entrar como texto e gerar #VALOR! ao multiplicar; corrige com Alterar Tipo > Com Localidade.',
    },
    {
      question: 'Num relatório Excel aparece o erro #N/D numa célula com PROCX/PROCV. O que significa?',
      options: [
        'Divisão por zero na fórmula da linha',
        'A chave procurada não existe na tabela de referência',
        'A coluna de origem foi apagada da folha de cálculo',
        'O resultado ultrapassa o limite numérico do Excel',
      ],
      correctIndex: 1,
      explanation: '#N/D (Not Available) indica chave não encontrada — verifica espaços invisíveis ou diferenças entre número e texto.',
    },
  ],
  'bi-21-excel-dinamicas-procx': [
    {
      question: 'Se importares uma folha que já tem uma linha "TOTAL" no fundo e criares uma Tabela Dinâmica sobre tudo, o que acontece?',
      options: [
        'O Excel deteta a palavra TOTAL e ignora a última linha',
        'Todos os valores da Tabela Dinâmica ficam duplicados',
        'A Tabela Dinâmica recusa criar o resumo com erro #REF!',
        'Apenas as médias ficam afetadas, mas a soma fica correta',
      ],
      correctIndex: 1,
      explanation: 'Nunca mistures linhas de subtotal/total dentro da tabela de dados brutos antes de criar uma Tabela Dinâmica.',
    },
    {
      question: 'Uma coluna de datas ficou alinhada à esquerda nas células do Excel e a Tabela Dinâmica não agrupa por mês. Porquê?',
      options: [
        'Porque o Excel só agrupa datas quando há mais de 365 linhas',
        'As datas estão guardadas como texto e não como tipo Data',
        'Falta ordenar a tabela da data mais recente para a mais antiga',
        'É obrigatório usar SOMA.SE.S antes de inserir a Tabela Dinâmica',
      ],
      correctIndex: 1,
      explanation: 'No Excel, datas reais alinham à direita; alinhamento à esquerda denuncia texto preso que precisa de conversão no Power Query.',
    },
  ],
  'bi-22-powerbi-dax-relatorio': [
    {
      question: 'Porque deves usar DIVIDE([Web], [Total], 0) em vez de [Web] / [Total] em DAX?',
      options: [
        'DIVIDE arredonda automaticamente para duas casas decimais',
        'Evita Infinity ou erro quando um filtro deixa [Total] a zero',
        'O operador / não funciona entre duas medidas DAX',
        'DIVIDE ignora filtros externos aplicados nos cartões',
      ],
      correctIndex: 1,
      explanation: 'DIVIDE trata divisões por zero de forma segura, devolvendo o valor alternativo (0 ou BLANK).',
    },
    {
      question: 'Qual é a vantagem de reutilizar [Faturação Líquida] dentro de [Quota Web %] em vez de repetir SUMX?',
      options: [
        'Se a regra de faturação mudar, corriges num único sítio',
        'Elimina a necessidade de relacionar tabelas no modelo',
        'Faz a medida funcionar sem coluna de data no relatório',
        'Impede o utilizador de filtrar o gráfico por região',
      ],
      correctIndex: 0,
      explanation: 'Composição de medidas evita divergências silenciosas entre cartões quando uma definição de negócio evolui.',
    },
  ],
  'bi-18-inteligencia-tempo': [
    {
      question: 'No Power BI, porque precisam TOTALYTD e DATEADD de uma tabela Calendário contínua marcada como Tabela de Datas?',
      options: [
        'Para colorir os fins de semana automaticamente nos gráficos',
        'Sem todos os dias seguidos, o motor erra comparações de período',
        'Porque o DAX não aceita colunas de data vindas de ficheiros CSV',
        'Para reduzir o número de linhas da tabela de vendas',
      ],
      correctIndex: 1,
      explanation: 'Se faltar um dia sem vendas na tabela de factos, o cálculo de período anterior pode falhar ou devolver branco.',
    },
    {
      question: 'O YTD subiu +12% face ao ano passado, mas a variação MoM caiu -18% no último mês. Como lês isto?',
      options: [
        'Os dois números contradizem-se: há um erro na fórmula DAX',
        'O ano vai bem no acumulado, mas houve travagem recente',
        'A média móvel de 3 meses é obrigatoriamente negativa',
        'Deves ignorar o último mês porque o acumulado continua positivo',
      ],
      correctIndex: 1,
      explanation: 'O YTD é o conta-quilómetros (histórico) e o MoM é o velocímetro (agora): um abrandamento recente pede investigação imediata.',
    },
  ],

  // ---- Trilha 6: Estatística ----
  'bi-01-media-mediana': [
    {
      question: 'Numa cidade a média de salários é 2 400 € e a mediana é 1 150 €. Que conclusão é mais rigorosa?',
      options: [
        'Metade dos trabalhadores ganha acima de 2 400 €',
        'Poucos salários muito altos puxam a média para cima',
        'Houve um erro de soma porque média e mediana deviam coincidir',
        'O desvio padrão dessa distribuição é próximo de zero',
      ],
      correctIndex: 1,
      explanation: 'Média bem acima da mediana sinaliza forte assimetria positiva; a mediana retrata melhor o trabalhador típico.',
    },
    {
      question: 'Para definir o patamar de "envio grátis" que abranja cerca de metade das compras, que referência escolhes?',
      options: [
        'A média aritmética, porque usa todos os valores',
        'A mediana (P50), por ser o ponto central real',
        'O valor máximo do ano dividido por dois',
        'O desvio padrão somado ao valor mínimo',
      ],
      correctIndex: 1,
      explanation: 'Por definição, 50% das compras ficam acima e 50% abaixo da mediana.',
    },
  ],
  'bi-02-quartis-outliers': [
    {
      question: 'Porque usamos IQR (Q3 - Q1) em vez de (máximo - mínimo) para definir limites de outliers?',
      options: [
        'Porque máximo e mínimo não existem em pandas',
        'O IQR ignora os extremos e não fica distorcido por eles',
        'Porque o IQR garante que nunca há mais de 5 outliers',
        'Porque só o IQR funciona com números inteiros',
      ],
      correctIndex: 1,
      explanation: 'Um único erro de digitação (99 999 €) rebenta a amplitude total e o desvio padrão, mas quase não mexe em Q1 nem Q3.',
    },
    {
      question: 'Encontras 2 outliers em vendas: -1,00 € e uma compra legítima de 45 € de Azeite. Como atuas?',
      options: [
        'Apagas ambos os registos para manter a distribuição perfeitamente simétrica',
        'Manténs ambos os registos sem tocar para preservar os dados brutos originais',
        'Limpa o erro (-1 €) e analisa os 45 € à parte',
        'Substituis ambos os valores pela mediana global das vendas da loja',
      ],
      correctIndex: 2,
      explanation: 'Erros de registo limpam-se; vendas reais de alto valor representam um segmento comercial importante.',
    },
  ],
  'bi-12-probabilidade-simpson': [
    {
      question: 'Um teste de fraude tem 95% de acerto, mas a fraude real ocorre em apenas 0,5% das transações. A maioria dos alertas será:',
      options: [
        'Fraude confirmada (95% dos alertas)',
        'Falsos positivos, devido à baixa prevalência',
        'Exatamente metade fraude e metade legítima',
        'Impossível de estimar sem uma regressão múltipla',
      ],
      correctIndex: 1,
      explanation: 'Pela regra de Bayes, quando o evento é muito raro, os 5% de falsos alarmes sobre os 99,5% honestos superam os verdadeiros positivos.',
    },
    {
      question: 'O Lift(Café | Leite) deu 0,75. O que significa para uma campanha conjunta?',
      options: [
        'Quem compra Leite compra Café 75% mais vezes do que a média',
        'Os dois produtos aparecem juntos menos vezes do que ao acaso',
        '75% de todos os clientes da loja compram Café e Leite juntos',
        'A correlação entre preço do Leite e do Café é +0,75',
      ],
      correctIndex: 1,
      explanation: 'Lift = 1 indica independência; acima de 1 há afinidade positiva; abaixo de 1 os produtos aparecem menos vezes juntos.',
    },
  ],
  'bi-09-correlacao-confianca': [
    {
      question: 'As vendas de gelados e o número de afogamentos têm correlação r = 0,88. Qual é a leitura correta?',
      options: [
        'Comer gelados provoca diretamente um aumento de afogamentos',
        'Existe uma terceira variável oculta (calor/verão)',
        'A correlação é baixa porque não chegou a 1,00',
        'A amostra usada no estudo tem obrigatoriamente um erro',
      ],
      correctIndex: 1,
      explanation: 'Correlação mede co-movimento linear, não causalidade: o verão aumenta ambos ao mesmo tempo.',
    },
    {
      question: 'Queres reduzir para metade a margem de erro de um intervalo de confiança a 95%. O que precisas de fazer à amostra n?',
      options: [
        'Duplicar n (2× mais clientes)',
        'Quadruplicar n (4× mais clientes)',
        'Reduzir n para metade para baixar o ruído',
        'Aumentar o nível de confiança para 99%',
      ],
      correctIndex: 1,
      explanation: 'O erro padrão varia com 1 / raiz(n): para dividir a margem por 2, precisas de 2² = 4 vezes mais observações.',
    },
  ],
  'bi-17-simulacao-bootstrap': [
    {
      question: 'No bootstrap, porque tens de reamostrar COM reposição (replace=True)?',
      options: [
        'Para aumentar o número de colunas do DataFrame original',
        'Sem reposição cada amostra teria exatamente os mesmos valores',
        'Porque o NumPy não permite amostrar sem reposição',
        'Para eliminar automaticamente os outliers da amostra',
      ],
      correctIndex: 1,
      explanation: 'Sem reposição, tirar n elementos de n devolve sempre a mesma mediana ou média em todas as iterações.',
    },
    {
      question: 'Em que situação o bootstrap brilha frente à fórmula clássica média ± 1,96 × erro padrão?',
      options: [
        'Quando queres um intervalo de confiança para a mediana ou P90',
        'Quando não tens computador disponível na reunião',
        'Quando a amostra tem apenas 1 único cliente observado',
        'Quando queres provar causalidade sem grupo de controlo',
      ],
      correctIndex: 0,
      explanation: 'O bootstrap calcula intervalos de confiança para qualquer estatística (mediana, P90, rácios) sem exigir normalidade.',
    },
  ],
  'bi-08-teste-ab': [
    {
      question: 'Num teste A/B com 2 milhões de visitas, o novo layout subiu a receita média em +0,01 € com p = 0,0001. O que recomendas?',
      options: [
        'Lançar de imediato porque p < 0,05 prova alto retorno',
        'Avaliar se +0,01 € cobre o custo técnico e de manutenção',
        'Repetir o teste com menos visitas até p subir acima de 0,05',
        'Concluir que a diferença é puro acaso devido à amostra grande',
      ],
      correctIndex: 1,
      explanation: 'Significância estatística não é sinónimo de relevância prática: avalia sempre o impacto financeiro líquido.',
    },
    {
      question: 'Com apenas 40 clientes por grupo e 3 encomendas gigantes (forte assimetria), porque desconfias do teste t clássico?',
      options: [
        'O teste t só funciona corretamente com números negativos ou nulos',
        'Extremos distorcem a média; usa Bootstrap/Mann-Whitney',
        'O teste t exige que os dois grupos tenham exatamente médias iguais',
        'A função math.erfc não aceita amostras abaixo de 100 observações',
      ],
      correctIndex: 1,
      explanation: 'Em amostras pequenas muito assimétricas, a média é frágil; reamostragem (bootstrap/permutação) ou testes sobre medianas são mais seguros.',
    },
  ],
  'bi-11-ab-proporcoes': [
    {
      question: 'A taxa de conversão passou de 10% para 12%. Como deves comunicar isto sem ambiguidade?',
      options: [
        'A taxa de conversão subiu exatamente 2% no total acumulado da loja',
        'Subiu +2 pp (+20% relativo)',
        'A taxa de conversão subiu +20 pontos percentuais no grupo de teste',
        'A taxa de conversão duplicou face ao valor do grupo de controlo',
      ],
      correctIndex: 1,
      explanation: 'Indicar ambos (+2 pp e +20% relativo) elimina qualquer mal-entendido em reuniões de gestão.',
    },
    {
      question: 'Porque corremos um teste A/B em semanas completas (7 ou 14 dias) em vez de parar ao 4.º dia?',
      options: [
        'Para evitar viés de dia da semana e reduzir falsos positivos',
        'Porque a fórmula do teste z só aceita múltiplos de 7',
        'Para garantir que o p-valor acaba sempre abaixo de 0,05',
        'Porque o poder estatístico só existe ao fim de semana',
      ],
      correctIndex: 0,
      explanation: 'O comportamento de segunda-feira difere do de sábado, e espreitar/parar cedo inflaciona o Erro Tipo I.',
    },
  ],
  'bi-15-qui-quadrado-anova': [
    {
      question: 'Uma ANOVA sobre 4 trimestres devolve p = 0,002. O que podes afirmar com segurança apenas com esse número?',
      options: [
        'Todos os 4 trimestres têm médias diferentes entre si',
        'Pelo menos um trimestre difere dos outros; falta ver qual',
        'O 4.º trimestre é obrigatoriamente o mais alto do ano',
        'Os dados seguem uma relação linear perfeita',
      ],
      correctIndex: 1,
      explanation: 'A ANOVA é um teste global; para identificar quais pares diferem olhas para as médias/comparações pós-hoc (ou resíduos no Qui²).',
    },
    {
      question: 'Numa tabela cruzada de Qui-quadrado, uma célula tem resíduo padronizado +3,4. O que significa?',
      options: [
        'Essa combinação ocorreu muito acima do esperado',
        'Houve um erro de soma na coluna total dessa categoria de produtos',
        'Essa célula tem menos de 5 observações e deve ser apagada da tabela',
        'A diferença nessa célula está perfeitamente dentro do ruído normal',
      ],
      correctIndex: 0,
      explanation: 'Resíduos padronizados acima de +2 ou abaixo de -2 apontam exatamente quais células impulsionaram o Qui-quadrado.',
    },
  ],
  'bi-13-regressao-linear': [
    {
      question: 'Ajustaste faturação = 10 + 15 × clientes sobre dias com 8 a 30 clientes (R² = 0,72). Qual previsão é arriscada?',
      options: [
        'Estimar a faturação num dia com 20 clientes',
        'Estimar a faturação num dia com 150 clientes',
        'Interpretar que cada cliente extra vale em média ~15 €',
        'Explicar que 72% da variação diária acompanha o número de clientes',
      ],
      correctIndex: 1,
      explanation: 'Extrapolar muito além do intervalo observado (8–30 clientes) ignora limites físicos de fila, caixa e stock.',
    },
    {
      question: 'Um dia de vendas teve z-score = +3,6. Como o interpretas perante o dono da loja?',
      options: [
        'Faturou 3,6% acima da média anual',
        'Ficou 3,6 desvios padrão acima do habitual: dia excecional',
        'Teve 3,6 vezes menos clientes do que a mediana',
        'O R² do modelo subiu para 3,6',
      ],
      correctIndex: 1,
      explanation: 'Um |z| > 3 sinaliza um evento muito raro que merece investigação (campanha, feriado ou erro de registo).',
    },
  ],
  'bi-16-regressao-multipla': [
    {
      question: 'Ao juntar a variável dezembro ao modelo com clientes, o efeito por cliente caiu de 16,69 € para menos. Porquê?',
      options: [
        'Os clientes compraram menos em dezembro do que no resto do ano',
        'Antes, o coeficiente de clientes absorvia parte do efeito Natal',
        'Adicionar variáveis reduz sempre o R² do modelo',
        'A variável dummy 0/1 anulou os meses de verão',
      ],
      correctIndex: 1,
      explanation: 'É o viés de variável omitida: separar os fatores mostra o efeito de cada um mantendo o resto constante.',
    },
    {
      question: 'Juntas uma coluna com números aleatórios ao modelo e o R² sobe de 0,740 para 0,741. O que te protege desta ilusão?',
      options: [
        'Multiplicar o R² pelo número de linhas da tabela',
        'Olhar para o R² ajustado, que penaliza variáveis inúteis',
        'Retirar a coluna de uns (ordenada na origem) da matriz X',
        'Aumentar o número de variáveis aleatórias para confirmar',
      ],
      correctIndex: 1,
      explanation: 'O R² normal nunca desce quando adicionas variáveis; o R² ajustado só sobe se a nova variável melhorar mesmo o modelo.',
    },
  ],
  'bi-19-series-temporais': [
    {
      question: 'O índice sazonal de sábado é 1,40 e o de terça-feira é 0,75. O que isto orienta na operação?',
      options: [
        'Fechar a mercearia todas as terças-feiras durante o ano inteiro',
        'Reforçar frescos sábado (+40%) e reduzir terça (-25%)',
        'Aumentar o preço do pão em 40% em todos os dias do fim de semana',
        'Ignorar a tendência anual porque a sazonalidade domina tudo na loja',
      ],
      correctIndex: 1,
      explanation: 'Índices sazonais traduzem padrões repetitivos diretamente em planos de encomenda e escala de pessoal.',
    },
    {
      question: 'Porque deves testar a tendência de 2025 com e sem o pico de dezembro antes de prever janeiro?',
      options: [
        'Porque dezembro tem sempre menos dias úteis do que janeiro',
        'Um pico forte na ponta puxa a reta e sobrestima janeiro',
        'Porque np.polyfit falha quando existem 12 meses completos',
        'Para remover o efeito dos sábados da tendência linear',
      ],
      correctIndex: 1,
      explanation: 'Pontos extremos no início ou fim de uma série têm grande alavancagem sobre uma reta de tendência linear.',
    },
  ],
  'bi-14-perguntas-entrevista': [
    {
      question: 'Testas 20 alterações independentes no site com α = 5% e encontras 1 com p = 0,04. O que pensas?',
      options: [
        'Há 96% de certeza absoluta de que essa alteração funciona',
        'Com 20 testes, há ~64% de hipótese de 1 falso positivo ao acaso',
        'Deves lançar logo todas as 20 alterações em conjunto',
        'Basta duplicar o α para 10% para confirmar o resultado',
      ],
      correctIndex: 1,
      explanation: '1 - 0,95^20 ≈ 64%: em testes múltiplos aplica-se correção (ex.: Bonferroni α / 20 = 0,0025) ou replica-se o teste.',
    },
    {
      question: 'Envias um inquérito de satisfação apenas aos clientes que compraram este mês e 94% dão nota máxima. Qual é o viés?',
      options: [
        'Viés de variável omitida',
        'Viés de sobrevivência: faltam os clientes que deixaram de vir',
        'Paradoxo de Simpson por mistura de cidades',
        'Erro de arredondamento por usar percentagens',
      ],
      correctIndex: 1,
      explanation: 'Quem ficou insatisfeito já abandonou a loja e não aparece na amostra de compradores ativos.',
    },
  ],

  // ---- Trilha 7: Nível Profissional ----
  'pro-01-pipeline-etl': [
    {
      question: 'Na arquitetura Bronze → Silver → Gold, porque nunca sobrescreves a camada Bronze?',
      options: [
        'Porque ficheiros CSV não podem ser gravados duas vezes',
        'Mantém o bruto original para reprocessar se uma regra mudar',
        'Porque o Power BI lê diretamente apenas a camada Bronze',
        'Para duplicar o espaço ocupado no repositório Git',
      ],
      correctIndex: 1,
      explanation: 'Se descobrires um bug numa transformação Silver daqui a 2 meses, a Bronze intacta permite reconstruir tudo com rigor.',
    },
    {
      question: 'Além dos dados limpos, o que deve devolver um pipeline ETL profissional em cada execução?',
      options: [
        'Apenas a primeira e a última linha do ficheiro',
        'Contagens de entrada, rejeitadas e válidas (observabilidade)',
        'O código-fonte inteiro impresso no terminal',
        'Uma cópia sem cabeçalho em formato de texto simples',
      ],
      correctIndex: 1,
      explanation: 'Se num dia normal entram 5 000 linhas e rejeitas 5, um salto para 2 000 rejeitadas dispara logo o alerta.',
    },
  ],
  'pro-02-data-quality-tests': [
    {
      question: 'Encontras vendas com produto_id = 99, mas o catálogo só vai até ao id = 15. Que dimensão de Data Quality falhou?',
      options: ['Unicidade', 'Integridade referencial', 'Formatação de texto', 'Ordenação temporal'],
      correctIndex: 1,
      explanation: 'Integridade referencial garante que toda a chave estrangeira em factos corresponde a um registo válido na dimensão.',
    },
    {
      question: 'Em ferramentas como dbt, qual é o teste equivalente a confirmar que não há IDs repetidos numa dimensão?',
      options: ['not_null', 'unique', 'accepted_values', 'relationships'],
      correctIndex: 1,
      explanation: 'unique valida unicidade da chave primária, evitando duplicações silenciosas em JOINs.',
    },
  ],
  'pro-10-rgpd-anonimizacao': [
    {
      question: 'Trocaste o nome e email dos clientes por um hash SHA-256 com sal secreto. Estes dados deixaram de ser pessoais no RGPD?',
      options: [
        'Sim: podem ser publicados livremente no GitHub',
        'Não: dados pseudonimizados continuam abrangidos pelo RGPD',
        'Sim, desde que o hash tenha menos de 16 caracteres',
        'Só são pessoais se incluírem também o número de telefone',
      ],
      correctIndex: 1,
      explanation: 'Pseudonimização reduz risco, mas enquanto existir forma de reidentificar (com sal ou cruzamento), continuam a ser dados pessoais.',
    },
    {
      question: 'Num relatório partilhado por cidade, uma vila tem apenas 2 clientes registados. Que cuidado deves tomar?',
      options: [
        'Mostrar a média exata mas sem o nome da vila',
        'Agrupar localidades pequenas em "Outras" (k-anonimato)',
        'Multiplicar os valores por 10 para disfarçar a escala',
        'Enviar o ficheiro apenas em formato Excel protegido',
      ],
      correctIndex: 1,
      explanation: 'Grupos demasiado pequenos permitem identificar indivíduos por dedução; o k-anonimato evita essa exposição.',
    },
  ],
  'pro-03-coortes-retencao': [
    {
      question: 'O número de clientes novos disparou em março, mas a faturação total estagnou em junho. O que revela uma análise de coortes?',
      options: [
        'Qual é o produto mais caro do catálogo da loja',
        'Se os clientes angariados em março voltaram a comprar ou abandonaram',
        'Qual o dia da semana com maior erro de caixa',
        'Se o SQLite está a usar índice na coluna de data',
      ],
      correctIndex: 1,
      explanation: 'Coortes separam aquisição de retenção: angariar muitos clientes que só compram uma vez esconde um "balde furado".',
    },
    {
      question: 'Como calculas em SQL o mês de coorte (primeiro mês de compra) de cada cliente?',
      options: [
        'MAX(SUBSTR(data, 1, 7)) agrupado por cliente_id',
        'MIN(SUBSTR(data, 1, 7)) agrupado por cliente_id',
        'COUNT(DISTINCT SUBSTR(data, 1, 7)) por cliente_id',
        'AVG(cliente_id) agrupado pelo mês da venda',
      ],
      correctIndex: 1,
      explanation: 'A coorte de um cliente é fixada pelo primeiro período em que realizou a sua estreia na loja (MIN).',
    },
  ],
  'pro-04-sql-performance': [
    {
      question: 'Qual destes filtros de data é SARGable (consegue aproveitar um índice em data)?',
      options: [
        "WHERE SUBSTR(data, 1, 7) = '2025-09'",
        "WHERE data >= '2025-09-01' AND data <= '2025-09-30'",
        "WHERE UPPER(data) LIKE '2025-09%'",
        "WHERE strftime('%m', data) = '09'",
      ],
      correctIndex: 1,
      explanation: 'Manter a coluna limpa do lado esquerdo da comparação permite ao motor ir direto ao intervalo no índice em vez de fazer Full Table Scan.',
    },
    {
      question: 'Ao correr EXPLAIN QUERY PLAN numa tabela de 50 milhões de linhas, que palavra acende o alerta de lentidão?',
      options: ['SEARCH USING INDEX', 'SCAN (Full Table Scan)', 'LIMIT 10', 'ORDER BY'],
      correctIndex: 1,
      explanation: 'SCAN indica leitura completa da tabela linha a linha; SEARCH USING INDEX usa o índice para saltar direto aos registos.',
    },
  ],
  'pro-05-entrevista-sql': [
    {
      question: 'Queres os Top 2 produtos por categoria usando RANK(). Porque não podes escrever WHERE RANK() OVER (...) <= 2 na mesma query?',
      options: [
        'Porque RANK() devolve texto em vez de número inteiro',
        'O WHERE corre antes das Window Functions; usa uma CTE',
        'Porque RANK() não aceita a cláusula PARTITION BY',
        'Em SQL só é possível filtrar rankings usando HAVING',
      ],
      correctIndex: 1,
      explanation: 'Pela ordem lógica do SQL, as Window Functions calculam-se no SELECT; envolve-as numa CTE e filtra WHERE pos <= 2 fora dela.',
    },
    {
      question: 'Numa tabela mensal ordenada por mes, o que devolve LAG(faturacao, 1) OVER (ORDER BY mes) na linha de janeiro (1.º mês)?',
      options: ['0', 'NULL', 'A faturação de dezembro', 'Erro de execução'],
      correctIndex: 1,
      explanation: 'Não existe linha anterior ao primeiro mês, por isso LAG devolve NULL (ou o valor por omissão se passares o 3.º argumento).',
    },
  ],
  'pro-06-caso-executivo': [
    {
      question: 'Para medir o gasto médio anual por cliente numa cidade, qual é o erro clássico ao usar df.groupby("cidade")["sub"].mean()?',
      options: [
        'Calcula a média por linha de venda em vez de por cliente único',
        'Ignora as compras feitas durante os meses de verão',
        'Multiplica o resultado pelo número de categorias existentes',
        'Devolve o resultado em cêntimos em vez de euros',
      ],
      correctIndex: 0,
      explanation: 'Gasto médio por cliente é SUM(sub) / COUNT(DISTINCT cliente_id) — nunca a média de linhas individuais.',
    },
    {
      question: 'O teu script Python deu 26 902,89 € e a query SQL deu 26 902,89 €, mas uma cidade divergiu 200 €. O que suspeitas logo?',
      options: [
        'Diferença de arredondamento entre Python e SQLite',
        'Um filtro diferente ou chave/merge desalinhada nessa cidade',
        'O ficheiro CSV corrompeu-se entre as duas execuções',
        'O pandas não aceita acentos nos nomes de cidades portuguesas',
      ],
      correctIndex: 1,
      explanation: 'Totais globais iguais com detalhe divergente apontam quase sempre para um critério de agrupamento, join ou filtro diferente.',
    },
  ],
  'pro-07-json-exceptions': [
    {
      question: 'Recebes 10 000 registos JSON de uma API e a linha 412 traz um preço corrompido ("N/A"). Como deves tratar o lote?',
      options: [
        'Deixar o programa parar para ninguém usar o resto do ficheiro',
        'Capturar com try/except, registar o erro e seguir o lote',
        'Substituir automaticamente qualquer erro por 100,00 €',
        'Converter o JSON para string única e apagar todas as vírgulas',
      ],
      correctIndex: 1,
      explanation: 'Isolar registos avariados com try/except + log de erros impede falhas totais e dá visibilidade exata do que falhou.',
    },
    {
      question: 'Que função transforma texto JSON recebido de uma API em dicionários e listas nativas de Python?',
      options: ['json.dumps()', 'json.loads()', 'pd.read_csv()', 'dict.parse()'],
      correctIndex: 1,
      explanation: 'json.loads() ("load string") lê texto JSON para objetos Python; json.dumps() faz o caminho inverso.',
    },
  ],
  'pro-08-python-sqlite-dbapi': [
    {
      question: 'Porque é perigoso montar SQL com f-string (f"SELECT * FROM clientes WHERE nome = \'{user}\'")?',
      options: [
        'Porque o SQLite não aceita aspas simples dentro de f-strings',
        'Abre vulnerabilidade crítica de SQL Injection',
        'Torna a consulta 50 vezes mais lenta do que pd.merge()',
        'Impede o pandas de converter o resultado num DataFrame',
      ],
      correctIndex: 1,
      explanation: 'Passar valores separados com marcadores ? (params=(user,)) garante que o motor trata a entrada apenas como dado, nunca como comando SQL.',
    },
    {
      question: 'Qual é a vantagem de combinar sqlite3 + pd.read_sql_query() no mesmo script?',
      options: [
        'Podes agregar/filtrar em SQL e modelar/plotar em pandas',
        'Substitui a necessidade de instalar a biblioteca pandas',
        'Dispensa completamente o uso de cláusulas GROUP BY em SQL',
        'Permite escrever código Python diretamente dentro do Power BI',
      ],
      correctIndex: 0,
      explanation: 'Usar SQL para extração/agregação relacional e pandas para estatística/gráficos tira o melhor de cada ferramenta.',
    },
  ],
  'pro-09-projeto-final': [
    {
      question: 'Num projeto completo para a direção, qual é a ordem de trabalho que evita retrabalho?',
      options: [
        'Desenhar 10 gráficos primeiro e escolher depois a pergunta',
        'Começar pela pergunta de decisão, depois SQL/pandas, gráfico e ação',
        'Treinar logo um modelo de Machine Learning sobre o CSV bruto',
        'Escrever a recomendação antes de validar os números em SQL',
      ],
      correctIndex: 1,
      explanation: 'A pergunta de negócio define o grão dos dados, a métrica certa e o único gráfico necessário para sustentar a decisão.',
    },
    {
      question: 'Qual destas frases é uma recomendação pronta para a reunião de segunda-feira?',
      options: [
        'A tabela vendas_sazonais tem 7 031 linhas ao longo de 12 meses.',
        'Reforçar stock de Charcutaria em dezembro: vende +194% acima da média.',
        'Fizemos um groupby por mês e um gráfico de linhas em matplotlib.',
        'As vendas variam bastante entre o inverno e o fim do ano.',
      ],
      correctIndex: 1,
      explanation: 'Uma recomendação acionável indica o quê, quando, o número que a sustenta e a ação concreta.',
    },
  ],
  'pro-11-portefolio-readme': [
    {
      question: 'Porque deves gerar os números do README a partir do código em vez de os escreveres à mão?',
      options: [
        'Porque o GitHub não aceita números escritos manualmente em Markdown',
        'Evita divergências quando os dados ou filtros são atualizados',
        'Para esconder a metodologia de quem visita o repositório',
        'Porque f-strings traduzem automaticamente o texto para inglês',
      ],
      correctIndex: 1,
      explanation: 'Um único número no README que não bate certo com o caderno quebra imediatamente a confiança de um recrutador técnico.',
    },
    {
      question: 'Qual é o tamanho ideal de um README executivo de projeto de dados?',
      options: [
        'Mais de 300 linhas com todo o código copiado para o texto',
        'Curto e direto (~30–40 linhas) com conclusões, gráfico e links',
        'Apenas uma frase com o nome do curso onde foi feito',
        'Só a lista de comandos pip install sem mostrar resultados',
      ],
      correctIndex: 1,
      explanation: 'Um recrutador decide nos primeiros 1–2 minutos: conclusões + gráfico no topo, detalhes técnicos nos cadernos.',
    },
  ],
  'pro-12-desafio-recrutamento': [
    {
      question: 'Em loja_online_pedidos.csv, a faturação líquida caiu em março, mas o número de pedidos tentados manteve-se estável. O que investigas a seguir?',
      options: [
        'Apenas o total de pedidos sem filtrar por estado',
        'Taxa de cancelamento e ticket médio segmentados por canal',
        'O nome alfabético dos clientes que compraram em janeiro',
        'Mudar a paleta de cores do relatório executivo',
      ],
      correctIndex: 1,
      explanation: 'Na decomposição Faturação = Pedidos × (1 - Cancelamento) × Ticket, se Pedidos ficou igual, a queda está no cancelamento ou no ticket.',
    },
    {
      question: 'Descobres que os cancelamentos dispararam abruptamente só no canal App a partir de um dia específico de março. O que sugere?',
      options: [
        'Sazonalidade normal de primavera em todos os clientes',
        'Falha técnica localizada no checkout/pagamento da App',
        'Que deves encerrar definitivamente o canal Web',
        'Que a amostra de 2 700 pedidos é demasiado pequena para concluir',
      ],
      correctIndex: 1,
      explanation: 'Uma quebra súbita num único canal e numa data exata aponta para incidente técnico/release — prioridade imediata para a equipa de produto/engenharia.',
    },
  ],
};
