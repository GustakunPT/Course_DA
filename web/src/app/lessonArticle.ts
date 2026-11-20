// Coluna da lição: teoria, referência, exemplo, quiz e navegação entre etapas.

import { TOTAL_LESSONS_COUNT, TRACK_INDEX, type TrackIndexEntry } from '../data/trackIndex';
import {
  formatHoursApproxPt,
  formatMinutesPt,
  getLessonBaseMinutes,
  getLessonBufferMinutes,
  getLessonMinutes,
  getTrackMinutes,
} from '../data/studyPlan';
import { formatTimerClock } from '../data/timeTracker';
import type { Lesson, Track } from '../data/types';
import { highlightCode } from '../ui/codeEditor';
import { escapeHtml } from '../ui/html';
import { ESTADO_PROJETO, linkGithubValido } from '../ui/projectPanel';
import { quizDisplayOrder } from '../ui/quizOrder';
import { quizKey } from './lessonContext';
import { state } from './store';

// Vista da Academia: índice lateral, lição e bancada.

function renderQuizzes(lesson: Lesson): string {
  const perguntas = [lesson.quiz, ...(lesson.moreQuiz ?? [])];
  const varias = perguntas.length > 1;
  const certas = perguntas.filter((q, n) => state.quizSelection[quizKey(lesson.id, n)] === q.correctIndex).length;
  return `
        <div class="quiz-well" role="group" aria-labelledby="quiz-title">
          <h3 id="quiz-title">Verificação rápida de conceito${varias ? ` <span class="quiz-score">${certas} de ${perguntas.length} certas</span>` : ''}</h3>
          ${perguntas
            .map((q, n) => {
              const key = quizKey(lesson.id, n);
              const sel = state.quizSelection[key];
              return `
          <div class="quiz-item">
            <p>${varias ? `<strong>${n + 1}.</strong> ` : ''}${escapeHtml(q.question)}</p>
            <div class="quiz-options">
              ${quizDisplayOrder(key, q.options.length)
                .map((idx) => {
                  let cls = '';
                  if (sel !== undefined) {
                    if (idx === q.correctIndex) cls = 'is-correct';
                    else if (idx === sel) cls = 'is-wrong';
                  }
                  return `
                  <label class="quiz-option ${cls}">
                    <input type="radio" name="quiz-${escapeHtml(key)}" value="${idx}" class="quiz-radio"
                      data-quiz-idx="${idx}" data-quiz-key="${escapeHtml(key)}" ${sel === idx ? 'checked' : ''} />
                    <span>${escapeHtml(q.options[idx])}</span>
                  </label>`;
                })
                .join('')}
            </div>
            <div class="helper-slot ${sel !== undefined ? (sel === q.correctIndex ? 'is-ok' : 'is-bad') : ''}">
              ${
                sel === undefined
                  ? 'Seleciona uma opção para testar a tua compreensão.'
                  : sel === q.correctIndex
                    ? `Correto! ${escapeHtml(q.explanation)}`
                    : `Ainda não: ${escapeHtml(q.explanation)}`
              }
            </div>
          </div>`;
            })
            .join('')}
        </div>`;
}

function renderCompletionBanner(track: TrackIndexEntry, lesson: Lesson): string {
  const doneCount = Object.keys(state.completedLessons).length;
  const trackDone = track.lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
  const isTrackFinished = trackDone === track.lessons.length;
  const trackIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
  const nextTrack = trackIdx >= 0 && trackIdx < TRACK_INDEX.length - 1 ? TRACK_INDEX[trackIdx + 1] : null;
  const isFinalLesson =
    trackIdx === TRACK_INDEX.length - 1 && lesson.id === track.lessons[track.lessons.length - 1]?.id;
  const isCourseFinished =
    doneCount === TOTAL_LESSONS_COUNT || (isFinalLesson && Boolean(state.completedLessons[lesson.id]));

  if (isCourseFinished) {
    const rawGithubUrl = (state.editorDrafts['pf-05-publicar:challenge'] ?? '').trim();
    const githubLink = linkGithubValido(rawGithubUrl) ? rawGithubUrl : '';
    return `
      <section class="completion-banner is-course-complete" aria-label="Conclusão do curso">
        <span class="status-chip is-ok">Percurso concluído · ${doneCount} / ${TOTAL_LESSONS_COUNT} etapas</span>
        <h2>Chegaste ao fim! O teu portefólio está pronto.</h2>
        <p>Fechaste Python, SQL, Pandas, Git, Visualização/BI, Estatística, o desafio de recrutamento simulado, o projeto próprio e a preparação para candidaturas.</p>
        ${
          githubLink
            ? `<p><strong>Projeto publicado no GitHub:</strong> <a href="${escapeHtml(githubLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(githubLink)}</a></p>`
            : ''
        }
        <ol class="prose-list">
          <li>Descarrega o teu portefólio em Markdown (<code>.md</code>) e junta o resumo ao teu CV em PDF.</li>
          <li>Confirma que o repositório do projeto próprio está fixado nos <strong>Destaques</strong> do LinkedIn.</li>
          <li>Usa o guião do pitch de 2 minutos e candidata-te esta semana às primeiras 5 vagas de Analista de Dados Júnior.</li>
        </ol>
        <div class="action-pair" style="flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" data-action="export-portfolio-md">Descarregar Portfólio (.md)</button>
          <button type="button" class="btn" data-action="export-progress-json">Backup do Progresso (.json)</button>
          <button type="button" class="btn" data-action="open-progress-modal">Ver mapa e plano de 10 semanas</button>
        </div>
      </section>
    `;
  }

  if (isTrackFinished && nextTrack) {
    return `
      <section class="completion-banner" aria-label="Conclusão da trilha">
        <span class="status-chip is-ok">Trilha concluída · ${trackDone}/${track.lessons.length} etapas</span>
        <h3>Terminaste ${escapeHtml(track.shortTitle)}!</h3>
        <p>Todas as etapas desta trilha estão concluídas. Podes seguir diretamente para a próxima trilha (${escapeHtml(formatHoursApproxPt(getTrackMinutes(nextTrack)))} estimadas).</p>
        <div class="action-pair">
          <button type="button" class="btn btn-primary" data-select-track="${escapeHtml(nextTrack.id)}">
            Avançar para ${escapeHtml(nextTrack.shortTitle)} →
          </button>
        </div>
      </section>
    `;
  }

  return '';
}

/** Etapa anterior e seguinte (atravessa trilhas nas pontas). */
function etapasVizinhas(track: Track, lesson: Lesson) {
  const lessonIdx = track.lessons.findIndex((l) => l.id === lesson.id);
  const trackIdx = TRACK_INDEX.findIndex((t) => t.id === track.id);
  const prevTrack = trackIdx > 0 ? TRACK_INDEX[trackIdx - 1] : null;
  const nextTrack = trackIdx >= 0 && trackIdx < TRACK_INDEX.length - 1 ? TRACK_INDEX[trackIdx + 1] : null;
  const prevLesson =
    lessonIdx > 0 ? track.lessons[lessonIdx - 1] : prevTrack ? prevTrack.lessons[prevTrack.lessons.length - 1] : null;
  const nextLesson =
    lessonIdx < track.lessons.length - 1 ? track.lessons[lessonIdx + 1] : nextTrack ? nextTrack.lessons[0] : null;

  return { prevLesson, nextLesson };
}

export function renderLessonArticle(track: Track, trackMeta: TrackIndexEntry, lesson: Lesson): string {
  const { prevLesson, nextLesson } = etapasVizinhas(track, lesson);
  return `
      <!-- Center Lesson Column -->
      <article class="seam-panel lesson-article">
        <header class="lesson-header">
          <div class="workbench-toolbar">
            <div class="action-pair" style="flex-wrap:wrap;gap:6px;">
              <span class="status-chip is-person">Etapa ${escapeHtml(lesson.code)} de ${track.lessons.length}</span>
              <span class="status-chip" title="Tempo previsto base (${getLessonBaseMinutes(lesson)} min) + margem de ~20% (${getLessonBufferMinutes(lesson)} min)">⏱ ~${escapeHtml(formatMinutesPt(getLessonBaseMinutes(lesson)))} (+${getLessonBufferMinutes(lesson)} min margem)</span>
              <button
                type="button"
                class="status-chip lesson-timer-pill ${state.timerPaused ? 'is-paused' : 'is-running'}"
                data-action="toggle-lesson-timer"
                title="Tempo real nesta etapa vs previsto (${getLessonMinutes(lesson)} min c/ margem). Pausa automaticamente se mudares de separador ou após 3 min de inatividade. Clica para pausar/retomar."
              >
                <span aria-hidden="true">${state.timerPaused ? '▶' : '⏸'}</span>
                <span id="lesson-timer-clock">${escapeHtml(formatTimerClock(state.lessonTimes[lesson.id] ?? 0))}</span>
                <span class="measured">/ ${escapeHtml(formatMinutesPt(getLessonMinutes(lesson)))}</span>
              </button>
            </div>
            ${
              state.completedLessons[lesson.id]
                ? lesson.engine === 'projeto'
                  ? `<span class="status-chip is-projeto">${escapeHtml(ESTADO_PROJETO)}</span>`
                  : state.completedLessons[lesson.id].status === 'helped'
                    ? `<span class="status-chip is-helped">Concluída c/ apoio</span>`
                    : `<span class="status-chip is-ok">Concluída</span>`
                : `<span class="status-chip">${escapeHtml(track.engineLabel)}</span>`
            }
          </div>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="lesson-lede">${escapeHtml(lesson.lede)}</p>
        </header>

        ${
          lesson.id === 'py-00-pensamento' && !state.diagnostic
            ? `<div class="gantt-diag-strip">
                <div class="gantt-diag-info">
                  <strong>Novo na academia?</strong> <span class="measured">Vê como navegar pelas 3 janelas ou faz o diagnóstico de 30 s para ajustar o Cronograma Gantt ao teu ritmo.</span>
                </div>
                <div class="action-pair" style="flex-wrap:wrap;">
                  <button type="button" class="btn" data-action="open-guide-modal">? Como navegar</button>
                  <button type="button" class="btn btn-primary" data-action="open-diagnostic-modal">🎯 Fazer diagnóstico</button>
                </div>
              </div>`
            : ''
        }

        <section class="analogy-box" aria-label="Analogia prática">
          <h2>${escapeHtml(lesson.analogyTitle)}</h2>
          <p>${escapeHtml(lesson.analogyBody)}</p>
        </section>

        ${
          lesson.beginnerSteps && lesson.beginnerSteps.length
            ? `
          <section class="prose-section">
            <h2>Passo a passo</h2>
            <ol class="prose-list">
              ${lesson.beginnerSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ol>
          </section>
        `
            : ''
        }

        ${
          lesson.explained && lesson.explained.length
            ? `
          <section class="prose-section">
            <h2>Explicado com calma</h2>
            ${lesson.explained.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
          </section>
        `
            : ''
        }

        <section class="prose-section">
          <h2>Conceitos essenciais</h2>
          <ul class="prose-list">
            ${lesson.concepts.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
          </ul>
        </section>

        ${
          lesson.errorDemo
            ? `
          <section class="prose-section error-demo" aria-label="Exemplo de erro">
            <h2>O que acontece se…</h2>
            <pre class="code-sample"><code>${highlightCode(lesson.errorDemo.code, lesson.engine)}</code></pre>
            <p class="error-demo-label">${
              lesson.engine === 'sql'
                ? 'O SQLite responde:'
                : lesson.engine === 'git'
                  ? 'O Git responde:'
                  : 'O Python responde:'
            }</p>
            <pre class="error-demo-msg">${escapeHtml(lesson.errorDemo.message)}</pre>
            <p>${escapeHtml(lesson.errorDemo.fix)}</p>
          </section>
        `
            : ''
        }

        ${
          lesson.proPractice || lesson.commonPitfall
            ? `
          <section class="pro-grid" aria-label="Prática profissional e erros comuns">
            ${
              lesson.proPractice
                ? `
              <div class="pro-box">
                <h3>No trabalho real (Nível Profissional)</h3>
                <p>${escapeHtml(lesson.proPractice)}</p>
              </div>
            `
                : ''
            }
            ${
              lesson.commonPitfall
                ? `
              <div class="pro-box is-pitfall">
                <h3>Armadilha clássica a evitar</h3>
                <p>${escapeHtml(lesson.commonPitfall)}</p>
              </div>
            `
                : ''
            }
          </section>
        `
            : ''
        }

        <section class="prose-section">
          <h2>${escapeHtml(lesson.referenceTitle)}</h2>
          <div class="table-scroll">
            <table class="data-table">
              <caption class="visually-hidden">${escapeHtml(lesson.referenceTitle)}</caption>
              <thead>
                <tr>
                  <th scope="col">Sintaxe</th>
                  <th scope="col">O que faz</th>
                  <th scope="col">Exemplo prático</th>
                </tr>
              </thead>
              <tbody>
                ${lesson.referenceRows
                  .map(
                    (r) => `
                  <tr>
                    <td class="mono-cell">${escapeHtml(r.syntax)}</td>
                    <td>${escapeHtml(r.meaning)}</td>
                    <td class="mono-cell">${escapeHtml(r.example)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>

        <section class="prose-section">
          <div class="workbench-toolbar">
            <h2>Exemplo demonstrativo</h2>
            ${lesson.engine === 'projeto' ? '' : '<button type="button" class="btn" data-action="load-example-tab">Experimentar no editor</button>'}
          </div>
          <pre class="code-sample"><code>${highlightCode(lesson.exampleCode, lesson.engine)}</code></pre>
        </section>

        ${renderQuizzes(lesson)}

        <nav class="lesson-pager" aria-label="Navegação entre lições">
          <button type="button" class="btn" data-select-lesson="${prevLesson ? escapeHtml(prevLesson.id) : ''}" ${!prevLesson ? 'disabled' : ''}>
            Etapa anterior
          </button>
          <button type="button" class="btn" data-select-lesson="${nextLesson ? escapeHtml(nextLesson.id) : ''}" ${!nextLesson ? 'disabled' : ''}>
            Próxima etapa
          </button>
        </nav>

        ${renderCompletionBanner(trackMeta, lesson)}

        <div class="mobile-switch-wrap">
          <button type="button" class="btn btn-primary mobile-switch-btn" data-action="switch-to-workbench">
            Ir para a Bancada ⚡ ▶
          </button>
        </div>
      </article>
  `;
}
