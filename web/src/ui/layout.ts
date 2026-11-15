// Tamanhos dos painéis redimensionáveis (guardados no navegador).

export const STORAGE_LAYOUT_KEY = 'mercearia_academia_layout_v1';

export interface LayoutPrefs {
  sidebarWidth: number;
  lessonRatio: number;
  editorHeight: number;
  sidebarCollapsed: boolean;
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
      sidebarWidth: Math.min(420, Math.max(180, Number(parsed.sidebarWidth) || DEFAULT_LAYOUT.sidebarWidth)),
      lessonRatio: Math.min(72, Math.max(28, Number(parsed.lessonRatio) || DEFAULT_LAYOUT.lessonRatio)),
      editorHeight: Math.min(640, Math.max(140, Number(parsed.editorHeight) || DEFAULT_LAYOUT.editorHeight)),
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
