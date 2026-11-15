"""Testes do gerador de dados: os CSV têm de ser reprodutíveis e coerentes."""

import csv
from datetime import date

import pytest

import gerar_dados
from conftest import RAIZ


@pytest.fixture(scope="module")
def pasta_gerada(tmp_path_factory):
    pasta = tmp_path_factory.mktemp("dados")
    original = gerar_dados.PASTA_DADOS
    gerar_dados.PASTA_DADOS = pasta
    try:
        gerar_dados.main()
    finally:
        gerar_dados.PASTA_DADOS = original
    return pasta


def ler(pasta, nome):
    with open(pasta / nome, encoding="utf-8") as f:
        return list(csv.DictReader(f))


@pytest.mark.parametrize("nome", ["produtos.csv", "clientes.csv", "vendas.csv", "vendas_sazonais.csv"])
def test_dados_sao_reprodutiveis(pasta_gerada, nome):
    """Com a semente 42, gerar de novo dá exatamente os ficheiros publicados em dados/."""
    novo = (pasta_gerada / nome).read_bytes().replace(b"\r\n", b"\n")
    publicado = (RAIZ / "dados" / nome).read_bytes().replace(b"\r\n", b"\n")
    assert novo == publicado


def test_numero_de_vendas_base(pasta_gerada):
    assert len(ler(pasta_gerada, "vendas.csv")) == 5078


@pytest.mark.parametrize("nome", ["vendas.csv", "vendas_sazonais.csv"])
def test_vendas_sao_coerentes(pasta_gerada, nome):
    produtos = {p["id"]: p for p in ler(pasta_gerada, "produtos.csv")}
    clientes = {c["id"] for c in ler(pasta_gerada, "clientes.csv")}
    for v in ler(pasta_gerada, nome):
        assert v["cliente_id"] in clientes
        assert v["produto_id"] in produtos
        assert v["produto"] == produtos[v["produto_id"]]["nome"]
        assert float(v["preco"]) == float(produtos[v["produto_id"]]["preco"])
        assert int(v["quantidade"]) > 0
        assert date.fromisoformat(v["data"]).year == 2025


def test_sazonalidade_dezembro_maior_que_fevereiro(pasta_gerada):
    vendas = ler(pasta_gerada, "vendas_sazonais.csv")
    fat = lambda mes: sum(int(v["quantidade"]) * float(v["preco"]) for v in vendas if v["data"][5:7] == mes)
    assert fat("12") > fat("02") * 1.5
