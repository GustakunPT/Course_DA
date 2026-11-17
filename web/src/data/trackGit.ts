import type { Track } from './types';

export const gitTrack: Track = {
  id: 'git',
  shortTitle: '4. Git & GitHub',
  fullTitle: 'Git, GitHub e Portefólio para Analistas de Dados',
  summary: 'Controlo de versões ao vivo no terminal simulado: commits limpos, proteção de dados com .gitignore, branches e publicação de portefólio.',
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
        'O Git guarda fotografias do projeto, chamadas commits. O git status diz-te o que mudou desde a última fotografia.',
        'Todo o histórico vive na pasta escondida .git: se a apagares, perdes as versões anteriores (os ficheiros atuais ficam).',
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
              ? 'Repositório inicializado e inspecionado.'
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
        'Uma boa mensagem de commit diz o que a mudança faz, no presente: "Corrige o cálculo do IVA" é muito mais útil do que "alterações".',
        'O git add escolhe o que entra no próximo commit: podes deixar de fora, de propósito, ficheiros que mudaram mas ainda não estão prontos.',
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
        'Experimenta ver cat .gitignore no simulador: vais notar que .env e dados_clientes_privados.xlsx são bloqueados automaticamente.',
        'O .gitignore só funciona para ficheiros que ainda não foram adicionados. Um ficheiro que já está no histórico continua a ser seguido até o tirares com git rm --cached ficheiro.',
        'Nomes, moradas e contactos de clientes são dados pessoais protegidos pelo RGPD: nunca os ponhas num repositório, muito menos público.',
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
        description: 'Inspeciona o ficheiro .gitignore com cat .gitignore, adiciona uma regra "*.bak" usando echo "*.bak" >> .gitignore e confirma com cat .gitignore.',
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
        'Um ramo é uma linha de trabalho paralela: podes experimentar uma análise sem estragar a versão que funciona no main.',
        'Se duas pessoas mudarem a mesma linha em ramos diferentes, o merge pára com um conflito: o Git marca as duas versões no ficheiro e és tu que escolhes qual fica.',
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
              ? 'Fluxo completo de feature branch concluído e integrado em main.'
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
      title: 'GitHub remoto e como montar um portefólio de analista',
      lede: 'Publica o teu repositório com git push e estrutura um README executivo que recrutadores técnicos consigam avaliar em 60 segundos.',
      analogyTitle: 'A montra da tua mercearia aberta ao mercado de trabalho',
      analogyBody: 'Um bom portefólio de analista não despeja apenas código: apresenta o problema de negócio, mostra os KPIs descobertos, explica as limitações dos dados e permite reproduzir tudo num comando.',
      concepts: [
        'git remote add origin <url> liga o teu repositório local à página do GitHub.',
        'git push -u origin main publica os teus commits na nuvem.',
        'Checklist de README forte: contexto do problema, arquitetura das pastas, principais conclusões quantificadas, como correr e limitações conhecidas.',
        'O git push envia os teus commits para o GitHub e o git pull traz os commits dos outros. Faz pull antes de começar a trabalhar, para não partires de uma versão antiga.',
        'Um bom projeto de portefólio no GitHub tem um README com a pergunta de negócio, os dados usados, as conclusões (com um gráfico) e como correr o código.',
      ],
      referenceTitle: 'Sincronização com GitHub',
      referenceRows: [
        { syntax: 'git remote add origin <url>', meaning: 'Associa repositório remoto no GitHub', example: 'https://github.com/user/mercearia.git' },
        { syntax: 'git push -u origin main', meaning: 'Envia commits locais para o GitHub', example: 'Publica o portefólio' },
        { syntax: 'git pull', meaning: 'Descarrega e integra novidades do remoto', example: 'Sincronizar noutro PC' },
      ],
      engine: 'git',
      exampleCode: `git init
git add .
git commit -m "Publica portefólio completo Mercearia do Bairro"
git remote add origin https://github.com/analista/mercearia-do-bairro.git
git push -u origin main`,
      gitChallenge: {
        description: 'Faz o percurso completo de publicação: git init, git add ., git commit -m "...", configura um remoto com git remote add origin https://github.com/analista/mercearia.git e envie com git push -u origin main.',
        starterCommands: `git init
# Faz add, commit, remote add e push para main
`,
        solutionCommands: `git init
git add .
git commit -m "Versao 1.0 do portefólio de análise de dados"
git remote add origin https://github.com/analista/mercearia.git
git push -u origin main`,
        hint: 'Termina com git push -u origin main após ter pelo menos 1 commit.',
        validate: (state) => {
          const ok = state.pushedBranches.includes('main') && Boolean(state.remoteUrl);
          return {
            passed: ok,
            message: ok
              ? `Portefólio publicado em ${state.remoteUrl} no ramo main.`
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
