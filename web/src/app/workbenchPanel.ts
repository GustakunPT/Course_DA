// Coluna da bancada: separadores, enunciado, editor, ações, pistas e resultado.

import type { Lesson } from '../data/types';
import { isAnswerSheetMode, renderAnswerSheetPanel } from '../ui/answerSheetPanel';
import { highlightCode } from '../ui/codeEditor';
import { renderPreviaCodigo } from '../ui/mobileEditor';
import { renderOutputRegion } from '../ui/outputView';
import { renderPainelProjeto } from '../ui/projectPanel';
import { activeEngine, getEditorValue, linkDoProjeto } from './lessonContext';
import { aparelhoPedeEcraDeEscrita, usaEcraDeEscrita } from './mobileWriting';
import { state } from './store';
import {
  renderEditorShell,
  renderEnunciado,
  renderPistas,
  renderSchemaDrawer,
  renderSimbolosBar,
} from './workbenchParts';

// Vista da Academia: índice lateral, lição e bancada.

export function renderWorkbenchPanel(lesson: Lesson): string {
  const engine = activeEngine();
  const editorVal = getEditorValue();
  const answerSheet = isAnswerSheetMode(lesson.id, state.wbTab, state.practiceIdx);
  return `
      <!-- Right Live Workbench -->
      <section class="seam-panel seam-panel-deep workbench-panel" aria-label="Bancada interativa de código">
        <div class="mobile-switch-wrap">
          <button type="button" class="btn mobile-switch-btn" data-action="switch-to-lesson">
            ◀ Ver Enunciado da Lição
          </button>
        </div>

        ${
          lesson.engine === 'projeto'
            ? renderPainelProjeto(
                lesson,
                state.practiceDone,
                linkDoProjeto(lesson),
                Boolean(state.completedLessons[lesson.id]),
              )
            : `
        <div class="workbench-toolbar">
          <div class="mode-tabs" role="tablist" aria-label="Modo do editor">
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'challenge'}" data-wb-tab="challenge">
              Desafio guiado
            </button>
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'example'}" data-wb-tab="example">
              Experimenta livre
            </button>
            <button type="button" role="tab" class="mode-btn" aria-selected="${state.wbTab === 'sqlfree'}" data-wb-tab="sqlfree">
              Consola SQL
            </button>
          </div>
          <span class="status-chip desktop-shortcut-chip">
            ${answerSheet ? 'Preenche os valores e clica Verificar' : 'Ctrl + Enter para correr'}
          </span>
        </div>

        ${renderEnunciado(lesson)}

        ${
          answerSheet
            ? renderAnswerSheetPanel(lesson.id, editorVal)
            : usaEcraDeEscrita()
              ? state.mobileEditor === null
                ? renderPreviaCodigo(highlightCode(editorVal, engine))
                : ''
              : `${renderSimbolosBar(engine)}
        ${renderEditorShell(editorVal, engine)}
        ${aparelhoPedeEcraDeEscrita() ? '<button type="button" class="link-btn" data-action="usar-ecra-escrita">Usar o ecrã de escrita</button>' : ''}`
        }

        ${
          answerSheet
            ? ''
            : `<!-- Resizable Horizontal Splitter: Editor <-> Output -->
        <div
          id="splitter-editor"
          class="pane-splitter-h"
          role="separator"
          tabindex="0"
          aria-orientation="horizontal"
          aria-label="Redimensionar altura do editor de código"
          title="Arrasta para aumentar ou diminuir a altura do editor (duplo clique para repor)"
        ></div>`
        }

        <div class="workbench-actions">
          <div class="action-pair">
            <button type="button" class="btn btn-primary" data-action="run-code" ${state.output.kind === 'loading' ? 'disabled' : ''}>
              ${answerSheet ? 'Verificar respostas' : state.wbTab === 'challenge' ? 'Executar e verificar' : 'Executar agora'}
            </button>
            ${
              state.output.kind === 'loading' && (activeEngine() === 'python' || activeEngine() === 'sql')
                ? '<button type="button" class="btn btn-danger-outline" data-action="stop-code">Parar execução</button>'
                : ''
            }
            ${
              answerSheet
                ? ''
                : `<button type="button" class="btn" data-action="format-code" title="Formatar código com Prettier (Shift + Alt + F)">
              Formatar Prettier
            </button>`
            }
            <button type="button" class="btn" data-action="reset-code">${answerSheet ? 'Limpar respostas' : 'Repor código'}</button>
          </div>
          ${
            state.wbTab === 'challenge'
              ? `<div class="action-pair">
                  ${
                    state.hintLevel < 2
                      ? `<button type="button" class="btn" data-action="next-hint">${state.hintLevel === 0 ? 'Pedir pista (1/2)' : 'Mais uma pista (2/2)'}</button>`
                      : ''
                  }
                  ${
                    state.confirmSolutionLessonId === lesson.id
                      ? `<button type="button" class="btn" data-action="apply-solution">Confirmar solução</button>
                         <button type="button" class="btn" data-action="cancel-solution">Cancelar</button>`
                      : `<button type="button" class="btn" data-action="ask-solution">${answerSheet ? 'Mostrar respostas de referência' : 'Mostrar solução de referência'}</button>`
                  }
                </div>`
              : ''
          }
        </div>

        ${state.mobileEditor === null && (engine === 'sql' || engine === 'python') ? renderSchemaDrawer() : ''}

        ${state.mobileEditor === null ? renderPistas(lesson) : ''}

        ${state.mobileEditor === null ? renderOutputRegion(state.output, engine) : ''}
        `
        }
      </section>
  `;
}
