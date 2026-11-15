import type { EngineKind } from '../data/types';
import { escapeHtml } from './html';


const PY_KEYWORDS = new Set([
  'import', 'from', 'as', 'def', 'return', 'if', 'elif', 'else', 'for', 'in',
  'while', 'with', 'try', 'except', 'finally', 'pass', 'break', 'continue',
  'and', 'or', 'not', 'is', 'lambda', 'class', 'yield', 'raise', 'assert',
]);

const PY_CONSTANTS = new Set(['True', 'False', 'None']);

const PY_BUILTINS = new Set([
  'print', 'len', 'range', 'int', 'float', 'str', 'list', 'dict', 'set',
  'round', 'max', 'min', 'sum', 'sorted', 'open', 'type', 'isinstance', 'enumerate',
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING', 'ORDER',
  'LIMIT', 'ASC', 'DESC', 'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
  'IS', 'NULL', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'JOIN', 'ON',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'OVER', 'PARTITION',
  'CREATE', 'TABLE', 'DROP', 'INSERT', 'INTO', 'VALUES', 'PRIMARY', 'KEY',
]);

const SQL_FUNCTIONS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'NULLIF',
  'TRIM', 'SUBSTR', 'REPLACE', 'CAST', 'RANK', 'DENSE_RANK', 'ROW_NUMBER',
]);

const GIT_SUBCOMMANDS = new Set([
  'init', 'status', 'add', 'commit', 'switch', 'checkout', 'branch',
  'merge', 'log', 'diff', 'remote', 'push', 'pull', 'clone',
]);

function highlightPythonLine(line: string): string {
  const tokenRegex =
    /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?|([=+\-*/<>!&|%]+|[()[\]{}.,:])/gm;

  let lastIndex = 0;
  let out = '';
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      out += escapeHtml(line.slice(lastIndex, match.index));
    }
    const [full, comment, strLit, numLit, ident, callParen, punct] = match;

    if (comment !== undefined) {
      out += `<span class="tok-comment">${escapeHtml(comment)}</span>`;
    } else if (strLit !== undefined) {
      out += `<span class="tok-string">${escapeHtml(strLit)}</span>`;
    } else if (numLit !== undefined) {
      out += `<span class="tok-number">${escapeHtml(numLit)}</span>`;
    } else if (ident !== undefined) {
      let cls = 'tok-variable';
      if (PY_KEYWORDS.has(ident)) cls = 'tok-keyword';
      else if (PY_CONSTANTS.has(ident)) cls = 'tok-constant';
      else if (PY_BUILTINS.has(ident) || callParen) cls = 'tok-function';
      else if (ident === 'pd' || ident === 'csv' || ident === 'statistics' || ident === 'math') cls = 'tok-type';

      out += `<span class="${cls}">${escapeHtml(ident)}</span>`;
      if (callParen) {
        out += `<span class="tok-punctuation">${escapeHtml(callParen)}</span>`;
      }
    } else if (punct !== undefined) {
      out += `<span class="tok-punctuation">${escapeHtml(punct)}</span>`;
    } else {
      out += escapeHtml(full);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    out += escapeHtml(line.slice(lastIndex));
  }
  return out;
}

function highlightSqlLine(line: string): string {
  const tokenRegex =
    /(--.*$)|('(?:''|[^'])*'|"(?:\\.|[^"\\])*")|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?|([=<>!+\-*/(),.;]+)/gm;

  let lastIndex = 0;
  let out = '';
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      out += escapeHtml(line.slice(lastIndex, match.index));
    }
    const [full, comment, strLit, numLit, ident, callParen, punct] = match;

    if (comment !== undefined) {
      out += `<span class="tok-comment">${escapeHtml(comment)}</span>`;
    } else if (strLit !== undefined) {
      out += `<span class="tok-string">${escapeHtml(strLit)}</span>`;
    } else if (numLit !== undefined) {
      out += `<span class="tok-number">${escapeHtml(numLit)}</span>`;
    } else if (ident !== undefined) {
      const upper = ident.toUpperCase();
      let cls = 'tok-variable';
      if (SQL_FUNCTIONS.has(upper)) cls = 'tok-function';
      else if (SQL_KEYWORDS.has(upper)) cls = 'tok-keyword';
      else if (['vendas', 'produtos', 'clientes', 'vendas_sujas'].includes(ident.toLowerCase())) cls = 'tok-type';

      out += `<span class="${cls}">${escapeHtml(ident)}</span>`;
      if (callParen) {
        out += `<span class="tok-punctuation">${escapeHtml(callParen)}</span>`;
      }
    } else if (punct !== undefined) {
      out += `<span class="tok-punctuation">${escapeHtml(punct)}</span>`;
    } else {
      out += escapeHtml(full);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    out += escapeHtml(line.slice(lastIndex));
  }
  return out;
}

function highlightGitLine(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith('#')) {
    return `<span class="tok-comment">${escapeHtml(line)}</span>`;
  }
  const tokenRegex =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\s-[A-Za-z-]+|\bhttps?:\/\/\S+)|\b(git|pwd|ls|cat|echo)\b|\b([A-Za-z0-9_./-]+)\b/gm;

  let lastIndex = 0;
  let out = '';
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      out += escapeHtml(line.slice(lastIndex, match.index));
    }
    const [full, strLit, flagOrUrl, cmd, word] = match;
    if (strLit !== undefined) {
      out += `<span class="tok-string">${escapeHtml(strLit)}</span>`;
    } else if (flagOrUrl !== undefined) {
      out += `<span class="tok-constant">${escapeHtml(flagOrUrl)}</span>`;
    } else if (cmd !== undefined) {
      out += `<span class="tok-keyword">${escapeHtml(cmd)}</span>`;
    } else if (word !== undefined) {
      const cls = GIT_SUBCOMMANDS.has(word) ? 'tok-function' : 'tok-variable';
      out += `<span class="${cls}">${escapeHtml(word)}</span>`;
    } else {
      out += escapeHtml(full);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    out += escapeHtml(line.slice(lastIndex));
  }
  return out;
}

export function highlightCode(code: string, engine: EngineKind): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const rendered = lines.map((line) => {
    if (engine === 'sql') return highlightSqlLine(line);
    if (engine === 'git') return highlightGitLine(line);
    return highlightPythonLine(line);
  });
  return rendered.join('\n') + (code.endsWith('\n') ? ' ' : '');
}

export function renderLineNumbers(code: string): string {
  const count = Math.max(1, code.replace(/\r\n/g, '\n').split('\n').length);
  const nums: string[] = [];
  for (let i = 1; i <= count; i++) {
    nums.push(`<span>${i}</span>`);
  }
  return nums.join('');
}

/**
 * Formata código SQL, Python ou comandos Git ao estilo Prettier / Black
 */
export function formatCodePrettier(code: string, engine: EngineKind): string {
  const lines = code.replace(/\r\n/g, '\n').split('\n');

  if (engine === 'sql') {
    const kwUpper = [...SQL_KEYWORDS, ...SQL_FUNCTIONS];
    const formatted = lines.map((raw) => {
      const commentIdx = raw.indexOf('--');
      const codePart = commentIdx >= 0 ? raw.slice(0, commentIdx) : raw;
      const commentPart = commentIdx >= 0 ? raw.slice(commentIdx) : '';

      const upperized = codePart.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (word) => {
        const up = word.toUpperCase();
        return kwUpper.includes(up) ? up : word;
      });
      return (upperized.replace(/\s+$/, '') + (commentPart ? (upperized.trim() ? ' ' : '') + commentPart.trim() : '')).replace(/\s+$/, '');
    });
    return formatted.join('\n').trim() + '\n';
  }

  if (engine === 'git') {
    return (
      lines
        .map((l) => l.trim().replace(/\s+/g, ' '))
        .join('\n')
        .trim() + '\n'
    );
  }

  // Python Prettier / Black-style normalization (4-space indentation, clean trailing spaces, double quotes on simple literals)
  const pyOut = lines.map((raw) => {
    const trimmedRight = raw.replace(/\s+$/, '');
    const indentMatch = /^(\s*)/.exec(trimmedRight);
    const indent = (indentMatch?.[1] ?? '').replace(/\t/g, '    ');
    const rest = trimmedRight.slice(indentMatch?.[1].length ?? 0);
    return indent + rest;
  });

  return pyOut.join('\n').trim() + '\n';
}
