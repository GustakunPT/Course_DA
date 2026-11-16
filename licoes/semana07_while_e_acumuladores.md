# Semana 7: O ciclo while e os acumuladores

> **Na app:** Python, etapa 07. [abrir a etapa 07](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-06-while). Tem 2 treinos extra.

## A analogia: mexer a sopa enquanto não ferve

O `for` sabe à partida quantas voltas dá (uma por elemento). O `while` não sabe:
repete **enquanto** uma condição for verdadeira.

```python
temperatura = 20
while temperatura < 100:              # enquanto não ferve...
    temperatura = temperatura + 15    # ...continua a aquecer
print(temperatura)                    # 110
```

Se nada dentro do ciclo mudar a condição, a sopa nunca ferve e o programa nunca pára.
Para o interromper no terminal: `Ctrl + C`.

## Acumuladores: o mealheiro

Um acumulador é um frasco que começa vazio e vai enchendo a cada volta:

```python
vendas = [120, 80, 250]
total = 0                     # mealheiro vazio
for venda in vendas:
    total = total + venda     # também se escreve: total += venda
media = total / len(vendas)   # len = quantos elementos tem a lista
```

## for ou while?

| Situação | Usa |
| --- | --- |
| "Para cada venda da lista..." | `for` |
| "Repetir 10 vezes" | `for` com `range(10)` |
| "Até o saldo chegar a 500 €" | `while` |
| "Perguntar até a resposta ser válida" | `while` |

## Experimenta partir (5 minutos)

1. No exemplo da sopa, apaga a linha que aumenta a temperatura. Corre e para com `Ctrl + C`.
2. Troca `<` por `<=` na condição. O resultado muda? Em que caso mudaria?
3. Calcula a média de uma lista vazia `[]`. Lê o erro: que divisão está a acontecer?

## Ligação ao SQL

`SUM(valor)` e `AVG(valor)` são acumuladores que o SQL esconde.
Um total acumulado com `SUM(...) OVER (ORDER BY data)` é o mealheiro visto linha a linha.

## Exercícios

Completa `exercicios/semana07_while.py` e corre `python verificar.py 7`.
Quando as 5 semanas estiverem a verde, faz um commit: `Completa exercícios das semanas 3 a 7`.
