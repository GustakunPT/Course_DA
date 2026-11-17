import type { AppState } from './appState';

export type ModalKind = 'none' | 'guide' | 'progress' | 'theme' | 'diagnostic';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function getActiveModalKind(
  state: Pick<AppState, 'showGuideModal' | 'showProgressModal' | 'showThemeModal' | 'showDiagnosticModal'>,
): ModalKind {
  if (state.showGuideModal) return 'guide';
  if (state.showDiagnosticModal) return 'diagnostic';
  if (state.showProgressModal) return 'progress';
  if (state.showThemeModal) return 'theme';
  return 'none';
}

/** Constrói um seletor estável para repor o foco após o renderApp() substituir o DOM. */
export function selectorForControl(el: Element | null): string | null {
  if (!el || !(el instanceof HTMLElement)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const attrPairs: [string, string | undefined][] = [
    ['data-action', el.dataset.action],
    ['data-theme-id', el.dataset.themeId],
    ['data-diag-bg', el.dataset.diagBg],
    ['data-diag-hours', el.dataset.diagHours],
    ['data-diag-months', el.dataset.diagMonths],
  ];
  for (const [attr, val] of attrPairs) {
    if (val) return `[${attr}="${CSS.escape(val)}"]`;
  }
  return null;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter(
    (el) => !el.closest('[hidden]') && el.getAttribute('aria-hidden') !== 'true' && getComputedStyle(el).display !== 'none',
  );
}

export function focusInitialDialogElement(dialog: HTMLElement): void {
  if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
  const closeBtn = dialog.querySelector<HTMLElement>('button[data-action^="close-"]:not([disabled])');
  if (closeBtn) {
    closeBtn.focus();
    return;
  }
  const focusables = getFocusableElements(dialog);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }
  dialog.focus();
}

/** Prende a navegação Tab / Shift+Tab dentro da modal aberta (WCAG 2.1 AA). */
export function handleDialogTabTrap(dialog: HTMLElement, ev: KeyboardEvent, doc: Document = document): boolean {
  if (ev.key !== 'Tab') return false;
  const focusables = getFocusableElements(dialog);
  if (focusables.length === 0) {
    ev.preventDefault();
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    dialog.focus();
    return true;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = doc.activeElement as HTMLElement | null;

  if (!active || !dialog.contains(active)) {
    ev.preventDefault();
    (ev.shiftKey ? last : first).focus();
    return true;
  }

  if (ev.shiftKey && (active === first || active === dialog)) {
    ev.preventDefault();
    last.focus();
    return true;
  }

  if (!ev.shiftKey && active === last) {
    ev.preventDefault();
    first.focus();
    return true;
  }

  return false;
}

export function restoreFocusFromSelectors(selectors: (string | null | undefined)[], doc: Document = document): void {
  for (const sel of selectors) {
    if (!sel) continue;
    const target = doc.querySelector<HTMLElement>(sel);
    if (target && !target.hasAttribute('disabled')) {
      target.focus();
      return;
    }
  }
}
