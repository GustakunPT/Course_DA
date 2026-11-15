"""Semana 10: funções. Leia licoes/semana10_funcoes.md

Defina as funções pedidas (use return, não apenas print!) e corra:  python verificar.py 10
"""


# 1. Escreva calcular_subtotal(quantidade, preco) que devolve quantidade * preco arredondado a 2 casas.
def calcular_subtotal(quantidade, preco):
    pass


# 2. Escreva limpar_nome_produto(texto) que tira espaços nas pontas (.strip())
#    e coloca apenas a primeira letra maiúscula (.capitalize()).
def limpar_nome_produto(texto):
    pass


# 3. Escreva aplicar_iva(valor, taxa=0.23) que devolve round(valor * (1 + taxa), 2).
def aplicar_iva(valor, taxa=0.23):
    pass


print(calcular_subtotal(3, 0.89), limpar_nome_produto("  pão "), aplicar_iva(10.0))
