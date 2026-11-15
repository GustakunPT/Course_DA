# Semanas 1 e 2: Terminal, Git e GitHub para Analistas de Dados

> **Na app:** Git, etapas 01 a 05. [abrir a etapa 01 da trilha Git](https://web-one-nu-34.vercel.app/#vista=academia&trilha=git&licao=git-01-init-status). Na app, os comandos correm num terminal simulado: podes treinar sem medo de estragar nada.

## A analogia: o livro de registo da caixa e o cofre do banco

Imagina que na Mercearia escreves todas as alterações de preços a lápis num papel solto e apagas por cima sempre que mudas de ideias. No fim do mês, ninguém sabe quando o Azeite subiu para `7.50 €` nem quem mudou a fórmula.

- **Git** é o livro de atas numerado na tua secretária: cada vez que fazes um `commit`, tiras uma fotografia datada e assinada ao estado dos teus scripts e consultas SQL.
- **GitHub** é o cofre fora da loja: se o teu computador avariar, o histórico completo e o teu portfólio público continuam intactos na nuvem.

## Referência rápida de Terminal (estilo W3Schools)

| Comando | O que faz | Exemplo na Mercearia |
| --- | --- | --- |
| `pwd` / `Get-Location` | Mostra em que pasta estás | Confirmar que estás na raiz do projeto |
| `ls` / `Get-ChildItem` | Lista ficheiros e pastas | Ver os CSVs dentro de `dados/` |
| `cd <pasta>` | Entra numa pasta | `cd dados` ou `cd ..` (subir um nível) |
| `python <ficheiro>` | Executa um script Python | `python src/gerar_dados.py` |

## Fluxo essencial de Git no dia a dia

```bash
# 1. Inicializar o repositório (uma única vez na pasta do projeto)
git init

# 2. Ver o que mudou desde a última fotografia
git status

# 3. Escolher o que entra na fotografia (staging area)
git add exercicios/semana03_variaveis.py

# 4. Guardar a fotografia com uma mensagem clara no presente
git commit -m "Completa exercicios da semana 3 sobre variaveis"

# 5. Enviar para o GitHub
git push origin main
```

## Trabalhar com ramos (`branches`) sem partir o relatório oficial

Um analista nunca testa uma limpeza arriscada diretamente no relatório que a gerência abre todas as manhãs:

```bash
# Cria e muda para um ramo isolado de experiência
git switch -c limpeza-vendas-sujas

# ... faz alterações, corre python verificar.py ...
git add .
git commit -m "Trata precos negativos e textos com espacos"

# Volta ao ramo principal e junta o trabalho validado
git switch main
git merge limpeza-vendas-sujas
```

## Boas práticas de Analista no `.gitignore`

- **Nunca subas credenciais** (`.env`, senhas de PostgreSQL, chaves de API).
- **Dados sensíveis ou gigantescos** (`.parquet` de milhões de linhas ou dados reais de clientes) ficam no `.gitignore`; sobe apenas amostras sintéticas ou o script `src/gerar_dados.py`.
- Pastas temporárias como `__pycache__/`, `.venv/` e `node_modules/` nunca entram num commit.

## Experimenta partir (5 minutos)

1. Corre `git status` numa pasta com ficheiros alterados e lê as duas cores/secções: *Changes not staged for commit* vs *Changes to be committed*.
2. Escreve `git diff` antes de fazer `git add`: vê linha a linha o que acrescentou (`+`) e o que apagou (`-`).
