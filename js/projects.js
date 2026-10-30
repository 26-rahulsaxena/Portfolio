/* Projects page: filter chips, search, sort, "Show more", and shareable links (?type=...&q=...). */
(function () {
  var S = window.Sheet;
  var $ = function (id) { return document.getElementById(id); };

  var TYPES = [['all', 'All'], ['research', 'Research'], ['models', 'Models'],
               ['dashboards', 'Dashboards'], ['articles', 'Articles'], ['other', 'Other']];
  var SEARCH_FIELDS = ['Title', 'Company', 'Sector', 'Topic', 'Category', 'Tags',
                       'Tools Used', 'Summary', 'Valuation Method', 'Platform'];
  var PAGE_SIZE = 12;

  var items = [];
  var state = { type: 'all', q: '', sort: 'newest', shown: PAGE_SIZE };

  // Start from the address bar, e.g. projects.html?type=research&q=pharma
  var params = new URLSearchParams(location.search);
  state.type = (params.get('type') || 'all').toLowerCase();
  state.q = params.get('q') || '';

  // Keep the address bar in step, so the current view can be shared or reloaded.
  function writeUrl() {
    var p = new URLSearchParams();
    if (state.type !== 'all') p.set('type', state.type);
    if (state.q.trim()) p.set('q', state.q.trim());
    var qs = p.toString();
    try { history.replaceState(null, '', qs ? '?' + qs : location.pathname); } catch (e) { /* not allowed here: ignore */ }
  }

  function count(type) {
    return type === 'all' ? items.length : items.filter(function (i) { return i.type === type; }).length;
  }

  // Chips: "All" always, the others only when they have at least one item.
  function renderChips() {
    $('chips').innerHTML = TYPES.filter(function (t) { return t[0] === 'all' || count(t[0]); }).map(function (t) {
      return '<button type="button" class="chip glass" data-type="' + t[0] + '" aria-pressed="' + (state.type === t[0]) + '">' +
        t[1] + ' <span class="chip-count">' + count(t[0]) + '</span></button>';
    }).join('');
  }

  function matching() {
    var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    var list = items.filter(function (i) {
      return (state.type === 'all' || i.type === state.type) &&
        words.every(function (w) { return i.text.indexOf(w) > -1; });
    });
    if (state.sort === 'oldest') list.sort(function (a, b) { return S.byNewest(b, a); });
    else list.sort(state.sort === 'featured' ? S.byFeatured : S.byNewest);
    return list;
  }

  // fadeFrom: cards from this position on fade in (first load and "Show more"); filtering doesn't replay it.
  function render(fadeFrom, focusFrom) {
    var list = matching(), visible = list.slice(0, state.shown);

    $('grid').innerHTML = visible.map(function (i, n) {
      return UI.card(i, n >= fadeFrom ? ' reveal' : '', true);
    }).join('');
    $('show-more').hidden = list.length <= state.shown;
    $('result-line').textContent = list.length ? 'Showing ' + visible.length + ' of ' + list.length : 'No matches';
    $('chips').querySelectorAll('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.type === state.type));
    });

    var empty = $('empty');
    empty.hidden = list.length > 0;
    if (!list.length) {
      empty.innerHTML = '<div class="panel notice empty-state"><p>Nothing matches that. Try another filter or clear the search.</p>' +
        '<button id="clear-filters" class="btn btn-glass glass" type="button">Clear filters</button></div>';
    }

    // After "Show more", move keyboard focus to the first new card.
    if (focusFrom && $('grid').children[focusFrom]) $('grid').children[focusFrom].focus();
    UI.reveal();
  }

  function update() { state.shown = PAGE_SIZE; writeUrl(); render(Infinity); }

  /* ---------- events ---------- */

  $('chips').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (b) { state.type = b.dataset.type; update(); }
  });

  var input = $('search-input'), clear = $('search-clear'), timer;
  input.addEventListener('input', function () {
    clear.hidden = !input.value;
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = input.value; update(); }, 120);
  });
  clear.addEventListener('click', function () {
    input.value = ''; clear.hidden = true; state.q = ''; update(); input.focus();
  });

  $('sort-select').addEventListener('change', function (e) { state.sort = e.target.value; render(Infinity); });

  $('show-more').addEventListener('click', function () {
    var from = state.shown;
    state.shown += PAGE_SIZE;
    render(from, from);
  });

  $('empty').addEventListener('click', function (e) {
    if (!e.target.closest('#clear-filters')) return;
    state.type = 'all'; state.q = ''; input.value = ''; clear.hidden = true;
    update(); input.focus();
  });

  /* ---------- load ---------- */

  S.watch(['Research', 'Projects', 'Articles'], function (d, update) {
    items = S.workItems(d).map(function (i) {
      i.type = S.filterType(i);
      i.text = SEARCH_FIELDS.map(function (f) { return i.row[f] || ''; }).join(' ').toLowerCase();
      return i;
    });

    document.querySelector('.controls').hidden = $('result-line').hidden = !items.length;
    if (!items.length) {
      $('grid').innerHTML = '<p class="panel notice">New work is being added. Please check back soon.</p>';
      return;
    }

    // An unknown or empty type in the link falls back to "All".
    if (!TYPES.some(function (t) { return t[0] === state.type; }) || !count(state.type)) state.type = 'all';
    input.value = state.q;
    clear.hidden = !state.q;
    $('disclaimer').hidden = !count('research');
    renderChips();
    writeUrl();
    render(update ? Infinity : 0); // a quiet redraw with fresh data keeps the filter, search and "Show more"
  }, function (err) {
    console.warn(err);
    $('chips').innerHTML = '';
    $('grid').innerHTML = '<p class="panel notice">Content is loading slowly. Please refresh.</p>';
  });
})();
