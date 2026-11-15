"""Semana 6: ciclo for. Leia licoes/semana06_ciclo_for.md

Escreva os ciclos por baixo de cada enunciado e corra:  python verificar.py 6
Regra: resolva com ciclos for, sem usar sum(), max() ou len().
"""

vendas = [120, 80, 250, 40, 100, 310]

# 1. Some todos os números de 1 a 100 (inclusive).
soma_1_a_100 = 0


# 2. Conte quantas vendas são superiores a 100 €.
quantas_acima_100 = 0


# 3. Descubra a maior venda (comece por assumir que é a primeira da lista).
maior_venda = vendas[0]


# 4. Para cada total da lista, calcule o desconto (até 20 -> 0, até 50 -> 5, acima -> 10)
#    e acrescente-o à lista descontos com append.
totais = [15, 37.5, 80]
descontos = []


print(soma_1_a_100, quantas_acima_100, maior_venda, descontos)
