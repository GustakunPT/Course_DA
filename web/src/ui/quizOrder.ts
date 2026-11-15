// Ordem em que as opções de um quiz aparecem no ecrã.
// É baralhada, mas sempre igual para a mesma etapa: assim a resposta certa não fica
// sempre na mesma posição e o progresso guardado (que usa o índice original) continua válido.

function hashTexto(texto: string): number {
  // FNV-1a de 32 bits
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function gerador(semente: number): () => number {
  // mulberry32
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Devolve os índices originais das opções pela ordem em que devem ser mostrados. */
export function quizDisplayOrder(lessonId: string, optionCount: number): number[] {
  const ordem = Array.from({ length: optionCount }, (_, i) => i);
  const aleatorio = gerador(hashTexto(lessonId));
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return ordem;
}
