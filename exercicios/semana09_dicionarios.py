"""Semana 9: dicionários e acumuladores por chave. Lê licoes/semana09_dicionarios.md

Completa o código pedido e corre:  python verificar.py 9
"""

precos = {"Pão": 0.25, "Leite": 0.89, "Azeite": 7.50, "Café": 3.40}
talao = [("Pão", 4), ("Leite", 2), ("Café", 1), ("Pão", 2), ("Azeite", 1)]

# 1. Consulte no dicionário o preço do "Azeite".
preco_azeite = None

# 2. Usa .get() para procurar "Chocolate" devolvendo 0.0 se não existir.
preco_chocolate = None

# 3. Soma as unidades vendidas por produto no dicionário unidades_por_produto.
unidades_por_produto = {}


# 4. Calcula a faturação total deste talão (quantidade * preço de cada artigo).
total_talao = 0.0


print(preco_azeite, preco_chocolate, unidades_por_produto, total_talao)
