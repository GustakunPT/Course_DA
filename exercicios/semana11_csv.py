"""Semana 11: ficheiros e módulo csv. Lê licoes/semana11_ficheiros_e_csv.md

Lê dados/produtos.csv com csv.DictReader e corre:  python verificar.py 11
"""

import csv
from pathlib import Path

CAMINHO_PRODUTOS = Path(__file__).resolve().parent.parent / "dados" / "produtos.csv"

# 1. Abre CAMINHO_PRODUTOS com encoding="utf-8" e guarda todas as linhas (dicionários) numa lista.
lista_produtos = None

# 2. Quantos produtos existem no catálogo?
num_produtos = None

# 3. Qual o nome do produto mais caro do catálogo?
produto_mais_caro = None

# 4. Quantos produtos pertencem à categoria "Mercearia"?
qtd_categoria_mercearia = None

print(num_produtos, produto_mais_caro, qtd_categoria_mercearia)
