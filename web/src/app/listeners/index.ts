// Depois de cada render o HTML é novo: volta a ligar todos os eventos.

import { attachActionListeners } from '../actions';
import { attachEditorListeners } from './editorListeners';
import { attachLessonListeners } from './lessonListeners';
import { attachNavigationListeners } from './navigationListeners';
import { attachProgressListeners } from './progressListeners';
import { attachViewListeners } from './viewListeners';

export function attachDomListeners(): void {
  attachEditorListeners();
  attachLessonListeners();
  attachViewListeners();
  attachActionListeners();
  attachProgressListeners();
  attachNavigationListeners();
}
