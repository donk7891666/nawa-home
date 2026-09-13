import { defineConfig } from 'vitest/config';

export const githubPagesBase = (isGitHubActions) =>
  isGitHubActions ? '/nawa-home/' : '/';

export default defineConfig({
  base: githubPagesBase(process.env.GITHUB_ACTIONS === 'true'),
  test: {
    environment: 'jsdom',
  },
});
