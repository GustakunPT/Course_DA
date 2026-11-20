// Teoria aplicada ("Explicado com calma") e erro típico real para as etapas centrais de SQL.
// Cada errorDemo é corrido nos testes em SQLite (sql.js) para confirmar a mensagem real do motor.
import type { Lesson } from './types';

type Extra = Pick<Lesson, 'explained' | 'errorDemo'>;

export const sqlExplained: Record<string, Extra> = {
  'sql-04-groupby': {
    explained: [
      'Antes de escrever um GROUP BY, pergunta sempre qual é o "grão" da tabela: em vendas cada linha é uma venda individual (5 078 linhas). Quando escreves GROUP BY produto, estás a mudar o grão para 1 linha por produto (15 linhas), exatamente como se despejasses os talões em 15 caixas etiquetadas e somasses cada caixa.',
      'Exemplo pequeno com 4 vendas: (Azeite, 7.50 €), (Pão, 0.50 €), (Azeite, 15.00 €) e (Pão, 0.25 €). Com GROUP BY produto, o motor junta as duas linhas de Azeite numa só (COUNT = 2, SUM = 22.50 €, AVG = 11.25 €) e as duas de Pão noutra (COUNT = 2, SUM = 0.75 €).',
      'Por causa dessa mudança de grão, qualquer coluna que apareça no SELECT fora de SUM/COUNT/AVG/MIN/MAX tem de estar no GROUP BY. Se pedires data junto com GROUP BY produto sem agrupar por data, qual das 300 datas de Azeite deveria o motor mostrar? PostgreSQL e BigQuery bloqueiam logo a query; o SQLite escolhe uma linha arbitrária em silêncio.',
      'Na decisão de negócio, o GROUP BY responde a perguntas de alocação de recursos: onde está concentrada a receita (por produto, loja ou mês) e que dia teve pico operacional para escalar equipa e stock.',
    ],
    errorDemo: {
      code: 'SELECT produto, SUM(quantidade, preco)\nFROM vendas\nGROUP BY produto;',
      message: 'wrong number of arguments to function SUM()',
      fix: 'SUM() recebe uma única expressão numérica. Para somar faturação, multiplica primeiro dentro dos parênteses: SUM(quantidade * preco).',
    },
  },
  'sql-05-having': {
    explained: [
      'A confusão entre WHERE e HAVING desaparece quando recordas a ordem real de execução do SQL: primeiro FROM escolhe a tabela, depois WHERE filtra linhas brutas, depois GROUP BY forma os grupos e só no fim HAVING filtra esses grupos já somados.',
      "Exemplo pequeno com 4 vendas de dois produtos: Azeite vendeu 100 € em junho e 200 € em julho; Pão vendeu 10 € em junho e 15 € em julho. Se quiseres só vendas de julho (WHERE data >= '2025-07-01'), cortas metade das linhas antes de somar. Se quiseres só produtos com total acima de 50 € (HAVING SUM(valor) > 50), o motor precisa primeiro de somar cada caixa para ver que Azeite soma 200 € e Pão apenas 15 €.",
      'Podes — e deves — usar WHERE e HAVING juntos: o WHERE limpa logo linhas irrelevantes (ex.: pedidos cancelados ou anos antigos), poupando memória e tempo, enquanto o HAVING aplica o critério sobre a métrica agregada (ex.: clientes com >= 5 compras ou produtos com faturação > 2 000 €).',
      'Na prática diária, HAVING COUNT(*) > 1 é também o comando mais rápido de auditoria para apanhar duplicados antes de ligar uma tabela ao Power BI.',
    ],
    errorDemo: {
      code: 'SELECT produto, SUM(quantidade) AS unidades\nFROM vendas\nWHERE SUM(quantidade) > 880\nGROUP BY produto;',
      message: 'misuse of aggregate: SUM()',
      fix: 'WHERE corre antes do GROUP BY, quando SUM(quantidade) ainda não existe. Passa essa condição para depois do GROUP BY usando HAVING SUM(quantidade) > 880.',
    },
  },
  'sql-06-joins': {
    explained: [
      'Em bases de dados bem modeladas, os nomes e moradas dos clientes vivem numa tabela separada (clientes) para não repetir "Ana Silva, Porto" em 50 talões diferentes. O JOIN volta a ligar cada linha de vendas à ficha correspondente usando a chave partilhada (v.cliente_id = c.id).',
      'Exemplo pequeno: imagina 3 clientes (#1 Ana, #2 Bruno, #3 Carla) e 2 vendas (ambas do cliente #1). Um INNER JOIN devolve apenas 2 linhas (só a Ana, que comprou). Um LEFT JOIN clientes c LEFT JOIN vendas v devolve 4 linhas: as 2 compras da Ana mais 1 linha para Bruno e 1 para Carla com NULL nas colunas de vendas — perfeito para descobrir clientes inativos.',
      "Cuidado com dois erros clássicos de produção: 1) num LEFT JOIN, pôr uma condição da tabela da direita no WHERE (ex.: WHERE v.produto = 'Azeite') apaga as linhas NULL e converte o LEFT JOIN num INNER JOIN escondido; 2) juntar duas tabelas onde a chave se repete dos dois lados multiplica linhas e inflaciona a faturação. Compara sempre COUNT(*) e SUM() antes e depois do JOIN.",
      'Na decisão de negócio, INNER JOIN responde a "quanto faturou cada cidade ou categoria?", enquanto LEFT JOIN com IS NULL responde a "que clientes nunca compraram este artigo ou deixaram de visitar a loja?".',
    ],
    errorDemo: {
      code: 'SELECT id, nome, produto\nFROM vendas v\nINNER JOIN clientes c ON c.id = v.cliente_id\nLIMIT 5;',
      message: 'ambiguous column name: id',
      fix: 'Tanto vendas como clientes têm uma coluna chamada id. Qualifica sempre com o alias da tabela: v.id ou c.id.',
    },
  },
  'sql-07-case-coalesce': {
    explained: [
      'Nem sempre precisas de exportar para Python ou Excel para criar escalões de negócio ou limpar valores em falta. O CASE WHEN funciona como um if / elif / else avaliado linha a linha (ou grupo a grupo) dentro da própria consulta SQL.',
      "Exemplo pequeno com 3 clientes que gastaram 450 €, 210 € e 80 €: com CASE WHEN gasto >= 300 THEN 'Ouro' WHEN gasto >= 150 THEN 'Prata' ELSE 'Bronze' END, o motor testa de cima para baixo e pára no primeiro ramo verdadeiro. Se trocasses a ordem e testasses >= 150 antes de >= 300, o cliente de 450 € ficaria mal classificado como Prata.",
      'Já COALESCE(valor, 0) e NULLIF(divisor, 0) resolvem o pesadelo silencioso dos valores nulos e das divisões por zero: qualquer conta com NULL dá NULL (10 + NULL = NULL). Envolver colunas opcionais em COALESCE(..., 0) e denominadores em NULLIF(..., 0) impede que relatórios rebentem quando um dia não tem vendas.',
      "Na decisão de negócio, o CASE WHEN permite criar bandeiras 1/0 (SUM(CASE WHEN cidade = 'Porto' THEN 1 ELSE 0 END)) para comparar segmentos lado a lado sem correr duas queries separadas.",
    ],
    errorDemo: {
      code: "SELECT nome,\n  CASE WHEN preco > 5 THEN 'Caro' ELSE 'Normal'\nFROM produtos;",
      message: 'syntax error',
      fix: "Todo o bloco CASE WHEN tem de fechar obrigatoriamente com a palavra END (ex.: ... ELSE 'Normal' END AS escalao).",
    },
  },
  'sql-08-cte-windows': {
    explained: [
      'A maior barreira entre SQL básico e SQL profissional é perceber a diferença entre GROUP BY e Window Functions. O GROUP BY esmaga várias linhas numa só; a Window Function calcula sobre uma "janela" de linhas (OVER (...)) mantendo todas as linhas intactas, como a coluna de saldo acumulado num extrato bancário.',
      'Exemplo pequeno com 3 meses: Jan (100 €), Fev (150 €), Mar (200 €). A expressão SUM(fat) OVER (ORDER BY mes) devolve 3 linhas com acumulados 100 €, 250 € e 450 €. Se acrescentares PARTITION BY categoria, o acumulado (ou o ranking) recomeça do zero em cada categoria.',
      'As três funções de ranking respondem a necessidades distintas: num empate (100 €, 100 €, 80 €), RANK() dá 1, 1, 3; DENSE_RANK() dá 1, 1, 2; ROW_NUMBER() dá 1, 2, 3 sem empates. Por isso ROW_NUMBER() OVER (PARTITION BY cliente_id ORDER BY data DESC, id DESC) = 1 dentro de uma CTE é o padrão universal para deduplicar tabelas e ficar apenas com o registo mais recente.',
      'Como o SQL não permite filtrar diretamente Window Functions no WHERE da mesma consulta, a CTE (WITH passo1 AS (...)) serve de rascunho limpo: calculas pos ou rn lá dentro e aplicas WHERE rn = 1 ou WHERE pos <= 3 na query final.',
    ],
    errorDemo: {
      code: 'SELECT nome, preco,\n  RANK() OVER (ORDER BY preco DESC) AS pos\nFROM produtos\nWHERE RANK() OVER (ORDER BY preco DESC) <= 3;',
      message: 'misuse of window function RANK()',
      fix: 'Window functions só correm depois do WHERE. Coloca o RANK() numa CTE (WITH r AS (...)) e filtra WHERE pos <= 3 na consulta exterior.',
    },
  },
  'sql-09-subqueries-exists-union': {
    explained: [
      'Muitas perguntas de negócio têm dois passos lógicos: "que artigos custam acima da média da loja?" exige descobrir primeiro a média (2,09 €) e só depois filtrar. Uma subquery escalar entre parênteses — WHERE preco > (SELECT AVG(preco) FROM produtos) — calcula esse valor dinâmico sem nunca o escreveres à mão.',
      'Exemplo pequeno para EXISTS vs NOT IN: imagina 3 clientes (#1, #2, #3) e uma tabela de vendas com cliente_id = 1 e um registo sujo com NULL. A query WHERE id NOT IN (1, NULL) avalia "2 != 1 AND 2 != NULL", que dá UNKNOWN em SQL — e devolve 0 linhas sem avisar! Já WHERE NOT EXISTS (SELECT 1 FROM vendas v WHERE v.cliente_id = c.id) devolve corretamente #2 e #3 e pára logo na primeira correspondência.',
      'Para empilhar resultados de duas consultas (ex.: comparar série base vs série sazonal, ou juntar vendas de 2024 e 2025), usa UNION ALL: ambos os SELECT têm de devolver o mesmo número de colunas pela mesma ordem. Evita UNION simples quando sabes que não há repetidos, porque obriga o motor a ordenar tudo para remover duplicados.',
      'Na decisão de negócio, NOT EXISTS é a ferramenta mais segura para listas de reativação ("clientes que compraram no 1.º semestre mas não voltaram no 2.º") sem o risco silencioso dos NULL.',
    ],
    errorDemo: {
      code: 'SELECT nome, preco FROM produtos\nUNION ALL\nSELECT nome FROM clientes;',
      message: 'do not have the same number of result columns',
      fix: 'Em UNION / UNION ALL todas as consultas empilhadas têm de devolver exatamente o mesmo número de colunas (aqui 2 à esquerda vs 1 à direita).',
    },
  },
  'sql-10-medias-moveis-rfm': {
    explained: [
      'Os números mensais crus sobem e descem por causa de feriados, semanas com 5 sábados ou promoções pontuais. Uma média móvel de 3 meses usa ROWS BETWEEN 2 PRECEDING AND CURRENT ROW para tirar a média do mês atual com os 2 anteriores, suavizando o ruído e revelando se a loja está realmente a crescer.',
      'Exemplo pequeno com 4 meses: Jan (100 €), Fev (140 €), Mar (120 €), Abr (180 €). A média móvel de 3 meses dá: Jan = 100 € (só 1 mês disponível), Fev = 120 € (média de Jan–Fev), Mar = 120 € (Jan–Mar) e Abr = 146,67 € (Fev–Abr). Repara que ROWS BETWEEN conta linhas, não meses de calendário — se faltar um mês na tabela, a janela salta um buraco.',
      'Na mesma etapa constróis a matriz RFM (Recência, Frequência, Valor Monetário), o modelo clássico de retenção no retalho: Recência mede há quantos dias o cliente não compra (menor = melhor), Frequência mede em quantos dias distintos visitou a loja, e Monetário soma quanto gastou no total.',
      'Na decisão de negócio, o RFM transforma uma lista plana de 120 clientes em planos de ação distintos: recompensar "Campeões" (R baixo, F e M altos) sem dar descontos desnecessários, e enviar cupões de regresso a clientes "Em Risco" (F e M altos no passado, mas R a disparar).',
    ],
    errorDemo: {
      code: 'SELECT data,\n  AVG(preco) OVER (ORDER BY data ROWS BETWEEN CURRENT ROW AND 2 PRECEDING) AS mm3\nFROM vendas\nLIMIT 5;',
      message: 'unsupported frame specification',
      fix: 'Na cláusula ROWS BETWEEN, o limite mais antigo vem sempre primeiro: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW.',
    },
  },
};
