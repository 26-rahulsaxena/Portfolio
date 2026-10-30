/* Data layer: loads sheet tabs (sample or live CSV) and provides small helpers.
   Everything is exposed on window.Sheet. */
(function () {
  var CONFIG = window.CONFIG || { SHEET_URLS: {} };
  var pending = {};

  // CSV parser: handles quoted commas, doubled quotes and line breaks inside quoted cells.
  function parseCSV(text) {
    var rows = [], row = [], cell = '', inQuotes = false;
    text = text.replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cell += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // Turns a table (first row = headings) into objects keyed by heading.
  function toObjects(table) {
    if (!table.length) return [];
    var head = table[0].map(function (h) { return h.trim(); });
    return table.slice(1)
      .filter(function (r) { return r.some(function (c) { return c.trim(); }); })
      .map(function (r) {
        var o = {};
        head.forEach(function (h, i) { if (h) o[h] = (r[i] == null ? '' : String(r[i])).trim(); });
        return o;
      });
  }

  /* ---------- loading, with a saved copy for instant repeat visits ----------
     Each tab's last good data is kept in this browser (localStorage). A page shows the saved copy at once,
     then fetches the sheet in the background and redraws only if something changed. */
  var SAVE_VERSION = 'v1';      // bump when sheet columns change, so old saved copies are ignored
  var SAVE_MAX = 400000;        // characters per tab; a bigger tab is simply not saved
  var FRESH_MS = 60 * 1000;     // a copy saved less than a minute ago is not re-fetched (quick page hops)
  var TIMEOUT_MS = 12000;       // give up on Google after 12 seconds

  function readSaved(name) {
    try {
      var s = JSON.parse(localStorage.getItem('sheet:' + SAVE_VERSION + ':' + name));
      return s && Array.isArray(s.rows) ? s : null;
    } catch (e) { return null; } // private windows and blocked storage
  }
  function save(name, rows) {
    if (!rows.length) return; // never replace good data with an empty result
    try {
      var txt = JSON.stringify({ t: Date.now(), rows: rows });
      if (txt.length <= SAVE_MAX) localStorage.setItem('sheet:' + SAVE_VERSION + ':' + name, txt);
    } catch (e) { /* storage full or blocked: still works, just not instant next time */ }
  }

  // One network request per tab per page, shared by everyone who asks for it.
  function fetchTab(name) {
    var url = (CONFIG.SHEET_URLS || {})[name];
    if (!url) return Promise.reject(new Error('No sheet link for ' + name + ' in js/config.js'));
    if (!pending[name]) {
      var ctl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
      pending[name] = fetch(url, ctl ? { signal: ctl.signal } : undefined).then(function (res) {
        if (!res.ok) throw new Error('Sheet ' + name + ' returned ' + res.status);
        return res.text();
      }).then(function (text) {
        clearTimeout(timer);
        var rows = toObjects(parseCSV(text));
        save(name, rows);
        return rows;
      }, function (e) { clearTimeout(timer); delete pending[name]; throw e; });
    }
    return pending[name];
  }

  function sampleRows(name) {
    return ((window.SAMPLE_DATA || {})[name] || []).map(function (r) {
      var o = {};
      Object.keys(r).forEach(function (k) { o[k] = r[k] == null ? '' : String(r[k]).trim(); });
      return o;
    });
  }

  function emit(type, detail) {
    if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent(type, { detail: detail }));
  }

  // watch(['Projects','About'], draw, fail): calls draw({ Projects: [...], About: [...], failed: [...] }, isUpdate)
  //   - at once with the saved copy (if this browser has one for every tab),
  //   - again only if the fresh sheet differs (isUpdate = true), so pages can keep scroll, filters and open views.
  // A tab that fails comes back with its saved copy, or empty (its section then hides) and is listed in `failed`.
  // fail() runs only if nothing at all could be shown. background = true for the header/footer (no loader).
  function watch(names, draw, fail, background) {
    var shown = null;
    var waiting = false;
    function done(ok) { if (waiting) { waiting = false; emit('sheetready', { ok: ok }); } }
    function show(d, failed) {
      var key = JSON.stringify(names.map(function (n) { return d[n]; }));
      if (key === shown) return;
      var update = shown !== null;
      shown = key;
      d.failed = failed;
      if (failed.length) emit('sheetfailed', failed);
      draw(d, update);
      done(true);
    }
    if (!background) { waiting = true; emit('sheetwait'); }

    if (CONFIG.USE_LOCAL_SAMPLE) {
      var s = {}; names.forEach(function (n) { s[n] = sampleRows(n); });
      return show(s, []);
    }

    var saved = {}, all = true, recent = true;
    names.forEach(function (n) {
      var c = readSaved(n);
      if (c) saved[n] = c.rows; else all = false;
      if (!c || Date.now() - c.t > FRESH_MS) recent = false;
    });
    if (all) show(saved, []);
    if (all && recent) return;

    var failed = [];
    Promise.all(names.map(function (n) {
      return fetchTab(n).catch(function (e) {
        console.warn('Could not load the ' + n + ' tab:', e.message || e);
        failed.push(n);
        return saved[n] || []; // a failed refresh keeps the saved copy
      });
    })).then(function (lists) {
      if (names.length && failed.length === names.length && !names.some(function (n) { return saved[n]; })) {
        done(false);
        if (fail) fail(new Error('No sheet tabs could be loaded'));
        return;
      }
      var d = {};
      names.forEach(function (n, i) { d[n] = lists[i]; });
      show(d, failed.filter(function (n) { return !saved[n]; }));
    });
  }

  // About tab (Field / Value) -> { Name: '...', ... }. Values starting "e.g." are sheet hints, treated as blank.
  function aboutMap(rows) {
    var map = {};
    (rows || []).forEach(function (r) {
      var v = (r.Value || '').trim();
      if (r.Field) map[r.Field.trim()] = /^e\.g\./i.test(v) ? '' : v;
    });
    return map;
  }

  /* ---------- small helpers ---------- */

  function isYes(v) { return String(v || '').trim().toLowerCase() === 'yes'; }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Only allow web, mail and relative links from the sheet (blocks javascript: and similar).
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf('//') === 0) return '';
    return u;
  }

  // Google Drive share links do not display as images; turn them into a thumbnail link.
  function imageUrl(u) {
    u = safeUrl(u);
    var m = /drive\.google\.com/.test(u) && u.match(/\/d\/([\w-]+)|[?&]id=([\w-]+)/);
    return m ? 'https://drive.google.com/thumbnail?id=' + (m[1] || m[2]) + '&sz=w1200' : u;
  }

  function slug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function makeId(tab, title) { return slug(tab) + '-' + (slug(title) || 'untitled'); }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Accepts 2026-10-26 (preferred), 26/10/2026 or 10/26/2026, 26-10-2026, and "Oct 26, 2026" / "26 Oct 2026".
  // For a date like 05/06/2026 that could be either way round, day first is assumed (as in India).
  // Anything it cannot read gives null: the date is then left out and the item sorts last.
  function validDate(y, m, d) {
    var x = new Date(y, m - 1, d);
    return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d ? x : null;
  }
  function parseDate(s) {
    s = String(s || '').trim();
    if (!s) return null;
    var m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (m) return validDate(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
    if (m) {
      var a = +m[1], b = +m[2], y = +m[3];
      return b > 12 ? validDate(y, a, b) : validDate(y, b, a); // second number above 12 means month/day
    }
    m = s.match(/^(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/i) || s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/i);
    if (m) {
      var day = /\d/.test(m[1]) ? +m[1] : +m[2], mon = /\d/.test(m[1]) ? m[2] : m[1];
      var mi = MONTHS.map(function (x) { return x.toLowerCase(); }).indexOf(mon.slice(0, 3).toLowerCase());
      return mi < 0 ? null : validDate(+m[3], mi + 1, day);
    }
    return null;
  }
  function fmtDate(s) {
    var d = parseDate(s);
    return d ? MONTHS[d.getMonth()] + ' ' + d.getFullYear() : '';
  }

  function num(v) {
    var n = parseFloat(String(v == null ? '' : v).replace(/[₹,\s]/g, ''));
    return isFinite(n) ? n : null;
  }

  // Upside in percent. Uses the sheet's Upside cell ("20%" or 0.2); if blank, Target Price / CMP - 1.
  function upside(row) {
    var raw = String(row.Upside || '').trim();
    var n = num(raw.replace('%', ''));
    if (n !== null) return raw.indexOf('%') > -1 ? n : n * 100;
    var tp = num(row['Target Price']), cmp = num(row.CMP);
    return tp !== null && cmp ? (tp / cmp - 1) * 100 : null;
  }
  function fmtPct(p) { return p === null ? '' : (p >= 0 ? '+' : '−') + Math.abs(p).toFixed(1) + '%'; }
  function fmtINR(v) { var n = num(v); return n === null ? '' : '₹' + n.toLocaleString('en-IN'); }

  var CALLS = {
    buy: { cls: 'buy', icon: '▲', word: 'BUY' },
    hold: { cls: 'hold', icon: '◆', word: 'HOLD' },
    sell: { cls: 'sell', icon: '▼', word: 'SELL' }
  };
  function call(rec) { return CALLS[String(rec || '').trim().toLowerCase()] || null; }

  /* ---------- items (Research, Projects, Articles as one list) ---------- */

  function typeLabel(tab, r) {
    if (tab === 'Research') return ['Research', r.Sector];
    if (tab === 'Articles') return ['Article', r.Topic];
    return ['Project', r.Category];
  }

  // Shown rows from the three work tabs, each wrapped with what cards need.
  function workItems(data) {
    var out = [];
    ['Research', 'Projects', 'Articles'].forEach(function (tab) {
      (data[tab] || []).forEach(function (r) {
        if (!isYes(r.Show)) return;
        var title = r.Title || r.Company || '[Untitled]';
        var d = parseDate(r.Date);
        out.push({
          tab: tab, row: r, title: title,
          id: makeId(tab, title),
          href: 'project.html?type=' + tab.toLowerCase() + '&id=' + encodeURIComponent(makeId(tab, title)),
          label: typeLabel(tab, r).filter(Boolean).join(' · '),
          line: r['Key Result'] || r.Summary || '',
          time: d ? d.getTime() : 0,
          featured: isYes(r.Featured),
          rank: num(r.Rank)
        });
      });
    });
    return out;
  }

  function byNewest(a, b) { return b.time - a.time; }
  // Featured first (Rank ascending, blank last, then newest); the rest newest first.
  function byFeatured(a, b) {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.featured) {
      var ra = a.rank === null ? Infinity : a.rank, rb = b.rank === null ? Infinity : b.rank;
      if (ra !== rb) return ra - rb;
    }
    return byNewest(a, b);
  }

  // Filter type used on the Projects page: research, models, dashboards, articles or other.
  function filterType(item) {
    if (item.tab === 'Research') return 'research';
    if (item.tab === 'Articles') return 'articles';
    var cat = String(item.row.Category || '').trim().toLowerCase();
    return cat === 'model' ? 'models' : cat === 'dashboard' ? 'dashboards' : 'other';
  }

  window.Sheet = {
    filterType: filterType,
    watch: watch, parseCSV: parseCSV, toObjects: toObjects, aboutMap: aboutMap,
    isYes: isYes, esc: esc, safeUrl: safeUrl, imageUrl: imageUrl, makeId: makeId,
    parseDate: parseDate, fmtDate: fmtDate, num: num, upside: upside, fmtPct: fmtPct, fmtINR: fmtINR,
    call: call, workItems: workItems, byNewest: byNewest, byFeatured: byFeatured
  };
})();
