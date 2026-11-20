import type { PythonChallengeSpec } from './types';

// Treinos da trilha 8 (projeto final). Usam o mesmo ficheiro da etapa 1,
// dados/bicicletas_viagens_sujas.csv. As verificações com correr_com(...) trocam o ficheiro
// por uma tabela pequena inventada: só passa quem calcula a partir dos dados.

const LOTE_RELATORIO =
  'pd.DataFrame({"viagem_id": ["V1", "V1", "V2", "V3"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:05", "14/03/2025 09:00", "14-03-2025 9h05"], "fim": ["2025-03-14 08:20", "2025-03-14 08:20", "14/03/2025 09:00", "14-03-2025 9h15"], "estacao_partida": ["Estação Central", "Estação Central", "EST. RIBEIRA", "Estação Farol"], "estacao_chegada": ["Estação Farol", "Estação Farol", "Estação Farol", "estacao farol"], "duracao_min": [15, 15, 0, 10], "tipo_cliente": ["Anual", "Anual", None, "anual"], "valor_eur": ["0.00", "0.00", None, "1,50"]})';

const LOTE_ANALISE =
  'pd.DataFrame({"viagem_id": ["V1", "V2", "V3", "V3", "V4", "V5"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:40", "2025-03-14 17:05", "2025-03-14 17:05", "2025-03-14 17:30", "14/03/2025 17:45"], "fim": ["2025-03-14 08:20", "2025-03-14 09:00", "2025-03-14 17:30", "2025-03-14 17:30", "2025-03-14 17:30", "14/03/2025 18:00"], "estacao_partida": ["Estação Farol", "Estação Farol", "Estação Central", "Estação Central", "Estação Central", "Estação Central"], "estacao_chegada": ["Estação Central", "Estação Central", "Estação Farol", "Estação Farol", "Estação Farol", "Estação Farol"], "duracao_min": [15, 20, 25, 25, 0, 15], "tipo_cliente": ["Anual", "Ocasional", "Anual", "Anual", "Anual", "Anual"], "valor_eur": ["0.00", "2.00", "0.00", "0.00", "0.00", "0.00"]})';

export const projetoPractice: Record<string, PythonChallengeSpec[]> = {
  'pf-01-limpeza-bicicletas': [
    {
      title: 'Relatório de qualidade',
      description:
        'Antes de limpar, mede o estrago em dados/bicicletas_viagens_sujas.csv. Preenche o dicionário relatorio com quantas linhas têm cada problema: "duplicadas" (linhas a mais com um viagem_id que já apareceu, com .duplicated()), "duracao_impossivel" (duracao_min <= 0 ou > 1440), "data_formato_dd_mm" (inicio com "/"), "data_formato_h" (inicio com "h"), "estacao_variante" (partida ou chegada fora da lista estacoes_oficiais), "tipo_vazio" (tipo_cliente em falta), "tipo_variante" (tipo_cliente preenchido mas diferente de "Anual" e "Ocasional"), "valor_vazio" (valor_eur em falta) e "valor_virgula" (valor_eur com vírgula). As viagens com fim antes do início ficam para o desafio principal, porque precisam das datas convertidas.',
      starterCode: `import pandas as pd

estacoes_oficiais = [
    "Estação Central", "Estação Jardim Botânico", "Estação Ribeira", "Estação Universidade",
    "Estação São Bento", "Estação do Mercado", "Estação Praça Nova", "Estação Farol",
    "Estação Parque Verde", "Estação Hospital", "Estação Avenida da Liberdade", "Estação Cais do Sodré",
]

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

relatorio = {
    "duplicadas": None,
    "duracao_impossivel": None,
    "data_formato_dd_mm": None,
    "data_formato_h": None,
    "estacao_variante": None,
    "tipo_vazio": None,
    "tipo_variante": None,
    "valor_vazio": None,
    "valor_virgula": None,
}
print(relatorio)`,
      solutionCode: `import pandas as pd

estacoes_oficiais = [
    "Estação Central", "Estação Jardim Botânico", "Estação Ribeira", "Estação Universidade",
    "Estação São Bento", "Estação do Mercado", "Estação Praça Nova", "Estação Farol",
    "Estação Parque Verde", "Estação Hospital", "Estação Avenida da Liberdade", "Estação Cais do Sodré",
]

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

tipo = viagens["tipo_cliente"]
fora_da_lista = ~viagens["estacao_partida"].isin(estacoes_oficiais) | ~viagens["estacao_chegada"].isin(estacoes_oficiais)

relatorio = {
    "duplicadas": int(viagens["viagem_id"].duplicated().sum()),
    "duracao_impossivel": int(((viagens["duracao_min"] <= 0) | (viagens["duracao_min"] > 1440)).sum()),
    "data_formato_dd_mm": int(viagens["inicio"].str.contains("/").sum()),
    "data_formato_h": int(viagens["inicio"].str.contains("h").sum()),
    "estacao_variante": int(fora_da_lista.sum()),
    "tipo_vazio": int(tipo.isna().sum()),
    "tipo_variante": int((tipo.notna() & ~tipo.isin(["Anual", "Ocasional"])).sum()),
    "valor_vazio": int(viagens["valor_eur"].isna().sum()),
    "valor_virgula": int(viagens["valor_eur"].str.contains(",", na=False).sum()),
}
print(relatorio)`,
      checks: [
        {
          label: 'duplicadas (300) e duracao_impossivel (200)',
          expr: 'relatorio["duplicadas"] == 300 and relatorio["duracao_impossivel"] == 200',
          actualExpr: '(relatorio["duplicadas"], relatorio["duracao_impossivel"])',
          hint: 'viagens["viagem_id"].duplicated().sum() e a soma da máscara (duracao_min <= 0) | (duracao_min > 1440).',
        },
        {
          label: 'Datas fora do formato: 1 600 com "/" e 1 200 com "h"',
          expr: 'relatorio["data_formato_dd_mm"] == 1600 and relatorio["data_formato_h"] == 1200',
          actualExpr: '(relatorio["data_formato_dd_mm"], relatorio["data_formato_h"])',
          hint: 'viagens["inicio"].str.contains("/").sum() e o mesmo com "h".',
        },
        {
          label: 'estacao_variante: 2 000 linhas com uma estação fora da lista',
          expr: 'relatorio["estacao_variante"] == 2000',
          actualExpr: 'relatorio["estacao_variante"]',
          hint: 'Junta as duas máscaras com |: ~viagens["estacao_partida"].isin(estacoes_oficiais) | ~viagens["estacao_chegada"].isin(estacoes_oficiais).',
        },
        {
          label: 'tipo_cliente (600 vazios e 1 600 variantes) e valor_eur (500 vazios e 800 com vírgula)',
          expr: 'relatorio["tipo_vazio"] == 600 and relatorio["tipo_variante"] == 1600 and relatorio["valor_vazio"] == 500 and relatorio["valor_virgula"] == 800',
          actualExpr:
            '(relatorio["tipo_vazio"], relatorio["tipo_variante"], relatorio["valor_vazio"], relatorio["valor_virgula"])',
          hint: '.isna().sum() para os vazios; para as variantes, preenchido (.notna()) e fora de ["Anual", "Ocasional"]; para a vírgula, .str.contains(",", na=False).',
        },
        {
          label: 'O relatório funciona com outro lote',
          expr: `(lambda r: {k: int(v) for k, v in r["relatorio"].items()} == {"duplicadas": 1, "duracao_impossivel": 1, "data_formato_dd_mm": 1, "data_formato_h": 1, "estacao_variante": 2, "tipo_vazio": 1, "tipo_variante": 1, "valor_vazio": 1, "valor_virgula": 1})(correr_com(viagens=${LOTE_RELATORIO}))`,
          actualExpr: `correr_com(viagens=${LOTE_RELATORIO}).get("relatorio")`,
          hint: 'Conta tudo a partir de viagens, sem escrever os números à mão.',
        },
      ],
    },
    {
      title: 'Amostra de hora de ponta (sem spoilers da limpeza)',
      description:
        'Sem precisar da limpeza completa das estações e dos 3 formatos de data, responde já sobre a amostra já bem formatada (15 998 linhas): fica só com as linhas únicas por viagem_id, com inicio já no formato ISO ("%Y-%m-%d %H:%M", usando errors="coerce" e .notna()), estacao_partida dentro de estacoes_oficiais e duracao_min entre 1 e 1440. Depois guarda em hora_de_ponta a hora com mais partidas (.dt.hour), em viagens_hora_de_ponta quantas viagens começaram nessa hora e em estacao_mais_usada a estação de partida com mais viagens.',
      starterCode: `import pandas as pd

estacoes_oficiais = [
    "Estação Central", "Estação Jardim Botânico", "Estação Ribeira", "Estação Universidade",
    "Estação São Bento", "Estação do Mercado", "Estação Praça Nova", "Estação Farol",
    "Estação Parque Verde", "Estação Hospital", "Estação Avenida da Liberdade", "Estação Cais do Sodré",
]

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

hora_de_ponta = None
viagens_hora_de_ponta = None
estacao_mais_usada = None
print(hora_de_ponta, viagens_hora_de_ponta, estacao_mais_usada)`,
      solutionCode: `import pandas as pd

estacoes_oficiais = [
    "Estação Central", "Estação Jardim Botânico", "Estação Ribeira", "Estação Universidade",
    "Estação São Bento", "Estação do Mercado", "Estação Praça Nova", "Estação Farol",
    "Estação Parque Verde", "Estação Hospital", "Estação Avenida da Liberdade", "Estação Cais do Sodré",
]

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

df = viagens.drop_duplicates(subset="viagem_id").copy()
df["inicio_dt"] = pd.to_datetime(df["inicio"], format="%Y-%m-%d %H:%M", errors="coerce")
amostra = df[
    df["inicio_dt"].notna()
    & df["estacao_partida"].isin(estacoes_oficiais)
    & (df["duracao_min"] > 0)
    & (df["duracao_min"] <= 1440)
]

por_hora = amostra["inicio_dt"].dt.hour.value_counts()
hora_de_ponta = int(por_hora.idxmax())
viagens_hora_de_ponta = int(por_hora.max())
estacao_mais_usada = str(amostra["estacao_partida"].value_counts().idxmax())
print("Hora de ponta:", hora_de_ponta, "com", viagens_hora_de_ponta, "viagens")
print("Estação mais usada:", estacao_mais_usada)`,
      checks: [
        {
          label: 'hora_de_ponta: 8, ou seja, das 8h00 às 8h59',
          expr: 'int(hora_de_ponta) == 8',
          actualExpr: 'hora_de_ponta',
          hint: 'amostra["inicio_dt"].dt.hour.value_counts().idxmax().',
        },
        {
          label: 'viagens_hora_de_ponta: 1 912 viagens na amostra ISO',
          expr: 'int(viagens_hora_de_ponta) == 1912',
          actualExpr: 'viagens_hora_de_ponta',
          hint: 'Confirma que tiraste duplicados por viagem_id, filtraste datas ISO, estações oficiais e duracao_min entre 1 e 1440.',
        },
        {
          label: 'estacao_mais_usada: "Estação Central" (3 634 partidas na amostra)',
          expr: 'estacao_mais_usada == "Estação Central"',
          actualExpr: 'estacao_mais_usada',
          hint: 'amostra["estacao_partida"].value_counts().idxmax().',
        },
        {
          label: 'A análise funciona com outro lote',
          expr: `(lambda r: int(r["hora_de_ponta"]) == 8 and int(r["viagens_hora_de_ponta"]) == 2 and r["estacao_mais_usada"] == "Estação Farol")(correr_com(viagens=${LOTE_ANALISE}))`,
          actualExpr: `(lambda r: (r.get("hora_de_ponta"), r.get("viagens_hora_de_ponta"), r.get("estacao_mais_usada")))(correr_com(viagens=${LOTE_ANALISE}))`,
          hint: 'Usa o mesmo filtro sobre viagens sem escrever os resultados à mão.',
        },
      ],
    },
  ],
};
