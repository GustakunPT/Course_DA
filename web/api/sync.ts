import { get, put } from '@vercel/blob';

// Códigos novos têm 3 blocos (12 símbolos, ~60 bits): impossíveis de adivinhar.
// Os códigos antigos de 2 blocos continuam a funcionar para não perder progresso.
const CODE_RE = /^MB-[A-Z2-9]{4}-[A-Z2-9]{4}(?:-[A-Z2-9]{4})?$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 símbolos: 256 % 32 === 0, sem enviesamento
const CODE_BLOCKS = 3;
const MAX_BODY_BYTES = 512 * 1024; // progresso + rascunhos cabem folgadamente em 512 KB
const INVALID_CODE_MSG = 'Formato de código inválido. Usa MB-XXXX-XXXX-XXXX.';
/** Códigos antigos de 2 blocos (~40 bits): continuam a funcionar, mas já não se podem criar. */
const LEGACY_CODE_RE = /^MB-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

// ---- Limite de pedidos por IP ----
// Janela deslizante em memória: vale por instância da função (a Vercel reutiliza instâncias),
// por isso trava tentativas em massa de adivinhar códigos sem depender de um serviço externo.
// O cliente envia no máximo um POST a cada 1,2 s e só faz GET ao arrancar ou ao ligar um código.
const RATE_WINDOW_MS = 60_000;
export const RATE_LIMITS = { GET: 20, POST: 120 } as const;
const MAX_TRACKED_IPS = 5_000;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'desconhecido';
}

/** Regista o pedido e devolve quantos segundos faltam para poder tentar de novo (0 = pode seguir). */
function rateLimitRetryAfter(request: Request, method: keyof typeof RATE_LIMITS, now = Date.now()): number {
  const key = `${method}:${clientIp(request)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMITS[method]) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + RATE_WINDOW_MS - now) / 1000));
  }
  recent.push(now);
  hits.delete(key); // reinsere no fim: o Map fica ordenado do menos para o mais recente
  hits.set(key, recent);
  if (hits.size > MAX_TRACKED_IPS) hits.delete(hits.keys().next().value!);
  return 0;
}

/** Só para os testes: limpa os contadores. */
export function resetRateLimits(): void {
  hits.clear();
}

function tooManyRequests(retryAfter: number): Response {
  return new Response(JSON.stringify({ error: 'Demasiados pedidos. Espera um pouco e tenta novamente.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': String(retryAfter),
    },
  });
}

function generateSyncCode(): string {
  const bytes = new Uint8Array(CODE_BLOCKS * 4);
  crypto.getRandomValues(bytes);
  const blocks: string[] = [];
  for (let b = 0; b < CODE_BLOCKS; b++) {
    let block = '';
    for (let i = 0; i < 4; i++) block += ALPHABET[bytes[b * 4 + i] % ALPHABET.length];
    blocks.push(block);
  }
  return `MB-${blocks.join('-')}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeProgressMap(raw: unknown): Record<string, unknown> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, unknown> = {};
  let count = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (count >= 300) break;
    if (k.length > 80 || !isPlainObject(v)) continue;
    const status = v.status === 'helped' ? 'helped' : v.status === 'autonomous' ? 'autonomous' : null;
    if (!status) continue;
    const rec: Record<string, unknown> = {
      status,
      completedAt: typeof v.completedAt === 'string' ? v.completedAt.slice(0, 40) : new Date().toISOString(),
    };
    if (typeof v.quizPassed === 'boolean') rec.quizPassed = v.quizPassed;
    if (typeof v.reviewCount === 'number' && Number.isFinite(v.reviewCount) && v.reviewCount > 0) {
      rec.reviewCount = Math.min(1000, Math.floor(v.reviewCount));
    }
    if (typeof v.lastReviewedAt === 'string' && v.lastReviewedAt.length <= 40) {
      rec.lastReviewedAt = v.lastReviewedAt;
    }
    out[k] = rec;
    count++;
  }
  return out;
}

function sanitizeDraftsMap(raw: unknown): Record<string, string> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, string> = {};
  let count = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (count >= 600) break;
    if (k.length <= 120 && typeof v === 'string' && v.length <= 35_000) {
      out[k] = v;
      count++;
    }
  }
  return out;
}

function sanitizeQuizzesMap(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, number> = {};
  let count = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (count >= 600) break;
    if (k.length <= 80 && typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 10) {
      out[k] = v;
      count++;
    }
  }
  return out;
}

function sanitizeLastLocation(raw: unknown): {
  trackId: string;
  lessonId: string;
  view: 'academia' | 'explorador' | 'referencia' | 'cronograma';
  timestamp: string;
} | null {
  if (!isPlainObject(raw)) return null;
  const view = raw.view;
  if (view !== 'academia' && view !== 'explorador' && view !== 'referencia' && view !== 'cronograma') return null;
  if (typeof raw.trackId !== 'string' || raw.trackId.length > 80) return null;
  if (typeof raw.lessonId !== 'string' || raw.lessonId.length > 80) return null;
  return {
    trackId: raw.trackId,
    lessonId: raw.lessonId,
    view,
    timestamp: typeof raw.timestamp === 'string' ? raw.timestamp.slice(0, 40) : new Date().toISOString(),
  };
}

function sanitizeTimeMap(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, number> = {};
  let count = 0;
  for (const [k, v] of Object.entries(raw)) {
    if (count >= 500) break;
    if (k.length <= 80 && typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[k] = Math.min(360_000, Math.floor(v));
      count++;
    }
  }
  return out;
}

function sanitizeDiag(raw: unknown): {
  background: 'zero' | 'negocio' | 'tech';
  hoursPerWeek: number;
  targetMonths: number;
  updatedAt: string;
} | null {
  if (!isPlainObject(raw)) return null;
  const bg = raw.background;
  if (bg !== 'zero' && bg !== 'negocio' && bg !== 'tech') return null;
  const hrs = Number(raw.hoursPerWeek);
  const months = Number(raw.targetMonths);
  if (!Number.isFinite(hrs) || hrs < 2 || hrs > 40) return null;
  if (!Number.isFinite(months) || months < 1 || months > 36) return null;
  return {
    background: bg,
    hoursPerWeek: Math.round(hrs),
    targetMonths: Math.round(months),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : new Date().toISOString(),
  };
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const retryAfter = rateLimitRetryAfter(request, 'GET');
  if (retryAfter) return tooManyRequests(retryAfter);
  try {
    const url = new URL(request.url);
    const code = (url.searchParams.get('code') ?? '').trim().toUpperCase();
    if (!CODE_RE.test(code)) {
      return jsonResponse({ error: INVALID_CODE_MSG }, 400);
    }

    const result = await get(`sync/${code}.json`, { access: 'private' });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return jsonResponse({ error: 'Código de sincronização não encontrado.' }, 404);
    }

    const text = await new Response(result.stream).text();
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[sync GET]', err);
    return jsonResponse({ error: 'Erro ao carregar sincronização.' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const retryAfter = rateLimitRetryAfter(request, 'POST');
  if (retryAfter) return tooManyRequests(retryAfter);
  try {
    const declaredLength = Number(request.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Dados demasiado grandes para sincronizar.' }, 413);
    }
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Dados demasiado grandes para sincronizar.' }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: 'Corpo JSON inválido.' }, 400);
    }
    if (!isPlainObject(body)) {
      return jsonResponse({ error: 'Corpo JSON inválido.' }, 400);
    }

    let code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (code) {
      if (!CODE_RE.test(code)) {
        return jsonResponse({ error: INVALID_CODE_MSG }, 400);
      }
      // Um código antigo só pode atualizar progresso que já existe: não se criam códigos fracos novos.
      if (LEGACY_CODE_RE.test(code)) {
        const existing = await get(`sync/${code}.json`, { access: 'private' });
        if (!existing || existing.statusCode !== 200) {
          return jsonResponse({ error: 'Código de sincronização não encontrado.' }, 404);
        }
        await existing.stream?.cancel(); // só interessava saber se existe
      }
    } else {
      code = generateSyncCode();
    }

    const progress = sanitizeProgressMap(body.progress);
    const drafts = sanitizeDraftsMap(body.drafts);
    const quizzes = sanitizeQuizzesMap(body.quizzes);
    const lastLocation = sanitizeLastLocation(body.lastLocation);
    const practice = Array.isArray(body.practice)
      ? body.practice.filter((x: unknown) => typeof x === 'string' && x.length <= 80).slice(0, 500)
      : [];
    const lessonTimes = sanitizeTimeMap(body.lessonTimes);
    const diagnostic = sanitizeDiag(body.diagnostic);

    const updatedAt = new Date().toISOString();
    const payload = {
      version: 2,
      code,
      updatedAt,
      progress,
      drafts,
      quizzes,
      practice,
      lessonTimes,
      diagnostic,
      lastLocation,
    };

    await put(`sync/${code}.json`, JSON.stringify(payload), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return jsonResponse({ ok: true, code, updatedAt }, 200);
  } catch (err) {
    console.error('[sync POST]', err);
    return jsonResponse({ error: 'Erro ao guardar sincronização.' }, 500);
  }
}
