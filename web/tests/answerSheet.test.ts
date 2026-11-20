import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { loadPyodide } from 'pyodide';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { allTracks } from '../src/data/curriculum';
import {
  ANSWER_SHEETS,
  buildAnswerSheetCode,
  isAnswerSheetMode,
  normalizePtNumberInput,
  parseAnswerSheetDraft,
  renderAnswerSheetPanel,
} from '../src/ui/answerSheetPanel';

const fetchReal = globalThis.fetch;
vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
  const texto = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
  if (texto.startsWith('/dados/')) {
    return new Response(readFileSync(new URL(`../../dados/${texto.slice(7)}`, import.meta.url), 'utf-8'));
  }
  return fetchReal(url, init);
});

const { runPythonCode, setPyodideLoaderForTests } = await import('../src/engines/pythonEngine');
const pyodideDir = dirname(createRequire(import.meta.url).resolve('pyodide/package.json')) + '/';

beforeAll(() => {
  setPyodideLoaderForTests(() => loadPyodide({ indexURL: pyodideDir }));
});

describe('folha de respostas em formulário (Excel & Power BI)', () => {
  it('ativa o formulário apenas no desafio principal de bi-10, bi-20, bi-21 e bi-22', () => {
    for (const id of [
      'bi-10-pratica-excel-powerbi',
      'bi-20-excel-powerquery-limpeza',
      'bi-21-excel-dinamicas-procx',
      'bi-22-powerbi-dax-relatorio',
    ]) {
      expect(isAnswerSheetMode(id, 'challenge', 0)).toBe(true);
      expect(isAnswerSheetMode(id, 'challenge', 1)).toBe(false);
      expect(isAnswerSheetMode(id, 'example', 0)).toBe(false);
    }
    expect(isAnswerSheetMode('py-01-sintaxe', 'challenge', 0)).toBe(false);
  });

  it('normaliza números copiados do Excel PT (€, %, vírgula decimal e separador de milhares)', () => {
    expect(normalizePtNumberInput('26 902,89 €')).toBe('26902.89');
    expect(normalizePtNumberInput('26.902,89')).toBe('26902.89');
    expect(normalizePtNumberInput('26,902.89')).toBe('26902.89');
    expect(normalizePtNumberInput('9,93%')).toBe('9.93');
    expect(normalizePtNumberInput('632')).toBe('632');
  });

  it('renderiza campos sem None quando recebe o starterCode e escapa HTML', () => {
    const html = renderAnswerSheetPanel(
      'bi-10-pratica-excel-powerbi',
      'total_faturacao = None\ncidade_top = "<script>x</script>"',
    );
    expect(html).toContain('data-answer-var="total_faturacao"');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).not.toContain('value="None"');
  });

  it.each(Object.keys(ANSWER_SHEETS))(
    '%s: as respostas do formulário passam todos os checks no Pyodide após round-trip',
    async (lessonId) => {
      const lesson = allTracks.flatMap((t) => t.lessons).find((l) => l.id === lessonId)!;
      const ch = lesson.pythonChallenge!;
      const values = parseAnswerSheetDraft(lessonId, ch.solutionCode);
      const generatedPython = buildAnswerSheetCode(lessonId, values);
      const res = await runPythonCode(generatedPython, ch.checks, undefined, lesson.ficheirosDados);
      expect(res.error).toBeUndefined();
      expect(res.checks?.every((c) => c.passed)).toBe(true);
    },
    60_000,
  );
});
