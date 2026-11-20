import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (path: string, body: string) => {
    store.set(path, body);
    return {};
  }),
  get: vi.fn(async (path: string) => {
    const body = store.get(path);
    if (!body) return null;
    return { statusCode: 200, stream: new Response(body).body };
  }),
}));

const { GET, POST, RATE_LIMITS, resetRateLimits } = await import('../api/sync');

const post = (body: unknown) =>
  POST(
    new Request('https://x/api/sync', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  store.clear();
  resetRateLimits();
});

describe('POST /api/sync', () => {
  it('cria um código novo com 3 blocos', async () => {
    const res = await post({ progress: { a: 1 } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.code).toMatch(/^MB-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it('aceita códigos antigos de 2 blocos que já existem', async () => {
    store.set('sync/MB-ABCD-EF23.json', JSON.stringify({ version: 2, code: 'MB-ABCD-EF23' }));
    expect((await post({ code: 'MB-ABCD-EF23', progress: {} })).status).toBe(200);
  });

  it('não cria códigos novos de 2 blocos', async () => {
    const res = await post({ code: 'MB-ABCD-EF23', progress: {} });
    expect(res.status).toBe(404);
    expect(store.size).toBe(0);
  });

  it('recusa códigos mal formados', async () => {
    expect((await post({ code: 'MB-1' })).status).toBe(400);
  });

  it('recusa JSON inválido', async () => {
    expect((await post('{nope')).status).toBe(400);
    expect((await post('[1,2]')).status).toBe(400);
  });

  it('recusa pedidos acima de 512 KB', async () => {
    const res = await post({ drafts: { a: 'x'.repeat(600 * 1024) } });
    expect(res.status).toBe(413);
    expect(store.size).toBe(0);
  });

  it('descarta campos com tipo errado e sanitiza entradas inválidas em progress, drafts, quizzes e lastLocation', async () => {
    const { code } = await (
      await post({
        progress: {
          'py-01-sintaxe': {
            status: 'autonomous',
            completedAt: '2026-11-19T10:00:00Z',
            reviewCount: 2,
            lastReviewedAt: '2026-11-19T11:00:00Z',
          },
          lixo: { status: 'hack' },
          numero: 123,
        },
        drafts: { 'py-01:challenge': 'x = 1', invalido: 42 },
        quizzes: { 'py-01': 2, negativo: -1, texto: 'a' },
        lastLocation: {
          trackId: 'python',
          lessonId: 'py-01-sintaxe',
          view: 'academia',
          timestamp: '2026-11-19T10:00:00Z',
        },
      })
    ).json();
    const saved = JSON.parse(store.get(`sync/${code}.json`)!);
    expect(saved.progress).toEqual({
      'py-01-sintaxe': {
        status: 'autonomous',
        completedAt: '2026-11-19T10:00:00Z',
        reviewCount: 2,
        lastReviewedAt: '2026-11-19T11:00:00Z',
      },
    });
    expect(saved.drafts).toEqual({ 'py-01:challenge': 'x = 1' });
    expect(saved.quizzes).toEqual({ 'py-01': 2 });
    expect(saved.lastLocation.view).toBe('academia');

    const badRes = await (
      await post({ progress: [1], drafts: 'x', lastLocation: { trackId: 'a', lessonId: 'b', view: 'invalida' } })
    ).json();
    const savedBad = JSON.parse(store.get(`sync/${badRes.code}.json`)!);
    expect(savedBad.progress).toEqual({});
    expect(savedBad.drafts).toEqual({});
    expect(savedBad.lastLocation).toBeNull();
  });

  it('guarda os treinos resolvidos e ignora entradas que não são texto', async () => {
    const { code } = await (await post({ practice: ['py-04-condicoes:1', 7, 'x'.repeat(200)] })).json();
    const saved = JSON.parse(store.get(`sync/${code}.json`)!);
    expect(saved.practice).toEqual(['py-04-condicoes:1']);
  });

  it('guarda e devolve lessonTimes e diagnostic sanitizados', async () => {
    const { code } = await (
      await post({
        lessonTimes: { 'py-01-sintaxe': 420.9, invalido: -5, texto: 'nope' },
        diagnostic: { background: 'negocio', hoursPerWeek: 8.4, targetMonths: 6, updatedAt: '2026-11-17T10:00:00Z' },
      })
    ).json();
    const res = await GET(new Request(`https://x/api/sync?code=${code}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lessonTimes).toEqual({ 'py-01-sintaxe': 420 });
    expect(body.diagnostic).toEqual({
      background: 'negocio',
      hoursPerWeek: 8,
      targetMonths: 6,
      updatedAt: '2026-11-17T10:00:00Z',
    });

    const bad = await (await post({ diagnostic: { background: 'invalido', hoursPerWeek: 8, targetMonths: 6 } })).json();
    const badBody = await (await GET(new Request(`https://x/api/sync?code=${bad.code}`))).json();
    expect(badBody.diagnostic).toBeNull();
  });

  it('não expõe erros internos', async () => {
    const blob = await import('@vercel/blob');
    vi.mocked(blob.put).mockRejectedValueOnce(new Error('token secreto inválido'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await post({});
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('secreto');
  });
});

describe('GET /api/sync', () => {
  it('devolve o que foi guardado', async () => {
    const { code } = await (await post({ quizzes: { q: 2 } })).json();
    const res = await GET(new Request(`https://x/api/sync?code=${code.toLowerCase()}`));
    expect(res.status).toBe(200);
    expect((await res.json()).quizzes).toEqual({ q: 2 });
  });

  it('404 para código inexistente e 400 para formato inválido', async () => {
    expect((await GET(new Request('https://x/api/sync?code=MB-ABCD-EF23-XY45'))).status).toBe(404);
    expect((await GET(new Request('https://x/api/sync?code=../../x'))).status).toBe(400);
  });
});

describe('limite de pedidos por IP', () => {
  const fromIp = (ip: string, url = 'https://x/api/sync?code=MB-ABCD-EF23-XY45') =>
    new Request(url, { headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } });

  it('responde 429 com Retry-After quando um IP faz demasiados GET', async () => {
    for (let i = 0; i < RATE_LIMITS.GET; i++) {
      expect((await GET(fromIp('203.0.113.7'))).status).toBe(404);
    }
    const blocked = await GET(fromIp('203.0.113.7'));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    // Outro IP não é afetado.
    expect((await GET(fromIp('198.51.100.2'))).status).toBe(404);
  });

  it('conta GET e POST em separado', async () => {
    for (let i = 0; i < RATE_LIMITS.GET; i++) await GET(fromIp('203.0.113.8'));
    const res = await POST(
      new Request('https://x/api/sync', {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.8' },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
  });
});
