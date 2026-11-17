import json
import os
from pathlib import Path

RAIZ_EXEMPLO = Path(__file__).resolve().parent.parent / "exemplo-projeto-turismo-algarve"


def _executar_caderno(caminho_nb: Path, cwd: Path) -> dict:
    nb = json.loads(caminho_nb.read_text(encoding="utf-8"))
    ns: dict = {}
    antigo = os.getcwd()
    try:
        os.chdir(cwd)
        for celula in nb["cells"]:
            if celula["cell_type"] == "code":
                codigo = "".join(celula["source"])
                exec(compile(codigo, str(caminho_nb), "exec"), ns)
    finally:
        os.chdir(antigo)
    return ns


def test_estrutura_e_readme_do_exemplo():
    esperados = [
        "README.md",
        "requirements.txt",
        ".gitignore",
        "dados/dormidas_algarve_bruto.csv",
        "dados/dormidas_algarve_limpo.csv",
        "cadernos/01_explorar_limpar.ipynb",
        "cadernos/02_analise.ipynb",
        "figuras/dormidas_por_mes.png",
    ]
    for rel in esperados:
        assert (RAIZ_EXEMPLO / rel).is_file(), f"Falta {rel}"

    readme = (RAIZ_EXEMPLO / "README.md").read_text(encoding="utf-8")
    assert len(readme.splitlines()) <= 40
    assert "CC BY 4.0" in readme
    assert "figuras/dormidas_por_mes.png" in readme


def test_cadernos_do_exemplo_correm_e_batem_com_readme(tmp_path):
    # Copia para tmp_path para não alterar os ficheiros do repositório durante o teste
    for sub in ("dados", "cadernos", "figuras"):
        (tmp_path / sub).mkdir()
    (tmp_path / "dados" / "dormidas_algarve_bruto.csv").write_bytes(
        (RAIZ_EXEMPLO / "dados" / "dormidas_algarve_bruto.csv").read_bytes()
    )
    nb1 = RAIZ_EXEMPLO / "cadernos" / "01_explorar_limpar.ipynb"
    nb2 = RAIZ_EXEMPLO / "cadernos" / "02_analise.ipynb"

    ns1 = _executar_caderno(nb1, tmp_path / "cadernos")
    assert ns1["removidas_duplicadas"] == 10
    assert ns1["removidas_sem_valor"] == 14
    assert len(ns1["df"]) == 562
    assert (tmp_path / "dados" / "dormidas_algarve_limpo.csv").is_file()

    ns2 = _executar_caderno(nb2, tmp_path / "cadernos")
    assert round(float(ns2["vezes_media"]), 1) == 2.3
    assert round(float(ns2["quota_verao_pct"]), 1) == 58.7
    assert (tmp_path / "figuras" / "dormidas_por_mes.png").is_file()

    readme = (RAIZ_EXEMPLO / "README.md").read_text(encoding="utf-8")
    assert "562 linhas" in readme
    assert "2,3 vezes" in readme
    assert "58,7%" in readme
