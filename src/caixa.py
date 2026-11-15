"""Caixa Registadora da Mercearia (mini projeto da Fase 1).

ESTE FICHEIRO É PARA SI ESCREVER. Só usa o que aprendeu nas semanas 3 a 11:
variáveis, condições, ciclos, dicionários, funções, ficheiros e o módulo csv.

Objetivo: ler dados/vendas.csv e mostrar
  1. o total de vendas (euros)
  2. o produto mais vendido (em quantidade)
  3. o dia com mais faturação
  4. o valor médio por linha de venda

Regras do jogo:
  - Tente primeiro sozinho, durante pelo menos 15 minutos por passo.
  - Escreva uma função por pergunta (lembra-se da analogia da receita?).
  - Quando acabar, compare os números com os que obtém em SQL na Fase 2.
    Se forem diferentes, um dos dois tem um erro: descubra qual e porquê.

Pistas (abra só se estiver bloqueado):
  - csv.DictReader(f) dá-lhe cada linha como um dicionário.
  - Os valores vêm como texto: use int() e float() para os converter.
  - Um dicionário serve de acumulador: totais[chave] = totais.get(chave, 0) + valor
"""

import csv
from pathlib import Path

FICHEIRO = Path(__file__).resolve().parent.parent / "dados" / "vendas.csv"


def ler_vendas():
    """Devolve uma lista de dicionários, um por linha do CSV."""
    # TODO: abra o ficheiro com encoding="utf-8" e leia-o com csv.DictReader
    pass


def total_vendas(vendas):
    # TODO: some quantidade * preco de todas as linhas
    pass


def produto_mais_vendido(vendas):
    # TODO: some a quantidade por produto e devolva o nome com maior soma
    pass


def dia_com_mais_faturacao(vendas):
    # TODO: some a faturação por data e devolva a data com maior soma
    pass


def media_por_linha(vendas):
    # TODO: total dividido pelo número de linhas
    pass


def main():
    vendas = ler_vendas()
    print("Total de vendas:", total_vendas(vendas))
    print("Produto mais vendido:", produto_mais_vendido(vendas))
    print("Dia com mais faturação:", dia_com_mais_faturacao(vendas))
    print("Média por linha:", media_por_linha(vendas))


if __name__ == "__main__":
    main()
