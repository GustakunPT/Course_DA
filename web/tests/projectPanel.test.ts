import { describe, expect, it } from 'vitest';
import type { Lesson } from '../src/data/types';
import {
  chaveLista,
  ESTADO_PROJETO,
  etapaProjetoCompleta,
  linkGithubValido,
  mensagemLink,
  renderPainelProjeto,
} from '../src/ui/projectPanel';

const etapa = {
  id: 'pf-05-publicar',
  engine: 'projeto',
  projectSpec: {
    entregaveis: ['README'],
    lista: ['a', 'b'],
    grelha: [{ criterio: 'c', bom: 'b', aMelhorar: 'm' }],
    pedirLinkGithub: true,
  },
} as unknown as Lesson;

describe('projectPanel', () => {
  it.each([
    ['https://github.com/ana/projeto', true],
    ['https://github.com/ana/projeto/', true],
    ['  https://github.com/ana/meu.projeto_1  ', true],
    ['http://github.com/ana/projeto', false],
    ['https://github.com/ana', false],
    ['https://www.github.com/ana/p', false],
    ['https://gitlab.com/ana/p', false],
    ['github.com/ana/p', false],
    ['', false],
  ])('linkGithubValido(%j) → %s', (url, ok) => expect(linkGithubValido(url)).toBe(ok));

  it('a etapa só fica completa com a lista toda marcada e, se pedido, um link válido', () => {
    const feitos = new Set([chaveLista(etapa.id, 0)]);
    expect(etapaProjetoCompleta(etapa, feitos, 'https://github.com/ana/p')).toBe(false);
    feitos.add(chaveLista(etapa.id, 1));
    expect(etapaProjetoCompleta(etapa, feitos, 'https://gitlab.com/ana/p')).toBe(false);
    expect(etapaProjetoCompleta(etapa, feitos, 'https://github.com/ana/p')).toBe(true);
  });

  it('as chaves cabem nos 80 caracteres da sincronização', () => {
    expect(chaveLista('pf-04-analisar-recomendar', 12).length).toBeLessThanOrEqual(80);
  });

  it('o painel marca os itens feitos, mostra a grelha e escapa o texto', () => {
    const html = renderPainelProjeto(
      { ...etapa, projectSpec: { ...etapa.projectSpec!, lista: ['<b>x</b>', 'y'] } } as Lesson,
      new Set([chaveLista(etapa.id, 1)]),
      '',
      false,
    );
    expect(html.match(/data-lista-item="\d+"/g)).toHaveLength(2);
    expect(html).toMatch(/data-lista-item="1"[^>]*checked/);
    expect(html).not.toMatch(/data-lista-item="0"[^>]*checked/);
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('data-link-github');
    expect(html).toContain('as marcas são um compromisso teu');
  });

  it('o estado "não corrigido" só aparece quando a etapa está concluída', () => {
    const feitos = new Set<string>();
    const porFazer = renderPainelProjeto(etapa, feitos, '', false);
    expect(porFazer).not.toContain(ESTADO_PROJETO);
    expect(porFazer).toContain('Por fazer: marca cada ponto quando o tiveres feito.');
    const feita = renderPainelProjeto(etapa, feitos, '', true);
    expect(feita).toContain(ESTADO_PROJETO);
    expect(feita).not.toContain('Por fazer:');
  });

  it('a mensagem do link válido só fala do formato, sem parecer validação', () => {
    expect(mensagemLink('https://github.com/ana/p')).toEqual({ texto: 'Formato do link certo', classe: 'ok' });
    expect(mensagemLink('https://github.com/ana/p').texto).not.toMatch(/válido/i);
    expect(mensagemLink('xx').classe).toBe('erro');
  });
});
