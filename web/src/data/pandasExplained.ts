// Teoria aplicada ("Explicado com calma") e erro típico real para as etapas centrais de Pandas.
// Cada errorDemo é corrido nos testes em Pyodide para confirmar a mensagem real do Python/pandas.
import type { Lesson } from './types';

type Extra = Pick<Lesson, 'explained' | 'errorDemo'>;

export const pandasExplained: Record<string, Extra> = {
  'pd-02-filtros': {
    explained: [
      'Em Python normal, a expressão x > 2 and y > 1 devolve um único True ou False. Em pandas, df["preco"] > 2 devolve uma coluna inteira com 5 078 valores True/False (uma máscara booleana). Por isso o Python recusa o and normal: não sabe reduzir 5 078 respostas a um só sim/não.',
      'Exemplo pequeno com 3 linhas: preços [0.25, 3.40, 7.50] e quantidades [4, 2, 1]. A máscara (df["preco"] > 2) dá [False, True, True]; a máscara (df["qtd"] >= 2) dá [True, True, False]. Ao cruzar com & — (df["preco"] > 2) & (df["qtd"] >= 2) — só a 2.ª linha fica True.',
      'Os parênteses à volta de cada condição são obrigatórios porque em Python o operador & tem precedência maior do que > ou ==. Sem parênteses, o pandas tenta calcular 2 & df["qtd"] primeiro e rebenta com erro.',
      'Na decisão de negócio, filtros compostos com &, | e .isin() servem para isolar segmentos antes de calcular KPIs (ex.: vendas concluídas de fim de semana nas 3 cidades piloto), garantindo que uma decisão não mistura dados fora de âmbito.',
    ],
    errorDemo: {
      code: 'import pandas as pd\ndf = pd.DataFrame({"preco": [1.0, 5.0], "qtd": [2, 3]})\nfiltrado = df[df["preco"] > 2 and df["qtd"] > 1]',
      message: 'ValueError: The truth value of a Series is ambiguous',
      fix: 'Em pandas usa & (e), | (ou) e ~ (não), sempre com parênteses em cada condição: df[(df["preco"] > 2) & (df["qtd"] > 1)].',
    },
  },
  'pd-05-groupby-merge': {
    explained: [
      'A dupla pd.merge() + .groupby() é o equivalente direto em Python ao JOIN + GROUP BY do SQL. Primeiro trazes os atributos descritivos (categoria do produto, cidade do cliente) para junto das transações; depois agregas pelo nível que a pergunta de negócio exige.',
      'Exemplo pequeno: tens 2 vendas (produto_id = 1 com 10 €, produto_id = 2 com 5 €) e um catálogo com id = 1 ("Mercearia") e id = 2 ("Padaria"). Como a coluna de ligação tem nomes diferentes nas duas tabelas, passas left_on="produto_id" e right_on="id". Depois, .groupby("categoria")["sub"].sum() soma cada grupo.',
      'Boa prática de auditoria: verifica sempre len(df_cruzado) == len(vendas) após um merge de factos com dimensões (ou passa validate="many_to_one"). Se o catálogo tiver um produto duplicado, o merge duplica vendas silenciosamente e inflaciona a receita — exatamente como um JOIN mal feito em SQL.',
      'Na decisão de negócio, escolher how="inner" vs how="left" muda a conclusão: para medir faturação por categoria usa inner/left; para detetar produtos no catálogo que nunca venderam usa how="left" a partir de produtos e procura NaN na coluna de vendas.',
    ],
    errorDemo: {
      code: 'import pandas as pd\nvendas = pd.DataFrame({"produto_id": [1], "qtd": [2]})\nprodutos = pd.DataFrame({"id": [1], "categoria": ["Padaria"]})\npd.merge(vendas, produtos, on="produto_id")',
      message: "KeyError: 'produto_id'",
      fix: 'O parâmetro on= só funciona quando as duas tabelas têm o mesmo nome de coluna. Aqui vendas usa produto_id e produtos usa id: usa left_on="produto_id", right_on="id".',
    },
  },
  'pd-06-limpeza-sujas': {
    explained: [
      'A ordem dos passos num pipeline de limpeza importa tanto como o código em si. Se aplicares drop_duplicates() antes de limpar espaços e maiúsculas, " Pão ", "pão" e "Pão" parecem três textos diferentes e os duplicados escapam intactos.',
      'Exemplo pequeno com 4 linhas sujas: " Pão " (2,35 €), "pão" (2.35 €), "Leite" (-1.00 €) e "Café" (vazio). Passo 1: .str.strip().str.capitalize() unifica os dois "Pão". Passo 2: .str.replace(",", ".") + pd.to_numeric(..., errors="coerce") transforma "2,35" em 2.35 e texto inválido em NaN. Passo 3: drop_duplicates() remove o Pão repetido. Passo 4: filtras NaN e preco > 0.',
      'Repara no poder de errors="coerce" em pd.to_numeric(): em vez de rebentar o script inteiro à linha 4 120 porque alguém escreveu "n.d." num preço, converte o valor inválido para NaN, permitindo contar exatamente quantas linhas falharam antes de as remover ou corrigir.',
      'Na decisão de negócio, nunca apagues linhas sem as contar: dizer ao diretor "removemos 3 registos (1 duplicado, 1 preço negativo e 1 vazio) antes de calcular a faturação" dá confiança auditável ao relatório.',
    ],
    errorDemo: {
      code: 'import pandas as pd\nprecos = pd.Series(["2,35", "1.50"])\npd.to_numeric(precos)',
      message: 'ValueError: Unable to parse string "2,35"',
      fix: 'O pandas espera ponto decimal. Troca primeiro a vírgula e usa errors="coerce": pd.to_numeric(precos.str.replace(",", ".", regex=False), errors="coerce").',
    },
  },
  'pd-07-pivot-transform': {
    explained: [
      'Analistas seniores usam duas operações que poupam dezenas de linhas de código: pivot_table() para leitura humana em matriz (linhas × colunas) e groupby().transform() para cálculos relativos linha a linha sem perder o detalhe original.',
      'Exemplo pequeno com 3 vendas de 2 dias: Dia 1 teve 3 € (Azeite) e 1 € (Pão); Dia 2 teve 4 € (Queijo). Um groupby("data")["sub"].sum() reduz a tabela para 2 linhas (4 € e 4 €). Já groupby("data")["sub"].transform("sum") devolve 3 valores [4.0, 4.0, 4.0] alinhados às 3 linhas — basta dividir sub / total_do_dia * 100 para ver imediatamente que o Azeite pesou 75% do Dia 1.',
      'No pivot_table(), a diferença face ao método mais simples .pivot() é que pivot_table agrega quando há várias vendas para o mesmo par (ex.: dezenas de vendas de Azeite em dezembro). Passar fill_value=0 garante que combinações sem vendas mostram 0 em vez de NaN.',
      'Na decisão de negócio, .transform() responde a "que peso teve cada produto no seu dia ou categoria?" e pivot_table gera a matriz Mês × Categoria pronta a colar num relatório executivo ou exportar para Excel.',
    ],
    errorDemo: {
      code: 'import pandas as pd\ndf = pd.DataFrame({"cidade": ["Porto", "Porto"], "cat": ["Padaria", "Padaria"], "sub": [2.0, 3.0]})\ndf.pivot(index="cidade", columns="cat", values="sub")',
      message: 'ValueError: Index contains duplicate entries, cannot reshape',
      fix: 'pivot() só remodela quando cada par (linha, coluna) é único. Quando há várias vendas por par, usa df.pivot_table(index="cidade", columns="cat", values="sub", aggfunc="sum", fill_value=0).',
    },
  },
  'pd-08-numpy-estatistica': {
    explained: [
      'O pandas é construído por cima do NumPy: cada coluna de um DataFrame guarda os números num bloco contíguo de memória (array). Quando escreves precos * 1.23, o NumPy aplica a conta em C à coluna inteira de uma só vez (vetorização), 10 a 100 vezes mais rápido do que um ciclo for em Python.',
      'Exemplo pequeno das 3 peças que vais reutilizar na trilha de Estatística: 1) agrupar por ["data", "cliente_id"] passa do grão de linha de artigo para o grão de cesto de compra; 2) s.quantile(0.75) corta os valores ordenados a 75% (recebe sempre um número entre 0 e 1); 3) pd.crosstab(fim_de_semana, produto) constrói a tabela de contagens de entrada do teste de qui-quadrado.',
      'A matriz X = np.column_stack([np.ones(n), x]) pode parecer estranha à primeira vista, mas tem um motivo simples: na regressão linear y = b0 + b1 × x, a coluna de uns multiplica a ordenada na origem (b0) e a coluna x multiplica o declive (b1), permitindo resolver tudo numa única chamada matricial.',
      'Na decisão de negócio, mudar corretamente o grão da análise (de linha de fatura para cesto por cliente e dia) é crucial: o valor médio de uma linha (5,30 €) não é o ticket médio de um cesto quando o cliente leva 3 artigos na mesma ida à loja.',
    ],
    errorDemo: {
      code: 'import numpy as np\nquantidades = np.array([2, 3, 1])\nprecos = np.array([0.25, 0.89])\ntotais = quantidades * precos',
      message: 'ValueError: operands could not be broadcast together with shapes (3,) (2,)',
      fix: 'Operações vetorizadas elemento a elemento exigem arrays com o mesmo comprimento (ou um escalar, como precos * 1.23). Confirma .shape antes de multiplicar.',
    },
  },
};
