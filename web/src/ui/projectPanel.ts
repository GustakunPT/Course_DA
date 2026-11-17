import type { Lesson } from '../data/types';
import { escapeHtml } from './html';

export const ESTADO_PROJETO = 'Feito por ti, não corrigido';

const LINK_GITHUB = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\/?$/;

export function chaveLista(lessonId: string, n: number): string {
  return `${lessonId}#lista:${n}`;
}

export function linkGithubValido(url: string): boolean {
  return LINK_GITHUB.test(url.trim());
}

export function etapaProjetoCompleta(lesson: Lesson, feitos: Set<string>, link: string | undefined): boolean {
  const spec = lesson.projectSpec;
  if (!spec) return false;
  const listaFeita = spec.lista.every((_, n) => feitos.has(chaveLista(lesson.id, n)));
  if (!listaFeita) return false;
  return spec.pedirLinkGithub ? linkGithubValido(link ?? '') : true;
}

export function renderPainelProjeto(lesson: Lesson, feitos: Set<string>, link: string): string {
  const spec = lesson.projectSpec;
  if (!spec) return '';

  const entregaveis = spec.entregaveis.map((e) => `<li>${escapeHtml(e)}</li>`).join('');
  const lista = spec.lista
    .map((item, n) => {
      const marcado = feitos.has(chaveLista(lesson.id, n)) ? ' checked' : '';
      return `<li><label><input type="checkbox" data-lista-item="${n}"${marcado}> <span>${escapeHtml(item)}</span></label></li>`;
    })
    .join('');
  const grelha = spec.grelha
    .map(
      (l) =>
        `<tr><th scope="row">${escapeHtml(l.criterio)}</th><td>${escapeHtml(l.bom)}</td><td>${escapeHtml(l.aMelhorar)}</td></tr>`,
    )
    .join('');

  let linkHtml = '';
  if (spec.pedirLinkGithub) {
    const preenchido = link.trim() !== '';
    const valido = linkGithubValido(link);
    const msg = valido ? 'Link válido' : 'O link deve ser https://github.com/utilizador/repositório';
    linkHtml = `<div class="projeto-link">
  <label for="projeto-link-github">Link do teu repositório no GitHub</label>
  <input type="url" id="projeto-link-github" data-link-github value="${escapeHtml(link)}" placeholder="https://github.com/utilizador/repositório" autocomplete="off">
  <p class="projeto-link-msg ${valido ? 'ok' : preenchido ? 'erro' : ''}" data-link-msg>${msg}</p>
</div>`;
  }

  return `<section class="projeto-painel">
  <p class="projeto-aviso">Esta etapa faz-se no teu computador. A app não vê os teus ficheiros: as marcas são um compromisso teu.</p>
  <p class="projeto-estado">${escapeHtml(ESTADO_PROJETO)}</p>
  <h3>O que deves entregar</h3>
  <ul class="projeto-entregaveis">${entregaveis}</ul>
  <h3>Lista de verificação</h3>
  <ul class="projeto-lista">${lista}</ul>
  <h3>Grelha de autoavaliação</h3>
  <table class="projeto-grelha">
    <thead><tr><th scope="col">Critério</th><th scope="col">Bom</th><th scope="col">A melhorar</th></tr></thead>
    <tbody>${grelha}</tbody>
  </table>
  ${linkHtml}
</section>`;
}
