import { expect, it, vi } from 'vitest';
import { renderApp } from './dom.js';

it('renders the welcome copy and invokes enter when its button is pressed', () => {
  const root = document.createElement('main');
  const onEnter = vi.fn();
  const view = renderApp(root, { onEnter, onTouch: vi.fn() });

  view.showWelcome();
  expect(root.textContent).toContain('欢迎来到奶蛙之家');

  root.querySelector('[data-action="enter"]').click();
  expect(onEnter).toHaveBeenCalledOnce();

  view.showIdle();
  expect(root.querySelector('[data-scene="room"]')).not.toBeNull();
});

it('uses the GitHub Pages project path for image assets', () => {
  const root = document.createElement('main');
  const view = renderApp(root, { onEnter: vi.fn(), onTouch: vi.fn() }, { basePath: '/nawa-home/' });

  view.showWelcome();

  expect(root.querySelector('.welcome-frog').getAttribute('src'))
    .toBe('/nawa-home/media/nawa-idle-transparent.png');
});

it('hides the touch hint and shows the laugh video while reacting', () => {
  const root = document.createElement('main');
  const onTouch = vi.fn();
  const view = renderApp(root, { onEnter: vi.fn(), onTouch });

  view.showIdle();
  view.showReacting('laugh');

  expect(root.querySelector('[data-hint]').hidden).toBe(true);
  expect(root.querySelector('[data-action="frog"]').hidden).toBe(true);
  const video = root.querySelector('video[data-reaction="laugh"]');
  expect(video).not.toBeNull();

  video.click();
  expect(onTouch).toHaveBeenCalledOnce();
});

it('shows a visible mouth-opening reaction for short sounds', () => {
  const root = document.createElement('main');
  const view = renderApp(root, { onEnter: vi.fn(), onTouch: vi.fn() });

  view.showIdle();
  view.showReacting('mouth');

  expect(root.querySelector('[data-frog-mouth]')).not.toBeNull();
  expect(root.querySelector('[data-frog-mouth]').classList).toContain('mouth-opening');
});
