# Prática guiada: Excel e Power BI

> **Na app:** Visualização & BI, etapa 06. [abrir a folha de respostas](https://web-one-nu-34.vercel.app/#vista=academia&trilha=bi&licao=bi-10-pratica-excel-powerbi). Escreve lá os 8 números que encontrares.

Já calculaste estas métricas em SQL e em pandas. Aqui vais calculá-las no Excel e no Power BI, com os mesmos dados. No fim, escreve os números na folha de respostas da etapa **06 da trilha Visualização & BI** da app: a bancada diz-te quais estão certos.

**Precisas de:** Excel 365 ou 2021 (para o `PROCX`) e Power BI Desktop (gratuito, só para Windows). Os ficheiros estão na pasta `dados/`: `vendas.csv`, `produtos.csv` e `clientes.csv`.

> No Excel em português os argumentos separam-se com ponto e vírgula (`;`). Em inglês usa-se a vírgula (`,`). Ao lado de cada fórmula está o nome da função em inglês.

---

## Parte 1: Excel

### Preparar os dados

1. Abre um livro novo e vai a **Dados > Obter Dados > De Ficheiro > De Texto/CSV**. Escolhe `vendas.csv` e carrega em **Carregar**.
2. O Excel cria uma tabela. Em **Estrutura da Tabela**, muda o nome para `Vendas`.
3. Repete para `produtos.csv` (tabela `Produtos`) e `clientes.csv` (tabela `Clientes`).

> Se os preços aparecerem como texto (alinhados à esquerda), o separador decimal não foi reconhecido. No Power Query, muda o tipo da coluna `preco` com **Utilizar Região** e escolhe Inglês (Estados Unidos).

### Excel 1: faturação total

Na tabela `Vendas`, escreve `Subtotal` na primeira coluna vazia e, na linha de baixo:

```
=[@quantidade]*[@preco]
```

A fórmula enche a coluna toda. Numa célula fora da tabela:

```
=SOMA(Vendas[Subtotal])          (SUM)
```

**Resposta:** `total_faturacao`

### Excel 2: faturação do Pão

```
=SOMA.SE.S(Vendas[Subtotal]; Vendas[produto]; "Pão")          (SUMIFS)
```

O primeiro argumento é o que se soma; depois vêm pares de "coluna do critério; critério". É o `WHERE produto = 'Pão'` do SQL.

**Resposta:** `faturacao_pao`

### Excel 3: faturação da Charcutaria

A tabela `Vendas` não tem a categoria. Vamos buscá-la a `Produtos`, como num `JOIN`. Cria a coluna `Categoria`:

```
=PROCX([@produto_id]; Produtos[id]; Produtos[categoria])          (XLOOKUP)
```

Depois soma:

```
=SOMA.SE.S(Vendas[Subtotal]; Vendas[Categoria]; "Charcutaria")
```

**Resposta:** `faturacao_charcutaria`

### Excel 4: o melhor mês

1. Cria a coluna `Mes`:
   ```
   =TEXTO([@data]; "aaaa-mm")          (TEXT, com "yyyy-mm" em inglês)
   ```
2. Clica na tabela e vai a **Inserir > Tabela Dinâmica**.
3. Arrasta `Mes` para **Linhas** e `Subtotal` para **Valores** (Soma de Subtotal).
4. Clica com o botão direito num valor e escolhe **Ordenar > Do Maior para o Menor**.

**Respostas:** `mes_top` (como texto, por exemplo `"2025-01"`) e `faturacao_mes_top`

---

## Parte 2: Power BI

### Preparar o modelo

1. **Base > Obter dados > Texto/CSV**. Carrega `vendas.csv`, `produtos.csv` e `clientes.csv`.
2. Abre a vista **Modelo** (o terceiro ícone à esquerda). Confirma que existem estas duas relações e, se faltarem, arrasta para as criar:
   - `vendas[produto_id]` → `produtos[id]`
   - `vendas[cliente_id]` → `clientes[id]`

### Power BI 1: medidas base

Na tabela `vendas`, clica em **Nova medida** e cria:

```
Faturação = SUMX(vendas, vendas[quantidade] * vendas[preco])
Clientes Ativos = DISTINCTCOUNT(vendas[cliente_id])
```

Põe `Clientes Ativos` num visual **Cartão**.

**Resposta:** `clientes_ativos`

### Power BI 2: gasto por cliente

```
Gasto por Cliente = DIVIDE([Faturação], [Clientes Ativos])
```

`DIVIDE` não dá erro quando o divisor é zero, ao contrário de `/`. Mostra a medida num cartão com 2 casas decimais.

**Resposta:** `gasto_por_cliente`

### Power BI 3: faturação por cidade

1. Insere um visual **Matriz**.
2. Arrasta `clientes[cidade]` para **Linhas** e a medida `Faturação` para **Valores**.
3. Ordena pela faturação, do maior para o menor.

> Se todas as cidades mostrarem o mesmo valor, falta a relação entre `vendas` e `clientes` (volta ao passo "Preparar o modelo").

**Resposta:** `cidade_top`

---

## Confirmar

Abre a etapa **06 da trilha Visualização & BI** na app, escreve os 8 valores na folha de respostas e carrega em **Correr**. Cada valor errado vem com uma dica sobre o passo onde costuma estar o erro.

Para ir mais longe, abre o modelo completo em `relatorios/PowerBI_Mercearia_do_Bairro_PBIP.zip` e compara as tuas medidas com as que lá estão.
