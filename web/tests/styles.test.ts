// O app.css só junta as partes de src/styles/partes/. Estes testes garantem que nenhuma parte
// fica esquecida (as regras dela deixariam de chegar ao ecrã) nem é importada duas vezes.
import { basename, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PASTA_ESTILOS, importsDe, lerCssDaApp, partesDoCss } from './helpers/css';

describe('CSS da app', () => {
  const importadas = importsDe(resolve(PASTA_ESTILOS, 'app.css'));

  it('o app.css importa cada parte uma vez', () => {
    const partes = importadas.filter((f) => f.includes('partes'));
    expect(new Set(partes).size).toBe(partes.length);
    expect([...partes].sort()).toEqual([...partesDoCss()].sort());
  });

  it('os tokens e a base vêm antes das partes (as partes usam as variáveis)', () => {
    const nomes = importadas.map((f) => basename(f));
    expect(nomes.slice(0, 2)).toEqual(['tokens.css', 'base.css']);
  });

  it('o CSS junto não tem @import por resolver', () => {
    expect(lerCssDaApp()).not.toMatch(/@import/);
  });
});
