import type { GitChallengeSpec } from './types';

// Treinos da trilha Git: cada um parte de um repositório novo no simulador.

const ok = (passed: boolean, certo: string, errado: string) => ({ passed, message: passed ? certo : errado });

export const gitPractice: Record<string, GitChallengeSpec[]> = {
  'git-01-init-status': [
    {
      title: 'Ver o que mudou antes de gravar',
      description: 'Antes de um commit, vê sempre o que mudou. Inicializa o repositório, corre git status para ver que ficheiros mudaram e git diff para ver as linhas alteradas.',
      starterCommands: '# Inicializa, vê o estado e as diferenças\n',
      solutionCommands: 'git init\ngit status\ngit diff',
      hint: 'Três comandos, um por linha: git init, git status e git diff.',
      validate: (state, output) =>
        ok(
          state.initialized && state.historyCommands.includes('git status') && output.includes('+preco_pao = 0.25'),
          'O git diff mostra a linha exata que mudou: preco_pao passou de None para 0.25.',
          !state.initialized ? 'Começa com git init.' : 'Corre git status e depois git diff para ver as linhas alteradas.',
        ),
    },
  ],
  'git-02-add-commit': [
    {
      title: 'Dois commits pequenos em vez de um grande',
      description: 'Um commit deve contar uma só coisa. Faz um commit só com exercicios/semana03_variaveis.py e outro só com sql/02_perguntas_negocio.sql (usa git add com o caminho de cada ficheiro), e termina com git log.',
      starterCommands: 'git init\n# Um commit por ficheiro\n',
      solutionCommands: 'git init\ngit add exercicios/semana03_variaveis.py\ngit commit -m "Resolve o exercício das variáveis"\ngit add sql/02_perguntas_negocio.sql\ngit commit -m "Acrescenta as perguntas de negócio em SQL"\ngit log',
      hint: 'git add exercicios/semana03_variaveis.py, git commit -m "...", e repete para sql/02_perguntas_negocio.sql.',
      validate: (state) => {
        const umFicheiroCada = state.commits.length >= 2 && state.commits.slice(0, 2).every((c) => c.files.length === 1);
        const ficheiros = state.commits.flatMap((c) => c.files);
        return ok(
          umFicheiroCada && ficheiros.includes('exercicios/semana03_variaveis.py') && ficheiros.includes('sql/02_perguntas_negocio.sql'),
          'Dois commits, um ficheiro cada: o histórico conta a história passo a passo.',
          state.commits.length === 1 ? 'Só há um commit: usa git add com o caminho de um ficheiro de cada vez.' : 'Faz 2 commits, cada um com um só ficheiro.',
        );
      },
    },
  ],
  'git-03-gitignore': [
    {
      title: 'O .gitignore protege os segredos',
      description: 'Tenta adicionar o ficheiro .env diretamente com git add .env e lê o aviso. Depois faz git add . e um commit: confirma que nem o .env nem dados_clientes_privados.xlsx entram no commit.',
      starterCommands: 'git init\n# Tenta adicionar o .env e depois faz um commit normal\n',
      solutionCommands: 'git init\ngit add .env\ngit add .\ngit commit -m "Primeira versão sem segredos"\ngit log',
      hint: 'git add .env (vais ver o aviso), depois git add . e git commit -m "...".',
      validate: (state, output) => {
        const ficheiros = state.commits.flatMap((c) => c.files);
        const protegido = output.includes('protegido pelo .gitignore');
        const limpo = state.commits.length >= 1 && !ficheiros.includes('.env') && !ficheiros.includes('dados_clientes_privados.xlsx') && ficheiros.includes('src/caixa.py');
        return ok(
          protegido && limpo,
          'O .gitignore recusou o .env e o commit só levou ficheiros seguros.',
          !protegido ? 'Começa por tentar git add .env para veres o aviso.' : 'Faz git add . e um commit com mensagem.',
        );
      },
    },
  ],
  'git-04-branches': [
    {
      title: 'Um ramo por análise',
      description: 'Cria o ramo analise-precos, faz lá um commit, volta a main, cria o ramo relatorio-dezembro e volta outra vez a main. Termina com git branch para ver os 3 ramos.',
      starterCommands: 'git init\n# Dois ramos de trabalho e regresso a main\n',
      solutionCommands: 'git init\ngit switch -c analise-precos\ngit add .\ngit commit -m "Analisa a evolução dos preços"\ngit switch main\ngit switch -c relatorio-dezembro\ngit switch main\ngit branch',
      hint: 'git switch -c cria e muda de ramo; git switch main volta ao ramo principal.',
      validate: (state, output) =>
        ok(
          ['analise-precos', 'relatorio-dezembro'].every((b) => state.branches.includes(b)) &&
            state.currentBranch === 'main' &&
            state.commits.some((c) => c.branch === 'analise-precos') &&
            output.includes('* main'),
          'Três ramos, um commit no ramo de análise e o main intacto.',
          'Precisas dos ramos analise-precos (com um commit) e relatorio-dezembro, e de terminar em main com git branch.',
        ),
    },
  ],
  'git-05-github-portfolio': [
    {
      title: 'Publicar um ramo de trabalho',
      description: 'Em equipa, não se envia trabalho diretamente para main: publica-se um ramo e abre-se um pull request. Cria o ramo relatorio, faz um commit, configura o remoto https://github.com/analista/mercearia.git e envia com git push -u origin relatorio.',
      starterCommands: 'git init\n# Ramo, commit, remoto e push do ramo\n',
      solutionCommands: 'git init\ngit switch -c relatorio\ngit add .\ngit commit -m "Relatório executivo de 2025"\ngit remote add origin https://github.com/analista/mercearia.git\ngit push -u origin relatorio',
      hint: 'Depois do commit no ramo relatorio: git remote add origin ... e git push -u origin relatorio.',
      validate: (state) =>
        ok(
          state.pushedBranches.includes('relatorio') && !state.pushedBranches.includes('main') && state.remoteUrl === 'https://github.com/analista/mercearia.git',
          'O ramo relatorio está no GitHub, pronto para um pull request; o main não foi tocado.',
          state.pushedBranches.includes('main') ? 'Enviaste o main: publica só o ramo relatorio.' : 'Faz o commit no ramo relatorio, configura o remoto e corre git push -u origin relatorio.',
        ),
    },
  ],
};
