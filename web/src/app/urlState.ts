// Ligação entre o estado e o endereço (#vista=...&trilha=...&licao=...).

import { loadLastLocation, saveLastLocation } from '../data/progress';
import { locateLesson } from './lessonContext';
import { state } from './store';

// Chaves de navegação que a app lê do endereço. O formato normal é #vista=...&trilha=...&licao=...,
// mas também se aceitam no ?..., para links escritos à mão; nesse caso passam para o # e saem do ?.
const CHAVES_NAVEGACAO = ['vista', 'trilha', 'licao', 'cidade', 'categoria', 'q', 'ferramenta'];

export function syncStateFromUrl(): void {
  const search = new URLSearchParams(window.location.search);
  const daQuery = new URLSearchParams();
  for (const k of CHAVES_NAVEGACAO) {
    const valor = search.get(k);
    if (valor !== null) daQuery.set(k, valor);
    search.delete(k);
  }
  if ([...daQuery.keys()].length) {
    const resto = search.toString();
    history.replaceState(null, '', `${window.location.pathname}${resto ? `?${resto}` : ''}${window.location.hash}`);
  }
  const raw = window.location.hash.replace(/^#/, '') || daQuery.toString();
  if (!raw) {
    const last = loadLastLocation();
    if (last) {
      if (
        last.view === 'academia' ||
        last.view === 'explorador' ||
        last.view === 'referencia' ||
        last.view === 'cronograma'
      ) {
        state.view = last.view;
      }
      const loc = locateLesson(last.trackId, last.lessonId);
      if (loc) {
        state.trackId = loc.trackId;
        state.lessonId = loc.lessonId;
      }
    }
    return;
  }
  const params = new URLSearchParams(raw);
  const v = params.get('vista');
  if (v === 'academia' || v === 'explorador' || v === 'referencia' || v === 'cronograma') {
    state.view = v;
  }
  const loc = locateLesson(params.get('trilha'), params.get('licao'));
  if (loc) {
    state.trackId = loc.trackId;
    state.lessonId = loc.lessonId;
  }
  const cid = params.get('cidade');
  if (cid) state.explorerCidade = cid;
  const cat = params.get('categoria');
  if (cat) state.explorerCategoria = cat;
  const q = params.get('q');
  if (q !== null) state.refQuery = q;
  const f = params.get('ferramenta');
  if (f) state.refCategory = f;
}

export function writeStateToUrl(): void {
  const params = new URLSearchParams();
  params.set('vista', state.view);
  if (state.view === 'academia') {
    params.set('trilha', state.trackId);
    params.set('licao', state.lessonId);
  } else if (state.view === 'explorador') {
    if (state.explorerCidade !== 'todas') params.set('cidade', state.explorerCidade);
    if (state.explorerCategoria !== 'todas') params.set('categoria', state.explorerCategoria);
  } else if (state.view === 'referencia') {
    if (state.refQuery) params.set('q', state.refQuery);
    if (state.refCategory !== 'Todas') params.set('ferramenta', state.refCategory);
  }
  const nextHash = `#${params.toString()}`;
  if (window.location.hash !== nextHash) {
    history.replaceState(history.state, '', nextHash);
  }
  saveLastLocation({
    trackId: state.trackId,
    lessonId: state.lessonId,
    view: state.view,
    timestamp: new Date().toISOString(),
  });
}
