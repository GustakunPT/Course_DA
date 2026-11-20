// Garante que os quizzes medem compreensão e não se adivinham pela posição ou pelo tamanho.
// Cada etapa tem a pergunta principal (quiz) e, nas trilhas SQL e Pandas, perguntas extra (moreQuiz).
import { describe, expect, it } from 'vitest';
import { allTracks } from '../src/data/curriculum';
import { quizDisplayOrder } from '../src/ui/quizOrder';

const licoes = allTracks.flatMap((t) => t.lessons);
// A chave é a mesma que a app usa para guardar a resposta e baralhar as opções.
const perguntas = licoes.flatMap((l) =>
  [l.quiz, ...(l.moreQuiz ?? [])].map((q, n) => ({ chave: n === 0 ? l.id : `${l.id}#${n + 1}`, q })),
);

describe('quizzes', () => {
  it('cada pergunta tem 4 opções diferentes e uma resposta válida', () => {
    for (const { chave, q } of perguntas) {
      expect(q.options, chave).toHaveLength(4);
      expect(new Set(q.options).size, chave).toBe(4);
      expect(q.correctIndex, chave).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex, chave).toBeLessThan(4);
      expect(q.explanation.trim(), chave).not.toBe('');
    }
  });

  it('as etapas de SQL e Pandas (fora as revisões) têm 3 perguntas', () => {
    for (const t of allTracks.filter((x) => x.id === 'sql' || x.id === 'pandas')) {
      for (const l of t.lessons.filter((x) => !x.id.includes('revisao'))) {
        expect(1 + (l.moreQuiz?.length ?? 0), l.id).toBe(3);
      }
    }
  });

  it('todas as perguntas extra pertencem a etapas que existem', async () => {
    const { moreQuiz } = await import('../src/data/moreQuiz');
    const ids = new Set(licoes.map((l) => l.id));
    for (const id of Object.keys(moreQuiz)) expect(ids.has(id), id).toBe(true);
  });

  it('a ordem mostrada é uma permutação estável', () => {
    for (const { chave, q } of perguntas) {
      const ordem = quizDisplayOrder(chave, q.options.length);
      expect([...ordem].sort()).toEqual([0, 1, 2, 3]);
      expect(quizDisplayOrder(chave, q.options.length)).toEqual(ordem);
    }
  });

  it('a resposta certa aparece espalhada pelas 4 posições', () => {
    const contagem = [0, 0, 0, 0];
    for (const { chave, q } of perguntas) contagem[quizDisplayOrder(chave, 4).indexOf(q.correctIndex)]++;
    // Cada posição deve ter entre 10% e 30% das respostas certas (o ideal são 25%).
    for (const n of contagem) {
      expect(n, contagem.join(', ')).toBeGreaterThanOrEqual(Math.floor(perguntas.length * 0.1));
      expect(n, contagem.join(', ')).toBeLessThanOrEqual(Math.ceil(perguntas.length * 0.3));
    }
  });

  it('a resposta certa raramente é a opção mais longa', () => {
    const maisLonga = perguntas.filter(({ q }) => {
      const certa = q.options[q.correctIndex].length;
      return q.options.every((o, i) => i === q.correctIndex || o.length < certa);
    });
    expect(maisLonga.length, maisLonga.map((p) => p.chave).join(', ')).toBeLessThanOrEqual(
      Math.ceil(perguntas.length * 0.3),
    );
  });
});
