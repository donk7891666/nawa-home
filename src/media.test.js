import { expect, it, vi } from 'vitest';
import { chooseReaction, createMediaPlayer, getMouthAudioPath } from './media.js';

function fakeAudio() {
  const listeners = new Map();
  return {
    currentTime: 3,
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name) => listeners.delete(name),
    finish: () => listeners.get('ended')?.(),
  };
}

it('stops the previous audio before starting a new reaction', async () => {
  const firstAudio = fakeAudio();
  const secondAudio = fakeAudio();
  const createAudio = vi.fn().mockReturnValueOnce(firstAudio).mockReturnValueOnce(secondAudio);
  const player = createMediaPlayer({ createAudio, startVisual: vi.fn(), stopVisual: vi.fn(), onError: vi.fn() });

  const first = player.play('laugh');
  const second = player.play('mouth');

  expect(firstAudio.pause).toHaveBeenCalledOnce();
  expect(firstAudio.currentTime).toBe(0);
  expect(secondAudio.play).toHaveBeenCalledOnce();
  secondAudio.finish();
  await Promise.all([first, second]);
});

it('maps random values across four mouth sound files', () => {
  expect(getMouthAudioPath(() => 0)).toBe('/media/mouth-sound-1.mp3');
  expect(getMouthAudioPath(() => 0.26)).toBe('/media/mouth-sound-2.mp3');
  expect(getMouthAudioPath(() => 0.51)).toBe('/media/mouth-sound-3.mp3');
  expect(getMouthAudioPath(() => 0.99)).toBe('/media/mouth-sound-4.mp3');
});

it('puts mouth sounds inside the GitHub Pages project path', () => {
  expect(getMouthAudioPath(() => 0, '/nawa-home/'))
    .toBe('/nawa-home/media/mouth-sound-1.mp3');
});

it('selects short mouth reactions 70 percent of the time', () => {
  expect(chooseReaction(() => 0.69)).toBe('mouth');
  expect(chooseReaction(() => 0.7)).toBe('laugh');
});
