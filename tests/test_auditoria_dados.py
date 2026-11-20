"""Testes da auditoria de qualidade e da análise do dataset."""

import pytest

import auditoria_dados as aud


def linha(data="2025-01-01", produto="Pão", quantidade="1", preco="0.25"):
    return {"data": data, "produto": produto, "quantidade": quantidade, "preco": preco}


class TestAuditarVendasSujas:
    def test_linha_limpa_nao_tem_anomalias(self):
        assert sum(aud.auditar_vendas_sujas([linha()]).values()) == 0

    def test_valor_em_falta(self):
        assert aud.auditar_vendas_sujas([linha(quantidade="")])["valores_em_falta"] == 1

    def test_duplicado_exato(self):
        assert aud.auditar_vendas_sujas([linha(), linha()])["duplicados_exatos"] == 1

    def test_espacos_e_maiusculas(self):
        r = aud.auditar_vendas_sujas([linha(produto=" Pão "), linha(produto="PÃO", data="2025-01-02")])
        assert r["espacos_ou_capitalizacao"] == 2

    def test_virgula_decimal(self):
        assert aud.auditar_vendas_sujas([linha(preco="0,25")])["virgula_decimal"] == 1

    def test_preco_nao_positivo(self):
        assert aud.auditar_vendas_sujas([linha(preco="0")])["precos_nao_positivos"] == 1

    def test_preco_texto_nao_rebenta(self):
        aud.auditar_vendas_sujas([linha(preco="abc")])

    def test_ficheiro_real_tem_anomalias(self):
        r = aud.auditar_vendas_sujas(aud.carregar_csv("vendas_sujas.csv"))
        assert all(n > 0 for n in r.values()), r


PRODUTOS = [{"id": "1", "nome": "Pão", "categoria": "Padaria", "preco": "0.25"}]
CLIENTES = [{"id": "1", "nome": "Ana", "cidade": "Porto"}]


def venda(cliente="1", produto_id="1", quantidade="4", preco="0.25", data="2025-01-01"):
    return {
        "data": data,
        "cliente_id": cliente,
        "produto_id": produto_id,
        "produto": "Pão",
        "quantidade": quantidade,
        "preco": preco,
    }


class TestAnalisarDataset:
    def test_contas_basicas(self):
        r = aud.analisar_dataset([venda(), venda(quantidade="2", data="2025-02-01")], PRODUTOS, CLIENTES)
        assert r["total_fat"] == pytest.approx(1.5)
        assert r["n_linhas"] == 2
        assert r["melhor_dia"] == ("2025-01-01", pytest.approx(1.0))
        assert r["fat_por_cidade"]["Porto"] == pytest.approx(1.5)
        assert r["chaves_orfas"] == 0

    def test_venda_orfa_e_contada_mas_nao_rebenta(self):
        vendas = [venda(), venda(quantidade="2"), venda(cliente="999")]
        r = aud.analisar_dataset(vendas, PRODUTOS, CLIENTES)
        assert r["chaves_orfas"] == 1
        assert r["total_fat"] == pytest.approx(1.5)

    def test_numeros_do_readme(self):
        """O README promete 26 902,89 € em 5 078 vendas."""
        r = aud.analisar_dataset(
            aud.carregar_csv("vendas.csv"), aud.carregar_csv("produtos.csv"), aud.carregar_csv("clientes.csv")
        )
        assert r["n_linhas"] == 5078
        assert r["total_fat"] == pytest.approx(26902.89, abs=0.01)
        assert r["chaves_orfas"] == 0
