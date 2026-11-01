/* About page: the opening scroll scene (big name, photo docking left, typed headline), section pills, story, experience, education,
   skills, certificates (with a lightbox), testimonials, FAQ and the CV block. */
(function () {
  var S = window.Sheet, esc = S.esc;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = UI.reduceMotion;

  /* ---------- 1. The opening scene ----------
     One scroll listener and one animation loop that stops when idle. Scroll progress p (0 to 1 across the scene)
     is smoothed, then drives: the names fading and drifting apart, the photo docking to the left (desktop) or
     fading back (phones), and the headline appearing. Only transform, opacity and (on phones) filter change. */
  var scene = $('ab-scene'), nl = $('ab-first'), nr = $('ab-last'), photo = $('ab-photo'), glow = $('ab-glow');
  var head = $('ab-head'), hint = scene.querySelector('.ab-hint'), sections = $('ab-sections');
  var narrow = matchMedia('(max-width: 760px)');
  var asp = 622 / 900, geo = null, sy = 0, target = 0, cur = 0, raf = 0, wasNarrow = null;
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Layout reads happen only here: on load, on resize and when the page content changes size.
  function measure() {
    var n = narrow.matches, vw = innerWidth, vh = innerHeight;
    if (n !== wasNarrow) { [photo, glow, nl, nr, head].forEach(function (el) { el.removeAttribute('style'); }); wasNarrow = n; }
    var top = scene.getBoundingClientRect().top + scrollY, hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 70;
    geo = { n: n, vw: vw, vh: vh, top: top, run: Math.max(1, scene.offsetHeight - vh),
      end: sections.getBoundingClientRect().bottom + scrollY,              // where the page content ends
      H0: Math.min(.92 * vh, vh - hdr - 10, 1100), H1: Math.min(.86 * vh, vh - hdr - 24, 820, .40 * vw / asp) }; // never under the header
    geo.W0 = geo.H0 * 1.15; // the glow's width; its size and the photo's height come from the CSS (same formula)
    read();
  }
  function read() { sy = scrollY; target = geo ? clamp((sy - geo.top) / geo.run, 0, 1) : 0; }

  function draw() {
    var p = cur, n = geo.n;
    var fade = ease(seg(p, .22, .58));                 // names and (on phones) the photo fade back
    var show = ease(seg(p, .36, .66));                 // the headline comes forward
    var out = ease(seg(p, n ? .88 : .97, 1)), keep = 1 - out;
    glow.style.opacity = ((1 - fade * (n ? .5 : 0)) * keep).toFixed(3);
    if (n) {
      photo.style.opacity = ((1 - fade * .8) * keep).toFixed(3);
      photo.style.transform = 'translateX(-50%) scale(' + (1 + fade * .07).toFixed(3) + ')';
      photo.style.filter = 'blur(' + (fade * 2.2).toFixed(2) + 'px) drop-shadow(0 0 1.5px var(--ab-rim)) drop-shadow(0 0 26px var(--ab-glow))';
    } else {
      var m = ease(seg(p, .2, .6)), c = geo.vw / 2 + (.22 * geo.vw - geo.vw / 2) * m;
      var H = geo.H0 + (geo.H1 - geo.H0) * m, s = H / geo.H0;
      var lift = Math.min(0, geo.end - sy - geo.vh).toFixed(1);   // the photo leaves together with the end of the page
      photo.style.transform = 'translate(' + (c - H * asp / 2).toFixed(1) + 'px,' + lift + 'px) scale(' + s.toFixed(4) + ')';
      glow.style.transform = 'translate(' + (c - geo.W0 * s / 2).toFixed(1) + 'px,' + lift + 'px) scale(' + s.toFixed(4) + ')';
    }
    var gone = ease(seg(p, .2, .42));                 // the names are fully gone as the headline appears
    var dx = fade * (n ? 4 : 5.5), no = ((1 - gone) * keep).toFixed(3);
    nl.style.opacity = nr.style.opacity = no;
    nl.style.transform = 'translateX(' + (-dx).toFixed(2) + 'vw) scaleY(var(--ab-sy))';
    nr.style.transform = 'translateX(' + dx.toFixed(2) + 'vw) scaleY(var(--ab-sy))';
    head.style.opacity = (show * (n ? keep : 1)).toFixed(3);
    head.style.transform = 'translateY(' + ((1 - show) * 34).toFixed(1) + 'px)';
    head.style.pointerEvents = show > .5 ? 'auto' : 'none';
    hint.style.opacity = (1 - ease(seg(p, 0, .12))).toFixed(3);
    if (show > .25) startTyping();
  }
  function loop() {
    cur += (target - cur) * .14;
    if (Math.abs(target - cur) < .0004) cur = target;
    draw();
    raf = cur !== target ? requestAnimationFrame(loop) : 0;
  }
  function kick() { read(); if (!raf) raf = requestAnimationFrame(loop); }

  // A keyboard user tabbing into the headline pills: bring the headline fully into view first.
  head.addEventListener('focusin', function () {
    finishTyping();
    if (!reduce && geo && cur < .66) { scrollTo(0, geo.top + geo.run * .7); cur = target = .7; draw(); }
  });

  /* ---------- the headline types itself out once (shown at once on repeat visits and with reduced motion) ---------- */
  var typing = 0, typed = false;
  function lines() { return [$('hl1-ghost').textContent, $('hl2-ghost').textContent]; }
  function finishTyping() {
    if (typed) return;
    typed = true; clearTimeout(typing);
    var l = lines();
    $('hl1').textContent = l[0]; $('hl2').textContent = l[1];
    $('type-cursor').remove();
    head.classList.add('typed');
    try { localStorage.setItem('aboutTyped', '1'); } catch (e) {}
  }
  function startTyping() {
    if (typing || typed) return;
    var l = lines(), i = 0, total = l[0].length + l[1].length, cursor = $('type-cursor');
    (function step() {
      i++;
      $('hl1').textContent = l[0].slice(0, i);
      if (i > l[0].length) {
        if (cursor.parentNode !== $('hl2').parentNode) $('hl2').parentNode.appendChild(cursor); // the cursor moves to line two
        $('hl2').textContent = l[1].slice(0, i - l[0].length);
      }
      if (i < total) typing = setTimeout(step, 38); else finishTyping();
    })();
  }
  var seenBefore = false;
  try { seenBefore = !!localStorage.getItem('aboutTyped'); } catch (e) {}
  if (reduce || seenBefore) finishTyping();

  // The photo: your cut-out from config.js (HEAD_TURN.photo); a .png with the same name is tried if the .webp fails.
  // If neither loads, an old "Photo Link" from the sheet is used, and failing that the silhouette stays.
  var photoFailed = false;
  function setPhoto(src, onFail) {
    var img = new Image();
    img.alt = 'Portrait of Rahul Saxena';
    img.fetchPriority = 'high';
    img.onload = function () {
      if (img.naturalHeight) asp = img.naturalWidth / img.naturalHeight;
      photo.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
      photo.replaceChildren(img);
      if (geo) { measure(); kick(); }
    };
    img.onerror = onFail;
    img.src = src;
  }
  (function () {
    var cut = S.safeUrl(((window.CONFIG || {}).HEAD_TURN || {}).photo);
    var tries = !cut ? [] : /\.webp$/i.test(cut) ? [cut, cut.replace(/\.webp$/i, '.png')] : [cut];
    (function next() { if (tries.length) setPhoto(tries.shift(), next); else photoFailed = true; })();
  })();

  if (!reduce) {
    measure(); cur = target; draw();
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', function () { measure(); kick(); });
    if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); kick(); }).observe(sections);
  }

  /* ---------- Pills: jump to a section ---------- */
  document.querySelector('.pills').addEventListener('click', function (e) {
    var pill = e.target.closest('[data-target]');
    if (!pill) return;
    var target = $(pill.dataset.target);
    if (!target || target.hidden) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true }); // keyboard and screen-reader users land in the section too
  });

  // Hide a section and the pill that points to it.
  function hideSection(id) {
    $(id).hidden = true;
    var pill = document.querySelector('.pills [data-target="' + id + '"]');
    if (pill) pill.hidden = true;
  }

  /* ---------- small helpers ---------- */

  // Sort by Order (blank last), then the given date column, newest first.
  function byOrder(dateCol) {
    return function (a, b) {
      var oa = S.num(a.Order), ob = S.num(b.Order);
      oa = oa === null ? Infinity : oa; ob = ob === null ? Infinity : ob;
      if (oa !== ob) return oa - ob;
      var da = S.parseDate(a[dateCol]), db = S.parseDate(b[dateCol]);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    };
  }

  function shown(rows) { return (rows || []).filter(function (r) { return S.isYes(r.Show); }); }

  function paragraphs(text) {
    return String(text || '').split(/\n+/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
  }

  // External links open in a new tab; blank or unsafe links return ''.
  function link(url, text, cls) {
    url = S.safeUrl(url);
    if (!url) return '';
    var ext = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(url) + '"' + ext + '>' + text + '</a>';
  }

  function dateRange(r) {
    var start = S.fmtDate(r['Start Date']), end = S.fmtDate(r['End Date']) || 'Present';
    return start ? start + ' – ' + end : S.fmtDate(r['End Date']);
  }

  function year(s) { var d = S.parseDate(s); return d ? String(d.getFullYear()) : ''; }

  /* ---------- About tab: meta, CV links, email, photo, story, more about me ---------- */

  function renderAbout(a) {
    var name = a.Name || 'Rahul Saxena';
    var headline = a.Headline || 'Finance student · Aspiring equity research analyst';
    document.title = 'About · ' + name;
    [['meta[name="description"]', headline], ['meta[property="og:title"]', 'About · ' + name],
     ['meta[property="og:description"]', headline]].forEach(function (m) {
      var el = document.querySelector(m[0]);
      if (el) el.setAttribute('content', m[1]);
    });

    // Download CV (hero pill and CV block)
    var cv = S.safeUrl(a['Resume Link']);
    if (cv) document.querySelectorAll('.cv-link').forEach(function (el) {
      el.href = cv; el.target = '_blank'; el.rel = 'noopener noreferrer';
    });

    // Headline numbers (Stat 1-3), and LinkedIn / Newsletter links beside the email
    var stats = UI.stats(a);
    $('about-stats').innerHTML = stats; $('about-stats').hidden = !stats;
    [['pill-linkedin', a.LinkedIn], ['pill-newsletter', a['Newsletter Link']]].forEach(function (p) {
      var u = S.safeUrl(p[1]);
      if (/^https?:/i.test(u)) { $(p[0]).href = u; $(p[0]).hidden = false; }
    });

    // Reach me: copy email
    var email = /@/.test(a.Email || '') ? a.Email : '';
    if (email) {
      $('email-text').textContent = email;
      $('copy-email').hidden = false;
    }

    // Photo: only if the cut-out from config.js could not load, an old "Photo Link" row is used.
    var src = S.imageUrl(a['Photo Link']);
    if (src && photoFailed && $('face-silhouette')) setPhoto(src, function () {});

    // The big names, and the headline lines: optional rows "Hero Line 1", "Hero Line 2", "Hero Subline" in the About tab
    var parts = name.trim().split(/\s+/);
    $('ab-first').textContent = parts[0];
    $('ab-last').textContent = parts.slice(1).join(' ') || '';
    [['hl1', a['Hero Line 1']], ['hl2', a['Hero Line 2']]].forEach(function (h) {
      if (!h[1] || $(h[0] + '-ghost').textContent === h[1]) return;
      $(h[0] + '-ghost').textContent = $(h[0] + '-sr').textContent = h[1];
      if (typed) $(h[0]).textContent = h[1];
    });
    if (a['Hero Subline']) $('hero-sub').textContent = a['Hero Subline'];

    // My story
    $('positioning').textContent = a['Positioning Statement'] || '';
    $('positioning').hidden = !a['Positioning Statement'];
    $('bio').innerHTML = paragraphs(a.Bio);
    $('story-facts').innerHTML = [['Location', a.Location], ['Availability', a.Availability], ['Open to', a['Open To']]]
      .filter(function (f) { return f[1]; })
      .map(function (f) { return '<div class="fact"><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('');

    // More about me: small blocks, then the FAQ accordion
    var blocks = [['Current focus', a['Current Focus']], ['Languages', a.Languages], ['Interests', a.Interests]]
      .filter(function (b) { return b[1]; })
      .map(function (b) { return '<div class="more-block"><h3 class="label">' + b[0] + '</h3>' + paragraphs(b[1]) + '</div>'; }).join('');
    var faqs = [1, 2, 3].map(function (n) { return [a['FAQ ' + n + ' Question'], a['FAQ ' + n + ' Answer']]; })
      .filter(function (f) { return f[0] && f[1] && !/^e\.g\./i.test(f[1]); })
      .map(function (f, i) {
        return '<div class="faq-item"><h3><button type="button" class="faq-q" aria-expanded="false" aria-controls="faq-' + i + '" id="faq-q-' + i + '">' +
          '<span>' + esc(f[0]) + '</span><span class="faq-icon" aria-hidden="true">+</span></button></h3>' +
          '<div id="faq-' + i + '" class="faq-a" role="region" aria-labelledby="faq-q-' + i + '" hidden>' + paragraphs(f[1]) + '</div></div>';
      }).join('');
    $('more-blocks').innerHTML = blocks;
    $('faq').innerHTML = faqs;
    $('more-about').hidden = !(blocks || faqs);
  }

  // FAQ: open and close answers.
  $('faq').addEventListener('click', function (e) {
    var btn = e.target.closest('.faq-q');
    if (!btn) return;
    var open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    $(btn.getAttribute('aria-controls')).hidden = !open;
  });

  // Copy the email address, with a visible "Copied" message.
  $('copy-email').addEventListener('click', function () {
    var email = $('email-text').textContent, status = $('copy-status');
    function done(msg) { status.textContent = msg; setTimeout(function () { status.textContent = ''; }, 2500); }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents($('email-text'));
      var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      done('Selected. Press Ctrl+C or Cmd+C to copy.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(function () { done('Copied'); }, fallback);
    } else fallback();
  });

  /* ---------- 3 and 4. Experience and Education ---------- */

  function renderExperience(rows, aboutEducation) {
    rows = shown(rows).sort(byOrder('Start Date'));
    var isEdu = function (r) { return String(r.Type || '').trim().toLowerCase() === 'education'; };
    var work = rows.filter(function (r) { return !isEdu(r); });
    var edu = rows.filter(isEdu);

    if (work.length) {
      $('exp-list').innerHTML = work.map(function (r) {
        var bullets = String(r.Description || '').split(';').map(function (t) { return t.trim(); }).filter(Boolean);
        return timelineItem(dateRange(r), r.Type, r.Role || '[Role]', [r.Organization, r.Location],
          (bullets.length ? '<ul class="tl-points">' + bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
          link(r['Certificate Link'], 'View certificate', 'text-link'));
      }).join('');
      $('experience').hidden = false;
    } else hideSection('experience');

    if (edu.length) {
      $('edu-list').innerHTML = edu.map(function (r) {
        var years = [year(r['Start Date']), r['End Date'] ? year(r['End Date']) : 'Present'].filter(Boolean).join(' – ');
        return timelineItem(years, '', r.Role || '[Programme]', [r.Organization, r.Location],
          r.Description ? '<div class="prose">' + paragraphs(r.Description) + '</div>' : '');
      }).join('');
      $('education').hidden = false;
    } else if (aboutEducation) {
      $('edu-list').innerHTML = timelineItem('', '', aboutEducation, [], '');
      $('education').hidden = false;
    } else hideSection('education');
  }

  // One point on a timeline: dates (and an optional tag), title, place, then extra content (already escaped HTML).
  function timelineItem(when, tag, title, placeParts, extraHtml) {
    var place = placeParts.filter(Boolean).map(esc).join(' · ');
    return '<li class="tl-item">' +
      ((when || tag) ? '<p class="tl-when"><span class="label">' + esc(when) + '</span>' + (tag ? '<span class="tag">' + esc(tag) + '</span>' : '') + '</p>' : '') +
      '<h3>' + esc(title) + '</h3>' +
      (place ? '<p class="tl-place">' + place + '</p>' : '') +
      extraHtml + '</li>';
  }

  /* ---------- 5. Skills ---------- */

  function renderSkills(rows) {
    rows = shown(rows).filter(function (r) { return r.Skill; }).sort(byOrder());
    if (!rows.length) return hideSection('skills');
    var groups = [], byCat = {};
    rows.forEach(function (r) {
      var cat = r.Category || 'Skills';
      if (!byCat[cat]) { byCat[cat] = []; groups.push(cat); }
      byCat[cat].push(r);
    });
    $('skill-groups').innerHTML = groups.map(function (cat) {
      return '<div class="skill-group"><h3 class="label">' + esc(cat) + '</h3><ul class="skill-tags">' +
        byCat[cat].map(function (r) {
          var learning = String(r.Level || '').trim().toLowerCase() === 'learning';
          return '<li class="skill">' + esc(r.Skill) + (learning ? ' <span class="learning">Learning</span>' : '') + '</li>';
        }).join('') + '</ul></div>';
    }).join('');
    $('skills').hidden = false;
  }

  /* ---------- 6. Certificates and lightbox ---------- */

  var certRows = [];
  function renderCertificates(rows) {
    rows = shown(rows).sort(function (a, b) {
      var da = S.parseDate(a['Date Issued']), db = S.parseDate(b['Date Issued']);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });
    if (!rows.length) return hideSection('certificates');
    $('cert-list').innerHTML = rows.map(function (r, i) {
      var title = r.Title || '[Certificate]', img = S.imageUrl(r['Image Link']);
      var blank = '<div class="cert-thumb cert-blank"><span class="label">' + esc(r.Type || 'Certificate') + '</span></div>';
      var thumb = img
        ? '<button type="button" class="cert-thumb" data-cert="' + i + '" aria-label="View larger: ' + esc(title) + '">' +
            '<img src="' + esc(img) + '" alt="Certificate: ' + esc(title) + '" loading="lazy" width="400" height="280"></button>'
        : blank;
      var meta = [r.Issuer, year(r['Date Issued'])].filter(Boolean).map(esc).join(' · ');
      return '<li class="cert-row panel">' + thumb +
        '<div class="cert-text"><h3>' + esc(title) + '</h3>' + (meta ? '<p class="cert-meta">' + meta + '</p>' : '') +
        (r.Summary ? '<p class="cert-summary">' + esc(r.Summary) + '</p>' : '') + '</div>' +
        link(r['Verification Link'], 'Verify', 'text-link cert-verify') + '</li>';
    }).join('');

    // A broken image becomes the plain tile instead of a broken picture.
    $('cert-list').querySelectorAll('.cert-thumb img').forEach(function (img) {
      img.addEventListener('error', function () {
        var btn = img.closest('.cert-thumb'), r = rows[btn.dataset.cert];
        btn.outerHTML = '<div class="cert-thumb cert-blank"><span class="label">' + esc(r.Type || 'Certificate') + '</span></div>';
      });
    });

    certRows = rows;
    if ($('cert-list').dataset.ready) return; // redraw with fresh data: the click handler is already there
    $('cert-list').dataset.ready = '1';
    $('cert-list').addEventListener('click', function (e) {
      var btn = e.target.closest('button.cert-thumb');
      if (btn) openLightbox(certRows[btn.dataset.cert], btn);
    });
    $('certificates').hidden = false;
  }

  var opener = null;
  function openLightbox(r, from) {
    opener = from;
    $('lb-title').textContent = r.Title || 'Certificate';
    $('lb-img').src = S.imageUrl(r['Image Link']);
    $('lb-img').alt = 'Certificate: ' + (r.Title || '');
    $('lightbox').hidden = false;
    document.body.style.overflow = 'hidden'; // background does not scroll
    $('lb-close').focus();
  }
  function closeLightbox() {
    $('lightbox').hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus(); // focus returns to the tile
  }
  $('lb-close').addEventListener('click', closeLightbox);
  $('lightbox').addEventListener('click', function (e) { if (e.target === $('lightbox')) closeLightbox(); });
  $('lightbox').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'Tab') { e.preventDefault(); $('lb-close').focus(); } // Close is the only control: keep focus inside
  });

  /* ---------- 7. Testimonials ---------- */

  function renderTestimonials(rows) {
    rows = shown(rows).filter(function (r) { return r.Quote; }).sort(byOrder());
    if (!rows.length) return hideSection('testimonials');
    var cards = rows.map(function (r) {
      var name = esc(r.Name || '');
      var named = link(r.Link, name) || name;
      var who = [r['Role / Relationship'], r.Organization].filter(Boolean).map(esc).join(', ');
      return '<figure class="quote panel"><blockquote>' + paragraphs(r.Quote) + '</blockquote>' +
        ((named || who) ? '<figcaption>' + (named ? '<strong>' + named + '</strong>' : '') + (who ? '<span>' + who + '</span>' : '') + '</figcaption>' : '') +
        '</figure>';
    }).join('');
    $('testimonials').hidden = false;

    // The quotes scroll from left to right without end. The track holds identical copies of the quotes:
    // enough to cover even a wide screen, twice over, so the loop has no gap. Only the first copy is read
    // by screen readers; the others are hidden from them and from the Tab key.
    var box = $('quotes');
    box.innerHTML = '<div class="quote-head"><button class="ticker-toggle quote-toggle" type="button" aria-label="Pause testimonials">Pause</button></div>' +
      '<div class="quote-view"><div class="quote-track"><div class="quote-set">' + cards + '</div></div></div>';
    var track = box.querySelector('.quote-track');
    var setWidth = Math.max(1, track.firstChild.scrollWidth);
    var copies = Math.max(1, Math.ceil(Math.max(window.screen.width, box.clientWidth) / setWidth)) * 2;
    for (var i = 1; i < copies; i++) track.insertAdjacentHTML('beforeend', '<div class="quote-set" aria-hidden="true">' + cards + '</div>');
    track.querySelectorAll('[aria-hidden="true"] a').forEach(function (a) { a.tabIndex = -1; });
    track.style.setProperty('--quote-dur', Math.round(setWidth * copies / 2 / 35) + 's'); // about 35 pixels a second

    var btn = box.querySelector('.quote-toggle');
    if (btn.dataset.ready) return;
    btn.dataset.ready = '1';
    btn.addEventListener('click', function () {
      var paused = box.classList.toggle('paused');
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' testimonials');
    });
  }

  /* ---------- load everything ---------- */

  S.watch(['About', 'Experience', 'Skills', 'Certificates', 'Testimonials'], function (d) {
    var about = S.aboutMap(d.About);
    renderAbout(about);
    renderExperience(d.Experience, about.Education);
    renderSkills(d.Skills);
    renderCertificates(d.Certificates);
    renderTestimonials(d.Testimonials);
    UI.reveal();
  }, function (err) {
    console.warn(err);
    ['experience', 'education', 'skills'].forEach(hideSection);
    $('positioning').hidden = true; $('about-stats').hidden = true;
    $('bio').innerHTML = '<p class="panel notice">Content is loading slowly. Please refresh.</p>';
    UI.reveal();
  });
})();
