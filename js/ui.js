/* Shared header, footer, mobile menu and scroll fade-up. Runs on every page. */
(function () {
  var PAGES = [
    ['index.html', 'Home'], ['projects.html', 'Projects'],
    ['about.html', 'About'], ['gallery.html', 'Gallery'], ['contact.html', 'Contact']
  ];
  var file = location.pathname.split('/').pop();
  var current = file === 'project.html' ? 'projects.html'
    : PAGES.some(function (p) { return p[0] === file; }) ? file : 'index.html';

  function links() {
    return PAGES.map(function (p) {
      return '<a href="' + p[0] + '"' + (p[0] === current ? ' aria-current="page"' : '') + '>' + p[1] + '</a>';
    }).join('');
  }

  var header = document.createElement('div');
  header.innerHTML =
    '<a class="skip" href="#main">Skip to content</a>' +
    '<header class="site-header"><div class="wrap">' +
      '<div class="header-row">' +
        '<a class="brand" href="index.html" aria-label="Rahul Saxena, home"><span class="brand-mark" aria-hidden="true">RS</span><span>Rahul Saxena</span></a>' +
        '<nav class="nav glass" aria-label="Main">' + links() + '</nav>' +
        '<div class="header-actions">' +
          '<button class="theme-btn glass" type="button"></button>' +
          '<a class="btn btn-glass glass cv-btn" href="contact.html">Download CV</a>' +
          '<button class="btn btn-glass glass menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu">Menu</button>' +
        '</div>' +
      '</div>' +
      '<nav id="mobile-menu" class="mobile-menu glass" aria-label="Main menu" hidden>' + links() +
        '<a class="cv-btn" href="contact.html">Download CV</a></nav>' +
    '</div></header>';
  document.body.prepend.apply(document.body, Array.prototype.slice.call(header.childNodes));

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
  function showTheme() {
    var dark = theme() === 'dark';
    themeBtn.innerHTML = dark ? SUN : MOON; // the icon shows what you switch to
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.title = themeBtn.getAttribute('aria-label');
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

  // CV button and footer links come from the About tab.
  if (window.Sheet) {
    Sheet.load(['About']).then(function (d) {
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
    }).catch(function () { /* header and footer still work without the sheet */ });
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
