export function renderApp(root, { onEnter, onTouch }) {
  const showWelcome = () => {
    root.innerHTML = `
      <section class="welcome-page" data-page="welcome">
        <img class="expression expression-calm" src="/media/expression-calm.png" alt="奶蛙冷静表情">
        <img class="expression expression-happy" src="/media/expression-happy.png" alt="奶蛙害羞开心表情">
        <img class="welcome-frog" src="/media/nawa-idle-transparent.png" alt="奶蛙">
        <div class="welcome-copy">
          <p class="eyebrow">WELCOME</p>
          <h1>欢迎来到<br>奶蛙之家</h1>
          <p>袁启帆（donk）制作</p>
          <button type="button" data-action="enter">进入游戏</button>
        </div>
      </section>`;
    root.querySelector('[data-action="enter"]').addEventListener('click', onEnter);
  };

  const showIdle = () => {
    root.innerHTML = `
      <section class="room-page" data-scene="room">
        <div class="room-window" aria-hidden="true"></div>
        <div class="room-plant" aria-hidden="true">🌿</div>
        <button class="frog-button" type="button" data-action="frog" aria-label="戳戳奶蛙">
          <img src="/media/nawa-idle-transparent.png" alt="奶蛙">
        </button>
        <p data-hint>戳戳奶蛙</p>
      </section>`;
    root.querySelector('[data-action="frog"]').addEventListener('click', onTouch);
  };

  const showReacting = (kind) => {
    const hint = root.querySelector('[data-hint]');
    if (hint) hint.hidden = true;

    if (kind === 'laugh') {
      root.querySelector('[data-action="frog"]').hidden = true;
      const video = document.createElement('video');
      video.dataset.reaction = 'laugh';
      video.className = 'laugh-video';
      video.src = '/media/laugh-cropped.mp4';
      video.muted = true;
      video.playsInline = true;
      video.addEventListener('click', onTouch);
      root.querySelector('[data-scene="room"]')?.append(video);
      return;
    }

    root.querySelector('.frog-button img')?.classList.add('mouth-reacting');
  };

  const showLoadError = () => {
    showIdle();
  };

  return {
    showWelcome,
    showIdle,
    showReacting,
    showLoadError,
  };
}
