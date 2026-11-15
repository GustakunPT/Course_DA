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

const { GET, POST } = await import('../api/sync');

const post = (body: unknown) =>
  POST(
    new Request('https://x/api/sync', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => store.clear());

describe('POST /api/sync', () => {
  it('cria um código novo com 3 blocos', async () => {
    const res = await post({ progress: { a: 1 } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.code).toMatch(/^MB-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it('aceita códigos antigos de 2 blocos', async () => {
    expect((await post({ code: 'MB-ABCD-EF23', progress: {} })).status).toBe(200);
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

  it('descarta campos com tipo errado', async () => {
    const { code } = await (await post({ progress: [1], drafts: 'x', lastLocation: [] })).json();
    const saved = JSON.parse(store.get(`sync/${code}.json`)!);
    expect(saved.progress).toEqual({});
    expect(saved.drafts).toEqual({});
    expect(saved.lastLocation).toBeNull();
  });

  it('guarda os treinos resolvidos e ignora entradas que não são texto', async () => {
    const { code } = await (await post({ practice: ['py-04-condicoes:1', 7, 'x'.repeat(200)] })).json();
    const saved = JSON.parse(store.get(`sync/${code}.json`)!);
    expect(saved.practice).toEqual(['py-04-condicoes:1']);
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
