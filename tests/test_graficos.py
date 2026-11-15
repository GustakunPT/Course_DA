"""Testes da Fase 4: os gráficos são gerados e a curva ABC é coerente."""

import pytest

import graficos


def test_gera_os_quatro_graficos(tmp_path):
    criados = graficos.gerar_graficos(tmp_path)
    assert [c.name for c in criados] == [
        "faturacao_mensal.png",
        "faturacao_categoria.png",
        "curva_abc.png",
        "distribuicao_vendas.png",
    ]
    for caminho in criados:
        assert caminho.read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"
        assert caminho.stat().st_size > 10_000


def test_curva_abc():
    abc = graficos.curva_abc(graficos.carregar_vendas())
    assert abc["pct_acumulada"].iloc[-1] == pytest.approx(100)
    assert abc["pct_acumulada"].is_monotonic_increasing
    assert list(abc["classe"].unique()) == ["A", "B", "C"]
    assert abc["faturacao"].sum() == pytest.approx(26902.89, abs=0.01)
