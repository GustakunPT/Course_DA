# Semana 6: O ciclo for e as listas (primeiro contacto)

## A analogia: a caixa do supermercado

A operadora pega num produto de cada vez, faz a mesma coisa (passa o código) e repete
até o tapete ficar vazio. Um ciclo `for` é isso: **a mesma ação, para cada elemento**.

```python
vendas = [120, 80, 250]       # o tapete (uma lista)
for venda in vendas:          # "para cada venda no tapete"
    print(venda)              # a ação que se repete
```

`venda` é um frasco que muda de conteúdo a cada volta: primeiro 120, depois 80, depois 250.

## Contar e somar: o conta-quilómetros

Antes do ciclo, o contador começa a zero. Dentro do ciclo, vai somando:

```python
contador = 0
for venda in vendas:
    if venda > 100:
        contador = contador + 1
print(contador)               # 2
```

## range: uma fila de números

```python
for i in range(5):            # 0, 1, 2, 3, 4  (5 números, a começar no 0)
    print(i)
for i in range(1, 101):       # 1 a 100 (o último número fica de fora)
    print(i)
```

## Guardar resultados numa lista nova

```python
dobros = []
for venda in vendas:
    dobros.append(venda * 2)  # append = acrescentar ao fim da fila
```

## Experimente partir (5 minutos)

1. Ponha `contador = 0` **dentro** do ciclo. O que acontece ao resultado? Porquê?
2. Faça `for i in range(1, 100)` e some tudo. Porque não dá 5050?
3. Tire a indentação do `print` para ele ficar fora do ciclo. Quantas vezes imprime?

## Ligação ao SQL

`SELECT COUNT(*) FROM vendas WHERE valor > 100` é o contador acima.
O SQL faz o ciclo por si; em Python escreve-o à mão, e é por isso que o percebe melhor.

## Exercícios

Complete `exercicios/semana06_ciclo_for.py` e corra `python verificar.py 6`.
