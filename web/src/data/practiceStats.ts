import type { PythonChallengeSpec } from './types';

// Treinos da trilha de Estatística: cada desafio principal ficou com uma só ideia
// e as restantes partes vivem aqui, uma por treino.

export const statsPractice: Record<string, PythonChallengeSpec[]> = {
  'bi-09-correlacao-confianca': [
    {
      title: 'Intervalo de confiança a 95%',
      description: 'Em vendas.csv (sub = quantidade * preco), calcula media, erro_padrao (desvio padrão / raiz de n), ic_inferior e ic_superior (média ± 1.96 × erro padrão) do sub em todas as linhas.',
      starterCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

media = None
erro_padrao = None
ic_inferior = None
ic_superior = None
print(media, erro_padrao, ic_inferior, ic_superior)`,
      solutionCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

media = df["sub"].mean()
erro_padrao = df["sub"].std() / math.sqrt(len(df))
ic_inferior = media - 1.96 * erro_padrao
ic_superior = media + 1.96 * erro_padrao
print(f"Média {media:.2f} € (IC 95%: {ic_inferior:.2f} € a {ic_superior:.2f} €)")`,
      checks: [
        { label: 'media (5.30 €) e erro_padrao (0.080)', expr: 'abs(float(media) - 5.2979) < 0.001 and abs(float(erro_padrao) - 0.07958) < 0.0005', actualExpr: '(media, erro_padrao)', hint: 'erro_padrao = df["sub"].std() / math.sqrt(len(df)).' },
        { label: 'IC 95%: 5.14 € a 5.45 €', expr: 'abs(float(ic_inferior) - 5.1420) < 0.002 and abs(float(ic_superior) - 5.4539) < 0.002', actualExpr: '(ic_inferior, ic_superior)', hint: 'ic_inferior = media - 1.96 * erro_padrao e ic_superior = media + 1.96 * erro_padrao.' },
        { label: 'O intervalo é calculado a partir dos dados', expr: 'abs(float(correr_com(df=pd.DataFrame({"quantidade": [1, 1, 1, 1], "preco": [1.0, 2.0, 3.0, 4.0]}))["ic_inferior"]) - 1.23483) < 0.001', actualExpr: 'correr_com(df=pd.DataFrame({"quantidade": [1, 1, 1, 1], "preco": [1.0, 2.0, 3.0, 4.0]})).get("ic_inferior")', hint: 'Usa df["sub"].mean(), .std() e len(df): nada de números escritos à mão.' },
      ],
    },
    {
      title: 'Uma amostra de 200 linhas',
      description: 'Simula um inquérito: amostra = df.sample(200, random_state=42). Calcula ic_amostra_inferior e ic_amostra_superior (95%, como no treino 1, mas só com a amostra), largura_amostra, largura_total (a largura do IC com todas as linhas) e vezes_mais_larga = largura_amostra / largura_total.',
      starterCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

amostra = None
ic_amostra_inferior = None
ic_amostra_superior = None
largura_amostra = None
largura_total = None
vezes_mais_larga = None
print(ic_amostra_inferior, ic_amostra_superior, vezes_mais_larga)`,
      solutionCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

amostra = df.sample(200, random_state=42)
erro_amostra = amostra["sub"].std() / math.sqrt(len(amostra))
ic_amostra_inferior = amostra["sub"].mean() - 1.96 * erro_amostra
ic_amostra_superior = amostra["sub"].mean() + 1.96 * erro_amostra
largura_amostra = ic_amostra_superior - ic_amostra_inferior
largura_total = 2 * 1.96 * df["sub"].std() / math.sqrt(len(df))
vezes_mais_larga = largura_amostra / largura_total
print(f"IC 95% da amostra: {ic_amostra_inferior:.2f} € a {ic_amostra_superior:.2f} € ({vezes_mais_larga:.1f}× mais largo)")`,
      checks: [
        { label: 'Amostra de 200 linhas com o IC calculado da mesma forma', expr: 'len(amostra) == 200 and abs(float(ic_amostra_inferior) - (amostra["sub"].mean() - 1.96 * amostra["sub"].std() / 200 ** 0.5)) < 0.001 and abs(float(ic_amostra_superior) - (amostra["sub"].mean() + 1.96 * amostra["sub"].std() / 200 ** 0.5)) < 0.001', actualExpr: '(len(amostra) if amostra is not None else None, ic_amostra_inferior, ic_amostra_superior)', hint: 'amostra = df.sample(200, random_state=42) e repete as contas com amostra["sub"].' },
        { label: 'largura_total (0.31 €) e vezes_mais_larga (cerca de 4.5)', expr: 'abs(float(largura_total) - 0.31194) < 0.001 and abs(float(vezes_mais_larga) - float(largura_amostra) / float(largura_total)) < 1e-9 and 3 < float(vezes_mais_larga) < 6', actualExpr: '(largura_total, vezes_mais_larga)', hint: 'largura_total = 2 * 1.96 * df["sub"].std() / math.sqrt(len(df)). Com 25 vezes menos linhas, o erro padrão fica cerca de 5 vezes maior.' },
      ],
    },
  ],
  'bi-11-ab-proporcoes': [
    {
      title: 'Quantos cestos são precisos?',
      description: 'Antes de lançar um teste, calcula o tamanho de amostra. Com p_base = 0.1336 (a proporção atual) e subida_pp = 1 (a subida que queres detetar, em pontos percentuais), guarda n_por_grupo para 5% de significância e 80% de poder (z de 1.96 e 0.84), arredondado para cima com math.ceil.',
      starterCode: `import math

p_base = 0.1336
subida_pp = 1

p1 = None
p2 = None
n_por_grupo = None
print(n_por_grupo)`,
      solutionCode: `import math

p_base = 0.1336
subida_pp = 1

p1 = p_base
p2 = p_base + subida_pp / 100
n_por_grupo = math.ceil((1.96 + 0.84) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2)
print(f"Para detetar +{subida_pp} pp precisas de {n_por_grupo} cestos por grupo")`,
      checks: [
        { label: 'n_por_grupo para +1 pp (18 717 cestos)', expr: 'int(n_por_grupo) == 18717', actualExpr: 'n_por_grupo', hint: 'p2 = p_base + subida_pp / 100 e math.ceil((1.96 + 0.84) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2)) / (p2 - p1) ** 2).' },
        { label: 'Uma subida de 5 pp precisa de muito menos (834)', expr: 'int(correr_com(subida_pp=5)["n_por_grupo"]) == 834', actualExpr: 'correr_com(subida_pp=5).get("n_por_grupo")', hint: 'Escreve a fórmula com p_base e subida_pp, não o número final. O tamanho cai com o quadrado da diferença.' },
      ],
    },
  ],
  'bi-12-probabilidade-simpson': [
    {
      title: 'Regra de Bayes: o alerta de fraude',
      description: 'Um alerta apanha 95% das fraudes (sensibilidade), dispara em 5% das compras normais (taxa_falsos_positivos) e 1% das compras são fraude (prevalencia). Calcula p_alerta e p_fraude_dado_alerta.',
      starterCode: `prevalencia = 0.01
sensibilidade = 0.95
taxa_falsos_positivos = 0.05

p_alerta = None
p_fraude_dado_alerta = None
print(p_alerta, p_fraude_dado_alerta)`,
      solutionCode: `prevalencia = 0.01
sensibilidade = 0.95
taxa_falsos_positivos = 0.05

p_alerta = sensibilidade * prevalencia + taxa_falsos_positivos * (1 - prevalencia)
p_fraude_dado_alerta = sensibilidade * prevalencia / p_alerta
print(f"P(alerta) = {p_alerta:.3f} | P(fraude | alerta) = {p_fraude_dado_alerta:.1%}")`,
      checks: [
        { label: 'p_alerta (5.9%) e p_fraude_dado_alerta (16.1%)', expr: 'abs(float(p_alerta) - 0.059) < 0.0001 and abs(float(p_fraude_dado_alerta) - 0.16102) < 0.0005', actualExpr: '(p_alerta, p_fraude_dado_alerta)', hint: 'p_alerta = sensibilidade * prevalencia + taxa_falsos_positivos * (1 - prevalencia); depois sensibilidade * prevalencia / p_alerta.' },
        { label: 'A fórmula usa as variáveis (com 10% de fraudes dá 67.9%)', expr: 'abs(correr_com(prevalencia=0.10)["p_fraude_dado_alerta"] - 0.678571) < 0.0005', actualExpr: 'correr_com(prevalencia=0.10).get("p_fraude_dado_alerta")', hint: 'Escreve a fórmula com prevalencia, sensibilidade e taxa_falsos_positivos, não o número final.' },
      ],
    },
    {
      title: 'Paradoxo de Simpson: a Ana e o Rui',
      description: 'Na tabela adesao (cartões de cliente propostos e aceites por funcionário e turno), calcula taxa_total_ana e taxa_total_rui (soma os aceites e as propostas antes de dividir) e diz quem é melhor_em_cada_turno e quem é melhor_no_total ("Ana" ou "Rui").',
      starterCode: `import pandas as pd

adesao = pd.DataFrame({
    "funcionario": ["Ana", "Ana", "Rui", "Rui"],
    "turno": ["manhã", "noite", "manhã", "noite"],
    "propostas": [20, 300, 300, 20],
    "aceites": [18, 120, 240, 6],
})

taxa_total_ana = None
taxa_total_rui = None
melhor_em_cada_turno = None
melhor_no_total = None
print(taxa_total_ana, taxa_total_rui)`,
      solutionCode: `import pandas as pd

adesao = pd.DataFrame({
    "funcionario": ["Ana", "Ana", "Rui", "Rui"],
    "turno": ["manhã", "noite", "manhã", "noite"],
    "propostas": [20, 300, 300, 20],
    "aceites": [18, 120, 240, 6],
})
adesao["taxa"] = adesao["aceites"] / adesao["propostas"]
print(adesao)

total = adesao.groupby("funcionario")[["aceites", "propostas"]].sum()
taxa_total_ana = total.loc["Ana", "aceites"] / total.loc["Ana", "propostas"]
taxa_total_rui = total.loc["Rui", "aceites"] / total.loc["Rui", "propostas"]
melhor_em_cada_turno = "Ana"
melhor_no_total = "Rui"
print(f"Total: Ana {taxa_total_ana:.1%} vs Rui {taxa_total_rui:.1%}")`,
      checks: [
        { label: 'Taxas totais: Ana 43.1%, Rui 76.9%', expr: 'abs(float(taxa_total_ana) - 0.43125) < 0.0001 and abs(float(taxa_total_rui) - 0.76875) < 0.0001', actualExpr: '(taxa_total_ana, taxa_total_rui)', hint: 'Soma aceites e propostas por funcionário e só depois divide. A média das duas taxas dá outro número (errado).' },
        { label: 'As taxas vêm da tabela', expr: 'abs(float(correr_com(adesao=pd.DataFrame({"funcionario": ["Ana", "Rui"], "turno": ["manhã", "manhã"], "propostas": [10, 10], "aceites": [5, 2]}))["taxa_total_ana"]) - 0.5) < 1e-9', actualExpr: 'correr_com(adesao=pd.DataFrame({"funcionario": ["Ana", "Rui"], "turno": ["manhã", "manhã"], "propostas": [10, 10], "aceites": [5, 2]})).get("taxa_total_ana")', hint: 'Calcula com groupby e .loc a partir de adesao.' },
        { label: 'Paradoxo de Simpson identificado', expr: 'melhor_em_cada_turno == "Ana" and melhor_no_total == "Rui"', actualExpr: '(melhor_em_cada_turno, melhor_no_total)', hint: 'De manhã: Ana 90% vs Rui 80%. À noite: Ana 40% vs Rui 30%. No total o Rui ganha, porque a Ana faz quase só noites.' },
      ],
    },
  ],
  'bi-13-regressao-linear': [
    {
      title: 'Dispersão e z-score',
      description: 'Em vendas_sazonais.csv, soma a faturação por dia (faturacao_dia). Guarda variancia e desvio_padrao, melhor_dia (data com mais faturação) e z_melhor_dia = (máximo - média) / desvio padrão.',
      starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

faturacao_dia = None
variancia = None
desvio_padrao = None
melhor_dia = None
z_melhor_dia = None
print(desvio_padrao, melhor_dia, z_melhor_dia)`,
      solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

faturacao_dia = df.groupby("data")["sub"].sum()
variancia = faturacao_dia.var()
desvio_padrao = faturacao_dia.std()
melhor_dia = faturacao_dia.idxmax()
z_melhor_dia = (faturacao_dia.max() - faturacao_dia.mean()) / desvio_padrao
print(f"Desvio padrão diário: {desvio_padrao:.2f} € | melhor dia {melhor_dia} (z = {z_melhor_dia:.2f})")`,
      checks: [
        { label: 'variancia (3 522.96) e desvio_padrao (59.35 €)', expr: 'abs(float(variancia) - 3522.96) < 0.1 and abs(float(desvio_padrao) - 59.3546) < 0.01', actualExpr: '(variancia, desvio_padrao)', hint: 'faturacao_dia.var() e .std(). O desvio padrão é a raiz da variância.' },
        { label: 'melhor_dia (2025-12-26) com z ≈ 5.05', expr: 'melhor_dia == "2025-12-26" and abs(float(z_melhor_dia) - 5.0546) < 0.005', actualExpr: '(melhor_dia, z_melhor_dia)', hint: 'melhor_dia = faturacao_dia.idxmax() e z = (máximo - média) / desvio_padrao.' },
        { label: 'O z-score vem dos dados', expr: 'abs(float(correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d3"], "quantidade": [1, 1, 1], "preco": [1.0, 2.0, 3.0]}))["z_melhor_dia"]) - 1.0) < 1e-9', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d3"], "quantidade": [1, 1, 1], "preco": [1.0, 2.0, 3.0]})).get("z_melhor_dia")', hint: 'Calcula a partir de faturacao_dia, sem números escritos à mão.' },
      ],
    },
  ],
  'bi-14-perguntas-entrevista': [
    {
      title: 'Valor esperado de um vale',
      description: 'Um vale custa custo_vale = 2 €, é usado com probabilidade prob_uso = 0.3 e cada uso dá margem_por_uso = 10 €. Guarda valor_esperado por vale e vale_a_pena (True se for positivo).',
      starterCode: `custo_vale = 2
prob_uso = 0.3
margem_por_uso = 10

valor_esperado = None
vale_a_pena = None
print(valor_esperado, vale_a_pena)`,
      solutionCode: `custo_vale = 2
prob_uso = 0.3
margem_por_uso = 10

valor_esperado = prob_uso * margem_por_uso - custo_vale
vale_a_pena = valor_esperado > 0
print(f"Valor esperado por vale: {valor_esperado:+.2f} € | vale a pena? {vale_a_pena}")`,
      checks: [
        { label: 'valor_esperado (+1 €) e vale_a_pena', expr: 'abs(float(valor_esperado) - 1.0) < 1e-9 and vale_a_pena is True', actualExpr: '(valor_esperado, vale_a_pena)', hint: 'valor_esperado = prob_uso * margem_por_uso - custo_vale.' },
        { label: 'Com 10% de uso dá prejuízo (-1 €)', expr: '(lambda r: abs(r["valor_esperado"] - (-1.0)) < 1e-9 and r["vale_a_pena"] is False)(correr_com(prob_uso=0.1))', actualExpr: 'correr_com(prob_uso=0.1).get("valor_esperado")', hint: 'Escreve a conta com as variáveis e decide com valor_esperado > 0.' },
      ],
    },
    {
      title: 'Dois enviesamentos clássicos',
      description: 'Responde True ou False. vies_sobrevivencia: inquirir só os clientes que ainda compram para perceber porque é que os clientes saem tem viés de sobrevivência? parar_no_primeiro_p_baixo: é correto parar um teste A/B no primeiro dia em que p < 0.05? amostra_de_conveniencia: perguntar a opinião só a quem segue a loja no Instagram representa todos os clientes?',
      starterCode: `vies_sobrevivencia = None
parar_no_primeiro_p_baixo = None
amostra_de_conveniencia = None
print(vies_sobrevivencia, parar_no_primeiro_p_baixo, amostra_de_conveniencia)`,
      solutionCode: `vies_sobrevivencia = True
parar_no_primeiro_p_baixo = False
amostra_de_conveniencia = False
print(vies_sobrevivencia, parar_no_primeiro_p_baixo, amostra_de_conveniencia)`,
      checks: [
        { label: 'Viés de sobrevivência reconhecido', expr: 'vies_sobrevivencia is True', actualExpr: 'vies_sobrevivencia', hint: 'Os clientes que saíram são exatamente os que ficam de fora do inquérito.' },
        { label: 'Não se para um teste ao primeiro p baixo', expr: 'parar_no_primeiro_p_baixo is False', actualExpr: 'parar_no_primeiro_p_baixo', hint: 'Espreitar todos os dias e parar ao primeiro p < 0.05 multiplica os falsos positivos. A duração fixa-se antes, com o tamanho de amostra.' },
        { label: 'Uma amostra de conveniência não representa todos', expr: 'amostra_de_conveniencia is False', actualExpr: 'amostra_de_conveniencia', hint: 'Quem segue a loja nas redes é mais novo e mais fiel do que o cliente médio.' },
      ],
    },
  ],
  'bi-15-qui-quadrado-anova': [
    {
      title: 'ANOVA: a faturação muda entre trimestres?',
      description: 'Em vendas_sazonais.csv, por_dia já tem a faturação de cada dia (sub) e o seu trimestre. Calcula ss_entre (variação entre os trimestres), ss_dentro (variação dentro de cada trimestre), f_anova e diferenca_trimestres (True se f_anova > f_critico).',
      starterCode: `import pandas as pd

saz = pd.read_csv("dados/vendas_sazonais.csv")
saz["sub"] = saz["quantidade"] * saz["preco"]
saz["trimestre"] = "T" + ((saz["data"].str[5:7].astype(int) - 1) // 3 + 1).astype(str)
por_dia = saz.groupby(["data", "trimestre"])["sub"].sum().reset_index()
f_critico = 2.63  # tabela F a 5% com 3 e 361 graus de liberdade

ss_entre = None
ss_dentro = None
f_anova = None
diferenca_trimestres = None
print(f_anova, diferenca_trimestres)`,
      solutionCode: `import pandas as pd

saz = pd.read_csv("dados/vendas_sazonais.csv")
saz["sub"] = saz["quantidade"] * saz["preco"]
saz["trimestre"] = "T" + ((saz["data"].str[5:7].astype(int) - 1) // 3 + 1).astype(str)
por_dia = saz.groupby(["data", "trimestre"])["sub"].sum().reset_index()
f_critico = 2.63  # tabela F a 5% com 3 e 361 graus de liberdade

media_geral = por_dia["sub"].mean()
grupos = por_dia.groupby("trimestre")["sub"]
ss_entre = (grupos.count() * (grupos.mean() - media_geral) ** 2).sum()
ss_dentro = ((por_dia["sub"] - grupos.transform("mean")) ** 2).sum()
k, n = grupos.ngroups, len(por_dia)
f_anova = (ss_entre / (k - 1)) / (ss_dentro / (n - k))
diferenca_trimestres = f_anova > f_critico
print(grupos.mean().round(2))
print(f"ANOVA: F = {f_anova:.1f} (crítico {f_critico})")`,
      checks: [
        { label: 'ANOVA: F = 24.4, acima do valor crítico', expr: 'abs(float(f_anova) - 24.411) < 0.01 and bool(diferenca_trimestres) is True', actualExpr: '(f_anova, diferenca_trimestres)', hint: 'ss_entre = soma de n_grupo × (média_grupo - média_geral)²; ss_dentro = soma de (valor - média do seu grupo)²; F = (ss_entre / (k - 1)) / (ss_dentro / (n - k)).' },
        { label: 'F calculado a partir dos dias', expr: 'abs(float(correr_com(por_dia=pd.DataFrame({"trimestre": ["T1", "T1", "T2", "T2"], "sub": [1.0, 3.0, 5.0, 7.0]}))["f_anova"]) - 8.0) < 1e-9', actualExpr: 'correr_com(por_dia=pd.DataFrame({"trimestre": ["T1", "T1", "T2", "T2"], "sub": [1.0, 3.0, 5.0, 7.0]})).get("f_anova")', hint: 'Calcula as somas de quadrados a partir de por_dia, sem escrever o F à mão.' },
      ],
    },
  ],
};
