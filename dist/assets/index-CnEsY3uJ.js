(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,{onEnter:t,onTouch:n}){let r=()=>{e.innerHTML=`
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
      </section>`,e.querySelector(`[data-action="enter"]`).addEventListener(`click`,t)},i=()=>{e.innerHTML=`
      <section class="room-page" data-scene="room">
        <div class="room-window" aria-hidden="true"></div>
        <div class="room-plant" aria-hidden="true">🌿</div>
        <button class="frog-button" type="button" data-action="frog" aria-label="戳戳奶蛙">
          <img src="/media/nawa-idle-transparent.png" alt="奶蛙">
        </button>
        <p data-hint>戳戳奶蛙</p>
      </section>`,e.querySelector(`[data-action="frog"]`).addEventListener(`click`,n)};return{showWelcome:r,showIdle:i,showReacting:t=>{let r=e.querySelector(`[data-hint]`);if(r&&(r.hidden=!0),t===`laugh`){e.querySelector(`[data-action="frog"]`).hidden=!0;let t=document.createElement(`video`);t.dataset.reaction=`laugh`,t.className=`laugh-video`,t.src=`/media/laugh-cropped.mp4`,t.muted=!0,t.playsInline=!0,t.addEventListener(`click`,n),e.querySelector(`[data-scene="room"]`)?.append(t);return}e.querySelector(`.frog-button img`)?.classList.add(`mouth-reacting`)},showLoadError:()=>{i()}}}function t({chooseReaction:e,onStateChange:t,playReaction:n}){let r=`welcome`,i=0,a=e=>{r=e,t(e)};return{get state(){return r},enterGame(){a(`idle`)},async touchFrog(){if(r===`welcome`)return;let t=++i;a(`reacting`),await n(e()),t===i&&a(`idle`)}}}var n=[`/media/mouth-sound-1.mp3`,`/media/mouth-sound-2.mp3`,`/media/mouth-sound-3.mp3`,`/media/mouth-sound-4.mp3`];function r(e=Math.random){return e()<.7?`mouth`:`laugh`}function i(e=Math.random){return n[Math.min(n.length-1,Math.floor(e()*n.length))]}function a({createAudio:e,startVisual:t,stopVisual:n,onError:r}){let i=null,a=()=>{i&&=(i.audio.pause(),i.audio.currentTime=0,i.audio.removeEventListener(`ended`,i.finish),i.finish(),n(),null)};return{play:o=>{a();let s=e(o);return new Promise(e=>{let a=()=>{s.removeEventListener(`ended`,a),i?.audio===s&&(i=null,n()),e()};i={audio:s,finish:a},s.addEventListener(`ended`,a),t(o),s.play().catch(e=>{r(e),a()})})},stop:a}}var o=document.querySelector(`#app`),s,c=t({chooseReaction:r,onStateChange(e){e===`welcome`&&s.showWelcome(),e===`idle`&&s.showIdle()},playReaction:a({createAudio(e){return new Audio(e===`laugh`?`/media/laugh-audio.mp3`:i())},startVisual(e){s.showReacting(e),e===`laugh`&&o.querySelector(`video[data-reaction="laugh"]`)?.play().catch(()=>{})},stopVisual(){s.showIdle()},onError(){s.showLoadError()}}).play});s=e(o,{onEnter:()=>c.enterGame(),onTouch:()=>c.touchFrog()}),s.showWelcome();