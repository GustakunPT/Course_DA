"""Semana 6: ciclo for. Lê licoes/semana06_ciclo_for.md

Escreve os ciclos por baixo de cada enunciado e corre:  python verificar.py 6
Regra: resolve com ciclos for, sem usar sum(), max() ou len().
"""

vendas = [120, 80, 250, 40, 100, 310]

# 1. Soma todos os números de 1 a 100 (inclusive).
soma_1_a_100 = 0


# 2. Conta quantas vendas são superiores a 100 €.
quantas_acima_100 = 0


# 3. Descobre a maior venda (começa por assumir que é a primeira da lista).
maior_venda = vendas[0]


# 4. Para cada total da lista, calcula o desconto (até 20 -> 0, até 50 -> 5, acima -> 10)
#    e acrescente-o à lista descontos com append.
totais = [15, 37.5, 80]
descontos = []


print(soma_1_a_100, quantas_acima_100, maior_venda, descontos)
