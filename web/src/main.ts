// Arranque da Academia. A lógica vive em src/app/:
//   store.ts           estado único da app
//   lessonContext.ts   trilha, etapa e desafio ativos
//   shell.ts           desenha a app (barra de topo, vistas, modais)
//   academyView.ts     vista da Academia (índice, lição, bancada)
//   lazyViews.ts       Explorador, Cronograma e Referência (carregados a pedido)
//   mobileWriting.ts   ecrã de escrita do telemóvel
//   workbench.ts       executar código e atualizar o resultado
//   actions/           o que faz cada botão com data-action
//   listeners/         restantes eventos, religados a cada render
// Fontes servidas pelo próprio site (sem pedidos à Google): só o alfabeto latino, pesos 400 e 500.
import '@fontsource/atkinson-hyperlegible-mono/latin-400.css';
import '@fontsource/atkinson-hyperlegible-mono/latin-500.css';
import '@fontsource/host-grotesk/latin-400.css';
import '@fontsource/host-grotesk/latin-500.css';
import './styles/app.css';
import { installGlobalListeners, registerServiceWorker } from './app/globalListeners';
import { cloudSync } from './app/progressSync';
import { renderApp, setRenderer } from './app/rerender';
import { renderAppNow } from './app/shell';
import { state } from './app/store';
import { syncStateFromUrl } from './app/urlState';
import { startStudyTimer } from './ui/studyTimer';

setRenderer(renderAppNow);
installGlobalListeners();

syncStateFromUrl();
renderApp();
void cloudSync.bootstrap();
cloudSync.attachCrossTabStorageSync();
startStudyTimer(state);

registerServiceWorker();
