# Semana 11: Ficheiros, `with open` e o módulo `csv`

> **Na app:** Python, etapas 11 e 12. [abrir a revisão (etapa 11)](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-11-revisao). A etapa 11 revê tudo e a 11 é o projeto da Caixa Registadora com as 5 078 vendas.

## A analogia: abrir a arca frigorífica e fechá-la sempre ao sair

Quando um programa abre um ficheiro no disco, precisa de o fechar no fim. O bloco `with open(...) as f:` é uma porta com mola automática: mesmo que aconteça um erro lá dentro, o Python fecha o ficheiro sozinho.

```python
import csv
from pathlib import Path

caminho = Path("dados/produtos.csv")

with open(caminho, mode="r", encoding="utf-8") as f:
    leitor = csv.DictReader(f)
    produtos = list(leitor)

print(produtos[0])
# {'id': '1', 'nome': 'Pão', 'categoria': 'Padaria', 'preco': '0.25'}
```

## A armadilha clássica dos CSVs: tudo chega como texto (`str`)!

Repara nas aspas em `'0.25'`. Num ficheiro CSV não existem tipos numéricos — são apenas caracteres separados por vírgulas. Antes de multiplicar ou somar, tens **sempre** de converter com `int()` e `float()`:

```python
total = 0.0
with open("dados/vendas.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f):
        qtd = int(linha["quantidade"])
        preco = float(linha["preco"])
        total += qtd * preco

print(f"Faturação anual: {total:.2f} €")   # 26902.89 €
```

## Lidar com dados sujos (`try / except`)

Em ficheiros reais como `dados/vendas_sujas.csv`, há quantidades vazias `""` e preços com vírgula `"2,35"`:

```python
def ler_preco_seguro(texto):
    limpo = texto.strip().replace(",", ".")
    try:
        valor = float(limpo)
    except ValueError:
        return None
    return valor if valor > 0 else None
```

## Próximo passo: a Caixa Registadora

Depois de fazer `exercicios/semana11_csv.py`, estás pronto para completar `src/caixa.py` e cruzar os 4 indicadores da Mercearia com o SQL!
