// Explicação mais longa e um erro típico para cada etapa da trilha Python.
// A trilha é a porta de entrada de quem nunca programou, por isso precisa de mais texto do que as outras.
// Os testes correm cada errorDemo no Pyodide e confirmam que o Python mostra a mensagem indicada.
import type { Lesson } from './types';

type Extra = Pick<Lesson, 'explained' | 'errorDemo'>;

export const pythonExplained: Record<string, Extra> = {
  'py-01-sintaxe': {
    explained: [
      'O Python lê o teu código de cima para baixo, uma linha de cada vez. Cada linha é uma instrução completa: print("Bom dia") manda escrever Bom dia no ecrã. Se uma linha falhar, as linhas de baixo já não correm.',
      'Repara na diferença entre print("2 + 3") e print(2 + 3). Com aspas o Python vê texto e escreve-o tal e qual: 2 + 3. Sem aspas vê uma conta, faz a conta e escreve 5.',
      'Um comentário começa por # e vai até ao fim da linha. O Python ignora-o: serve para quem lê o código daqui a seis meses, muitas vezes tu próprio. Escreve nos comentários porque fazes algo, não o que a linha faz. "# A padaria paga IVA a 6%" ajuda; "# multiplica por 1.06" não acrescenta nada.',
      'Quando algo corre mal, o Python pára e mostra uma mensagem de erro. A última linha é a mais importante: diz o tipo de erro (NameError, SyntaxError…) e dá uma pista. Lê essa linha com calma antes de mudar o código.',
    ],
    errorDemo: {
      code: 'Print("Bom dia")',
      message: "NameError: name 'Print' is not defined",
      fix: 'O Python distingue maiúsculas de minúsculas. Print com P grande é um nome que não existe; o comando é print("Bom dia"). Repara que o próprio Python sugere: Did you mean: \'print\'?',
    },
  },
  'py-02-variaveis': {
    explained: [
      'Uma variável é um nome ligado a um valor. Quando escreves preco_pao = 0.25, o Python guarda 0.25 e, daí para a frente, sempre que escreves preco_pao usa esse valor. O sinal = não quer dizer "é igual": quer dizer "guarda o que está à direita no nome da esquerda".',
      'Por isso podes escrever stock = stock - 3. O Python calcula primeiro o lado direito com o valor antigo e só depois guarda o resultado no mesmo nome.',
      'Cada valor tem um tipo, e o tipo decide o que podes fazer com ele. 10 é int (inteiro), 0.25 é float (decimal), "Pão" é str (texto) e True é bool (verdadeiro ou falso). 2 + 2 dá 4, mas "2" + "2" dá "22", porque somar textos é colá-los.',
      'Os nomes só podem ter letras, algarismos e _, e não podem começar por um algarismo. Usa minúsculas com _ entre palavras e nomes que digam o que guardam: total_vendas lê-se melhor do que tv ou x.',
    ],
    errorDemo: {
      code: 'quantidade = 3\nprint("Unidades: " + quantidade)',
      message: 'TypeError: can only concatenate str (not "int") to str',
      fix: 'Não se cola texto a um número. Converte o número com str(quantidade) ou, mais simples, usa uma f-string: print(f"Unidades: {quantidade}").',
    },
  },
  'py-03-strings-conversoes': {
    explained: [
      'Os dados chegam quase sempre como texto, mesmo quando parecem números: "0,89" lido de um ficheiro é uma str. Antes de fazer contas tens de limpar e converter.',
      'A limpeza faz-se com métodos, que se escrevem com um ponto depois do texto. "  pão ".strip() tira os espaços das pontas e dá "pão"; "0,89".replace(",", ".") troca a vírgula por ponto e dá "0.89". Podes encadear: texto.strip().replace(",", ".").',
      'Os métodos de texto não alteram a variável original: devolvem um texto novo. Se escreveres só nome.strip(), o resultado perde-se. Tens de o guardar: nome = nome.strip().',
      'Só depois de limpo é que float("0.89") funciona. float converte para decimal, int para inteiro e str faz o caminho inverso. Para mostrar o resultado, f"{total:.2f} €" escreve o número com 2 casas decimais sem mudar o valor guardado.',
    ],
    errorDemo: {
      code: 'preco = float("0,89")',
      message: "ValueError: could not convert string to float: '0,89'",
      fix: 'O Python só aceita o ponto como separador decimal. Troca primeiro a vírgula: float("0,89".replace(",", ".")) dá 0.89.',
    },
  },
  'py-04-condicoes': {
    explained: [
      'Um if faz uma pergunta cuja resposta é True ou False. Se for True, corre o bloco de baixo; se for False, salta-o. O bloco é tudo o que está indentado (4 espaços) depois dos dois pontos.',
      'Com elif e else montas uma escada: o Python testa de cima para baixo e corre só o primeiro ramo verdadeiro. Por isso a ordem conta. Se testares total >= 20 antes de total >= 50, um total de 60 entra no primeiro ramo e nunca chega ao segundo. Põe a condição mais exigente primeiro.',
      '= guarda um valor; == compara dois valores. if cidade == "Porto": faz uma pergunta; cidade = "Porto" muda a variável. Para comparar tens também !=, <, <=, > e >=.',
      'and exige que as duas condições sejam verdadeiras, or contenta-se com uma e not inverte a resposta. idade >= 18 and tem_cartao só dá True a clientes adultos com cartão.',
    ],
    errorDemo: {
      code: 'total = 60\nif total >= 50\n    print("Oferta de saco")',
      message: "SyntaxError: expected ':'",
      fix: 'Falta o : no fim da linha do if. Cada if, elif e else termina com dois pontos, e a linha seguinte começa 4 espaços mais à direita.',
    },
  },
  'py-05-ciclo-for': {
    explained: [
      'Um for repete o mesmo bloco para cada elemento de uma lista. Em for venda in vendas:, a variável venda recebe o primeiro valor e o bloco corre; depois recebe o segundo, e assim até ao fim. Não precisas de saber quantos elementos há.',
      'O nome depois do for és tu que escolhes. Usa o singular da lista: for produto in produtos, for venda in vendas. Assim o código lê-se como uma frase.',
      'range(n) gera os números de 0 a n - 1 e serve para repetir algo um número fixo de vezes. range(1, 13) dá os 12 meses, de 1 a 12: o número da direita fica sempre de fora.',
      'Para juntar resultados ao longo do ciclo, crias a variável antes do for (total = 0 ou maior = vendas[0]) e atualiza-la lá dentro. Se a criares dentro do ciclo, volta ao valor inicial em cada volta.',
    ],
    errorDemo: {
      code: 'vendas = [120, 80, 250]\nfor venda in vendas:\nprint(venda)',
      message: 'IndentationError: expected an indented block',
      fix: 'O corpo do for tem de estar indentado com 4 espaços. Sem indentação o Python não sabe que linhas deve repetir.',
    },
  },
  'py-06-while': {
    explained: [
      'O while repete enquanto uma condição for verdadeira. Usa-se quando não sabes à partida quantas voltas vais dar: por exemplo, quantas semanas são precisas para o saldo chegar a 500 €.',
      'Em cada volta o Python testa a condição outra vez. Se nada dentro do ciclo mudar a variável da condição, a resposta nunca muda e o ciclo não acaba. Antes de correr um while, identifica a linha que o aproxima do fim.',
      'Um acumulador é uma variável que começa num valor neutro antes do ciclo (0 para somas) e cresce em cada volta: total += venda é o mesmo que total = total + venda.',
      'Um contador funciona da mesma forma, mas soma sempre 1: semanas += 1. Juntos dão o padrão que resolve a maior parte destes problemas: acumular até atingir um objetivo e contar quantas voltas foram precisas.',
    ],
    errorDemo: {
      code: 'saldo = 100\nwhile saldo < 500:\n    saldo += 40\n    semanas += 1',
      message: "NameError: name 'semanas' is not defined",
      fix: 'semanas += 1 precisa de um valor antigo a que somar. Cria o contador antes do ciclo com semanas = 0.',
    },
  },
  'py-07-listas-colecoes': {
    explained: [
      'Uma lista guarda vários valores por ordem, entre parênteses retos: vendas = [120, 80, 250]. Cada valor tem uma posição, e as posições começam em 0: vendas[0] é 120 e vendas[2] é 250.',
      'As posições negativas contam a partir do fim: vendas[-1] é sempre o último elemento, seja qual for o tamanho da lista. Uma fatia como vendas[1:3] devolve uma lista nova com as posições 1 e 2; tal como no range, a da direita fica de fora.',
      'As listas podem mudar: vendas.append(310) acrescenta um valor no fim e vendas[0] = 130 troca um valor. sum, len, min e max resumem a lista numa só linha.',
      'Uma compreensão de lista cria uma lista nova a partir de outra: [p * 1.23 for p in precos] aplica o IVA a todos os preços e [p for p in precos if p > 1.5] fica só com os mais caros. Lê-se da esquerda para a direita, como uma frase.',
    ],
    errorDemo: {
      code: 'vendas = [120, 80, 250]\nprint(vendas[3])',
      message: 'IndexError: list index out of range',
      fix: 'A lista tem 3 elementos, nas posições 0, 1 e 2. A posição 3 não existe. Para o último elemento usa vendas[-1].',
    },
  },
  'py-08-dicionarios': {
    explained: [
      'Um dicionário guarda pares chave: valor entre chavetas: precos = {"Pão": 0.25, "Leite": 0.89}. Em vez de procurares por posição, procuras pelo nome: precos["Leite"] dá 0.89.',
      'As chaves são únicas. Se escreveres precos["Pão"] = 0.30, o valor antigo é substituído; se a chave não existia, é criada. É assim que se acrescenta informação.',
      'Para percorrer um dicionário usa for produto, preco in precos.items(): em cada volta recebes a chave e o valor ao mesmo tempo.',
      'O padrão mais útil em análise é somar por grupo: totais[categoria] = totais.get(categoria, 0) + valor. O .get devolve 0 da primeira vez que a categoria aparece e o total acumulado nas seguintes. É o mesmo que um GROUP BY faz em SQL.',
    ],
    errorDemo: {
      code: 'precos = {"Pão": 0.25, "Leite": 0.89}\nprint(precos["Café"])',
      message: "KeyError: 'Café'",
      fix: 'A chave "Café" não existe no dicionário. Confirma antes com "Café" in precos, ou usa precos.get("Café", 0) para ter um valor por omissão.',
    },
  },
  'py-09-funcoes': {
    explained: [
      'Uma função é um bloco de código com nome que podes usar muitas vezes. Defines uma vez com def e chamas sempre que precisares: aplicar_iva(10) em vez de repetir a conta em todo o lado.',
      'Os parâmetros são as entradas, entre parênteses. Quando chamas aplicar_iva(10), o parâmetro valor passa a valer 10 dentro da função. Um parâmetro com valor por omissão (taxa=0.23) pode ficar de fora na chamada.',
      'return devolve o resultado a quem chamou e termina a função. print só mostra no ecrã: uma função sem return devolve None, e total = aplicar_iva(10) fica sem valor.',
      'As variáveis criadas dentro da função só existem lá dentro. Isso é bom: a função não mexe no resto do programa e dá sempre o mesmo resultado para as mesmas entradas, o que a torna fácil de testar.',
    ],
    errorDemo: {
      code: 'def aplicar_iva(valor, taxa=0.23):\n    return round(valor * (1 + taxa), 2)\n\nprint(aplicar_iva())',
      message: "TypeError: aplicar_iva() missing 1 required positional argument: 'valor'",
      fix: 'valor não tem valor por omissão, por isso é obrigatório. Chama a função com o valor: aplicar_iva(10).',
    },
  },
};
