import { describe, expect, it, vi } from 'vitest';
import {
  focusInitialDialogElement,
  getActiveModalKind,
  handleDialogTabTrap,
  restoreFocusFromSelectors,
} from '../src/ui/modalFocus';

function makeFakeElement(opts: {
  id?: string;
  action?: string;
  disabled?: boolean;
  hidden?: boolean;
}) {
  const attrs = new Map<string, string>();
  if (opts.action) attrs.set('data-action', opts.action);
  if (opts.disabled) attrs.set('disabled', '');
  const el: any = {
    id: opts.id ?? '',
    focused: false,
    focus() {
      this.focused = true;
      fakeDoc.activeElement = this;
    },
    hasAttribute: (k: string) => attrs.has(k),
    getAttribute: (k: string) => attrs.get(k) ?? null,
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    closest: (sel: string) => (sel === '[hidden]' && opts.hidden ? el : null),
  };
  return el;
}

const fakeDoc: any = { activeElement: null };

describe('acessibilidade de modais (WCAG focus management)', () => {
  it('identifica corretamente a modal ativa', () => {
    expect(
      getActiveModalKind({ showGuideModal: false, showProgressModal: false, showThemeModal: false, showDiagnosticModal: false }),
    ).toBe('none');
    expect(
      getActiveModalKind({ showGuideModal: true, showProgressModal: false, showThemeModal: false, showDiagnosticModal: false }),
    ).toBe('guide');
    expect(
      getActiveModalKind({ showGuideModal: false, showProgressModal: false, showThemeModal: false, showDiagnosticModal: true }),
    ).toBe('diagnostic');
  });

  it('foca o botão Fechar ao abrir e prende Tab / Shift+Tab dentro da modal', () => {
    vi.stubGlobal('getComputedStyle', () => ({ display: 'block' }));
    const closeBtn = makeFakeElement({ action: 'close-guide-modal' });
    const primaryBtn = makeFakeElement({ action: 'open-diagnostic-modal' });
    const focusables = [closeBtn, primaryBtn];
    const dialog: any = {
      hasAttribute: () => true,
      setAttribute: () => {},
      focus: vi.fn(),
      contains: (node: any) => focusables.includes(node),
      querySelector: (sel: string) => (sel.includes('close-') ? closeBtn : null),
      querySelectorAll: () => focusables,
    };

    focusInitialDialogElement(dialog);
    expect(fakeDoc.activeElement).toBe(closeBtn);

    // Tab no último elemento dá volta ao primeiro
    fakeDoc.activeElement = primaryBtn;
    const evForward = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    expect(handleDialogTabTrap(dialog, evForward, fakeDoc)).toBe(true);
    expect(evForward.preventDefault).toHaveBeenCalled();
    expect(fakeDoc.activeElement).toBe(closeBtn);

    // Shift+Tab no primeiro elemento dá volta ao último
    fakeDoc.activeElement = closeBtn;
    const evBack = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    expect(handleDialogTabTrap(dialog, evBack, fakeDoc)).toBe(true);
    expect(evBack.preventDefault).toHaveBeenCalled();
    expect(fakeDoc.activeElement).toBe(primaryBtn);
  });

  it('restaura o foco usando o primeiro seletor válido ao fechar a modal', () => {
    const trigger = makeFakeElement({ action: 'open-guide-modal' });
    const doc = {
      querySelector: (sel: string) => (sel === '[data-action="open-guide-modal"]' ? trigger : null),
    } as unknown as Document;

    restoreFocusFromSelectors(['#inexistente', '[data-action="open-guide-modal"]'], doc);
    expect(trigger.focused).toBe(true);
  });
});
