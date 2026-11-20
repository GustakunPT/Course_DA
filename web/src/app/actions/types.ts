/** Reação a um clique num elemento com data-action. `el` é o elemento com o atributo. */
export type ActionHandler = (el: HTMLElement, ev: MouseEvent) => void;

export type ActionMap = Record<string, ActionHandler>;

/** Para os fundos dos modais: só fecha quando o clique foi no próprio fundo, não no conteúdo. */
export function onBackdrop(close: () => void): ActionHandler {
  return (el, ev) => {
    if (ev.target === el) close();
  };
}
