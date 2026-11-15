# Relatório Executivo e Auditoria de Qualidade — Mercearia do Bairro (2025)

Gerado automaticamente por `src/auditoria_dados.py` (semente fixa `42`).

## 1. Comparação entre os Dois Conjuntos de Dados

| Indicador | Base Reconciliação (`vendas.csv`) | Série Sazonal Realista (`vendas_sazonais.csv`) |
| --- | --- | --- |
| Faturação anual total | **26902.89 €** | **37426.47 €** |
| Linhas de venda registadas | **5078** | **7031** |
| Valor médio por linha | **5.30 €** | **5.32 €** |
| Mediana por linha | **3.50 €** | **3.40 €** |
| Produto mais vendido (unidades) | **Leite** (960 un.) | **Pão** (2969 un.) |
| Produto líder em faturação | **Azeite** (6262.50 €) | **Azeite** (8745.00 €) |
| Dia recorde de faturação | **2025-09-14** (217.97 €) | **2025-12-26** (402.55 €) |

## 2. Evolução Mensal e Sazonalidade (`vendas_sazonais.csv`)

| Mês | Faturação Sazonal (€) | Clientes Ativos | Faturação Base Uniforme (€) |
| --- | --- | --- | --- |
| 2025-01 | 2185.21 € | 53 | 2195.74 € |
| 2025-02 | 1593.22 € | 52 | 1968.99 € |
| 2025-03 | 2638.11 € | 64 | 2225.95 € |
| 2025-04 | 2983.12 € | 71 | 2151.05 € |
| 2025-05 | 2727.74 € | 74 | 2333.30 € |
| 2025-06 | 2953.59 € | 76 | 2187.66 € |
| 2025-07 | 2955.98 € | 90 | 2294.60 € |
| 2025-08 | 3733.07 € | 93 | 2354.53 € |
| 2025-09 | 2853.44 € | 92 | 2462.82 € |
| 2025-10 | 2885.79 € | 96 | 2217.05 € |
| 2025-11 | 3599.35 € | 109 | 2158.24 € |
| 2025-12 | 6317.85 € | 112 | 2352.96 € |

## 3. Faturação por Categoria (`vendas_sazonais.csv`)

| Categoria | Faturação Sazonal (€) | Quota (%) |
| --- | --- | --- |
| Mercearia | 18515.32 € | 49.5 % |
| Charcutaria | 8745.30 € | 23.4 % |
| Bebidas | 3813.45 € | 10.2 % |
| Frutaria | 3360.00 € | 9.0 % |
| Laticínios | 2250.15 € | 6.0 % |
| Padaria | 742.25 € | 2.0 % |

## 4. Auditoria de Integridade

- **`vendas.csv`**: 5078 registos verificados, **0** chaves estrangeiras órfãs.
- **`vendas_sazonais.csv`**: 7031 registos verificados, **0** chaves estrangeiras órfãs.
- **`vendas_sujas.csv`** (12 registos de teste de limpeza):
  - Células obrigatórias em falta: **2**
  - Linhas duplicadas exatas: **2**
  - Problemas de espaços/capitalização: **2**
  - Preços com vírgula decimal: **1**
  - Preços nulos ou negativos: **1**

## 5. Artefactos BI Gerados

- **Excel Analítico:** `relatorios/Dashboard_Mercearia_do_Bairro_2025.xlsx`
- **Projeto Power BI (PBIP + TMDL + BIM):** `relatorios/PowerBI_Mercearia_do_Bairro_PBIP.zip`
