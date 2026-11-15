"""Fase 4: gráficos de estatística e BI com pandas + matplotlib.

Lê os CSV de dados/ e grava 4 gráficos PNG em relatorios/graficos/:
  1. faturacao_mensal.png      -> série sazonal vs série base, mês a mês
  2. faturacao_categoria.png   -> peso de cada categoria na faturação
  3. curva_abc.png             -> curva ABC (Pareto) dos produtos
  4. distribuicao_vendas.png   -> histograma do valor por linha (média vs mediana)

Como correr (precisa de: pip install -r requirements.txt):
    python src/graficos.py
"""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # gera ficheiros sem abrir janelas (funciona também no CI)
import matplotlib.pyplot as plt  # noqa: E402
import pandas as pd  # noqa: E402
from matplotlib.patches import Patch  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
PASTA_DADOS = RAIZ / "dados"
PASTA_GRAFICOS = RAIZ / "relatorios" / "graficos"

COR_PRINCIPAL = "#2563eb"
COR_SECUNDARIA = "#d97706"
COR_NEUTRA = "#94a3b8"


def carregar_vendas(nome="vendas.csv"):
    """Lê um ficheiro de vendas e acrescenta as colunas subtotal e mes."""
    vendas = pd.read_csv(PASTA_DADOS / nome, parse_dates=["data"])
    vendas["subtotal"] = vendas["quantidade"] * vendas["preco"]
    vendas["mes"] = vendas["data"].dt.month
    return vendas


def _estilo(ax, titulo, subtitulo=None):
    ax.set_title(titulo, loc="left", fontsize=13, fontweight="bold", pad=18 if subtitulo else 8)
    if subtitulo:
        ax.text(0, 1.02, subtitulo, transform=ax.transAxes, fontsize=9, color="#64748b")
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(axis="y", color="#e2e8f0", linewidth=0.8)
    ax.set_axisbelow(True)


def _euros(valor, _pos=None):
    return f"{valor:,.0f} €".replace(",", " ")


def grafico_faturacao_mensal(base, sazonal, destino):
    meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
    por_mes_base = base.groupby("mes")["subtotal"].sum().reindex(range(1, 13), fill_value=0)
    por_mes_saz = sazonal.groupby("mes")["subtotal"].sum().reindex(range(1, 13), fill_value=0)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(meses, por_mes_saz.values, marker="o", color=COR_PRINCIPAL, linewidth=2.5, label="Sazonal (realista)")
    ax.plot(meses, por_mes_base.values, marker="o", color=COR_NEUTRA, linewidth=1.8, label="Base (uniforme)")
    pico = por_mes_saz.idxmax()
    ax.annotate(
        f"Pico: {_euros(por_mes_saz.max())}",
        xy=(pico - 1, por_mes_saz.max()),
        xytext=(-110, -6),
        textcoords="offset points",
        fontsize=9,
        color=COR_PRINCIPAL,
        arrowprops={"arrowstyle": "->", "color": COR_PRINCIPAL},
    )
    ax.set_ylim(bottom=0)  # eixo a começar em zero para não exagerar diferenças
    ax.yaxis.set_major_formatter(_euros)
    ax.legend(frameon=False)
    _estilo(ax, "Faturação mensal em 2025", "Verão e Natal puxam a série sazonal para cima")
    fig.tight_layout()
    fig.savefig(destino, dpi=150)
    plt.close(fig)


def grafico_faturacao_categoria(vendas, produtos, destino):
    juntas = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")
    por_cat = juntas.groupby("categoria")["subtotal"].sum().sort_values()
    quota = por_cat / por_cat.sum() * 100

    fig, ax = plt.subplots(figsize=(9, 4.8))
    barras = ax.barh(por_cat.index, por_cat.values, color=COR_PRINCIPAL)
    for barra, pct in zip(barras, quota.values):
        ax.text(barra.get_width(), barra.get_y() + barra.get_height() / 2, f"  {pct:.1f}%", va="center", fontsize=9)
    ax.xaxis.set_major_formatter(_euros)
    _estilo(ax, "Faturação por categoria", "Série base, 2025")
    ax.grid(axis="y", visible=False)
    ax.grid(axis="x", color="#e2e8f0", linewidth=0.8)
    fig.tight_layout()
    fig.savefig(destino, dpi=150)
    plt.close(fig)


def curva_abc(vendas):
    """Devolve um DataFrame por produto com faturação, % acumulada e classe A/B/C."""
    por_prod = vendas.groupby("produto")["subtotal"].sum().sort_values(ascending=False).to_frame("faturacao")
    por_prod["pct_acumulada"] = por_prod["faturacao"].cumsum() / por_prod["faturacao"].sum() * 100
    por_prod["classe"] = pd.cut(por_prod["pct_acumulada"], bins=[0, 80, 95, 100.0001], labels=["A", "B", "C"])
    return por_prod


def grafico_curva_abc(vendas, destino):
    abc = curva_abc(vendas)
    cores = abc["classe"].map({"A": COR_PRINCIPAL, "B": COR_SECUNDARIA, "C": COR_NEUTRA})

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(abc.index, abc["faturacao"], color=cores)
    ax.yaxis.set_major_formatter(_euros)
    ax.tick_params(axis="x", rotation=45)
    for rotulo in ax.get_xticklabels():
        rotulo.set_ha("right")
    ax2 = ax.twinx()
    ax2.plot(abc.index, abc["pct_acumulada"], color="#0f172a", marker="o", linewidth=1.5)
    ax2.axhline(80, color=COR_PRINCIPAL, linestyle="--", linewidth=1)
    ax2.set_ylim(0, 105)
    ax2.set_ylabel("% acumulada")
    ax2.spines[["top"]].set_visible(False)
    legenda = [
        Patch(color=COR_PRINCIPAL, label="A: até 80%"),
        Patch(color=COR_SECUNDARIA, label="B: 80–95%"),
        Patch(color=COR_NEUTRA, label="C: últimos 5%"),
    ]
    ax.legend(handles=legenda, frameon=False, loc="center right")
    n_a = int((abc["classe"] == "A").sum())
    _estilo(ax, "Curva ABC dos produtos", f"{n_a} produtos (classe A) fazem ~80% da faturação")
    fig.tight_layout()
    fig.savefig(destino, dpi=150)
    plt.close(fig)


def grafico_distribuicao(vendas, destino):
    media = vendas["subtotal"].mean()
    mediana = vendas["subtotal"].median()

    fig, ax = plt.subplots(figsize=(9, 4.8))
    ax.hist(vendas["subtotal"], bins=30, color=COR_NEUTRA, edgecolor="white")
    ax.axvline(media, color=COR_SECUNDARIA, linewidth=2, label=f"Média: {media:.2f} €")
    ax.axvline(mediana, color=COR_PRINCIPAL, linewidth=2, linestyle="--", label=f"Mediana: {mediana:.2f} €")
    ax.set_xlabel("Valor da linha de venda (€)")
    ax.set_ylabel("N.º de linhas")
    ax.legend(frameon=False)
    _estilo(ax, "Distribuição do valor por linha", "Assimetria à direita: a média fica acima da mediana")
    fig.tight_layout()
    fig.savefig(destino, dpi=150)
    plt.close(fig)


def gerar_graficos(pasta_destino=PASTA_GRAFICOS):
    pasta_destino = Path(pasta_destino)
    pasta_destino.mkdir(parents=True, exist_ok=True)
    base = carregar_vendas("vendas.csv")
    sazonal = carregar_vendas("vendas_sazonais.csv")
    produtos = pd.read_csv(PASTA_DADOS / "produtos.csv")

    ficheiros = {
        "faturacao_mensal.png": lambda d: grafico_faturacao_mensal(base, sazonal, d),
        "faturacao_categoria.png": lambda d: grafico_faturacao_categoria(base, produtos, d),
        "curva_abc.png": lambda d: grafico_curva_abc(base, d),
        "distribuicao_vendas.png": lambda d: grafico_distribuicao(base, d),
    }
    criados = []
    for nome, desenhar in ficheiros.items():
        destino = pasta_destino / nome
        desenhar(destino)
        criados.append(destino)
    return criados


def main():
    for caminho in gerar_graficos():
        print(f"Gráfico criado: {caminho.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
