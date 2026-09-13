import './styles.css';
import { renderApp } from './dom.js';
import { createGameController } from './game-controller.js';
import { chooseReaction, createMediaPlayer, getMouthAudioPath } from './media.js';

const root = document.querySelector('#app');
let view;

const player = createMediaPlayer({
  createAudio(kind) {
    return new Audio(kind === 'laugh' ? '/media/laugh-audio.mp3' : getMouthAudioPath());
  },
  startVisual(kind) {
    view.showReacting(kind);
    if (kind === 'laugh') {
      root.querySelector('video[data-reaction="laugh"]')?.play().catch(() => {});
    }
  },
  stopVisual() {
    view.showIdle();
  },
  onError() {
    view.showLoadError();
  },
});

const controller = createGameController({
  chooseReaction,
  onStateChange(state) {
    if (state === 'welcome') view.showWelcome();
    if (state === 'idle') view.showIdle();
  },
  playReaction: player.play,
});

view = renderApp(root, {
  onEnter: () => controller.enterGame(),
  onTouch: () => controller.touchFrog(),
});
view.showWelcome();
