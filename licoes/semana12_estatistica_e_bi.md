# Semana 12: Estatística Descritiva, KPIs e Power BI

> **Na app:** Estatística, etapas 01 e 02. [abrir a etapa 01 da trilha Estatística](https://web-one-nu-34.vercel.app/#vista=academia&trilha=estatistica&licao=bi-01-media-mediana). Esta lição é só a introdução: a trilha Estatística da app continua com probabilidade, intervalos de confiança, testes A/B, qui-quadrado e regressão, e a trilha Visualização & BI cobre gráficos, Excel e Power BI.

## A analogia: porque é que a média mente quando entra um milionário na mercearia

Imagina 9 clientes que compram um pão (`0.25 €`) e 1 restaurante que compra 20 garrafões de azeite (`150.00 €`):
- A **média** diz que cada cliente gastou `15.23 €` (ninguém gastou perto disto!).
- A **mediana** (o valor exatamente no meio depois de pôr os talões por ordem) diz `0.25 €` — retrata muito melhor o cliente típico.

## As medidas que todo o Analista domina (estilo W3Schools)

| Medida | O que responde | Python (`statistics`) | Pandas | SQL (PostgreSQL) |
| --- | --- | --- | --- | --- |
| **Média** | Se dividíssemos tudo por igual, quanto cabia a cada linha? | `mean(valores)` | `s.mean()` | `AVG(col)` |
| **Mediana (P50)** | Qual o valor que divide a amostra exatamente a meio? | `median(valores)` | `s.median()` | `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col)` |
| **Desvio-padrão** | Os valores andam colados à média ou muito espalhados? | `stdev(valores)` | `s.std()` | `STDDEV(col)` |
| **Amplitude Interquartil (IQR)** | Intervalo dos 50% centrais (`Q3 - Q1`), útil para detetar *outliers* | `quantiles(v, n=4)` | `s.quantile(0.75) - s.quantile(0.25)` | `PERCENTILE_CONT(0.75) - PERCENTILE_CONT(0.25)` |

## Modelação em Estrela (*Star Schema*) para Power BI

Quando levas os dados da Mercearia para o Power BI (Fase 4):
1. **Tabela de Factos (`vendas`)**: fica no centro, comprida (5 078 linhas), com datas, chaves estrangeiras (`cliente_id`, `produto_id`) e métricas numéricas (`quantidade`, `preco`).
2. **Tabelas de Dimensão (`produtos`, `clientes`, `calendario`)**: ficam à volta, curtas, com os atributos pelos quais filtras nos gráficos (`categoria`, `cidade`, `mes`, `dia_semana`).
3. **Medidas DAX essenciais**:
   - `Faturacao Total = SUMX(vendas, vendas[quantidade] * vendas[preco])`
   - `Ticket Medio por Linha = DIVIDE([Faturacao Total], COUNTROWS(vendas))`
   - `Quota Categoria % = DIVIDE([Faturacao Total], CALCULATE([Faturacao Total], ALL(produtos[categoria])))`

## Exercícios

Completa `exercicios/semana12_estatistica.py` e corre `python verificar.py 12`.
