// Ecrã de escrita para telemóvel: em aparelhos de toque com ecrã estreito, o código escreve-se
// num ecrã inteiro por cima da lição, para o teclado não desarrumar a página.

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
  const estreito = window.matchMedia('(max-width: 48rem)');
  toque.addEventListener('change', aoMudar);
  estreito.addEventListener('change', aoMudar);
  return { toque: () => toque.matches, estreito: () => estreito.matches };
}
