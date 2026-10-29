/* Home page: identity, featured cards, research-calls ticker, latest work. */
(function () {
  var S = window.Sheet, esc = S.esc;
  var $ = function (id) { return document.getElementById(id); };

  var card = UI.card; // shared card markup lives in ui.js

  function renderIdentity(a) {
    var name = a.Name || 'Rahul Saxena';
    $('name-sr').textContent = $('name-ghost').textContent = name; // the hidden full copy keeps the space reserved
    UI.typewrite($('name-text'), $('name-cursor'), name, 400);
    $('tagline').textContent = a.Headline || 'Finance student · Aspiring equity research analyst';
    $('open-to').textContent = a['Open To'] || 'Equity Research · Financial Analyst roles';
    var stats = UI.stats(a); // Stat 1-3 from the About tab; the row stays hidden when all are blank
    $('hero-stats').innerHTML = stats; $('hero-stats').hidden = !stats;
    // First choice: the cut-out photo set in config.js (HEAD_TURN.photo), shown without a box.
    // If it is missing, use the Photo Link from the sheet in the usual frame.
    var cut = S.safeUrl(((window.CONFIG || {}).HEAD_TURN || {}).photo);
    if (cut) {
      var tries = /\.webp$/i.test(cut) ? [cut, cut.replace(/\.webp$/i, '.png')] : [cut];
      var photo = new Image();
      photo.alt = 'Portrait of ' + (a.Name || 'Rahul Saxena');
      photo.className = 'portrait-cutout';
      photo.onload = function () {
        $('portrait-silhouette').replaceWith(photo);
        document.querySelector('.portrait').classList.add('is-cutout');
      };
      photo.onerror = function () { tries.shift(); if (tries.length) photo.src = tries[0]; else sheetPhoto(); };
      photo.src = tries[0];
    } else sheetPhoto();

    function sheetPhoto() {
      var src = S.imageUrl(a['Photo Link']);
      if (!src || !$('portrait-silhouette')) return;
      var img = new Image();
      img.alt = 'Portrait of ' + (a.Name || 'Rahul Saxena');
      img.width = 240; img.height = 300;
      img.onload = function () { $('portrait-silhouette').replaceWith(img); };
      img.src = src; // if it fails to load, the silhouette simply stays
    }
  }

  function tickerItems(calls, hidden) {
    return '<ul' + (hidden ? ' aria-hidden="true"' : '') + '>' + calls.map(function (i) {
      var r = i.row, c = S.call(r.Recommendation), up = S.fmtPct(S.upside(r)), tp = S.fmtINR(r['Target Price']);
      return '<li><a href="' + esc(i.href) + '"' + (hidden ? ' tabindex="-1"' : '') + '>' +
        '<span class="co">' + esc(r.Company || i.title) + '</span>' +
        (c ? '<span class="' + c.cls + '"><span aria-hidden="true">' + c.icon + '</span> ' + c.word + '</span>' : '') +
        (tp ? '<span class="tp">' + esc(tp) + '</span>' : '') +
        (up ? '<span class="' + (c ? c.cls : '') + '">' + esc(up) + '</span>' : '') +
        '</a></li>';
    }).join('') + '</ul>';
  }

  function renderTicker(items) {
    var calls = items.filter(function (i) { return i.tab === 'Research'; }).sort(S.byFeatured).slice(0, 12);
    var box = $('ticker');
    if (calls.length < 5) { box.hidden = true; return; }
    var track = box.querySelector('.ticker-track');
    track.innerHTML = tickerItems(calls) + tickerItems(calls, true);
    track.style.setProperty('--dur', calls.length * 6 + 's');
    var btn = box.querySelector('.ticker-toggle');
    btn.addEventListener('click', function () {
      var paused = box.querySelector('.ticker').classList.toggle('paused');
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' research calls ticker');
    });
    box.hidden = false;
  }

  // One section per kind of work, each with its three newest items and a link to the full filtered list.
  // Kinds with no items are left out.
  var TYPE_SECTIONS = [['research', 'Research reports'], ['models', 'Models'], ['dashboards', 'Dashboards'],
                       ['articles', 'Articles'], ['other', 'Other work']];
  function renderByType(items) {
    $('by-type').innerHTML = TYPE_SECTIONS.map(function (t) {
      var list = items.filter(function (i) { return S.filterType(i) === t[0]; }).sort(S.byNewest);
      if (!list.length) return '';
      return '<section class="wrap section" aria-labelledby="type-' + t[0] + '-h">' +
        '<div class="section-head"><h2 id="type-' + t[0] + '-h">' + t[1] + ' <span class="label type-count">' + list.length + '</span></h2>' +
        '<a class="text-link" href="projects.html?type=' + t[0] + '">See all ' + list.length + ' →</a></div>' +
        '<div class="grid-3">' + list.slice(0, 3).map(function (i) { return card(i, ' reveal'); }).join('') + '</div>' +
        '</section>';
    }).join('');
  }

  S.load(['Research', 'Projects', 'Articles', 'About']).then(function (d) {
    renderIdentity(S.aboutMap(d.About));

    var items = S.workItems(d);
    var featured = items.filter(function (i) { return i.featured; }).sort(S.byFeatured).slice(0, 3);
    var others = items.filter(function (i) { return featured.indexOf(i) < 0; }).sort(S.byNewest);
    var top = featured.concat(others.slice(0, 3 - featured.length));

    $('featured-list').innerHTML = top.length
      ? top.map(function (i) { return card(i); }).join('')
      : '<p class="panel notice">New work is being added. Please check back soon.</p>';

    renderTicker(items);

    var latest = others.filter(function (i) { return top.indexOf(i) < 0; }).slice(0, 3);
    if (latest.length) {
      $('latest-list').innerHTML = latest.map(function (i) { return card(i, ' reveal'); }).join('');
      $('latest').hidden = false;
    }
    renderByType(items);
    UI.reveal();
  }).catch(function (err) {
    console.warn(err);
    renderIdentity({}); // name, default wording and your photo (from config.js) still appear
    $('featured-list').innerHTML = '<p class="panel notice">Content is loading slowly. Please refresh.</p>';
    UI.reveal();
  });
})();
