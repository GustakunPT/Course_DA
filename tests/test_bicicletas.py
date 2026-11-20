"""Testes do gerador das viagens de bicicletas (sujas e limpas)."""

import csv

import gerar_dados
from conftest import RAIZ


def test_e_deterministico():
    assert gerar_dados.gerar_viagens_bicicletas()[2] == gerar_dados.gerar_viagens_bicicletas()[2]


def test_tamanho_e_linhas_retiradas():
    sujas, limpas, c = gerar_dados.gerar_viagens_bicicletas()
    assert 19000 <= len(sujas) <= 21000
    assert len(limpas) == len(sujas) - c["duplicadas"] - c["duracao_impossivel"] - c["fim_antes_inicio"]


def test_cada_problema_aparece():
    _, _, c = gerar_dados.gerar_viagens_bicicletas()
    for chave in [
        "duplicadas",
        "duracao_impossivel",
        "fim_antes_inicio",
        "data_formato_dd_mm",
        "data_formato_h",
        "estacao_variante",
        "tipo_vazio",
        "tipo_variante",
        "valor_vazio",
        "valor_virgula",
    ]:
        assert c[chave] >= 30, chave


def test_versao_limpa_coerente():
    _, limpas, _ = gerar_dados.gerar_viagens_bicicletas()
    ids = [linha["viagem_id"] for linha in limpas]
    assert len(ids) == len(set(ids))
    assert {linha["tipo_cliente"] for linha in limpas} == {"Anual", "Ocasional", "Desconhecido"}
    assert all(linha["estacao_partida"].startswith("Estação ") for linha in limpas)
    assert all(0 < float(linha["duracao_min"]) <= 1440 for linha in limpas)


def test_mercearia_nao_mudou():
    with open(RAIZ / "dados" / "vendas.csv", encoding="utf-8") as f:
        total = sum(int(r["quantidade"]) * float(r["preco"]) for r in csv.DictReader(f))
    assert round(total, 2) == 26902.89
