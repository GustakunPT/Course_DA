# Semana 3: Variáveis e tipos de dados

## A analogia: frascos na despensa

Uma variável é um frasco com um rótulo. O rótulo é o **nome**, o que está lá dentro é o **valor**.

```python
preco_pao = 0.25      # frasco "preco_pao" com 0.25 lá dentro
quantidade = 10
total = preco_pao * quantidade
print(total)          # 2.5
```

O sinal `=` não quer dizer "é igual a". Quer dizer **"guarda isto neste frasco"**.
Por isso `quantidade = quantidade + 1` faz sentido: tira o valor, soma 1, volta a guardar.

## Tipos: dinheiro não é o mesmo que papel escrito

| Tipo | O que guarda | Exemplo |
| --- | --- | --- |
| `int` | números inteiros | `10` |
| `float` | números com casas decimais (ponto, não vírgula) | `0.25` |
| `str` | texto, entre aspas | `"Pão"` |
| `bool` | verdadeiro ou falso | `True` |

Somar 2 € com 2 € dá 4 €. Colar o papel "2" ao papel "2" dá "22":

```python
print(2 + 2)          # 4
print("2" + "2")      # 22
print(int("2") + 2)   # 4  -> int() transforma o papel em dinheiro
```

## Experimente partir (5 minutos)

1. Escreva `preco = 0,25` (com vírgula) e faça `print(preco)` e `print(type(preco))`.
   Não dá erro, e é isso que surpreende: o Python lê a vírgula como separador e cria um par de
   valores, `(0, 25)`. Por isso os decimais usam ponto.
2. Escreva `print("2" + 2)`. Leia a última linha do erro: o que lhe está a dizer?
3. Use `print(type(0.25))` e `print(type("0.25"))` para ver o tipo de cada coisa.

## Ligação ao que já sabe de SQL

Uma coluna `preco NUMERIC` e uma coluna `nome VARCHAR` são exatamente isto: tipos diferentes.
`CAST('2' AS INT)` em SQL é o `int("2")` do Python.

## Exercícios

Abra `exercicios/semana03_variaveis.py`, complete e corra:

```bash
python verificar.py 3
```
