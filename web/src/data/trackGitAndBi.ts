import type { CheatsheetEntry, Track } from './types';

export const gitTrack: Track = {
  id: 'git',
  shortTitle: '4. Git & GitHub',
  fullTitle: 'Git, GitHub e Portfólio para Analistas de Dados',
  summary: 'Controlo de versões ao vivo no terminal simulado: commits limpos, proteção de dados com .gitignore, branches e publicação de portfólio.',
  engineLabel: 'Simulador Terminal Git',
  lessons: [
    {
      id: 'git-01-init-status',
      code: '01',
      title: 'Linha de comandos, git init e git status',
      lede: 'Antes de versionar queries SQL e notebooks Python, inicializas o repositório e inspecionas o estado da pasta.',
      analogyTitle: 'Abrir o livro oficial de registo da Mercearia',
      analogyBody: 'git init cria a pasta oculta .git que guarda toda a memória do projeto. E git status é a tua lanterna: diz sempre o que mudou e o que falta guardar.',
      concepts: [
        'pwd mostra a pasta atual e ls lista os ficheiros existentes.',
        'git init transforma uma pasta comum num repositório Git.',
        'git status mostra ficheiros modificados, preparados (staged) e não seguidos (untracked).',
      ],
      referenceTitle: 'Comandos de inspeção e arranque',
      referenceRows: [
        { syntax: 'pwd / ls', meaning: 'Mostra caminho atual / lista ficheiros', example: 'ls' },
        { syntax: 'git init', meaning: 'Cria um novo repositório Git local', example: 'git init' },
        { syntax: 'git status', meaning: 'Mostra o estado atual da árvore de trabalho', example: 'git status' },
      ],
      engine: 'git',
      exampleCode: `pwd
ls
git init
git status`,
      gitChallenge: {
        description: 'Inicializa o repositório da Mercearia com git init e verifica de seguida o estado dos ficheiros com git status.',
        starterCommands: `# Escreve os comandos um por linha
pwd
`,
        solutionCommands: `git init
git status`,
        hint: 'Executa git init numa linha e git status na linha seguinte.',
        validate: (state, output) => {
          const ok = state.initialized && output.includes('No ramo main');
          return {
            passed: ok,
            message: ok
              ? 'Repositório inicializado e inspecionado com sucesso!'
              : 'Corre git init seguido de git status.',
          };
        },
      },
      quiz: {
        question: 'Quantas vezes precisas de correr git init num mesmo projeto?',
        options: [
          'Sempre que abres o projeto',
          'Apenas uma vez, ao criar o repositório',
          'Antes de cada commit',
          'Sempre que crias um ramo novo',
        ],
        correctIndex: 1,
        explanation: 'git init cria a estrutura .git uma única vez no início da vida do repositório.',
      },
    },
    {
      id: 'git-02-add-commit',
      code: '02',
      title: 'Staging e histórico: git add, commit e log',
      lede: 'O Git separa a preparação (git add) da fotografia definitiva (git commit) para que cada registo conte uma história limpa.',
      analogyTitle: 'Pôr os produtos na caixa antes de fechar a fatura',
      analogyBody: 'Podes ter alterado 5 ficheiros mas querer gravar apenas a query SQL corrigida. Com git add escolhes o que entra na caixa; com git commit selas e assinas com uma mensagem clara.',
      concepts: [
        'git diff mostra as linhas exatas adicionadas (+) e removidas (-) antes de preparar.',
        'git add <ficheiro> prepara um ficheiro específico; git add . prepara tudo o que não está ignorado.',
        'Boas mensagens de commit são curtas e específicas: "Adiciona query de faturacao por cidade".',
      ],
      referenceTitle: 'Fluxo diário de gravação',
      referenceRows: [
        { syntax: 'git diff', meaning: 'Mostra alterações linha a linha', example: 'git diff' },
        { syntax: 'git add <caminho>', meaning: 'Move ficheiro para staging area', example: 'git add sql/02_perguntas_negocio.sql' },
        { syntax: 'git commit -m "msg"', meaning: 'Grava fotografia permanente com mensagem', example: 'git commit -m "Completa queries SQL"' },
        { syntax: 'git log', meaning: 'Lista o histórico de commits', example: 'git log' },
      ],
      engine: 'git',
      exampleCode: `git init
git diff
git add exercicios/semana03_variaveis.py
git commit -m "Resolve exercicios de variaveis da semana 3"
git log`,
      gitChallenge: {
        description: 'Inicializa o repositório (se ainda não estiver), adiciona todos os ficheiros válidos com git add . e cria um commit com git commit -m "...".',
        starterCommands: `git init
# Prepara os ficheiros e faz um commit com mensagem clara
`,
        solutionCommands: `git init
git add .
git commit -m "Estrutura inicial de Python e SQL da Mercearia"
git log`,
        hint: 'Usa git add . seguido de git commit -m "A tua mensagem".',
        validate: (state) => {
          const ok = state.initialized && state.commits.length >= 1;
          return {
            passed: ok,
            message: ok
              ? `Commit ${state.commits[0].hash} registado com sucesso: "${state.commits[0].message}".`
              : 'Garante que corres git init, depois git add . e por fim git commit -m "Mensagem".',
          };
        },
      },
      quiz: {
        question: 'Qual destas mensagens de commit segue as boas práticas de uma equipa de dados?',
        options: [
          '"cenas finais 2"',
          '"Corrige filtro de preços negativos na auditoria"',
          '"update"',
          '"Alterações várias em vários ficheiros do projeto"',
        ],
        correctIndex: 1,
        explanation: 'Uma boa mensagem diz o que mudou e porquê, permitindo a qualquer colega perceber o histórico meses depois.',
      },
    },
    {
      id: 'git-03-gitignore',
      code: '03',
      title: '.gitignore e privacidade em projetos de dados',
      lede: 'Em análise de dados, saber o que NUNCA deve ir para o GitHub é tão importante quanto saber programar.',
      analogyTitle: 'O cofre privado que não vai para a montra',
      analogyBody: 'Credenciais de base de dados (.env) e ficheiros Excel com nomes e moradas reais de clientes nunca podem ser publicados num repositório público (RGPD e segurança).',
      concepts: [
        'O ficheiro .gitignore lista nomes ou padrões (como *.env ou *_privados.xlsx) que o Git deve ignorar.',
        'Os dados da Mercearia podem ir para o GitHub apenas porque são sintéticos (gerados por src/gerar_dados.py com semente 42).',
        'Experimenta ver cat .gitignore no simulador: vais notar que .env e dados_clientes_privados.xlsx são bloqueados automaticamente!',
      ],
      referenceTitle: 'Regras essenciais de .gitignore para dados',
      referenceRows: [
        { syntax: '.env', meaning: 'Protege senhas de SQL e chaves de API', example: 'DATABASE_URL=...' },
        { syntax: '__pycache__/ e .venv/', meaning: 'Ignora caches e ambiente virtual Python', example: 'Ficheiros locais da máquina' },
        { syntax: '*.parquet / *_privados.xlsx', meaning: 'Ignora ficheiros brutos pesados ou com dados pessoais', example: 'Conformidade RGPD' },
      ],
      engine: 'git',
      exampleCode: `cat .gitignore
git init
git add .env
git status`,
      gitChallenge: {
        description: 'Inspecione o ficheiro .gitignore com cat .gitignore, adiciona uma regra "*.bak" usando echo "*.bak" >> .gitignore e confirma com cat .gitignore.',
        starterCommands: `cat .gitignore
# Acrescenta a regra *.bak ao .gitignore
`,
        solutionCommands: `cat .gitignore
echo "*.bak" >> .gitignore
cat .gitignore`,
        hint: 'Escreve echo "*.bak" >> .gitignore',
        validate: (state) => {
          const ok = state.gitignore.includes('*.bak');
          return {
            passed: ok,
            message: ok
              ? 'Regra *.bak adicionada! Ficheiros temporários de cópia nunca poluirão os teus commits.'
              : 'Usa echo "*.bak" >> .gitignore para adicionar a regra.',
          };
        },
      },
      quiz: {
        question: 'Subiste por engano uma password num commit e depois adicionaste .env ao .gitignore. A password desapareceu do histórico antigo?',
        options: [
          'Sim, o .gitignore apaga-a de todos os commits antigos.',
          'Não: continua no histórico e tem de ser trocada já.',
          'Só desaparece depois do próximo git push.',
          'Sim, desde que faças um commit novo sem o ficheiro.',
        ],
        correctIndex: 1,
        explanation: 'O histórico do Git é permanente: se uma chave foi publicada, considera-a comprometida e gera uma nova.',
      },
    },
    {
      id: 'git-04-branches',
      code: '04',
      title: 'Ramos (branches) e fusão (git merge)',
      lede: 'Cria ramos isolados para desenvolver novas análises ou limpar dados sujos sem arriscar partir o ramo main.',
      analogyTitle: 'Fotocopiar a receita antes de testar um tempero novo',
      analogyBody: 'No ramo limpeza-dados podes experimentar à vontade; quando os testes de verificar.py passam todos, regressas ao main e fazes git merge.',
      concepts: [
        'git switch -c nome-do-ramo cria um ramo novo e muda imediatamente para ele.',
        'git branch lista todos os ramos locais e assinala o ramo ativo com asterisco (*).',
        'git switch main seguido de git merge nome-do-ramo integra o trabalho validado.',
      ],
      referenceTitle: 'Gestão de ramos em Git',
      referenceRows: [
        { syntax: 'git branch', meaning: 'Lista os ramos existentes', example: '* main' },
        { syntax: 'git switch -c <ramo>', meaning: 'Cria e entra num novo ramo', example: 'git switch -c analise-setembro' },
        { syntax: 'git switch main', meaning: 'Volta ao ramo principal', example: 'git switch main' },
        { syntax: 'git merge <ramo>', meaning: 'Junta alterações de outro ramo no atual', example: 'git merge analise-setembro' },
      ],
      engine: 'git',
      exampleCode: `git init
git add .
git commit -m "Base estavel"
git switch -c feature-relatorio
git switch main
git merge feature-relatorio`,
      gitChallenge: {
        description: 'Inicializa o repo, cria um novo ramo chamado "limpeza-pandas" com git switch -c limpeza-pandas, faz git add . e um commit nesse ramo, volta a main e faz git merge limpeza-pandas.',
        starterCommands: `git init
# Cria o ramo limpeza-pandas, faz commit, volta a main e faz merge
`,
        solutionCommands: `git init
git switch -c limpeza-pandas
git add .
git commit -m "Adiciona limpeza de vendas sujas"
git switch main
git merge limpeza-pandas`,
        hint: 'Sequência: git init -> git switch -c limpeza-pandas -> git add . -> git commit -m "..." -> git switch main -> git merge limpeza-pandas',
        validate: (state, output) => {
          const ok =
            state.branches.includes('limpeza-pandas') &&
            state.commits.length >= 1 &&
            state.currentBranch === 'main' &&
            output.includes('Fast-forward');
          return {
            passed: ok,
            message: ok
              ? 'Fluxo completo de feature branch concluído e integrado em main!'
              : 'Verifica todos os passos: criar ramo limpeza-pandas, fazer commit, voltar a main e correr git merge limpeza-pandas.',
          };
        },
      },
      quiz: {
        question: 'Em equipas no GitHub, qual é o mecanismo padrão para pedir revisão de um ramo antes de o fundir no main?',
        options: [
          'Pull Request (PR)',
          'git clone',
          'git stash',
          'Merge direto no main',
        ],
        correctIndex: 0,
        explanation: 'Um Pull Request permite rever código, discutir queries SQL e correr verificações automáticas antes do merge.',
      },
    },
    {
      id: 'git-05-github-portfolio',
      code: '05',
      title: 'GitHub remoto e como montar um Portfólio de Analista',
      lede: 'Publica o teu repositório com git push e estrutura um README executivo que recrutadores técnicos consigam avaliar em 60 segundos.',
      analogyTitle: 'A montra da tua mercearia aberta ao mercado de trabalho',
      analogyBody: 'Um bom portfólio de analista não despeja apenas código: apresenta o problema de negócio, mostra os KPIs descobertos, explica as limitações dos dados e permite reproduzir tudo num comando.',
      concepts: [
        'git remote add origin <url> liga o teu repositório local à página do GitHub.',
        'git push -u origin main publica os teus commits na nuvem.',
        'Checklist de README forte: contexto do problema, arquitetura das pastas, principais conclusões quantificadas, como correr e limitações conhecidas.',
      ],
      referenceTitle: 'Sincronização com GitHub',
      referenceRows: [
        { syntax: 'git remote add origin <url>', meaning: 'Associa repositório remoto no GitHub', example: 'https://github.com/user/mercearia.git' },
        { syntax: 'git push -u origin main', meaning: 'Envia commits locais para o GitHub', example: 'Publica o portfólio' },
        { syntax: 'git pull', meaning: 'Descarrega e integra novidades do remoto', example: 'Sincronizar noutro PC' },
      ],
      engine: 'git',
      exampleCode: `git init
git add .
git commit -m "Publica portfolio completo Mercearia do Bairro"
git remote add origin https://github.com/analista/mercearia-do-bairro.git
git push -u origin main`,
      gitChallenge: {
        description: 'Faz o percurso completo de publicação: git init, git add ., git commit -m "...", configure um remoto com git remote add origin https://github.com/analista/mercearia.git e envie com git push -u origin main.',
        starterCommands: `git init
# Faz add, commit, remote add e push para main
`,
        solutionCommands: `git init
git add .
git commit -m "Versao 1.0 do portfolio de analisa de dados"
git remote add origin https://github.com/analista/mercearia.git
git push -u origin main`,
        hint: 'Termina com git push -u origin main após ter pelo menos 1 commit.',
        validate: (state) => {
          const ok = state.pushedBranches.includes('main') && Boolean(state.remoteUrl);
          return {
            passed: ok,
            message: ok
              ? `Portfólio publicado em ${state.remoteUrl} no ramo main!`
              : 'Garante que tens um commit gravado e corres git remote add origin ... seguido de git push -u origin main.',
          };
        },
      },
      quiz: {
        question: 'O que mais valoriza um recrutador ao abrir um projeto de Análise de Dados no teu GitHub?',
        options: [
          'Muitos ficheiros e pastas, para mostrar muito trabalho feito.',
          'Um README com a pergunta, o método e os resultados.',
          'Gráficos com muitas cores e efeitos 3D.',
          'O número de estrelas e seguidores do perfil.',
        ],
        correctIndex: 1,
        explanation: 'Clareza de comunicação, rigor nos números e reprodutibilidade distinguem imediatamente um bom analista.',
      },
    },
  ],
};

export const statsBiTrack: Track = {
  id: 'bi',
  shortTitle: '5. Estatística & BI',
  fullTitle: 'Estatística, Excel/DAX e Power BI para Analistas',
  summary: 'Medidas estatísticas robustas, deteção de outliers, Curva ABC (Pareto), Star Schema, DAX e visualização honesta.',
  engineLabel: 'Python + SQLite Analítico',
  lessons: [
    {
      id: 'bi-01-media-mediana',
      code: '01',
      title: 'Média vs Mediana: quando os extremos enganam',
      lede: 'Em vendas a retalho, poucas compras grandes puxam a média para cima; comparar média e mediana revela a assimetria real dos dados.',
      analogyTitle: 'O restaurante que compra 20 garrafões de azeite',
      analogyBody: 'Se 8 clientes gastam entre 1 € e 9 € e um cliente gasta 48 €, a média salta para 9,48 € mas a mediana mantém-se firme nos 4,80 €.',
      concepts: [
        'Nas 5 078 vendas reais da Mercearia, a média por linha é 5,30 € enquanto a mediana é 3,50 € (distribuição assimétrica positiva).',
        'Usa sempre mediana (P50) ao lado da média em salários, preços de casas e valores de cestos de compras.',
        'Em Python puro dispões de statistics.mean() e statistics.median().',
      ],
      referenceTitle: 'Medidas de tendência central',
      referenceRows: [
        { syntax: 'statistics.mean(x) / s.mean()', meaning: 'Média aritmética (sensível a extremos)', example: '5.30 € em vendas.csv' },
        { syntax: 'statistics.median(x) / s.median()', meaning: 'Valor central P50 (robusto a outliers)', example: '3.50 € em vendas.csv' },
        { syntax: 'statistics.mode(x) / s.mode()', meaning: 'Valor mais frequente na amostra', example: 'Quantidade modal' },
      ],
      engine: 'python',
      exampleCode: `import csv, statistics

with open("dados/vendas.csv", encoding="utf-8") as f:
    subtotais = [int(r["quantidade"]) * float(r["preco"]) for r in csv.DictReader(f)]

print(f"Média real (5078 vendas):   {statistics.mean(subtotais):.2f} €")
print(f"Mediana real (5078 vendas): {statistics.median(subtotais):.2f} €")`,
      pythonChallenge: {
        description: 'Sobre taloes_amostra = [1.20, 2.50, 3.40, 3.40, 4.80, 5.10, 7.50, 9.40, 48.00]: calcula media, mediana, desvio_padrao (arredondado a 2 casas) e amplitude (max - min).',
        starterCode: `import statistics

taloes_amostra = [1.20, 2.50, 3.40, 3.40, 4.80, 5.10, 7.50, 9.40, 48.00]

media = None
mediana = None
desvio_padrao = None
amplitude = None

print(media, mediana, desvio_padrao, amplitude)`,
        solutionCode: `import statistics

taloes_amostra = [1.20, 2.50, 3.40, 3.40, 4.80, 5.10, 7.50, 9.40, 48.00]

media = statistics.mean(taloes_amostra)
mediana = statistics.median(taloes_amostra)
desvio_padrao = round(statistics.stdev(taloes_amostra), 2)
amplitude = max(taloes_amostra) - min(taloes_amostra)

print(round(media, 2), mediana, desvio_padrao, amplitude)`,
        checks: [
          { label: 'media (~9.48)', expr: 'isinstance(media, (int, float)) and math.isclose(media, 9.4778, abs_tol=0.01)', actualExpr: 'media', hint: 'Usa statistics.mean(taloes_amostra).' },
          { label: 'mediana (4.80)', expr: 'isinstance(mediana, (int, float)) and math.isclose(mediana, 4.80, abs_tol=0.01)', actualExpr: 'mediana', hint: 'Usa statistics.median(taloes_amostra).' },
          { label: 'desvio_padrao (14.66)', expr: 'isinstance(desvio_padrao, (int, float)) and math.isclose(desvio_padrao, 14.66, abs_tol=0.02)', actualExpr: 'desvio_padrao', hint: 'Usa round(statistics.stdev(taloes_amostra), 2).' },
          { label: 'amplitude (46.80)', expr: 'isinstance(amplitude, (int, float)) and math.isclose(amplitude, 46.80, abs_tol=0.01)', actualExpr: 'amplitude', hint: 'Calcula max(taloes_amostra) - min(taloes_amostra).' },
        ],
      },
      quiz: {
        question: 'Se a média das faturas é muito superior à mediana, o que nos diz isso sobre as vendas?',
        options: [
          'Que a maioria das faturas tem um valor elevado.',
          'Que há algumas faturas grandes a puxar a média para cima.',
          'Que há muitas faturas pequenas a puxar a média para cima.',
          'Que os dados têm erros e precisam de ser limpos.',
        ],
        correctIndex: 1,
        explanation: 'Quando há assimetria positiva (algumas compras grandes de Azeite ou Queijo), a média sobe acima da mediana.',
      },
    },
    {
      id: 'bi-02-quartis-outliers',
      code: '02',
      title: 'Quartis, IQR e deteção de valores atípicos (Outliers)',
      lede: 'Aprende a regra prática de Tukey (Q3 + 1,5 * IQR) usada em caixas de bigodes (boxplots) para sinalizar transações fora do padrão.',
      analogyTitle: 'Separar o movimento normal de encomendas extraordinárias',
      analogyBody: 'Dividindo as vendas ordenadas em 4 partes iguais, os 50% centrais ficam entre o 1.º quartil (Q1, 25%) e o 3.º quartil (Q3, 75%). Essa largura central chama-se IQR.',
      concepts: [
        'Q1 (percentil 25), Q2 (mediana, percentil 50) e Q3 (percentil 75).',
        'IQR = Q3 - Q1 mede a dispersão dos 50% centrais sem ser distorcido por extremos.',
        'Qualquer venda acima de Q3 + 1.5 * IQR é sinalizada como outlier superior.',
      ],
      referenceTitle: 'Quartis e Outliers em Pandas',
      referenceRows: [
        { syntax: 's.quantile(0.25) / s.quantile(0.75)', meaning: 'Calcula Q1 e Q3', example: 'q1, q3 = s.quantile([0.25, 0.75])' },
        { syntax: 'iqr = q3 - q1', meaning: 'Amplitude interquartil', example: 'Largura da caixa no boxplot' },
        { syntax: 'limite_sup = q3 + 1.5 * iqr', meaning: 'Limiar clássico de outlier superior', example: 's[s > limite_sup]' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
q1 = df["sub"].quantile(0.25)
q3 = df["sub"].quantile(0.75)
iqr = q3 - q1
limite = q3 + 1.5 * iqr

print(f"Q1={q1:.2f} € | Q3={q3:.2f} € | IQR={iqr:.2f} € | Limite outlier={limite:.2f} €")
print("Linhas acima do limiar:", int((df["sub"] > limite).sum()))`,
      pythonChallenge: {
        description: 'Sobre dados/vendas.csv (subtotal = quantidade * preco), calcula iqr (Q3 - Q1 arredondado a 2 casas) e num_outliers (quantas vendas têm subtotal estritamente acima de Q3 + 1.5 * (Q3 - Q1)).',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
sub = df["quantidade"] * df["preco"]

iqr = None
num_outliers = None

print(iqr, num_outliers)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
sub = df["quantidade"] * df["preco"]
q1 = sub.quantile(0.25)
q3 = sub.quantile(0.75)
iqr_raw = q3 - q1

iqr = round(float(iqr_raw), 2)
num_outliers = int((sub > (q3 + 1.5 * iqr_raw)).sum())

print(iqr, num_outliers)`,
        checks: [
          { label: 'iqr calculado corretamente (5.22)', expr: 'iqr is not None and math.isclose(float(iqr), 5.22, abs_tol=0.01)', actualExpr: 'iqr', hint: 'Calcula sub.quantile(0.75) - sub.quantile(0.25) (esperado ~5.22).' },
          { label: 'num_outliers acima do limite superior (348)', expr: 'num_outliers is not None and int(num_outliers) == 348', actualExpr: 'num_outliers', hint: 'Conta int((sub > (q3 + 1.5 * (q3 - q1))).sum()).' },
        ],
      },
      quiz: {
        question: 'Encontrar um outlier estatístico significa que devemos apagá-lo automaticamente?',
        options: [
          'Sim: um outlier é sempre um erro de registo.',
          'Não: primeiro investiga-se se é erro ou venda real.',
          'Sim, mas só quando está acima do limite superior (Q3 + 1,5×IQR).',
          'Não: os outliers nunca afetam a análise.',
        ],
        correctIndex: 1,
        explanation: 'Um preço negativo (-1,00 €) é erro e corrige-se; 5 garrafas de Azeite (37,50 €) é uma venda real e valiosa. Distinguir os dois casos é uma competência crítica.',
      },
    },
    {
      id: 'bi-03-curva-abc',
      code: '03',
      title: 'Curva ABC (Princípio de Pareto 80/20) na Mercearia',
      lede: 'Descobre que pequena fração dos 15 produtos concentra a maior fatia da faturação anual da loja.',
      analogyTitle: 'Quais prateleiras nunca podem ficar sem stock?',
      analogyBody: 'Na gestão de retalho, classificamos em Classe A os artigos que somados geram cerca de 70% a 80% da receita, Classe B os seguintes 15% a 20% e Classe C os restantes.',
      concepts: [
        'Ordenam-se os produtos por faturação decrescente.',
        'Calcula-se a quota individual (%) e a quota acumulada (.cumsum()) do primeiro ao último.',
        'Apenas 2 artigos (Azeite e Queijo) representam quase 40% de toda a faturação da Mercearia!',
      ],
      referenceTitle: 'Cálculo de Curva ABC em Pandas',
      referenceRows: [
        { syntax: 's / s.sum() * 100', meaning: 'Quota percentual de cada item', example: 'Peso na faturação' },
        { syntax: 'quota.cumsum()', meaning: 'Soma acumulada das percentagens', example: 'Curva de Pareto (0% a 100%)' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
abc = df.groupby("produto", as_index=False)["sub"].sum().sort_values("sub", ascending=False)
abc["quota_pct"] = (abc["sub"] / abc["sub"].sum() * 100).round(2)
abc["acumulado_pct"] = abc["quota_pct"].cumsum().round(2)
abc.head(8)`,
      pythonChallenge: {
        description: 'Ordena os produtos por faturação decrescente e guarda em quota_top2_pct a percentagem conjunta representada pelos 2 primeiros produtos (Azeite e Queijo) sobre o total da Mercearia, arredondada a 2 casas.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

quota_top2_pct = None
print(quota_top2_pct)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
por_prod = df.groupby("produto")["sub"].sum().sort_values(ascending=False)
quota_top2_pct = round(float(por_prod.iloc[:2].sum() / por_prod.sum() * 100), 2)

print(quota_top2_pct)`,
        checks: [
          { label: 'quota_top2_pct (39.78%)', expr: 'quota_top2_pct is not None and math.isclose(float(quota_top2_pct), 39.78, abs_tol=0.1)', actualExpr: 'quota_top2_pct', hint: '(6262.50 + 4439.40) / 26902.89 * 100 = 39.78%.' },
        ],
      },
      quiz: {
        question: 'Na Curva ABC da Mercearia, porque é que o Pão vende centenas de unidades mas fica no fundo em faturação?',
        options: [
          'Porque tem um preço unitário muito baixo (0,25 €).',
          'Porque vende sobretudo ao fim de semana.',
          'Porque a Curva ABC ordena os produtos por unidades.',
          'Porque é comprado por poucos clientes diferentes.',
        ],
        correctIndex: 0,
        explanation: 'Nunca se descontinua um produto Classe C em receita sem verificar se ele é o chamariz que traz o cliente à loja!',
      },
    },
    {
      id: 'bi-04-star-schema',
      code: '04',
      title: 'Modelação Dimensional (Star Schema) para Power BI',
      lede: 'Aprende a organizar tabelas em Factos e Dimensões antes de construir relatórios em Power BI ou Tableau.',
      analogyTitle: 'A estrela com os talões no centro e os catálogos nas pontas',
      analogyBody: 'Evita juntar tudo num único tabelão redundante para o Power BI: mantém fVendas enxuta no meio ligada de 1-para-muitos (*) a dProdutos, dClientes e dCalendario.',
      concepts: [
        'Tabela de Factos (vendas): guarda eventos quantificáveis (data, chaves estrangeiras, quantidade, preco).',
        'Tabelas de Dimensão (produtos, clientes, calendario): guardam contexto descritivo para filtros e slicers (cidade, categoria, trimestre).',
        'Relacionamentos 1:* com filtro unidirecional (Dimensão filtra Facto) evitam ambiguidades em DAX.',
      ],
      referenceTitle: 'Arquitetura Star Schema na Mercearia',
      referenceRows: [
        { syntax: 'dProdutos (1) -> (*) fVendas', meaning: 'Relação por produto_id', example: 'Filtra por Categoria' },
        { syntax: 'dClientes (1) -> (*) fVendas', meaning: 'Relação por cliente_id', example: 'Filtra por Cidade' },
        { syntax: 'dCalendario (1) -> (*) fVendas', meaning: 'Relação por data contínua', example: 'Inteligência temporal YoY/MoM' },
      ],
      engine: 'sql',
      exampleCode: `-- Verificar integridade referencial do Star Schema (deve dar 0 órfãos!)
SELECT
  SUM(CASE WHEN p.id IS NULL THEN 1 ELSE 0 END) AS vendas_sem_produto,
  SUM(CASE WHEN c.id IS NULL THEN 1 ELSE 0 END) AS vendas_sem_cliente
FROM vendas v
LEFT JOIN produtos p ON p.id = v.produto_id
LEFT JOIN clientes c ON c.id = v.cliente_id;`,
      sqlChallenge: {
        description: 'Constrói uma vista agregada para um cartão matriz de Power BI cruzando categoria (de produtos) e cidade (de clientes): mostra categoria, cidade e faturacao arredondada a 2 casas, ordenada por categoria ASC e faturacao DESC.',
        starterSql: `SELECT
  p.categoria,
  c.cidade,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao
FROM vendas v
-- Liga produtos e clientes, agrupa e ordena
`,
        solutionSql: `SELECT
  p.categoria,
  c.cidade,
  ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao
FROM vendas v
INNER JOIN produtos p ON p.id = v.produto_id
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY p.categoria, c.cidade
ORDER BY p.categoria ASC, faturacao DESC;`,
        hint: 'Junta produtos e clientes com dois INNER JOIN e faz GROUP BY p.categoria, c.cidade.',
        validate: (cols, rows) => {
          const ok = rows.length === 36 && cols.length === 3 && rows[0][0] === 'Bebidas';
          return {
            passed: ok,
            message: ok
              ? 'Certo: 6 categorias x 6 cidades = 36 células prontas para uma matriz de Power BI!'
              : `Obtiveste ${rows.length} linhas. Confirma os dois INNER JOIN, GROUP BY p.categoria, c.cidade e ORDER BY p.categoria ASC, faturacao DESC (esperam-se 6 categorias x 6 cidades = 36 linhas).`,
          };
        },
      },
      quiz: {
        question: 'Porque se cria sempre uma tabela dCalendario dedicada no Power BI em vez de usar apenas a coluna data de vendas?',
        options: [
          'Porque o DAX de datas precisa de um calendário contínuo.',
          'Porque o Power BI não lê datas dentro da tabela de vendas.',
          'Porque assim o ficheiro .pbix fica mais pequeno.',
          'Porque a coluna data de vendas é guardada como texto.',
        ],
        correctIndex: 0,
        explanation: 'Funções como TOTALYTD ou DATEADD exigem uma coluna de datas única e contínua de 1 de janeiro a 31 de dezembro.',
      },
    },
    {
      id: 'bi-05-excel-dax',
      code: '05',
      title: 'Ponte SQL/Pandas para Excel Moderno e DAX',
      lede: 'Um analista completo transita fluentemente entre SQL, Pandas, Excel (XLOOKUP/SUMIFS) e medidas DAX no Power BI.',
      analogyTitle: 'Quatro línguas para dizer exatamente a mesma frase analítica',
      analogyBody: 'Cruzar tabelas chama-se JOIN em SQL, merge em Pandas, XLOOKUP (PROCX) em Excel e RELATED em DAX. Quando percebes o conceito lógico, dominas qualquer ferramenta.',
      concepts: [
        'Medidas explícitas em DAX (SUMX, DIVIDE, CALCULATE) são recalculadas dinamicamente consoante os filtros clicados no relatório.',
        'DIVIDE(numerador, denominador, 0) protege contra divisões por zero sem sujar visuais com Infinity ou NaN.',
        'CALCULATE([Medida], filtro) altera o contexto de filtro, permitindo calcular quotas sobre o total geral com ALL().',
      ],
      referenceTitle: 'Dicionário de tradução do Analista de Dados',
      referenceRows: [
        { syntax: 'SUMX(vendas, vendas[qtd] * vendas[preco])', meaning: 'DAX: multiplica linha a linha e soma', example: 'Equivale a SUM(qtd * preco) em SQL' },
        { syntax: 'DIVIDE([Faturacao], DISTINCTCOUNT(vendas[cliente_id]))', meaning: 'DAX: gasto médio por cliente ativo', example: 'Seguro contra divisão por zero' },
        { syntax: 'CALCULATE([Faturacao], ALL(produtos))', meaning: 'DAX: ignora filtro de produto para denominador de %', example: 'Quota % de cada produto' },
        { syntax: '=XLOOKUP(C2; produtos!A:A; produtos!C:C)', meaning: 'Excel: procura categoria pelo produto_id', example: 'Substituto moderno do PROCV' },
      ],
      engine: 'sql',
      exampleCode: `-- Equivalente SQL de DIVIDE([Faturacao], ALL(produtos)) para validar medidas DAX:
SELECT
  produto,
  ROUND(SUM(quantidade * preco), 2) AS faturacao_eur,
  ROUND(100.0 * SUM(quantidade * preco) / (SELECT SUM(quantidade * preco) FROM vendas), 2) AS quota_all_pct
FROM vendas
GROUP BY produto
ORDER BY quota_all_pct DESC
LIMIT 5;`,
      sqlChallenge: {
        description: 'Valida em SQL a medida DAX "Gasto Médio por Cliente Ativo" em cada cidade: devolve cidade, clientes_ativos (COUNT(DISTINCT c.id)) e gasto_medio_cliente (faturação da cidade a dividir pelos seus clientes ativos, arredondado a 2 casas), ordenado por gasto_medio_cliente DESC.',
        starterSql: `SELECT
  c.cidade,
  COUNT(DISTINCT c.id) AS clientes_ativos
  -- Calcula gasto_medio_cliente
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.cidade;`,
        solutionSql: `SELECT
  c.cidade,
  COUNT(DISTINCT c.id) AS clientes_ativos,
  ROUND(SUM(v.quantidade * v.preco) / COUNT(DISTINCT c.id), 2) AS gasto_medio_cliente
FROM vendas v
INNER JOIN clientes c ON c.id = v.cliente_id
GROUP BY c.cidade
ORDER BY gasto_medio_cliente DESC;`,
        hint: 'Usa ROUND(SUM(v.quantidade * v.preco) / COUNT(DISTINCT c.id), 2) AS gasto_medio_cliente e ordena DESC.',
        validate: (cols, rows) => {
          const ok = rows.length === 6 && cols.length === 3 && Number(rows[0][2]) >= Number(rows[5][2]);
          return {
            passed: ok,
            message: ok
              ? `Certo! Agora tens os valores exatos para conferir o cartão DAX no Power BI (${rows[0][0]} lidera em gasto por cliente).`
              : 'Devolve 3 colunas (cidade, clientes_ativos, gasto_medio_cliente) ordenadas por gasto_medio_cliente DESC.',
          };
        },
      },
      quiz: {
        question: 'Porque é que em DAX SUM(vendas[quantidade]) * SUM(vendas[preco]) dá um número absurdamente errado?',
        options: [
          'Multiplica o total das quantidades pelo total dos preços.',
          'Porque SUM não aceita colunas de números inteiros.',
          'Porque falta um filtro de data dentro de CALCULATE.',
          'Porque devia usar AVERAGE em vez de SUM no preço.',
        ],
        correctIndex: 0,
        explanation: 'Para multiplicar duas colunas linha a linha antes de somar usa-se sempre o iterador SUMX(vendas, vendas[quantidade] * vendas[preco]).',
      },
    },
    {
      id: 'bi-06-storytelling',
      code: '06',
      title: 'Visualização Honesta e Relatório Executivo',
      lede: 'Escolhe a geometria certa para cada pergunta de negócio e transforma tabelas cruas numa recomendação acionável.',
      analogyTitle: 'Um painel claro lê-se em 5 segundos do outro lado do balcão',
      analogyBody: 'Um bom gráfico não precisa de efeitos 3D nem de 15 cores: usa barras horizontais para rankings, linhas para evolução temporal e destaca a conclusão logo no título.',
      concepts: [
        'Evolução no tempo (12 meses): gráfico de linhas com eixo contínuo.',
        'Comparação de categorias ou cidades: barras horizontais ordenadas (nunca uses gráfico circular com mais de 3 ou 4 fatias!).',
        'Regra da honestidade visual: qualquer gráfico de barras tem obrigatoriamente de começar o eixo no zero (0).',
      ],
      referenceTitle: 'Guia rápido de escolhe de gráficos',
      referenceRows: [
        { syntax: 'Série temporal (Jan a Dez)', meaning: 'Gráfico de linha', example: 'Pico em setembro (2 462,82 €)' },
        { syntax: 'Ranking de 15 produtos', meaning: 'Barras horizontais ordenadas do maior ao menor', example: 'Nomes leem-se sem rodar o pescoço' },
        { syntax: 'Relação Preço vs Unidades', meaning: 'Gráfico de dispersão (Scatter plot)', example: 'Elasticidade-preço por artigo' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["mes"] = vendas["data"].str.slice(0, 7)
vendas["sub"] = vendas["quantidade"] * vendas["preco"]
mensal = vendas.groupby("mes", as_index=False)["sub"].sum().round(2)
melhor = mensal.loc[mensal["sub"].idxmax()]
pior = mensal.loc[mensal["sub"].idxmin()]

print(f"Síntese executiva: Melhor mês {melhor['mes']} ({melhor['sub']} €) | Mês mais fraco {pior['mes']} ({pior['sub']} €)")
mensal`,
            pythonChallenge: {
        description: 'Prepara os dados de um gráfico de barras honesto e do resumo executivo sobre vendas.csv: guarda em ranking_meses a faturação de cada mês de 2025 ordenada do maior para o menor (é a ordem certa para barras horizontais) e em variacao_pico_vale a diferença em euros (arredondada a 2 casas) entre o primeiro e o último mês desse ranking.',
        starterCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["mes"] = vendas["data"].str.slice(0, 7)
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

ranking_meses = None
variacao_pico_vale = None
print(ranking_meses, variacao_pico_vale)`,
        solutionCode: `import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["mes"] = vendas["data"].str.slice(0, 7)
vendas["sub"] = vendas["quantidade"] * vendas["preco"]

ranking_meses = vendas.groupby("mes")["sub"].sum().sort_values(ascending=False)
variacao_pico_vale = round(float(ranking_meses.iloc[0] - ranking_meses.iloc[-1]), 2)
print(variacao_pico_vale)
ranking_meses`,
        checks: [
          { label: 'ranking_meses tem os 12 meses do maior para o menor', expr: 'hasattr(ranking_meses, "is_monotonic_decreasing") and len(ranking_meses) == 12 and ranking_meses.is_monotonic_decreasing and str(ranking_meses.index[0]) == "2025-09"', actualExpr: 'list(ranking_meses.index) if hasattr(ranking_meses, "index") else ranking_meses', hint: 'Agrupa por mes, soma sub e usa .sort_values(ascending=False).' },
          { label: 'variacao_pico_vale (493.83 €)', expr: 'variacao_pico_vale is not None and math.isclose(float(variacao_pico_vale), 493.83, abs_tol=0.01)', actualExpr: 'variacao_pico_vale', hint: 'Subtrai o último valor do ranking ao primeiro (.iloc[0] - .iloc[-1]).' },
        ],
      },
      quiz: {
        question: 'Tens 15 produtos para comparar por faturação. Qual é o pior gráfico que poderias escolher?',
        options: [
          'Barras horizontais ordenadas',
          'Gráfico circular 3D com 15 fatias',
          'Tabela ordenada com barras de dados',
          'Colunas verticais ordenadas',
        ],
        correctIndex: 1,
        explanation: 'O olho humano compara comprimentos alinhados com grande precisão, mas falha ao comparar 15 ângulos num gráfico circular.',
      },
    },
  ],
};

export const cheatsheets: CheatsheetEntry[] = [
  {
    category: 'Python',
    topic: 'Converter texto com vírgula para float',
    syntax: 'float(texto.strip().replace(",", "."))',
    description: 'Limpa espaços nas pontas e converte decimais europeus como "2,35" sem erro.',
    tryEngine: 'python',
    trySnippet: 'preco = float(" 2,35 ".strip().replace(",", "."))\nprint(preco, type(preco).__name__)',
  },
  {
    category: 'Python',
    topic: 'Acumulador em dicionário com .get()',
    syntax: 'totais[chave] = totais.get(chave, 0) + valor',
    description: 'Soma quantidades ou faturação por produto em Python puro sem KeyError.',
    tryEngine: 'python',
    trySnippet: 'totais = {}\nfor p, q in [("Pão", 3), ("Leite", 2), ("Pão", 5)]:\n    totais[p] = totais.get(p, 0) + q\nprint(totais)',
  },
  {
    category: 'Python',
    topic: 'Ler CSV com DictReader',
    syntax: 'with open("dados/vendas.csv", encoding="utf-8") as f:\n    linhas = list(csv.DictReader(f))',
    description: 'Lê cada registo como um dicionário indexado pelos nomes das colunas.',
    tryEngine: 'python',
    trySnippet: 'import csv\nwith open("dados/produtos.csv", encoding="utf-8") as f:\n    print(list(csv.DictReader(f))[:3])',
  },
  {
    category: 'SQL',
    topic: 'Agregação com filtro de grupo (HAVING)',
    syntax: 'SELECT produto, SUM(quantidade) AS un FROM vendas GROUP BY produto HAVING SUM(quantidade) > 850;',
    description: 'WHERE filtra linhas antes de agrupar; HAVING filtra os totais depois do GROUP BY.',
    tryEngine: 'sql',
    trySnippet: 'SELECT produto, SUM(quantidade) AS unidades\nFROM vendas\nGROUP BY produto\nHAVING SUM(quantidade) > 850\nORDER BY unidades DESC;',
  },
  {
    category: 'SQL',
    topic: 'Cruzar Factos e Dimensões (INNER JOIN)',
    syntax: 'SELECT c.cidade, ROUND(SUM(v.quantidade * v.preco), 2) FROM vendas v INNER JOIN clientes c ON c.id = v.cliente_id GROUP BY c.cidade;',
    description: 'Junta as vendas às fichas de clientes para agregar faturação por cidade.',
    tryEngine: 'sql',
    trySnippet: 'SELECT c.cidade, ROUND(SUM(v.quantidade * v.preco), 2) AS faturacao_eur\nFROM vendas v\nINNER JOIN clientes c ON c.id = v.cliente_id\nGROUP BY c.cidade\nORDER BY faturacao_eur DESC;',
  },
  {
    category: 'SQL',
    topic: 'Encontrar registos sem correspondência (Anti-Join)',
    syntax: 'SELECT c.* FROM clientes c LEFT JOIN vendas v ON v.cliente_id = c.id WHERE v.id IS NULL;',
    description: 'Descobre clientes que nunca efetuaram compras.',
    tryEngine: 'sql',
    trySnippet: 'SELECT c.id, c.nome, c.cidade\nFROM clientes c\nLEFT JOIN vendas v ON v.cliente_id = c.id\nWHERE v.id IS NULL;',
  },
  {
    category: 'SQL',
    topic: 'Acumulado anual com Window Function',
    syntax: 'SUM(faturacao_mes) OVER (ORDER BY mes)',
    description: 'Calcula soma acumulada linha a linha mantendo todos os meses visíveis.',
    tryEngine: 'sql',
    trySnippet: 'WITH m AS (\n  SELECT SUBSTR(data, 1, 7) AS mes, ROUND(SUM(quantidade * preco), 2) AS fat\n  FROM vendas GROUP BY 1\n)\nSELECT mes, fat, ROUND(SUM(fat) OVER (ORDER BY mes), 2) AS acumulado FROM m;',
  },
  {
    category: 'Pandas',
    topic: 'Filtro múltiplo e .isin()',
    syntax: 'df[(df["produto"].isin(["Azeite", "Queijo"])) & (df["quantidade"] >= 3)]',
    description: 'Combina pertença a lista e comparação numérica com parênteses obrigatórios.',
    tryEngine: 'python',
    trySnippet: 'import pandas as pd\ndf = pd.read_csv("dados/vendas.csv")\ndf[(df["produto"].isin(["Azeite", "Queijo"])) & (df["quantidade"] >= 4)].head(8)',
  },
  {
    category: 'Pandas',
    topic: 'Agrupamento múltiplo nomeado (.agg)',
    syntax: 'df.groupby("produto", as_index=False).agg(unidades=("quantidade", "sum"), preco_medio=("preco", "mean"))',
    description: 'Gera tabela agregada limpa pronta para exportar ou cruzar.',
    tryEngine: 'python',
    trySnippet: 'import pandas as pd\ndf = pd.read_csv("dados/vendas.csv")\ndf["sub"] = df["quantidade"] * df["preco"]\ndf.groupby("produto", as_index=False).agg(unidades=("quantidade", "sum"), faturacao=("sub", "sum")).sort_values("faturacao", ascending=False).head(6)',
  },
  {
    category: 'Pandas',
    topic: 'Pipeline de limpeza de CSV sujo',
    syntax: 'df.drop_duplicates().dropna(subset=["produto", "quantidade"])',
    description: 'Combina remoção de duplicados exatos e exclusão de células nulas críticas.',
    tryEngine: 'python',
    trySnippet: 'import pandas as pd\nsujas = pd.read_csv("dados/vendas_sujas.csv")\nsujas["produto"] = sujas["produto"].str.strip().str.capitalize()\nsujas["preco"] = pd.to_numeric(sujas["preco"].astype(str).str.replace(",", "."), errors="coerce")\nsujas.drop_duplicates().dropna()',
  },
  {
    category: 'Git',
    topic: 'Criar ramo, gravar e fundir no main',
    syntax: 'git switch -c nova-analise && git add . && git commit -m "Adiciona KPI" && git switch main && git merge nova-analise',
    description: 'Fluxo seguro de trabalho em ramo isolado sem partir o relatório principal.',
    tryEngine: 'git',
    trySnippet: 'git init\ngit switch -c nova-analise\ngit add .\ngit commit -m "Adiciona KPI de faturacao"\ngit switch main\ngit merge nova-analise\ngit log',
  },
  {
    category: 'BI & DAX',
    topic: 'Faturação linha a linha e Quota % em DAX',
    syntax: 'Faturacao = SUMX(vendas, vendas[quantidade] * vendas[preco])\nQuota % = DIVIDE([Faturacao], CALCULATE([Faturacao], ALL(produtos)))',
    description: 'Padrão fundamental em Power BI para multiplicar colunas e calcular peso percentual.',
  },
];
