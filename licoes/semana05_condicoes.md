# Semana 5: Condições (if, elif, else)

> **Na app:** Python, etapa 05. [abrir a etapa 05](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-04-condicoes). Tem 2 treinos extra.

## A analogia: o porteiro da discoteca

O porteiro faz uma pergunta de sim ou não e decide o que acontece a seguir.

```python
idade = 17
if idade >= 18:
    print("Pode entrar")
else:
    print("Volta daqui a uns anos")
```

O que está **dentro** do `if` é o que está indentado (4 espaços). A indentação é a porta:
o que está para dentro só acontece se o porteiro deixar.

## Várias portas: elif

Escalões de desconto são portas em fila. O Python pára na **primeira** que abrir:

```python
total = 37.5
if total <= 20:
    desconto = 0
elif total <= 50:
    desconto = 5
else:
    desconto = 10
```

## As perguntas do porteiro

| Pergunta | Significa |
| --- | --- |
| `==` | é igual? (dois sinais; um só é "guardar") |
| `!=` | é diferente? |
| `>`, `>=`, `<`, `<=` | maior, maior ou igual, menor, menor ou igual |
| `and` | as duas têm de ser verdade |
| `or` | basta uma ser verdade |
| `not` | o contrário |

## Experimenta partir (5 minutos)

1. Troca a ordem dos escalões (põe `total <= 50` primeiro). Com `total = 15`, o que acontece? Porquê?
2. Escreve `if total = 20:` (um só `=`). Lê o erro.
3. Tira a indentação de uma linha dentro do `if`. O que muda?

## Ligação ao SQL

`CASE WHEN total <= 20 THEN 0 WHEN total <= 50 THEN 5 ELSE 10 END` é exatamente isto.
`WHERE idade >= 18 AND cidade = 'Porto'` usa a mesma lógica de `and`.

## Exercícios

Completa `exercicios/semana05_condicoes.py` e corre `python verificar.py 5`.
