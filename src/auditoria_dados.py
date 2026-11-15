"""Fase 4 e 5: Verificações de qualidade, Relatório Executivo, Excel (.xlsx) e pacote Power BI (.pbip).

Analisa dados/vendas.csv, dados/vendas_sazonais.csv, dados/produtos.csv,
dados/clientes.csv e dados/vendas_sujas.csv e gera:
  - relatorios/relatorio_executivo_2025.md
  - relatorios/Dashboard_Mercearia_do_Bairro_2025.xlsx (5 folhas analíticas)
  - relatorios/PowerBI_Mercearia_do_Bairro_PBIP.zip (Projeto Power BI + TMDL + BIM)

Como correr:
    python src/auditoria_dados.py
"""

import csv
import statistics
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from xml.sax.saxutils import escape

RAIZ = Path(__file__).resolve().parent.parent
PASTA_DADOS = RAIZ / "dados"
PASTA_RELATORIOS = RAIZ / "relatorios"


def carregar_csv(nome):
    with open(PASTA_DADOS / nome, encoding="utf-8") as f:
        return list(csv.DictReader(f))


def auditar_vendas_sujas(linhas):
    anomalias = {
        "valores_em_falta": 0,
        "duplicados_exatos": 0,
        "espacos_ou_capitalizacao": 0,
        "virgula_decimal": 0,
        "precos_nao_positivos": 0,
    }
    vistas = set()
    for r in linhas:
        chave = (r["data"], r["produto"], r["quantidade"], r["preco"])
        if chave in vistas:
            anomalias["duplicados_exatos"] += 1
        vistas.add(chave)

        if not r["produto"].strip() or not r["quantidade"].strip() or not r["preco"].strip():
            anomalias["valores_em_falta"] += 1

        prod = r["produto"]
        if prod and (
            prod != prod.strip()
            or (prod != prod.strip().capitalize() and prod.strip().lower() == "pão" and prod.strip() != "Pão")
        ):
            anomalias["espacos_ou_capitalizacao"] += 1

        if "," in r["preco"]:
            anomalias["virgula_decimal"] += 1

        try:
            val = float(r["preco"].replace(",", "."))
            if val <= 0:
                anomalias["precos_nao_positivos"] += 1
        except ValueError:
            pass
    return anomalias


def _col_letter(idx):
    res = ""
    n = idx + 1
    while n > 0:
        n, rem = divmod(n - 1, 26)
        res = chr(65 + rem) + res
    return res


def _gerar_sheet_xml(rows):
    xml_rows = []
    for r_idx, row in enumerate(rows, start=1):
        cells = []
        style = ' s="1"' if r_idx == 1 else ""
        for c_idx, val in enumerate(row):
            ref = f"{_col_letter(c_idx)}{r_idx}"
            if isinstance(val, (int, float)) and not isinstance(val, bool):
                cells.append(f'<c r="{ref}"{style}><v>{val}</v></c>')
            else:
                texto = escape(str(val if val is not None else ""))
                cells.append(f'<c r="{ref}" t="inlineStr"{style}><is><t>{texto}</t></is></c>')
        xml_rows.append(f'<row r="{r_idx}">{"".join(cells)}</row>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<sheetData>{"".join(xml_rows)}</sheetData>'
        "</worksheet>"
    )


def criar_excel_multi_folha(caminho_xlsx, folhas):
    """Cria um ficheiro .xlsx OpenXML nativo com múltiplas folhas sem dependências externas."""
    content_types = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
        '<Default Extension="xml" ContentType="application/xml"/>',
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
    ]
    for i in range(1, len(folhas) + 1):
        content_types.append(
            f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
    content_types.append("</Types>")

    rels_root = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        "</Relationships>"
    )

    wb_sheets = []
    wb_rels = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    ]
    for i, (nome, _) in enumerate(folhas, start=1):
        wb_sheets.append(f'<sheet name="{escape(nome[:31])}" sheetId="{i}" r:id="rId{i}"/>')
        wb_rels.append(
            f'<Relationship Id="rId{i}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{i}.xml"/>'
        )
    wb_rels.append(
        f'<Relationship Id="rId{len(folhas) + 1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/></Relationships>'
    )

    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<sheets>{"".join(wb_sheets)}</sheets>'
        "</workbook>"
    )

    styles_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="2">'
        '<font><sz val="11"/><name val="Calibri"/></font>'
        '<font><b/><sz val="11"/><name val="Calibri"/></font>'
        "</fonts>"
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="2">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
        "</cellXfs>"
        "</styleSheet>"
    )

    with zipfile.ZipFile(caminho_xlsx, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", "".join(content_types))
        zf.writestr("_rels/.rels", rels_root)
        zf.writestr("xl/workbook.xml", workbook_xml)
        zf.writestr("xl/_rels/workbook.xml.rels", "".join(wb_rels))
        zf.writestr("xl/styles.xml", styles_xml)
        for i, (_, rows) in enumerate(folhas, start=1):
            zf.writestr(f"xl/worksheets/sheet{i}.xml", _gerar_sheet_xml(rows))


def empacotar_powerbi_zip(caminho_zip):
    pasta_pbi = PASTA_RELATORIOS / "powerbi"
    if not pasta_pbi.exists():
        return
    with zipfile.ZipFile(caminho_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for arq in sorted(pasta_pbi.rglob("*")):
            if arq.is_file():
                zf.write(arq, arq.relative_to(pasta_pbi))
        for csv_name in ("produtos.csv", "clientes.csv", "vendas.csv", "vendas_sazonais.csv"):
            p_csv = PASTA_DADOS / csv_name
            if p_csv.exists():
                zf.write(p_csv, f"dados/{csv_name}")


def analisar_dataset(vendas, produtos, clientes):
    ids_produtos = {p["id"] for p in produtos}
    ids_clientes = {c["id"] for c in clientes}
    cat_por_id = {p["id"]: p["categoria"] for p in produtos}
    cidade_por_cliente = {c["id"]: c["cidade"] for c in clientes}

    valores_linha = []
    qtd_por_produto = Counter()
    fat_por_produto = defaultdict(float)
    fat_por_categoria = defaultdict(float)
    fat_por_cidade = defaultdict(float)
    cli_por_cidade = defaultdict(set)
    fat_por_dia = defaultdict(float)
    fat_por_mes = defaultdict(float)
    cli_por_mes = defaultdict(set)
    chaves_orfas = 0

    for v in vendas:
        if v["produto_id"] not in ids_produtos or v["cliente_id"] not in ids_clientes:
            # Linha órfã: conta-se, mas não entra nas contas (não sabemos a categoria/cidade).
            chaves_orfas += 1
            continue
        qtd = int(v["quantidade"])
        preco = float(v["preco"])
        subtotal = qtd * preco
        valores_linha.append(subtotal)
        qtd_por_produto[v["produto"]] += qtd
        fat_por_produto[v["produto"]] += subtotal
        fat_por_categoria[cat_por_id[v["produto_id"]]] += subtotal
        cid = cidade_por_cliente[v["cliente_id"]]
        fat_por_cidade[cid] += subtotal
        cli_por_cidade[cid].add(v["cliente_id"])
        fat_por_dia[v["data"]] += subtotal
        mes = v["data"][:7]
        fat_por_mes[mes] += subtotal
        cli_por_mes[mes].add(v["cliente_id"])

    return {
        "total_fat": sum(valores_linha),
        "n_linhas": len(vendas),
        "media_linha": statistics.mean(valores_linha),
        "mediana_linha": statistics.median(valores_linha),
        "desvio_linha": statistics.stdev(valores_linha),
        "melhor_dia": max(fat_por_dia.items(), key=lambda kv: kv[1]),
        "prod_top_qtd": qtd_por_produto.most_common(1)[0],
        "prod_top_fat": max(fat_por_produto.items(), key=lambda kv: kv[1]),
        "qtd_por_produto": qtd_por_produto,
        "fat_por_produto": fat_por_produto,
        "fat_por_categoria": fat_por_categoria,
        "fat_por_cidade": fat_por_cidade,
        "cli_por_cidade": cli_por_cidade,
        "fat_por_mes": fat_por_mes,
        "cli_por_mes": cli_por_mes,
        "chaves_orfas": chaves_orfas,
    }


def gerar_relatorio():
    produtos = carregar_csv("produtos.csv")
    clientes = carregar_csv("clientes.csv")
    vendas_base = carregar_csv("vendas.csv")
    vendas_saz = carregar_csv("vendas_sazonais.csv")
    sujas = carregar_csv("vendas_sujas.csv")

    b = analisar_dataset(vendas_base, produtos, clientes)
    s = analisar_dataset(vendas_saz, produtos, clientes)
    anomalias = auditar_vendas_sujas(sujas)

    PASTA_RELATORIOS.mkdir(parents=True, exist_ok=True)
    destino_md = PASTA_RELATORIOS / "relatorio_executivo_2025.md"

    linhas_md = [
        "# Relatório Executivo e Auditoria de Qualidade — Mercearia do Bairro (2025)",
        "",
        "Gerado automaticamente por `src/auditoria_dados.py` (semente fixa `42`).",
        "",
        "## 1. Comparação entre os Dois Conjuntos de Dados",
        "",
        "| Indicador | Base Reconciliação (`vendas.csv`) | Série Sazonal Realista (`vendas_sazonais.csv`) |",
        "| --- | --- | --- |",
        f"| Faturação anual total | **{b['total_fat']:.2f} €** | **{s['total_fat']:.2f} €** |",
        f"| Linhas de venda registadas | **{b['n_linhas']}** | **{s['n_linhas']}** |",
        f"| Valor médio por linha | **{b['media_linha']:.2f} €** | **{s['media_linha']:.2f} €** |",
        f"| Mediana por linha | **{b['mediana_linha']:.2f} €** | **{s['mediana_linha']:.2f} €** |",
        f"| Produto mais vendido (unidades) | **{b['prod_top_qtd'][0]}** ({b['prod_top_qtd'][1]} un.) | **{s['prod_top_qtd'][0]}** ({s['prod_top_qtd'][1]} un.) |",
        f"| Produto líder em faturação | **{b['prod_top_fat'][0]}** ({b['prod_top_fat'][1]:.2f} €) | **{s['prod_top_fat'][0]}** ({s['prod_top_fat'][1]:.2f} €) |",
        f"| Dia recorde de faturação | **{b['melhor_dia'][0]}** ({b['melhor_dia'][1]:.2f} €) | **{s['melhor_dia'][0]}** ({s['melhor_dia'][1]:.2f} €) |",
        "",
        "## 2. Evolução Mensal e Sazonalidade (`vendas_sazonais.csv`)",
        "",
        "| Mês | Faturação Sazonal (€) | Clientes Ativos | Faturação Base Uniforme (€) |",
        "| --- | --- | --- | --- |",
    ]
    for mes in sorted(s["fat_por_mes"]):
        linhas_md.append(
            f"| {mes} | {s['fat_por_mes'][mes]:.2f} € | {len(s['cli_por_mes'][mes])} | {b['fat_por_mes'][mes]:.2f} € |"
        )

    linhas_md.extend([
        "",
        "## 3. Faturação por Categoria (`vendas_sazonais.csv`)",
        "",
        "| Categoria | Faturação Sazonal (€) | Quota (%) |",
        "| --- | --- | --- |",
    ])
    for cat, valor in sorted(s["fat_por_categoria"].items(), key=lambda kv: kv[1], reverse=True):
        quota = 100.0 * valor / s["total_fat"]
        linhas_md.append(f"| {cat} | {valor:.2f} € | {quota:.1f} % |")

    linhas_md.extend([
        "",
        "## 4. Auditoria de Integridade",
        "",
        f"- **`vendas.csv`**: {b['n_linhas']} registos verificados, **{b['chaves_orfas']}** chaves estrangeiras órfãs.",
        f"- **`vendas_sazonais.csv`**: {s['n_linhas']} registos verificados, **{s['chaves_orfas']}** chaves estrangeiras órfãs.",
        f"- **`vendas_sujas.csv`** ({len(sujas)} registos de teste de limpeza):",
        f"  - Células obrigatórias em falta: **{anomalias['valores_em_falta']}**",
        f"  - Linhas duplicadas exatas: **{anomalias['duplicados_exatos']}**",
        f"  - Problemas de espaços/capitalização: **{anomalias['espacos_ou_capitalizacao']}**",
        f"  - Preços com vírgula decimal: **{anomalias['virgula_decimal']}**",
        f"  - Preços nulos ou negativos: **{anomalias['precos_nao_positivos']}**",
        "",
        "## 5. Artefactos BI Gerados",
        "",
        "- **Excel Analítico:** `relatorios/Dashboard_Mercearia_do_Bairro_2025.xlsx`",
        "- **Projeto Power BI (PBIP + TMDL + BIM):** `relatorios/PowerBI_Mercearia_do_Bairro_PBIP.zip`",
        "",
    ])

    destino_md.write_text("\n".join(linhas_md), encoding="utf-8")

    # Gerar Excel Analítico multi-folha (.xlsx)
    folha_kpis = [
        ["Indicador", "Base Uniforme (vendas.csv)", "Sazonal Realista (vendas_sazonais.csv)"],
        ["Faturacao Anual Total (EUR)", round(b["total_fat"], 2), round(s["total_fat"], 2)],
        ["Linhas de Venda", b["n_linhas"], s["n_linhas"]],
        ["Ticket Medio por Linha (EUR)", round(b["media_linha"], 2), round(s["media_linha"], 2)],
        ["Mediana por Linha (EUR)", round(b["mediana_linha"], 2), round(s["mediana_linha"], 2)],
        ["Desvio Padrao (EUR)", round(b["desvio_linha"], 2), round(s["desvio_linha"], 2)],
        ["Produto Mais Vendido (Unidades)", b["prod_top_qtd"][0], s["prod_top_qtd"][0]],
        ["Produto Lider Faturacao", b["prod_top_fat"][0], s["prod_top_fat"][0]],
        ["Dia Recorde", b["melhor_dia"][0], s["melhor_dia"][0]],
    ]

    folha_mensal = [["Ano_Mes", "Faturacao_Sazonal_EUR", "Clientes_Ativos_Sazonal", "Faturacao_Base_EUR"]]
    for mes in sorted(s["fat_por_mes"]):
        folha_mensal.append([
            mes,
            round(s["fat_por_mes"][mes], 2),
            len(s["cli_por_mes"][mes]),
            round(b["fat_por_mes"][mes], 2),
        ])

    folha_abc = [["Produto", "Unidades_Sazonais", "Faturacao_Sazonal_EUR", "Quota_Pct", "Acumulado_Pct", "Classe_ABC"]]
    acum = 0.0
    for prod, val in sorted(s["fat_por_produto"].items(), key=lambda kv: kv[1], reverse=True):
        q_pct = round(100.0 * val / s["total_fat"], 2)
        acum = round(acum + q_pct, 2)
        classe = "A" if acum <= 75.0 else ("B" if acum <= 92.0 else "C")
        folha_abc.append([prod, s["qtd_por_produto"][prod], round(val, 2), q_pct, min(100.0, acum), classe])

    folha_cidades = [["Cidade", "Clientes_Ativos", "Faturacao_Sazonal_EUR", "Gasto_Medio_Cliente_EUR"]]
    for cid, val in sorted(s["fat_por_cidade"].items(), key=lambda kv: kv[1], reverse=True):
        n_cli = len(s["cli_por_cidade"][cid])
        folha_cidades.append([cid, n_cli, round(val, 2), round(val / max(1, n_cli), 2)])

    folha_dax = [
        ["Medida_DAX", "Pasta", "Expressao_DAX", "Formato"],
        ["Faturacao Total", "01. KPIs Globais", "SUMX(vendas_sazonais, vendas_sazonais[quantidade] * vendas_sazonais[preco])", "#,0.00 €"],
        ["Total Unidades", "01. KPIs Globais", "SUM(vendas_sazonais[quantidade])", "#,0"],
        ["Transacoes", "01. KPIs Globais", "COUNTROWS(vendas_sazonais)", "#,0"],
        ["Ticket Medio por Linha", "01. KPIs Globais", "DIVIDE([Faturacao Total], [Transacoes], 0)", "#,0.00 €"],
        ["Clientes Ativos", "02. Clientes & LTV", "DISTINCTCOUNT(vendas_sazonais[cliente_id])", "#,0"],
        ["Gasto Medio por Cliente", "02. Clientes & LTV", "DIVIDE([Faturacao Total], [Clientes Ativos], 0)", "#,0.00 €"],
        ["Quota Produto %", "03. Quotas & Time Intelligence", "DIVIDE([Faturacao Total], CALCULATE([Faturacao Total], ALL(produtos)), 0)", "0.00%"],
        ["Faturacao Acumulada YTD", "03. Quotas & Time Intelligence", "TOTALYTD([Faturacao Total], calendario[Date])", "#,0.00 €"],
    ]

    destino_xlsx = PASTA_RELATORIOS / "Dashboard_Mercearia_do_Bairro_2025.xlsx"
    criar_excel_multi_folha(
        destino_xlsx,
        [
            ("Resumo_KPIs", folha_kpis),
            ("Sazonalidade_Mensal", folha_mensal),
            ("Curva_ABC_Produtos", folha_abc),
            ("Analise_Cidades", folha_cidades),
            ("Medidas_DAX_PowerBI", folha_dax),
        ],
    )

    destino_pbi_zip = PASTA_RELATORIOS / "PowerBI_Mercearia_do_Bairro_PBIP.zip"
    empacotar_powerbi_zip(destino_pbi_zip)

    print(f"Relatorio gerado com sucesso em: {destino_md}")
    print(f"Dashboard Excel gerado em:      {destino_xlsx}")
    print(f"Pacote Power BI PBIP gerado em: {destino_pbi_zip}")


if __name__ == "__main__":
    gerar_relatorio()
