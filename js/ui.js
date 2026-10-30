/* Shared header, footer, mobile menu and scroll fade-up. Runs on every page. */
(function () {
  var PAGES = [
    ['index.html', 'Home'], ['projects.html', 'Projects'],
    ['gallery.html', 'Gallery'], ['about.html', 'About'], ['contact.html', 'Contact']
  ];
  var file = location.pathname.split('/').pop();
  var current = file === 'project.html' ? 'projects.html'
    : PAGES.some(function (p) { return p[0] === file; }) ? file : 'index.html';

  function links() {
    return PAGES.map(function (p) {
      return '<a href="' + p[0] + '"' + (p[0] === current ? ' aria-current="page"' : '') + '>' + p[1] + '</a>';
    }).join('');
  }

  // The ₹S logo, drawn in code so it follows the light/dark theme. The letters are outlines of Manrope ExtraBold,
  // so they never depend on a font being installed. The same drawing is in assets/favicon.svg.
  var LOGO = '<svg class="brand-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
    '<rect x="4" y="4" width="92" height="92" rx="22" style="fill:var(--accent)"/>' +
    '<path style="fill:var(--on-accent)" d="M21.56 32.7H45.56V37.54H39.87Q40.23 38.17 40.5 38.84Q41.02 40.18 41.26 41.7H45.75V46.54H41.26Q40.83 49.33 39.39 51.39Q37.35 54.34 33.13 55.23Q32.1 55.45 31.4 55.5Q30.99 55.52 30.42 55.54L43.59 67.26H34.52L21.56 55.54V49.45H29.34Q29.84 49.45 30.44 49.4Q31.04 49.35 31.54 49.21Q32.86 48.82 33.58 47.98Q34.14 47.34 34.45 46.54H21.75V41.7H34.45Q34.14 40.9 33.58 40.23Q32.86 39.39 31.54 39.03Q31.04 38.89 30.44 38.84Q29.84 38.79 29.34 38.79H21.56ZM64.57 67.98Q60.73 67.98 57.64 66.62Q54.56 65.26 52.58 62.73Q50.6 60.2 50.07 56.7L56.89 55.69Q57.61 58.66 59.86 60.27Q62.12 61.88 65 61.88Q66.61 61.88 68.12 61.38Q69.63 60.87 70.6 59.89Q71.58 58.9 71.58 57.46Q71.58 56.94 71.42 56.44Q71.26 55.95 70.9 55.52Q70.54 55.09 69.88 54.7Q69.22 54.32 68.22 54.01L59.24 51.37Q58.23 51.08 56.9 50.55Q55.57 50.02 54.32 49.04Q53.07 48.06 52.24 46.44Q51.42 44.82 51.42 42.34Q51.42 38.86 53.17 36.56Q54.92 34.26 57.85 33.13Q60.78 32 64.33 32.02Q67.9 32.07 70.71 33.25Q73.52 34.42 75.42 36.67Q77.31 38.91 78.15 42.15L71.1 43.35Q70.71 41.67 69.68 40.52Q68.65 39.37 67.22 38.77Q65.79 38.17 64.23 38.12Q62.7 38.07 61.34 38.54Q59.98 39.01 59.13 39.9Q58.28 40.78 58.28 42.01Q58.28 43.14 58.98 43.84Q59.67 44.55 60.73 44.98Q61.78 45.42 62.89 45.7L68.89 47.34Q70.23 47.7 71.86 48.28Q73.5 48.87 75 49.92Q76.5 50.96 77.47 52.66Q78.44 54.37 78.44 56.98Q78.44 59.77 77.28 61.84Q76.11 63.92 74.14 65.28Q72.18 66.63 69.69 67.3Q67.21 67.98 64.57 67.98Z"/></svg>';

  var header = document.createElement('div');
  header.innerHTML =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="site-header"><div class="wrap">' +
      '<div class="header-row">' +
        '<a class="brand" href="index.html" aria-label="Rahul Saxena, home">' + LOGO + '<span class="brand-name">Rahul Saxena</span></a>' +
        '<nav class="nav glass" aria-label="Main">' + links() + '</nav>' +
        '<div class="header-actions">' +
          '<button class="theme-btn" type="button" role="switch" aria-label="Dark theme"></button>' +
          '<a class="btn btn-glass glass cv-btn" href="contact.html">Download CV</a>' +
          '<button class="btn btn-glass glass menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button>' +
        '</div>' +
      '</div>' +
      '<nav id="mobile-menu" class="mobile-menu glass" aria-label="Main menu" hidden>' + links() +
        '<a class="cv-btn" href="contact.html">Download CV</a></nav>' +
    '</div></header>';
  document.body.prepend.apply(document.body, Array.prototype.slice.call(header.childNodes));

  /* ---------- Nav: the highlighted pill slides to the tab you click, then that page opens ---------- */
  var nav = document.querySelector('.nav'), navPill = document.createElement('span');
  navPill.className = 'nav-pill'; navPill.setAttribute('aria-hidden', 'true');
  nav.prepend(navPill);
  function placePill(link) {
    if (!link || !link.offsetWidth) return;
    navPill.style.width = link.offsetWidth + 'px';
    navPill.style.transform = 'translateX(' + link.offsetLeft + 'px)';
  }
  function placeCurrent() {
    nav.classList.add('no-anim'); placePill(nav.querySelector('[aria-current="page"]'));
    void navPill.offsetWidth; nav.classList.remove('no-anim');
  }
  placeCurrent();
  window.addEventListener('resize', placeCurrent);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCurrent); // text width changes once fonts load
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || a.getAttribute('aria-current') || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // new-tab clicks work as usual
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    var old = nav.querySelector('[aria-current="page"]'); if (old) old.removeAttribute('aria-current');
    a.setAttribute('aria-current', 'page');
    placePill(a);
    setTimeout(function () { location.href = a.href; }, 300); // the time the slide takes
  });

  /* ---------- Download CV: a small arrow drops into a tray, then turns into a tick ---------- */
  var DL_ICON = '<span class="dl-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><g class="dl-arrow"><path d="M12 3v11"/><path d="M7.5 9.5 12 14l4.5-4.5"/></g>' +
    '<path class="dl-tray" d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><path class="dl-tick" d="M7 12.5l3.2 3.2L17 9"/></svg></span>';
  document.querySelectorAll('.cv-btn, .cv-link').forEach(function (el) {
    el.insertAdjacentHTML('afterbegin', DL_ICON);
    el.addEventListener('click', function () {
      if (el.classList.contains('dl-go') || el.classList.contains('dl-done')) return;
      el.classList.add('dl-go');
      setTimeout(function () { el.classList.remove('dl-go'); el.classList.add('dl-done'); }, 900);
      setTimeout(function () { el.classList.remove('dl-done'); }, 2600);
    });
  });

  var footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = '<div class="wrap footer-row"><p>Happy to talk models, markets or roles.</p><div class="footer-links"></div></div>';
  document.body.appendChild(footer);

  // Dark / light theme. The visitor's choice is remembered on this device; with no choice, the device setting is used.
  // (A tiny script in each page's <head> applies a saved choice before the page draws, so it never flashes.)
  var root = document.documentElement, themeBtn = document.querySelector('.theme-btn');
  var systemLight = matchMedia('(prefers-color-scheme: light)');
  var SUN = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  // Our own attribute name (data-site-theme), so a host page such as the Claude preview cannot override it.
  function theme() { return root.getAttribute('data-site-theme') || (systemLight.matches ? 'light' : 'dark'); }
  // A sliding switch: sun on the left (light), moon on the right (dark); the round knob slides to the current theme.
  themeBtn.innerHTML = '<span class="ts-track" aria-hidden="true"><span class="ts-end">' + SUN + '</span><span class="ts-end">' + MOON + '</span>' +
    '<span class="ts-knob"><span class="ts-sun">' + SUN + '</span><span class="ts-moon">' + MOON + '</span></span></span>';
  function showTheme() {
    var dark = theme() === 'dark';
    themeBtn.setAttribute('aria-checked', String(dark)); // on = dark theme
    themeBtn.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
    document.dispatchEvent(new Event('themechange')); // lets the Home background redraw in the new colours
  }
  themeBtn.addEventListener('click', function () {
    var next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-site-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* not saved, still switches */ }
    showTheme();
  });
  if (systemLight.addEventListener) systemLight.addEventListener('change', showTheme);
  // Another tab of this site changed the theme: follow it straight away.
  window.addEventListener('storage', function (e) {
    if (e.key !== 'theme' || (e.newValue !== 'light' && e.newValue !== 'dark')) return;
    root.setAttribute('data-site-theme', e.newValue);
    showTheme();
  });
  showTheme();

  // Mobile menu
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  }
  btn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); }
  });
  window.addEventListener('resize', function () { if (innerWidth > 860 && !menu.hidden) setMenu(false); });

  /* ---------- "Counting up" loader ----------
     Shown only if a page's data takes longer than 0.4 s. It climbs smoothly towards 90% while the sheet loads,
     runs to 100% once the page has drawn, holds for a moment and fades. It never goes backwards, stays at
     least 0.6 s once shown, and disappears if loading fails (the page then shows its own quiet message). */
  var loads = 0, loader = null, shownAt = 0, finishing = false, showTimer = 0, giveUp = 0;
  var SHOW_AFTER = 400, MIN_SHOWN = 600, HOLD = 250, GIVE_UP = 13000;
  document.addEventListener('sheetwait', function () {
    if (loads++ === 0 && !loader) {
      showTimer = setTimeout(showLoader, SHOW_AFTER);
      giveUp = setTimeout(function () { hideLoader(); }, GIVE_UP); // never left spinning
    }
  });
  document.addEventListener('sheetready', function (e) {
    if (--loads > 0) return;
    clearTimeout(showTimer);
    if (!loader) { clearTimeout(giveUp); return; } // fast load: the loader never appeared
    if (e.detail && e.detail.ok) finishLoader(); else hideLoader();
  });
  function showLoader() {
    loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML = '<span class="sr-only">Loading</span>' + (reduce
      ? '<span class="loader-num still" aria-hidden="true">Loading…</span>'
      : '<span class="loader-num" aria-hidden="true"><span class="n">0</span><span class="pct">%</span></span>');
    document.body.appendChild(loader);
    shownAt = performance.now();
    if (!reduce) requestAnimationFrame(tick);
  }
  var shown = 0, finishFrom = 0, finishAt = 0, finishDur = 0;
  function tick(now) {
    if (!loader) return;
    var p;
    if (!finishing) p = 90 * (1 - Math.exp(-(now - shownAt) / 1400)); // eases towards 90%
    else {
      var k = Math.min(1, (now - finishAt) / finishDur);
      p = finishFrom + (100 - finishFrom) * (1 - Math.pow(1 - k, 3));
    }
    shown = Math.max(shown, Math.floor(p)); // never backwards
    loader.querySelector('.n').textContent = shown;
    if (finishing && shown >= 100) return setTimeout(hideLoader, HOLD);
    requestAnimationFrame(tick);
  }
  function finishLoader() {
    if (reduce) return setTimeout(hideLoader, Math.max(0, shownAt + MIN_SHOWN - performance.now()));
    finishing = true; finishFrom = shown; finishAt = performance.now();
    finishDur = Math.max(300, shownAt + MIN_SHOWN - HOLD - finishAt); // keeps it on screen at least MIN_SHOWN
  }
  function hideLoader() {
    clearTimeout(showTimer); clearTimeout(giveUp);
    var el = loader; loader = null;
    if (!el) return;
    el.classList.add('out');
    setTimeout(function () { el.remove(); }, reduce ? 0 : 260);
  }

  // CV button and footer links come from the About tab.
  if (window.Sheet) {
    Sheet.watch(['About'], function (d) {
      var a = Sheet.aboutMap(d.About);
      var cv = Sheet.safeUrl(a['Resume Link']);
      if (cv) document.querySelectorAll('.cv-btn').forEach(function (el) {
        el.href = cv; el.target = '_blank'; el.rel = 'noopener noreferrer';
      });
      var email = a.Email && /@/.test(a.Email) ? a.Email : '';
      var items = [
        email && ['mailto:' + email, 'Email'],
        Sheet.safeUrl(a.LinkedIn) && [Sheet.safeUrl(a.LinkedIn), 'LinkedIn'],
        Sheet.safeUrl(a.GitHub) && [Sheet.safeUrl(a.GitHub), 'GitHub'],
        Sheet.safeUrl(a['Newsletter Link']) && [Sheet.safeUrl(a['Newsletter Link']), 'Newsletter']
      ].filter(Boolean);
      footer.querySelector('.footer-links').innerHTML = items.map(function (i) {
        var ext = i[0].indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '';
        return '<a href="' + Sheet.esc(i[0]) + '"' + ext + '>' + i[1] + '</a>';
      }).join('');
    }, function () { /* header and footer still work without the sheet */ }, true);
  }

  // A tab that could not load: its section is hidden; say so once, quietly, just above the footer.
  document.addEventListener('sheetfailed', function () {
    if (document.querySelector('.load-note')) return;
    var p = document.createElement('p');
    p.className = 'wrap load-note label'; p.setAttribute('role', 'status');
    p.textContent = 'Some sections could not load just now. Refresh the page to try again.';
    footer.before(p);
  });

  // Fade sections up as they scroll into view. Content is visible without JS or with reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal(root) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    });
    (root || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });
  }

  /* ---------- work cards (shared by Home, Projects and detail pages) ---------- */

  // ₹Target  +Upside%  ▲ BUY, coloured by the recommendation.
  function callRow(r) {
    var S = window.Sheet, esc = S.esc;
    var c = S.call(r.Recommendation), tp = S.fmtINR(r['Target Price']), up = S.fmtPct(S.upside(r));
    if (!c && !tp && !up) return '';
    var cls = c ? c.cls : '';
    return '<p class="call-row">' +
      (tp ? '<span>' + esc(tp) + '</span>' : '') +
      (up ? '<span class="' + cls + '">' + esc(up) + '</span>' : '') +
      (c ? '<span class="call ' + cls + '"><span aria-hidden="true">' + c.icon + '</span> ' + c.word + '</span>' : '') +
      '</p>';
  }

  // extra: extra CSS classes (e.g. ' reveal'); showFeatured: add the gold FEATURED tag.
  function card(item, extra, showFeatured) {
    var S = window.Sheet, esc = S.esc, date = S.fmtDate(item.row.Date);
    var right = (showFeatured && item.featured ? '<span class="feat-tag">Featured</span>' : '') + esc(date);
    // Articles with a link open the article itself (e.g. on Substack) in a new tab.
    var ext = item.tab === 'Articles' && /^https?:/i.test(S.safeUrl(item.row.Link)) ? S.safeUrl(item.row.Link) : '';
    var open = ext ? 'Read on ' + esc(item.row.Platform || 'the web') + ' ↗' : 'Open →';
    return '<a class="card glass' + (extra || '') + '" href="' + esc(ext || item.href) + '"' +
      (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
      '<div class="card-meta"><span class="label">' + esc(item.label) + '</span>' +
        (right ? '<span class="label">' + right + '</span>' : '') + '</div>' +
      '<h3>' + esc(item.title) + '</h3>' +
      (item.line ? '<p>' + esc(item.line) + '</p>' : '') +
      (item.tab === 'Research' ? callRow(item.row) : '') +
      '<span class="open" aria-hidden="true">' + open + '</span></a>';
  }

  // Up to three headline numbers from the About tab (Stat 1-3), each written "12,000+ | Combined following".
  // Returns the HTML for a quiet row of numbers, or '' when there are none.
  function stats(about) {
    var esc = window.Sheet.esc;
    return [1, 2, 3].map(function (n) {
      var v = String(about['Stat ' + n] || '').trim();
      if (!v) return '';
      var cut = v.indexOf('|'), big = cut < 0 ? v : v.slice(0, cut).trim(), small = cut < 0 ? '' : v.slice(cut + 1).trim();
      return big ? '<div class="stat"><dt>' + esc(big) + '</dt>' + (small ? '<dd>' + esc(small) + '</dd>' : '') + '</div>' : '';
    }).join('');
  }

  // Typewriter: types `text` into `out` one letter every 38ms after `delay`, then removes the blinking cursor.
  // With reduced motion the whole text appears at once.
  function typewrite(out, cursor, text, delay) {
    if (reduce) { out.textContent = text; cursor.remove(); return; }
    var i = 0;
    setTimeout(function step() {
      out.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 38);
      else cursor.remove();
    }, delay);
  }

  window.UI = { reveal: reveal, reduceMotion: reduce, card: card, callRow: callRow, typewrite: typewrite, stats: stats };
})();
