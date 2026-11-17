import { get, put } from '@vercel/blob';

// Códigos novos têm 3 blocos (12 símbolos, ~60 bits): impossíveis de adivinhar.
// Os códigos antigos de 2 blocos continuam a funcionar para não perder progresso.
const CODE_RE = /^MB-[A-Z2-9]{4}-[A-Z2-9]{4}(?:-[A-Z2-9]{4})?$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 símbolos: 256 % 32 === 0, sem enviesamento
const CODE_BLOCKS = 3;
const MAX_BODY_BYTES = 512 * 1024; // progresso + rascunhos cabem folgadamente em 512 KB
const INVALID_CODE_MSG = 'Formato de código inválido. Usa MB-XXXX-XXXX-XXXX.';

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
    } else {
      code = generateSyncCode();
    }

    const progress = isPlainObject(body.progress) ? body.progress : {};
    const drafts = isPlainObject(body.drafts) ? body.drafts : {};
    const quizzes = isPlainObject(body.quizzes) ? body.quizzes : {};
    const lastLocation = isPlainObject(body.lastLocation) ? body.lastLocation : null;
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
