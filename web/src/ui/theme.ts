// Temas visuais da Academia (escolha guardada no navegador).

export type ThemeId = 'terminal' | 'nordic' | 'glass' | 'graphite' | 'paper';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  tag: string;
  desc: string;
  swatches: [string, string, string];
  themeColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'terminal',
    label: 'Terminal Pro',
    tag: 'OLED · Mono',
    desc: 'Fundo OLED #05070A com grelha subtil, verde fósforo e tipografia monoespaçada.',
    swatches: ['#05070a', '#22c55e', '#38bdf8'],
    themeColor: '#05070a',
  },
  {
    id: 'nordic',
    label: 'Nordic Studio',
    tag: 'Claro · Editorial',
    desc: 'Branco limpo, bordas Slate e azul cobalto para leitura prolongada de dia.',
    swatches: ['#f8fafc', '#2563eb', '#d97706'],
    themeColor: '#f8fafc',
  },
  {
    id: 'glass',
    label: 'Glassmorphic',
    tag: 'Escuro · Vidro',
    desc: 'Gradiente noturno índigo/ciano com painéis translúcidos e cantos suaves.',
    swatches: ['#1e1b4b', '#6366f1', '#22d3ee'],
    themeColor: '#0f172a',
  },
  {
    id: 'graphite',
    label: 'Console Grafite',
    tag: 'Escuro · Âmbar',
    desc: 'Grafite quente com contraste equilibrado e destaque âmbar clássico.',
    swatches: ['#25272d', '#f5b942', '#70a5ff'],
    themeColor: '#1f2127',
  },
  {
    id: 'paper',
    label: 'Papel Editorial',
    tag: 'Claro · Quente',
    desc: 'Tom papel quente tipo livro técnico com baixo encandeamento.',
    swatches: ['#f6f4ef', '#a36a1b', '#2c68b8'],
    themeColor: '#f6f4ef',
  },
];

export const STORAGE_THEME_KEY = 'mercearia_academia_theme_v1';

export function loadSavedTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
    return 'terminal';
  } catch {
    return 'terminal';
  }
}

export function applyTheme(theme: ThemeId): void {
  if (theme === 'terminal') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  const opt = THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', opt.themeColor);
  }
  try {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  } catch {
    // Ignore
  }
}
