/* Contact page: details from the About tab, and the message form
   (validation, sending to CONFIG.CONTACT_FORM_URL, success and error messages). */
(function () {
  var S = window.Sheet, esc = S.esc;
  var $ = function (id) { return document.getElementById(id); };
  var formUrl = String((window.CONFIG || {}).CONTACT_FORM_URL || '').trim();
  var myEmail = ''; // Rahul's email from the About tab, if any

  /* ---------- left: contact details ---------- */

  function row(label, html) { return '<div class="fact"><dt>' + label + '</dt><dd>' + html + '</dd></div>'; }

  function renderDetails(a) {
    myEmail = /@/.test(a.Email || '') ? a.Email.trim() : '';
    var html = '';
    if (a['Open To']) html += row('Open to', esc(a['Open To']));
    if (a.Availability) html += row('Availability', esc(a.Availability));
    if (a.Location) html += row('Location', esc(a.Location));
    if (myEmail) html += row('Email',
      '<span class="email-line"><a id="email-link" class="text-link" href="mailto:' + esc(myEmail) + '">' + esc(myEmail) + '</a>' +
      '<button id="copy-email" class="copy-btn" type="button" aria-label="Copy email address">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '</button><span id="copy-status" class="copy-status label" aria-live="polite"></span></span>');
    if (a['Reply Time']) html += row('Reply time', esc(a['Reply Time'])); // optional field
    $('details').innerHTML = html;

    var links = [['LinkedIn', a.LinkedIn], ['GitHub', a.GitHub], ['Newsletter', a['Newsletter Link']]]
      .map(function (l) {
        var url = S.safeUrl(l[1]);
        return /^https?:/i.test(url) ? '<a class="pill glass" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + l[0] + '</a>' : '';
      }).join('');
    $('detail-links').innerHTML = links;
    $('details-empty').hidden = !!(html || links);

    if (myEmail) $('copy-email').addEventListener('click', copyEmail);
  }

  // Same pattern as the About page: copy, show "Copied"; if copying is blocked, select the text instead.
  function copyEmail() {
    var status = $('copy-status');
    function done(msg) { status.textContent = msg; setTimeout(function () { status.textContent = ''; }, 2500); }
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents($('email-link'));
      var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
      done('Selected. Press Ctrl+C or Cmd+C to copy.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(myEmail).then(function () { done('Copied'); }, fallback);
    else fallback();
  }

  S.load(['About']).then(function (d) {
    var a = S.aboutMap(d.About), name = a.Name || 'Rahul Saxena';
    document.title = 'Contact · ' + name;
    var desc = 'Get in touch with ' + name + ' about equity research and financial analyst roles.';
    [['meta[name="description"]', desc], ['meta[property="og:title"]', 'Contact · ' + name], ['meta[property="og:description"]', desc]]
      .forEach(function (m) { var el = document.querySelector(m[0]); if (el) el.setAttribute('content', m[1]); });
    renderDetails(a);
  }).catch(function (err) {
    console.warn(err);
    $('details-empty').hidden = false;
  });

  /* ---------- right: the form ---------- */

  var form = $('contact-form'), btn = $('send-btn'), notice = $('form-notice');
  var fields = {
    name: { el: $('f-name'), check: function (v) { return v ? '' : 'Please enter your name.'; } },
    email: { el: $('f-email'), check: function (v) {
      if (!v) return 'Please enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address, like name@example.com.';
    } },
    message: { el: $('f-message'), check: function (v) { return v ? '' : 'Please write a short message.'; } }
  };
  var tried = false; // after the first Send, fields re-check when you leave them

  function value(key) { return fields[key].el.value.trim(); }

  // Checks one field, shows or clears its message, returns true if it is fine.
  function checkField(key) {
    var f = fields[key], msg = f.check(value(key)), err = $(f.el.id + '-error');
    err.textContent = msg ? msg : '';
    err.hidden = !msg;
    if (msg) f.el.setAttribute('aria-invalid', 'true'); else f.el.removeAttribute('aria-invalid');
    return !msg;
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].el.addEventListener('blur', function () { if (tried) checkField(key); });
  });

  // Live character count for the message.
  $('f-message').addEventListener('input', function () {
    $('f-message-count').textContent = $('f-message').value.length + ' / 2000';
  });

  function setSending(on) {
    btn.disabled = on;
    btn.textContent = on ? 'Sending…' : 'Send message';
  }

  function showSuccess(visitorEmail) {
    form.reset();
    form.hidden = true;
    var box = $('form-result');
    box.innerHTML = '<div class="form-success"><h2>Thank you.</h2><p></p><a class="btn btn-glass glass" href="index.html">Back to Home</a></div>';
    box.querySelector('p').textContent = 'Your message has arrived. I\'ll reply to ' + visitorEmail + ' as soon as I can.';
    box.querySelector('.form-success').setAttribute('tabindex', '-1');
    box.querySelector('.form-success').focus();
  }

  function showError() {
    notice.className = 'form-notice is-error';
    notice.innerHTML = '<p>Sorry, that didn\'t send. Please try again' +
      (myEmail ? ', or email me directly at <a class="text-link" href="mailto:' + esc(myEmail) + '">' + esc(myEmail) + '</a>.' : '.') + '</p>';
  }

  // No form address in config.js yet: say so honestly, and offer the visitor's email app instead.
  function showNotSwitchedOn(name, message) {
    notice.className = 'form-notice';
    var html = '<p>The message form is not switched on yet.</p>';
    if (myEmail) {
      var mailto = 'mailto:' + myEmail +
        '?subject=' + encodeURIComponent('Portfolio message from ' + name) + '&body=' + encodeURIComponent(message);
      html += '<p><a class="btn btn-glass glass" href="' + esc(mailto) + '">Open in your email app</a></p>' +
        '<p>Or write to ' + esc(myEmail) + '.</p>';
    }
    notice.innerHTML = html;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    tried = true;
    notice.innerHTML = '';

    // 1. Validate every field; show a summary and focus the first problem.
    var bad = Object.keys(fields).filter(function (key) { return !checkField(key); });
    var summary = $('form-summary');
    if (bad.length) {
      summary.textContent = bad.length === 1 ? 'Please fix 1 field below.' : 'Please fix ' + bad.length + ' fields below.';
      summary.hidden = false;
      fields[bad[0]].el.focus();
      return;
    }
    summary.hidden = true;

    var name = value('name'), email = value('email'), message = value('message');

    // 2. Spam bot filled the hidden field: pretend it worked, send nothing.
    if ($('f-website').value) return showSuccess(email);

    // 3. Form not connected yet (preview): never fake a success.
    if (!/^https:\/\//i.test(formUrl)) return showNotSwitchedOn(name, message);

    // 4. Send, giving up after 15 seconds.
    setSending(true);
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 15000);
    fetch(formUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: message, _subject: 'Portfolio message from ' + name }),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      if (!res.ok) throw new Error('Form service returned ' + res.status);
      showSuccess(email);
    }).catch(function (err) {
      console.warn(err);
      showError(); // what they typed stays in the form
    }).then(function () {
      clearTimeout(timer);
      setSending(false);
    });
  });
})();
