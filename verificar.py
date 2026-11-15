"""Verificador dos exercícios das lições.

Uso (a partir da pasta do projeto):
    python verificar.py        -> verifica todas as semanas
    python verificar.py 5      -> verifica só a semana 5
"""

import math
import runpy
import sys
import traceback
from pathlib import Path

PASTA = Path(__file__).resolve().parent / "exercicios"


def perto(valor, esperado):
    """Compara números com tolerância (os float têm pequenos erros de arredondamento)."""
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        return False
    return math.isclose(valor, esperado, abs_tol=0.005)


# semana -> (ficheiro, [(variável, teste, dica)])
TESTES = {
    3: ("semana03_variaveis.py", [
        ("preco_pao", lambda v: perto(v, 0.25), "25 cêntimos são 0.25 euros (com ponto, não vírgula)."),
        ("quantidade", lambda v: v == 10 and isinstance(v, int), "É um número inteiro: 10, sem aspas."),
        ("total", lambda v: perto(v, 2.5), "Multiplique preco_pao por quantidade."),
        ("colado", lambda v: v == "22", 'Texto + texto cola: "2" + "2".'),
        ("somado", lambda v: v == 4 and not isinstance(v, str), 'Use int("2") para transformar o papel em número.'),
        ("nome_loja", lambda v: v == "Mercearia do Bairro", "Texto entre aspas, com as maiúsculas iguais."),
    ]),
    4: ("semana04_conversoes.py", [
        ("valor_pago", lambda v: perto(v, 20), "Use float(valor_pago_texto)."),
        ("troco", lambda v: perto(v, 6.25), "valor_pago menos total_compra."),
        ("mensagem", lambda v: v == "Troco: 6.25 €", 'f"Troco: {troco} €" (atenção aos espaços e ao símbolo €).'),
        ("mensagem_divisao", lambda v: v == "Preço por pessoa: 4.58 €", "Dentro das chavetas: {total_compra / 3:.2f}"),
    ]),
    5: ("semana05_condicoes.py", [
        ("desconto_pct", lambda v: v == 5, "37.5 não é <= 20, mas é <= 50: cai no elif."),
        ("total_final", lambda v: perto(v, 35.625), "total - total * desconto_pct / 100"),
        ("pode_entrar", lambda v: v is False, "17 não é >= 18. Pode escrever: pode_entrar = idade >= 18"),
        ("entrega_gratis", lambda v: v is True, 'Duas condições ligadas por and: total > 30 and cidade == "Porto"'),
    ]),
    6: ("semana06_ciclo_for.py", [
        ("soma_1_a_100", lambda v: v == 5050, "range(1, 101): o último número fica de fora."),
        ("quantas_acima_100", lambda v: v == 3, "Superior a 100 é > 100 (a venda de exatamente 100 não conta)."),
        ("maior_venda", lambda v: v == 310, "Dentro do ciclo: se a venda for maior do que maior_venda, guarde-a."),
        ("descontos", lambda v: v == [0, 5, 10], "Um ciclo sobre totais, com if/elif/else lá dentro e descontos.append(...)."),
    ]),
    7: ("semana07_while.py", [
        ("total_vendas", lambda v: perto(v, 900), "total_vendas = total_vendas + venda, dentro do ciclo."),
        ("media_vendas", lambda v: perto(v, 150), "total_vendas / len(vendas)"),
        ("semanas", lambda v: v == 12, "while saldo < 500: junte 35 ao saldo e 1 às semanas."),
        ("saldo_final", lambda v: perto(v, 520), "Depois do ciclo: saldo_final = saldo"),
    ]),
    8: ("semana08_listas.py", [
        ("primeiro", lambda v: v == "Pão", "Use produtos[0] para obter o primeiro elemento."),
        ("ultimo", lambda v: v == "Café", "Use produtos[-1] para obter o último elemento."),
        ("tres_primeiros", lambda v: v == ["Pão", "Leite", "Ovos (dúzia)"], "Use uma fatia: produtos[:3]."),
        ("precos_caros", lambda v: v == [2.35, 7.5, 3.4], "[p for p in precos if p > 1.50]"),
        ("precos_desc", lambda v: v == [7.5, 3.4, 2.35, 1.2, 0.89, 0.25], "sorted(precos, reverse=True)"),
    ]),
    9: ("semana09_dicionarios.py", [
        ("preco_azeite", lambda v: perto(v, 7.50), 'precos["Azeite"]'),
        ("preco_chocolate", lambda v: perto(v, 0.0), 'precos.get("Chocolate", 0.0)'),
        ("unidades_por_produto", lambda v: v == {"Pão": 6, "Leite": 2, "Café": 1, "Azeite": 1}, "Use unidades_por_produto.get(prod, 0) + qtd num ciclo for."),
        ("total_talao", lambda v: perto(v, 14.18), "Some qtd * precos[prod] para cada par do talão."),
    ]),
    10: ("semana10_funcoes.py", [
        ("calcular_subtotal", lambda fn: callable(fn) and fn(3, 0.89) is not None and perto(fn(3, 0.89), 2.67), "Devolva round(quantidade * preco, 2) com return."),
        ("limpar_nome_produto", lambda fn: callable(fn) and fn("  pão ") == "Pão", "Use texto.strip().capitalize()."),
        ("aplicar_iva", lambda fn: callable(fn) and fn(10.0) is not None and perto(fn(10.0), 12.30) and perto(fn(10.0, 0.06), 10.60), "Devolva round(valor * (1 + taxa), 2)."),
    ]),
    11: ("semana11_csv.py", [
        ("lista_produtos", lambda v: isinstance(v, list) and len(v) == 15 and isinstance(v[0], dict), "Leia csv.DictReader(f) para dentro de list(...)."),
        ("num_produtos", lambda v: v == 15, "len(lista_produtos)"),
        ("produto_mais_caro", lambda v: v == "Azeite", "Compare float(p['preco']) para encontrar o maior."),
        ("qtd_categoria_mercearia", lambda v: v == 6, "Conte quantos dicionários têm p['categoria'] == 'Mercearia'."),
    ]),
    12: ("semana12_estatistica.py", [
        ("media", lambda v: perto(v, 9.4778), "statistics.mean(taloes_amostra)"),
        ("mediana", lambda v: perto(v, 4.80), "statistics.median(taloes_amostra)"),
        ("desvio_padrao", lambda v: perto(v, 14.66), "round(statistics.stdev(taloes_amostra), 2)"),
        ("amplitude", lambda v: perto(v, 46.80), "max(taloes_amostra) - min(taloes_amostra)"),
    ]),
}


def verificar(semana):
    ficheiro, testes = TESTES[semana]
    print(f"\n=== Semana {semana}: {ficheiro} ===")
    try:
        # Corre o ficheiro de exercícios e fica com as variáveis que ele criou.
        variaveis = runpy.run_path(str(PASTA / ficheiro))
    except Exception:
        ultima = traceback.format_exc().strip().splitlines()[-1]
        print("  O ficheiro deu erro antes de acabar:")
        print(f"    {ultima}")
        print("  Dica: corra o ficheiro diretamente e leia o erro de baixo para cima.")
        return 0, len(testes)

    certos = 0
    for nome, teste, dica in testes:
        valor = variaveis.get(nome)
        try:
            passou = valor is not None and teste(valor)
        except Exception:
            passou = False
        if passou:
            certos += 1
            print(f"  [certo]      {nome}")
        elif valor is None:
            print(f"  [por fazer]  {nome}")
        else:
            print(f"  [errado]     {nome} = {valor!r}")
            print(f"               Dica: {dica}")
    print(f"  Resultado: {certos}/{len(testes)}")
    return certos, len(testes)


def main():
    if len(sys.argv) > 1:
        try:
            semanas = [int(sys.argv[1])]
        except ValueError:
            semanas = []
        if not semanas or semanas[0] not in TESTES:
            print(f"Semanas disponíveis: {sorted(TESTES)}")
            return 1
    else:
        semanas = sorted(TESTES)

    certos = total = 0
    for semana in semanas:
        c, t = verificar(semana)
        certos += c
        total += t
    print(f"\nTotal: {certos}/{total}")
    if certos == total:
        print("Tudo certo. Faça um commit e avance para a lição seguinte.")
    return 0 if certos == total else 1


if __name__ == "__main__":
    sys.exit(main())
