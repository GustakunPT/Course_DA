"""Semana 12: estatística descritiva. Leia licoes/semana12_estatistica_e_bi.md

Use o módulo statistics da biblioteca padrão e corra:  python verificar.py 12
"""

import statistics

taloes_amostra = [1.20, 2.50, 3.40, 3.40, 4.80, 5.10, 7.50, 9.40, 48.00]

# 1. Calcule a média aritmética da amostra (use statistics.mean).
media = None

# 2. Calcule a mediana da amostra (use statistics.median).
#    Repare como a mediana resiste melhor ao talão atípico de 48.00 €!
mediana = None

# 3. Calcule o desvio-padrão amostral arredondado a 2 casas decimais (round(statistics.stdev(...), 2)).
desvio_padrao = None

# 4. Calcule a amplitude total (máximo menos mínimo).
amplitude = None

print(media, mediana, desvio_padrao, amplitude)
