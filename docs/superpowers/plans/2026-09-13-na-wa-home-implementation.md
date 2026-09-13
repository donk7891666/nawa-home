# 奶蛙之家 H5 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可在微信手机竖屏中直接打开的“奶蛙之家”互动 H5：欢迎页进入房间，触碰奶蛙随机播放完整大笑或张嘴短音反应。

**Architecture:** 使用 Vite 的原生 HTML/CSS/JavaScript 单页应用，不引入运行时框架。`game-controller` 是唯一状态与反应调度入口；页面渲染、音频播放和动画层通过明确接口连接。媒体预处理产出透明奶蛙动画、原声和短音文件，网页只消费已处理产物。

**Tech Stack:** Vite、原生 ES modules、Vitest、CSS animations、HTMLAudioElement、静态 HTTPS 托管、FFmpeg（素材提取与导出）。

**Spec:** `docs/superpowers/specs/2026-09-13-na-wa-home-design.md`

## Global Constraints

- 仅优化微信手机竖屏；不实现桌面优先布局。
- 欢迎页文案必须为“欢迎来到奶蛙之家”“袁启帆（donk）制作”“进入游戏”。
- 游戏页必须使用复古漫画房、白色地板、蓝天窗景、绿植与“戳戳奶蛙”。
- 每次触碰随机选择完整大笑或张嘴短音，概率为 50% : 50%。
- 新触碰必须停止旧音频和旧动画；音频不得叠加。
- 完整大笑保留第一段视频的原始声音与动作；张嘴短音来自第二段视频中单人声音片段。
- 处理后的完整大笑动画必须裁掉状态栏、底部控件和可见水印，并以白色融入背景的混合方式叠加在房间中。
- 所有发布资源必须走 HTTPS；首屏应先显示静态房间和待机奶蛙。

---

## File Structure

- `package.json` — Vite/Vitest 命令与依赖。
- `index.html` — 应用挂载点、移动端 viewport 和页面标题。
- `src/main.js` — 组装页面、控制器与媒体播放器。
- `src/game-controller.js` — 可测试的状态机、随机反应和重触碰取消逻辑。
- `src/game-controller.test.js` — 状态机单元测试。
- `src/dom.js` — 欢迎页/游戏页渲染、触碰提示和动画层更新。
- `src/dom.test.js` — DOM 结构与页面切换测试。
- `src/styles.css` — 手机竖屏视觉、欢迎页表情、房间、张嘴动画与无障碍焦点样式。
- `src/media.js` — 音频与动画播放、停止、错误回调。
- `src/media.test.js` — 播放器停止旧反应与加载失败行为测试。
- `public/media/manifest.json` — 前端消费的媒体文件名、时长和张嘴节拍定义。
- `public/media/` — 已裁剪的大笑视频、待机/欢迎图片、大笑原声、短音。
- `scripts/extract-media.ps1` — 使用 FFmpeg 从两段源 MP4 提取音频与帧序列。
- `scripts/build-alpha-animation.ps1` — 将已抠好的带 alpha 帧导出为透明 WebM/图片序列，并更新 manifest。
- `README.md` — 本地启动、测试、素材处理与 HTTPS 发布步骤。

## Task 1: 初始化可测试的 H5 工程

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/styles.css`
- Create: `src/game-controller.js`, `src/game-controller.test.js`

**Interfaces:**
- Produces: `createGameController({ chooseReaction, onStateChange, playReaction })`。
- `chooseReaction(): 'laugh' | 'mouth'`；`playReaction(kind): Promise<void>`。

- [ ] **Step 1: 写失败的控制器测试**

```js
import { describe, expect, it, vi } from 'vitest';
import { createGameController } from './game-controller.js';

it('enters the game from welcome and returns to idle after a reaction', async () => {
  const playReaction = vi.fn().mockResolvedValue(undefined);
  const controller = createGameController({ chooseReaction: () => 'laugh', onStateChange: () => {}, playReaction });
  controller.enterGame();
  await controller.touchFrog();
  expect(playReaction).toHaveBeenCalledWith('laugh');
  expect(controller.state).toBe('idle');
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- game-controller.test.js`

Expected: FAIL，因为模块尚未创建。

- [ ] **Step 3: 最小化实现状态机**

```js
export function createGameController({ chooseReaction, onStateChange, playReaction }) {
  let state = 'welcome';
  const setState = next => { state = next; onStateChange(next); };
  return {
    get state() { return state; },
    enterGame() { setState('idle'); },
    async touchFrog() {
      if (state === 'welcome') return;
      setState('reacting');
      await playReaction(chooseReaction());
      setState('idle');
    }
  };
}
```

- [ ] **Step 4: 配置 Vite/Vitest 并通过测试**

Run: `npm test -- --run game-controller.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

Run: `git add package.json vite.config.js index.html src && git commit -m "feat: initialize nawa home game state"`

## Task 2: 生成与校验媒体产物

**Files:**
- Create: `scripts/extract-media.ps1`, `scripts/build-alpha-animation.ps1`, `public/media/manifest.json`
- Create: `public/media/laugh-audio.mp3`, `public/media/mouth-sound.mp3`, `public/media/laugh-alpha.webm`, `public/media/nawa-idle.png`

**Interfaces:**
- Produces: manifest shape `{ laugh: { animation, audio }, mouth: { audio, beatsMs } }`。
- Consumes: `9a7a560bafacc90f1a1749b1ba15d899.mp4` 与 `1336071a6d01c9073da0ba93c9c2ad17.mp4`。

- [ ] **Step 1: 写媒体 manifest 校验测试**

```js
import manifest from '../public/media/manifest.json';
import { expect, it } from 'vitest';
it('declares both reaction assets', () => {
  expect(manifest.laugh).toMatchObject({ animation: expect.any(String), audio: expect.any(String) });
  expect(manifest.mouth.beatsMs.every(Number.isFinite)).toBe(true);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run src/media-manifest.test.js`

Expected: FAIL，因为 manifest 尚不存在。

- [ ] **Step 3: 实现确定的素材命令**

```powershell
ffmpeg -y -i .\9a7a560bafacc90f1a1749b1ba15d899.mp4 -vn -c:a libmp3lame -q:a 2 public\media\laugh-audio.mp3
ffmpeg -y -ss 00:00:00 -t 00:00:02 -i .\1336071a6d01c9073da0ba93c9c2ad17.mp4 -vn -c:a libmp3lame -q:a 2 public\media\mouth-sound.mp3
ffmpeg -y -i .\9a7a560bafacc90f1a1749b1ba15d899.mp4 public\media\laugh-frames\frame-%04d.png
```

对 `laugh-frames` 中每帧执行前景抠像与水印区域修复；仅在人工逐帧检查确认无背景、无残留水印后，导出 alpha WebM。记录张嘴短音实际开始/结束位置，并在 manifest 的 `beatsMs` 写入嘴巴开、合的毫秒时间点。

- [ ] **Step 4: 写入 manifest 并通过校验**

```json
{
  "laugh": { "animation": "/media/laugh-alpha.webm", "audio": "/media/laugh-audio.mp3" },
  "mouth": { "audio": "/media/mouth-sound.mp3", "beatsMs": [0, 160, 320, 480] }
}
```

Run: `npm test -- --run src/media-manifest.test.js`

Expected: PASS。

- [ ] **Step 5: 提交**

Run: `git add scripts public/media src/media-manifest.test.js && git commit -m "feat: add processed nawa media assets"`

## Task 3: 实现欢迎页与手机房间视觉

**Files:**
- Create: `src/dom.js`, `src/dom.test.js`
- Modify: `src/main.js`, `src/styles.css`
- Create: `public/media/expression-calm.png`, `public/media/expression-happy.png`, `public/media/nawa-welcome.png`

**Interfaces:**
- Produces: `renderApp(root, { onEnter, onTouch }): { showWelcome(), showIdle(), showReacting(kind), showLoadError() }`。

- [ ] **Step 1: 写失败的 DOM 测试**

```js
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
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run dom.test.js`

Expected: FAIL，因为 `renderApp` 尚未定义。

- [ ] **Step 3: 实现两页 DOM 与视觉层**

```js
export function renderApp(root, { onEnter, onTouch }) {
  const showWelcome = () => { root.innerHTML = `<section data-page="welcome"><img alt="奶蛙冷静表情"><h1>欢迎来到奶蛙之家</h1><p>袁启帆（donk）制作</p><button data-action="enter">进入游戏</button></section>`; root.querySelector('[data-action="enter"]').onclick = onEnter; };
  const showIdle = () => { root.innerHTML = `<section data-scene="room"><button data-action="frog" aria-label="戳戳奶蛙"><img alt="奶蛙"></button><p data-hint>戳戳奶蛙</p></section>`; root.querySelector('[data-action="frog"]').onclick = onTouch; };
  return { showWelcome, showIdle, showReacting: () => {}, showLoadError: () => {} };
}
```

为房间写手机竖屏 CSS，明确使用白色地板、蓝天窗景与绿植；欢迎页使用两张大表情和主奶蛙。

- [ ] **Step 4: 通过 DOM 测试并检查手机布局**

Run: `npm test -- --run dom.test.js && npm run dev -- --host 127.0.0.1`

Expected: PASS；在 375×812 viewport 中无横向滚动，进入按钮可点。

- [ ] **Step 5: 提交**

Run: `git add src public/media && git commit -m "feat: add welcome and room scenes"`

## Task 4: 连接媒体播放器与随机触碰

**Files:**
- Create: `src/media.js`, `src/media.test.js`
- Modify: `src/game-controller.js`, `src/main.js`, `src/dom.js`, `src/styles.css`

**Interfaces:**
- Produces: `createMediaPlayer({ onFrame, onError }): { play(kind), stop() }`。
- `play('laugh')` 显示 alpha 动画并播放大笑原声；`play('mouth')` 播放短音并按 `beatsMs` 开合嘴巴。
- 构造参数增加 `loadAudio(kind): HTMLAudioElement` 与 `startVisual(kind): Promise<void>`，使加载失败能在测试中稳定模拟。

- [ ] **Step 1: 写失败的媒体取消测试**

```js
it('stops the previous audio before a new reaction starts', async () => {
  const player = createMediaPlayer({ onFrame: vi.fn(), onError: vi.fn() });
  const first = player.play('laugh');
  await player.play('mouth');
  expect(player.activeKind).toBe('mouth');
  await first;
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run media.test.js`

Expected: FAIL，因为播放器尚未实现。

- [ ] **Step 3: 实现播放器与取消令牌**

```js
let runId = 0;
async function play(kind) {
  const mine = ++runId;
  stopAllMedia();
  activeKind = kind;
  try { await startKind(kind); } catch (error) { onError(error); }
  if (mine === runId) { activeKind = null; }
}
function stop() { runId += 1; stopAllMedia(); activeKind = null; }
```

将控制器的 `chooseReaction` 注入为 `Math.random() < 0.5 ? 'laugh' : 'mouth'`。开始反应时隐藏 `data-hint`；结束或出错时恢复待机与提示。

- [ ] **Step 4: 通过测试并手动连点验证**

Run: `npm test -- --run media.test.js game-controller.test.js`

Expected: PASS；手动连续触碰 10 次时从不出现叠音，最后一次反应完整结束后回待机。

- [ ] **Step 5: 提交**

Run: `git add src && git commit -m "feat: add random nawa reactions"`

## Task 5: 故障处理、发布与验收

**Files:**
- Modify: `src/media.js`, `src/dom.js`, `README.md`
- Create: `src/e2e-checklist.md`

**Interfaces:**
- Consumes: `showLoadError()`，在资源失败后恢复可触碰待机页。

- [ ] **Step 1: 写失败的资源错误测试**

```js
it('reports a failed media load and clears the active reaction', async () => {
  const onError = vi.fn();
  const player = createMediaPlayer({
    onFrame: vi.fn(), onError,
    loadAudio: () => { throw new Error('network failed'); },
    startVisual: () => Promise.resolve()
  });
  await player.play('laugh');
  expect(onError).toHaveBeenCalledTimes(1);
  expect(player.activeKind).toBeNull();
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- --run media.test.js`

Expected: FAIL，直到失败媒体桩与恢复路径写入。

- [ ] **Step 3: 实现错误恢复与发布说明**

```js
catch (error) {
  onError(error);
  view.showIdle();
}
```

在 README 写明：`npm ci`、`npm run dev`、`npm test -- --run`、`npm run build`；将 `dist/` 上传到 HTTPS 静态托管后，使用微信扫描/打开公开链接验收。

- [ ] **Step 4: 完整验证**

Run: `npm test -- --run && npm run build`

Expected: 全部 PASS，Vite 在 `dist/` 生成静态站点。按 `src/e2e-checklist.md` 在微信手机竖屏验证欢迎页、两种反应、无叠音、回待机、弱网首屏与素材无水印/白边。

- [ ] **Step 5: 提交**

Run: `git add README.md src dist && git commit -m "docs: add nawa deployment checklist"`
