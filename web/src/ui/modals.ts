import { TOTAL_LESSONS_COUNT as totalLessonsCount, TRACK_INDEX as allTracks } from '../data/trackIndex';
import {
  BACKGROUND_OPTIONS,
  evaluateDiagnosticPlan,
  FOUR_PILLARS,
  HOURS_OPTIONS,
  TARGET_MONTHS_OPTIONS,
  THREE_RISKS,
} from '../data/diagnostic';
import { evaluatePlacementAnswers, PLACEMENT_QUESTIONS } from '../data/placementQuiz';
import { buildSpacedReviewSummary } from '../data/spacedReview';
import {
  formatHoursApproxPt,
  formatMinutesPt,
  getCourseMinutes,
  getLessonMinutes,
  getTrackMinutes,
  STUDY_PLAN_WEEKS,
} from '../data/studyPlan';
import type { AppState } from './appState';
import { escapeHtml } from './html';
import { THEME_OPTIONS } from './theme';

// Janelas modais: escolha de tema e gestão de progresso/sincronização.

export function renderThemeModal(state: AppState): string {
  return `
    <div class="modal-backdrop" data-action="close-theme-backdrop" role="dialog" aria-modal="true" aria-labelledby="theme-modal-title">
      <div class="modal-card seam-panel">
        <div class="modal-head">
          <div>
            <span class="badge-chip">Aparência · 5 estilos</span>
            <h2 id="theme-modal-title">Escolher estilo visual</h2>
            <p class="measured">Personaliza as cores, contraste e tipografia da academia. A tua escolha fica guardada neste dispositivo.</p>
          </div>
          <button type="button" class="btn" data-action="close-theme-modal" aria-label="Fechar seletor de estilo">Fechar</button>
        </div>
        <div class="theme-grid">
          ${THEME_OPTIONS.map((opt) => {
            const active = state.theme === opt.id;
            return `
              <button
                type="button"
                class="theme-option-card ${active ? 'is-active' : ''}"
                data-action="select-theme"
                data-theme-id="${opt.id}"
                aria-pressed="${active ? 'true' : 'false'}"
              >
                <div class="theme-option-top">
                  <strong>${escapeHtml(opt.label)}</strong>
                  <span class="theme-swatches" aria-hidden="true">
                    ${opt.swatches.map((hex) => `<span class="theme-swatch" style="background:${hex};"></span>`).join('')}
                  </span>
                </div>
                <span class="status-chip ${active ? 'is-ok' : ''}">${active ? 'Ativo · ' : ''}${escapeHtml(opt.tag)}</span>
                <span class="theme-option-desc">${escapeHtml(opt.desc)}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderProgressModal(state: AppState): string {
  const entries = Object.values(state.completedLessons);
  const doneCount = entries.length;
  // As etapas de projeto são autoavaliadas: contam no seu próprio cartão, não em "Resolvidas s/ ajuda".
  const etapasProjeto = allTracks.flatMap((tr) => tr.lessons.filter((l) => l.engine === 'projeto'));
  const idsProjeto = new Set(etapasProjeto.map((l) => l.id));
  const projetoFeitas = etapasProjeto.filter((l) => state.completedLessons[l.id]).length;
  const autonomousCount = Object.entries(state.completedLessons).filter(
    ([id, e]) => e.status === 'autonomous' && !idsProjeto.has(id),
  ).length;
  const quizCorrectCount = allTracks.reduce((acc, tr) => {
    return (
      acc +
      tr.lessons.filter((l) => {
        const sel = state.quizSelection[l.id];
        return sel !== undefined && sel === l.quiz.correctIndex;
      }).length
    );
  }, 0);

  const courseMinutes = getCourseMinutes(allTracks);
  const totalRealSeconds = Object.values(state.lessonTimes).reduce((s, v) => s + v, 0);
  const totalRealMinutes = Math.round(totalRealSeconds / 60);
  const remainingMinutes = allTracks.reduce(
    (sum, tr) =>
      sum + tr.lessons.filter((l) => !state.completedLessons[l.id]).reduce((s, l) => s + getLessonMinutes(l), 0),
    0,
  );
  const cursoConcluido = doneCount === totalLessonsCount;

  return `
    <div class="modal-backdrop" data-action="close-progress-backdrop" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
      <div class="progress-modal">
        <div class="workbench-toolbar">
          <div>
            <h2 id="progress-modal-title">Mapa do Percurso, Plano de 10 Semanas &amp; Portfólio</h2>
            <p class="measured">Tempo real registado: ${escapeHtml(formatMinutesPt(totalRealMinutes))} · Carga projetada total (c/ margem): ${escapeHtml(formatHoursApproxPt(courseMinutes))} (falta ${escapeHtml(formatHoursApproxPt(remainingMinutes))}).</p>
          </div>
          <button type="button" class="btn" data-action="close-progress-modal" aria-label="Fechar janela">Fechar</button>
        </div>

        ${
          cursoConcluido
            ? `<div class="completion-banner is-course-complete">
                <strong>Curso completo (${doneCount}/${totalLessonsCount} etapas)!</strong>
                <p>Tens o portefólio pronto para exportar, o projeto no GitHub e a preparação para candidaturas. Descarrega o ficheiro <code>.md</code> abaixo para juntar ao teu repositório ou CV.</p>
              </div>`
            : ''
        }

        <div class="progress-summary-grid">
          <div class="progress-stat-card">
            <div class="progress-stat-val">${doneCount} / ${totalLessonsCount}</div>
            <div class="progress-stat-lbl">Etapas concluídas</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${autonomousCount}</div>
            <div class="progress-stat-lbl">Resolvidas s/ ajuda</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${quizCorrectCount} / ${totalLessonsCount}</div>
            <div class="progress-stat-lbl">Quizzes certos</div>
          </div>
          ${
            etapasProjeto.length
              ? `<div class="progress-stat-card is-projeto">
            <div class="progress-stat-val">${projetoFeitas} / ${etapasProjeto.length}</div>
            <div class="progress-stat-lbl">Projeto final (autoavaliado)</div>
          </div>`
              : ''
          }
        </div>

        <div class="progress-track-list">
          ${allTracks
            .map((tr) => {
              const trDone = tr.lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
              const pct = Math.round((trDone / tr.lessons.length) * 100);
              const trTempo = formatHoursApproxPt(getTrackMinutes(tr));
              return `
                <div class="progress-track-row">
                  <span>${escapeHtml(tr.shortTitle)} <small class="measured">(${escapeHtml(trTempo)})</small></span>
                  <span class="measured">${trDone}/${tr.lessons.length}</span>
                  <div class="progress-bar-bg" aria-hidden="true">
                    <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <details class="study-plan-panel">
          <summary><strong>Plano de estudo sugerido: 10 semanas a ~5–6 h/semana</strong></summary>
          <div class="table-scroll" style="margin-top:8px;">
            <table class="data-table study-plan-table">
              <thead>
                <tr>
                  <th scope="col">Ritmo</th>
                  <th scope="col">Trilhas</th>
                  <th scope="col">Objetivo</th>
                  <th scope="col">Feito</th>
                </tr>
              </thead>
              <tbody>
                ${STUDY_PLAN_WEEKS.map((bloco) => {
                  const lessons = allTracks.filter((t) => bloco.trackIds.includes(t.id)).flatMap((t) => t.lessons);
                  const blocoDone = lessons.filter((l) => Boolean(state.completedLessons[l.id])).length;
                  const blocoMins = lessons.reduce((s, l) => s + getLessonMinutes(l), 0);
                  return `
                    <tr>
                      <td><strong>${escapeHtml(bloco.weeks)}</strong><br><small class="measured">${escapeHtml(formatHoursApproxPt(blocoMins))}</small></td>
                      <td>${escapeHtml(bloco.focus)}</td>
                      <td>${escapeHtml(bloco.goal)}</td>
                      <td>${blocoDone}/${lessons.length}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </details>

        ${(() => {
          const review = buildSpacedReviewSummary(allTracks, state.completedLessons, state.quizSelection);
          if (review.totalTracked === 0) return '';
          return `
            <div class="hints-panel review-panel">
              <div class="review-panel-head">
                <strong>Revisão espaçada (memória ativa)</strong>
                <span class="status-chip ${review.dueNow.length > 0 ? 'is-person' : 'is-ok'}">
                  ${review.dueNow.length > 0 ? `${review.dueNow.length} para rever hoje` : 'Em dia · 0 atrasadas'}
                </span>
              </div>
              ${
                review.dueNow.length > 0
                  ? `<ul class="review-list">
                      ${review.dueNow
                        .slice(0, 4)
                        .map(
                          (item) => `
                        <li class="review-item">
                          <div class="review-item-info">
                            <strong>${escapeHtml(item.trackShortTitle)} · ${escapeHtml(item.lessonCode)} ${escapeHtml(item.lessonTitle)}</strong>
                            <span class="measured">${escapeHtml(item.reason)}</span>
                          </div>
                          <div class="action-pair">
                            <button type="button" class="btn" data-review-go-track="${escapeHtml(item.trackId)}" data-review-go-lesson="${escapeHtml(item.lessonId)}">Rever →</button>
                            <button type="button" class="btn btn-primary" data-review-done="${escapeHtml(item.lessonId)}">Revista ✓</button>
                          </div>
                        </li>
                      `,
                        )
                        .join('')}
                    </ul>`
                  : `<p class="measured">Todas as ${review.totalTracked} etapas concluídas estão dentro do ciclo de revisão (${review.upcoming.length} nos próximos 3 dias · ${review.consolidatedCount} consolidadas).</p>`
              }
            </div>
          `;
        })()}

        <div class="hints-panel">
          <strong>Sincronização na Cloud (sem login)</strong>
          <p class="measured">Liga este dispositivo a um código (<code>MB-XXXX-XXXX-XXXX</code>) para sincronizar automaticamente o progresso entre telemóvel e PC.</p>
          ${
            state.syncCode
              ? `<div class="action-pair" style="align-items:center;flex-wrap:wrap;gap:8px;">
                  <span class="status-chip is-ok">${escapeHtml(state.syncCode)}</span>
                  <span class="status-chip">${
                    state.syncStatus === 'syncing'
                      ? 'A sincronizar…'
                      : state.syncStatus === 'error'
                        ? 'Erro de rede (guardado local)'
                        : 'Sincronizado na cloud'
                  }</span>
                </div>
                <div class="action-pair" style="margin-top:8px;flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" data-action="copy-sync-link">Copiar link de retoma</button>
                  <button type="button" class="btn" data-action="sync-now">Sincronizar agora</button>
                  <button type="button" class="btn" data-action="disconnect-cloud-sync">Desligar</button>
                </div>`
              : `<div class="action-pair" style="flex-wrap:wrap;">
                  <button type="button" class="btn btn-primary" data-action="activate-cloud-sync">Ativar código na cloud</button>
                  <button type="button" class="btn" data-action="generate-progress-code">Gerar código offline (MB1)</button>
                </div>`
          }
          ${
            state.generatedProgressCode
              ? `<div class="action-pair" style="margin-top:6px;">
                  <input type="text" readonly class="code-input-inline" id="generated-code-field" value="${escapeHtml(state.generatedProgressCode)}" aria-label="Código de progresso gerado" />
                </div>`
              : ''
          }
          <div class="action-pair progress-code-row">
            <input
              type="text"
              class="code-input-inline"
              id="progress-code-input"
              placeholder="Cola MB-XXXX-XXXX-XXXX, link ?sync=… ou MB1-…"
              value="${escapeHtml(state.progressCodeInput)}"
              aria-label="Colar código de sincronização ou progresso"
            />
            <button type="button" class="btn" data-action="apply-progress-code">Continuar com código</button>
          </div>
          ${
            state.progressModalFeedback
              ? `<div class="helper-slot ${state.progressModalFeedback.ok ? 'is-ok' : 'is-bad'}">${escapeHtml(state.progressModalFeedback.text)}</div>`
              : ''
          }
        </div>

        <div class="modal-actions-row">
          <div class="action-pair" style="flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-action="open-gantt-view">Ver Cronograma Gantt</button>
            <button type="button" class="btn" data-action="open-diagnostic-modal">Diagnóstico &amp; Meta</button>
            <button type="button" class="btn" data-action="export-portfolio-md">Descarregar Portfólio (.md)</button>
            <button type="button" class="btn" data-action="export-progress-json">Backup (.json)</button>
            <button type="button" class="btn" data-action="trigger-import-json">Restaurar (.json)</button>
            <input type="file" id="import-progress-file" accept=".json,application/json" aria-label="Selecionar ficheiro JSON de cópia de segurança do progresso" style="display:none" />
          </div>
          <div class="action-pair">
            ${
              state.confirmClearProgress
                ? `<button type="button" class="btn" data-action="confirm-clear-progress" style="color:var(--color-bad);">Confirmar limpeza</button>
                   <button type="button" class="btn" data-action="cancel-clear-progress">Cancelar</button>`
                : `<button type="button" class="btn" data-action="ask-clear-progress">Limpar progresso</button>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderDiagnosticModal(state: AppState): string {
  const draft = state.diagnosticDraft;
  const plan = evaluateDiagnosticPlan(draft, getCourseMinutes(allTracks));

  return `
    <div class="modal-backdrop" data-action="close-diagnostic-backdrop" role="dialog" aria-modal="true" aria-labelledby="diag-modal-title">
      <div class="progress-modal diag-modal">
        <div class="workbench-toolbar">
          <div>
            <span class="badge-chip">Diagnóstico inicial · 3 perguntas</span>
            <h2 id="diag-modal-title">Onde estás hoje e qual é a tua meta?</h2>
            <p class="measured">Ajusta o ritmo do Cronograma Gantt ao teu tempo real e define o ponto de partida sem perderes o foco de negócio.</p>
          </div>
          <button type="button" class="btn" data-action="close-diagnostic-modal" aria-label="Fechar diagnóstico">Fechar</button>
        </div>

        <div class="diag-section">
          <div class="workbench-toolbar">
            <strong>1. Bagagem prévia (ou faz o nivelamento prático)</strong>
            <button
              type="button"
              class="btn"
              data-action="toggle-placement-quiz"
              aria-pressed="${state.showPlacementQuiz}"
            >
              ${state.showPlacementQuiz ? 'Ocultar nivelamento' : '⚡ Nivelamento prático (4 perguntas · 1 min)'}
            </button>
          </div>
          ${
            state.showPlacementQuiz
              ? (() => {
                  const placement = evaluatePlacementAnswers(state.placementAnswers);
                  return `
                    <div class="placement-quiz-box">
                      <p class="measured">Responde a 4 perguntas rápidas (Negócio, SQL, Pandas e Estatística) para sugerirmos o ponto de partida com base prática, em vez de adivinhares.</p>
                      ${PLACEMENT_QUESTIONS.map((q, idx) => {
                        const sel = state.placementAnswers[q.id];
                        return `
                          <div class="placement-q-card">
                            <p><strong>${idx + 1}. [${escapeHtml(q.pillar)}]</strong> ${escapeHtml(q.question)}</p>
                            <div class="action-pair" style="flex-wrap:wrap;">
                              ${q.options
                                .map((opt, optIdx) => {
                                  const picked = sel === optIdx;
                                  const cls =
                                    sel !== undefined
                                      ? optIdx === q.correctIndex
                                        ? 'is-ok'
                                        : picked
                                          ? 'is-bad'
                                          : ''
                                      : '';
                                  return `
                                    <button
                                      type="button"
                                      class="mode-btn ${cls}"
                                      aria-pressed="${picked}"
                                      data-placement-q="${escapeHtml(q.id)}"
                                      data-placement-opt="${optIdx}"
                                    >${escapeHtml(opt)}</button>
                                  `;
                                })
                                .join('')}
                            </div>
                            ${sel !== undefined ? `<p class="measured">${sel === q.correctIndex ? 'Certo! ' : 'Dica: '}${escapeHtml(q.explanation)}</p>` : ''}
                          </div>
                        `;
                      }).join('')}
                      ${
                        placement.answeredCount > 0
                          ? `<div class="diag-verdict ${placement.complete ? 'is-ok' : ''}">
                              <strong>${escapeHtml(placement.headline)}</strong>
                              <p class="measured">${escapeHtml(placement.detail)}</p>
                              ${
                                placement.complete
                                  ? `<div class="action-pair" style="margin-top:6px;">
                                      <button type="button" class="btn btn-primary" data-action="apply-placement-result">
                                        Usar resultado (${placement.score}/${placement.totalQuestions}) e ir para a etapa →
                                      </button>
                                    </div>`
                                  : ''
                              }
                            </div>`
                          : ''
                      }
                    </div>
                  `;
                })()
              : ''
          }
          <div class="diag-options-grid">
            ${BACKGROUND_OPTIONS.map((opt) => {
              const active = draft.background === opt.id;
              return `
                <button
                  type="button"
                  class="theme-option-card ${active ? 'is-active' : ''}"
                  data-diag-bg="${opt.id}"
                  aria-pressed="${active}"
                >
                  <strong>${escapeHtml(opt.label)}</strong>
                  <span class="theme-option-desc">${escapeHtml(opt.hint)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="diag-row-split">
          <div class="diag-section">
            <strong>2. Horas por semana disponíveis</strong>
            <div class="action-pair" style="flex-wrap:wrap;">
              ${HOURS_OPTIONS.map(
                (h) => `
                  <button
                    type="button"
                    class="mode-btn"
                    aria-pressed="${draft.hoursPerWeek === h}"
                    data-diag-hours="${h}"
                  >${h} h/sem</button>
                `,
              ).join('')}
            </div>
          </div>

          <div class="diag-section">
            <strong>3. Prazo alvo para aplicar às vagas</strong>
            <div class="action-pair" style="flex-wrap:wrap;">
              ${TARGET_MONTHS_OPTIONS.map(
                (m) => `
                  <button
                    type="button"
                    class="mode-btn"
                    aria-pressed="${draft.targetMonths === m}"
                    data-diag-months="${m}"
                  >${m} meses</button>
                `,
              ).join('')}
            </div>
          </div>
        </div>

        <div class="diag-verdict ${plan.fitsTarget ? 'is-ok' : 'is-tight'}">
          <strong>${escapeHtml(plan.routeTitle)}</strong>
          <p>${escapeHtml(plan.verdictLabel)} (${plan.courseHours} h do curso c/ margem + ${plan.portfolioHours} h para 3–4 projetos completos no GitHub = ${plan.totalPlanHours} h totais).</p>
          <p class="measured">${escapeHtml(plan.routeNote)}</p>
        </div>

        <details class="study-plan-panel">
          <summary><strong>Os 4 pilares do percurso e 3 riscos a evitar</strong></summary>
          <div class="diag-pillars-grid" style="margin-top:8px;">
            ${FOUR_PILLARS.map(
              (p) => `
                <div class="diag-pillar-card">
                  <strong>Pilar ${p.num}: ${escapeHtml(p.title)}</strong>
                  <p>${escapeHtml(p.detail)}</p>
                  <span class="measured">${escapeHtml(p.tracks)}</span>
                </div>
              `,
            ).join('')}
          </div>
          <ul class="prose-list diag-risks-list" style="margin-top:10px;">
            ${THREE_RISKS.map(
              (r) => `<li><strong>Evitar ${escapeHtml(r.title)}:</strong> ${escapeHtml(r.guard)}</li>`,
            ).join('')}
          </ul>
        </details>

        <div class="modal-actions-row">
          <div class="action-pair" style="flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-action="apply-diagnostic-and-go">Aplicar ao Cronograma e ir para a etapa sugerida →</button>
            <button type="button" class="btn" data-action="apply-diagnostic-only">Guardar só a meta</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderGuideModal(): string {
  return `
    <div class="modal-backdrop" data-action="close-guide-backdrop" role="dialog" aria-modal="true" aria-labelledby="guide-modal-title">
      <div class="progress-modal diag-modal">
        <div class="workbench-toolbar">
          <div>
            <span class="badge-chip">Guia rápido · 3 janelas</span>
            <h2 id="guide-modal-title">Como navegar e usar a Academia</h2>
            <p class="measured">A interface divide-se em três áreas que trabalham juntas da esquerda para a direita (ou em dois separadores no telemóvel).</p>
          </div>
          <button type="button" class="btn" data-action="close-guide-modal" aria-label="Fechar guia">Fechar</button>
        </div>

        <div class="guide-grid">
          <div class="guide-card">
            <span class="badge-chip">1 · Escolha de etapas</span>
            <h3>Barra superior e índice lateral</h3>
            <p>Escolhe a trilha na barra superior (<strong>1. Python</strong> a <strong>8. Projeto final</strong>) e salta entre etapas no índice à esquerda.</p>
            <ul class="prose-list">
              <li><code>OK</code> = concluída s/ ajuda · <code>REF</code> = c/ apoio · <code>✓</code> = projeto autoavaliado.</li>
              <li><strong>Cronograma</strong> mostra o mapa Gantt por tempo previsto + margem e o teu tempo real.</li>
              <li><strong>Explorador CSV</strong> e <strong>Referência W3</strong> deixam-te inspecionar e descarregar dados.</li>
            </ul>
          </div>

          <div class="guide-card">
            <span class="badge-chip">2 · Descrição (Teoria)</span>
            <h3>Painel central + Quiz</h3>
            <p>Explica o conceito com uma analogia da Mercearia, passo a passo, armadilhas clássicas e tabela de sintaxe.</p>
            <ul class="prose-list">
              <li>No fundo da lição, responde ao <strong>Quiz</strong> para confirmar a compreensão (há perguntas extra nas revisões).</li>
              <li>No topo podes escolher <em>Foco leitura</em>, <em>50/50</em>, <em>Foco código</em> ou arrastar as divisórias.</li>
              <li>No telemóvel alterna entre <strong>📖 Lição</strong> e <strong>⚡ Bancada</strong>.</li>
            </ul>
          </div>

          <div class="guide-card">
            <span class="badge-chip">3 · Teste no IDE de código</span>
            <h3>Bancada interativa à direita</h3>
            <p>Escreves Python, SQL ou Git diretamente no navegador e carregas em <strong>Executar e verificar</strong> (<code>Ctrl + Enter</code>).</p>
            <ul class="prose-list">
              <li><strong>Desafio (0)</strong> é o teste principal que conta para o progresso; os separadores <strong>1, 2…</strong> são treinos extra.</li>
              <li><strong>Experimenta</strong> e <strong>SQL livre</strong> permitem testar ideias sem estragar a resolução.</li>
              <li><strong>Pistas (1/2, 2/2)</strong> ajudam sem revelar a solução; o IDE aceita apenas análise de dados (leitura).</li>
            </ul>
          </div>
        </div>

        <div class="guide-shortcuts">
          <strong>Atalhos e notas úteis:</strong>
          <span><code>Ctrl + Enter</code> executa o código · Duplo clique na divisória repõe o painel · O progresso fica guardado no navegador e podes exportar em <strong>Progresso</strong>.</span>
        </div>

        <div class="modal-actions-row">
          <div class="action-pair" style="flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" data-action="close-guide-modal">Entendido, voltar à lição</button>
            <button type="button" class="btn" data-action="open-diagnostic-modal">🎯 Fazer diagnóstico inicial</button>
            <button type="button" class="btn" data-action="open-gantt-view">Ver Cronograma Gantt</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
