// Teoria aplicada ("Explicado com calma") e erro típico real para toda a trilha de Estatística (12 etapas)
// e para os 4 blocos centrais de modelação/DAX/tempo em Visualização & BI.
// Cada errorDemo é corrido nos testes contra o motor real (Pyodide ou SQLite).
import type { Lesson } from './types';

type Extra = Pick<Lesson, 'explained' | 'errorDemo'>;

export const statsBiExplained: Record<string, Extra> = {
  // ---- Visualização & BI (modelação dimensional, DAX e inteligência de tempo) ----
  'bi-04-star-schema': {
    explained: [
      'Quando começas no Excel, é natural juntar todas as colunas numa única tabela gigante com 40 colunas. No Power BI ou num Data Warehouse, esse "tabelão" repete milhões de vezes o nome e morada do mesmo cliente, desperdiça memória e torna filtros e relações frágeis.',
      'Exemplo pequeno: em vez de escrever "Cliente 107 · Ana Silva · Porto" em 50 linhas de vendas, a tabela de Factos (fVendas) guarda apenas data, cliente_id, produto_id, quantidade e preco — só números e chaves. As Dimensões (dClientes, dProdutos, dCalendario) guardam uma única linha por entidade e ligam-se de 1 para muitos (1:*) à tabela de Factos.',
      'A direção da seta no relacionamento importa: a Dimensão filtra o Facto (unidirecional). Quando clicas em "Porto" num filtro do relatório, dClientes filtra fVendas para mostrar só vendas do Porto; evita relações bidirecionais porque criam caminhos ambíguos quando tens várias tabelas de factos (ex.: Vendas e Orçamento).',
      'Na decisão de negócio, um Star Schema limpo permite acrescentar uma nova métrica (como margem ou metas mensais) em minutos sem partir nenhum gráfico existente.',
    ],
    errorDemo: {
      code: 'SELECT categoria, ROUND(SUM(quantidade * preco), 2)\nFROM vendas\nINNER JOIN produtos ON id = produto_id\nGROUP BY categoria;',
      message: 'ambiguous column name: preco',
      fix: 'Tanto a tabela de factos (vendas) como a dimensão (produtos) têm colunas preco e id. Usa aliases claros: v.preco e p.id = v.produto_id.',
    },
  },
  'bi-05-excel-dax': {
    explained: [
      'A diferença mais importante entre Excel clássico e Power BI (DAX) está entre coluna calculada e medida. Uma coluna calculada corre linha a linha quando os dados são carregados e ocupa memória para sempre; uma medida só calcula na hora em que o utilizador interage com um cartão, gráfico ou filtro.',
      'Exemplo pequeno: imagina 2 vendas — 2 unidades a 5 € (10 €) e 4 unidades a 1 € (4 €). O total verdadeiro é 14 €. Se em DAX escreveres SUM(quantidade) * SUM(preco), o motor soma (2 + 4) × (5 + 1) = 36 € — completamente errado! Para multiplicar primeiro linha a linha e só depois somar, usas o iterador SUMX(vendas, vendas[quantidade] * vendas[preco]) = 14 €.',
      'Já CALCULATE([Medida], filtro) é a função mais poderosa do DAX porque muda o contexto de filtro antes de calcular. Combinada com ALL(produtos), permite calcular a quota de cada categoria: DIVIDE([Faturação], CALCULATE([Faturação], ALL(produtos)), 0).',
      'Na prática profissional, nunca confies cegamente num dashboard novo: confirma 3 totais-chave do Power BI (Faturação total, Clientes ativos, Top categoria) com uma consulta SQL de reconciliação.',
    ],
    errorDemo: {
      code: 'SELECT cidade, ROUND(SUM(quantidade * preco), 2)\nFROM vendas\nGROUP BY cidade;',
      message: 'no such column: cidade',
      fix: 'cidade vive na dimensão clientes, não na tabela de factos vendas. Liga as duas tabelas (INNER JOIN clientes c ON c.id = v.cliente_id) — no Power BI, o relacionamento 1:* faz essa ponte automaticamente.',
    },
  },
  'bi-18-inteligencia-tempo': {
    explained: [
      'Um número isolado ("faturámos 2 350 € em outubro") raramente diz se o negócio está bem ou mal. A inteligência de tempo coloca cada mês em perspetiva com três lentes complementares: o acumulado do ano (YTD), a variação face ao mês anterior (MoM) e a média móvel de 3 meses.',
      'Exemplo pequeno com 3 meses: Jan = 1 000 €, Fev = 1 200 €, Mar = 1 140 €. Em março: YTD = 1 000 + 1 200 + 1 140 = 3 340 € (quanto já acumulámos na meta anual); MoM = (1 140 - 1 200) / 1 200 = -5,0% (abrandou face a fevereiro); MM3 = (1 000 + 1 200 + 1 140) / 3 = 1 113,33 € (tendência suavizada).',
      'No Power BI, funções como TOTALYTD, DATEADD e DATESINPERIOD exigem uma tabela Calendário contínua (todos os dias de 1 de janeiro a 31 de dezembro, sem falhas), marcada como "Tabela de Datas". Se usares a coluna de data da tabela de vendas e houver um domingo sem vendas, as funções de tempo devolvem valores errados ou em branco.',
      'Na decisão de negócio, o YTD mostra se vais atingir o orçamento do ano, o MoM apanha quedas bruscas cedo e a média móvel impede reações exageradas a uma semana isolada.',
    ],
    errorDemo: {
      code: 'fat_atual = 1200.0\nfat_anterior = 0.0\nvariacao_mom = (fat_atual - fat_anterior) / fat_anterior',
      message: 'ZeroDivisionError: division by zero',
      fix: 'No primeiro mês ou numa categoria nova o mês anterior é 0 (ou vazio). Em Python protege com if fat_anterior > 0; em DAX usa sempre DIVIDE(atual - anterior, anterior, 0).',
    },
  },
  'bi-22-powerbi-dax-relatorio': {
    explained: [
      'O segredo de um relatório Power BI limpo é compor medidas pequenas umas dentro das outras, como blocos de Lego. Em vez de repetires SUMX(Pedidos, Pedidos[quantidade] * Pedidos[preco_unit]) em cinco fórmulas, crias uma medida base [Valor Bruto] e reutilizas [Valor Bruto] dentro de [Faturação Líquida] e [Quota Web %].',
      'Exemplo pequeno do contexto de filtro em CALCULATE: imagina 3 pedidos concluídos (Web: 200 €, App: 100 €) e 1 cancelado (Web: 50 €). Sem filtro, [Valor Bruto] dá 350 €. Com CALCULATE([Valor Bruto], Pedidos[estado] = "Concluído"), o resultado passa a 300 € mesmo que o utilizador não tenha posto um filtro de estado na página.',
      'Quando divides duas medidas para obter percentagens ou tickets médios (ex.: [Faturação Web] / [Faturação Líquida]), usa sempre DIVIDE(a, b, 0) em vez do operador /. Se o utilizador escolher uma combinação de filtros sem vendas, / mostra "Infinity" ou erro no cartão, enquanto DIVIDE devolve 0 ou branco limpo.',
      'Na decisão de negócio, construir medidas explícitas reutilizáveis garante que todos os gráficos e equipas da empresa usam exatamente a mesma definição de Faturação Líquida e Taxa de Cancelamento.',
    ],
    errorDemo: {
      code: 'faturacao_web = 12000.0\nfaturacao_liquida = 0.0\nquota_web_pct = (faturacao_web / faturacao_liquida) * 100',
      message: 'ZeroDivisionError: division by zero',
      fix: 'Quando um filtro deixa o denominador a zero, a divisão direta rebenta. Em DAX usa DIVIDE([Faturação Web], [Faturação Líquida], 0); em Python valida o denominador antes de dividir.',
    },
  },

  // ---- Trilha 6: Estatística (todas as 12 etapas) ----
  'bi-01-media-mediana': {
    explained: [
      'A média e a mediana respondem a duas perguntas diferentes que muitas pessoas confundem. A média divide o bolo inteiro igualmente por todos; a mediana ordena toda a gente em fila e olha para o cliente do meio — é o "caso típico".',
      'Exemplo pequeno com 5 clientes que gastam [2 €, 3 €, 4 €, 5 €, 46 €]: a soma é 60 €, logo a média é 12,00 €, mas 4 em cada 5 clientes gastaram 5 € ou menos! A mediana é 4,00 €, que descreve muito melhor o cliente habitual. O desvio padrão mede quão espalhados estão os valores à volta da média: aqui dispara por causa dos 46 €.',
      'Sempre que a média estiver claramente acima da mediana (como na Mercearia: 5,30 € vs 3,50 €), estás perante uma distribuição assimétrica positiva (cauda longa à direita) — típica de vendas, salários e tempos de resposta.',
      'Na decisão de negócio, definir uma promoção "oferta a partir da média de 12 €" no exemplo acima deixaria de fora 80% dos clientes. Reportar Média + Mediana (P50) + P90 protege a gerência de decisões baseadas numa ilusão estatística.',
    ],
    errorDemo: {
      code: 'import statistics\nstatistics.stdev([5.30])',
      message: 'StatisticsError: stdev requires at least two data points',
      fix: 'O desvio padrão amostral divide por (n - 1), por isso precisa de pelo menos 2 valores para medir dispersão.',
    },
  },
  'bi-02-quartis-outliers': {
    explained: [
      'Quando os dados têm valores extremos, o desvio padrão também fica inflacionado. Os quartis resolvem o problema ignorando as pontas: Q1 marca os 25% mais baixos, Q2 é a mediana (50%) e Q3 marca os 75%. Os 50% do meio vivem todos dentro do intervalo IQR = Q3 - Q1.',
      'Exemplo pequeno com 5 compras ordenadas: [1 €, 2 €, 3 €, 4 €, 100 €]. Aqui Q1 = 2 €, Q3 = 4 €, logo IQR = 4 - 2 = 2 €. A regra de Tukey define o limite superior em Q3 + 1,5 × IQR = 4 + 3 = 7 €. A compra de 100 € ultrapassa de longe os 7 € e acende o sinal de outlier, sem ter distorcido a régua IQR.',
      'O erro mais comum de quem aprende esta regra é apagar automaticamente tudo o que passa o limiar. Há dois tipos opostos de outliers: erros técnicos (preço -1,00 €, quantidade 99999) que devem ser corrigidos/removidos, e fenómenos reais de negócio (um restaurante que compra 5 garrafões de Azeite) que representam clientes VIP.',
      'Na decisão de negócio, separar os outliers num segmento próprio permite estudar o cliente habitual sem ruído e criar condições comerciais dedicadas para as compras grossistas.',
    ],
    errorDemo: {
      code: 'import pandas as pd\ns = pd.Series([1.0, 2.0, 3.0, 4.0, 100.0])\ns.quantile(75)',
      message: 'ValueError: percentiles should all be in the interval [0, 1]',
      fix: 'Em pandas, .quantile() recebe proporções entre 0 e 1, não percentagens: usa s.quantile(0.75) para Q3 e s.quantile(0.25) para Q1.',
    },
  },
  'bi-12-probabilidade-simpson': {
    explained: [
      'A probabilidade condicional P(A | B) restringe o universo apenas aos casos onde B aconteceu: em vez de dividir por todos os cestos da loja, divides apenas pelos cestos que já têm Leite. O Lift compara essa taxa condicional com a taxa geral de A — se Lift = 1,8, quem compra Leite tem 80% mais probabilidade de levar Café do que um cliente qualquer.',
      'Exemplo pequeno da regra de Bayes com números inteiros (muito mais fácil do que fórmulas!): imagina 1 000 pessoas à porta da loja, onde 1% são ladrões (10 ladrões e 990 honestos). Um alarme com 95% de sensibilidade e 5% de falsos positivos dispara para ~9,5 ladrões, mas também dispara por engano para 5% × 990 = 49,5 honestos! Total de alertas = 59, dos quais só 9,5 (~16%) são ladrões reais.',
      'O Paradoxo de Simpson acontece quando misturas grupos de tamanhos muito diferentes: uma campanha pode converter melhor na Loja A (60% vs 50%) e também melhor na Loja B (20% vs 10%), mas perder no total se quase todos os clientes da campanha tiverem caído na Loja B, que converte pouco.',
      'Na decisão de negócio, Bayes evita desperdiçar horas de equipa a investigar alertas de fraude com baixa taxa-base, e verificar segmentos antes de agregar protege-te contra o Paradoxo de Simpson.',
    ],
    errorDemo: {
      code: 'cestos_com_leite = 0\ncestos_leite_e_cafe = 0\np_cafe_dado_leite = cestos_leite_e_cafe / cestos_com_leite',
      message: 'ZeroDivisionError: division by zero',
      fix: 'Uma probabilidade condicional P(A | B) só existe quando há casos onde B aconteceu (denominador > 0). Confirma sempre o tamanho do subgrupo antes de dividir.',
    },
  },
  'bi-09-correlacao-confianca': {
    explained: [
      'A correlação de Pearson (r, entre -1 e +1) mede apenas quão bem uma linha reta descreve a relação entre duas variáveis. Atenção dupla: r ≈ 0 não garante ausência de relação (pode ser uma curva em U, como temperatura vs consumo), e r = 0,85 nunca prova que X causa Y (pode existir uma terceira variável escondida, como o mês de dezembro ou o tamanho da família).',
      'Exemplo pequeno de intervalo de confiança (IC 95%): numa amostra de n = 100 compras com média 5,30 € e desvio padrão 4,00 €, o erro padrão da média é 4,00 / raiz(100) = 0,40 €. O IC 95% fica 5,30 ± 1,96 × 0,40 = [4,52 €, 6,08 €]. Se quadruplicares a amostra para n = 400, o erro padrão cai para metade (0,20 €) e o intervalo encolhe para [4,91 €, 5,69 €].',
      'Repara na diferença crucial entre desvio padrão (variabilidade entre clientes individuais — não diminui com mais dados) e erro padrão (incerteza sobre a média — encolhe com 1 / raiz(n)).',
      'Na decisão de negócio, apresentar "o ticket médio é 5,30 € (IC 95%: 5,14 € a 5,46 €)" em vez de um número nu mostra rigor e evita que a gerência tome decisões com base em ruído de amostras pequenas.',
    ],
    errorDemo: {
      code: 'import pandas as pd\ndf = pd.DataFrame({"sub": [2.0, 5.0, 8.0]})\ndf.sample(10, random_state=42)',
      message: 'Cannot take a larger sample than population',
      fix: 'Sem reposição (replace=False por omissão), não podes tirar 10 linhas de uma tabela com 3. Usa n <= len(df) ou replace=True (bootstrap).',
    },
  },
  'bi-17-simulacao-bootstrap': {
    explained: [
      'As fórmulas clássicas de intervalo de confiança (média ± 1,96 × erro padrão) assumem amostras suficientemente grandes e funcionam bem para médias, mas não existem fórmulas simples para a mediana, o percentil 90 ou um rácio entre duas métricas. A simulação por computador resolve isso diretamente.',
      'Exemplo pequeno de Bootstrap: tens só 5 vendas [2 €, 3 €, 4 €, 5 €, 20 €] (mediana = 4 €). Para estimar a incerteza dessa mediana, sorteias 5 valores dessa mesma lista COM reposição (ex.: [2, 4, 4, 20, 3] → mediana 4; [5, 20, 20, 4, 5] → mediana 5) e repetes 2 000 vezes. Os percentis 2,5% e 97,5% das 2 000 medianas formam o teu intervalo de confiança a 95%.',
      'O teste de permutação usa o mesmo espírito sem precisar de fórmulas de t ou z: se não houvesse diferença entre fim de semana e dias úteis, trocar os rótulos "fim de semana / dia útil" ao acaso não mudaria nada. Baralhas 2 000 vezes e contas em que fração das vezes saiu por acaso uma diferença tão grande como a real — essa fração é o p-valor.',
      'Na decisão de negócio, o bootstrap e a permutação permitem validar medianas, taxas e métricas de receita assimétricas sem ficar preso às premissas da distribuição normal.',
    ],
    errorDemo: {
      code: 'import numpy as np\nrng = np.random.default_rng(42)\nrng.choice([2.0, 3.0, 4.0], size=5, replace=False)',
      message: 'Cannot take a larger sample than population',
      fix: 'No bootstrap tens obrigatoriamente de reamostrar COM reposição (replace=True, o valor por omissão em rng.choice). Sem reposição só baralhas os mesmos elementos.',
    },
  },
  'bi-08-teste-ab': {
    explained: [
      'Um teste A/B coloca duas versões em competição justa para responder a uma única pergunta: a diferença que observámos é efeito real ou ruído do acaso? O rácio t = (média A - média B) / erro padrão compara diretamente o tamanho do sinal (numerador) com o tamanho do ruído (denominador).',
      'Exemplo pequeno: o grupo A teve média 5,00 € e o grupo B teve média 5,60 € (diferença = +0,60 €). Se o erro padrão for 0,25 €, então t = 0,60 / 0,25 = 2,40 → p-valor ≈ 0,016 (< 0,05): há prova estatística de diferença. Se o erro padrão fosse 0,50 € (amostra pequena), t = 1,20 → p ≈ 0,23: o mesmo +0,60 € fica indistinguível de acaso.',
      'Pensa nos dois erros possíveis como um tribunal: Erro Tipo I (α = 5%, falso positivo) é lançar uma campanha que na verdade não aumenta vendas (gastas orçamento à toa); Erro Tipo II (β, falso negativo) é descartar uma campanha vencedora porque testaste com poucos clientes. Além disso, em vendas muito assimétricas com amostra pequena, poucos cestos gigantes distorcem a média — aí prefere Bootstrap ou teste de Mann-Whitney U em vez do teste t.',
      'Na decisão de negócio, p < 0,05 é só o primeiro filtro: pergunta sempre "e daí? +0,05 € por cesto cobre o custo do desconto e da implementação?".',
    ],
    errorDemo: {
      code: 'import statistics\na, b = [5.0, 5.0, 5.0], [5.0, 5.0, 5.0]\nerro_padrao = (statistics.variance(a) / len(a) + statistics.variance(b) / len(b)) ** 0.5\nt = (statistics.mean(a) - statistics.mean(b)) / erro_padrao',
      message: 'ZeroDivisionError: division by zero',
      fix: 'Quando todos os valores nos dois grupos são idênticos, a variância e o erro padrão são 0. Confirma que erro_padrao > 0 antes de dividir.',
    },
  },
  'bi-11-ab-proporcoes': {
    explained: [
      'Quando o objetivo é um resultado binário (comprou / não comprou, clicou / não clicou, voltou / não voltou), cada linha vale 1 ou 0 e a média dessa coluna é a taxa de conversão (p). O teste z compara duas taxas usando a proporção conjunta sob a hipótese nula de igualdade.',
      'Exemplo pequeno de poder e tamanho de amostra: queres subir a conversão de 10% (p1 = 0,10) para 12% (p2 = 0,12, ou +2 pontos percentuais = +20% relativo). Com α = 5% e poder 80%, precisas de n ≈ (1,96 + 0,84)² × (0,10×0,90 + 0,12×0,88) / 0,02² ≈ 3 835 visitas por grupo (7 670 no total). Se só quisesses detetar +1 pp (10% → 11%), o denominador fica 4 vezes menor e precisarias de ~14 700 visitas por grupo!',
      'Nunca lances um teste A/B sem definir antes três coisas: 1) tamanho mínimo de amostra (protege contra Erro Tipo II), 2) duração em semanas inteiras (7 ou 14 dias, evitando misturar segundas-feiras com sábados) e 3) métricas guardrail (ex.: a conversão subiu, mas a taxa de cancelamento ou devolução disparou?).',
      'Na comunicação executiva, distingue sempre pontos percentuais (pp) de variação relativa (%): dizer "a conversão subiu 2%" quando passou de 10% para 12% deixa a direção sem saber se foi para 10,2% ou 12%.',
    ],
    errorDemo: {
      code: 'p1, p2 = 0.15, 0.15\nn = (1.96 + 0.84) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2',
      message: 'ZeroDivisionError: division by zero',
      fix: 'Para calcular o tamanho de amostra tens de definir um efeito mínimo detetável diferente de zero (p2 != p1, ex.: +1 pp ou +2 pp).',
    },
  },
  'bi-15-qui-quadrado-anova': {
    explained: [
      'Se tentares comparar 6 categorias fazendo testes A/B par a par, terias 15 testes separados e mais de 50% de hipótese de apanhar um falso positivo só por insistência. O Qui-quadrado (para contagens de categorias) e a ANOVA (para médias numéricas) fazem um único teste global primeiro.',
      'Exemplo pequeno de Qui-quadrado: se 100 vendas de Verão e 100 de Inverno tivessem exatamente a mesma mistura, e o total global fosse 40% Bebidas / 60% Mercearia, esperaríamos 40 Bebidas em cada estação. Se no Verão observarmos 55 Bebidas e no Inverno 25, o afastamento (observado - esperado)² / esperado dispara em todas as células, revelando que a categoria depende da estação.',
      'Na ANOVA a lógica é idêntica ao teste t, mas para 3+ grupos: a estatística F divide a variação ENTRE as médias dos grupos pela variação natural DENTRO de cada grupo. Se F for grande, as médias dos trimestres afastam-se muito mais do que o ruído diário explica.',
      'Na decisão de negócio, um Qui² ou ANOVA significativo responde apenas "há diferença em algum sítio" — o passo que gera ação é olhar para os resíduos padronizados (|resíduo| > 2) para descobrir exatamente que categoria e que trimestre puxaram o desvio.',
    ],
    errorDemo: {
      code: 'observado = [12, 0]\nesperado = [10, 0]\nqui2 = sum((o - e) ** 2 / e for o, e in zip(observado, esperado))',
      message: 'ZeroDivisionError: division by zero',
      fix: 'O teste de qui-quadrado falha se alguma célula tiver frequência esperada igual a 0 (na prática exige-se >= 5 por célula; junta categorias raras antes do teste).',
    },
  },
  'bi-13-regressao-linear': {
    explained: [
      'A correlação diz se duas variáveis sobem juntas (um número sem unidades entre -1 e 1), mas não responde "quantos euros ganho por cada cliente extra?". A regressão linear simples y = b0 + b1 × x dá essa resposta direta em euros através do declive b1.',
      'Exemplo pequeno com 3 dias: (10 clientes → 150 €), (15 clientes → 225 €), (20 clientes → 300 €). Aqui cada cliente adicional acrescenta exatamente b1 = 15,00 € à faturação diária, com ordenada b0 = 0 € e R² = 1,00 (100% da variação explicada). Em dados reais os pontos espalham-se à volta da reta e o R² (ex.: 0,64) indica que 64% da variação diária vem do número de clientes e 36% de outros fatores.',
      'O z-score = (valor - média) / desvio padrão complementa a leitura medindo quão extremo foi um dia em unidades de desvio padrão: um dia com z = +3,5 está 3,5 desvios acima do habitual e merece investigação (promoção, véspera de feriado ou erro de caixa).',
      'Na decisão de negócio, nunca extrapoles a reta para fora do intervalo observado: se a loja nunca recebeu mais de 35 clientes num dia, prever a receita para 100 clientes ignora limites reais de espaço, filas e stock.',
    ],
    errorDemo: {
      code: 'x = [10, 10, 10]\ny = [50, 60, 70]\nmx, my = sum(x) / 3, sum(y) / 3\ndeclive = sum((a - mx) * (b - my) for a, b in zip(x, y)) / sum((a - mx) ** 2 for a in x)',
      message: 'ZeroDivisionError: division by zero',
      fix: 'Se a variável explicativa x for constante (variância = 0), não é possível calcular declive — uma variável que nunca muda não consegue explicar variações em y.',
    },
  },
  'bi-16-regressao-multipla': {
    explained: [
      'Na regressão simples, se duas coisas acontecem juntas (em dezembro há mais clientes E cada cliente gasta mais em presentes), a variável que incluíste no modelo rouba o crédito da variável que ficou de fora. Esse fenómeno chama-se viés de variável omitida.',
      'Exemplo pequeno: na regressão simples, cada cliente extra parecia valer 16,69 €/dia. Quando juntas fim_de_semana (0/1) e dezembro (0/1) no mesmo modelo — faturação = b0 + b1×clientes + b2×fim_de_semana + b3×dezembro — o coeficiente b1 mede o efeito de mais 1 cliente "mantendo o dia da semana e o mês constantes", e b3 isola o prémio puro do Natal.',
      'Para comparar modelos com diferente número de variáveis usa sempre R² ajustado, nunca o R² simples: acrescentar uma coluna aleatória (ex.: a temperatura em Tóquio) pode subir ligeiramente o R² normal por pura sorte, mas o R² ajustado penaliza variáveis que não compensam a complexidade.',
      'Na decisão de negócio, a regressão múltipla evita atribuir ao marketing um aumento de vendas que na realidade veio do fim de semana ou da sazonalidade de dezembro.',
    ],
    errorDemo: {
      code: 'import numpy as np\nX = np.array([[1, 10], [1, 20], [1, 30]])\ny = np.array([50.0, 100.0])\nnp.linalg.lstsq(X, y, rcond=None)',
      message: 'Incompatible dimensions',
      fix: 'A matriz X e o vetor alvo y têm de ter exatamente o mesmo número de linhas (aqui X tem 3 e y tem 2). Limpa nulos em conjunto antes de separar X e y.',
    },
  },
  'bi-19-series-temporais': {
    explained: [
      'Uma série temporal de vendas diárias parece caótica quando olhas para o gráfico bruto porque mistura três camadas sobrepostas: a tendência de fundo (a loja cresce ao longo do ano?), a sazonalidade repetitiva (sábados vendem mais do que terças?) e o ruído imprevisível (um dia de chuva forte).',
      'Exemplo pequeno de previsão explicável: imagina que a reta de tendência aponta para 100 €/dia na próxima semana, o índice sazonal de terça-feira é 0,80 (-20% face a um dia médio) e o de sábado é 1,45 (+45%). A previsão simples multiplica as duas peças: 80 € para terça-feira e 145 € para sábado — transparente e imediata de explicar ao dono da loja.',
      'Tem cuidado com picos extremos nas pontas da série (como dezembro num ano de 12 meses): um Natal muito forte puxa a reta de tendência para cima e faz-te sobrestimar janeiro se não comparares a tendência com e sem dezembro.',
      'Na decisão de negócio, uma previsão simples que o gestor percebe e confia gera mais impacto operacional (encomendar pão e frescos na quantidade certa por dia da semana) do que uma caixa negra complexa que ninguém sabe auditar.',
    ],
    errorDemo: {
      code: 'import numpy as np\nt = np.array([0, 1, 2, 3])\ny = np.array([100.0, 110.0, 120.0])\nnp.polyfit(t, y, 1)',
      message: 'expected x and y to have same length',
      fix: 'O vetor temporal t = np.arange(len(y)) tem de ter exatamente o mesmo comprimento de y.',
    },
  },
  'bi-14-perguntas-entrevista': {
    explained: [
      'Nas entrevistas técnicas de Analista de Dados, os primeiros 15 minutos raramente testam código difícil — testam senso crítico perante armadilhas estatísticas que custam dinheiro às empresas todos os dias.',
      'Exemplo pequeno de valor esperado: uma campanha custa 2 € por cliente enviado; tem 15% de hipótese de gerar uma compra com 20 € de margem e 85% de não gerar compra (0 €). O valor esperado por cliente é 0,15 × 20 € + 0,85 × 0 € - 2 € = +1,00 €/cliente → vale a pena lançar! Mesmo perdendo dinheiro em 85% dos clientes individuais, o ganho médio é positivo.',
      'As outras três armadilhas clássicas andam de mão dada: 1) fazer 20 testes a 5% dá 1 - 0,95^20 ≈ 64% de probabilidade de um falso positivo (corrige com Bonferroni: α / k); 2) "espreitar" o teste A/B todos os dias e parar mal bate p < 0,05 multiplica falsos positivos; 3) viés de sobrevivência — perguntar só aos clientes ativos porque gostam da loja ignora quem já foi embora.',
      'Na entrevista, estruturar a resposta em 3 passos — nomear o enviesamento, dar um exemplo numérico simples e propor a salvaguarda prática — coloca-te logo acima da média dos candidatos.',
    ],
    errorDemo: {
      code: 'import pandas as pd\ns = pd.Series([3.5, 5.2, 8.9, 14.0])\ns.quantile(90)',
      message: 'ValueError: percentiles should all be in the interval [0, 1]',
      fix: 'Para calcular o percentil 90 (P90) em pandas passa 0.90 (entre 0 e 1), nunca 90: s.quantile(0.90).',
    },
  },
};
