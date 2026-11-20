import type { AppState } from './appState';
import { clampLayout, DEFAULT_LAYOUT, saveLayoutPrefs, splitterValueText, type SplitterKind } from './layout';

/** Liga drag por ponteiro, duplo clique e atalhos de teclado às 3 divisórias redimensionáveis da bancada. */
export function attachSplitterListeners(state: AppState, renderApp: () => void): void {
  const gridEl = document.getElementById('academy-grid');
  const sidebarSplitter = document.getElementById('splitter-sidebar');
  const mainSplitter = document.getElementById('splitter-main');
  const editorSplitter = document.getElementById('splitter-editor');

  const applyCssVarsLive = (): void => {
    if (!gridEl) return;
    gridEl.style.setProperty('--sidebar-w', `${state.layout.sidebarWidth}px`);
    gridEl.style.setProperty('--lesson-fr', `${state.layout.lessonRatio}fr`);
    gridEl.style.setProperty('--workbench-fr', `${100 - state.layout.lessonRatio}fr`);
    gridEl.style.setProperty('--editor-h', `${state.layout.editorHeight}px`);
    // O leitor de ecrã anuncia o novo valor enquanto se arrasta ou se usam as setas.
    const aria: [HTMLElement | null, SplitterKind][] = [
      [sidebarSplitter, 'sidebarWidth'],
      [mainSplitter, 'lessonRatio'],
      [editorSplitter, 'editorHeight'],
    ];
    for (const [el, kind] of aria) {
      if (!el) continue;
      el.setAttribute('aria-valuenow', String(state.layout[kind]));
      el.setAttribute('aria-valuetext', splitterValueText(kind, state.layout[kind]));
    }
  };

  if (sidebarSplitter && gridEl) {
    sidebarSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      sidebarSplitter.setPointerCapture(ev.pointerId);
      sidebarSplitter.classList.add('is-dragging');
      const rect = gridEl.getBoundingClientRect();
      const onMove = (moveEv: PointerEvent): void => {
        const nextW = Math.round(clampLayout('sidebarWidth', moveEv.clientX - rect.left));
        state.layout.sidebarWidth = nextW;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        sidebarSplitter.classList.remove('is-dragging');
        sidebarSplitter.removeEventListener('pointermove', onMove);
        sidebarSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
      };
      sidebarSplitter.addEventListener('pointermove', onMove);
      sidebarSplitter.addEventListener('pointerup', onUp);
    });
    sidebarSplitter.addEventListener('dblclick', () => {
      state.layout.sidebarWidth = DEFAULT_LAYOUT.sidebarWidth;
      applyCssVarsLive();
      saveLayoutPrefs(state.layout);
    });
    sidebarSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowRight' ? 16 : -16;
        state.layout.sidebarWidth = clampLayout('sidebarWidth', state.layout.sidebarWidth + delta);
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }

  if (mainSplitter && gridEl) {
    mainSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      mainSplitter.setPointerCapture(ev.pointerId);
      mainSplitter.classList.add('is-dragging');
      const onMove = (moveEv: PointerEvent): void => {
        const rect = gridEl.getBoundingClientRect();
        const sideOffset = state.layout.sidebarCollapsed ? 0 : state.layout.sidebarWidth + 8;
        const availW = Math.max(400, rect.width - sideOffset);
        const relX = moveEv.clientX - (rect.left + sideOffset);
        const ratio = Math.round(clampLayout('lessonRatio', (relX / availW) * 100));
        state.layout.lessonRatio = ratio;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        mainSplitter.classList.remove('is-dragging');
        mainSplitter.removeEventListener('pointermove', onMove);
        mainSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
        renderApp();
      };
      mainSplitter.addEventListener('pointermove', onMove);
      mainSplitter.addEventListener('pointerup', onUp);
    });
    mainSplitter.addEventListener('dblclick', () => {
      state.layout.lessonRatio = DEFAULT_LAYOUT.lessonRatio;
      saveLayoutPrefs(state.layout);
      renderApp();
    });
    mainSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowRight' ? 4 : -4;
        state.layout.lessonRatio = clampLayout('lessonRatio', state.layout.lessonRatio + delta);
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }

  if (editorSplitter && gridEl) {
    const editorShell = document.getElementById('editor-shell');
    editorSplitter.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      editorSplitter.setPointerCapture(ev.pointerId);
      editorSplitter.classList.add('is-dragging');
      const startY = ev.clientY;
      const startH = editorShell?.getBoundingClientRect().height ?? state.layout.editorHeight;
      const onMove = (moveEv: PointerEvent): void => {
        const nextH = Math.round(clampLayout('editorHeight', startH + (moveEv.clientY - startY)));
        state.layout.editorHeight = nextH;
        applyCssVarsLive();
      };
      const onUp = (): void => {
        editorSplitter.classList.remove('is-dragging');
        editorSplitter.removeEventListener('pointermove', onMove);
        editorSplitter.removeEventListener('pointerup', onUp);
        saveLayoutPrefs(state.layout);
      };
      editorSplitter.addEventListener('pointermove', onMove);
      editorSplitter.addEventListener('pointerup', onUp);
    });
    editorSplitter.addEventListener('dblclick', () => {
      state.layout.editorHeight = DEFAULT_LAYOUT.editorHeight;
      applyCssVarsLive();
      saveLayoutPrefs(state.layout);
    });
    editorSplitter.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        ev.preventDefault();
        const delta = ev.key === 'ArrowDown' ? 24 : -24;
        state.layout.editorHeight = clampLayout('editorHeight', state.layout.editorHeight + delta);
        applyCssVarsLive();
        saveLayoutPrefs(state.layout);
      }
    });
  }
}
