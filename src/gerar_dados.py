"""Gera os dados fictícios da Mercearia do Bairro.

Cria 4 ficheiros CSV na pasta dados/:
  - produtos.csv         (catálogo de 15 artigos)
  - clientes.csv         (fichas de 120 clientes)
  - vendas.csv           (base uniforme de reconciliação: 5 078 linhas)
  - vendas_sazonais.csv  (sazonalidade e tendências reais de retalho:
                          crescimento de coortes de clientes, verão, Páscoa,
                          Natal, efeito dia de salário e fim de semana)

Só usa a biblioteca padrão do Python. A semente fixa (SEMENTE) garante que
toda a gente obtém exatamente os mesmos dados, o que permite comparar
resultados entre SQL, Python, pandas e Power BI.

Como correr (a partir da pasta do projeto):
    python src/gerar_dados.py
"""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEMENTE = 42
PASTA_DADOS = Path(__file__).resolve().parent.parent / "dados"

# (id, nome, categoria, preço de venda em euros)
PRODUTOS = [
    (1, "Pão", "Padaria", 0.25),
    (2, "Leite", "Laticínios", 0.89),
    (3, "Ovos (dúzia)", "Mercearia", 2.35),
    (4, "Arroz", "Mercearia", 1.20),
    (5, "Massa", "Mercearia", 0.99),
    (6, "Azeite", "Mercearia", 7.50),
    (7, "Café", "Mercearia", 3.40),
    (8, "Açúcar", "Mercearia", 1.05),
    (9, "Maçãs (kg)", "Frutaria", 1.80),
    (10, "Bananas (kg)", "Frutaria", 1.60),
    (11, "Queijo", "Charcutaria", 4.90),
    (12, "Fiambre", "Charcutaria", 2.60),
    (13, "Iogurte", "Laticínios", 0.55),
    (14, "Água (1,5 L)", "Bebidas", 0.65),
    (15, "Sumo", "Bebidas", 1.75),
]

CIDADES = ["Porto", "Gaia", "Matosinhos", "Maia", "Braga", "Lisboa"]
NOMES = [
    "Ana", "Bruno", "Carla", "Diogo", "Eva", "Filipe", "Graça", "Hugo",
    "Inês", "João", "Karina", "Luís", "Marta", "Nuno", "Olga", "Pedro",
    "Quitéria", "Rui", "Sofia", "Tiago",
]
APELIDOS = ["Silva", "Santos", "Ferreira", "Pereira", "Costa", "Oliveira", "Martins", "Rocha"]


def gerar_produtos():
    caminho = PASTA_DADOS / "produtos.csv"
    with open(caminho, "w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["id", "nome", "categoria", "preco"])
        escritor.writerows(PRODUTOS)
    return caminho


def gerar_clientes(n=120):
    caminho = PASTA_DADOS / "clientes.csv"
    with open(caminho, "w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["id", "nome", "cidade"])
        for i in range(1, n + 1):
            nome = f"{random.choice(NOMES)} {random.choice(APELIDOS)}"
            escritor.writerow([i, nome, random.choice(CIDADES)])
    return caminho, n


def gerar_vendas(n_clientes, ano=2025):
    caminho = PASTA_DADOS / "vendas.csv"
    dia = date(ano, 1, 1)
    fim = date(ano, 12, 31)
    linhas = 0
    with open(caminho, "w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["data", "cliente_id", "produto_id", "produto", "quantidade", "preco"])
        while dia <= fim:
            # Mais movimento ao sábado (5) e ao domingo (6).
            base = 9 if dia.weekday() >= 5 else 6
            for _ in range(random.randint(base - 2, base + 2)):
                cliente = random.randint(1, n_clientes)
                for _ in range(random.randint(1, 3)):
                    id_, nome, _cat, preco = random.choice(PRODUTOS)
                    quantidade = random.randint(1, 4)
                    escritor.writerow([dia.isoformat(), cliente, id_, nome, quantidade, f"{preco:.2f}"])
                    linhas += 1
            dia += timedelta(days=1)
    return caminho, linhas


def _pesos_sazonais_produtos(mes):
    """Devolve pesos de escolha por produto segundo a época do ano."""
    pesos = []
    for id_, _nome, cat, _preco in PRODUTOS:
        # Pão e Leite são artigos âncora diários
        p = 2.6 if id_ in (1, 2) else 1.2

        # Verão (junho a agosto): disparo em Bebidas, Frutaria e Iogurte
        if mes in (6, 7, 8):
            if cat == "Bebidas":
                p *= 2.8
            elif cat == "Frutaria" or id_ == 13:
                p *= 1.9

        # Inverno frio (janeiro e fevereiro): mais Café, Arroz, Massa
        if mes in (1, 2) and id_ in (4, 5, 7):
            p *= 1.5

        # Páscoa (abril) e época festiva / Natal (novembro e dezembro):
        # forte procura de Azeite, Queijo, Fiambre, Ovos, Açúcar e Café
        if mes == 4 and id_ in (3, 6, 8, 11):
            p *= 2.1
        if mes in (11, 12) and id_ in (3, 6, 7, 8, 11, 12):
            p *= 2.5 if mes == 12 else 1.8

        pesos.append(p)
    return pesos


def gerar_vendas_sazonais(n_clientes, ano=2025):
    """Gera vendas com crescimento orgânico de clientes, sazonalidade e efeito salarial."""
    rng = random.Random(SEMENTE + 100)
    caminho = PASTA_DADOS / "vendas_sazonais.csv"
    dia = date(ano, 1, 1)
    fim = date(ano, 12, 31)
    linhas = 0

    # Multiplicador mensal de tráfego (crescimento ao longo do ano + picos em julho/agosto e dezembro)
    fator_mes = {
        1: 0.78,
        2: 0.74,
        3: 0.86,
        4: 0.98,   # Páscoa
        5: 0.96,
        6: 1.08,   # Início de verão
        7: 1.18,   # Verão
        8: 1.22,   # Pico de verão
        9: 1.06,   # Regresso às aulas
        10: 1.04,
        11: 1.16,  # Pré-Natal
        12: 1.42,  # Natal e Fim de Ano
    }

    with open(caminho, "w", newline="", encoding="utf-8") as f:
        escritor = csv.writer(f)
        escritor.writerow(["data", "cliente_id", "produto_id", "produto", "quantidade", "preco"])
        while dia <= fim:
            mes = dia.month
            # Carteira ativa cresce de 54 clientes em janeiro até 120 clientes em dezembro (coortes reais)
            clientes_ativos_mes = min(n_clientes, 48 + mes * 6)

            # Movimento base por dia da semana (sexta, sábado e domingo mais fortes)
            if dia.weekday() in (5, 6):
                base_visitas = 10
            elif dia.weekday() == 4:
                base_visitas = 8
            else:
                base_visitas = 6

            # Efeito dia de pagamento (dias 1-5 e 25-31 têm +20% de movimento)
            bonus_pagamento = 1.20 if (dia.day <= 5 or dia.day >= 25) else 1.0
            visitas_esperadas = max(3, round(base_visitas * fator_mes[mes] * bonus_pagamento))
            n_visitas = rng.randint(max(2, visitas_esperadas - 2), visitas_esperadas + 2)

            pesos = _pesos_sazonais_produtos(mes)

            for _ in range(n_visitas):
                cliente = rng.randint(1, clientes_ativos_mes)
                n_itens_cesto = rng.randint(1, 4 if dia.weekday() >= 4 or mes == 12 else 3)
                escolhidos = rng.choices(PRODUTOS, weights=pesos, k=n_itens_cesto)
                for id_, nome, cat, preco in escolhidos:
                    # Quantidades maiores de bebidas no verão e de produtos básicos ao fim de semana
                    if cat == "Bebidas" and mes in (6, 7, 8):
                        quantidade = rng.randint(2, 6)
                    elif id_ == 1:  # Pão
                        quantidade = rng.randint(2, 6)
                    elif mes == 12 and id_ in (6, 11, 3):
                        quantidade = rng.randint(2, 5)
                    else:
                        quantidade = rng.randint(1, 4)
                    escritor.writerow([dia.isoformat(), cliente, id_, nome, quantidade, f"{preco:.2f}"])
                    linhas += 1
            dia += timedelta(days=1)
    return caminho, linhas


def main():
    random.seed(SEMENTE)
    PASTA_DADOS.mkdir(exist_ok=True)
    gerar_produtos()
    _, n_clientes = gerar_clientes()
    _, n_vendas = gerar_vendas(n_clientes)
    _, n_sazonais = gerar_vendas_sazonais(n_clientes)
    print(f"Dados criados em {PASTA_DADOS}")
    print(
        f"  produtos: {len(PRODUTOS)} | clientes: {n_clientes} | "
        f"vendas base: {n_vendas} | vendas sazonais: {n_sazonais}"
    )


if __name__ == "__main__":
    main()
