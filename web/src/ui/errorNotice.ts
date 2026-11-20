// Aviso para erros inesperados da própria app (não do código do aluno, que corre num Worker e
// aparece no painel de resultado). Sem isto, uma exceção num clique falhava em silêncio: o botão
// parecia não fazer nada. O aviso vive fora de #app para o próximo render não o apagar.

const AVISO_ID = 'aviso-erro-app';

/** Erros que não vêm da app ou que o browser lança sem consequências para o aluno. */
const RUIDO = [/ResizeObserver loop/i, /^Script error\.?$/i, /AbortError/i, /The user aborted a request/i];

export interface ErroDaApp {
  mensagem: string;
  /** Ficheiro onde o erro nasceu, quando o browser o diz (erros de extensões vêm de outra origem). */
  ficheiro?: string;
}

/** Decide se o erro merece aviso: tem de vir desta origem e não ser ruído conhecido. */
export function deveAvisar(erro: ErroDaApp, origem: string = location.origin): boolean {
  if (RUIDO.some((re) => re.test(erro.mensagem))) return false;
  if (erro.ficheiro && !erro.ficheiro.startsWith(origem)) return false;
  return true;
}

/** Mostra o aviso (uma só vez, mesmo que cheguem vários erros seguidos). */
export function mostrarAvisoDeErro(antesDeRecarregar: () => void = () => {}): void {
  if (document.getElementById(AVISO_ID)) return;
  const aviso = document.createElement('div');
  aviso.id = AVISO_ID;
  aviso.className = 'aviso-erro';
  aviso.setAttribute('role', 'alert');
  aviso.innerHTML = `
    <p><strong>Algo correu mal nesta página.</strong> O teu progresso e o código que escreveste estão guardados.</p>
    <div class="aviso-erro-acoes">
      <button type="button" class="btn btn-primary" data-aviso="recarregar">Recarregar a página</button>
      <button type="button" class="btn" data-aviso="fechar">Continuar</button>
    </div>`;
  aviso.addEventListener('click', (ev) => {
    const botao = (ev.target as HTMLElement).closest<HTMLElement>('[data-aviso]');
    if (botao?.dataset.aviso === 'recarregar') {
      antesDeRecarregar();
      location.reload();
    } else if (botao?.dataset.aviso === 'fechar') {
      aviso.remove();
    }
  });
  document.body.append(aviso);
  aviso.querySelector<HTMLElement>('[data-aviso="recarregar"]')?.focus({ preventScroll: true });
}

/** Liga os avisos aos erros da janela e às promessas rejeitadas sem tratamento. */
export function installErrorNotice(antesDeRecarregar: () => void): void {
  window.addEventListener('error', (ev) => {
    // Falhas a carregar <img>/<script> também chegam aqui, mas sem ev.error nem mensagem útil.
    if (!(ev instanceof ErrorEvent)) return;
    if (deveAvisar({ mensagem: ev.message ?? '', ficheiro: ev.filename || undefined })) {
      mostrarAvisoDeErro(antesDeRecarregar);
    }
  });
  window.addEventListener('unhandledrejection', (ev) => {
    const motivo: unknown = ev.reason;
    const mensagem = motivo instanceof Error ? `${motivo.name}: ${motivo.message}` : String(motivo);
    if (deveAvisar({ mensagem })) mostrarAvisoDeErro(antesDeRecarregar);
  });
}
