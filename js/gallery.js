/* Gallery page: photos and clips from events, grouped by event (newest event first).
   Each row of the Gallery tab is one photo or clip:
     Title, Event, Date, Type (Photo or Video), Media Link, Thumbnail Link, Caption, Show
   Photos and video files (.mp4 / .webm) open in a larger view on this page.
   Other video links (YouTube, Google Drive and so on) open in a new tab. */
(function () {
  var S = window.Sheet, esc = S.esc;
  var $ = function (id) { return document.getElementById(id); };

  var items = [], filter = 'all', viewList = [], lbList = [], viewAt = 0, opener = null;

  function youtubeId(url) {
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
    return m ? m[1] : '';
  }

  // Turns a sheet row into what the page needs, or null if it has no usable link.
  function toItem(r, i) {
    var link = S.safeUrl(r['Media Link']);
    if (!link) return null;
    var isFile = /\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(link);
    var isVideo = /video|clip/i.test(r.Type || '') || isFile || !!youtubeId(link);
    var kind = !isVideo ? 'photo' : isFile ? 'video-file' : 'video-link';
    var thumb = S.imageUrl(r['Thumbnail Link']) ||
      (kind === 'photo' ? S.imageUrl(link) : youtubeId(link) ? 'https://img.youtube.com/vi/' + youtubeId(link) + '/hqdefault.jpg' : '');
    var d = S.parseDate(r.Date);
    return {
      i: i, kind: kind, video: isVideo, link: kind === 'photo' ? S.imageUrl(link) : link, thumb: thumb,
      title: r.Title || r.Event || (isVideo ? 'Clip' : 'Photo'), event: (r.Event || '').trim(),
      caption: r.Caption || '', date: S.fmtDate(r.Date), time: d ? d.getTime() : 0
    };
  }

  /* ---------- tiles, grouped by event ---------- */

  function tile(it) {
    var media = it.thumb
      ? '<img src="' + esc(it.thumb) + '" alt="" loading="lazy">'
      : it.kind === 'video-file'
        ? '<video src="' + esc(it.link) + '#t=0.1" preload="metadata" muted playsinline tabindex="-1" aria-hidden="true"></video>'
        : '<span class="g-blank label">' + (it.video ? 'Clip' : 'Photo') + '</span>';
    var badge = it.video ? '<span class="g-badge" aria-hidden="true">▶</span>' : '';
    var inner = '<span class="g-thumb">' + media + badge + '</span>' +
      '<span class="g-title">' + esc(it.title) + '</span>';
    var label = (it.video ? 'Play clip: ' : 'View photo: ') + it.title;
    if (it.kind === 'video-link') {
      return '<a class="g-tile" href="' + esc(it.link) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(label + ' (opens in a new tab)') + '">' + inner + '</a>';
    }
    return '<button type="button" class="g-tile" data-i="' + it.i + '" aria-label="' + esc(label) + '">' + inner + '</button>';
  }

  function render() {
    var list = items.filter(function (it) {
      return filter === 'all' || (filter === 'videos' ? it.video : !it.video);
    });
    // Group by event, keeping the sheet order inside each event; newest event first.
    var groups = [], byName = {};
    list.forEach(function (it) {
      var name = it.event || 'Other moments';
      if (!byName[name]) { byName[name] = { name: name, items: [], time: 0, date: '' }; groups.push(byName[name]); }
      var g = byName[name];
      g.items.push(it);
      if (it.time > g.time) { g.time = it.time; g.date = it.date; }
    });
    groups.sort(function (a, b) { return b.time - a.time; });

    viewList = [];
    groups.forEach(function (g) { g.items.forEach(function (it) { if (it.kind !== 'video-link') viewList.push(it); }); });

    $('gallery').innerHTML = groups.map(function (g, n) {
      var photos = g.items.filter(function (it) { return !it.video; }).length, clips = g.items.length - photos;
      var counts = [photos ? photos + (photos === 1 ? ' photo' : ' photos') : '', clips ? clips + (clips === 1 ? ' clip' : ' clips') : ''].filter(Boolean).join(' · ');
      return '<section class="g-event reveal" aria-labelledby="g-ev-' + n + '">' +
        '<div class="g-event-head"><h2 id="g-ev-' + n + '">' + esc(g.name) + '</h2>' +
        '<p class="label">' + esc([g.date, counts].filter(Boolean).join(' · ')) + '</p></div>' +
        '<div class="g-grid">' + g.items.map(tile).join('') + '</div></section>';
    }).join('');

    // A broken picture becomes a plain tile instead of a broken-image icon.
    $('gallery').querySelectorAll('.g-thumb img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.outerHTML = '<span class="g-blank label">' + (img.closest('.g-tile').querySelector('.g-badge') ? 'Clip' : 'Photo') + '</span>';
      });
    });
    UI.reveal();
  }

  function renderChips() {
    var photos = items.filter(function (it) { return !it.video; }).length, clips = items.length - photos;
    if (!photos || !clips) return; // only one kind: no need to filter
    $('gallery-chips').innerHTML = [['all', 'All', items.length], ['photos', 'Photos', photos], ['videos', 'Clips', clips]].map(function (c) {
      return '<button type="button" class="chip glass" data-f="' + c[0] + '" aria-pressed="' + (filter === c[0]) + '">' +
        c[1] + ' <span class="chip-count">' + c[2] + '</span></button>';
    }).join('');
    $('gallery-chips').hidden = false;
  }

  $('gallery-chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    filter = b.dataset.f;
    $('gallery-chips').querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    render();
  });

  /* ---------- larger view (lightbox) ---------- */

  function show(at) {
    viewAt = (at + lbList.length) % lbList.length;
    var it = lbList[viewAt];
    $('g-title').textContent = it.title;
    $('g-media').innerHTML = it.kind === 'photo'
      ? '<img src="' + esc(it.link) + '" alt="' + esc(it.title) + '">'
      : '<video src="' + esc(it.link) + '" controls playsinline preload="metadata"></video>'; // plays only when the visitor presses play
    $('g-caption').textContent = [it.event, it.date].filter(Boolean).join(' · ') + (it.caption ? ' · ' + it.caption : '');
    var many = lbList.length > 1;
    $('g-prev').hidden = $('g-next').hidden = !many;
    $('g-count').textContent = many ? (viewAt + 1) + ' of ' + lbList.length : '';
  }

  function open(it, from, list) {
    opener = from;
    lbList = list || viewList;
    show(Math.max(0, lbList.indexOf(it)));
    stopAuto(); // the slideshow waits while the larger view is open
    $('g-lightbox').hidden = false;
    document.body.style.overflow = 'hidden'; // the page behind does not scroll
    $('g-close').focus();
  }

  function close() {
    $('g-media').innerHTML = ''; // stops any clip that is playing
    $('g-lightbox').hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
    startAuto();
  }

  $('gallery').addEventListener('click', function (e) {
    var b = e.target.closest('button.g-tile');
    if (b) open(items.filter(function (it) { return it.i === +b.dataset.i; })[0], b);
  });
  $('g-close').addEventListener('click', close);
  $('g-prev').addEventListener('click', function () { show(viewAt - 1); });
  $('g-next').addEventListener('click', function () { show(viewAt + 1); });
  $('g-lightbox').addEventListener('click', function (e) { if (e.target === $('g-lightbox')) close(); });
  $('g-lightbox').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') return close();
    if (e.key === 'ArrowLeft' && lbList.length > 1 && e.target.tagName !== 'VIDEO') return show(viewAt - 1);
    if (e.key === 'ArrowRight' && lbList.length > 1 && e.target.tagName !== 'VIDEO') return show(viewAt + 1);
    if (e.key !== 'Tab') return;
    // keep keyboard focus inside the larger view
    var f = [].filter.call($('g-lightbox').querySelectorAll('button, video'), function (el) { return !el.hidden; });
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- big slideshow of photos ---------- */

  var slides = [], scAt = 0, timer = 0, userPaused = false, hovering = false;
  var SC_DELAY = 4500; // milliseconds each photo stays on screen

  function buildShowcase() {
    slides = items.filter(function (it) { return it.kind === 'photo'; });
    if (!slides.length) { $('showcase').hidden = true; return; } // clips only: no slideshow
    $('sc-slides').innerHTML = slides.map(function (it, n) {
      var where = [it.event, it.date].filter(Boolean).join(' · ');
      // Each slide: a blurred copy fills the frame behind, the whole photo sits on top (nothing cropped).
      return '<figure class="sc-slide"' + (n ? ' hidden' : '') + ' data-n="' + n + '">' +
        '<img class="sc-bg" data-src="' + esc(it.link) + '" alt="" aria-hidden="true">' +
        '<button type="button" class="sc-open" aria-label="View larger: ' + esc(it.title) + '">' +
          '<img class="sc-img" data-src="' + esc(it.link) + '" alt="' + esc(it.title) + '"></button>' +
        '<figcaption><strong>' + esc(it.title) + '</strong>' + (where ? '<span>' + esc(where) + '</span>' : '') + '</figcaption>' +
        '</figure>';
    }).join('');
    loadAround(0);
    var many = slides.length > 1;
    $('sc-prev').hidden = $('sc-next').hidden = !many;
    $('sc-pause').hidden = !many || UI.reduceMotion; // nothing plays by itself with reduced motion
    $('sc-count').textContent = many ? '1 / ' + slides.length : '';
    $('showcase').hidden = false;
    startAuto();
  }

  // Load the picture for this slide and its neighbours only, so a long gallery stays quick.
  function loadAround(n) {
    [n - 1, n, n + 1].forEach(function (k) {
      var f = $('sc-slides').children[(k + slides.length) % slides.length];
      f.querySelectorAll('img[data-src]').forEach(function (img) {
        img.onerror = function () { img.style.visibility = 'hidden'; }; // a photo that can't load leaves a quiet empty frame, not a broken icon
        img.src = img.dataset.src; img.removeAttribute('data-src');
      });
    });
  }

  // Move to slide `to`. fromLeft = the new photo slides in from the left (and the old one leaves to the right).
  function goTo(to, fromLeft, announce) {
    if (slides.length < 2) return;
    to = (to + slides.length) % slides.length;
    if (to === scAt) return;
    var box = $('sc-slides'), oldF = box.children[scAt], newF = box.children[to];
    loadAround(to);
    newF.hidden = false;
    if (!UI.reduceMotion && newF.animate) {
      var dir = fromLeft ? -1 : 1, opts = { duration: 650, easing: 'cubic-bezier(.4, 0, .2, 1)' };
      newF.animate([{ transform: 'translateX(' + (dir * 100) + '%)' }, { transform: 'translateX(0)' }], opts);
      oldF.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-dir * 100) + '%)' }], opts)
        .onfinish = function () { if (+oldF.dataset.n !== scAt) oldF.hidden = true; };
    } else oldF.hidden = true;
    scAt = to;
    $('sc-count').textContent = (to + 1) + ' / ' + slides.length;
    if (announce) $('sc-status').textContent = 'Photo ' + (to + 1) + ' of ' + slides.length + ': ' + slides[to].title;
  }

  // Auto-play: the next photo slides in from the left every few seconds.
  // It waits while the pointer or keyboard focus is on the slideshow, when paused, when the tab is hidden,
  // and never runs for visitors who turned off motion.
  function startAuto() {
    stopAuto();
    if (slides.length < 2 || userPaused || hovering || UI.reduceMotion || !$('g-lightbox').hidden) return;
    timer = setInterval(function () { if (!document.hidden) goTo(scAt + 1, true, false); }, SC_DELAY);
  }
  function stopAuto() { clearInterval(timer); timer = 0; }

  $('sc-prev').addEventListener('click', function () { goTo(scAt - 1, true, true); startAuto(); });
  $('sc-next').addEventListener('click', function () { goTo(scAt + 1, false, true); startAuto(); });
  $('sc-pause').addEventListener('click', function () {
    userPaused = !userPaused;
    $('sc-pause').textContent = userPaused ? 'Play' : 'Pause';
    $('sc-pause').setAttribute('aria-label', (userPaused ? 'Play' : 'Pause') + ' slideshow');
    startAuto();
  });
  $('sc-slides').addEventListener('click', function (e) {
    var b = e.target.closest('.sc-open');
    if (b) open(slides[+b.closest('.sc-slide').dataset.n], b, slides);
  });
  $('showcase').addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(scAt - 1, true, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(scAt + 1, false, true); }
  });
  ['mouseenter', 'focusin'].forEach(function (t) {
    $('showcase').addEventListener(t, function () { hovering = true; stopAuto(); });
  });
  ['mouseleave', 'focusout'].forEach(function (t) {
    $('showcase').addEventListener(t, function (e) {
      if (e.type === 'focusout' && $('showcase').contains(e.relatedTarget)) return;
      hovering = false; startAuto();
    });
  });
  /* ---------- load ---------- */

  S.watch(['Gallery'], function (d, update) {
    if (update && !$('g-lightbox').hidden) return; // a photo is open: keep it; fresh photos show on the next visit
    stopAuto(); scAt = 0;
    items = (d.Gallery || []).filter(function (r) { return S.isYes(r.Show); }).map(toItem).filter(Boolean);
    if (!items.length) {
      $('showcase').hidden = true;
      $('gallery').innerHTML = '<p class="panel notice">Photos and clips from events will appear here soon.</p>';
      return;
    }
    buildShowcase();
    renderChips();
    render();
  }, function (err) {
    console.warn(err);
    $('showcase').hidden = true;
    $('gallery').innerHTML = '<p class="panel notice">Content is loading slowly. Please refresh.</p>';
  });
})();
