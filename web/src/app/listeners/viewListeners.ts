// Filtros do Explorador CSV e pesquisa da Referência Rápida.

import { renderApp } from '../rerender';
import { state } from '../store';

function onChange<T extends HTMLSelectElement | HTMLInputElement>(el: T | null, handler: (el: T) => void): void {
  el?.addEventListener('change', () => handler(el));
}

export function attachViewListeners(): void {
  onChange(document.querySelector<HTMLSelectElement>('select[data-filter="serie"]'), (sel) => {
    state.explorerSerie = sel.value === 'base' ? 'base' : 'sazonal';
    renderApp();
  });
  onChange(document.querySelector<HTMLSelectElement>('select[data-filter="cidade"]'), (sel) => {
    state.explorerCidade = sel.value;
    renderApp();
  });
  onChange(document.querySelector<HTMLSelectElement>('select[data-filter="categoria"]'), (sel) => {
    state.explorerCategoria = sel.value;
    renderApp();
  });

  const refSearch = document.getElementById('ref-search') as HTMLInputElement | null;
  refSearch?.addEventListener('input', () => {
    // Pesquisa ao escrever: redesenha e devolve o foco e o cursor ao campo novo.
    const pos = refSearch.selectionStart ?? refSearch.value.length;
    state.refQuery = refSearch.value;
    renderApp();
    const nextInput = document.getElementById('ref-search') as HTMLInputElement | null;
    if (nextInput) {
      nextInput.focus();
      nextInput.setSelectionRange(pos, pos);
    }
  });

  onChange(document.getElementById('ref-cat') as HTMLSelectElement | null, (sel) => {
    state.refCategory = sel.value;
    renderApp();
  });
}
