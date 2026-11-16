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
    {
      title: 'Antes de começar: onde estou e o que há aqui',
      description: 'Num projeto novo, primeiro orientas-te. Vê em que pasta estás (pwd), lista os ficheiros (ls -la), lê as regras de privacidade (cat .gitignore) e só depois inicializa o repositório e vê o estado.',
      starterCommands: 'git status\n',
      solutionCommands: 'pwd\nls -la\ncat .gitignore\ngit init\ngit status',
      hint: 'Cinco comandos, um por linha: pwd, ls -la, cat .gitignore, git init e git status.',
      validate: (state, output) => {
        const h = state.historyCommands;
        const orientou = ['pwd', 'ls -la', 'cat .gitignore'].every((c) => h.includes(c));
        const antes = h.indexOf('git init') > h.indexOf('cat .gitignore');
        return ok(
          orientou && antes && state.initialized && output.includes('No ramo main'),
          'Sabes onde estás, o que existe e o que o .gitignore protege, antes de o Git começar a seguir ficheiros.',
          !state.initialized ? 'O git status sem git init dá erro: inicializa o repositório primeiro.' : 'Corre pwd, ls -la e cat .gitignore antes do git init, e termina com git status.',
        );
      },
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
    {
      title: 'Uma mensagem de commit que se percebe',
      description: 'Daqui a seis meses, "update" não te diz nada. Faz um commit com todos os ficheiros e uma mensagem que diga o que muda, começada por um verbo e com pelo menos 4 palavras (por exemplo "Corrige o preço do pão no exercício").',
      starterCommands: 'git init\ngit add .\ngit commit -m "update"\n',
      solutionCommands: 'git init\ngit add .\ngit commit -m "Corrige o preço do pão no exercício das variáveis"\ngit log',
      hint: 'Troca "update" por uma frase curta: verbo no presente + o que muda, com 4 palavras ou mais.',
      validate: (state) => {
        const msg = state.commits[0]?.message ?? '';
        const vagas = ['update', 'fix', 'wip', 'alterações', 'mudanças', 'teste'];
        const boa = msg.trim().split(/\s+/).length >= 4 && !vagas.includes(msg.trim().toLowerCase());
        return ok(
          state.commits.length >= 1 && boa,
          `"${msg}" explica o que mudou sem ser preciso abrir o código.`,
          state.commits.length === 0 ? 'Faz git add . e um commit com -m "...".' : `"${msg}" é vaga: escreve o que muda, com pelo menos 4 palavras.`,
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
    {
      title: 'Preparar o .gitignore de um projeto de dados',
      description: 'Os cadernos Jupyter criam a pasta .ipynb_checkpoints/ e os scripts deixam ficheiros .log. Acrescenta as duas regras ao .gitignore com echo, confirma com cat .gitignore e faz um commit que inclua o próprio .gitignore.',
      starterCommands: 'git init\ncat .gitignore\n',
      solutionCommands: 'git init\necho ".ipynb_checkpoints/" >> .gitignore\necho "*.log" >> .gitignore\ncat .gitignore\ngit add .gitignore\ngit commit -m "Ignora checkpoints do Jupyter e ficheiros de log"',
      hint: 'echo ".ipynb_checkpoints/" >> .gitignore e echo "*.log" >> .gitignore, depois git add .gitignore e git commit -m "...".',
      validate: (state) => {
        const regras = ['.ipynb_checkpoints/', '*.log'].every((r) => state.gitignore.includes(r));
        const gravado = state.commits.some((c) => c.files.includes('.gitignore'));
        return ok(
          regras && gravado,
          'As novas regras estão gravadas: quem clonar o projeto herda a mesma proteção.',
          !regras ? 'Faltam regras: acrescenta .ipynb_checkpoints/ e *.log com echo "..." >> .gitignore.' : 'Grava o .gitignore num commit (git add .gitignore e git commit).',
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
    {
      title: 'Juntar o trabalho de um ramo ao main',
      description: 'Cria o ramo limpeza-dados, faz lá um commit, volta ao main e junta o ramo com git merge limpeza-dados. Termina com git log.',
      starterCommands: 'git init\ngit switch -c limpeza-dados\ngit add .\ngit commit -m "Limpa os nomes dos produtos"\n',
      solutionCommands: 'git init\ngit switch -c limpeza-dados\ngit add .\ngit commit -m "Limpa os nomes dos produtos"\ngit switch main\ngit merge limpeza-dados\ngit log',
      hint: 'O merge corre no ramo que recebe o trabalho: primeiro git switch main, depois git merge limpeza-dados.',
      validate: (state, output) => {
        const h = state.historyCommands;
        const fundiu = h.lastIndexOf('git merge limpeza-dados') > h.lastIndexOf('git switch main') && h.includes('git switch main');
        return ok(
          fundiu && state.currentBranch === 'main' && output.includes("integradas com sucesso em 'main'"),
          'O trabalho de limpeza entrou no main, e o ramo pode ser apagado ou reaproveitado.',
          'Volta ao main com git switch main e só depois corre git merge limpeza-dados.',
        );
      },
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
    {
      title: 'Atualizar o GitHub depois de mais trabalho',
      description: 'Publica o main (remoto https://github.com/analista/mercearia.git e git push -u origin main). Depois faz um segundo commit com sql/02_perguntas_negocio.sql e envia-o com git push.',
      starterCommands: 'git init\ngit add exercicios/semana03_variaveis.py\ngit commit -m "Resolve o exercício das variáveis"\n',
      solutionCommands: 'git init\ngit add exercicios/semana03_variaveis.py\ngit commit -m "Resolve o exercício das variáveis"\ngit remote add origin https://github.com/analista/mercearia.git\ngit push -u origin main\ngit add sql/02_perguntas_negocio.sql\ngit commit -m "Acrescenta as perguntas de negócio em SQL"\ngit push',
      hint: 'Depois do primeiro push, o ciclo repete-se: git add, git commit e git push (o -u já ligou o ramo ao remoto).',
      validate: (state) => {
        const h = state.historyCommands;
        const ultimoCommit = h.map((c) => c.startsWith('git commit')).lastIndexOf(true);
        const ultimoPush = h.map((c) => c.startsWith('git push')).lastIndexOf(true);
        const pushes = h.filter((c) => c.startsWith('git push')).length;
        return ok(
          state.commits.length >= 2 && pushes >= 2 && ultimoPush > ultimoCommit && state.pushedBranches.includes('main'),
          'Os dois commits estão no GitHub: add, commit e push é o ciclo de todos os dias.',
          pushes < 2 ? 'Faz um push depois do primeiro commit e outro depois do segundo.' : 'O último push tem de vir depois do último commit.',
        );
      },
    },
  ],
};
