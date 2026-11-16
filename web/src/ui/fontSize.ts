// Tamanho do texto da Academia (escolha guardada no navegador).
// Os tamanhos da app estão em rem, por isso basta mudar o tamanho base da página (html) para todo
// o texto crescer ou encolher em proporção. Usa-se uma percentagem para respeitar o tamanho que o
// aluno já escolheu no próprio browser.
import { escapeHtml } from './html';

export type FontSizeId =
  | 'minimo'
  | 'minusculo'
  | 'muito-pequeno'
  | 'compacto'
  | 'pequeno'
  | 'normal'
  | 'grande'
  | 'muito-grande'
  | 'enorme';

export interface FontSizeOption {
  id: FontSizeId;
  label: string;
  percent: number;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'minimo', label: 'Mínimo', percent: 70 },
  { id: 'minusculo', label: 'Minúsculo', percent: 75 },
  { id: 'muito-pequeno', label: 'Muito pequeno', percent: 80 },
  { id: 'compacto', label: 'Compacto', percent: 85 },
  { id: 'pequeno', label: 'Pequeno', percent: 90 },
  { id: 'normal', label: 'Normal', percent: 100 },
  { id: 'grande', label: 'Grande', percent: 112.5 },
  { id: 'muito-grande', label: 'Muito grande', percent: 125 },
  { id: 'enorme', label: 'Enorme', percent: 140 },
];

/** A opção Normal (100%), usada quando a escolha não é reconhecida. */
export const NORMAL = FONT_SIZE_OPTIONS.find((o) => o.id === 'normal')!;

const STORAGE_FONT_KEY = 'mercearia_academia_fonte_v1';

export function loadSavedFontSize(): FontSizeId {
  try {
    const saved = localStorage.getItem(STORAGE_FONT_KEY);
    return FONT_SIZE_OPTIONS.find((o) => o.id === saved)?.id ?? 'normal';
  } catch {
    return 'normal';
  }
}

export function saveFontSize(id: FontSizeId): void {
  try {
    localStorage.setItem(STORAGE_FONT_KEY, id);
  } catch {
    // Sem armazenamento: o tamanho vale só para esta visita.
  }
}

/** Aplica o tamanho à página inteira. */
export function applyFontSize(id: FontSizeId): void {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.id === id) ?? NORMAL;
  document.documentElement.style.fontSize = opt.percent === 100 ? '' : `${opt.percent}%`;
}

/** Menu que abre por baixo do botão "Aa"; cada opção aparece no próprio tamanho. */
export function renderFontSizeMenu(current: FontSizeId): string {
  return `
    <div class="font-menu" role="menu" aria-label="Tamanho do texto">
      ${FONT_SIZE_OPTIONS.map(
        (o) => `
        <button type="button" role="menuitemradio" class="font-menu-item" data-action="select-font-size"
          data-font-size="${o.id}" aria-checked="${o.id === current}">
          <span class="font-menu-sample" style="font-size:${o.percent}%">Aa</span>
          <span>${escapeHtml(o.label)}</span>
          <span class="font-menu-pct measured">${o.percent}%</span>
        </button>`,
      ).join('')}
    </div>`;
}
