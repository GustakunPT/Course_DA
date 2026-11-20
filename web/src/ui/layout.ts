// Tamanhos dos painéis redimensionáveis (guardados no navegador).

export const STORAGE_LAYOUT_KEY = 'mercearia_academia_layout_v1';

export interface LayoutPrefs {
  sidebarWidth: number;
  lessonRatio: number;
  editorHeight: number;
  sidebarCollapsed: boolean;
}

/** Limites de cada painel: usados ao carregar, ao arrastar, com o teclado e no ARIA das divisórias. */
export const LAYOUT_LIMITS = {
  sidebarWidth: { min: 180, max: 420 },
  lessonRatio: { min: 30, max: 70 },
  editorHeight: { min: 140, max: 640 },
} as const;

export type SplitterKind = keyof typeof LAYOUT_LIMITS;

export function clampLayout(kind: SplitterKind, value: number): number {
  const { min, max } = LAYOUT_LIMITS[kind];
  return Math.min(max, Math.max(min, value));
}

/** Texto que o leitor de ecrã anuncia para o valor atual de cada divisória. */
export function splitterValueText(kind: SplitterKind, value: number): string {
  if (kind === 'lessonRatio') return `Lição ${value}%, editor ${100 - value}%`;
  if (kind === 'sidebarWidth') return `Índice com ${value} píxeis de largura`;
  return `Editor com ${value} píxeis de altura`;
}

/** Atributos ARIA de uma divisória que se move com o teclado (role="separator" com foco). */
export function splitterAriaAttrs(kind: SplitterKind, value: number): string {
  const { min, max } = LAYOUT_LIMITS[kind];
  return `aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${value}" aria-valuetext="${splitterValueText(kind, value)}"`;
}

export const DEFAULT_LAYOUT: LayoutPrefs = {
  sidebarWidth: 256,
  lessonRatio: 48,
  editorHeight: 250,
  sidebarCollapsed: false,
};

export function loadSavedLayout(): LayoutPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_LAYOUT_KEY);
    if (!raw) return { ...DEFAULT_LAYOUT };
    const parsed = JSON.parse(raw);
    return {
      sidebarWidth: clampLayout('sidebarWidth', Number(parsed.sidebarWidth) || DEFAULT_LAYOUT.sidebarWidth),
      lessonRatio: clampLayout('lessonRatio', Number(parsed.lessonRatio) || DEFAULT_LAYOUT.lessonRatio),
      editorHeight: clampLayout('editorHeight', Number(parsed.editorHeight) || DEFAULT_LAYOUT.editorHeight),
      sidebarCollapsed: Boolean(parsed.sidebarCollapsed),
    };
  } catch {
    return { ...DEFAULT_LAYOUT };
  }
}

export function saveLayoutPrefs(prefs: LayoutPrefs): void {
  try {
    localStorage.setItem(STORAGE_LAYOUT_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
}
