// Ponte para redesenhar a app sem dependências circulares: qualquer módulo chama renderApp()
// e o main.ts liga a implementação real (shell.ts) no arranque.

let renderer: () => void = () => {};

export function setRenderer(fn: () => void): void {
  renderer = fn;
}

export function renderApp(): void {
  renderer();
}
