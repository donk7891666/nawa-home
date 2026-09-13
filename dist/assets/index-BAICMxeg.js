(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e,t=`/nawa-home/`){return`${t.endsWith(`/`)?t:`${t}/`}${e.replace(/^\//,``)}`}function t(t,{onEnter:n,onTouch:r},{basePath:i=`/nawa-home/`}={}){let a=()=>{t.innerHTML=`
      <section class="welcome-page" data-page="welcome">
        <img class="expression expression-calm" src="${e(`media/expression-calm.png`,i)}" alt="奶蛙冷静表情">
        <img class="expression expression-happy" src="${e(`media/expression-happy.png`,i)}" alt="奶蛙害羞开心表情">
        <img class="welcome-frog" src="${e(`media/nawa-idle-transparent.png`,i)}" alt="奶蛙">
        <div class="welcome-copy">
          <p class="eyebrow">WELCOME</p>
          <h1>欢迎来到<br>奶蛙之家</h1>
          <p>袁启帆（donk）制作</p>
          <button type="button" data-action="enter">进入游戏</button>
        </div>
      </section>`,t.querySelector(`[data-action="enter"]`).addEventListener(`click`,n)},o=()=>{t.innerHTML=`
      <section class="room-page" data-scene="room">
        <div class="room-window" aria-hidden="true"></div>
        <div class="room-plant" aria-hidden="true">🌿</div>
        <button class="frog-button" type="button" data-action="frog" aria-label="戳戳奶蛙">
          <span class="frog-art">
            <img src="${e(`media/nawa-idle-transparent.png`,i)}" alt="奶蛙">
            <span class="frog-mouth" data-frog-mouth aria-hidden="true"></span>
          </span>
        </button>
        <p data-hint>戳戳奶蛙</p>
      </section>`,t.querySelector(`[data-action="frog"]`).addEventListener(`click`,r)};return{showWelcome:a,showIdle:o,showReacting:n=>{let a=t.querySelector(`[data-hint]`);if(a&&(a.hidden=!0),n===`laugh`){t.querySelector(`[data-action="frog"]`).hidden=!0;let n=document.createElement(`video`);n.dataset.reaction=`laugh`,n.className=`laugh-video`,n.src=e(`media/laugh-cropped.mp4`,i),n.muted=!0,n.playsInline=!0,n.addEventListener(`click`,r),t.querySelector(`[data-scene="room"]`)?.append(n);return}t.querySelector(`[data-frog-mouth]`)?.classList.add(`mouth-opening`)},showLoadError:()=>{o()}}}function n({chooseReaction:e,onStateChange:t,playReaction:n}){let r=`welcome`,i=0,a=e=>{r=e,t(e)};return{get state(){return r},enterGame(){a(`idle`)},async touchFrog(){if(r===`welcome`)return;let t=++i;a(`reacting`),await n(e()),t===i&&a(`idle`)}}}var r=[`media/mouth-sound-1.mp3`,`media/mouth-sound-2.mp3`,`media/mouth-sound-3.mp3`,`media/mouth-sound-4.mp3`];function i(e=Math.random){return e()<.7?`mouth`:`laugh`}function a(t=Math.random,n){return e(r[Math.min(r.length-1,Math.floor(t()*r.length))],n)}function o({createAudio:e,startVisual:t,stopVisual:n,onError:r}){let i=null,a=()=>{i&&=(i.audio.pause(),i.audio.currentTime=0,i.audio.removeEventListener(`ended`,i.finish),i.finish(),n(),null)};return{play:o=>{a();let s=e(o);return new Promise(e=>{let a=()=>{s.removeEventListener(`ended`,a),i?.audio===s&&(i=null,n()),e()};i={audio:s,finish:a},s.addEventListener(`ended`,a),t(o),s.play().catch(e=>{r(e),a()})})},stop:a}}var s=document.querySelector(`#app`),c,l=n({chooseReaction:i,onStateChange(e){e===`welcome`&&c.showWelcome(),e===`idle`&&c.showIdle()},playReaction:o({createAudio(t){return new Audio(t===`laugh`?e(`media/laugh-audio.mp3`):a())},startVisual(e){c.showReacting(e),e===`laugh`&&s.querySelector(`video[data-reaction="laugh"]`)?.play().catch(()=>{})},stopVisual(){c.showIdle()},onError(){c.showLoadError()}}).play});c=t(s,{onEnter:()=>l.enterGame(),onTouch:()=>l.touchFrog()}),c.showWelcome();