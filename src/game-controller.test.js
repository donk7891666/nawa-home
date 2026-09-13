import { describe, expect, it, vi } from 'vitest';
import { createGameController } from './game-controller.js';

describe('createGameController', () => {
  it('returns to idle after playing the selected reaction', async () => {
    const playReaction = vi.fn().mockResolvedValue(undefined);
    const controller = createGameController({
      chooseReaction: () => 'laugh',
      onStateChange: () => {},
      playReaction,
    });

    controller.enterGame();
    await controller.touchFrog();

    expect(playReaction).toHaveBeenCalledWith('laugh');
    expect(controller.state).toBe('idle');
  });

  it('keeps the newest touch reacting when an older reaction finishes first', async () => {
    const resolvers = [];
    const playReaction = vi.fn(() => new Promise((resolve) => resolvers.push(resolve)));
    const controller = createGameController({
      chooseReaction: () => 'mouth',
      onStateChange: () => {},
      playReaction,
    });

    controller.enterGame();
    const first = controller.touchFrog();
    const second = controller.touchFrog();
    resolvers[0]();
    await first;

    expect(controller.state).toBe('reacting');
    resolvers[1]();
    await second;
    expect(controller.state).toBe('idle');
  });
});
