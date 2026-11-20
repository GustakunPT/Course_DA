// Liga todos os elementos com data-action à respetiva ação.

import { progressActions } from './progressActions';
import type { ActionMap } from './types';
import { uiActions } from './uiActions';
import { workbenchActions } from './workbenchActions';

const ACTIONS: ActionMap = {
  ...uiActions,
  ...workbenchActions,
  ...progressActions,
};

export function attachActionListeners(): void {
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      const act = el.dataset.action;
      if (act) ACTIONS[act]?.(el, ev);
    });
  });
}
