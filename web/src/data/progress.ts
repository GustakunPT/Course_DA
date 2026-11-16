import type { Track } from './types';

export type LessonCompletionStatus = 'autonomous' | 'helped';

export interface LessonProgressRecord {
  status: LessonCompletionStatus;
  quizPassed?: boolean;
  completedAt: string;
}

export type UserProgressMap = Record<string, LessonProgressRecord>;

export interface LastVisitedLocation {
  trackId: string;
  lessonId: string;
  view: 'academia' | 'explorador' | 'referencia';
  timestamp: string;
}

export interface ExportableProgress {
  version: 2;
  exportedAt: string;
  progress: UserProgressMap;
  drafts: Record<string, string>;
  quizzes: Record<string, number>;
  /** Treinos resolvidos ("etapa:n"); opcional para aceitar backups antigos. */
  practice?: string[];
}

const STORAGE_V1_KEY = 'mercearia_academia_done_v1';
const STORAGE_V2_KEY = 'mercearia_academia_done_v2';
const STORAGE_DRAFTS_KEY = 'mercearia_academia_drafts_v1';
const STORAGE_QUIZ_KEY = 'mercearia_academia_quiz_v1';
const STORAGE_LAST_LOC_KEY = 'mercearia_academia_last_loc_v1';
const STORAGE_SYNC_CODE_KEY = 'mercearia_academia_sync_code_v1';
const STORAGE_PRACTICE_KEY = 'mercearia-treinos-v1';

/** Aceita só listas de texto curtas (ids de treinos como "py-04-condicoes:2"). */
export function sanitizePractice(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.length <= 80).slice(0, 500);
}

export function loadSavedPractice(): string[] {
  try {
    return sanitizePractice(JSON.parse(localStorage.getItem(STORAGE_PRACTICE_KEY) ?? '[]'));
  } catch {
    return [];
  }
}

export function savePractice(ids: Iterable<string>): void {
  try {
    localStorage.setItem(STORAGE_PRACTICE_KEY, JSON.stringify([...ids]));
  } catch {
    // Sem localStorage (modo privado): os treinos ficam só nesta sessão.
  }
}

export function loadSavedProgress(): UserProgressMap {
  try {
    const rawV2 = localStorage.getItem(STORAGE_V2_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as UserProgressMap;
      }
    }

    // Migração de retrocompatibilidade da v1 (array de IDs)
    const rawV1 = localStorage.getItem(STORAGE_V1_KEY);
    if (rawV1) {
      const arr = JSON.parse(rawV1);
      if (Array.isArray(arr)) {
        const migrated: UserProgressMap = {};
        for (const id of arr) {
          if (typeof id === 'string') {
            migrated[id] = {
              status: 'autonomous',
              completedAt: new Date().toISOString(),
            };
          }
        }
        saveProgress(migrated);
        return migrated;
      }
    }
    return {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: UserProgressMap): void {
  try {
    localStorage.setItem(STORAGE_V2_KEY, JSON.stringify(progress));
    // Manter v1 atualizada com array de IDs para scripts ou ferramentas legado
    const ids = Object.keys(progress);
    localStorage.setItem(STORAGE_V1_KEY, JSON.stringify(ids));
  } catch {
    // Ignorar erros de quota
  }
}

export function loadSavedDrafts(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_DRAFTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

let draftsSaveTimeout: number | undefined;
export function saveDrafts(drafts: Record<string, string>, immediate = false): void {
  const doSave = () => {
    try {
      localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
    } catch {
      // Ignorar erros de quota
    }
  };

  if (immediate) {
    if (draftsSaveTimeout) clearTimeout(draftsSaveTimeout);
    doSave();
  } else {
    if (draftsSaveTimeout) clearTimeout(draftsSaveTimeout);
    draftsSaveTimeout = window.setTimeout(doSave, 300);
  }
}

export function loadSavedQuizzes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_QUIZ_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveQuizzes(quizzes: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_QUIZ_KEY, JSON.stringify(quizzes));
  } catch {
    // Ignorar erros de quota
  }
}

export function loadLastLocation(): LastVisitedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_LAST_LOC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.trackId && parsed.lessonId) {
      return parsed as LastVisitedLocation;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLastLocation(loc: LastVisitedLocation): void {
  try {
    localStorage.setItem(STORAGE_LAST_LOC_KEY, JSON.stringify(loc));
  } catch {
    // Ignorar erros de quota
  }
}

export function clearAllUserProgress(): void {
  try {
    localStorage.removeItem(STORAGE_V1_KEY);
    localStorage.removeItem(STORAGE_V2_KEY);
    localStorage.removeItem(STORAGE_DRAFTS_KEY);
    localStorage.removeItem(STORAGE_QUIZ_KEY);
    localStorage.removeItem(STORAGE_LAST_LOC_KEY);
    localStorage.removeItem(STORAGE_SYNC_CODE_KEY);
    localStorage.removeItem(STORAGE_PRACTICE_KEY);
  } catch {
    // Ignorar
  }
}

export function exportProgressJson(
  progress: UserProgressMap,
  drafts: Record<string, string>,
  quizzes: Record<string, number>,
  practice: string[] = [],
): string {
  const data: ExportableProgress = {
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
    drafts,
    quizzes,
    practice,
  };
  return JSON.stringify(data, null, 2);
}

export function importProgressJson(jsonStr: string): {
  progress: UserProgressMap;
  drafts: Record<string, string>;
  quizzes: Record<string, number>;
  practice: string[];
} {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('O ficheiro JSON não contém um formato válido.');
  }

  const progress: UserProgressMap =
    parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : {};
  const drafts: Record<string, string> =
    parsed.drafts && typeof parsed.drafts === 'object' ? parsed.drafts : {};
  const quizzes: Record<string, number> =
    parsed.quizzes && typeof parsed.quizzes === 'object' ? parsed.quizzes : {};

  saveProgress(progress);
  saveDrafts(drafts, true);
  saveQuizzes(quizzes);
  const practice = sanitizePractice(parsed.practice);
  savePractice(practice);

  return { progress, drafts, quizzes, practice };
}

export function generatePortfolioMarkdown(
  progress: UserProgressMap,
  drafts: Record<string, string>,
  tracks: Track[],
): string {
  const lines: string[] = [
    '# Portefólio de Análise de Dados — Mercearia do Bairro',
    '',
    `*Relatório gerado em ${new Date().toLocaleDateString('pt-PT')} com as soluções desenvolvidas na Academia Interativa.*`,
    '',
    '## 1. Resumo de Competências Práticas Validadas',
    '',
  ];

  let totalSolved = 0;
  let autonomousCount = 0;
  let helpedCount = 0;

  for (const tr of tracks) {
    let trSolved = 0;
    for (const le of tr.lessons) {
      if (progress[le.id]) {
        trSolved++;
        totalSolved++;
        if (progress[le.id].status === 'autonomous') autonomousCount++;
        else helpedCount++;
      }
    }
    lines.push(`- **${tr.fullTitle}:** ${trSolved} de ${tr.lessons.length} etapas concluídas.`);
  }

  lines.push('');
  lines.push(`> **Total Global:** ${totalSolved} desafios resolvidos (${autonomousCount} autónomos, ${helpedCount} com apoio técnico).`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 2. Código e Consultas Desenvolvidas por Trilha');
  lines.push('');

  for (const tr of tracks) {
    lines.push(`### ${tr.fullTitle}`);
    lines.push('');
    for (const le of tr.lessons) {
      const prog = progress[le.id];
      if (!prog) continue;

      const codeKey = `${le.id}:challenge`;
      const userCode =
        drafts[codeKey] ??
        le.pythonChallenge?.solutionCode ??
        le.sqlChallenge?.solutionSql ??
        le.gitChallenge?.solutionCommands ??
        le.exampleCode;

      const lang = le.engine === 'sql' ? 'sql' : le.engine === 'git' ? 'bash' : 'python';
      const statusTag = prog.status === 'autonomous' ? 'Resolvido com sucesso' : 'Resolvido com referência';

      lines.push(`#### Etapa ${le.code} · ${le.title} (${statusTag})`);
      lines.push(`*${le.lede}*`);
      lines.push('');
      lines.push('```' + lang);
      lines.push(userCode.trim());
      lines.push('```');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str: string): Uint8Array {
  const norm = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
  const bin = atob(norm + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export interface CompactProgressPayload {
  v: 1;
  p: Record<string, ['a' | 'h', number?]>;
  q: Record<string, number>;
  d: Record<string, string>;
  /** Treinos resolvidos (opcional). */
  t?: string[];
  l?: { t: string; l: string; v: 'academia' | 'explorador' | 'referencia' };
}

export async function encodeProgressCode(
  progress: UserProgressMap,
  drafts: Record<string, string>,
  quizzes: Record<string, number>,
  lastLoc: LastVisitedLocation | null,
  practice: string[] = [],
): Promise<string> {
  const compactP: Record<string, ['a' | 'h', number?]> = {};
  for (const [id, rec] of Object.entries(progress)) {
    compactP[id] = rec.quizPassed ? [rec.status === 'helped' ? 'h' : 'a', 1] : [rec.status === 'helped' ? 'h' : 'a'];
  }
  const payload: CompactProgressPayload = {
    v: 1,
    p: compactP,
    q: quizzes,
    d: drafts,
    ...(practice.length ? { t: practice } : {}),
    ...(lastLoc ? { l: { t: lastLoc.trackId, l: lastLoc.lessonId, v: lastLoc.view } } : {}),
  };
  const jsonBytes = new TextEncoder().encode(JSON.stringify(payload));

  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    await writer.write(jsonBytes);
    await writer.close();
    const compressed = new Uint8Array(await new Response(cs.readable).arrayBuffer());
    return `MB1-${bytesToBase64Url(compressed)}`;
  }

  return `MB1U-${bytesToBase64Url(jsonBytes)}`;
}

export async function decodeProgressCode(rawCode: string): Promise<{
  progress: UserProgressMap;
  drafts: Record<string, string>;
  quizzes: Record<string, number>;
  practice: string[];
  lastLocation: LastVisitedLocation | null;
}> {
  const code = rawCode.trim();
  let jsonStr: string;

  if (code.startsWith('MB1-')) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('Este navegador não suporta descompressão de códigos MB1-. Usa o backup .json.');
    }
    const bytes = base64UrlToBytes(code.slice(4));
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    await writer.write(new Uint8Array(bytes));
    await writer.close();
    const decompressed = new Uint8Array(await new Response(ds.readable).arrayBuffer());
    jsonStr = new TextDecoder().decode(decompressed);
  } else if (code.startsWith('MB1U-')) {
    const bytes = base64UrlToBytes(code.slice(5));
    jsonStr = new TextDecoder().decode(bytes);
  } else {
    throw new Error('Código inválido. Deve começar por MB1- ou MB1U-.');
  }

  const parsed = JSON.parse(jsonStr) as CompactProgressPayload;
  if (!parsed || parsed.v !== 1 || typeof parsed.p !== 'object') {
    throw new Error('Estrutura do código de progresso inválida.');
  }

  const now = new Date().toISOString();
  const progress: UserProgressMap = {};
  for (const [id, tuple] of Object.entries(parsed.p)) {
    if (Array.isArray(tuple)) {
      progress[id] = {
        status: tuple[0] === 'h' ? 'helped' : 'autonomous',
        quizPassed: tuple[1] === 1,
        completedAt: now,
      };
    }
  }

  const drafts: Record<string, string> = parsed.d && typeof parsed.d === 'object' ? parsed.d : {};
  const quizzes: Record<string, number> = parsed.q && typeof parsed.q === 'object' ? parsed.q : {};
  const lastLocation: LastVisitedLocation | null = parsed.l
    ? {
        trackId: parsed.l.t,
        lessonId: parsed.l.l,
        view: parsed.l.v,
        timestamp: now,
      }
    : null;

  saveProgress(progress);
  saveDrafts(drafts, true);
  saveQuizzes(quizzes);
  if (lastLocation) saveLastLocation(lastLocation);
  const practice = sanitizePractice(parsed.t);
  savePractice(practice);

  return { progress, drafts, quizzes, practice, lastLocation };
}

// Aceita códigos novos (3 blocos) e antigos (2 blocos).
const CLOUD_SYNC_CODE_RE = /^MB-[A-Z2-9]{4}-[A-Z2-9]{4}(?:-[A-Z2-9]{4})?$/;

export function isCloudSyncCode(raw: string): boolean {
  return CLOUD_SYNC_CODE_RE.test(raw.trim().toUpperCase());
}

/** Encontra um código MB-… dentro de texto colado (código solto ou link com ?sync=…). */
export function extractSyncCode(raw: string): string | null {
  const trimmed = raw.trim();
  if (isCloudSyncCode(trimmed)) return trimmed.toUpperCase();
  const match = trimmed.match(/MB-[A-Z2-9]{4}-[A-Z2-9]{4}(?:-[A-Z2-9]{4})?/i);
  return match ? match[0].toUpperCase() : null;
}

/** Link de retoma que abre a Academia já ligada ao código. */
export function buildSyncShareUrl(code: string, baseHref = window.location.href): string {
  const url = new URL(baseHref);
  url.searchParams.set('sync', code);
  return url.toString();
}

export function loadSyncCode(): string | null {
  try {
    const code = localStorage.getItem(STORAGE_SYNC_CODE_KEY);
    if (code && isCloudSyncCode(code)) {
      return code.trim().toUpperCase();
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSyncCode(code: string | null): void {
  try {
    if (!code) {
      localStorage.removeItem(STORAGE_SYNC_CODE_KEY);
    } else {
      localStorage.setItem(STORAGE_SYNC_CODE_KEY, code.trim().toUpperCase());
    }
  } catch {
    // Ignorar erros de quota
  }
}

export function mergeProgressRecords(
  local: UserProgressMap,
  remote: UserProgressMap,
): UserProgressMap {
  const merged: UserProgressMap = { ...remote };
  for (const [id, rec] of Object.entries(local)) {
    const existing = merged[id];
    if (!existing) {
      merged[id] = rec;
    } else {
      merged[id] = {
        status:
          rec.status === 'autonomous' || existing.status === 'autonomous'
            ? 'autonomous'
            : 'helped',
        quizPassed: Boolean(rec.quizPassed || existing.quizPassed),
        completedAt:
          rec.completedAt > existing.completedAt ? rec.completedAt : existing.completedAt,
      };
    }
  }
  return merged;
}

export interface CloudSyncPayload {
  code: string;
  updatedAt: string;
  progress: UserProgressMap;
  drafts: Record<string, string>;
  quizzes: Record<string, number>;
  practice: string[];
  lastLocation: LastVisitedLocation | null;
}

export async function pushCloudSync(payload: {
  code?: string | null;
  progress: UserProgressMap;
  drafts: Record<string, string>;
  quizzes: Record<string, number>;
  practice?: string[];
  lastLocation: LastVisitedLocation | null;
}): Promise<{ code: string; updatedAt: string }> {
  const res = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: payload.code ?? undefined,
      progress: payload.progress,
      drafts: payload.drafts,
      quizzes: payload.quizzes,
      practice: payload.practice ?? [],
      lastLocation: payload.lastLocation,
    }),
  });
  const data = (await res.json()) as { ok?: boolean; code?: string; updatedAt?: string; error?: string };
  if (!res.ok || !data.code) {
    throw new Error(data.error ?? 'Não foi possível guardar o progresso na cloud.');
  }
  saveSyncCode(data.code);
  return { code: data.code, updatedAt: data.updatedAt ?? new Date().toISOString() };
}

export async function pullCloudSync(code: string): Promise<CloudSyncPayload> {
  const normalized = code.trim().toUpperCase();
  if (!isCloudSyncCode(normalized)) {
    throw new Error('Formato inválido. Usa um código MB-XXXX-XXXX-XXXX.');
  }
  const res = await fetch(`/api/sync?code=${encodeURIComponent(normalized)}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = (await res.json()) as Partial<CloudSyncPayload> & { error?: string };
  if (!res.ok || !data.code) {
    throw new Error(data.error ?? 'Código de sincronização não encontrado.');
  }
  return {
    code: data.code,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    progress: data.progress && typeof data.progress === 'object' ? data.progress : {},
    drafts: data.drafts && typeof data.drafts === 'object' ? data.drafts : {},
    quizzes: data.quizzes && typeof data.quizzes === 'object' ? data.quizzes : {},
    practice: sanitizePractice(data.practice),
    lastLocation: data.lastLocation ?? null,
  };
}
