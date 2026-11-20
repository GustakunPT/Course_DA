// Peças da bancada partilhadas pela vista normal e pelo ecrã de escrita do telemóvel.

import type { EngineKind, Lesson } from '../data/types';
import { highlightCode, renderLineNumbers } from '../ui/codeEditor';
import { escapeHtml } from '../ui/html';
import { activeGitChallenge, activePythonChallenge, activeSqlChallenge } from './lessonContext';
import { state } from './store';

export function renderPracticeSwitcher(lesson: Lesson): string {
  const treinos: { title?: string }[] = lesson.practice ?? lesson.practiceSql ?? lesson.practiceGit ?? [];
  if (!treinos.length) return '';
  const feito = (i: number) =>
    i === 0 ? Boolean(state.completedLessons[lesson.id]) : state.practiceDone.has(`${lesson.id}:${i}`);
  const botoes = [lesson.pythonChallenge ?? lesson.sqlChallenge ?? lesson.gitChallenge, ...treinos].map((ch, i) => {
    const nome = i === 0 ? 'Desafio' : `Treino ${i}`;
    const dica = i === 0 ? 'Desafio principal da etapa (conta para o progresso)' : (ch?.title ?? nome);
    return `<button type="button" class="mode-btn" aria-pressed="${state.practiceIdx === i}" data-practice-idx="${i}" title="${escapeHtml(dica)}">${nome}${feito(i) ? ' ✓' : ''}</button>`;
  });
  return `<div class="practice-switcher" role="group" aria-label="Desafio principal e exercícios de treino">${botoes.join('')}</div>`;
}

/** Atalhos da barra de símbolos no telemóvel, de acordo com o motor da bancada. */
export function simbolosRapidos(engine: EngineKind): [string, string][] {
  if (engine === 'sql') {
    return [
      ['SELECT', 'SELECT '],
      ['FROM', 'FROM '],
      ['WHERE', 'WHERE '],
      ['GROUP BY', 'GROUP BY '],
      ['ORDER BY', 'ORDER BY '],
      ['AS', 'AS '],
      ['JOIN', 'JOIN '],
      ['ON', 'ON '],
      ['AND', 'AND '],
      ['OR', 'OR '],
      ['DESC', 'DESC'],
      ['LIMIT', 'LIMIT '],
      ['_', '_'],
      ["'", "'"],
      ['*', '*'],
      ['(', '('],
      [')', ')'],
      [',', ', '],
      ['=', '='],
      ['<', '<'],
      ['>', '>'],
      [';', ';'],
    ];
  }
  if (engine === 'git') {
    return [
      ['git ', 'git '],
      ['status', 'status'],
      ['add .', 'add .'],
      ['commit -m ""', 'commit -m ""'],
      ['log', 'log'],
      ['branch ', 'branch '],
      ['switch ', 'switch '],
      ['-c ', '-c '],
      ['merge ', 'merge '],
      ['"', '"'],
      ['.', '.'],
    ];
  }
  if (engine === 'projeto') return [];
  return [
    ['⇥ Tab', '    '],
    ['⇤ -Tab', '__OUTDENT__'],
    ['_', '_'],
    ["'", "'"],
    ['"', '"'],
    [':', ':'],
    ['(', '('],
    [')', ')'],
    ['[', '['],
    [']', ']'],
    ['{', '{'],
    ['}', '}'],
    ['=', '='],
    ['==', ' == '],
    ['!=', ' != '],
    ['.', '.'],
    [',', ', '],
    ['+', ' + '],
    ['-', ' - '],
    ['*', ' * '],
    ['/', ' / '],
    ['<', '<'],
    ['>', '>'],
    ['#', '# '],
  ];
}

/** Os botões dos símbolos rápidos (sem o contentor). */
export function renderSimbolosButtons(engine: EngineKind): string {
  return simbolosRapidos(engine)
    .map(
      ([texto, valor]) =>
        `<button type="button" class="sym-btn" data-insert="${escapeHtml(valor)}">${escapeHtml(texto)}</button>`,
    )
    .join('');
}

export function renderSimbolosBar(engine: EngineKind): string {
  return `
        <div class="mobile-symbols-bar" aria-label="Símbolos rápidos de código">
          ${renderSimbolosButtons(engine)}
        </div>
  `;
}

export function renderSchemaDrawer(): string {
  return `
    <details class="schema-drawer">
      <summary>Tabelas e colunas disponíveis (6)</summary>
      <ul class="schema-drawer-list">
        <li><code>vendas</code> (5 078): id, data, cliente_id, produto_id, produto, quantidade, preco</li>
        <li><code>vendas_sazonais</code> (7 031): id, data, cliente_id, produto_id, produto, quantidade, preco</li>
        <li><code>clientes</code> (120): id, nome, cidade</li>
        <li><code>produtos</code> (15): id, nome, categoria, preco_base</li>
        <li><code>vendas_sujas</code> (12): id, data, cliente_id, produto, quantidade, preco</li>
        <li><code>vendas_detalhe</code> (vista, 5 078): id, data, cliente_id, cliente, cidade, produto_id, produto, categoria, quantidade, preco, subtotal</li>
      </ul>
    </details>
  `;
}

/** Descrição do que o aluno tem de fazer no separador ativo da bancada. */
function descricaoDoEnunciado(lesson: Lesson): string {
  return state.wbTab === 'sqlfree'
    ? 'Consola SQLite aberta com todas as tabelas da Mercearia: produtos (15), clientes (120), vendas (5 078) e vendas_sujas (12).'
    : state.wbTab === 'example'
      ? 'Modo Experimenta (estilo W3Schools): altera os valores à vontade e executa para observar o comportamento.'
      : (activePythonChallenge(lesson)?.description ??
        activeSqlChallenge(lesson)?.description ??
        activeGitChallenge(lesson)?.description ??
        'Corre o código abaixo para validar esta etapa.');
}

/** Título e descrição do desafio (o seletor de treinos incluído). */
export function renderEnunciado(lesson: Lesson): string {
  const promptDescription = descricaoDoEnunciado(lesson);
  return `
        <div class="challenge-prompt">
          ${state.wbTab === 'challenge' ? renderPracticeSwitcher(lesson) : ''}
          <strong>${
            state.wbTab === 'challenge'
              ? state.practiceIdx > 0
                ? `Treino ${state.practiceIdx}: ${escapeHtml(activePythonChallenge(lesson)?.title ?? activeSqlChallenge(lesson)?.title ?? activeGitChallenge(lesson)?.title ?? '')}`
                : 'Enunciado do desafio'
              : state.wbTab === 'example'
                ? 'Laboratório Experimenta'
                : 'Consulta SQL livre'
          }</strong>
          <p>${escapeHtml(promptDescription)}</p>
        </div>
  `;
}

/** O editor de código (com os ids que os listeners procuram). Existe uma só vez no DOM. */
export function renderEditorShell(editorVal: string, engine: EngineKind): string {
  return `
        <div class="code-editor-shell" id="editor-shell">
          <div class="code-gutter" id="workbench-gutter" aria-hidden="true">${renderLineNumbers(editorVal)}</div>
          <div class="code-stage">
            <pre class="code-highlight-layer" id="workbench-highlight" aria-hidden="true"><code>${highlightCode(editorVal, engine)}</code></pre>
            <label for="workbench-editor" class="visually-hidden">Editor de código interativo</label>
            <textarea
              id="workbench-editor"
              name="code"
              class="code-editor"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              wrap="off"
            >${escapeHtml(editorVal)}</textarea>
          </div>
        </div>
  `;
}

/** Pistas progressivas do desafio guiado. */
export function renderPistas(lesson: Lesson): string {
  if (state.wbTab !== 'challenge' || state.hintLevel <= 0) return '';
  const hint1 =
    activeSqlChallenge(lesson)?.hint ??
    activeGitChallenge(lesson)?.hint ??
    activePythonChallenge(lesson)?.checks[0]?.hint ??
    lesson.beginnerSteps?.[0] ??
    'Revê a sintaxe na tabela de referência à esquerda.';
  const hint2 =
    lesson.beginnerSteps && lesson.beginnerSteps.length > 0
      ? lesson.beginnerSteps.join(' · ')
      : (lesson.commonPitfall ?? 'Compara a tua lógica passo a passo com o exemplo demonstrativo.');
  return `
                  <div class="hints-panel" role="region" aria-label="Pistas progressivas">
                    <div class="hint-card">
                      <strong>Pista 1:</strong> ${escapeHtml(hint1)}
                    </div>
                    ${
                      state.hintLevel >= 2
                        ? `<div class="hint-card is-step2">
                             <strong>Pista 2 (Passo a passo):</strong> ${escapeHtml(hint2)}
                           </div>`
                        : ''
                    }
                  </div>
                `;
}

/** Botão para pedir a pista seguinte (só no desafio guiado e enquanto houver pistas). */
export function renderNextHintButton(): string {
  if (state.wbTab !== 'challenge' || state.hintLevel >= 2) return '';
  return `<button type="button" class="btn" data-action="next-hint">${state.hintLevel === 0 ? 'Pedir pista (1/2)' : 'Mais uma pista (2/2)'}</button>`;
}
