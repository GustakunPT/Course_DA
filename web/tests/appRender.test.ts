// @vitest-environment happy-dom
// Desenha a app inteira em todas as etapas, separadores, vistas e modais e procura os erros
// típicos de templates em texto: "undefined"/"NaN" no ecrã, ids repetidos e HTML por escapar.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp, setRenderer } from '../src/app/rerender';
import { renderAppNow } from '../src/app/shell';
import { state } from '../src/app/store';
import { TRACK_INDEX } from '../src/data/trackIndex';
import { loadAllTracksAsync } from '../src/data/trackLoaders';
import type { Track } from '../src/data/types';
import type { WorkbenchTab } from '../src/ui/appState';

// O Explorador lê os CSV com fetch('/dados/…'): aqui vêm da pasta dados/ do repositório.
// (Caminho com node:path: em ambiente de browser o Vite trataria new URL(…, import.meta.url) como asset.)
const PASTA_DADOS = resolve(dirname(fileURLToPath(import.meta.url)), '../../dados');
const fetchReal = globalThis.fetch;
vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
  const texto = String(url);
  if (texto.startsWith('/dados/')) {
    return new Response(readFileSync(resolve(PASTA_DADOS, texto.slice(7)), 'utf-8'));
  }
  return fetchReal(url, init);
});

let tracks: Track[] = [];
/** Desenhar a app em ~200 combinações demora alguns segundos, mais quando os testes correm em paralelo. */
const LONGO = 30_000;

/** Elementos com números calculados pela app (contadores, tempos, progresso, cronograma). */
const NUMEROS_DA_APP =
  '.status-chip, .quiz-score, .nav-progress-btn, #lesson-timer-clock, .lesson-step-id, .sidebar-time-hint, .gantt-board';

/** Texto visível e atributos: onde um valor em falta apareceria ao aluno. */
function problemas(root: HTMLElement): string[] {
  const erros: string[] = [];
  const visivel = root.textContent ?? '';
  for (const lixo of ['undefined', '[object Object]']) {
    if (visivel.includes(lixo)) erros.push(`texto "${lixo}"`);
  }
  // "NaN" é matéria nas lições de pandas; só é erro nos números que a própria app calcula.
  for (const el of root.querySelectorAll(NUMEROS_DA_APP)) {
    if (el.textContent?.includes('NaN')) erros.push(`NaN em ${el.className || el.id}: "${el.textContent.trim()}"`);
  }
  for (const el of root.querySelectorAll('*')) {
    for (const attr of el.getAttributeNames()) {
      const v = el.getAttribute(attr) ?? '';
      if (v === 'undefined' || v === 'NaN' || v.includes('[object Object]')) erros.push(`${attr}="${v}"`);
    }
  }
  const ids = [...root.querySelectorAll('[id]')].map((el) => el.id);
  const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (repetidos.length) erros.push(`ids repetidos: ${[...new Set(repetidos)].join(', ')}`);
  return erros;
}

function desenhar(): HTMLElement {
  renderApp();
  return document.getElementById('app')!;
}

/** Espera que os módulos carregados a pedido cheguem e voltem a desenhar a vista. */
async function desenharVista(): Promise<HTMLElement> {
  desenhar();
  for (let i = 0; i < 50 && document.querySelector('.skeleton-stack'); i++) {
    await new Promise((r) => setTimeout(r, 20));
  }
  return desenhar();
}

beforeAll(async () => {
  setRenderer(renderAppNow);
  tracks = await loadAllTracksAsync();
});

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  Object.assign(state, {
    view: 'academia',
    wbTab: 'challenge',
    practiceIdx: 0,
    hintLevel: 0,
    output: { kind: 'empty' },
    mobileEditor: null,
    showProgressModal: false,
    showThemeModal: false,
    showDiagnosticModal: false,
    showGuideModal: false,
    showFontMenu: false,
    showPlacementQuiz: false,
    refQuery: '',
    refCategory: 'Todas',
  });
});

describe('render de todas as etapas', () => {
  it('carrega as 8 trilhas', () => {
    expect(tracks.map((t) => t.id)).toEqual(TRACK_INDEX.map((t) => t.id));
  });

  it(
    'cada etapa, em cada separador e com as duas pistas, desenha-se sem valores em falta nem ids repetidos',
    () => {
      const falhas: string[] = [];
      let desenhos = 0;
      for (const track of tracks) {
        for (const lesson of track.lessons) {
          const separadores: WorkbenchTab[] =
            lesson.engine === 'projeto' ? ['challenge'] : ['challenge', 'example', 'sqlfree'];
          for (const wbTab of separadores) {
            Object.assign(state, {
              trackId: track.id,
              lessonId: lesson.id,
              wbTab,
              hintLevel: wbTab === 'challenge' ? 2 : 0,
            });
            const root = desenhar();
            desenhos++;
            const titulo = root.querySelector('.lesson-article h1')?.textContent;
            if (titulo !== lesson.title) falhas.push(`${lesson.id}/${wbTab}: título "${titulo}"`);
            for (const p of problemas(root)) falhas.push(`${lesson.id}/${wbTab}: ${p}`);
          }
        }
      }
      expect(desenhos).toBeGreaterThan(150);
      expect(falhas).toEqual([]);
    },
    LONGO,
  );

  it(
    'os treinos de cada etapa também se desenham',
    () => {
      const falhas: string[] = [];
      for (const track of tracks) {
        for (const lesson of track.lessons) {
          const treinos = lesson.practice ?? lesson.practiceSql ?? lesson.practiceGit ?? [];
          for (let i = 1; i <= treinos.length; i++) {
            Object.assign(state, { trackId: track.id, lessonId: lesson.id, practiceIdx: i });
            const root = desenhar();
            if (!root.textContent?.includes(`Treino ${i}`)) falhas.push(`${lesson.id}: treino ${i} sem título`);
            for (const p of problemas(root)) falhas.push(`${lesson.id}/treino ${i}: ${p}`);
          }
        }
      }
      expect(falhas).toEqual([]);
    },
    LONGO,
  );
});

describe('vistas e modais', () => {
  it.each(['explorador', 'cronograma', 'referencia'] as const)(
    'a vista %s desenha-se depois de carregar',
    async (view) => {
      state.view = view;
      const root = await desenharVista();
      expect(root.querySelector('.skeleton-stack')).toBeNull();
      expect(root.querySelector('[role="alert"]')).toBeNull();
      expect(problemas(root)).toEqual([]);
    },
  );

  it.each([['showGuideModal'], ['showProgressModal'], ['showThemeModal'], ['showDiagnosticModal']] as const)(
    'o modal %s abre como diálogo acessível',
    (flag) => {
      Object.assign(state, { [flag]: true, trackId: TRACK_INDEX[0].id, lessonId: TRACK_INDEX[0].lessons[0].id });
      const root = desenhar();
      const dialog = root.querySelector('.modal-backdrop[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
      expect(problemas(root)).toEqual([]);
    },
  );

  it('o teste de nivelamento desenha-se dentro do diagnóstico', () => {
    Object.assign(state, { showDiagnosticModal: true, showPlacementQuiz: true });
    const root = desenhar();
    expect(root.querySelectorAll('[data-placement-q]').length).toBeGreaterThan(0);
    expect(problemas(root)).toEqual([]);
  });

  it('a pesquisa da Referência escapa o que o aluno escreve', async () => {
    Object.assign(state, { view: 'referencia', refQuery: '<img src=x onerror="alert(1)">' });
    const root = await desenharVista();
    expect(root.querySelector('img[onerror]')).toBeNull();
    expect((root.querySelector('#ref-search') as HTMLInputElement).value).toBe('<img src=x onerror="alert(1)">');
  });

  it('as divisórias com foco anunciam o valor atual (WCAG: role="separator" focável)', () => {
    Object.assign(state, { view: 'academia', trackId: 'sql', lessonId: 'sql-01-select' });
    state.layout = { ...state.layout, sidebarWidth: 300, lessonRatio: 55, editorHeight: 320 };
    const root = desenhar();
    const valores: Record<string, string> = {
      'splitter-sidebar': '300',
      'splitter-main': '55',
      'splitter-editor': '320',
    };
    for (const [id, valor] of Object.entries(valores)) {
      const el = root.querySelector(`#${id}`)!;
      expect(el.getAttribute('aria-valuenow'), id).toBe(valor);
      expect(Number(el.getAttribute('aria-valuemin')), id).toBeLessThan(Number(valor));
      expect(Number(el.getAttribute('aria-valuemax')), id).toBeGreaterThan(Number(valor));
      expect(el.getAttribute('aria-valuetext'), id).toBeTruthy();
    }
  });
});
