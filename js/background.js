/* "Candlestick skyline": decorative canvas behind the Home page. */
(function () {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, candles = [], waves = [], raf = 0, last = 0;

  // Seeded random numbers, so the skyline looks the same on every load.
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function build() {
    var rand = rng(20261028);
    var n = Math.max(60, Math.min(90, Math.round(W / 16)));
    candles = [];
    for (var i = 0; i < n; i++) {
      var x = i / (n - 1);
      // Skyline envelope: a few broad "districts" plus seeded jitter.
      var shape = 0.5 + 0.28 * Math.sin(x * 7.1 + 1.3) + 0.18 * Math.sin(x * 17.3 + 0.4);
      var h = Math.max(0.06, Math.min(0.42, (0.12 + 0.22 * shape) * (0.55 + rand() * 0.75)));
      candles.push({ h: h, wick: 0.01 + rand() * 0.04, tone: rand() < 0.5, gold: rand() < 0.12 });
    }
    waves = [];
    for (var k = 1; k <= 4; k++) waves.push({ k: k * 2 - 1, a: (0.05 / k) * (0.6 + rand() * 0.8), p: rand() * 6.283 });
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    draw(last);
  }

  // Colours come from the theme in css/styles.css, so the skyline follows dark or light mode.
  var col = {};
  function readColours() {
    var css = getComputedStyle(document.documentElement);
    ['--text', '--candle-a', '--candle-b', '--accent'].forEach(function (v) { col[v] = css.getPropertyValue(v).trim(); });
  }
  readColours();
  document.addEventListener('themechange', function () { readColours(); draw(last); });

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Faint gridlines
    ctx.strokeStyle = col['--text'];
    ctx.globalAlpha = 0.035;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var y = H - 0.5; y > 0; y -= 72) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    for (var x = 0.5; x < W; x += 120) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Candles along the bottom
    var n = candles.length, step = W / n, bw = Math.max(3, step * 0.42);
    candles.forEach(function (c, i) {
      var cx = step * (i + 0.5), top = H - c.h * H;
      ctx.fillStyle = c.tone ? col['--candle-a'] : col['--candle-b'];
      ctx.fillRect(cx - 0.5, top - c.wick * H, 1, c.wick * H);
      ctx.fillRect(cx - bw / 2, top, bw, H - top);
      if (c.gold) {
        ctx.fillStyle = col['--accent'];
        ctx.globalAlpha = 0.45;
        ctx.fillRect(cx - bw / 2, top, bw, Math.max(4, step * 0.35));
        ctx.globalAlpha = 1;
      }
    });

    // Accent-coloured price line drifting slowly to the left (seamless: whole waves over the width)
    var shift = t * 0.000012;
    ctx.strokeStyle = col['--accent'];
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var px = 0; px <= W; px += 6) {
      var u = px / W + shift, v = 0;
      waves.forEach(function (w) { v += w.a * Math.sin(6.2832 * w.k * u + w.p); });
      var py = H * (0.66 + v); // just above the candle tops, below most text
      px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    if (t - last < 33) return; // about 30 frames a second is plenty for a slow drift
    last = t;
    draw(t);
  }

  var timer;
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(resize, 150); });
  resize();
  if (reduce) return; // one still frame only

  document.addEventListener('visibilitychange', function () {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  });
  raf = requestAnimationFrame(frame);
})();
