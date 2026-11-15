"""Testes da Fase 2: esquema normalizado e respostas das perguntas de negócio."""

import re
import sqlite3

import pytest

import carregar_base
from conftest import RAIZ


@pytest.fixture(scope="module")
def db():
    ligacao = sqlite3.connect(":memory:")
    carregar_base.carregar(ligacao)
    yield ligacao
    ligacao.close()


def perguntas():
    """Divide sql/02_perguntas_negocio.sql em {número: query}."""
    texto = (RAIZ / "sql" / "02_perguntas_negocio.sql").read_text(encoding="utf-8")
    blocos = re.split(r"\n(?=-- \d+\. )", texto)
    return {int(re.match(r"-- (\d+)\.", b).group(1)): b for b in blocos if re.match(r"-- \d+\.", b)}


def correr(db, n):
    return db.execute(perguntas()[n]).fetchall()


def test_vendas_nao_guarda_o_nome_do_produto(db):
    colunas = [c[1] for c in db.execute("PRAGMA table_info(vendas)")]
    assert "produto" not in colunas
    assert "preco" in colunas  # preço histórico da venda: fica


def test_vista_vendas_detalhe(db):
    assert db.execute("SELECT COUNT(*) FROM vendas_detalhe").fetchone()[0] == 5078
    nome, cat = db.execute("SELECT produto, categoria FROM vendas_detalhe WHERE produto_id = 1 LIMIT 1").fetchone()
    assert (nome, cat) == ("Pão", "Padaria")


def test_chaves_estrangeiras_validas(db):
    assert db.execute("PRAGMA foreign_key_check").fetchall() == []


def test_csv_incoerente_e_recusado(tmp_path, monkeypatch):
    for nome in ("produtos.csv", "clientes.csv"):
        (tmp_path / nome).write_bytes((RAIZ / "dados" / nome).read_bytes())
    (tmp_path / "vendas.csv").write_text(
        "data,cliente_id,produto_id,produto,quantidade,preco\n2025-01-01,1,1,Leite,1,0.25\n", encoding="utf-8"
    )
    monkeypatch.setattr(carregar_base, "PASTA_DADOS", tmp_path)
    with pytest.raises(ValueError, match="não corresponde"):
        carregar_base.carregar(sqlite3.connect(":memory:"))


def test_existem_10_perguntas():
    assert sorted(perguntas()) == list(range(1, 11))


@pytest.mark.parametrize("n", [1, 2, 3, 4, 5, 6, 8, 9, 10])
def test_perguntas_devolvem_resultados(db, n):
    assert correr(db, n)


def test_p7_todos_os_clientes_compraram(db):
    """Com a semente 42 os 120 clientes têm compras, por isso o LEFT JOIN ... IS NULL vem vazio."""
    assert correr(db, 7) == []


# Os valores "esperado" escritos nos comentários do ficheiro SQL têm de ser verdade.
def test_p1_faturacao_total(db):
    assert correr(db, 1) == [(26902.89,)]


def test_p2_produto_mais_vendido(db):
    assert correr(db, 2) == [("Leite", 960)]


def test_p3_melhor_dia(db):
    assert correr(db, 3) == [("2025-09-14", 217.97)]


def test_p4_media_por_linha(db):
    assert correr(db, 4) == [(5.3,)]


def test_p5_quotas_somam_100(db):
    assert sum(r[-1] for r in correr(db, 5)) == pytest.approx(100, abs=0.05)


def test_p10_acumulado_final_igual_ao_total(db):
    assert correr(db, 10)[-1][-1] == pytest.approx(26902.89, abs=0.01)
