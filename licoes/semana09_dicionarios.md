# Semana 9: Dicionários e contadores por chave

> **Na app:** Python, etapa 08. [abrir a etapa 08](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-08-dicionarios). Tem 2 treinos extra.

## A analogia: a tabela de preços afixada atrás do balcão

Numa lista tens de saber o número da gaveta (`precos[5]`). Mas ninguém na caixa decora que o Azeite é o índice 5: procuras pela **palavra** `"Azeite"` e vês logo `7.50` à frente.
Isso é um **dicionário** (`dict`): pares `chave: valor` entre chavetas `{...}`.

```python
tabela_precos = {
    "Pão": 0.25,
    "Leite": 0.89,
    "Azeite": 7.50,
}

print(tabela_precos["Azeite"])         # 7.5
tabela_precos["Café"] = 3.40           # acrescenta nova chave
```

## O padrão mais importante para um Analista: acumular com `.get()`

Quando lês 5 078 vendas e queres somar a quantidade vendida por produto, usas um dicionário como quadro de contagem:

```python
vendas_dia = [("Pão", 4), ("Leite", 2), ("Pão", 6)]
unidades_por_produto = {}

for produto, qtd in vendas_dia:
    unidades_por_produto[produto] = unidades_por_produto.get(produto, 0) + qtd

print(unidades_por_produto)   # {'Pão': 10, 'Leite': 2}
```

`dicionario.get(chave, 0)` significa: *"dá-me o valor que já lá está para esta chave; se ainda não existir, devolve 0"*.

## Referência rápida de dicionários (estilo W3Schools)

| Método / Sintaxe | O que devolve | Exemplo |
| --- | --- | --- |
| `d[chave]` | Valor da chave (dá `KeyError` se faltar) | `precos["Pão"]` |
| `d.get(chave, padrao)` | Valor da chave ou `padrao` se faltar | `precos.get("Chá", 0.0)` |
| `d.keys()` | Todas as chaves | Nomes dos produtos |
| `d.values()` | Todos os valores | Lista dos preços |
| `d.items()` | Pares `(chave, valor)` para ciclos `for` | `for k, v in d.items():` |
| `max(d, key=d.get)` | A chave com o maior valor acumulado | Produto campeão de vendas |

## Ligação ao SQL

Acumular num dicionário por `produto` faz em Python puro exatamente o mesmo trabalho que `SELECT produto, SUM(quantidade) FROM vendas GROUP BY produto`.

## Exercícios

Completa `exercicios/semana09_dicionarios.py` e corre `python verificar.py 9`.
