import type { UserProgressMap } from '../data/progress';
import {
  evaluateDiagnosticPlan,
  FOUR_PILLARS,
  THREE_RISKS,
  type DiagnosticProfile,
} from '../data/diagnostic';
import {
  formatHoursApproxPt,
  formatMinutesPt,
  getLessonBaseMinutes,
  getLessonBufferMinutes,
  getTrackBufferMinutes,
  type LessonTimingInfo,
} from '../data/studyPlan';
import { compareActualVsProjected, type LessonTimeMap, type PaceComparison } from '../data/timeTracker';
import { buildSpacedReviewSummary } from '../data/spacedReview';
import { buildStudyTimeReport } from '../data/studyStats';
import { TRACK_INDEX } from '../data/trackIndex';
import { escapeHtml } from './html';

export interface GanttLessonRef extends LessonTimingInfo {
  code: string;
  title: string;
}

export interface GanttTrackRef {
  id: string;
  shortTitle: string;
  fullTitle: string;
  lessons: GanttLessonRef[];
}

export type GanttLessonStatus = 'autonomous' | 'helped' | 'projeto' | 'todo';
export type GanttFilterStatus = 'all' | 'todo' | 'done';

export interface GanttLessonNode {
  lesson: GanttLessonRef;
  trackId: string;
  baseMinutes: number;
  bufferMinutes: number;
  /** Tempo projetado total da etapa (base + buffer). */
  minutes: number;
  actualMinutes: number;
  /** Enchimento visual da barra projetada (0 a 100%). */
  fillPct: number;
  pace: PaceComparison;
  startMin: number;
  endMin: number;
  startWeek: number;
  endWeek: number;
  leftPct: number;
  widthPct: number;
  bufferSharePct: number;
  status: GanttLessonStatus;
}

export interface GanttTrackGroup {
  track: GanttTrackRef;
  color: string;
  softColor: string;
  startMin: number;
  endMin: number;
  baseMinutes: number;
  lessonBufferMinutes: number;
  themeBufferMinutes: number;
  /** Tempo total projetado do tema (etapas base + buffers das etapas + buffer do tema). */
  totalMinutes: number;
  /** Soma do tempo projetado das etapas concluídas (+ buffer do tema se concluído). */
  completedMinutes: number;
  /** Soma incluindo avanço parcial por tempo gasto em etapas em curso. */
  effectiveProgressMinutes: number;
  actualMinutes: number;
  /** Soma do tempo projetado apenas das etapas já concluídas (para comparar Real vs Projetado). */
  projectedOfDoneMinutes: number;
  doneCount: number;
  progressTimePct: number;
  leftPct: number;
  widthPct: number;
  themeBufferSharePct: number;
  isComplete: boolean;
  lessons: GanttLessonNode[];
}

export interface GanttMonthBlock {
  label: string;
  weekSpan: number;
}

export interface GanttModel {
  paceMinutesPerWeek: number;
  totalWeeks: number;
  timelineTotalMinutes: number;
  totalCourseMinutes: number;
  totalBaseMinutes: number;
  totalBufferMinutes: number;
  completedCourseMinutes: number;
  effectiveProgressMinutes: number;
  totalActualMinutes: number;
  actualOfDoneMinutes: number;
  projectedOfDoneMinutes: number;
  baseOfDoneMinutes: number;
  overallPace: PaceComparison;
  totalLessons: number;
  completedLessonsCount: number;
  remainingMinutes: number;
  remainingWeeksApprox: number;
  progressTimePct: number;
  months: GanttMonthBlock[];
  groups: GanttTrackGroup[];
}

export const GANTT_PACE_OPTIONS = [
  { minutes: 240, label: '4 h/sem' },
  { minutes: 360, label: '6 h/sem (10 sem.)' },
  { minutes: 480, label: '8 h/sem' },
  { minutes: 600, label: '10 h/sem' },
  { minutes: 720, label: '12 h/sem' },
];

const TRACK_PALETTE: Record<string, { color: string; soft: string }> = {
  python: { color: '#2b6cb0', soft: 'rgba(43, 108, 176, 0.16)' },
  sql: { color: '#2f855a', soft: 'rgba(47, 133, 90, 0.16)' },
  pandas: { color: '#d97706', soft: 'rgba(217, 119, 6, 0.16)' },
  git: { color: '#c53030', soft: 'rgba(197, 48, 48, 0.16)' },
  bi: { color: '#7c3aed', soft: 'rgba(124, 58, 237, 0.16)' },
  estatistica: { color: '#0d9488', soft: 'rgba(13, 148, 136, 0.16)' },
  carreira: { color: '#4338ca', soft: 'rgba(67, 56, 202, 0.16)' },
  'projeto-final': { color: '#b45309', soft: 'rgba(180, 83, 9, 0.16)' },
};

function paletteForTrack(trackId: string, idx: number): { color: string; soft: string } {
  if (TRACK_PALETTE[trackId]) return TRACK_PALETTE[trackId];
  const fallbacks = Object.values(TRACK_PALETTE);
  return fallbacks[idx % fallbacks.length];
}

function resolveLessonStatus(lesson: GanttLessonRef, progress: UserProgressMap): GanttLessonStatus {
  const rec = progress[lesson.id];
  if (!rec) return 'todo';
  if (lesson.engine === 'projeto') return 'projeto';
  return rec.status === 'helped' ? 'helped' : 'autonomous';
}

export function buildGanttModel(
  tracks: GanttTrackRef[],
  progress: UserProgressMap,
  paceMinutesPerWeek = 360,
  lessonTimes: LessonTimeMap = {},
): GanttModel {
  const safePace = Math.max(60, paceMinutesPerWeek);
  const totalCourseMinutes = tracks.reduce(
    (sum, t) =>
      sum +
      t.lessons.reduce((s, l) => s + getLessonBaseMinutes(l) + getLessonBufferMinutes(l), 0) +
      getTrackBufferMinutes(t),
    0,
  );
  const totalWeeks = Math.max(1, Math.ceil(totalCourseMinutes / safePace));
  const timelineTotalMinutes = totalWeeks * safePace;

  let cursor = 0;
  let totalBaseMinutes = 0;
  let totalBufferMinutes = 0;
  let completedCourseMinutes = 0;
  let effectiveProgressMinutes = 0;
  let totalActualMinutes = 0;
  let actualOfDoneMinutes = 0;
  let projectedOfDoneMinutes = 0;
  let baseOfDoneMinutes = 0;
  let totalLessons = 0;
  let completedLessonsCount = 0;

  const groups: GanttTrackGroup[] = tracks.map((track, idx) => {
    const pal = paletteForTrack(track.id, idx);
    const trackStart = cursor;
    let trackBaseMin = 0;
    let trackLessonBufMin = 0;
    let trackCompletedMin = 0;
    let trackEffectiveMin = 0;
    let trackActualMin = 0;
    let trackProjDoneMin = 0;
    let trackDoneCount = 0;

    const lessons: GanttLessonNode[] = track.lessons.map((lesson) => {
      const baseMinutes = getLessonBaseMinutes(lesson);
      const bufferMinutes = getLessonBufferMinutes(lesson);
      const minutes = baseMinutes + bufferMinutes;
      const startMin = cursor;
      const endMin = startMin + minutes;
      cursor = endMin;

      trackBaseMin += baseMinutes;
      trackLessonBufMin += bufferMinutes;

      const actualSec = lessonTimes[lesson.id] ?? 0;
      const actualMinutes = actualSec > 0 ? Math.round((actualSec / 60) * 10) / 10 : 0;
      const status = resolveLessonStatus(lesson, progress);
      const pace = compareActualVsProjected(actualMinutes, baseMinutes, minutes);

      totalLessons++;
      trackActualMin += actualMinutes;
      totalActualMinutes += actualMinutes;

      let fillPct = 0;
      if (status !== 'todo') {
        fillPct = 100;
        trackDoneCount++;
        completedLessonsCount++;
        trackCompletedMin += minutes;
        trackEffectiveMin += minutes;
        trackProjDoneMin += minutes;
        completedCourseMinutes += minutes;
        effectiveProgressMinutes += minutes;
        projectedOfDoneMinutes += minutes;
        baseOfDoneMinutes += baseMinutes;
        actualOfDoneMinutes += actualMinutes;
      } else if (actualMinutes > 0) {
        fillPct = Math.min(95, Math.max(4, Math.round((actualMinutes / minutes) * 100)));
        const partial = Math.min(minutes * 0.9, actualMinutes);
        trackEffectiveMin += partial;
        effectiveProgressMinutes += partial;
      }

      const startWeek = Math.floor(startMin / safePace) + 1;
      const endWeek = Math.max(startWeek, Math.ceil(endMin / safePace));
      return {
        lesson,
        trackId: track.id,
        baseMinutes,
        bufferMinutes,
        minutes,
        actualMinutes,
        fillPct,
        pace,
        startMin,
        endMin,
        startWeek,
        endWeek,
        leftPct: (startMin / timelineTotalMinutes) * 100,
        widthPct: (minutes / timelineTotalMinutes) * 100,
        bufferSharePct: (bufferMinutes / minutes) * 100,
        status,
      };
    });

    const themeBufferMinutes = getTrackBufferMinutes(track);
    cursor += themeBufferMinutes;

    totalBaseMinutes += trackBaseMin;
    totalBufferMinutes += trackLessonBufMin + themeBufferMinutes;

    const isComplete = track.lessons.length > 0 && trackDoneCount === track.lessons.length;
    if (isComplete) {
      trackCompletedMin += themeBufferMinutes;
      trackEffectiveMin += themeBufferMinutes;
      completedCourseMinutes += themeBufferMinutes;
      effectiveProgressMinutes += themeBufferMinutes;
    }

    const totalMinutes = cursor - trackStart;
    const progressTimePct =
      totalMinutes > 0 ? Math.min(100, Math.round((trackEffectiveMin / totalMinutes) * 100)) : 0;

    return {
      track,
      color: pal.color,
      softColor: pal.soft,
      startMin: trackStart,
      endMin: cursor,
      baseMinutes: trackBaseMin,
      lessonBufferMinutes: trackLessonBufMin,
      themeBufferMinutes,
      totalMinutes,
      completedMinutes: trackCompletedMin,
      effectiveProgressMinutes: trackEffectiveMin,
      actualMinutes: trackActualMin,
      projectedOfDoneMinutes: trackProjDoneMin,
      doneCount: trackDoneCount,
      progressTimePct,
      leftPct: (trackStart / timelineTotalMinutes) * 100,
      widthPct: (totalMinutes / timelineTotalMinutes) * 100,
      themeBufferSharePct: totalMinutes > 0 ? (themeBufferMinutes / totalMinutes) * 100 : 0,
      isComplete,
      lessons,
    };
  });

  const months: GanttMonthBlock[] = [];
  let wLeft = totalWeeks;
  let mIdx = 1;
  while (wLeft > 0) {
    const span = Math.min(4, wLeft);
    months.push({ label: `Mês ${mIdx}`, weekSpan: span });
    wLeft -= span;
    mIdx++;
  }

  const remainingMinutes = Math.max(0, totalCourseMinutes - completedCourseMinutes);
  const remainingWeeksApprox = Math.ceil(remainingMinutes / safePace);
  const progressTimePct =
    totalCourseMinutes > 0 ? Math.min(100, Math.round((effectiveProgressMinutes / totalCourseMinutes) * 100)) : 0;
  const overallPace = compareActualVsProjected(actualOfDoneMinutes, baseOfDoneMinutes, projectedOfDoneMinutes);

  return {
    paceMinutesPerWeek: safePace,
    totalWeeks,
    timelineTotalMinutes,
    totalCourseMinutes,
    totalBaseMinutes,
    totalBufferMinutes,
    completedCourseMinutes,
    effectiveProgressMinutes,
    totalActualMinutes,
    actualOfDoneMinutes,
    projectedOfDoneMinutes,
    baseOfDoneMinutes,
    overallPace,
    totalLessons,
    completedLessonsCount,
    remainingMinutes,
    remainingWeeksApprox,
    progressTimePct,
    months,
    groups,
  };
}

function statusBadgeText(status: GanttLessonStatus): string {
  if (status === 'autonomous' || status === 'projeto') return '✓';
  if (status === 'helped') return 'REF';
  return '○';
}

function statusLabelPt(status: GanttLessonStatus): string {
  if (status === 'autonomous') return 'Concluída';
  if (status === 'projeto') return 'Concluída (autoavaliada)';
  if (status === 'helped') return 'Concluída c/ apoio';
  return 'Por fazer';
}

export interface GanttRenderOptions {
  paceMinutesPerWeek: number;
  filterStatus: GanttFilterStatus;
  collapsedTracks: Set<string>;
  currentLessonId: string;
  lessonTimes?: LessonTimeMap;
  diagnostic?: DiagnosticProfile | null;
  quizSelection?: Record<string, number>;
}

export function renderGanttHtml(
  tracks: GanttTrackRef[],
  progress: UserProgressMap,
  opts: GanttRenderOptions,
): string {
  const model = buildGanttModel(tracks, progress, opts.paceMinutesPerWeek, opts.lessonTimes ?? {});
  const weekColsStyle = `grid-template-columns: repeat(${model.totalWeeks}, minmax(34px, 1fr))`;
  const minTimelinePx = Math.max(540, model.totalWeeks * 42);

  const monthCells = model.months
    .map(
      (m) =>
        `<div class="gantt-month-cell" style="grid-column: span ${m.weekSpan};">${escapeHtml(m.label)}</div>`,
    )
    .join('');

  const weekCells = Array.from({ length: model.totalWeeks }, (_, i) => {
    const w = i + 1;
    const hFrom = Math.round(((w - 1) * model.paceMinutesPerWeek) / 60);
    const hTo = Math.round((w * model.paceMinutesPerWeek) / 60);
    return `<div class="gantt-week-cell" title="Semana ${w}: ${hFrom} h a ${hTo} h acumuladas">${w}</div>`;
  }).join('');

  const weekBgLines = Array.from({ length: model.totalWeeks }, () => `<div class="gantt-grid-col"></div>`).join('');

  const rowsHtml = model.groups
    .map((group) => {
      const collapsed = opts.collapsedTracks.has(group.track.id);
      const filteredLessons = group.lessons.filter((node) => {
        if (opts.filterStatus === 'todo') return node.status === 'todo';
        if (opts.filterStatus === 'done') return node.status !== 'todo';
        return true;
      });
      if (opts.filterStatus !== 'all' && filteredLessons.length === 0) return '';

      const actualTrackTxt =
        group.actualMinutes > 0
          ? `${formatMinutesPt(Math.round(group.actualMinutes))} real`
          : '0 min real';
      const trackMetaTxt = `${group.doneCount}/${group.track.lessons.length} · ${group.progressTimePct}% · ${actualTrackTxt} / ${formatHoursApproxPt(group.totalMinutes)}`;
      const trackTip =
        `${group.track.fullTitle} — ${group.doneCount}/${group.track.lessons.length} etapas · ` +
        `Base: ${formatMinutesPt(group.baseMinutes)} + Margem etapas: ${formatMinutesPt(group.lessonBufferMinutes)} + Margem tema: ${formatMinutesPt(group.themeBufferMinutes)} = ${formatMinutesPt(group.totalMinutes)} projetados · ` +
        `Tempo real registado: ${formatMinutesPt(Math.round(group.actualMinutes))}`;

      const trackRow = `
        <div class="gantt-row gantt-row-theme" style="--theme-color:${group.color}; --theme-soft:${group.softColor};">
          <button
            type="button"
            class="gantt-task-cell gantt-theme-btn"
            data-gantt-toggle-track="${escapeHtml(group.track.id)}"
            aria-expanded="${!collapsed}"
            title="${escapeHtml(trackTip)}"
          >
            <span class="gantt-theme-tag">
              <span class="gantt-caret" aria-hidden="true">${collapsed ? '▸' : '▾'}</span>
              <strong>${escapeHtml(group.track.shortTitle)}</strong>
            </span>
            <span class="gantt-theme-meta">${escapeHtml(trackMetaTxt)}</span>
          </button>
          <div class="gantt-timeline-cell">
            <div class="gantt-grid-lines" style="${weekColsStyle};">${weekBgLines}</div>
            <div
              class="gantt-summary-bar"
              style="left: ${group.leftPct.toFixed(3)}%; width: ${group.widthPct.toFixed(3)}%;"
              title="${escapeHtml(trackTip)}"
            >
              <div class="gantt-summary-buffer" style="width: ${group.themeBufferSharePct.toFixed(2)}%;" title="Margem de consolidação do tema (+${group.themeBufferMinutes} min)"></div>
              <div class="gantt-summary-fill" style="width: ${group.progressTimePct}%;"></div>
              <span class="gantt-milestone ${group.isComplete ? 'is-complete' : ''}" aria-hidden="true">◆</span>
            </div>
            <span
              class="gantt-summary-label"
              style="${
                group.leftPct + group.widthPct > 78
                  ? `right: calc(${(100 - group.leftPct).toFixed(3)}% + 10px);`
                  : `left: calc(${(group.leftPct + group.widthPct).toFixed(3)}% + 10px);`
              }"
            >${group.progressTimePct}% · ${escapeHtml(actualTrackTxt)} / ${escapeHtml(formatHoursApproxPt(group.totalMinutes))}</span>
          </div>
        </div>
      `;

      if (collapsed) return trackRow;

      const lessonRows = filteredLessons
        .map((node, i) => {
          const isCurrent = node.lesson.id === opts.currentLessonId;
          const projLabel = `${node.baseMinutes}+${node.bufferMinutes}m`;
          const hasActual = node.actualMinutes > 0;
          const actualShort = hasActual ? `${Math.round(node.actualMinutes)}m real` : '';
          const statusTitle = statusLabelPt(node.status);
          const hStart = (node.startMin / 60).toFixed(1).replace('.', ',');
          const hEnd = (node.endMin / 60).toFixed(1).replace('.', ',');
          const tooltip =
            `${node.lesson.code} · ${node.lesson.title} | ` +
            `Projetado: ${formatMinutesPt(node.baseMinutes)} + ${node.bufferMinutes} min margem = ${formatMinutesPt(node.minutes)} | ` +
            `Real: ${hasActual ? formatMinutesPt(Math.round(node.actualMinutes)) : '0 min'} (${node.pace.label}) | ` +
            `Sem. ${node.startWeek}${node.endWeek > node.startWeek ? `–${node.endWeek}` : ''} (${hStart}–${hEnd} h) · ${statusTitle}`;
          const showConnector = i > 0;
          const barCaption = hasActual
            ? `${Math.round(node.actualMinutes)}m / ${projLabel}`
            : formatMinutesPt(node.minutes);
          const paceClass = node.pace.zone !== 'none' ? `is-pace-${node.pace.zone}` : '';

          return `
            <div
              class="gantt-row gantt-row-lesson ${isCurrent ? 'is-current' : ''} is-${node.status}"
              style="--theme-color:${group.color}; --theme-soft:${group.softColor};"
            >
              <button
                type="button"
                class="gantt-task-cell gantt-lesson-btn"
                data-gantt-jump-track="${escapeHtml(group.track.id)}"
                data-gantt-jump-lesson="${escapeHtml(node.lesson.id)}"
                title="${escapeHtml(tooltip)}"
              >
                <span class="gantt-status-dot is-${node.status}" aria-label="${escapeHtml(statusTitle)}">${statusBadgeText(node.status)}</span>
                <span class="gantt-lesson-name">${escapeHtml(node.lesson.code)}. ${escapeHtml(node.lesson.title)}</span>
                <span class="gantt-lesson-dur ${paceClass}">${hasActual ? `${Math.round(node.actualMinutes)}/` : ''}${escapeHtml(projLabel)}</span>
              </button>
              <div class="gantt-timeline-cell">
                <div class="gantt-grid-lines" style="${weekColsStyle};">${weekBgLines}</div>
                ${
                  showConnector
                    ? `<span class="gantt-connector" style="left: ${node.leftPct.toFixed(3)}%;" aria-hidden="true"></span>`
                    : ''
                }
                <button
                  type="button"
                  class="gantt-bar is-${node.status} ${paceClass}"
                  style="left: ${node.leftPct.toFixed(3)}%; width: max(${node.widthPct.toFixed(3)}%, 16px);"
                  data-gantt-jump-track="${escapeHtml(group.track.id)}"
                  data-gantt-jump-lesson="${escapeHtml(node.lesson.id)}"
                  title="${escapeHtml(tooltip)}"
                >
                  <span class="gantt-bar-buffer-zone" style="width: ${node.bufferSharePct.toFixed(2)}%;" aria-hidden="true"></span>
                  <span class="gantt-bar-fill" style="width: ${node.fillPct}%;"></span>
                  <span class="gantt-bar-inner">${node.status === 'todo' ? '' : '✓'}</span>
                </button>
                <span
                  class="gantt-bar-caption ${paceClass}"
                  style="${
                    node.leftPct + node.widthPct > 84
                      ? `right: calc(${(100 - node.leftPct).toFixed(3)}% + 8px);`
                      : `left: calc(${node.leftPct.toFixed(3)}% + max(${node.widthPct.toFixed(3)}%, 16px) + 8px);`
                  }"
                >${escapeHtml(barCaption)}${node.status !== 'todo' && actualShort && node.pace.zone !== 'none' ? ` · ${escapeHtml(node.pace.label)}` : ''}</span>
              </div>
            </div>
          `;
        })
        .join('');

      return trackRow + lessonRows;
    })
    .join('');

  const legendTracks = model.groups
    .map(
      (g) =>
        `<span class="gantt-legend-item"><span class="gantt-legend-swatch" style="background:${g.color};"></span>${escapeHtml(g.track.shortTitle)}</span>`,
    )
    .join('');

  const realVsProjCard =
    model.totalActualMinutes > 0
      ? `${escapeHtml(formatMinutesPt(Math.round(model.totalActualMinutes)))} / ${escapeHtml(formatHoursApproxPt(model.totalCourseMinutes))}`
      : `0 min / ${escapeHtml(formatHoursApproxPt(model.totalCourseMinutes))}`;
  const realVsProjSub =
    model.actualOfDoneMinutes > 0 && model.projectedOfDoneMinutes > 0
      ? `Nas concluídas: ${formatMinutesPt(Math.round(model.actualOfDoneMinutes))} reais vs ${formatMinutesPt(model.projectedOfDoneMinutes)} proj. (${model.overallPace.label})`
      : `Inclui ${formatHoursApproxPt(model.totalBufferMinutes)} de margem (buffer)`;

  return `
    <div class="gantt-shell">
      <section class="seam-panel gantt-header-panel">
        <div class="gantt-title-block">
          <div>
            <span class="badge-chip">Cronograma com margem (buffer) · Real vs Projetado</span>
            <h1>Progresso por Tema e por Etapa</h1>
            <p class="measured">Cada barra mostra o tempo previsto + margem de ~20% por etapa e margem de revisão por tema, e vai enchendo conforme o teu avanço e tempo real registado. Clica em qualquer etapa para a abrir.</p>
          </div>
        </div>

        <div class="progress-summary-grid">
          <div class="progress-stat-card">
            <div class="progress-stat-val">${model.progressTimePct}%</div>
            <div class="progress-stat-lbl">Barra projetada preenchida</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${realVsProjCard}</div>
            <div class="progress-stat-lbl">${escapeHtml(realVsProjSub)}</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${model.completedLessonsCount} / ${model.totalLessons}</div>
            <div class="progress-stat-lbl">Etapas concluídas</div>
          </div>
          <div class="progress-stat-card">
            <div class="progress-stat-val">${model.remainingWeeksApprox === 0 ? 'Concluído!' : `~${model.remainingWeeksApprox} sem.`}</div>
            <div class="progress-stat-lbl">Restante (${escapeHtml(formatHoursApproxPt(model.remainingMinutes))} c/ margem)</div>
          </div>
        </div>

        <details class="schema-drawer gantt-controls-drawer">
          <summary>Ritmo semanal, filtros, legenda e diagnóstico</summary>
          <div class="gantt-legend-box" aria-label="Legenda do cronograma" style="margin-top:var(--space-xs);">
            <div class="gantt-legend-group">${legendTracks}</div>
            <div class="gantt-legend-states">
              <span class="gantt-legend-item"><span class="gantt-state-pill is-autonomous"></span>Concluída (100%)</span>
              <span class="gantt-legend-item"><span class="gantt-state-pill is-helped"></span>C/ apoio</span>
              <span class="gantt-legend-item"><span class="gantt-state-pill is-todo"></span>Por fazer / em curso</span>
              <span class="gantt-legend-item"><span class="gantt-state-pill is-buffer"></span>Zona de margem</span>
              <span class="gantt-legend-item"><span class="gantt-milestone is-complete" style="position:static;">◆</span>Marco do tema</span>
            </div>
          </div>

          <div class="gantt-toolbar" style="margin-top:var(--space-xs);">
          <div class="gantt-control-group" role="group" aria-label="Ritmo de estudo semanal">
            <span class="gantt-control-label">Ritmo:</span>
            ${GANTT_PACE_OPTIONS.map(
              (opt) => `
                <button
                  type="button"
                  class="mode-btn"
                  aria-pressed="${opts.paceMinutesPerWeek === opt.minutes}"
                  data-gantt-pace="${opt.minutes}"
                >${escapeHtml(opt.label)}</button>
              `,
            ).join('')}
          </div>

          <div class="gantt-control-group" role="group" aria-label="Filtrar etapas por estado">
            <span class="gantt-control-label">Mostrar:</span>
            <button type="button" class="mode-btn" aria-pressed="${opts.filterStatus === 'all'}" data-gantt-filter="all">Todas</button>
            <button type="button" class="mode-btn" aria-pressed="${opts.filterStatus === 'todo'}" data-gantt-filter="todo">Por fazer</button>
            <button type="button" class="mode-btn" aria-pressed="${opts.filterStatus === 'done'}" data-gantt-filter="done">Concluídas</button>
          </div>

          <div class="gantt-control-group">
            <button type="button" class="btn" data-action="gantt-expand-all">Expandir tudo</button>
            <button type="button" class="btn" data-action="gantt-collapse-all">Só temas</button>
          </div>
        </div>

        ${(() => {
          const diagEval = opts.diagnostic
            ? evaluateDiagnosticPlan(opts.diagnostic, model.totalCourseMinutes)
            : null;
          return `
            <div class="gantt-diag-strip ${diagEval ? (diagEval.fitsTarget ? 'is-ok' : 'is-tight') : ''}">
              <div class="gantt-diag-info">
                ${
                  diagEval && opts.diagnostic
                    ? `<strong>${escapeHtml(diagEval.routeTitle)}</strong> · <span>Meta: ${opts.diagnostic.targetMonths} meses (${opts.diagnostic.hoursPerWeek} h/sem)</span> · <span class="measured">${escapeHtml(diagEval.verdictLabel)}</span>`
                    : `<strong>Diagnóstico inicial:</strong> <span class="measured">Define a tua bagagem, horas por semana e prazo alvo para ajustar este cronograma ao teu ritmo.</span>`
                }
              </div>
              <button type="button" class="btn btn-primary" data-action="open-diagnostic-modal">
                ${diagEval ? 'Ajustar diagnóstico' : 'Fazer diagnóstico (30 s)'}
              </button>
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
          `;
        })()}

        ${(() => {
          const review = buildSpacedReviewSummary(TRACK_INDEX, progress, opts.quizSelection ?? {});
          const timeReport = buildStudyTimeReport(TRACK_INDEX, progress, opts.lessonTimes ?? {});
          if (review.totalTracked === 0 && timeReport.trackedLessonsCount === 0) return '';

          const reviewHtml =
            review.totalTracked > 0
              ? `
                <div class="study-insight-card">
                  <div class="review-panel-head">
                    <strong>Revisão espaçada (1 · 3 · 7 · 14 · 30 dias)</strong>
                    <span class="status-chip ${review.dueNow.length > 0 ? 'is-person' : 'is-ok'}">
                      ${review.dueNow.length > 0 ? `${review.dueNow.length} para rever hoje` : 'Tudo em dia'}
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
                                <strong>${escapeHtml(item.lessonCode)} · ${escapeHtml(item.lessonTitle)}</strong>
                                <span class="measured">${escapeHtml(item.trackShortTitle)} · ${escapeHtml(item.reason)}</span>
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
                      : `<p class="measured">${review.upcoming.length} próxima(s) nos próximos 3 dias · ${review.consolidatedCount} já consolidadas.</p>`
                  }
                </div>
              `
              : '';

          const timeHtml =
            timeReport.trackedLessonsCount > 0
              ? `
                <div class="study-insight-card">
                  <div class="review-panel-head">
                    <strong>${timeReport.hasOverBudget ? 'Onde gastaste mais tempo do que o previsto' : 'Etapas com mais tempo útil registado'}</strong>
                    <span class="status-chip">${timeReport.trackedLessonsCount} etapa(s) medidas · ${timeReport.overBudgetCount} acima da margem</span>
                  </div>
                  <ul class="review-list">
                    ${timeReport.topTimeDrains
                      .slice(0, 5)
                      .map((st) => {
                        const deltaText =
                          st.deltaMinutes > 0
                            ? `+${st.deltaMinutes.toFixed(0)} min acima`
                            : `${Math.abs(st.deltaMinutes).toFixed(0)} min abaixo`;
                        return `
                          <li class="review-item">
                            <div class="review-item-info">
                              <strong>${escapeHtml(st.lessonCode)} · ${escapeHtml(st.lessonTitle)}</strong>
                              <span class="measured">${escapeHtml(st.trackShortTitle)} · ${st.actualMinutes.toFixed(0)} min reais vs ${st.projectedMinutes} min prev. (${deltaText})</span>
                            </div>
                            <button type="button" class="btn" data-gantt-jump-track="${escapeHtml(st.trackId)}" data-gantt-jump-lesson="${escapeHtml(st.lessonId)}">Abrir →</button>
                          </li>
                        `;
                      })
                      .join('')}
                  </ul>
                </div>
              `
              : '';

          return `<div class="study-insights-grid">${reviewHtml}${timeHtml}</div>`;
        })()}
        </details>
      </section>

      <section class="seam-panel gantt-board-panel">
        <div class="gantt-scroll">
          <div class="gantt-board" style="--gantt-timeline-min: ${minTimelinePx}px;">
            <div class="gantt-head">
              <div class="gantt-head-tasks">
                <strong>Temas &amp; Etapas</strong>
                <span class="measured">Real / Base+Margem</span>
              </div>
              <div class="gantt-head-timeline">
                <div class="gantt-months-row" style="${weekColsStyle};">${monthCells}</div>
                <div class="gantt-weeks-row" style="${weekColsStyle};">${weekCells}</div>
              </div>
            </div>
            <div class="gantt-body">
              ${
                rowsHtml ||
                `<p class="gantt-empty">Nenhuma etapa corresponde ao filtro atual.</p>`
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
