// O README e a descrição da página repetem o tamanho do curso. Este teste falha quando se
// acrescenta ou tira uma etapa e esses textos ficam com o número antigo.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOTAL_LESSONS_COUNT, TRACK_INDEX } from '../src/data/trackIndex';

const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf-8');
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf-8');

/** Números seguidos de "etapas" que falam do curso inteiro (os de uma trilha são pequenos). */
function totaisDeEtapas(texto: string): number[] {
  return [...texto.matchAll(/(\d+) etapas/g)].map((m) => Number(m[1])).filter((n) => n >= 30);
}

describe('documentação ao dia com o currículo', () => {
  it('o README diz o número certo de etapas', () => {
    const totais = totaisDeEtapas(readme);
    expect(totais.length).toBeGreaterThan(0);
    expect(new Set(totais)).toEqual(new Set([TOTAL_LESSONS_COUNT]));
  });

  it('o README diz o número certo de trilhas', () => {
    expect(readme).toContain(`${TRACK_INDEX.length} Trilhas`);
  });

  it('a descrição da página (Google e partilhas) diz o número certo de etapas e trilhas', () => {
    const descricoes = [
      ...indexHtml.matchAll(
        /<meta (?:name|property)="(?:description|og:description|twitter:description)" content="([^"]+)"/g,
      ),
    ];
    expect(descricoes.length).toBeGreaterThan(0);
    for (const [, texto] of descricoes) {
      expect(texto).toContain(`${TOTAL_LESSONS_COUNT} etapas em ${TRACK_INDEX.length} trilhas`);
    }
  });
});
