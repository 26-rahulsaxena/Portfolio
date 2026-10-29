/* Project detail page: project.html?type=<tab>&id=<id>. Finds one item and shows all its details. */
(function () {
  var S = window.Sheet, esc = S.esc;
  var $ = function (id) { return document.getElementById(id); };

  var params = new URLSearchParams(location.search);
  var type = (params.get('type') || '').toLowerCase();
  var id = params.get('id') || '';

  // Plain text from the sheet -> escaped paragraphs (one per line).
  function paragraphs(text) {
    return String(text).split(/\n+/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
  }

  // A link button, or nothing if the link is blank or unsafe.
  function button(url, text, gold) {
    url = S.safeUrl(url);
    if (!url) return '';
    var external = /^https?:/i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a class="btn ' + (gold ? 'btn-gold' : 'btn-glass glass') + '" href="' + esc(url) + '"' + external + '>' + text + '</a>';
  }

  // One label/value row; html must already be escaped. Blank values are skipped.
  function fact(label, html) {
    return html ? '<div class="fact"><dt>' + label + '</dt><dd>' + html + '</dd></div>' : '';
  }

  function chips(text) {
    return String(text || '').split(/[;,]/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t) { return '<li class="tag">' + esc(t) + '</li>'; }).join('');
  }

  function factsPanel(item) {
    var r = item.row, date = esc(S.fmtDate(r.Date));
    if (item.tab === 'Research') {
      var c = S.call(r.Recommendation), cls = c ? c.cls : '';
      var up = S.fmtPct(S.upside(r));
      var call =
        fact('Target price', esc(S.fmtINR(r['Target Price']))) +
        fact('CMP', esc(S.fmtINR(r.CMP))) +
        fact('Upside', up && '<span class="' + cls + '">' + esc(up) + '</span>') +
        fact('Recommendation', c && '<span class="call ' + cls + '"><span aria-hidden="true">' + c.icon + '</span> ' + c.word + '</span>');
      return '<dl>' + fact('Company', esc(r.Company)) + fact('Sector', esc(r.Sector)) +
        fact('Valuation method', esc(r['Valuation Method'])) + fact('Date', date) + '</dl>' +
        (call ? '<dl class="call-block">' + call + '</dl><p class="label call-note">Academic work, not investment advice.</p>' : '');
    }
    if (item.tab === 'Projects') {
      var tools = chips(r['Tools Used']);
      return '<dl>' + fact('Category', esc(r.Category)) + fact('My role', esc(r['My Role'])) +
        fact('Tools used', tools && '<ul class="tags">' + tools + '</ul>') + fact('Date', date) + '</dl>';
    }
    var mins = S.num(r['Read Time (min)']);
    return '<dl>' + fact('Topic', esc(r.Topic)) + fact('Platform', esc(r.Platform)) +
      fact('Read time', mins ? esc(mins + ' min read') : esc(r['Read Time (min)'])) + fact('Date', date) + '</dl>';
  }

  var SECTIONS = {
    Research: [['Summary', 'Summary'], ['Key Result', 'Key result'], ['Key Risks', 'Key risks'], ['Lessons Learned', 'Lessons learned']],
    Projects: [['Summary', 'Summary'], ['Key Result', 'Key result'], ['Lessons Learned', 'Lessons learned']],
    Articles: [['Summary', 'Summary']]
  };

  function render(item) {
    var r = item.row, date = S.fmtDate(r.Date);
    var buttons = item.tab === 'Research' ? button(r['Report Link'], 'Read report', true) + button(r['Model Link'], 'Open model')
      : item.tab === 'Projects' ? button(r.Link, 'Open project', true)
      : button(r.Link, 'Read on ' + (r.Platform || 'the web'), true) + button(r['PDF Link'], 'Download PDF');
    var img = item.tab === 'Projects' ? S.imageUrl(r['Image Link']) : '';
    var sections = SECTIONS[item.tab].filter(function (s) { return r[s[0]]; }).map(function (s) {
      return '<section class="prose"><h2>' + s[1] + '</h2>' + paragraphs(r[s[0]]) + '</section>';
    }).join('');
    var tags = item.tab === 'Projects' ? chips(r.Tags) : '';

    $('detail').innerHTML =
      '<header class="detail-head">' +
        '<div class="card-meta"><span class="label">' + esc(item.label) + '</span>' +
          (date ? '<span class="label">' + esc(date) + '</span>' : '') + '</div>' +
        '<h1>' + esc(item.title) + '</h1>' +
        (item.line ? '<p class="standout">' + esc(item.line) + '</p>' : '') +
        (buttons ? '<div class="btn-row">' + buttons + '</div>' : '') +
      '</header>' +
      '<div class="detail-body">' +
        '<aside class="panel facts" aria-label="Key facts">' + factsPanel(item) + '</aside>' +
        '<div class="detail-main">' +
          (img ? '<figure class="detail-image"><img src="' + esc(img) + '" alt="' + esc(item.title) + '" loading="lazy"></figure>' : '') +
          sections +
          (tags ? '<section class="prose"><h2>Tags</h2><ul class="tags">' + tags + '</ul></section>' : '') +
        '</div>' +
      '</div>';

    // If the image link is broken, remove it instead of showing a broken image.
    var el = $('detail').querySelector('.detail-image img');
    if (el) el.addEventListener('error', function () { el.closest('figure').remove(); });

    var summary = String(r.Summary || item.line || '').replace(/\s+/g, ' ').trim();
    if (summary.length > 150) summary = summary.slice(0, 147).trim() + '…';
    setMeta(item.title + ' · Rahul Saxena', summary);
  }

  function setMeta(title, description) {
    document.title = title;
    var tags = { 'meta[name="description"]': description, 'meta[property="og:title"]': title, 'meta[property="og:description"]': description };
    Object.keys(tags).forEach(function (sel) {
      var m = document.querySelector(sel);
      if (m && tags[sel]) m.setAttribute('content', tags[sel]);
    });
  }

  // Up to three other items: same filter type first, then featured, then newest.
  function renderMore(items, current) {
    var t = S.filterType(current);
    var others = items.filter(function (i) { return i !== current; }).sort(function (a, b) {
      var sa = S.filterType(a) === t, sb = S.filterType(b) === t;
      return sa !== sb ? (sa ? -1 : 1) : S.byFeatured(a, b);
    }).slice(0, 3);
    if (!others.length) return;
    $('more-list').innerHTML = others.map(function (i) { return UI.card(i, ' reveal', true); }).join('');
    $('more').hidden = false;
  }

  function notFound() {
    setMeta('Project not found · Rahul Saxena', '');
    $('detail').innerHTML = '<div class="panel not-found"><h1>That project isn\'t available.</h1>' +
      '<p>It may have been renamed or hidden.</p><a class="btn btn-gold" href="projects.html">Browse all projects</a></div>';
  }

  S.load(['Research', 'Projects', 'Articles']).then(function (d) {
    var items = S.workItems(d);
    var item = items.filter(function (i) { return i.id === id && i.tab.toLowerCase() === type; })[0];
    if (!item) return notFound();
    render(item);
    renderMore(items, item);
    UI.reveal();
  }).catch(function (err) {
    console.warn(err);
    $('detail').innerHTML = '<p class="panel notice">Content is loading slowly. Please refresh.</p>';
  });
})();
