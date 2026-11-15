# Semana 4: Falar com o utilizador (input, print) e converter tipos

## A analogia: o balcão da mercearia

O cliente diz o que quer (`input`), o empregado responde (`print`).
Mas atenção: **tudo o que o cliente diz chega escrito num papel**, ou seja, como texto.

```python
valor = input("Quanto pagou? ")   # o utilizador escreve 20
print(type(valor))                # <class 'str'>  -> é o papel "20", não o número 20
valor = float(valor)              # agora sim, é dinheiro
```

## f-strings: etiquetas com espaços para preencher

Uma f-string é uma etiqueta com buracos `{}` onde o Python escreve o valor do frasco:

```python
produto = "Leite"
preco = 0.89
print(f"{produto}: {preco} €")        # Leite: 0.89 €
print(f"Total: {preco * 3:.2f} €")    # Total: 2.67 €  (:.2f = 2 casas decimais)
```

## Experimente partir (5 minutos)

1. Faça `troco = input("Pagou: ") - 13.75`. Leia o erro. O que falta?
2. Escreva `print(f"Total: {10 / 3}")` e depois com `:.2f`. Qual a diferença?
3. O que dá `int("12.5")`? E `float("12.5")`? E `int(float("12.5"))`?

## Ligação ao SQL

`CONCAT(nome, ': ', preco)` é a versão SQL de uma f-string.
`ROUND(preco, 2)` faz o papel do `:.2f`.

## Exercícios

1. Complete `exercicios/semana04_conversoes.py` e corra `python verificar.py 4`.
2. Desafio livre (não é verificado): crie `exercicios/calculadora_troco.py` que pergunta
   o total e o valor pago com `input()` e mostra o troco com 2 casas decimais.
