import { expect, it } from 'vitest';
import manifest from '../public/media/manifest.json';

it('declares both reaction assets', () => {
  expect(manifest.laugh).toMatchObject({
    animation: expect.any(String),
    audio: expect.any(String),
  });
  expect(manifest.mouth.beatsMs.every(Number.isFinite)).toBe(true);
});
