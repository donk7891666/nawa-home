const MOUTH_SOUNDS = [
  '/media/mouth-sound-1.mp3',
  '/media/mouth-sound-2.mp3',
  '/media/mouth-sound-3.mp3',
  '/media/mouth-sound-4.mp3',
];

export function chooseReaction(random = Math.random) {
  return random() < 0.7 ? 'mouth' : 'laugh';
}

export function getMouthAudioPath(random = Math.random) {
  return MOUTH_SOUNDS[Math.min(MOUTH_SOUNDS.length - 1, Math.floor(random() * MOUTH_SOUNDS.length))];
}

export function createMediaPlayer({ createAudio, startVisual, stopVisual, onError }) {
  let active = null;

  const stop = () => {
    if (!active) return;

    active.audio.pause();
    active.audio.currentTime = 0;
    active.audio.removeEventListener('ended', active.finish);
    active.finish();
    stopVisual();
    active = null;
  };

  const play = (kind) => {
    stop();
    const audio = createAudio(kind);

    return new Promise((resolve) => {
      const finish = () => {
        audio.removeEventListener('ended', finish);
        if (active?.audio === audio) {
          active = null;
          stopVisual();
        }
        resolve();
      };

      active = { audio, finish };
      audio.addEventListener('ended', finish);
      startVisual(kind);
      audio.play().catch((error) => {
        onError(error);
        finish();
      });
    });
  };

  return { play, stop };
}
