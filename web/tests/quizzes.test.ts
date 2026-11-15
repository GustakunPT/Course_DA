// Garante que os quizzes medem compreensão e não se adivinham pela posição ou pelo tamanho.
import { describe, expect, it } from 'vitest';
import { allTracks } from '../src/data/curriculum';
import { quizDisplayOrder } from '../src/ui/quizOrder';

const licoes = allTracks.flatMap((t) => t.lessons);

describe('quizzes', () => {
  it('cada quiz tem 4 opções diferentes', () => {
    for (const l of licoes) {
      expect(l.quiz.options, l.id).toHaveLength(4);
      expect(new Set(l.quiz.options).size, l.id).toBe(4);
    }
  });

  it('a ordem mostrada é uma permutação estável', () => {
    for (const l of licoes) {
      const ordem = quizDisplayOrder(l.id, l.quiz.options.length);
      expect([...ordem].sort()).toEqual([0, 1, 2, 3]);
      expect(quizDisplayOrder(l.id, l.quiz.options.length)).toEqual(ordem);
    }
  });

  it('a resposta certa aparece espalhada pelas 4 posições', () => {
    const contagem = [0, 0, 0, 0];
    for (const l of licoes) {
      contagem[quizDisplayOrder(l.id, 4).indexOf(l.quiz.correctIndex)]++;
    }
    for (const n of contagem) {
      expect(n).toBeGreaterThanOrEqual(6);
      expect(n).toBeLessThanOrEqual(18);
    }
  });

  it('a resposta certa raramente é a opção mais longa', () => {
    const maisLonga = licoes.filter((l) => {
      const certa = l.quiz.options[l.quiz.correctIndex].length;
      return l.quiz.options.every((o, i) => i === l.quiz.correctIndex || o.length < certa);
    });
    expect(maisLonga.length, maisLonga.map((l) => l.id).join(', ')).toBeLessThanOrEqual(Math.ceil(licoes.length * 0.3));
  });
});
