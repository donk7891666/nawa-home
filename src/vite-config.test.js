import { describe, expect, it } from 'vitest';
import { githubPagesBase } from '../vite.config.js';

describe('GitHub Pages base path', () => {
  it('uses the repository path for GitHub Pages builds', () => {
    expect(githubPagesBase(true)).toBe('/nawa-home/');
  });
});
