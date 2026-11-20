// Executar o código da bancada e atualizar o resultado sem redesenhar a página toda.

import { TOTAL_LESSONS_COUNT } from '../data/trackIndex';
import { createWorkbenchRunner } from '../ui/workbenchRunner';
import { savePreferirEditorNormal } from '../ui/mobileEditor';
import {
  activeEngine,
  activeGitChallenge,
  activePythonChallenge,
  activeSqlChallenge,
  currentLesson,
  currentTrackOrNull,
  getEditorValue,
} from './lessonContext';
import {
  abrirEcraDeEscrita,
  fecharEcraDeEscrita,
  irParaProximaEtapaDoEcra,
  renderEcraEnunciadoPainel,
  renderEcraResultadoHtml,
} from './mobileWriting';
import { markLessonCompleted, savePracticeDone } from './progressSync';
import { renderApp } from './rerender';
import { state } from './store';

export const workbenchRunner = createWorkbenchRunner({
  state,
  currentTrackOrNull,
  currentLesson,
  activeEngine,
  getEditorValue,
  activePythonChallenge,
  activeSqlChallenge,
  activeGitChallenge,
  markLessonCompleted,
  savePracticeDone,
  renderApp,
  updateOutputInPlace: updateWorkbenchOutputInPlace,
});

export const executeWorkbench = workbenchRunner.execute;

/** Pára a execução em curso (ou mostra que foi interrompida, se já não havia nada a correr). */
export function stopWorkbench(): void {
  const stopped = workbenchRunner.cancelExecution();
  if (!stopped) {
    state.output = { kind: 'error', errorText: 'Execução interrompida pelo utilizador.' };
    updateWorkbenchOutputInPlace();
  }
}

/** Mostra a pista seguinte no painel Enunciado do ecrã de escrita, sem o redesenhar. */
function mostrarPistaNoEcra(ecra: HTMLElement): void {
  state.hintLevel = Math.min(2, state.hintLevel + 1);
  atualizarEnunciadoDoEcra(ecra);
}

function atualizarEnunciadoDoEcra(ecra: HTMLElement): void {
  const enunciadoPanel = ecra.querySelector<HTMLElement>('.ecra-painel[data-painel="enunciado"]');
  const lesson = currentTrackOrNull() ? currentLesson() : null;
  if (enunciadoPanel && lesson) {
    enunciadoPanel.innerHTML = renderEcraEnunciadoPainel(lesson);
  }
}

function atualizarContadorDeProgresso(): void {
  const done = Object.keys(state.completedLessons).length;
  const progressFull = document.querySelector<HTMLElement>('.nav-progress-btn .progress-full');
  if (progressFull) progressFull.textContent = `Progresso ${done}/${TOTAL_LESSONS_COUNT}`;
  const progressCompact = document.querySelector<HTMLElement>('.nav-progress-btn .progress-compact');
  if (progressCompact) progressCompact.textContent = `${done}/${TOTAL_LESSONS_COUNT}`;
}

/**
 * No ecrã de escrita o resultado é atualizado no sítio (redesenhar fechava o teclado).
 * Fora dele, redesenha a app.
 */
export function updateWorkbenchOutputInPlace(): void {
  const ecra = document.querySelector<HTMLElement>('.ecra-escrita');
  if (!ecra) {
    renderApp();
    return;
  }
  const engine = activeEngine();
  const resPanel = ecra.querySelector<HTMLElement>('.ecra-painel[data-painel="resultado"]');
  if (resPanel) {
    resPanel.innerHTML = renderEcraResultadoHtml(engine);
  }
  const aCorrer = state.output.kind === 'loading';
  const execBtn = ecra.querySelector<HTMLButtonElement>('[data-action="executar-ecra-escrita"]');
  if (execBtn) execBtn.disabled = aCorrer;

  const barra = ecra.querySelector<HTMLElement>('.ecra-barra');
  if (barra) {
    const existingStop = barra.querySelector<HTMLElement>('[data-action="stop-code"]');
    if (aCorrer && !existingStop && execBtn) {
      const stopBtn = document.createElement('button');
      stopBtn.type = 'button';
      stopBtn.className = 'btn btn-danger-outline';
      stopBtn.dataset.action = 'stop-code';
      stopBtn.textContent = 'Parar';
      barra.insertBefore(stopBtn, execBtn);
    } else if (!aCorrer && existingStop) {
      existingStop.remove();
    }
  }

  // Atualiza o progresso e o painel Enunciado se a execução terminou.
  if (state.output.kind === 'full') {
    atualizarEnunciadoDoEcra(ecra);
    atualizarContadorDeProgresso();
  }

  // Os botões acabados de inserir não passaram pelo attachDomListeners: liga-os aqui (uma vez).
  ecra
    .querySelectorAll<HTMLElement>(
      '.ecra-painel[data-painel="resultado"] [data-action], .ecra-barra [data-action="stop-code"], .ecra-painel[data-painel="enunciado"] [data-action]',
    )
    .forEach((btn) => {
      if (btn.dataset.boundAction === '1') return;
      btn.dataset.boundAction = '1';
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'stop-code') {
          stopWorkbench();
        } else if (act === 'run-code') {
          void executeWorkbench();
        } else if (act === 'next-hint') {
          mostrarPistaNoEcra(ecra);
        } else if (act === 'editar-codigo-ecra') {
          abrirEcraDeEscrita('codigo');
        } else if (act === 'next-lesson-from-ecra') {
          irParaProximaEtapaDoEcra();
        } else if (act === 'usar-editor-normal') {
          savePreferirEditorNormal(true);
          fecharEcraDeEscrita();
        }
      });
    });
}
