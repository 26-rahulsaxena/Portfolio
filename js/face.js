/* Head-turn face on the About page: the face turns toward the visitor's mouse.
   Settings live in js/config.js (HEAD_TURN). If anything is missing or fails,
   the still photo (or silhouette) simply stays, with no visible error. */
(function () {
  var cfg = (window.CONFIG || {}).HEAD_TURN || {};
  var mode = cfg.mode;
  var hero = document.querySelector('.about-hero');
  var frame = document.querySelector('.face-frame');
  var bar = document.querySelector('.face-scrub');
  var dot = bar && bar.querySelector('.face-scrub-dot');
  var hint = document.querySelector('.face-hint');

  // Off: keep the still photo. Nothing else to do.
  if (!hero || !frame || !bar || ['video', 'frames', 'avatar', 'photo'].indexOf(mode) < 0) return;
  if (mode === 'avatar' && !window.Avatar) return;

  // Photo mode: one cut-out picture (transparent background). Tries the .webp first, then the same name as .png.
  function loadPhotoImg(done, failed) {
    var src = String(cfg.photo || '');
    if (!src) return failed('no photo set (HEAD_TURN.photo in js/config.js)');
    var tries = /\.webp$/i.test(src) ? [src, src.replace(/\.webp$/i, '.png')] : [src];
    var img = new Image();
    img.alt = 'Portrait of Rahul Saxena';
    img.className = 'face-photo';
    img.fetchPriority = 'high'; // the main picture of the page: load it first
    img.onload = function () { done(img); };
    img.onerror = function () { tries.shift(); if (tries.length) img.src = tries[0]; else failed('the photo could not be loaded'); };
    img.src = tries[0];
  }

  // Reduced motion, or move: false in config.js: no turning. The avatar or the photo shows once, facing forward;
  // other modes keep the still photo.
  if ((window.UI && UI.reduceMotion) || cfg.move === false) {
    if (mode === 'photo') {
      loadPhotoImg(function (img) {
        var still = document.createElement('div');
        still.className = 'face-layer ready is-cutout';
        still.appendChild(img);
        frame.appendChild(still);
        frame.classList.add('has-cutout');
      }, function (reason) { console.warn('Head-turn face is off: ' + reason); });
    }
    if (mode === 'avatar') {
      var still = document.createElement('div');
      still.className = 'face-layer ready';
      still.setAttribute('role', 'img');
      still.setAttribute('aria-label', 'Illustrated avatar of Rahul');
      still.appendChild(Avatar.create(cfg.avatar || (window.CONFIG || {}).AVATAR).el);
      frame.appendChild(still);
    }
    return;
  }

  var touch = matchMedia('(hover: none), (pointer: coarse)').matches;
  var isDemo = /face-demo/.test(mode === 'video' ? cfg.video : (cfg.frames || []).join(' '));

  // 0 = turned to the viewer's left, 0.5 = straight ahead, 1 = turned to the viewer's right
  var target = 0.5, current = 0.5, raf = 0, onScreen = true;
  var targetY = 0, currentY = 0; // vertical gaze for the avatar: -1 = looking up, 1 = looking down
  var ready = false, failed = false;
  var show = function () {}; // draws one pose; set by the loader
  var avatar = null;

  // The moving layer sits over the still photo, invisible until the media is ready.
  var layer = document.createElement('div');
  layer.className = 'face-layer';
  if (mode === 'avatar') { layer.setAttribute('role', 'img'); layer.setAttribute('aria-label', 'Illustrated avatar of Rahul'); }
  else if (mode !== 'photo') layer.setAttribute('aria-hidden', 'true'); // the photo carries its own alt text
  frame.appendChild(layer);

  function fail(reason) {
    if (failed || ready) return;
    failed = true;
    console.warn('Head-turn face is off: ' + reason);
    layer.remove();
    // Photo missing: keep the still photo from the sheet if there is one, otherwise show the avatar.
    if (mode === 'photo' && window.Avatar && document.getElementById('face-silhouette')) {
      failed = false; mode = 'avatar';
      layer.setAttribute('role', 'img'); layer.setAttribute('aria-label', 'Illustrated avatar of Rahul');
      frame.appendChild(layer);
      loadAvatar();
    }
  }

  function reveal() {
    if (failed) return;
    ready = true;
    if (mode === 'photo') { layer.classList.add('is-cutout'); frame.classList.add('has-cutout'); }
    if (isDemo) layer.insertAdjacentHTML('beforeend', '<p class="face-caption label">[DEMO FRAMES - YOUR HEAD-TURN GOES HERE]</p>');
    layer.classList.add('ready');
    if (touch) hint.textContent = 'drag to turn my head';
    bar.hidden = hint.hidden = false;
    draw(current);
    if (touch) nudgeOnce();
  }

  /* ---------- smoothing loop: runs only while the pose is still moving ---------- */

  function draw(p) {
    show(p, currentY);
    dot.style.left = (p * 100) + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    bar.setAttribute('aria-valuetext', p < 0.4 ? 'Looking left' : p > 0.6 ? 'Looking right' : 'Looking straight ahead');
  }

  function tick() {
    raf = 0;
    current += (target - current) * 0.15;              // move 15% of the way each frame
    if (Math.abs(target - current) < 0.002) current = target; // close enough: settle
    currentY += (targetY - currentY) * 0.15;
    if (Math.abs(targetY - currentY) < 0.004) currentY = targetY;
    draw(current);
    if (current !== target || currentY !== targetY) start();
  }

  function start() {
    if (!raf && ready && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
  }

  function setTarget(p, gy) {
    target = Math.min(1, Math.max(0, p));
    if (gy !== undefined) targetY = Math.min(1, Math.max(-1, gy));
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else start();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(hero);
  }

  /* ---------- input: mouse over the hero, finger drag on the portrait, keyboard on the bar ---------- */

  function across(el, e) {
    var r = el.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  }

  function down(el, e) { // -1 (top of the hero) ... 1 (bottom)
    var r = el.getBoundingClientRect();
    return ((e.clientY - r.top) / r.height) * 2 - 1;
  }

  hero.addEventListener('pointermove', function (e) { if (e.pointerType !== 'touch') setTarget(across(hero, e), down(hero, e)); });
  hero.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') setTarget(0.5, 0); });

  var dragging = false; // touch: horizontal drag on the portrait (CSS touch-action: pan-y keeps page scrolling)
  frame.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'touch') return;
    dragging = true;
    setTarget(across(frame, e));
  });
  frame.addEventListener('pointermove', function (e) { if (dragging) setTarget(across(frame, e)); });
  ['pointerup', 'pointercancel'].forEach(function (type) {
    frame.addEventListener(type, function () { if (dragging) { dragging = false; setTarget(0.5, 0); } });
  });

  bar.setAttribute('role', 'slider');
  bar.setAttribute('tabindex', '0');
  bar.setAttribute('aria-label', 'Turn my head');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.addEventListener('keydown', function (e) {
    var now = Math.round(target * 100);
    var next = { ArrowLeft: now - 5, ArrowDown: now - 5, ArrowRight: now + 5, ArrowUp: now + 5, Home: 0, End: 100 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setTarget(next / 100);
  });

  // Touch devices: sweep the head left and right once, so visitors see it can move.
  function nudgeOnce() {
    try { if (localStorage.getItem('faceNudged')) return; localStorage.setItem('faceNudged', '1'); } catch (e) {}
    setTimeout(function () { setTarget(0.15); }, 500);
    setTimeout(function () { setTarget(0.85); }, 1100);
    setTimeout(function () { setTarget(0.5); }, 1700);
  }

  /* ---------- loading the media (after first paint, so the typewriter is not slowed) ---------- */

  function loadFrames() {
    var srcs = (cfg.frames || []).filter(Boolean);
    Promise.all(srcs.map(function (src) {
      return new Promise(function (done) {
        var img = new Image();
        img.onload = function () { done(img); };
        img.onerror = function () { done(null); };
        img.src = src;
      });
    })).then(function (imgs) {
      imgs = imgs.filter(Boolean); // use the frames that loaded
      if (imgs.length < 2) return fail(imgs.length + ' frame(s) loaded; at least 2 are needed (check the paths in js/config.js)');
      imgs.forEach(function (img) { img.alt = ''; img.hidden = true; layer.appendChild(img); });
      var shown = null;
      show = function (p) { // stacked images: only the one for this pose is visible, so no flicker
        var img = imgs[Math.round(p * (imgs.length - 1))];
        if (img === shown) return;
        if (shown) shown.hidden = true;
        img.hidden = false;
        shown = img;
      };
      reveal();
    });
  }

  function loadVideo() {
    var v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.disablePictureInPicture = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.width = 480; v.height = 560;

    // Seek queue: only one seek at a time, always to the newest wanted time.
    var seeking = false, wanted = null;
    function seekTo(t) { wanted = t; if (!seeking) nextSeek(); }
    function nextSeek() {
      if (wanted === null) return;
      if (Math.abs(v.currentTime - wanted) < 0.001) { wanted = null; return; }
      seeking = true; v.currentTime = wanted; wanted = null;
    }
    v.addEventListener('seeked', function () {
      seeking = false;
      if (!ready) reveal(); else nextSeek();
    });
    v.addEventListener('error', function () { fail('the video could not be loaded (check HEAD_TURN.video in js/config.js)'); });
    v.addEventListener('loadeddata', function () {
      if (!isFinite(v.duration) || v.duration <= 0) return fail('the video has no usable length');
      show = function (p) { seekTo(p * Math.max(0, v.duration - 0.05)); };
      v.currentTime = v.duration / 2; seeking = true; // first seek to the centre frame, then reveal
    }, { once: true });

    layer.appendChild(v);
    v.src = cfg.video;
  }

  // Avatar: drawn in code, so there is nothing to download and it is ready at once.
  function loadAvatar() {
    avatar = Avatar.create(cfg.avatar || (window.CONFIG || {}).AVATAR);
    layer.appendChild(avatar.el);
    show = function (p, gy) { avatar.set(p, gy); };
    reveal();
    avatar.startBlinking();
  }

  // Photo: the picture tilts in 3D toward the cursor (it cannot truly turn: it is one photo).
  // CSS reads these values: --ry and --rx tilt the photo, --tx shifts it, and the glow moves the other way.
  function loadPhoto() {
    loadPhotoImg(function (img) {
      layer.appendChild(img);
      show = function (p, gy) {
        var t = (p - 0.5) * 2;
        frame.style.setProperty('--ry', (t * 10).toFixed(2) + 'deg');
        frame.style.setProperty('--rx', (-(gy || 0) * 5).toFixed(2) + 'deg');
        frame.style.setProperty('--tx', (t * 12).toFixed(1) + 'px');
      };
      reveal();
    }, fail);
  }

  function load() {
    if (mode === 'avatar') return loadAvatar();
    if (mode === 'photo') { setTimeout(function () { fail('the photo did not load within 8 seconds'); }, 8000); return loadPhoto(); }
    setTimeout(function () { fail('the media did not load within 8 seconds'); }, 8000);
    if (mode === 'video') loadVideo(); else loadFrames();
  }
  var later = window.requestIdleCallback || function (fn) { setTimeout(fn, 300); };
  if (document.readyState === 'complete') later(load);
  else window.addEventListener('load', function () { later(load); });
})();
