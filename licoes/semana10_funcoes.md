# Semana 10: Funções — escrever a receita uma vez, cozinhar mil vezes

> **Na app:** Python, etapa 09. [abrir a etapa 09](https://web-one-nu-34.vercel.app/#vista=academia&trilha=python&licao=py-09-funcoes). Tem 2 treinos extra.

## A analogia: a tecla programada na balança da frutaria

Se todos os dias precisas de calcular o preço final com desconto e IVA em 10 lugares diferentes do código, copiar e colar a conta 10 vezes é pedir problemas: no dia em que a regra muda, esqueces-te de atualizar uma das cópias.

Uma **função** (`def`) guarda os ingredientes de entrada (**parâmetros**), executa a receita e entrega o prato pronto com `return`.

```python
def calcular_linha(quantidade, preco_unitario, desconto_pct=0):
    subtotal = quantidade * preco_unitario
    fator = 1 - (desconto_pct / 100)
    return round(subtotal * fator, 2)

print(calcular_linha(4, 2.35))          # 9.4
print(calcular_linha(2, 7.50, 10))      # 13.5 (com 10% de desconto)
```

## `return` não é `print`!

Este é o erro número 1 de quem começa:
- `print()` mostra texto no ecrã para um humano ler, mas a função devolve `None` ao programa.
- `return` entrega o valor calculado para que outra variável ou conta o possa usar a seguir.

```python
# Se a função só tiver print(), isto falha:
# total_dia = calcular_linha(4, 2.35) + calcular_linha(2, 7.50)
```

## Funções puras para limpeza de dados

Os analistas criam pequenas funções reutilizáveis para limpar texto sujo antes de carregar tabelas:

```python
def normalizar_produto(texto):
    """Remove espaços nas pontas e coloca a primeira letra maiúscula."""
    return texto.strip().capitalize()

print(normalizar_produto("  pão "))   # "Pão"
```

## Exercícios

Completa `exercicios/semana10_funcoes.py` e corre `python verificar.py 10`.
