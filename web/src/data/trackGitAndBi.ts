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
  // As lições deste ficheiro dividem-se em duas trilhas (Estatística e Visualização & BI)
  // em curriculum.ts, que também define a ordem e os códigos de cada etapa.
  id: 'bi',
  shortTitle: '5. Estatística & BI',
  fullTitle: 'Estatística, Excel/DAX e Power BI para Analistas',
  summary: 'Medidas estatísticas robustas, outliers, Curva ABC (Pareto), Star Schema, DAX, gráficos honestos, teste A/B (médias e proporções), tamanho de amostra, correlação, intervalos de confiança, probabilidade, qui-quadrado, ANOVA, regressão simples e múltipla, perguntas de entrevista e prática guiada de Excel e Power BI.',
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
          { label: 'As medidas são calculadas a partir da lista', expr: '(lambda r: abs(r["media"] - 4.0) < 1e-9 and abs(r["mediana"] - 2.0) < 1e-9 and abs(r["amplitude"] - 8.0) < 1e-9)(correr_com(taloes_amostra=[1.0, 2.0, 9.0]))', actualExpr: 'correr_com(taloes_amostra=[1.0, 2.0, 9.0]).get("media")', hint: 'Usa statistics.mean, statistics.median e max/min sobre taloes_amostra.' },
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
          { label: 'O IQR e os outliers vêm dos dados', expr: '(lambda r: abs(float(r["iqr"]) - 2.0) < 1e-9 and int(r["num_outliers"]) == 1)(correr_com(df=pd.DataFrame({"quantidade": [1, 1, 1, 1, 1], "preco": [1.0, 2.0, 3.0, 4.0, 100.0]})))', actualExpr: 'correr_com(df=pd.DataFrame({"quantidade": [1, 1, 1, 1, 1], "preco": [1.0, 2.0, 3.0, 4.0, 100.0]})).get("num_outliers")', hint: 'q1 e q3 com .quantile, iqr = q3 - q1, e conta os valores acima de q3 + 1.5 * iqr.' },
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
          { label: 'A quota é calculada a partir das vendas', expr: 'abs(float(correr_com(df=pd.DataFrame({"produto": ["A", "B", "C"], "quantidade": [1, 1, 1], "preco": [5.0, 3.0, 2.0]}))["quota_top2_pct"]) - 80.0) < 0.01', actualExpr: 'correr_com(df=pd.DataFrame({"produto": ["A", "B", "C"], "quantidade": [1, 1, 1], "preco": [5.0, 3.0, 2.0]})).get("quota_top2_pct")', hint: 'Ordena a faturação por produto e divide os 2 primeiros pelo total.' },
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
      referenceTitle: 'Guia rápido de escolha de gráficos',
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
          { label: 'O ranking e a variação vêm dos dados', expr: 'abs(float(correr_com(vendas=pd.DataFrame({"data": ["2025-01-01", "2025-02-01", "2025-02-02"], "quantidade": [1, 1, 1], "preco": [1.0, 3.0, 2.0]}))["variacao_pico_vale"]) - 4.0) < 0.01', actualExpr: 'correr_com(vendas=pd.DataFrame({"data": ["2025-01-01", "2025-02-01", "2025-02-02"], "quantidade": [1, 1, 1], "preco": [1.0, 3.0, 2.0]})).get("variacao_pico_vale")', hint: 'variacao_pico_vale = primeiro menos último valor de ranking_meses.' },
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
    {
      id: 'bi-07-graficos-matplotlib',
      code: '07',
      title: 'Desenhar gráficos honestos com matplotlib',
      lede: 'Passa da tabela ao gráfico: desenha barras horizontais ordenadas e linhas temporais com matplotlib, com o eixo a começar no zero e um título que diz a conclusão.',
      analogyTitle: 'A montra da mercearia',
      analogyBody: 'Uma tabela é o armazém: tem tudo, mas ninguém a lê a passar na rua. O gráfico é a montra: mostra só o essencial, arrumado do mais importante para o menos importante, sem truques de tamanho. Uma montra que corta metade da prateleira para parecer cheia engana o cliente; um eixo que não começa no zero faz o mesmo ao leitor.',
      concepts: [
        'fig, ax = plt.subplots() cria a folha (fig) e a área do gráfico (ax). Tudo o que desenhas vai para o ax.',
        'ax.barh(nomes, valores) desenha barras horizontais; ax.plot(x, y) desenha uma linha.',
        'Ordena os dados antes de desenhar: em barh a primeira barra fica em baixo, por isso ordena do menor para o maior para o maior ficar no topo.',
        'Barras começam sempre no zero: ax.set_xlim(left=0) (ou set_ylim(bottom=0) em colunas e linhas de faturação).',
        'O título deve dizer a conclusão ("A Mercearia vale metade da faturação"), não só o tema ("Faturação por categoria").',
      ],
      beginnerSteps: [
        'Agrupa a faturação por categoria com groupby e ordena com .sort_values() (do menor para o maior).',
        'Cria fig, ax = plt.subplots(figsize=(7, 4)).',
        'Desenha com ax.barh(por_categoria.index, por_categoria.values).',
        'Garante o zero com ax.set_xlim(left=0), escreve o título com ax.set_title(...) e o eixo com ax.set_xlabel("Faturação (€)").',
      ],
      proPractice: 'Em relatórios reais o gráfico é guardado com fig.savefig("relatorios/graficos/categorias.png", dpi=150) e colado no PowerPoint ou no README do projeto.',
      commonPitfall: 'Esquecer de ordenar os dados: as barras ficam por ordem alfabética e o leitor tem de procurar o maior valor com os olhos.',
      referenceTitle: 'matplotlib essencial para analistas',
      referenceRows: [
        { syntax: 'fig, ax = plt.subplots(figsize=(7, 4))', meaning: 'Cria a figura e a área de desenho', example: 'Largura 7 x altura 4 polegadas' },
        { syntax: 'ax.barh(nomes, valores)', meaning: 'Barras horizontais (rankings)', example: 'Faturação por categoria' },
        { syntax: 'ax.plot(x, y, marker="o")', meaning: 'Linha temporal com pontos', example: 'Faturação mês a mês' },
        { syntax: 'ax.set_xlim(left=0) / ax.set_ylim(bottom=0)', meaning: 'Eixo honesto a começar no zero', example: 'Evita exagerar diferenças' },
        { syntax: 'ax.set_title(...) / ax.set_xlabel(...)', meaning: 'Título com a conclusão e unidade no eixo', example: '"Faturação (€)"' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("dados/vendas_sazonais.csv")
vendas["mes"] = vendas["data"].str.slice(5, 7)
vendas["sub"] = vendas["quantidade"] * vendas["preco"]
por_mes = vendas.groupby("mes")["sub"].sum()

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(por_mes.index, por_mes.values, marker="o")
ax.set_ylim(bottom=0)
ax.set_title("Dezembro quase duplica a faturação de um mês normal")
ax.set_xlabel("Mês de 2025")
ax.set_ylabel("Faturação (€)")
fig.tight_layout()`,
      pythonChallenge: {
        description: 'Desenha um gráfico de barras horizontais honesto com a faturação de 2025 (vendas.csv) por categoria de produto: 6 barras ordenadas com a maior no topo, eixo a começar no zero, um título com a conclusão e o eixo X com a unidade "€". Usa as variáveis fig e ax.',
        starterCode: `import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]
df = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")

# 1) Faturação por categoria, ordenada do menor para o maior
por_categoria = None

# 2) Gráfico: fig, ax = plt.subplots(...), ax.barh(...), eixo no zero, título e rótulo do eixo X
`,
        solutionCode: `import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("dados/vendas.csv")
produtos = pd.read_csv("dados/produtos.csv")
vendas["sub"] = vendas["quantidade"] * vendas["preco"]
df = vendas.merge(produtos[["id", "categoria"]], left_on="produto_id", right_on="id")

por_categoria = df.groupby("categoria")["sub"].sum().sort_values()

fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(por_categoria.index, por_categoria.values)
ax.set_xlim(left=0)
ax.set_title("A Mercearia vale mais de metade da faturação")
ax.set_xlabel("Faturação em 2025 (€)")
fig.tight_layout()`,
        checks: [
          { label: 'Há 6 barras horizontais, uma por categoria', expr: 'len([p for p in ax.patches if p.get_width() > p.get_height()]) == 6', actualExpr: 'len(ax.patches)', hint: 'Usa ax.barh(por_categoria.index, por_categoria.values) com a faturação agrupada por categoria.' },
          { label: 'As barras estão ordenadas, com a Mercearia (13 879,84 €) no topo', expr: '[round(p.get_width(), 2) for p in ax.patches] == [205.5, 1316.95, 1965.8, 2778.8, 6756.0, 13879.84]', actualExpr: '[round(p.get_width(), 2) for p in ax.patches]', hint: 'Ordena com .sort_values() (do menor para o maior) antes de desenhar: em barh a primeira barra fica em baixo.' },
          { label: 'O eixo começa no zero', expr: 'ax.get_xlim()[0] <= 0', actualExpr: 'ax.get_xlim()', hint: 'Acrescenta ax.set_xlim(left=0).' },
          { label: 'Tem título com a conclusão e o eixo X com "€"', expr: 'len(ax.get_title().strip()) >= 15 and "€" in ax.get_xlabel()', actualExpr: '(ax.get_title(), ax.get_xlabel())', hint: 'Usa ax.set_title("...conclusão...") e ax.set_xlabel("Faturação (€)").' },
        ],
      },
      quiz: {
        question: 'Num gráfico de barras com a faturação de 6 categorias, porque é que o eixo deve começar no zero?',
        options: [
          'Porque o matplotlib dá erro se o eixo não começar no zero.',
          'Porque o comprimento da barra tem de ser proporcional ao valor.',
          'Porque assim o gráfico fica mais pequeno e cabe no relatório.',
          'Porque só assim aparecem os valores negativos das devoluções.',
        ],
        correctIndex: 1,
        explanation: 'O olho compara comprimentos. Se o eixo começar em 1 000 €, uma barra de 2 000 € parece o dobro de outra de 1 500 €, quando a diferença é só de um terço.',
      },
    },
    {
      id: 'bi-08-teste-ab',
      code: '08',
      title: 'Diferença real ou acaso? Introdução ao teste A/B',
      lede: 'Aprende a responder à pergunta mais perigosa de um relatório: "esta diferença é real?". Comparas duas médias, calculas o erro padrão, a estatística t e o p-valor, e decides com um critério fixado antes de olhar para os dados.',
      analogyTitle: 'Atirar a moeda ao ar na caixa registadora',
      analogyBody: 'Se atirares uma moeda 10 vezes e saírem 6 caras, ninguém diz que a moeda está viciada: é acaso. Com 1 000 lançamentos e 600 caras, já desconfias. O teste A/B faz esta conta por ti: mede o tamanho da diferença face ao "ruído" natural dos dados. O p-valor responde: se não houvesse diferença nenhuma, quantas vezes veríamos uma diferença tão grande só por acaso?',
      concepts: [
        'Hipótese nula (H0): os dois grupos são iguais e a diferença que vês é acaso. O teste tenta reunir provas contra H0.',
        'Erro padrão da diferença: raiz de (var_A / n_A + var_B / n_B). Mede o ruído esperado na diferença das médias.',
        'Estatística t = diferença das médias / erro padrão. Quanto mais longe de 0, mais forte a prova.',
        'Com amostras grandes, p-valor = math.erfc(abs(t) / math.sqrt(2)) (aproximação normal, bilateral).',
        'Fixa o critério antes de olhar: é habitual usar 5% (p < 0.05). p ≥ 0.05 não prova que os grupos são iguais; só diz que não há provas suficientes.',
        'Significativo não quer dizer importante: com milhões de linhas, uma diferença de 1 cêntimo pode ter p minúsculo.',
      ],
      beginnerSteps: [
        'Cria a coluna fim_de_semana: pd.to_datetime(df["data"]).dt.day_of_week >= 5 (5 = sábado, 6 = domingo).',
        'Separa os dois grupos: a = df[df["fim_de_semana"]]["sub"] e b = df[~df["fim_de_semana"]]["sub"].',
        'Calcula as médias, a diferença (a - b) e o erro padrão com .var() e len().',
        'Calcula t, o p-valor com math.erfc e decide: significativo = p_valor < 0.05.',
      ],
      proPractice: 'Em empresas com testes A/B a sério (preços, campanhas, layout do site) usa-se scipy.stats.ttest_ind(a, b, equal_var=False), que faz estas contas com a distribuição t exata. Aqui fazes à mão para perceber cada peça.',
      commonPitfall: 'Olhar para a diferença das médias e concluir logo. -0,28 € por linha parece uma tendência, mas pode estar dentro do ruído normal dos dados.',
      referenceTitle: 'Teste de duas médias (Welch, amostras grandes)',
      referenceRows: [
        { syntax: 'a.mean() - b.mean()', meaning: 'Diferença observada', example: 'Fim de semana menos dias úteis' },
        { syntax: 'math.sqrt(a.var() / len(a) + b.var() / len(b))', meaning: 'Erro padrão da diferença', example: 'O "ruído" esperado' },
        { syntax: 't = diferenca / erro_padrao', meaning: 'Estatística t', example: '|t| > 1.96 é significativo a 5%' },
        { syntax: 'math.erfc(abs(t) / math.sqrt(2))', meaning: 'p-valor bilateral (aproximação normal)', example: 't = 1.96 dá p ≈ 0.05' },
        { syntax: 'p_valor < 0.05', meaning: 'Decisão com critério fixado antes', example: 'True = diferença significativa' },
      ],
      engine: 'python',
      exampleCode: `import math
import pandas as pd

# Exemplo: dezembro gasta mais por linha do que o resto do ano? (vendas_sazonais.csv)
df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]
dezembro = df["data"].str.slice(5, 7) == "12"

a = df[dezembro]["sub"]
b = df[~dezembro]["sub"]
diferenca = a.mean() - b.mean()
erro_padrao = math.sqrt(a.var() / len(a) + b.var() / len(b))
t = diferenca / erro_padrao
p_valor = math.erfc(abs(t) / math.sqrt(2))

print(f"Dezembro: {a.mean():.2f} € | Resto: {b.mean():.2f} € | diferença {diferenca:.2f} €")
print(f"t = {t:.2f} | p-valor = {p_valor:.6f} | significativo a 5%? {p_valor < 0.05}")`,
      pythonChallenge: {
        description: 'O dono acha que ao fim de semana os clientes gastam menos por linha de venda. Testa em vendas.csv (sub = quantidade * preco): guarda media_fds e media_semana, diferenca (fim de semana menos dias úteis), erro_padrao, estatistica_t, p_valor (aproximação normal com math.erfc) e significativo (True se p_valor < 0.05).',
        starterCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
df["fim_de_semana"] = pd.to_datetime(df["data"]).dt.day_of_week >= 5

media_fds = None
media_semana = None
diferenca = None
erro_padrao = None
estatistica_t = None
p_valor = None
significativo = None
print(diferenca, estatistica_t, p_valor, significativo)`,
        solutionCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
df["fim_de_semana"] = pd.to_datetime(df["data"]).dt.day_of_week >= 5

a = df[df["fim_de_semana"]]["sub"]
b = df[~df["fim_de_semana"]]["sub"]

media_fds = a.mean()
media_semana = b.mean()
diferenca = media_fds - media_semana
erro_padrao = math.sqrt(a.var() / len(a) + b.var() / len(b))
estatistica_t = diferenca / erro_padrao
p_valor = math.erfc(abs(estatistica_t) / math.sqrt(2))
significativo = p_valor < 0.05
print(round(diferenca, 2), round(estatistica_t, 2), round(p_valor, 3), significativo)`,
        checks: [
          { label: 'Médias dos dois grupos (5.13 € e 5.40 €)', expr: 'math.isclose(float(media_fds), 5.1255, abs_tol=0.001) and math.isclose(float(media_semana), 5.4032, abs_tol=0.001)', actualExpr: '(media_fds, media_semana)', hint: 'Filtra com df[df["fim_de_semana"]]["sub"] e df[~df["fim_de_semana"]]["sub"] e usa .mean().' },
          { label: 'diferenca (fim de semana menos dias úteis: -0.28 €)', expr: 'math.isclose(float(diferenca), -0.2776, abs_tol=0.001)', actualExpr: 'diferenca', hint: 'diferenca = media_fds - media_semana (a ordem importa: dá um valor negativo).' },
          { label: 'erro_padrao (0.160)', expr: 'math.isclose(float(erro_padrao), 0.1601, abs_tol=0.001)', actualExpr: 'erro_padrao', hint: 'math.sqrt(a.var() / len(a) + b.var() / len(b)).' },
          { label: 'estatistica_t (-1.73) e p_valor (0.083)', expr: 'math.isclose(float(estatistica_t), -1.734, abs_tol=0.005) and math.isclose(float(p_valor), 0.0829, abs_tol=0.001)', actualExpr: '(estatistica_t, p_valor)', hint: 'estatistica_t = diferenca / erro_padrao e p_valor = math.erfc(abs(estatistica_t) / math.sqrt(2)).' },
          { label: 'Decisão a 5%: a diferença não é significativa', expr: 'significativo is False or (hasattr(significativo, "item") and significativo.item() is False)', actualExpr: 'significativo', hint: 'significativo = p_valor < 0.05. Com p ≈ 0.083 não há provas suficientes.' },
          { label: 'O teste é calculado a partir dos dados', expr: 'abs(float(correr_com(df=pd.DataFrame({"data": ["2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07"], "quantidade": [1, 1, 1, 1], "preco": [2.0, 4.0, 1.0, 3.0]}))["diferenca"]) - 1.0) < 1e-9', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07"], "quantidade": [1, 1, 1, 1], "preco": [2.0, 4.0, 1.0, 3.0]})).get("diferenca")', hint: 'Separa os grupos com a coluna fim_de_semana e calcula as médias, sem números escritos à mão.' },
        ],
      },
      quiz: {
        question: 'Um teste A/B dá p-valor = 0.083 com o critério de 5%. Qual é a conclusão correta?',
        options: [
          'Os dois grupos são iguais: está provado que não há diferença.',
          'A diferença é real em 91,7% dos casos.',
          'Não há provas suficientes de que a diferença seja real.',
          'A diferença é significativa porque o p-valor é baixo.',
        ],
        correctIndex: 2,
        explanation: 'p ≥ 0.05 não prova igualdade; só diz que uma diferença deste tamanho aparece com frequência por acaso. Para decidir com mais confiança, junta mais dados.',
      },
    },
    {
      id: 'bi-09-correlacao-confianca',
      code: '09',
      title: 'Correlação, amostras e intervalos de confiança',
      lede: 'Mede se duas variáveis andam juntas com a correlação de Pearson, percebe porque é que correlação não prova causa, e calcula um intervalo de confiança a 95% para dizer "quanto vale a média, mais ou menos".',
      analogyTitle: 'Provar a sopa com uma colher',
      analogyBody: 'Para saber se a sopa está salgada não bebes a panela inteira: provas uma colher (a amostra). Se mexeste bem, a colher diz muito sobre a panela, mas não tudo. O intervalo de confiança é a margem honesta dessa prova: "a média está entre 5,14 € e 5,45 €". Uma colher pequena dá uma margem larga; uma concha dá uma margem estreita.',
      concepts: [
        'A correlação de Pearson (r) vai de -1 a 1: perto de 1 as variáveis sobem juntas, perto de -1 uma sobe quando a outra desce, perto de 0 não há relação linear.',
        'Correlação não é causa: clientes que vêm mais vezes gastam mais (r ≈ 0,8), mas pode haver uma terceira causa (morar perto, ter família grande).',
        'Uma amostra aleatória (df.sample(n, random_state=42)) representa a população, com uma margem de erro que encolhe à medida que n cresce.',
        'Erro padrão da média = desvio padrão / raiz de n. O intervalo de confiança a 95% é média ± 1,96 × erro padrão.',
        'Ler bem o IC: se repetíssemos a recolha muitas vezes, 95% dos intervalos calculados assim apanhariam a média verdadeira.',
      ],
      beginnerSteps: [
        'Agrupa por cliente: df.groupby("cliente_id").agg(visitas=("data", "nunique"), gasto=("sub", "sum")).',
        'Calcula r com por_cliente["visitas"].corr(por_cliente["gasto"]).',
        'Repete com df["preco"].corr(df["quantidade"]) e vê como um r perto de 0 fica.',
        'Para o IC: media = df["sub"].mean(), erro_padrao = df["sub"].std() / math.sqrt(len(df)), e soma/subtrai 1.96 * erro_padrao.',
        'Tira uma amostra de 200 linhas e repete o IC: a margem fica mais larga.',
      ],
      proPractice: 'Num relatório, nunca escrevas só "o ticket médio é 5,30 €". Escreve "5,30 € (IC 95%: 5,14 € a 5,45 €)". O decisor percebe logo quanta confiança pode ter no número.',
      commonPitfall: 'Ver uma correlação forte e concluir "fazer X causa Y". Para provar causa precisas de uma experiência controlada (como os testes A/B das etapas seguintes), não só de dados observados.',
      referenceTitle: 'Correlação e intervalos de confiança em pandas',
      referenceRows: [
        { syntax: 'df["a"].corr(df["b"])', meaning: 'Correlação de Pearson entre duas colunas', example: 'r = 0.8 é uma relação forte' },
        { syntax: 'df[["a", "b", "c"]].corr()', meaning: 'Matriz de correlações', example: 'Ver todas as relações de uma vez' },
        { syntax: 'df.sample(200, random_state=42)', meaning: 'Amostra aleatória reprodutível', example: 'Simular um inquérito a 200 linhas' },
        { syntax: 's.std() / math.sqrt(len(s))', meaning: 'Erro padrão da média', example: 'Quanto a média "abana"' },
        { syntax: 'media ± 1.96 * erro_padrao', meaning: 'Intervalo de confiança a 95%', example: '5,14 € a 5,45 €' },
      ],
      engine: 'python',
      exampleCode: `import math
import pandas as pd

# Exemplo com vendas_sazonais.csv: correlações entre totais diários
df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]
por_dia = df.groupby("data").agg(linhas=("sub", "size"), faturacao=("sub", "sum"), clientes=("cliente_id", "nunique"))
print(por_dia.corr().round(2))

# Intervalo de confiança a 95% para a faturação média diária
media = por_dia["faturacao"].mean()
erro_padrao = por_dia["faturacao"].std() / math.sqrt(len(por_dia))
print(f"Faturação média diária: {media:.2f} € (IC 95%: {media - 1.96 * erro_padrao:.2f} € a {media + 1.96 * erro_padrao:.2f} €)")`,
      pythonChallenge: {
        description: 'Em vendas.csv (sub = quantidade * preco):\n1) Cria por_cliente com visitas (dias diferentes) e gasto (soma de sub) por cliente e guarda r_visitas_gasto.\n2) Guarda r_preco_quantidade entre as colunas preco e quantidade.\n3) causa_provada: a correlação entre visitas e gasto prova que mais visitas causam mais gasto? (True ou False)\nO intervalo de confiança e as amostras estão nos treinos 1 e 2.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Correlação entre visitas e gasto por cliente
por_cliente = None
r_visitas_gasto = None

# 2) Correlação entre preço e quantidade em cada linha
r_preco_quantidade = None

# 3) A correlação prova a causa?
causa_provada = None
print(r_visitas_gasto, r_preco_quantidade, causa_provada)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Correlação entre visitas e gasto por cliente
por_cliente = df.groupby("cliente_id").agg(visitas=("data", "nunique"), gasto=("sub", "sum"))
r_visitas_gasto = por_cliente["visitas"].corr(por_cliente["gasto"])

# 2) Correlação entre preço e quantidade em cada linha
r_preco_quantidade = df["preco"].corr(df["quantidade"])

# 3) A correlação prova a causa?
causa_provada = False
print(round(r_visitas_gasto, 2), round(r_preco_quantidade, 3), causa_provada)`,
        checks: [
          { label: 'por_cliente tem uma linha por cliente (120) e r_visitas_gasto ≈ 0.80', expr: 'len(por_cliente) == 120 and abs(float(r_visitas_gasto) - 0.800) < 0.005', actualExpr: '(len(por_cliente), r_visitas_gasto)', hint: 'por_cliente = df.groupby("cliente_id").agg(visitas=("data", "nunique"), gasto=("sub", "sum")) e depois por_cliente["visitas"].corr(por_cliente["gasto"]).' },
          { label: 'r_preco_quantidade ≈ 0 (sem relação linear)', expr: 'abs(float(r_preco_quantidade)) < 0.01', actualExpr: 'r_preco_quantidade', hint: 'df["preco"].corr(df["quantidade"]).' },
          { label: 'A correlação vem dos dados', expr: 'abs(float(correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d1"], "cliente_id": [1, 1, 2], "quantidade": [1, 1, 1], "preco": [2.0, 2.0, 1.0]}))["r_visitas_gasto"]) - 1.0) < 1e-9', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d1"], "cliente_id": [1, 1, 2], "quantidade": [1, 1, 1], "preco": [2.0, 2.0, 1.0]})).get("r_visitas_gasto")', hint: 'Calcula r com .corr() a partir de df, sem escrever o número à mão.' },
          { label: 'Correlação não prova causa', expr: 'causa_provada is False', actualExpr: 'causa_provada', hint: 'Dados observados mostram que as variáveis andam juntas, não qual causa qual. Para provar causa precisas de uma experiência.' },
        ],
      },
      quiz: {
        question: 'Nas lojas com mais funcionários a faturação é maior (r = 0,85). O que podes concluir?',
        options: [
          'Contratar mais funcionários vai aumentar a faturação.',
          'As duas variáveis andam juntas, mas os dados não dizem qual causa qual.',
          'A relação é fraca porque r é menor do que 1.',
          'Mais faturação obriga sempre a contratar mais funcionários.',
        ],
        correctIndex: 1,
        explanation: 'Lojas maiores têm mais clientes e mais funcionários: a dimensão da loja explica as duas coisas. Correlação forte mostra uma relação, não a direção da causa.',
      },
    },
    {
      id: 'bi-10-pratica-excel-powerbi',
      code: '10',
      title: 'Prática guiada: Excel e Power BI com os dados da Mercearia',
      lede: 'Abre o Excel e o Power BI no teu computador e segue os passos com vendas.csv, produtos.csv e clientes.csv. No fim, escreve os números que encontraste na folha de respostas da bancada: a app diz-te quais estão certos.',
      analogyTitle: 'A mesma conta em três calculadoras',
      analogyBody: 'Já fizeste estas contas em SQL e em pandas. Agora fazes as mesmas no Excel e no Power BI, que é onde muitas equipas de negócio trabalham. Se os números baterem certo nas três ferramentas, sabes que percebeste a lógica e não só a sintaxe.',
      concepts: [
        'Excel: importa o CSV com Dados > Obter Dados > De Texto/CSV e converte o intervalo em Tabela (Ctrl + T) para as fórmulas usarem nomes de colunas.',
        'Excel: SOMA.SE.S (SUMIFS) soma com condições e PROCX (XLOOKUP) vai buscar um valor a outra tabela, como um JOIN.',
        'Excel: uma Tabela Dinâmica (PivotTable) faz o GROUP BY sem fórmulas.',
        'Power BI: importa os 3 CSV, liga-os na vista Modelo (vendas.produto_id → produtos.id e vendas.cliente_id → clientes.id) e cria medidas DAX.',
        'DAX: SUMX percorre a tabela linha a linha (como quantidade * preco em pandas) e DISTINCTCOUNT conta valores únicos.',
      ],
      beginnerSteps: [
        'Excel 1: em vendas, cria a coluna Subtotal = [@quantidade]*[@preco] e soma-a toda com =SOMA(Vendas[Subtotal]).',
        'Excel 2: =SOMA.SE.S(Vendas[Subtotal]; Vendas[produto]; "Pão") dá a faturação do Pão.',
        'Excel 3: em vendas, cria a coluna Categoria com =PROCX([@produto_id]; Produtos[id]; Produtos[categoria]) e soma a Charcutaria com SOMA.SE.S.',
        'Excel 4: cria a coluna Mes = TEXTO([@data]; "aaaa-mm") (em inglês: TEXT([@data], "yyyy-mm")), insere uma Tabela Dinâmica com Mes nas linhas e Soma de Subtotal nos valores, e ordena do maior para o menor.',
        'Power BI 1: cria as medidas Faturação = SUMX(vendas, vendas[quantidade] * vendas[preco]) e Clientes Ativos = DISTINCTCOUNT(vendas[cliente_id]).',
        'Power BI 2: cria Gasto por Cliente = DIVIDE([Faturação], [Clientes Ativos]) e mostra-a num cartão.',
        'Power BI 3: põe um visual Matriz com clientes[cidade] nas linhas e [Faturação] nos valores, e ordena pela faturação.',
        'Escreve os 8 números na folha de respostas da bancada e carrega em Correr.',
      ],
      proPractice: 'Antes de publicar um relatório, as equipas fazem um "reconciliar": a mesma métrica calculada em duas ferramentas (por exemplo, SQL e Power BI) tem de bater ao cêntimo. Se não bater, há um filtro, uma relação ou um arredondamento errado.',
      commonPitfall: 'No Excel em português os argumentos separam-se com ponto e vírgula (;) e as funções têm nomes em português (SOMA.SE.S, PROCX). Se copiares uma fórmula em inglês com vírgulas, o Excel não a aceita.',
      referenceTitle: 'Excel (PT / EN) e DAX, lado a lado com SQL',
      referenceRows: [
        { syntax: 'SOMA.SE.S / SUMIFS', meaning: 'Soma com condições', example: 'SUM(...) WHERE produto = \'Pão\'' },
        { syntax: 'PROCX / XLOOKUP', meaning: 'Vai buscar um valor a outra tabela', example: 'JOIN produtos ON id' },
        { syntax: 'Tabela Dinâmica / PivotTable', meaning: 'Agrupar e resumir', example: 'GROUP BY mes' },
        { syntax: 'SUMX(vendas, vendas[quantidade] * vendas[preco])', meaning: 'Medida DAX linha a linha', example: 'SUM(quantidade * preco)' },
        { syntax: 'DISTINCTCOUNT(vendas[cliente_id])', meaning: 'Contar valores únicos', example: 'COUNT(DISTINCT cliente_id)' },
        { syntax: 'DIVIDE([Faturação], [Clientes Ativos])', meaning: 'Divisão segura (sem erro com zero)', example: 'Gasto médio por cliente' },
      ],
      engine: 'python',
      exampleCode: `# Exemplo: a conta do passo "Excel 2" para outro produto, feita em pandas.
# Usa isto para perceberes a lógica; os números da folha de respostas vêm do Excel e do Power BI.
import pandas as pd

vendas = pd.read_csv("dados/vendas.csv")
vendas["Subtotal"] = vendas["quantidade"] * vendas["preco"]

# =SOMA.SE.S(Vendas[Subtotal]; Vendas[produto]; "Leite")
faturacao_leite = vendas.loc[vendas["produto"] == "Leite", "Subtotal"].sum()
print(f"Faturação do Leite: {faturacao_leite:.2f} €")`,
      pythonChallenge: {
        description: 'Folha de respostas: segue os 7 passos de Excel e Power BI (à esquerda, em "Passo a passo") e escreve aqui os números que obtiveste, com 2 casas decimais quando forem euros. O guia completo está em licoes/pratica_excel_powerbi.md.',
        starterCode: `# Folha de respostas da prática guiada de Excel e Power BI.
# Substitui cada None pelo valor que encontraste (ex.: 1234.56 ou "Porto").

# Excel
total_faturacao = None          # Excel 1: soma da coluna Subtotal
faturacao_pao = None            # Excel 2: SOMA.SE.S do Pão
faturacao_charcutaria = None    # Excel 3: PROCX + SOMA.SE.S da Charcutaria
mes_top = None                  # Excel 4: mês com mais faturação, no formato "2025-01"
faturacao_mes_top = None        # Excel 4: faturação desse mês

# Power BI
clientes_ativos = None          # Power BI 1: medida Clientes Ativos
gasto_por_cliente = None        # Power BI 2: medida Gasto por Cliente
cidade_top = None               # Power BI 3: cidade no topo da matriz

print(total_faturacao, faturacao_pao, faturacao_charcutaria, mes_top, faturacao_mes_top)
print(clientes_ativos, gasto_por_cliente, cidade_top)`,
        solutionCode: `# Folha de respostas da prática guiada de Excel e Power BI.

# Excel
total_faturacao = 26902.89
faturacao_pao = 205.50
faturacao_charcutaria = 6756.00
mes_top = "2025-09"
faturacao_mes_top = 2462.82

# Power BI
clientes_ativos = 120
gasto_por_cliente = 224.19
cidade_top = "Lisboa"

print(total_faturacao, faturacao_pao, faturacao_charcutaria, mes_top, faturacao_mes_top)
print(clientes_ativos, gasto_por_cliente, cidade_top)`,
        checks: [
          { label: 'Excel 1: total da faturação', expr: 'abs(float(total_faturacao) - 26902.89) < 0.01', actualExpr: 'total_faturacao', hint: 'Confirma que a coluna Subtotal multiplica quantidade por preco em todas as 5 078 linhas e que a SOMA apanha a coluna inteira.' },
          { label: 'Excel 2: faturação do Pão com SOMA.SE.S', expr: 'abs(float(faturacao_pao) - 205.50) < 0.01', actualExpr: 'faturacao_pao', hint: 'O primeiro argumento é a coluna a somar (Subtotal); depois vem a coluna do critério (produto) e o critério ("Pão").' },
          { label: 'Excel 3: faturação da Charcutaria com PROCX', expr: 'abs(float(faturacao_charcutaria) - 6756.00) < 0.01', actualExpr: 'faturacao_charcutaria', hint: 'PROCX procura vendas[produto_id] na coluna produtos[id] e devolve produtos[categoria]. Depois soma com SOMA.SE.S pela nova coluna Categoria.' },
          { label: 'Excel 4: mês com mais faturação e o seu valor', expr: 'str(mes_top).strip() == "2025-09" and abs(float(faturacao_mes_top) - 2462.82) < 0.01', actualExpr: '(mes_top, faturacao_mes_top)', hint: 'Na Tabela Dinâmica ordena a Soma de Subtotal do maior para o menor. Escreve o mês como texto, com aspas: "2025-01".' },
          { label: 'Power BI 1: Clientes Ativos', expr: 'int(clientes_ativos) == 120', actualExpr: 'clientes_ativos', hint: 'DISTINCTCOUNT(vendas[cliente_id]) conta cada cliente uma vez; COUNT contaria linhas de venda.' },
          { label: 'Power BI 2: Gasto por Cliente', expr: 'abs(float(gasto_por_cliente) - 224.19) < 0.01', actualExpr: 'gasto_por_cliente', hint: 'DIVIDE([Faturação], [Clientes Ativos]). Arredonda a 2 casas.' },
          { label: 'Power BI 3: cidade com mais faturação', expr: 'str(cidade_top).strip().lower() == "lisboa"', actualExpr: 'cidade_top', hint: 'Sem a relação vendas[cliente_id] → clientes[id] na vista Modelo, a matriz repete o total em todas as cidades.' },
        ],
      },
      quiz: {
        question: 'No Power BI, a matriz por cidade mostra o mesmo valor de faturação em todas as linhas. Qual é a causa mais provável?',
        options: [
          'A medida devia usar SUM em vez de SUMX.',
          'Falta a relação entre vendas e clientes na vista Modelo.',
          'Os dados de clientes têm cidades repetidas.',
          'O visual Matriz não suporta medidas DAX.',
        ],
        correctIndex: 1,
        explanation: 'Sem relação, o filtro da cidade não chega à tabela vendas e a medida devolve o total geral em cada linha. É o erro mais comum de quem começa no Power BI.',
      },
    },
    {
      id: 'bi-11-ab-proporcoes',
      code: '11',
      title: 'Teste A/B de proporções e tamanho de amostra',
      lede: 'A pergunta mais comum em entrevistas de produto: "a taxa de conversão subiu de verdade?". Comparas duas proporções com o teste z e calculas quantos dados precisas antes de começar um teste.',
      analogyTitle: 'Contar cestos com Queijo em vez de euros',
      analogyBody: 'No teste A/B da etapa anterior comparaste médias em euros. Muitas vezes a métrica é um sim ou não: o cliente comprou? clicou? voltou? Aí comparas percentagens. E antes de testares, tens de saber se a loja tem clientes suficientes para ver a diferença que procuras: senão o teste nunca vai dar resposta, por muito tempo que esperes.',
      concepts: [
        'Uma proporção é a média de uma coluna de True e False: cestos["tem_queijo"].mean() dá a taxa.',
        'Teste z de duas proporções: junta os dois grupos para a proporção conjunta p, erro padrão = raiz de p(1 - p)(1/n_A + 1/n_B), e z = (p_A - p_B) / erro padrão.',
        'p-valor = math.erfc(abs(z) / math.sqrt(2)), como na etapa anterior.',
        'Diferença em pontos percentuais (pp) não é o mesmo que variação percentual: de 13,4% para 18,4% são +5,1 pp, mas +38% em termos relativos.',
        'Tamanho de amostra por grupo para 5% de significância e 80% de poder: n = (1.96 + 0.84)² × (p1(1 - p1) + p2(1 - p2)) / (p2 - p1)².',
        'Poder estatístico (80%) é a probabilidade de o teste detetar a diferença se ela existir de facto.',
      ],
      beginnerSteps: [
        'Cria uma coluna True/False: df["queijo"] = df["produto"] == "Queijo".',
        'Junta as linhas em cestos (um por cliente e dia): df.groupby(["data", "cliente_id"]).agg(tem_queijo=("queijo", "max")).reset_index().',
        'Marca o fim de semana nos cestos e separa os dois grupos a e b.',
        'Calcula p_fds e p_semana com .mean(), a proporção conjunta e o erro padrão.',
        'Calcula z, o p-valor e decide a 5%.',
        'No fim calcula n_por_grupo para detetar uma subida de 1 pp a partir de p_semana e arredonda para cima com math.ceil.',
      ],
      proPractice: 'Em empresas digitais, o tamanho de amostra calcula-se ANTES de lançar o teste e fixa a duração. Ferramentas como statsmodels (proportions_ztest, NormalIndPower) fazem estas contas; em entrevista pedem-te o raciocínio.',
      commonPitfall: 'Dizer "subiu 5%" quando subiu 5 pontos percentuais. De 13,4% para 18,4% é +5,1 pp, mas +38% em termos relativos: confundir os dois muda a decisão.',
      referenceTitle: 'Teste z de duas proporções',
      referenceRows: [
        { syntax: 'serie_booleana.mean()', meaning: 'Proporção de True', example: '0.184 = 18,4% dos cestos' },
        { syntax: '(a.sum() + b.sum()) / (len(a) + len(b))', meaning: 'Proporção conjunta (com H0 verdadeira)', example: 'p = 0.153' },
        { syntax: 'math.sqrt(p * (1 - p) * (1 / len(a) + 1 / len(b)))', meaning: 'Erro padrão da diferença', example: '0.0137' },
        { syntax: 'z = (p_a - p_b) / erro_padrao', meaning: 'Estatística z', example: '|z| > 1.96 é significativo a 5%' },
        { syntax: '(1.96 + 0.84) ** 2 * (p1*(1-p1) + p2*(1-p2)) / (p2 - p1) ** 2', meaning: 'Tamanho de amostra por grupo', example: 'Arredondar com math.ceil' },
      ],
      engine: 'python',
      exampleCode: `import math

# Exemplo clássico de entrevista: um botão novo no site.
# A: 500 compras em 10 000 visitas | B: 560 compras em 10 000 visitas
conv_a, n_a = 500, 10_000
conv_b, n_b = 560, 10_000
p_a, p_b = conv_a / n_a, conv_b / n_b
p = (conv_a + conv_b) / (n_a + n_b)
erro_padrao = math.sqrt(p * (1 - p) * (1 / n_a + 1 / n_b))
z = (p_b - p_a) / erro_padrao
p_valor = math.erfc(abs(z) / math.sqrt(2))
print(f"A: {p_a:.1%} | B: {p_b:.1%} | +{(p_b - p_a) * 100:.1f} pp ({p_b / p_a - 1:+.0%} relativo)")
print(f"z = {z:.2f} | p-valor = {p_valor:.3f} | significativo? {p_valor < 0.05}")

# Quantas visitas por grupo para detetar 5,0% -> 5,6% com 80% de poder?
n = math.ceil((1.96 + 0.84) ** 2 * (p_a * (1 - p_a) + p_b * (1 - p_b)) / (p_b - p_a) ** 2)
print("Visitas necessárias por grupo:", n)`,
      pythonChallenge: {
        description: 'Em vendas_sazonais.csv, um cesto é o conjunto de linhas do mesmo cliente no mesmo dia. Ao fim de semana há mais cestos com Queijo?\n1) cestos: um por cliente e dia, com tem_queijo.\n2) p_fds e p_semana: proporção de cestos com Queijo em cada grupo, e diferenca_pp em pontos percentuais.\n3) erro_padrao (com a proporção conjunta), z, p_valor e significativo (p < 0.05).\nO cálculo do tamanho de amostra está no treino 1.',
        starterCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["queijo"] = df["produto"] == "Queijo"

# 1) Um cesto por cliente e dia; tem_queijo é True se alguma linha do cesto for Queijo
cestos = None

# 2) Proporções
p_fds = None
p_semana = None
diferenca_pp = None

# 3) Teste z
erro_padrao = None
z = None
p_valor = None
significativo = None
print(p_fds, p_semana, z, p_valor)`,
        solutionCode: `import math
import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["queijo"] = df["produto"] == "Queijo"

# 1) Um cesto por cliente e dia; tem_queijo é True se alguma linha do cesto for Queijo
cestos = df.groupby(["data", "cliente_id"]).agg(tem_queijo=("queijo", "max")).reset_index()
cestos["fim_de_semana"] = pd.to_datetime(cestos["data"]).dt.day_of_week >= 5
a = cestos[cestos["fim_de_semana"]]["tem_queijo"]
b = cestos[~cestos["fim_de_semana"]]["tem_queijo"]

# 2) Proporções
p_fds = a.mean()
p_semana = b.mean()
diferenca_pp = (p_fds - p_semana) * 100

# 3) Teste z
p_conjunta = (a.sum() + b.sum()) / (len(a) + len(b))
erro_padrao = math.sqrt(p_conjunta * (1 - p_conjunta) * (1 / len(a) + 1 / len(b)))
z = (p_fds - p_semana) / erro_padrao
p_valor = math.erfc(abs(z) / math.sqrt(2))
significativo = p_valor < 0.05
print(f"Fim de semana {p_fds:.1%} vs dias úteis {p_semana:.1%} (+{diferenca_pp:.1f} pp)")
print(f"z = {z:.2f} | p = {p_valor:.4f} | significativo? {significativo}")`,
        checks: [
          { label: 'cestos: um por cliente e dia (2 910)', expr: 'len(cestos) == 2910', actualExpr: 'len(cestos) if cestos is not None else None', hint: 'df.groupby(["data", "cliente_id"]).agg(tem_queijo=("queijo", "max")).reset_index().' },
          { label: 'p_fds (18.4%) e p_semana (13.4%)', expr: 'abs(float(p_fds) - 0.18445) < 0.0005 and abs(float(p_semana) - 0.13359) < 0.0005', actualExpr: '(p_fds, p_semana)', hint: 'Marca o fim de semana nos cestos (day_of_week >= 5) e faz .mean() de tem_queijo em cada grupo.' },
          { label: 'diferenca_pp em pontos percentuais (+5.09)', expr: 'abs(float(diferenca_pp) - 5.086) < 0.01', actualExpr: 'diferenca_pp', hint: 'diferenca_pp = (p_fds - p_semana) * 100. Não dividas por p_semana: isso seria a variação relativa.' },
          { label: 'erro_padrao com a proporção conjunta (0.0137)', expr: 'abs(float(erro_padrao) - 0.013745) < 0.0001', actualExpr: 'erro_padrao', hint: 'p_conjunta = (a.sum() + b.sum()) / (len(a) + len(b)) e math.sqrt(p_conjunta * (1 - p_conjunta) * (1 / len(a) + 1 / len(b))).' },
          { label: 'z (3.70), p_valor (0.0002) e decisão: significativo', expr: 'abs(float(z) - 3.700) < 0.01 and abs(float(p_valor) - 0.000216) < 0.00002 and bool(significativo) is True', actualExpr: '(z, p_valor, significativo)', hint: 'z = (p_fds - p_semana) / erro_padrao e p_valor = math.erfc(abs(z) / math.sqrt(2)).' },
        ],
      },
      quiz: {
        question: 'A taxa de conversão passou de 4% para 5%. Como descreves a mudança num relatório?',
        options: [
          'Subiu 1%, porque 5 - 4 = 1.',
          'Subiu 25%, e isso é o mesmo que 1 ponto.',
          'Subiu 20%, porque 1 / 5 = 0,20.',
          'Subiu 1 ponto percentual, ou seja, +25% em termos relativos.',
        ],
        correctIndex: 3,
        explanation: 'A diferença absoluta mede-se em pontos percentuais (5% - 4% = 1 pp). A variação relativa é 1 / 4 = +25%. Dizer só "subiu 1%" é ambíguo e costuma ser apanhado em entrevista.',
      },
    },
    {
      id: 'bi-12-probabilidade-simpson',
      code: '12',
      title: 'Probabilidade condicional, Bayes e o paradoxo de Simpson',
      lede: 'Três perguntas de quadro branco que aparecem em quase todas as entrevistas: "quem compra X também compra Y?", "um alerta disparou: qual a probabilidade de ser mesmo fraude?" e "como é que alguém pode ser melhor em todos os grupos e pior no total?".',
      analogyTitle: 'O alarme da loja que toca demasiadas vezes',
      analogyBody: 'Um alarme que apanha 95% dos ladrões parece ótimo. Mas se só 1 em cada 100 pessoas que passam na porta for ladrão, a maioria dos toques são falsos alarmes: há muito mais clientes honestos do que ladrões. A regra de Bayes faz esta conta: junta a qualidade do alarme com a raridade do que procuras.',
      concepts: [
        'Probabilidade condicional: P(Café | Leite) = cestos com Café e Leite / cestos com Leite. Em pandas: cestos[cestos["leite"]]["cafe"].mean().',
        'Lift = P(Café | Leite) / P(Café). Acima de 1 os produtos atraem-se (bom para promoções conjuntas); abaixo de 1 afastam-se.',
        'Regra de Bayes: P(fraude | alerta) = P(alerta | fraude) × P(fraude) / P(alerta), com P(alerta) = sensibilidade × prevalência + falsos positivos × (1 - prevalência).',
        'Quando o evento é raro, mesmo um bom teste dá muitos falsos positivos. Esta é a pergunta-armadilha mais clássica de probabilidade.',
        'Paradoxo de Simpson: uma tendência que aparece em todos os grupos pode inverter-se no total, quando os grupos têm tamanhos muito diferentes.',
      ],
      beginnerSteps: [
        'Cria colunas True/False para Café e Leite em vendas.csv e junta-as por cesto com .agg(..., "max").',
        'p_cafe é a média da coluna cafe; p_cafe_dado_leite é a média de cafe só nos cestos com leite.',
        'lift = p_cafe_dado_leite / p_cafe. Se for menor do que 1, juntar os produtos na prateleira não ajuda.',
        'Para o Bayes, calcula primeiro p_alerta e depois divide sensibilidade × prevalência por p_alerta.',
        'Para o Simpson, agrupa a tabela por funcionário e turno, e depois só por funcionário: compara as taxas.',
      ],
      proPractice: 'A análise de cesto (market basket) com suporte, confiança e lift é usada em retalho para decidir promoções e a disposição da loja. Bibliotecas como mlxtend fazem isto em escala; a lógica é esta.',
      commonPitfall: 'Comparar só totais. Antes de dizer que a Ana é pior, vê se as duas pessoas trabalham nas mesmas condições: o turno da noite é mais difícil e a Ana faz quase só noites.',
      referenceTitle: 'Probabilidade em pandas',
      referenceRows: [
        { syntax: 'df["col"].mean()', meaning: 'P(evento) numa coluna True/False', example: 'P(Café) = 0.126' },
        { syntax: 'df[df["b"]]["a"].mean()', meaning: 'P(A | B)', example: 'P(Café | Leite) = 0.093' },
        { syntax: 'p_a_dado_b / p_a', meaning: 'Lift', example: '0.74: afastam-se' },
        { syntax: 'sens * prev / (sens * prev + fp * (1 - prev))', meaning: 'Regra de Bayes', example: 'P(fraude | alerta) = 16%' },
        { syntax: 'df.groupby(["a", "b"])[["x", "n"]].sum()', meaning: 'Taxas por subgrupo (Simpson)', example: 'Somar antes de dividir' },
      ],
      engine: 'python',
      exampleCode: `# Bayes com números redondos: um teste de diagnóstico.
# 1 em cada 1 000 pessoas tem a doença; o teste apanha 99% dos casos e dá 2% de falsos positivos.
prevalencia = 0.001
sensibilidade = 0.99
falsos_positivos = 0.02

p_positivo = sensibilidade * prevalencia + falsos_positivos * (1 - prevalencia)
p_doenca_dado_positivo = sensibilidade * prevalencia / p_positivo
print(f"P(positivo) = {p_positivo:.4f}")
print(f"P(doença | positivo) = {p_doenca_dado_positivo:.1%}")  # cerca de 5%!

# Em 100 000 pessoas: 100 doentes (99 positivos) e 99 900 saudáveis (1 998 positivos)
print(f"Verdadeiros positivos: {99}, falsos positivos: {round(0.02 * 99_900)}")`,
      pythonChallenge: {
        description: 'Quem leva Leite também leva Café? Em vendas.csv, um cesto é cliente + dia.\n1) cestos: uma linha por cesto, com as colunas cafe e leite (True se o cesto tiver o produto).\n2) p_cafe e p_cafe_dado_leite.\n3) lift e juntar_na_prateleira (True se lift > 1).\nA regra de Bayes está no treino 1 e o paradoxo de Simpson no treino 2.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["cafe"] = df["produto"] == "Café"
df["leite"] = df["produto"] == "Leite"

# 1) Um cesto por cliente e dia
cestos = None

# 2) Probabilidades
p_cafe = None
p_cafe_dado_leite = None

# 3) Lift
lift = None
juntar_na_prateleira = None
print(p_cafe, p_cafe_dado_leite, lift)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas.csv")
df["cafe"] = df["produto"] == "Café"
df["leite"] = df["produto"] == "Leite"

# 1) Um cesto por cliente e dia
cestos = df.groupby(["data", "cliente_id"]).agg(cafe=("cafe", "max"), leite=("leite", "max"))

# 2) Probabilidades
p_cafe = cestos["cafe"].mean()
p_cafe_dado_leite = cestos[cestos["leite"]]["cafe"].mean()

# 3) Lift
lift = p_cafe_dado_leite / p_cafe
juntar_na_prateleira = lift > 1
print(f"P(Café) = {p_cafe:.1%} | P(Café | Leite) = {p_cafe_dado_leite:.1%} | lift = {lift:.2f}")`,
        checks: [
          { label: 'Cestos (2 447) e p_cafe (12.6%)', expr: 'len(cestos) == 2447 and abs(float(p_cafe) - 0.12628) < 0.0005', actualExpr: '(len(cestos) if cestos is not None else None, p_cafe)', hint: 'cestos = df.groupby(["data", "cliente_id"]).agg(cafe=("cafe", "max"), leite=("leite", "max")) e p_cafe = cestos["cafe"].mean().' },
          { label: 'p_cafe_dado_leite (9.3%) e lift (0.74)', expr: 'abs(float(p_cafe_dado_leite) - 0.09315) < 0.0005 and abs(float(lift) - 0.7377) < 0.002', actualExpr: '(p_cafe_dado_leite, lift)', hint: 'Filtra só os cestos com leite: cestos[cestos["leite"]]["cafe"].mean(). lift = p_cafe_dado_leite / p_cafe.' },
          { label: 'Decisão de prateleira a partir do lift', expr: 'bool(juntar_na_prateleira) is False and bool(correr_com(df=pd.DataFrame({"data": ["d1", "d1", "d2"], "cliente_id": [1, 1, 2], "produto": ["Café", "Leite", "Pão"], "cafe": [True, False, False], "leite": [False, True, False]}))["juntar_na_prateleira"]) is True', actualExpr: 'juntar_na_prateleira', hint: 'juntar_na_prateleira = lift > 1, calculado a partir dos cestos.' },
        ],
      },
      quiz: {
        question: 'Um teste apanha 99% dos casos e tem 1% de falsos positivos. A doença afeta 1 em 10 000 pessoas. Um resultado positivo significa que a pessoa:',
        options: [
          'tem a doença com probabilidade abaixo de 1%, porque quase todos os positivos são falsos.',
          'tem a doença com probabilidade de 99%, porque o teste é muito bom.',
          'tem a doença com probabilidade de 50%, porque ou tem ou não tem.',
          'tem a doença com probabilidade de 1%, porque é a taxa de falsos positivos.',
        ],
        correctIndex: 0,
        explanation: 'Em 1 000 000 de pessoas há 100 doentes (99 positivos) e 999 900 saudáveis (cerca de 9 999 falsos positivos). P(doença | positivo) = 99 / 10 098 ≈ 1%. Com eventos raros, a prevalência manda.',
      },
    },
    {
      id: 'bi-13-regressao-linear',
      code: '13',
      title: 'Desvio padrão, z-score e regressão linear simples',
      lede: 'Mede a dispersão com variância e desvio padrão, deteta dias anómalos com o z-score e ajusta uma reta de regressão: quanto vale, em euros, cada cliente a mais na loja?',
      analogyTitle: 'A régua que atravessa a nuvem de pontos',
      analogyBody: 'Marca num gráfico cada dia do ano: clientes no eixo horizontal, faturação no vertical. Fica uma nuvem a subir. A regressão encontra a régua que passa mais perto de todos os pontos. A inclinação da régua diz quanto sobe a faturação por cada cliente a mais; o R² diz quão apertada está a nuvem à volta da régua.',
      concepts: [
        'Variância: média dos desvios ao quadrado. Desvio padrão: a raiz da variância, na mesma unidade dos dados (€). O pandas usa n - 1 (desvio padrão amostral).',
        'z-score = (valor - média) / desvio padrão: quantos desvios padrão um valor está acima ou abaixo da média. |z| > 3 é muito raro numa distribuição normal.',
        'Regressão linear y = ordenada + declive × x. O declive é cov(x, y) / var(x) e a ordenada é média(y) - declive × média(x).',
        'R² (com uma só variável é r ao quadrado): a fração da variação de y explicada por x. R² = 0,64 quer dizer que 64% das diferenças entre dias vêm do número de clientes.',
        'Extrapolar para fora do intervalo observado é perigoso: a reta só foi validada entre o mínimo e o máximo de x.',
      ],
      beginnerSteps: [
        'Agrupa vendas_sazonais por data: clientes = ("cliente_id", "nunique") e faturacao = ("sub", "sum").',
        'Calcula variancia e desvio_padrao da faturação com .var() e .std().',
        'Encontra o melhor dia e o seu z_melhor_dia.',
        'declive = x.cov(y) / x.var(), ordenada = y.mean() - declive * x.mean() e r2 = x.corr(y) ** 2.',
        'Usa a reta para prever 10 clientes e decide se prever 30 clientes é seguro (vê o máximo de clientes observado).',
      ],
      proPractice: 'Em Python profissional usa-se numpy.polyfit(x, y, 1), scipy.stats.linregress ou statsmodels (que dá também intervalos de confiança para o declive). No Excel, as funções DECLIVE e INTERCETAR fazem o mesmo.',
      commonPitfall: 'Ler o declive como causa: "cada cliente traz 16,69 €" é uma associação média. E usar a reta para valores nunca vistos (30 clientes num dia, quando o recorde é 19) dá números sem fundamento.',
      referenceTitle: 'Dispersão e regressão em pandas',
      referenceRows: [
        { syntax: 's.var() / s.std()', meaning: 'Variância e desvio padrão (amostrais, n - 1)', example: '3 522.96 e 59.35 €' },
        { syntax: '(s - s.mean()) / s.std()', meaning: 'z-score de cada valor', example: '5.05 no dia 26 de dezembro' },
        { syntax: 'x.cov(y) / x.var()', meaning: 'Declive da reta de regressão', example: '16.69 € por cliente' },
        { syntax: 'y.mean() - declive * x.mean()', meaning: 'Ordenada na origem', example: '-30.51 €' },
        { syntax: 'x.corr(y) ** 2', meaning: 'R² da regressão simples', example: '0.64' },
      ],
      engine: 'python',
      exampleCode: `import pandas as pd

# Exemplo com vendas.csv: dispersão e z-score da faturação diária
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
por_dia = df.groupby("data")["sub"].sum()

media, dp = por_dia.mean(), por_dia.std()
z = (por_dia - media) / dp
print(f"Média {media:.2f} € | desvio padrão {dp:.2f} € | variância {por_dia.var():.1f} €²")
print("Dias com |z| > 3:")
print(z[z.abs() > 3].round(2))`,
      pythonChallenge: {
        description: 'Em vendas_sazonais.csv (sub = quantidade * preco):\n1) por_dia: clientes (clientes diferentes) e faturacao (soma de sub) por data.\n2) A reta faturacao = ordenada + declive × clientes: guarda declive, ordenada e r2.\n3) previsao_10: faturação prevista para um dia com 10 clientes.\n4) extrapolacao_30_segura: é seguro usar a reta para um dia com 30 clientes? (True ou False)\nVariância, desvio padrão e z-score estão no treino 1.',
        starterCode: `import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Um registo por dia
por_dia = None

# 2) Reta de regressão
declive = None
ordenada = None
r2 = None

# 3) e 4) Previsões
previsao_10 = None
extrapolacao_30_segura = None
print(declive, ordenada, r2, previsao_10)`,
        solutionCode: `import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

# 1) Um registo por dia
por_dia = df.groupby("data").agg(clientes=("cliente_id", "nunique"), faturacao=("sub", "sum"))
x = por_dia["clientes"]
y = por_dia["faturacao"]

# 2) Reta de regressão
declive = x.cov(y) / x.var()
ordenada = y.mean() - declive * x.mean()
r2 = x.corr(y) ** 2

# 3) e 4) Previsões
previsao_10 = ordenada + declive * 10
extrapolacao_30_segura = 30 <= x.max()
print(f"faturação = {ordenada:.2f} + {declive:.2f} × clientes | R² = {r2:.2f}")
print(f"Previsão para 10 clientes: {previsao_10:.2f} € | máximo observado: {x.max()} clientes")`,
        checks: [
          { label: 'por_dia: 365 dias com clientes e faturacao', expr: 'len(por_dia) == 365 and {"clientes", "faturacao"} <= set(por_dia.columns)', actualExpr: '(len(por_dia), list(por_dia.columns)) if por_dia is not None else None', hint: 'df.groupby("data").agg(clientes=("cliente_id", "nunique"), faturacao=("sub", "sum")).' },
          { label: 'Reta: declive (16.69 €/cliente) e ordenada (-30.51 €)', expr: 'abs(float(declive) - 16.6885) < 0.005 and abs(float(ordenada) - (-30.5127)) < 0.05', actualExpr: '(declive, ordenada)', hint: 'declive = x.cov(y) / x.var() e ordenada = y.mean() - declive * x.mean().' },
          { label: 'r2 (0.64) e previsao_10 (136.37 €)', expr: 'abs(float(r2) - 0.63585) < 0.001 and abs(float(previsao_10) - 136.37) < 0.05', actualExpr: '(r2, previsao_10)', hint: 'r2 = x.corr(y) ** 2 e previsao_10 = ordenada + declive * 10.' },
          { label: 'Extrapolar para 30 clientes não é seguro', expr: 'bool(extrapolacao_30_segura) is False', actualExpr: 'extrapolacao_30_segura', hint: 'O máximo observado é x.max() = 19 clientes num dia: 30 está fora do intervalo onde a reta foi ajustada.' },
        ],
      },
      quiz: {
        question: 'Uma regressão da faturação diária contra o número de clientes dá declive 16,7 e R² = 0,64. Qual é a leitura correta?',
        options: [
          'Cada cliente novo causa exatamente 16,7 € de faturação extra.',
          '64% dos clientes gastam 16,7 €.',
          'Em média, cada cliente a mais está associado a +16,7 € por dia, e os clientes explicam 64% da variação diária.',
          'A reta acerta em 64% dos dias.',
        ],
        correctIndex: 2,
        explanation: 'O declive é uma associação média, não uma causa garantida. O R² mede a fração da variação de y explicada pela reta, não a percentagem de acertos.',
      },
    },
    {
      id: 'bi-14-perguntas-entrevista',
      code: '14',
      title: 'Perguntas rápidas de entrevista: enviesamentos, percentis e valor esperado',
      lede: 'Uma bateria de perguntas curtas, do género das que se fazem nos primeiros 15 minutos de uma entrevista técnica: testes múltiplos, assimetria e percentis, valor esperado de uma campanha e dois enviesamentos que estragam análises.',
      analogyTitle: 'Os aviões que voltaram da guerra',
      analogyBody: 'Na Segunda Guerra, quiseram reforçar os aviões nas zonas com mais buracos de bala. Um estatístico, Abraham Wald, avisou: esses são os aviões que voltaram. Os buracos que importam estão nos aviões que caíram. Na mercearia é igual: se só inquirires os clientes que ainda vêm, nunca vais saber porque é que os outros deixaram de vir.',
      concepts: [
        'Testes múltiplos: com 20 testes a 5%, a probabilidade de pelo menos um falso positivo é 1 - 0.95^20 ≈ 64%. A correção de Bonferroni usa alfa / número de testes.',
        'Espreitar (peeking): parar um teste A/B no primeiro dia em que p < 0.05 aumenta muito os falsos positivos. A duração fixa-se antes.',
        'Assimetria: quando a média está bem acima da mediana, a distribuição tem cauda à direita (poucos cestos muito grandes).',
        'Percentil 90: 90% dos valores estão abaixo dele. Em pandas: s.quantile(0.9).',
        'Valor esperado = soma de (probabilidade × resultado). Uma campanha vale a pena se o valor esperado por cliente for positivo.',
        'Viés de sobrevivência: analisar só quem "sobreviveu" (clientes que ficaram, lojas que não fecharam) e tirar conclusões sobre todos.',
      ],
      beginnerSteps: [
        'prob_falso_positivo_20 = 1 - 0.95 ** 20 e alfa_bonferroni = 0.05 / 20.',
        'Em vendas.csv soma sub por cesto (data e cliente_id) e calcula a média, a mediana e o percentil 90.',
        'Compara a média com a mediana para escolher a assimetria: "direita" ou "esquerda".',
        'valor_esperado = prob_uso * margem_por_uso - custo_vale.',
        'Responde às duas perguntas de enviesamento com True ou False.',
      ],
      proPractice: 'Numa entrevista, explica sempre o raciocínio em voz alta antes do número: "há 20 testes, cada um com 5% de falso positivo, por isso a probabilidade de nenhum falhar é 0,95 elevado a 20…". O entrevistador avalia o método mais do que a conta.',
      commonPitfall: 'Responder que a probabilidade de um falso positivo em 20 testes é 20 × 5% = 100%. As probabilidades não se somam assim: calcula a probabilidade de nenhum falhar e subtrai a 1.',
      referenceTitle: 'Cábula de entrevista',
      referenceRows: [
        { syntax: '1 - (1 - alfa) ** k', meaning: 'P(pelo menos 1 falso positivo em k testes)', example: 'k = 20 dá 64%' },
        { syntax: 'alfa / k', meaning: 'Correção de Bonferroni', example: '0.05 / 20 = 0.0025' },
        { syntax: 's.quantile(0.9)', meaning: 'Percentil 90', example: '23.88 € por cesto' },
        { syntax: 'media > mediana', meaning: 'Cauda à direita', example: '10.99 € > 8.40 €' },
        { syntax: 'p * ganho - custo', meaning: 'Valor esperado', example: '0.3 × 10 - 2 = 1 €' },
      ],
      engine: 'python',
      exampleCode: `# Valor esperado com vários resultados possíveis: uma raspadinha de 1 €
premios = {0: 0.80, 1: 0.15, 5: 0.04, 20: 0.01}  # prémio: probabilidade
valor_esperado = sum(premio * prob for premio, prob in premios.items()) - 1
print(f"Valor esperado por raspadinha: {valor_esperado:+.2f} €")

# Quantos testes até ser quase certo ter um falso positivo?
for k in [1, 5, 10, 20, 50]:
    print(f"{k:>2} testes: {1 - 0.95 ** k:.0%} de hipótese de pelo menos um falso positivo")`,
      pythonChallenge: {
        description: 'Duas perguntas de entrevista:\n1) prob_falso_positivo_20: probabilidade de pelo menos um falso positivo em 20 testes a 5%; alfa_bonferroni para esses 20 testes.\n2) Em vendas.csv (sub = quantidade * preco), soma sub por cesto (data e cliente_id) e guarda media_cesto, mediana_cesto, p90_cesto e assimetria ("direita" ou "esquerda").\nO valor esperado está no treino 1 e os enviesamentos no treino 2.',
        starterCode: `import pandas as pd

# 1) Testes múltiplos
prob_falso_positivo_20 = None
alfa_bonferroni = None

# 2) Assimetria e percentis do valor por cesto
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
por_cesto = None
media_cesto = None
mediana_cesto = None
p90_cesto = None
assimetria = None
print(prob_falso_positivo_20, media_cesto, mediana_cesto, p90_cesto)`,
        solutionCode: `import pandas as pd

# 1) Testes múltiplos
prob_falso_positivo_20 = 1 - 0.95 ** 20
alfa_bonferroni = 0.05 / 20

# 2) Assimetria e percentis do valor por cesto
df = pd.read_csv("dados/vendas.csv")
df["sub"] = df["quantidade"] * df["preco"]
por_cesto = df.groupby(["data", "cliente_id"])["sub"].sum()
media_cesto = por_cesto.mean()
mediana_cesto = por_cesto.median()
p90_cesto = por_cesto.quantile(0.9)
assimetria = "direita" if media_cesto > mediana_cesto else "esquerda"
print(f"P(≥1 falso positivo em 20 testes) = {prob_falso_positivo_20:.0%} | Bonferroni: {alfa_bonferroni}")
print(f"Cesto: média {media_cesto:.2f} €, mediana {mediana_cesto:.2f} €, P90 {p90_cesto:.2f} € → cauda à {assimetria}")`,
        checks: [
          { label: 'Testes múltiplos: 64% e Bonferroni 0.0025', expr: 'abs(float(prob_falso_positivo_20) - 0.64151) < 0.0005 and abs(float(alfa_bonferroni) - 0.0025) < 1e-9', actualExpr: '(prob_falso_positivo_20, alfa_bonferroni)', hint: 'Probabilidade de nenhum falhar: 0.95 ** 20. A de pelo menos um falhar é 1 menos isso. Bonferroni: 0.05 / 20.' },
          { label: 'Cesto médio (10.99 €) e mediano (8.40 €)', expr: 'len(por_cesto) == 2447 and abs(float(media_cesto) - 10.9942) < 0.005 and abs(float(mediana_cesto) - 8.40) < 0.005', actualExpr: '(len(por_cesto) if por_cesto is not None else None, media_cesto, mediana_cesto)', hint: 'por_cesto = df.groupby(["data", "cliente_id"])["sub"].sum(), depois .mean() e .median().' },
          { label: 'Percentil 90 (23.88 €) e assimetria à direita', expr: 'abs(float(p90_cesto) - 23.876) < 0.01 and assimetria == "direita"', actualExpr: '(p90_cesto, assimetria)', hint: 'por_cesto.quantile(0.9). A média acima da mediana indica poucos cestos muito grandes: cauda à direita.' },
          { label: 'A assimetria é decidida pelos dados', expr: 'correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d3"], "cliente_id": [1, 1, 1], "quantidade": [1, 1, 1], "preco": [1.0, 9.0, 10.0]}))["assimetria"] == "esquerda"', actualExpr: 'correr_com(df=pd.DataFrame({"data": ["d1", "d2", "d3"], "cliente_id": [1, 1, 1], "quantidade": [1, 1, 1], "preco": [1.0, 9.0, 10.0]})).get("assimetria")', hint: 'assimetria = "direita" if media_cesto > mediana_cesto else "esquerda".' },
        ],
      },
      quiz: {
        question: 'Fizeste 20 testes A/B independentes, todos sem efeito real, com alfa de 5%. Qual é a probabilidade de pelo menos um dar "significativo"?',
        options: [
          'Cerca de 64%.',
          '5%, porque cada teste tem 5% de erro.',
          '100%, porque 20 × 5% = 100%.',
          '0,25%, pela correção de Bonferroni.',
        ],
        correctIndex: 0,
        explanation: 'A probabilidade de nenhum dar falso positivo é 0,95^20 ≈ 36%, por isso a de pelo menos um é ≈ 64%. É por isso que se corrige o alfa (Bonferroni: 0,05 / 20) quando se fazem muitos testes.',
      },
    },
    {
      id: 'bi-15-qui-quadrado-anova',
      code: '15',
      title: 'Mais de dois grupos: qui-quadrado e ANOVA',
      lede: 'O teste A/B compara dois grupos. Quando há mais (6 categorias, 4 trimestres), usa-se o qui-quadrado para contagens e a ANOVA para médias. Constróis os dois à mão e lês o resultado como numa entrevista.',
      analogyTitle: 'O cabaz que muda com as estações',
      analogyBody: 'Se o que se compra não dependesse da altura do ano, cada trimestre teria a mesma mistura de categorias: as mesmas percentagens de Bebidas, Charcutaria, Fruta… O qui-quadrado mede o quanto a realidade se afasta dessa mistura "sem efeito". A ANOVA faz o mesmo para médias: compara a variação entre trimestres com a variação normal dentro de cada trimestre.',
      concepts: [
        'Qui-quadrado de independência: parte de uma tabela de contagens (pd.crosstab). Se as variáveis fossem independentes, cada célula esperaria total_linha × total_coluna / total.',
        'Estatística qui² = soma de (observado - esperado)² / esperado em todas as células. Graus de liberdade = (linhas - 1) × (colunas - 1).',
        'O resíduo padronizado (observado - esperado) / raiz(esperado) mostra que células explicam o resultado: acima de 2 ou abaixo de -2 merece atenção.',
        'ANOVA a um fator: F = variância entre grupos / variância dentro dos grupos. F grande quer dizer que as médias dos grupos diferem mais do que o ruído explica.',
        'Um qui² ou uma ANOVA significativos dizem que há diferenças, mas não quais: para isso olha para os resíduos ou faz comparações par a par (com correção para testes múltiplos).',
      ],
      beginnerSteps: [
        'Junta a categoria às vendas com merge (produto_id com o id de produtos).',
        'Escreve a função qui_quadrado(tabela): calcula os esperados com np.outer(totais das linhas, totais das colunas) / total e devolve (qui2, gl).',
        'Aplica-a à tabela fim de semana × categoria de vendas.csv e calcula o p-valor com a função p_valor_qui2 já dada.',
        'Repete para trimestre × categoria em vendas_sazonais.csv e procura a célula com maior resíduo padronizado.',
        'Para a ANOVA, agrupa a faturação diária por trimestre e calcula a variação entre grupos e dentro dos grupos.',
      ],
      proPractice: 'No dia a dia usa-se scipy.stats.chi2_contingency(tabela) e scipy.stats.f_oneway(*grupos), que devolvem a estatística e o p-valor numa linha. Em entrevista pedem-te para explicar o que estas funções calculam, por isso aqui fazes as contas à mão.',
      commonPitfall: 'Usar o qui-quadrado com percentagens em vez de contagens, ou com células com esperados muito pequenos (menos de 5). E concluir "o T3 é diferente" só porque o teste global deu significativo, sem olhar para os resíduos.',
      referenceTitle: 'Qui-quadrado e ANOVA à mão',
      referenceRows: [
        { syntax: 'pd.crosstab(df["a"], df["b"])', meaning: 'Tabela de contagens', example: 'trimestre × categoria' },
        { syntax: 'np.outer(t.sum(axis=1), t.sum(axis=0)) / t.values.sum()', meaning: 'Contagens esperadas sem efeito', example: 'Mesma tabela, mesma forma' },
        { syntax: '((t - esp) ** 2 / esp).values.sum()', meaning: 'Estatística qui²', example: '228.3 com 15 gl' },
        { syntax: '(t - esp) / np.sqrt(esp)', meaning: 'Resíduos padronizados', example: '+7.1 em Bebidas no T3' },
        { syntax: '(SS_entre / (k - 1)) / (SS_dentro / (N - k))', meaning: 'Estatística F da ANOVA', example: '24.4 contra 2.63 crítico' },
      ],
      engine: 'python',
      exampleCode: `import numpy as np
import pandas as pd

# Exemplo pequeno: a preferência de café muda com a cidade?
tabela = pd.DataFrame(
    {"expresso": [40, 30, 20], "galão": [20, 30, 40]},
    index=["Porto", "Braga", "Lisboa"],
)
esperados = np.outer(tabela.sum(axis=1), tabela.sum(axis=0)) / tabela.values.sum()
esperados = pd.DataFrame(esperados, index=tabela.index, columns=tabela.columns)
qui2 = ((tabela - esperados) ** 2 / esperados).values.sum()
gl = (tabela.shape[0] - 1) * (tabela.shape[1] - 1)
print(esperados)
print(f"qui² = {qui2:.2f} com {gl} graus de liberdade (crítico a 5%: 5.99)")
print(((tabela - esperados) / np.sqrt(esperados)).round(2))`,
      pythonChallenge: {
        description: 'Qui-quadrado de independência, passo a passo:\n1) Completa qui_quadrado(tabela), que devolve (qui2, gl).\n2) Em vendas.csv (com a categoria vinda de produtos.csv), a mistura de categorias muda ao fim de semana? Guarda qui2_fds, gl_fds, p_fds e independente_fds (True se p ≥ 0.05).\n3) Em vendas_sazonais.csv, faz o mesmo para trimestre × categoria (qui2_trim, gl_trim, p_trim) e guarda celula_maior_desvio = (trimestre, categoria) com o maior resíduo padronizado.\nA ANOVA está no treino 1.',
        starterCode: `import math
import numpy as np
import pandas as pd


def p_valor_qui2(x, gl):
    """P(qui² >= x) com gl graus de liberdade (série da função gama incompleta)."""
    a, z = gl / 2, x / 2
    termo = soma = 1 / a
    n = 1
    while termo > 1e-15 * soma:
        termo *= z / (a + n)
        soma += termo
        n += 1
    return max(0.0, 1 - math.exp(-z + a * math.log(z) - math.lgamma(a)) * soma)


def qui_quadrado(tabela):
    """Devolve (qui2, gl) de uma tabela de contagens."""
    return None, None


produtos = pd.read_csv("dados/produtos.csv")[["id", "categoria"]].rename(columns={"id": "produto_id"})

# 2) Fim de semana × categoria em vendas.csv
vendas = pd.read_csv("dados/vendas.csv").merge(produtos, on="produto_id")
vendas["fim_de_semana"] = pd.to_datetime(vendas["data"]).dt.day_of_week >= 5
qui2_fds, gl_fds = None, None
p_fds = None
independente_fds = None

# 3) Trimestre × categoria em vendas_sazonais.csv
saz = pd.read_csv("dados/vendas_sazonais.csv").merge(produtos, on="produto_id")
saz["trimestre"] = "T" + ((saz["data"].str[5:7].astype(int) - 1) // 3 + 1).astype(str)
qui2_trim, gl_trim = None, None
p_trim = None
celula_maior_desvio = None
print(qui2_fds, p_fds, qui2_trim, celula_maior_desvio)`,
        solutionCode: `import math
import numpy as np
import pandas as pd


def p_valor_qui2(x, gl):
    """P(qui² >= x) com gl graus de liberdade (série da função gama incompleta)."""
    a, z = gl / 2, x / 2
    termo = soma = 1 / a
    n = 1
    while termo > 1e-15 * soma:
        termo *= z / (a + n)
        soma += termo
        n += 1
    return max(0.0, 1 - math.exp(-z + a * math.log(z) - math.lgamma(a)) * soma)


def qui_quadrado(tabela):
    """Devolve (qui2, gl) de uma tabela de contagens."""
    esperados = np.outer(tabela.sum(axis=1), tabela.sum(axis=0)) / tabela.values.sum()
    qui2 = ((tabela.values - esperados) ** 2 / esperados).sum()
    gl = (tabela.shape[0] - 1) * (tabela.shape[1] - 1)
    return qui2, gl


produtos = pd.read_csv("dados/produtos.csv")[["id", "categoria"]].rename(columns={"id": "produto_id"})

# 2) Fim de semana × categoria em vendas.csv
vendas = pd.read_csv("dados/vendas.csv").merge(produtos, on="produto_id")
vendas["fim_de_semana"] = pd.to_datetime(vendas["data"]).dt.day_of_week >= 5
qui2_fds, gl_fds = qui_quadrado(pd.crosstab(vendas["fim_de_semana"], vendas["categoria"]))
p_fds = p_valor_qui2(qui2_fds, gl_fds)
independente_fds = p_fds >= 0.05

# 3) Trimestre × categoria em vendas_sazonais.csv
saz = pd.read_csv("dados/vendas_sazonais.csv").merge(produtos, on="produto_id")
saz["trimestre"] = "T" + ((saz["data"].str[5:7].astype(int) - 1) // 3 + 1).astype(str)
tabela = pd.crosstab(saz["trimestre"], saz["categoria"])
qui2_trim, gl_trim = qui_quadrado(tabela)
p_trim = p_valor_qui2(qui2_trim, gl_trim)
esperados = np.outer(tabela.sum(axis=1), tabela.sum(axis=0)) / tabela.values.sum()
residuos = (tabela - esperados) / np.sqrt(esperados)
celula_maior_desvio = residuos.stack().idxmax()

print(f"Fim de semana: qui² = {qui2_fds:.2f} ({gl_fds} gl), p = {p_fds:.3f}")
print(f"Trimestres: qui² = {qui2_trim:.1f} ({gl_trim} gl), p < 0.001 | maior desvio: {celula_maior_desvio}")
print(residuos.round(1))`,
        checks: [
          { label: 'qui_quadrado funciona numa tabela 2 × 2 (6.67 com 1 gl)', expr: '(lambda r: abs(float(r[0]) - 6.6667) < 0.001 and int(r[1]) == 1)(qui_quadrado(pd.DataFrame([[10, 20], [20, 10]])))', actualExpr: 'qui_quadrado(pd.DataFrame([[10, 20], [20, 10]]))', hint: 'esperados = np.outer(tabela.sum(axis=1), tabela.sum(axis=0)) / tabela.values.sum(); qui2 = soma de (observado - esperado) ** 2 / esperado; gl = (linhas - 1) * (colunas - 1).' },
          { label: 'Fim de semana: qui² 2.22 com 5 gl, p = 0.82, independente', expr: 'abs(float(qui2_fds) - 2.219) < 0.01 and int(gl_fds) == 5 and abs(float(p_fds) - 0.818) < 0.005 and bool(independente_fds) is True', actualExpr: '(qui2_fds, gl_fds, p_fds, independente_fds)', hint: 'qui_quadrado(pd.crosstab(vendas["fim_de_semana"], vendas["categoria"])) e depois p_valor_qui2(qui2_fds, gl_fds).' },
          { label: 'Trimestres: qui² 228.3 com 15 gl e p < 0.001', expr: 'abs(float(qui2_trim) - 228.29) < 0.05 and int(gl_trim) == 15 and float(p_trim) < 0.001', actualExpr: '(qui2_trim, gl_trim, p_trim)', hint: 'tabela = pd.crosstab(saz["trimestre"], saz["categoria"]) e qui_quadrado(tabela).' },
          { label: 'Célula com maior desvio: Bebidas no 3.º trimestre', expr: 'tuple(celula_maior_desvio) == ("T3", "Bebidas")', actualExpr: 'celula_maior_desvio', hint: 'residuos = (tabela - esperados) / np.sqrt(esperados) e residuos.stack().idxmax().' },
        ],
      },
      quiz: {
        question: 'Uma ANOVA às vendas de 5 lojas dá p = 0,001. O que podes concluir?',
        options: [
          'Todas as lojas têm médias diferentes umas das outras.',
          'Pelo menos uma loja tem média diferente; falta ver quais.',
          'A loja com maior média é significativamente melhor do que todas.',
          'As lojas são iguais, porque o p-valor é muito pequeno.',
        ],
        correctIndex: 1,
        explanation: 'A ANOVA testa se todas as médias são iguais. Rejeitar isso só diz que há pelo menos uma diferença. Para saber quais lojas diferem, fazem-se comparações par a par (por exemplo, Tukey) com correção para testes múltiplos.',
      },
    },
    {
      id: 'bi-16-regressao-multipla',
      code: '16',
      title: 'Regressão linear múltipla: separar efeitos',
      lede: 'Na etapa anterior, cada cliente valia 16,69 € por dia. Mas dezembro tem mais clientes E cestos maiores: parte desse valor era o Natal. A regressão múltipla separa os efeitos e mede cada um "mantendo o resto constante".',
      analogyTitle: 'Quem ganhou o jogo: o avançado ou a equipa?',
      analogyBody: 'Um avançado que joga sempre na melhor equipa marca muitos golos. Parte é mérito dele, parte é a equipa. Para separar, comparas jogos em que só uma coisa muda. A regressão múltipla faz isso com contas: estima o efeito dos clientes, do fim de semana e de dezembro ao mesmo tempo, para que nenhum fique com o mérito dos outros.',
      concepts: [
        'Modelo: faturação = b0 + b1 × clientes + b2 × fim_de_semana + b3 × dezembro. As variáveis sim/não entram como 0 ou 1 (variáveis dummy).',
        'Cada coeficiente lê-se "mantendo as outras variáveis constantes": b3 é quanto um dia de dezembro fatura a mais do que um dia normal com os mesmos clientes e o mesmo dia da semana.',
        'Variável omitida: se deixares de fora uma variável que mexe com x e com y (dezembro), o coeficiente de x fica inflacionado. Foi o que aconteceu ao declive de 16,69 €.',
        'Mínimos quadrados com numpy: np.linalg.lstsq(X, y, rcond=None)[0], onde X tem uma coluna de 1 (para b0) e uma coluna por variável.',
        'R² ajustado = 1 - (1 - R²) × (n - 1) / (n - p - 1): penaliza variáveis a mais. Acrescentar variáveis nunca baixa o R² normal, mesmo que sejam inúteis.',
      ],
      beginnerSteps: [
        'Agrupa vendas_sazonais por data: clientes diferentes e faturação.',
        'Cria fim_de_semana e dezembro como 0 ou 1 com .astype(int).',
        'Monta X = np.column_stack([np.ones(n), clientes, fim_de_semana, dezembro]) e resolve com np.linalg.lstsq.',
        'Calcula as previsões X @ coef, o R² e o R² ajustado.',
        'Compara b_clientes com o declive simples da etapa anterior e usa o modelo para prever um sábado de dezembro com 10 clientes.',
      ],
      proPractice: 'Em análise profissional usa-se statsmodels (smf.ols("faturacao ~ clientes + fim_de_semana + dezembro", data=df).fit().summary()), que mostra também erros padrão e p-valores de cada coeficiente. Em scikit-learn usa-se LinearRegression quando o objetivo é prever.',
      commonPitfall: 'Ler o coeficiente da regressão simples como "o efeito" de uma variável quando há outra escondida a mexer nas duas. Pergunta sempre: o que mais muda ao mesmo tempo que x?',
      referenceTitle: 'Regressão múltipla com numpy',
      referenceRows: [
        { syntax: 'serie.astype(int)', meaning: 'Variável dummy 0/1', example: 'dezembro = 1 em dezembro' },
        { syntax: 'np.column_stack([np.ones(n), x1, x2])', meaning: 'Matriz X com coluna de 1', example: 'O 1 dá a ordenada b0' },
        { syntax: 'np.linalg.lstsq(X, y, rcond=None)[0]', meaning: 'Coeficientes por mínimos quadrados', example: '[b0, b1, b2, b3]' },
        { syntax: '1 - ((y - prev) ** 2).sum() / ((y - y.mean()) ** 2).sum()', meaning: 'R²', example: '0.73' },
        { syntax: '1 - (1 - r2) * (n - 1) / (n - p - 1)', meaning: 'R² ajustado (p variáveis)', example: '0.73' },
      ],
      engine: 'python',
      exampleCode: `import numpy as np

# Exemplo com dados inventados: preço de uma casa (milhares de €) por área e por ter garagem.
area = np.array([60, 80, 100, 120, 70, 90, 110, 130])
garagem = np.array([0, 0, 0, 0, 1, 1, 1, 1])
preco = np.array([150, 190, 230, 270, 185, 225, 265, 305])

X = np.column_stack([np.ones(len(area)), area, garagem])
b0, b_area, b_garagem = np.linalg.lstsq(X, preco, rcond=None)[0]
print(f"preço = {b0:.1f} + {b_area:.2f} × área + {b_garagem:.1f} × garagem")
print(f"Com a mesma área, ter garagem vale +{b_garagem:.0f} mil €")`,
      pythonChallenge: {
        description: 'Em vendas_sazonais.csv (sub = quantidade * preco), cria por_dia com clientes e faturacao por data, e as colunas fim_de_semana e dezembro (0 ou 1). Ajusta faturacao = b0 + b_clientes × clientes + b_fds × fim_de_semana + b_dezembro × dezembro com np.linalg.lstsq. Guarda os 4 coeficientes, r2, r2_ajustado, declive_simples (o declive só com clientes, como na etapa anterior), previsao_sabado_dezembro (10 clientes, fim de semana, dezembro) e dezembro_inflacionava (True se declive_simples > b_clientes).',
        starterCode: `import numpy as np
import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

por_dia = None

b0 = None
b_clientes = None
b_fds = None
b_dezembro = None
r2 = None
r2_ajustado = None

declive_simples = None
previsao_sabado_dezembro = None
dezembro_inflacionava = None
print(b0, b_clientes, b_fds, b_dezembro, r2)`,
        solutionCode: `import numpy as np
import pandas as pd

df = pd.read_csv("dados/vendas_sazonais.csv")
df["sub"] = df["quantidade"] * df["preco"]

por_dia = df.groupby("data").agg(clientes=("cliente_id", "nunique"), faturacao=("sub", "sum")).reset_index()
por_dia["fim_de_semana"] = (pd.to_datetime(por_dia["data"]).dt.day_of_week >= 5).astype(int)
por_dia["dezembro"] = (por_dia["data"].str[5:7] == "12").astype(int)

n = len(por_dia)
y = por_dia["faturacao"].to_numpy()
X = np.column_stack([np.ones(n), por_dia["clientes"], por_dia["fim_de_semana"], por_dia["dezembro"]])
b0, b_clientes, b_fds, b_dezembro = np.linalg.lstsq(X, y, rcond=None)[0]

previsoes = X @ np.array([b0, b_clientes, b_fds, b_dezembro])
r2 = 1 - ((y - previsoes) ** 2).sum() / ((y - y.mean()) ** 2).sum()
r2_ajustado = 1 - (1 - r2) * (n - 1) / (n - 3 - 1)

declive_simples = por_dia["clientes"].cov(por_dia["faturacao"]) / por_dia["clientes"].var()
previsao_sabado_dezembro = b0 + b_clientes * 10 + b_fds * 1 + b_dezembro * 1
dezembro_inflacionava = declive_simples > b_clientes

print(f"faturação = {b0:.2f} + {b_clientes:.2f} × clientes + {b_fds:.2f} × fds + {b_dezembro:.2f} × dezembro")
print(f"R² = {r2:.3f} | R² ajustado = {r2_ajustado:.3f}")
print(f"Declive simples {declive_simples:.2f} € vs múltiplo {b_clientes:.2f} € por cliente")
print(f"Sábado de dezembro com 10 clientes: {previsao_sabado_dezembro:.2f} €")`,
        checks: [
          { label: 'por_dia com 365 dias e colunas 0/1', expr: 'len(por_dia) == 365 and set(por_dia["dezembro"].unique()) == {0, 1} and int(por_dia["dezembro"].sum()) == 31 and int(por_dia["fim_de_semana"].sum()) == 104', actualExpr: '(len(por_dia), int(por_dia["dezembro"].sum()), int(por_dia["fim_de_semana"].sum())) if por_dia is not None else None', hint: 'Usa .astype(int) para transformar True/False em 1/0.' },
          { label: 'Coeficientes: b0 -8.07, clientes 12.29, fim de semana 22.92, dezembro 71.98', expr: 'abs(float(b0) - (-8.0707)) < 0.01 and abs(float(b_clientes) - 12.2878) < 0.001 and abs(float(b_fds) - 22.9175) < 0.01 and abs(float(b_dezembro) - 71.9818) < 0.01', actualExpr: '(b0, b_clientes, b_fds, b_dezembro)', hint: 'X = np.column_stack([np.ones(n), clientes, fim_de_semana, dezembro]) e np.linalg.lstsq(X, y, rcond=None)[0]. A ordem das colunas define a ordem dos coeficientes.' },
          { label: 'r2 (0.735) e r2_ajustado (0.732)', expr: 'abs(float(r2) - 0.73457) < 0.0005 and abs(float(r2_ajustado) - 0.73236) < 0.0005', actualExpr: '(r2, r2_ajustado)', hint: 'r2 = 1 - soma dos resíduos² / soma de (y - média)²; r2_ajustado = 1 - (1 - r2) * (n - 1) / (n - 3 - 1).' },
          { label: 'Declive simples (16.69) maior do que o múltiplo: dezembro inflacionava', expr: 'abs(float(declive_simples) - 16.6885) < 0.005 and bool(dezembro_inflacionava) is True', actualExpr: '(declive_simples, dezembro_inflacionava)', hint: 'declive_simples = clientes.cov(faturacao) / clientes.var(), como na etapa anterior.' },
          { label: 'Previsão para um sábado de dezembro com 10 clientes (209.71 €)', expr: 'abs(float(previsao_sabado_dezembro) - 209.706) < 0.05', actualExpr: 'previsao_sabado_dezembro', hint: 'b0 + b_clientes * 10 + b_fds * 1 + b_dezembro * 1.' },
        ],
      },
      quiz: {
        question: 'Numa regressão múltipla, o coeficiente de "dezembro" é 72 €. Como o lês?',
        options: [
          'Dezembro fatura 72 € por mês a mais do que os outros meses.',
          'Cada cliente de dezembro gasta mais 72 €.',
          'Um dia de dezembro fatura, em média, mais 72 € do que um dia normal com os mesmos clientes e o mesmo tipo de dia.',
          'Dezembro explica 72% da faturação.',
        ],
        correctIndex: 2,
        explanation: 'Os coeficientes de uma regressão múltipla medem o efeito de uma variável mantendo as outras constantes. Aqui a unidade é o dia, porque o modelo foi ajustado com dados diários.',
      },
    },
    {
      id: 'bi-17-simulacao-bootstrap',
      code: '17',
      title: 'Ver a incerteza: simulação, bootstrap e testes de permutação',
      lede: 'Em vez de confiar em fórmulas, deixa o computador repetir a experiência mil vezes. Vês a curva das médias a formar-se num histograma, confirmas o erro padrão da etapa anterior e aprendes o bootstrap e o teste de permutação, que também aparecem em entrevistas.',
      analogyTitle: 'Provar a sopa mil vezes',
      analogyBody: 'Uma colher de sopa dá uma ideia do sal, mas cada colher é um pouco diferente. Se provares mil colheres e marcares o resultado de cada uma, as marcas formam um monte à volta do sal verdadeiro. A largura desse monte é o erro padrão. O bootstrap faz isto quando só tens uma panela pequena: volta a tirar colheres da mesma amostra, com reposição.',
      concepts: [
        'Distribuição amostral: se repetires a amostragem muitas vezes, as médias das amostras formam uma curva em sino centrada na média verdadeira, mesmo que os dados originais sejam assimétricos (Teorema do Limite Central).',
        'O desvio padrão dessas médias é o erro padrão: a simulação deve dar quase o mesmo que a fórmula desvio padrão / raiz de n.',
        'Bootstrap: reamostrar a própria amostra com reposição (rng.choice(amostra, size=len(amostra))) muitas vezes; os percentis 2,5 e 97,5 das estatísticas dão um intervalo de confiança, mesmo para a mediana, onde não há fórmula simples.',
        'Teste de permutação: baralha os rótulos dos grupos (fim de semana / dia útil) muitas vezes; o p-valor é a fração de baralhações com uma diferença tão grande como a observada.',
        'np.random.default_rng(42) fixa a semente: os resultados repetem-se sempre que corres o código.',
      ],
      beginnerSteps: [
        'Converte o sub numa coluna NumPy com .to_numpy() e cria rng = np.random.default_rng(42).',
        'Repete 1000 vezes: tira 50 valores com rng.choice(sub, size=50) e guarda a média.',
        'Compara o desvio padrão das 1000 médias com sub.std(ddof=1) / math.sqrt(50).',
        'Conta a percentagem de médias que ficam a menos de 1.96 erros padrão da média verdadeira.',
        'Desenha o histograma das médias com ax.hist(medias_amostra, bins=30) e marca a média verdadeira com ax.axvline.',
      ],
      proPractice: 'Em entrevistas para analista é comum perguntarem "como calculavas um intervalo de confiança para a mediana?" ou "e se os dados não forem normais?". A resposta curta é: bootstrap. Em Python profissional usa-se scipy.stats.bootstrap e scipy.stats.permutation_test.',
      commonPitfall: 'Reamostrar sem reposição no bootstrap: rng.choice(amostra, size=len(amostra), replace=False) devolve sempre a mesma amostra baralhada e o intervalo fica com largura zero.',
      referenceTitle: 'Simulação com NumPy',
      referenceRows: [
        { syntax: 'rng = np.random.default_rng(42)', meaning: 'Gerador aleatório com semente fixa', example: 'Resultados reprodutíveis' },
        { syntax: 'rng.choice(x, size=50)', meaning: 'Amostra de 50 valores com reposição', example: 'Uma "colher" da sopa' },
        { syntax: 'np.percentile(boot, [2.5, 97.5])', meaning: 'Intervalo de confiança por bootstrap', example: 'IC da mediana' },
        { syntax: 'rng.permutation(rotulos)', meaning: 'Baralha os rótulos dos grupos', example: 'Teste de permutação' },
        { syntax: 'ax.hist(valores, bins=30)', meaning: 'Histograma', example: 'A curva das médias' },
      ],
      engine: 'python',
      exampleCode: `import numpy as np
import matplotlib.pyplot as plt

# Os dados originais são muito assimétricos (um dado viciado que dá muitos 1)...
rng = np.random.default_rng(7)
dado = np.array([1, 1, 1, 1, 2, 6])
print("Média verdadeira:", dado.mean())

# ...mas a média de 30 lançamentos, repetida 2000 vezes, forma um sino.
medias = [rng.choice(dado, size=30).mean() for _ in range(2000)]
fig, ax = plt.subplots(figsize=(6, 3))
ax.hist(medias, bins=30)
ax.axvline(dado.mean(), color="black")
ax.set_title("As médias formam um sino, mesmo com dados assimétricos")
fig.tight_layout()`,
      pythonChallenge: {
        description: 'Em vendas.csv (sub = quantidade * preco, como array NumPy), com rng = np.random.default_rng(42):\n1) medias_amostra: array com a média de 1000 amostras de 50 linhas (rng.choice com reposição).\n2) media_das_medias, erro_simulado (desvio padrão das médias, ddof=1) e erro_teorico (sub.std(ddof=1) / raiz de 50).\n3) pct_dentro: percentagem de médias a menos de 1.96 × erro_teorico da média verdadeira.\n4) Histograma das médias (bins=30) com um título que diga a conclusão.\nO bootstrap está no treino 1 e o teste de permutação no treino 2.',
        starterCode: `import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("dados/vendas.csv")
sub = (df["quantidade"] * df["preco"]).to_numpy()
rng = np.random.default_rng(42)

# 1) 1000 amostras de 50 linhas
medias_amostra = None

# 2) Erro padrão simulado vs teórico
media_das_medias = None
erro_simulado = None
erro_teorico = None

# 3) Quantas médias ficam dentro de ±1.96 erros padrão?
pct_dentro = None

# 4) Histograma
fig, ax = plt.subplots(figsize=(7, 3.5))
print(media_das_medias, erro_simulado, erro_teorico, pct_dentro)`,
        solutionCode: `import math
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("dados/vendas.csv")
sub = (df["quantidade"] * df["preco"]).to_numpy()
rng = np.random.default_rng(42)

# 1) 1000 amostras de 50 linhas
medias_amostra = np.array([rng.choice(sub, size=50).mean() for _ in range(1000)])

# 2) Erro padrão simulado vs teórico
media_das_medias = medias_amostra.mean()
erro_simulado = medias_amostra.std(ddof=1)
erro_teorico = sub.std(ddof=1) / math.sqrt(50)

# 3) Quantas médias ficam dentro de ±1.96 erros padrão?
pct_dentro = (np.abs(medias_amostra - sub.mean()) <= 1.96 * erro_teorico).mean() * 100

# 4) Histograma
fig, ax = plt.subplots(figsize=(7, 3.5))
ax.hist(medias_amostra, bins=30)
ax.axvline(sub.mean(), color="black")
ax.set_title("As médias de 50 linhas formam um sino à volta de 5,30 €")
ax.set_xlabel("Média de uma amostra de 50 linhas (€)")
fig.tight_layout()
print(f"Erro simulado {erro_simulado:.3f} € vs teórico {erro_teorico:.3f} € | {pct_dentro:.1f}% dentro de ±1.96 EP")`,
        checks: [
          { label: '1000 médias centradas na média verdadeira (5.30 €)', expr: 'len(medias_amostra) == 1000 and abs(float(media_das_medias) - 5.2979) < 0.2 and abs(float(media_das_medias) - float(np.mean(medias_amostra))) < 1e-9', actualExpr: '(len(medias_amostra) if medias_amostra is not None else None, media_das_medias)', hint: 'medias_amostra = np.array([rng.choice(sub, size=50).mean() for _ in range(1000)]).' },
          { label: 'Erro simulado ≈ erro teórico (0.80 €)', expr: 'abs(float(erro_teorico) - 0.80195) < 0.001 and abs(float(erro_simulado) - float(np.std(medias_amostra, ddof=1))) < 1e-9 and 0.9 < float(erro_simulado) / float(erro_teorico) < 1.1', actualExpr: '(erro_simulado, erro_teorico)', hint: 'erro_simulado = medias_amostra.std(ddof=1) e erro_teorico = sub.std(ddof=1) / math.sqrt(50).' },
          { label: 'Cerca de 95% das médias dentro de ±1.96 erros padrão', expr: '92 <= float(pct_dentro) <= 98 and abs(float(pct_dentro) - float((np.abs(medias_amostra - sub.mean()) <= 1.96 * erro_teorico).mean() * 100)) < 1e-9', actualExpr: 'pct_dentro', hint: '(np.abs(medias_amostra - sub.mean()) <= 1.96 * erro_teorico).mean() * 100.' },
          { label: 'Histograma das médias com título', expr: 'len(ax.patches) >= 10 and len(ax.get_title().strip()) >= 15', actualExpr: '(len(ax.patches), ax.get_title())', hint: 'ax.hist(medias_amostra, bins=30) e ax.set_title("...").' },
        ],
      },
      quiz: {
        question: 'Tens uma amostra de 200 cestos e queres um intervalo de confiança para a mediana. O que fazes no bootstrap?',
        options: [
          'Calculas mediana ± 1.96 × desvio padrão / raiz de 200.',
          'Reamostras os 200 cestos com reposição muitas vezes e usas os percentis 2,5 e 97,5 das medianas.',
          'Divides a amostra em 2 metades e comparas as medianas.',
          'Reamostras sem reposição, para não repetir cestos.',
        ],
        correctIndex: 1,
        explanation: 'O bootstrap trata a amostra como se fosse a população e repete a amostragem com reposição. Sem reposição, todas as reamostras seriam iguais à original.',
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
