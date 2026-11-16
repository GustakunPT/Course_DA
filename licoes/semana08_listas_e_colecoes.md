# Semana 8: Listas, tuplos e fatias (`slicing`)

> **Na app:** Python, etapa 08. [abrir a etapa 08](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-07-listas-colecoes). Tem 2 treinos extra.

## A analogia: o cesto de compras vs a etiqueta plastificada

- Uma **lista** (`list`, com parênteses retos `[...]`) é um cesto de compras: podes pôr mais um pacote de arroz (`.append()`), trocar um artigo de sítio ou ordenar tudo.
- Um **tuplo** (`tuple`, com parênteses curvos `(...)`) é uma ficha plastificada do catálogo `(1, "Pão", "Padaria", 0.25)`: serve para dados fixos que não devem ser alterados por acidente.

```python
cesto = ["Pão", "Leite", "Café"]
print(cesto[0])       # "Pão"  -> em Python a contagem começa no 0!
print(cesto[-1])      # "Café" -> -1 apanha sempre o último elemento

cesto.append("Azeite")
print(len(cesto))     # 4 artigos no cesto
```

## Referência rápida de listas (estilo W3Schools)

| Operação | Sintaxe | Resultado / Efeito |
| --- | --- | --- |
| Primeiro elemento | `lista[0]` | Devolve o item na posição 0 |
| Último elemento | `lista[-1]` | Devolve o último item |
| Fatia (`slicing`) | `lista[0:3]` | Devolve do índice 0 até ao 2 (o 3 fica de fora) |
| Acrescentar no fim | `lista.append(x)` | Junta `x` ao final da lista |
| Ordenar cópia | `sorted(lista, reverse=True)` | Devolve nova lista do maior para o menor |
| Pertence à lista? | `"Café" in lista` | Devolve `True` ou `False` |
| Valores únicos | `set(lista)` | Conjunto sem repetidos (como `SELECT DISTINCT`) |

## Compreensão de listas (`list comprehension`)

Em análise de dados é muito comum transformar ou filtrar uma coluna inteira numa linha limpa:

```python
precos_sem_iva = [1.00, 2.00, 7.50]
precos_com_iva = [round(p * 1.23, 2) for p in precos_sem_iva]
acima_de_dois = [p for p in precos_sem_iva if p >= 2.00]
```

## Experimenta partir (5 minutos)

1. Numa lista com 3 elementos, tenta ler `cesto[3]`. Lê o `IndexError: list index out of range`: se começa no 0, as posições válidas são 0, 1 e 2.
2. Compara `nova = lista.sort()` com `nova = sorted(lista)`. Porque é que a primeira guarda `None`? (Porque `.sort()` arruma a lista no próprio lugar e não devolve nada!)

## Ligação ao SQL e ao pandas

- `[p for p in precos if p > 2]` é o `WHERE preco > 2` do SQL.
- `sorted(vendas, reverse=True)[:3]` é o `ORDER BY valor DESC LIMIT 3`.

## Exercícios

Completa `exercicios/semana08_listas.py` e corre `python verificar.py 8`.
