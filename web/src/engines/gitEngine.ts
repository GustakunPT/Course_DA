export interface GitCommit {
  hash: string;
  branch: string;
  message: string;
  files: string[];
}

export interface GitRepoState {
  initialized: boolean;
  currentBranch: string;
  branches: string[];
  staged: string[];
  modified: string[];
  untracked: string[];
  gitignore: string[];
  commits: GitCommit[];
  remoteUrl: string | null;
  pushedBranches: string[];
  historyCommands: string[];
}

export function createInitialGitState(): GitRepoState {
  return {
    initialized: false,
    currentBranch: 'main',
    branches: ['main'],
    staged: [],
    modified: ['exercicios/semana03_variaveis.py', 'sql/02_perguntas_negocio.sql'],
    untracked: ['dados_clientes_privados.xlsx', '.env', '.gitignore', 'src/caixa.py'],
    gitignore: ['.env', '__pycache__/', '*_privados.xlsx'],
    commits: [],
    remoteUrl: null,
    pushedBranches: [],
    historyCommands: [],
  };
}

function isIgnored(file: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    if (p.startsWith('*')) return file.endsWith(p.slice(1));
    return file === p || file.startsWith(p);
  });
}

const MAX_GIT_CHARS = 4_000;

export function runGitSimulator(state: GitRepoState, scriptText: string): { output: string; nextState: GitRepoState } {
  if (scriptText.length > MAX_GIT_CHARS) {
    return {
      output: `Erro: o script Git excede o limite de ${MAX_GIT_CHARS} caracteres do simulador.`,
      nextState: state,
    };
  }
  const s: GitRepoState = JSON.parse(JSON.stringify(state));
  const lines = scriptText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const logs: string[] = [];

  for (const rawCmd of lines) {
    const cmd = rawCmd.replace(/^\$\s*/, '');
    s.historyCommands.push(cmd);

    if (cmd === 'pwd') {
      logs.push('$ pwd\n/home/analista/mercearia-do-bairro');
      continue;
    }
    if (cmd === 'ls' || cmd === 'ls -la') {
      logs.push('$ ' + cmd + '\nREADME.md  .gitignore  verificar.py  dados/  licoes/  exercicios/  sql/  src/');
      continue;
    }
    if (cmd === 'cat .gitignore') {
      logs.push('$ cat .gitignore\n' + s.gitignore.join('\n'));
      continue;
    }
    if (cmd.startsWith('echo ') && cmd.includes('>> .gitignore')) {
      const match = /echo\s+["']?([^"'>]+)["']?\s*>>\s*\.gitignore/.exec(cmd);
      if (match) {
        const rule = match[1].trim();
        if (!s.gitignore.includes(rule)) s.gitignore.push(rule);
        logs.push(`$ ${cmd}\nRegra "${rule}" adicionada a .gitignore.`);
      }
      continue;
    }
    if (cmd === 'git init') {
      s.initialized = true;
      logs.push('$ git init\nRepositório Git vazio inicializado em /home/analista/mercearia-do-bairro/.git/');
      continue;
    }
    if (!cmd.startsWith('git ')) {
      logs.push(`$ ${cmd}\nComando simulado desconhecido. Experimenta: pwd, ls, cat .gitignore, git init, git status, git add, git commit, git switch, git merge, git log, git remote, git push.`);
      continue;
    }
    if (!s.initialized) {
      logs.push(`$ ${cmd}\nfatal: não existe repositório git aqui. Corre primeiro: git init`);
      continue;
    }

    if (cmd === 'git status') {
      const visibleUntracked = s.untracked.filter((f) => !isIgnored(f, s.gitignore));
      const parts = [`$ git status`, `No ramo ${s.currentBranch}`];
      if (s.staged.length) {
        parts.push(`Alterações preparadas para commit (staged):\n  ` + s.staged.join('\n  '));
      }
      if (s.modified.length) {
        parts.push(`Alterações por preparar (not staged):\n  ` + s.modified.join('\n  '));
      }
      if (visibleUntracked.length) {
        parts.push(`Ficheiros não seguidos (untracked):\n  ` + visibleUntracked.join('\n  '));
      }
      if (!s.staged.length && !s.modified.length && !visibleUntracked.length) {
        parts.push('Árvore de trabalho limpa (nada para fazer commit).');
      }
      logs.push(parts.join('\n\n'));
    } else if (cmd === 'git diff') {
      logs.push(
        `$ git diff\n--- a/exercicios/semana03_variaveis.py\n+++ b/exercicios/semana03_variaveis.py\n-preco_pao = None\n+preco_pao = 0.25`,
      );
    } else if (cmd.startsWith('git add ')) {
      const target = cmd.slice('git add '.length).trim();
      const visibleUntracked = s.untracked.filter((f) => !isIgnored(f, s.gitignore));
      if (target === '.' || target === '-A') {
        const toStage = [...s.modified, ...visibleUntracked];
        for (const f of toStage) {
          if (!s.staged.includes(f)) s.staged.push(f);
        }
        s.modified = [];
        s.untracked = s.untracked.filter((f) => isIgnored(f, s.gitignore));
        logs.push(`$ ${cmd}\n${toStage.length} ficheiro(s) adicionados à área de preparação (ficheiros no .gitignore foram protegidos).`);
      } else {
        if (isIgnored(target, s.gitignore)) {
          logs.push(`$ ${cmd}\nAviso: "${target}" está protegido pelo .gitignore e não foi adicionado.`);
        } else {
          if (!s.staged.includes(target)) s.staged.push(target);
          s.modified = s.modified.filter((f) => f !== target);
          s.untracked = s.untracked.filter((f) => f !== target);
          logs.push(`$ ${cmd}\nFicheiro "${target}" preparado para commit.`);
        }
      }
    } else if (cmd.startsWith('git commit')) {
      const mMatch = /-m\s+["']([^"']+)["']/.exec(cmd);
      if (!mMatch) {
        logs.push(`$ ${cmd}\nErro: indica uma mensagem clara com -m "Mensagem no presente"`);
      } else if (!s.staged.length) {
        logs.push(`$ ${cmd}\nNada preparado para commit. Usa git add primeiro.`);
      } else {
        const hash = Math.abs(
          (s.commits.length + 1) * 7919 + mMatch[1].split('').reduce((a, c) => a + c.charCodeAt(0), 0),
        )
          .toString(16)
          .padStart(7, '0')
          .slice(0, 7);
        s.commits.unshift({
          hash,
          branch: s.currentBranch,
          message: mMatch[1],
          files: [...s.staged],
        });
        const count = s.staged.length;
        s.staged = [];
        logs.push(`$ ${cmd}\n[${s.currentBranch} ${hash}] ${mMatch[1]} (${count} ficheiro(s) gravados)`);
      }
    } else if (cmd === 'git branch') {
      logs.push(`$ git branch\n` + s.branches.map((b) => (b === s.currentBranch ? `* ${b}` : `  ${b}`)).join('\n'));
    } else if (cmd.startsWith('git switch -c ') || cmd.startsWith('git checkout -b ')) {
      const name = cmd.split(/\s+/).pop()!;
      if (!s.branches.includes(name)) s.branches.push(name);
      s.currentBranch = name;
      logs.push(`$ ${cmd}\nCriado e ativado o novo ramo '${name}'.`);
    } else if (cmd.startsWith('git switch ') || cmd.startsWith('git checkout ')) {
      const name = cmd.split(/\s+/).pop()!;
      if (!s.branches.includes(name)) {
        logs.push(`$ ${cmd}\nfatal: ramo '${name}' não existe. Usa git switch -c ${name} para criar.`);
      } else {
        s.currentBranch = name;
        logs.push(`$ ${cmd}\nMudou para o ramo '${name}'.`);
      }
    } else if (cmd.startsWith('git merge ')) {
      const source = cmd.slice('git merge '.length).trim();
      if (!s.branches.includes(source)) {
        logs.push(`$ ${cmd}\nfatal: ramo '${source}' não encontrado.`);
      } else {
        logs.push(`$ ${cmd}\nFast-forward: alterações de '${source}' integradas com sucesso em '${s.currentBranch}'.`);
      }
    } else if (cmd.startsWith('git log')) {
      if (!s.commits.length) {
        logs.push(`$ ${cmd}\nfatal: o ramo '${s.currentBranch}' ainda não tem commits.`);
      } else {
        logs.push(`$ ${cmd}\n` + s.commits.map((c) => `${c.hash} (${c.branch}) ${c.message}`).join('\n'));
      }
    } else if (cmd.startsWith('git remote add origin ')) {
      s.remoteUrl = cmd.slice('git remote add origin '.length).trim();
      logs.push(`$ ${cmd}\nRemoto 'origin' configurado para ${s.remoteUrl}`);
    } else if (cmd.startsWith('git push')) {
      if (!s.remoteUrl) {
        s.remoteUrl = 'https://github.com/analista/mercearia-do-bairro.git';
      }
      if (!s.commits.length) {
        logs.push(`$ ${cmd}\nerro: faz pelo menos um commit antes de enviar para o GitHub.`);
      } else {
        if (!s.pushedBranches.includes(s.currentBranch)) s.pushedBranches.push(s.currentBranch);
        logs.push(`$ ${cmd}\nA enviar objetos: 100% concluído.\nPara ${s.remoteUrl}\n * [new branch] ${s.currentBranch} -> ${s.currentBranch}`);
      }
    } else {
      logs.push(`$ ${cmd}\nSubcomando git não suportado no simulador.`);
    }
  }

  return { output: logs.join('\n\n'), nextState: s };
}
