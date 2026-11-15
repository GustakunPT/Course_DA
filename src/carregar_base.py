"""Fase 2: cria uma base de dados SQLite normalizada a partir dos CSV.

Aplica sql/01_esquema.sql e carrega dados/produtos.csv, clientes.csv e vendas.csv.
A coluna "produto" do CSV de vendas não é guardada (o nome vem de produtos), mas é
usada para confirmar que o CSV é coerente com o catálogo antes de a descartar.

Como correr:
    python src/carregar_base.py                 -> cria mercearia.db na raiz do projeto
    python src/carregar_base.py outra.db        -> escolhe outro ficheiro

Depois pode abrir mercearia.db no DB Browser for SQLite, no DBeaver ou no VS Code
e correr as perguntas de sql/02_perguntas_negocio.sql.
"""

import csv
import sqlite3
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA_DADOS = RAIZ / "dados"
ESQUEMA = RAIZ / "sql" / "01_esquema.sql"


def _ler(nome):
    with open(PASTA_DADOS / nome, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def carregar(ligacao):
    """Cria as tabelas e carrega os CSV numa ligação SQLite já aberta."""
    ligacao.execute("PRAGMA foreign_keys = ON")
    ligacao.executescript(ESQUEMA.read_text(encoding="utf-8"))

    produtos = _ler("produtos.csv")
    nome_por_id = {p["id"]: p["nome"] for p in produtos}
    ligacao.executemany(
        "INSERT INTO produtos (id, nome, categoria, preco) VALUES (?, ?, ?, ?)",
        [(int(p["id"]), p["nome"], p["categoria"], float(p["preco"])) for p in produtos],
    )
    ligacao.executemany(
        "INSERT INTO clientes (id, nome, cidade) VALUES (?, ?, ?)",
        [(int(c["id"]), c["nome"], c["cidade"]) for c in _ler("clientes.csv")],
    )

    linhas = []
    for i, v in enumerate(_ler("vendas.csv"), start=1):
        if nome_por_id.get(v["produto_id"]) != v["produto"]:
            raise ValueError(
                f"Linha {i} de vendas.csv: produto '{v['produto']}' não corresponde ao "
                f"produto_id {v['produto_id']} do catálogo."
            )
        linhas.append((i, v["data"], int(v["cliente_id"]), int(v["produto_id"]), int(v["quantidade"]), float(v["preco"])))
    ligacao.executemany(
        "INSERT INTO vendas (id, data, cliente_id, produto_id, quantidade, preco) VALUES (?, ?, ?, ?, ?, ?)",
        linhas,
    )
    ligacao.commit()
    return len(linhas)


def main():
    destino = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "mercearia.db"
    destino.unlink(missing_ok=True)
    with sqlite3.connect(destino) as ligacao:
        n = carregar(ligacao)
    print(f"Base criada em {destino} com {n} vendas.")


if __name__ == "__main__":
    main()
