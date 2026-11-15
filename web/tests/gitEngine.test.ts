import { describe, expect, it } from 'vitest';
import { createInitialGitState, runGitSimulator } from '../src/engines/gitEngine';

const run = (script: string, state = createInitialGitState()) => runGitSimulator(state, script);

describe('simulador Git', () => {
  it('exige git init antes de outros comandos', () => {
    expect(run('git status').output).toContain('git init');
  });

  it('git add . respeita o .gitignore', () => {
    const { nextState } = run('git init\ngit add .');
    expect(nextState.staged).toContain('src/caixa.py');
    expect(nextState.staged).not.toContain('.env');
    expect(nextState.staged).not.toContain('dados_clientes_privados.xlsx');
  });

  it('recusa adicionar um ficheiro ignorado', () => {
    const { nextState, output } = run('git init\ngit add .env');
    expect(nextState.staged).not.toContain('.env');
    expect(output).toContain('protegido');
  });

  it('commit sem mensagem dá erro e com mensagem grava', () => {
    expect(run('git init\ngit add .\ngit commit').nextState.commits).toHaveLength(0);
    const { nextState } = run('git init\ngit add .\ngit commit -m "Primeiro commit"');
    expect(nextState.commits).toHaveLength(1);
    expect(nextState.commits[0].message).toBe('Primeiro commit');
    expect(nextState.staged).toEqual([]);
  });

  it('push sem commits dá erro e com commits marca o ramo', () => {
    expect(run('git init\ngit push').output).toContain('pelo menos um commit');
    const { nextState } = run('git init\ngit add .\ngit commit -m "x"\ngit push -u origin main');
    expect(nextState.pushedBranches).toEqual(['main']);
  });

  it('cria e muda de ramo', () => {
    const { nextState } = run('git init\ngit switch -c limpeza\ngit switch main');
    expect(nextState.branches).toEqual(['main', 'limpeza']);
    expect(nextState.currentBranch).toBe('main');
  });

  it('não altera o estado original', () => {
    const inicial = createInitialGitState();
    run('git init\ngit add .', inicial);
    expect(inicial.initialized).toBe(false);
  });
});
