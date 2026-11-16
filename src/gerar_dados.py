"""Gera os dados fictícios da Mercearia do Bairro.

Cria 4 ficheiros CSV na pasta dados/:
  - produtos.csv         (catálogo de 15 artigos)
  - clientes.csv         (fichas de 120 clientes)
  - vendas.csv           (base uniforme de reconciliação: 5 078 linhas)
  - bicicletas_viagens_sujas.csv / bicicletas_viagens_limpas.csv
                         (viagens de bicicletas partilhadas, com e sem problemas)
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
import unicodedata
from datetime import date, datetime, timedelta
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


COLUNAS_BICICLETAS = [
    "viagem_id", "inicio", "fim", "estacao_partida", "estacao_chegada",
    "duracao_min", "tipo_cliente", "valor_eur",
]

ESTACOES = [
    "Estação Central", "Estação Jardim Botânico", "Estação Ribeira", "Estação Universidade",
    "Estação São Bento", "Estação do Mercado", "Estação Praça Nova", "Estação Farol",
    "Estação Parque Verde", "Estação Hospital", "Estação Avenida da Liberdade", "Estação Cais do Sodré",
]


def _sem_acentos(texto):
    return "".join(c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn")


def _variante_estacao(nome, rng):
    escolha = rng.randrange(4)
    if escolha == 0:
        return f"  {nome.lower()} "
    if escolha == 1:
        return nome.upper()
    if escolha == 2:
        return _sem_acentos(nome)
    return nome.replace("Estação", "Est.", 1)


def _formatar_data(momento, formato):
    if formato == "iso":
        return momento.strftime("%Y-%m-%d %H:%M")
    if formato == "dd_mm":
        return momento.strftime("%d/%m/%Y %H:%M")
    # hora sem zero à esquerda (pode ter 1 algarismo)
    return f"{momento:%d-%m-%Y} {momento.hour}h{momento.minute:02d}"


def gerar_viagens_bicicletas(n=20000):
    """Gera viagens de bicicletas partilhadas: versão suja e versão limpa.

    Devolve (sujas, limpas, contagens). Cada problema cai em linhas próprias,
    sem outros problemas, para as contagens não dependerem da ordem.
    """
    rng = random.Random(SEMENTE + 200)
    inicio_ano = datetime(2025, 1, 1)

    # Viagens boas, já limpas
    base = []
    for _ in range(n):
        inicio = inicio_ano + timedelta(minutes=rng.randrange(365 * 24 * 60))
        duracao = rng.randint(3, 90)
        tipo = "Anual" if rng.random() < 0.6 else "Ocasional"
        valor = 0.0 if tipo == "Anual" else rng.randint(1, 12) * 0.5
        base.append({
            "inicio": inicio,
            "fim": inicio + timedelta(minutes=duracao),
            "partida": rng.choice(ESTACOES),
            "chegada": rng.choice(ESTACOES),
            "duracao": duracao,
            "tipo": tipo,
            "valor": valor,
        })
    base.sort(key=lambda b: b["inicio"])

    # Cada linha recebe no máximo um problema
    indices = list(range(n))
    rng.shuffle(indices)
    quantidades = [
        ("duplicadas", 300), ("duracao_impossivel", 200), ("fim_antes_inicio", 150),
        ("data_formato_dd_mm", 1600), ("data_formato_h", 1200), ("estacao_variante", 2000),
        ("tipo_vazio", 600), ("tipo_variante", 1600), ("valor_vazio", 500), ("valor_virgula", 800),
    ]
    problema = {}
    posicao = 0
    for nome, qtd in quantidades:
        if nome in ("valor_vazio", "valor_virgula"):
            # só as linhas Ocasional têm valor com decimais
            ocasionais = [i for i in indices[posicao:] if base[i]["tipo"] == "Ocasional"][:qtd]
            resto = set(ocasionais)
            indices = indices[:posicao] + ocasionais + [i for i in indices[posicao:] if i not in resto]
        for i in indices[posicao:posicao + qtd]:
            problema[i] = nome
        posicao += qtd
    contagens = dict(quantidades)

    sujas, limpas = [], []
    for i, b in enumerate(base):
        tipo = problema.get(i)
        viagem_id = f"V{i + 1:06d}"
        inicio, fim, duracao = b["inicio"], b["fim"], b["duracao"]
        partida, chegada = b["partida"], b["chegada"]
        tipo_cliente, valor = b["tipo"], b["valor"]

        if tipo == "duracao_impossivel":
            duracao = rng.choice([0, -rng.randint(1, 60), rng.randint(1500, 5000)])
            fim = inicio + timedelta(minutes=max(duracao, 0))
        elif tipo == "fim_antes_inicio":
            fim = inicio - timedelta(minutes=duracao)

        formato = {"data_formato_dd_mm": "dd_mm", "data_formato_h": "h"}.get(tipo, "iso")
        suja = {
            "viagem_id": viagem_id,
            "inicio": _formatar_data(inicio, formato),
            "fim": _formatar_data(fim, formato),
            "estacao_partida": partida,
            "estacao_chegada": chegada,
            "duracao_min": str(duracao),
            "tipo_cliente": tipo_cliente,
            "valor_eur": f"{valor:.2f}",
        }
        limpa = dict(suja, inicio=_formatar_data(inicio, "iso"), fim=_formatar_data(fim, "iso"))

        if tipo == "estacao_variante":
            campo = rng.choice(["estacao_partida", "estacao_chegada"])
            suja[campo] = _variante_estacao(suja[campo], rng)
        elif tipo == "tipo_vazio":
            suja["tipo_cliente"] = ""
            limpa["tipo_cliente"] = "Desconhecido"
        elif tipo == "tipo_variante":
            suja["tipo_cliente"] = rng.choice(
                [tipo_cliente.lower(), tipo_cliente.upper(), f" {tipo_cliente} "]
            )
        elif tipo == "valor_vazio":
            suja["valor_eur"] = ""
            limpa["valor_eur"] = ""
        elif tipo == "valor_virgula":
            suja["valor_eur"] = suja["valor_eur"].replace(".", ",")

        sujas.append(suja)
        if tipo == "duplicadas":
            sujas.append(dict(suja))  # linha igual, mesmo viagem_id
        if tipo not in ("duracao_impossivel", "fim_antes_inicio"):
            limpas.append(limpa)

    return sujas, limpas, contagens


def escrever_bicicletas():
    sujas, limpas, contagens = gerar_viagens_bicicletas()
    for nome, linhas in (("bicicletas_viagens_sujas.csv", sujas), ("bicicletas_viagens_limpas.csv", limpas)):
        with open(PASTA_DADOS / nome, "w", newline="", encoding="utf-8") as f:
            escritor = csv.DictWriter(f, fieldnames=COLUNAS_BICICLETAS)
            escritor.writeheader()
            escritor.writerows(linhas)
    return len(sujas), len(limpas), contagens


def main():
    random.seed(SEMENTE)
    PASTA_DADOS.mkdir(exist_ok=True)
    gerar_produtos()
    _, n_clientes = gerar_clientes()
    _, n_vendas = gerar_vendas(n_clientes)
    _, n_sazonais = gerar_vendas_sazonais(n_clientes)
    n_sujas, n_limpas, _ = escrever_bicicletas()
    print(f"Dados criados em {PASTA_DADOS}")
    print(
        f"  produtos: {len(PRODUTOS)} | clientes: {n_clientes} | "
        f"vendas base: {n_vendas} | vendas sazonais: {n_sazonais}"
    )
    print(f"  bicicletas: {n_sujas} viagens sujas | {n_limpas} viagens limpas")


if __name__ == "__main__":
    main()
