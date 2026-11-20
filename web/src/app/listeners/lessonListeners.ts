// Dentro da lição: quizzes, lista e link das etapas de projeto, e "Testar na bancada" da Referência.

import { saveDrafts, saveProgress, saveQuizzes } from '../../data/progress';
import { ensureTrackLoaded, loadCheatsheetsAsync } from '../../data/trackLoaders';
import { chaveLista, mensagemLink } from '../../ui/projectPanel';
import { chaveLinkProjeto, currentLesson, draftKey } from '../lessonContext';
import { concluirEtapaProjeto, savePracticeDone, scheduleCloudSync } from '../progressSync';
import { renderApp } from '../rerender';
import { state } from '../store';
import { executeWorkbench } from '../workbench';

function attachQuizListeners(): void {
  document.querySelectorAll<HTMLInputElement>('input[data-quiz-idx]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const lesson = currentLesson();
      const idx = Number(inp.dataset.quizIdx);
      const key = inp.dataset.quizKey ?? lesson.id;
      state.quizSelection[key] = idx;
      saveQuizzes(state.quizSelection);
      // A pergunta principal certa depois de concluir a etapa também conta.
      if (key === lesson.id && state.completedLessons[lesson.id] && idx === lesson.quiz.correctIndex) {
        state.completedLessons[lesson.id].quizPassed = true;
        saveProgress(state.completedLessons);
      }
      scheduleCloudSync();
      renderApp();
    });
  });
}

function attachProjectListeners(): void {
  // Etapas de projeto: as marcas da lista vão para practiceDone (chaves "etapa#lista:n").
  document.querySelectorAll<HTMLInputElement>('input[data-lista-item]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const lesson = currentLesson();
      const n = Number(inp.dataset.listaItem);
      const chave = chaveLista(lesson.id, n);
      if (inp.checked) state.practiceDone.add(chave);
      else state.practiceDone.delete(chave);
      savePracticeDone(); // grava e agenda a sincronização com a nuvem
      // A caixa já mostra o estado certo; só se redesenha quando a etapa acaba de ficar concluída.
      if (concluirEtapaProjeto(lesson)) {
        renderApp();
        document.querySelector<HTMLInputElement>(`input[data-lista-item="${n}"]`)?.focus();
      }
    });
  });

  const linkInput = document.querySelector<HTMLInputElement>('input[data-link-github]');
  if (!linkInput) return;
  linkInput.addEventListener('input', () => {
    const lesson = currentLesson();
    state.editorDrafts[chaveLinkProjeto(lesson)] = linkInput.value;
    saveDrafts(state.editorDrafts);
    scheduleCloudSync();
    // Atualiza só a mensagem: o campo não é redesenhado e não perde o foco.
    const msg = document.querySelector<HTMLElement>('[data-link-msg]');
    if (msg) {
      const { texto, classe } = mensagemLink(linkInput.value);
      msg.textContent = texto;
      msg.className = `projeto-link-msg ${classe}`;
    }
    if (concluirEtapaProjeto(lesson)) {
      // A conclusão grava já; o rascunho do link também, para não o perder se o separador fechar.
      saveDrafts(state.editorDrafts, true);
      // Redesenha uma vez (chip, índice, progresso) e devolve o foco e o cursor ao campo.
      const { selectionStart, selectionEnd } = linkInput;
      renderApp();
      const novo = document.querySelector<HTMLInputElement>('input[data-link-github]');
      if (novo) {
        novo.focus();
        novo.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  });
}

/** "Testar na bancada" na Referência Rápida: abre a trilha certa no modo Experimenta e corre o exemplo. */
async function tryReferenceSnippet(refIdx: number): Promise<void> {
  const cheatsheets = await loadCheatsheetsAsync();
  const entry = cheatsheets[refIdx];
  if (!entry || !entry.tryEngine || !entry.trySnippet) return;
  const targetTrackId =
    entry.tryEngine === 'sql'
      ? 'sql'
      : entry.tryEngine === 'git'
        ? 'git'
        : entry.category === 'Pandas'
          ? 'pandas'
          : 'python';
  const targetTrack = await ensureTrackLoaded(targetTrackId);
  state.view = 'academia';
  state.trackId = targetTrack.id;
  state.lessonId = targetTrack.lessons[0].id;
  state.wbTab = 'example';
  state.mobileTab = 'workbench';
  state.editorDrafts[draftKey(targetTrack.lessons[0], 'example')] = entry.trySnippet;
  saveDrafts(state.editorDrafts, true);
  state.output = { kind: 'empty' };
  renderApp();
  window.scrollTo({ top: 0 });
  void executeWorkbench();
}

export function attachLessonListeners(): void {
  attachQuizListeners();
  attachProjectListeners();
  document.querySelectorAll<HTMLElement>('[data-try-ref]').forEach((btn) => {
    btn.addEventListener('click', () => void tryReferenceSnippet(Number(btn.dataset.tryRef)));
  });
}
