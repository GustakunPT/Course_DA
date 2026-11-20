// Ecrã de escrita para telemóvel: em aparelhos de toque com ecrã estreito, o código escreve-se
// num ecrã inteiro por cima da lição, para o teclado não desarrumar a página.
import { escapeHtml } from './html';

/** Separadores do ecrã de escrita, por esta ordem. */
export type AbaEscrita = 'enunciado' | 'codigo' | 'resultado';

const CHAVE_EDITOR_NORMAL = 'mercearia-editor-normal-v1';

/** O ecrã de escrita só serve aparelhos de toque estreitos, e só se o aluno não escolheu o editor normal. */
export function deveUsarEcraDeEscrita(c: { toque: boolean; estreito: boolean; preferirNormal: boolean }): boolean {
  return c.toque && c.estreito && !c.preferirNormal;
}

export function loadPreferirEditorNormal(): boolean {
  try {
    return localStorage.getItem(CHAVE_EDITOR_NORMAL) === '1';
  } catch {
    return false;
  }
}

export function savePreferirEditorNormal(valor: boolean): void {
  try {
    if (valor) localStorage.setItem(CHAVE_EDITOR_NORMAL, '1');
    else localStorage.removeItem(CHAVE_EDITOR_NORMAL);
  } catch {
    // Sem armazenamento (modo privado, por exemplo): a escolha vale só para esta visita.
  }
}

/**
 * Pergunta ao browser o que o ecrã consegue fazer (não se usa o user agent) e avisa quando muda,
 * por exemplo ao rodar o telemóvel.
 */
export function vigiarAparelho(aoMudar: () => void): { toque: () => boolean; estreito: () => boolean } {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { toque: () => false, estreito: () => false };
  }
  const toque = window.matchMedia('(pointer: coarse)');
  const estreito = window.matchMedia('(max-width: 768px), (max-height: 520px)');
  toque.addEventListener('change', aoMudar);
  estreito.addEventListener('change', aoMudar);
  return { toque: () => toque.matches, estreito: () => estreito.matches };
}

const ABAS: [AbaEscrita, string][] = [
  ['enunciado', 'Enunciado'],
  ['codigo', 'Código'],
  ['resultado', 'Resultado'],
];

/**
 * O ecrã de escrita. Os três painéis são sempre desenhados (os inativos ficam escondidos), para que
 * o editor exista uma só vez e mantenha o rascunho e o cursor ao mudar de separador.
 * enunciadoHtml, editorHtml e resultadoHtml chegam já escapados por quem chama.
 */
export function renderEcraDeEscrita(o: {
  aba: AbaEscrita;
  enunciadoHtml: string;
  editorHtml: string;
  resultadoHtml: string;
  simbolos: [string, string][];
  rotuloExecutar: string;
  aCorrer: boolean;
  acoesCodigoHtml?: string;
}): string {
  const separadores = ABAS.map(
    ([id, nome]) =>
      `<button type="button" role="tab" class="ecra-aba" aria-selected="${o.aba === id}" data-ecra-aba="${id}">${nome}</button>`,
  ).join('');
  const painel = (id: AbaEscrita, html: string) =>
    `<section class="ecra-painel" data-painel="${id}"${o.aba === id ? '' : ' hidden'}>${html}</section>`;
  const simbolos =
    o.aba === 'codigo'
      ? `<div class="ecra-simbolos" aria-label="Símbolos rápidos de código">${o.simbolos
          .map(
            ([texto, valor]) =>
              `<button type="button" class="sym-btn" data-insert="${escapeHtml(valor)}">${escapeHtml(texto)}</button>`,
          )
          .join('')}</div>`
      : '<div class="ecra-simbolos"></div>';
  return `
    <div class="ecra-escrita" role="dialog" aria-modal="true" aria-label="Escrever código">
      <header class="ecra-cabecalho">
        <div class="ecra-abas" role="tablist" aria-label="Partes do desafio">${separadores}</div>
        <button type="button" class="ecra-fechar" data-action="fechar-ecra-escrita" aria-label="Fechar">✕</button>
      </header>
      ${painel(
        'enunciado',
        `${o.enunciadoHtml}<button type="button" class="link-btn" data-action="usar-editor-normal">Usar o editor normal</button>`,
      )}
      ${painel(
        'codigo',
        `${o.acoesCodigoHtml ? `<div class="ecra-acoes-barra" role="toolbar" aria-label="Ações do editor">${o.acoesCodigoHtml}</div>` : ''}${o.editorHtml}`,
      )}
      ${painel('resultado', o.resultadoHtml)}
      <div class="ecra-barra">
        ${simbolos}
        ${o.aCorrer ? '<button type="button" class="btn btn-danger-outline" data-action="stop-code">Parar</button>' : ''}
        <button type="button" class="btn btn-primary" data-action="executar-ecra-escrita"${o.aCorrer ? ' disabled' : ''}>${escapeHtml(o.rotuloExecutar)}</button>
      </div>
    </div>`;
}

/** Na bancada do telemóvel, o código aparece só para ler; tocar abre o ecrã de escrita. */
export function renderPreviaCodigo(codigoRealcadoHtml: string): string {
  return `
    <button type="button" class="codigo-previa" data-action="abrir-ecra-escrita" aria-label="Escrever código">
      <pre><code>${codigoRealcadoHtml}</code></pre>
      <span class="codigo-previa-rotulo">Escrever código</span>
    </button>`;
}

/**
 * Faz o ecrã de escrita ocupar exatamente a área visível (a que o teclado deixa livre), através
 * das variáveis CSS --vv-altura e --vv-topo. Devolve a função que desliga os listeners.
 */
export function ligarAlturaVisivel(el: HTMLElement): () => void {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  if (!vv) return () => {};
  const aplicar = () => {
    el.style.setProperty('--vv-altura', `${vv.height}px`);
    el.style.setProperty('--vv-topo', `${vv.offsetTop}px`);
    el.style.setProperty('--vv-esq', `${vv.offsetLeft}px`);
    el.style.setProperty('--vv-largura', `${vv.width}px`);
  };
  aplicar();
  vv.addEventListener('resize', aplicar);
  vv.addEventListener('scroll', aplicar);
  return () => {
    vv.removeEventListener('resize', aplicar);
    vv.removeEventListener('scroll', aplicar);
  };
}
