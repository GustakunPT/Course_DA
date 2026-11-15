"""Semana 8: listas e fatias. Lê licoes/semana08_listas_e_colecoes.md

Completa cada variável pedida e corre:  python verificar.py 8
"""

produtos = ["Pão", "Leite", "Ovos (dúzia)", "Arroz", "Azeite", "Café"]
precos = [0.25, 0.89, 2.35, 1.20, 7.50, 3.40]

# 1. Guarda o primeiro e o último produto da lista produtos (usa índices 0 e -1).
primeiro = None
ultimo = None

# 2. Com uma fatia (slicing), guarda os 3 primeiros produtos.
tres_primeiros = None

# 3. Com list comprehension, cria uma lista apenas com os preços superiores a 1.50 €.
precos_caros = None

# 4. Ordena a lista precos do maior para o menor numa nova lista (usa sorted com reverse=True).
precos_desc = None

print(primeiro, ultimo, tres_primeiros, precos_caros, precos_desc)
