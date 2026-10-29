/* Illustrated avatar that turns its head and eyes toward a pose value.
   Original artwork drawn in code (SVG), no image or video files needed.
   Colours come from CONFIG.AVATAR in js/config.js.

   Avatar.create(options) returns { el, set(p, gaze), startBlinking(), stopBlinking() }
     p    = 0 (turned to the viewer's left) ... 0.5 (straight ahead) ... 1 (turned to the right)
     gaze = -1 (eyes up) ... 0 ... 1 (eyes down)
   A head is faked in 2D: the face, nose, eyes and hair slide by different amounts
   (parallax), the far ear tucks away and one side of the face gets darker. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  // Mix a #rrggbb colour toward black (amt < 0) or white (amt > 0).
  function tone(hex, amt) {
    var n = parseInt(hex.slice(1), 16), out = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (c) {
      var target = amt < 0 ? 0 : 255;
      return Math.round(c + (target - c) * Math.abs(amt));
    });
    return '#' + out.map(function (c) { return ('0' + c.toString(16)).slice(-2); }).join('');
  }
  function hexOr(v, fallback) { return /^#[0-9a-f]{6}$/i.test(v || '') ? v : fallback; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function create(opts) {
    opts = opts || {};
    var skin = hexOr(opts.skin, '#D9A27A'), hair = hexOr(opts.hair, '#1F1612'), eyeCol = hexOr(opts.eyes, '#4A2E1F');
    var blazer = hexOr(opts.blazer, '#25406B'), tie = hexOr(opts.tie, '#C9A24B');
    var skinDark = tone(skin, -0.22), skinLight = tone(skin, 0.18), hairLight = tone(hair, 0.28);
    var headPath = 'M148 225C148 150 190 127 240 127C290 127 332 150 332 225C332 290 292 343 240 343C188 343 148 290 148 225Z';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '40 64 400 467'); // a little crop: head and shoulders fill the frame
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML =
      '<defs>' +
        '<radialGradient id="av-glow" cx="50%" cy="38%" r="60%"><stop offset="0" stop-color="#25406B" stop-opacity=".85"/><stop offset="1" stop-color="#12294A" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="av-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skinLight + '"/><stop offset=".55" stop-color="' + skin + '"/><stop offset="1" stop-color="' + tone(skin, -0.08) + '"/></linearGradient>' +
        '<linearGradient id="av-shade-r" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="' + skinDark + '" stop-opacity="0"/><stop offset="1" stop-color="' + tone(skin, -0.45) + '" stop-opacity=".85"/></linearGradient>' +
        '<linearGradient id="av-shade-l" x1="1" y1="0" x2="0" y2="0"><stop offset=".45" stop-color="' + skinDark + '" stop-opacity="0"/><stop offset="1" stop-color="' + tone(skin, -0.45) + '" stop-opacity=".85"/></linearGradient>' +
        '<clipPath id="av-headclip"><path d="' + headPath + '"/></clipPath>' +
        '<clipPath id="av-eye"><ellipse cx="0" cy="0" rx="17" ry="13"/></clipPath>' +
      '</defs>' +
      '<rect width="480" height="560" fill="#12294A"/><rect width="480" height="560" fill="url(#av-glow)"/>' +

      // body: blazer, white shirt, gold tie
      '<g id="av-body">' +
        '<path d="M52 560C58 452 128 398 200 388H280C352 398 422 452 428 560Z" fill="' + blazer + '"/>' +
        '<path d="M200 388L166 468L204 528M280 388L314 468L276 528" fill="none" stroke="' + tone(blazer, -0.25) + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M204 384L240 470L276 384Z" fill="#EEF2F8"/>' +
        '<path d="M200 380L238 428L220 462L184 408Z M280 380L242 428L260 462L296 408Z" fill="#FFFFFF" stroke="#C9D2E2" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M229 424H251L247 440H233Z" fill="' + tie + '"/><path d="M233 440H247L256 514L240 530L224 514Z" fill="' + tone(tie, -0.12) + '"/>' +
      '</g>' +

      // neck, with a soft shadow under the chin
      '<g id="av-neck">' +
        '<path d="M210 310H270V398C270 410 210 410 210 398Z" fill="' + skinDark + '"/>' +
        '<ellipse cx="240" cy="342" rx="27" ry="18" fill="' + tone(skin, -0.45) + '" opacity=".5"/>' +
      '</g>' +

      // head, turning as one piece
      '<g id="av-head">' +
        '<g id="av-ear-l"><ellipse cx="0" cy="0" rx="14" ry="22" fill="' + skinDark + '"/><ellipse cx="2" cy="1" rx="7" ry="13" fill="' + tone(skin, -0.38) + '" opacity=".6"/></g>' +
        '<g id="av-ear-r"><ellipse cx="0" cy="0" rx="14" ry="22" fill="' + skinDark + '"/><ellipse cx="-2" cy="1" rx="7" ry="13" fill="' + tone(skin, -0.38) + '" opacity=".6"/></g>' +
        '<path d="' + headPath + '" fill="url(#av-skin)"/>' +
        '<path id="av-shade-r-p" d="' + headPath + '" fill="url(#av-shade-r)" opacity="0"/>' +
        '<path id="av-shade-l-p" d="' + headPath + '" fill="url(#av-shade-l)" opacity="0"/>' +

        // face features: they slide further than the head, which is what makes it look turned
        '<g clip-path="url(#av-headclip)"><g id="av-face">' +
          '<ellipse cx="-58" cy="40" rx="17" ry="12" fill="#E5766A" opacity=".26"/><ellipse cx="58" cy="40" rx="17" ry="12" fill="#E5766A" opacity=".26"/>' +
          '<g id="av-brows" fill="none" stroke="' + hair + '" stroke-width="7" stroke-linecap="round">' +
            '<path id="av-brow-l" d="M-60 -36Q-40 -50 -18 -38"/><path id="av-brow-r" d="M18 -38Q40 -50 60 -36"/>' +
          '</g>' +
          eyeMarkup('l', -38) + eyeMarkup('r', 38) +
          '<g id="av-nose">' +
            '<ellipse id="av-nose-shade" cx="0" cy="18" rx="15" ry="14" fill="' + tone(skin, -0.35) + '" opacity=".16"/>' +
            '<path d="M-3 -18Q-9 6 -13 16" fill="none" stroke="' + tone(skin, -0.35) + '" stroke-width="4" stroke-linecap="round" opacity=".22"/>' +
            '<ellipse cx="0" cy="16" rx="13" ry="11" fill="' + skinLight + '" opacity=".75"/>' +
            '<ellipse cx="-7" cy="23" rx="3.4" ry="2.4" fill="' + tone(skin, -0.55) + '" opacity=".6"/><ellipse cx="7" cy="23" rx="3.4" ry="2.4" fill="' + tone(skin, -0.55) + '" opacity=".6"/>' +
          '</g>' +
          '<g id="av-mouth" transform="translate(0 62)">' +
            '<path d="M-27 -2Q0 22 27 -2" fill="none" stroke="#7A3B2E" stroke-width="4.5" stroke-linecap="round"/>' +
            '<path d="M-31 -6Q-33 -2 -29 1M31 -6Q33 -2 29 1" fill="none" stroke="' + tone(skin, -0.3) + '" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
          '</g>' +
          (opts.glasses ? glassesMarkup() : '') +
        '</g></g>' +

        // hair sits on top and slides a little more than the head
        '<g id="av-hair">' +
          '<path d="M142 222C132 138 186 92 248 96C312 100 350 140 338 222C330 182 314 160 292 150C262 164 214 160 188 148C164 160 148 186 142 222Z" fill="' + hair + '"/>' +
          '<path d="M176 128C200 108 236 104 262 110" fill="none" stroke="' + hairLight + '" stroke-width="6" stroke-linecap="round" opacity=".55"/>' +
        '</g>' +
      '</g>';

    function eyeMarkup(side, x) {
      return '<g id="av-eye-' + side + '" transform="translate(' + x + ' -6)">' +
        '<ellipse rx="17" ry="13" fill="#F7F4EF"/>' +
        '<g clip-path="url(#av-eye)"><g id="av-iris-' + side + '">' +
          '<circle r="9.5" fill="' + eyeCol + '"/><circle r="5.2" fill="#120A06"/><circle cx="-3.2" cy="-3.2" r="2.4" fill="#FFFFFF"/>' +
        '</g></g>' +
        '<ellipse id="av-lid-' + side + '" rx="18" ry="14.5" cy="0" fill="' + skin + '" style="transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);transition:transform .09s ease"/>' +
        '<path d="M-17 -1Q0 -19 17 -1" fill="none" stroke="' + tone(hair, 0.05) + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '</g>';
    }
    function glassesMarkup() {
      return '<g fill="none" stroke="#1A1A1F" stroke-width="4" stroke-linecap="round">' +
        '<circle cx="-38" cy="-6" r="25"/><circle cx="38" cy="-6" r="25"/><path d="M-13 -8Q0 -16 13 -8M-63 -8L-84 -14M63 -8L84 -14"/></g>';
    }

    var q = function (id) { return svg.querySelector('#' + id); };
    var el = {
      body: q('av-body'), neck: q('av-neck'), head: q('av-head'), hair: q('av-hair'), face: q('av-face'),
      earL: q('av-ear-l'), earR: q('av-ear-r'), brows: q('av-brows'), nose: q('av-nose'), noseShade: q('av-nose-shade'), mouth: q('av-mouth'),
      eyeL: q('av-eye-l'), eyeR: q('av-eye-r'), irisL: q('av-iris-l'), irisR: q('av-iris-r'),
      lidL: q('av-lid-l'), lidR: q('av-lid-r'), shadeR: q('av-shade-r-p'), shadeL: q('av-shade-l-p')
    };

    // Draw one pose.
    function set(p, gaze) {
      var t = clamp((p - 0.5) * 2, -1, 1), g = clamp(gaze || 0, -1, 1), a = Math.abs(t);
      el.body.setAttribute('transform', 'translate(' + (-t * 9).toFixed(2) + ' 0)');
      el.neck.setAttribute('transform', 'translate(' + (t * 4).toFixed(2) + ' 0)');
      el.head.setAttribute('transform', 'translate(' + (t * 10).toFixed(2) + ' ' + (g * 3).toFixed(2) + ') rotate(' + (t * 6).toFixed(2) + ' 240 330)');
      el.hair.setAttribute('transform', 'translate(' + (t * 9).toFixed(2) + ' ' + (g * -2).toFixed(2) + ')');

      // ears: the one on the side the head turns toward tucks behind the face
      var sL = t < 0 ? 1 + 0.85 * t : 1 + 0.08 * t, sR = t > 0 ? 1 - 0.85 * t : 1 - 0.08 * t;
      el.earL.setAttribute('transform', 'translate(' + (146 + (t > 0 ? t * 6 : 0)).toFixed(2) + ' 240) scale(' + Math.max(sL, 0.12).toFixed(3) + ' 1)');
      el.earR.setAttribute('transform', 'translate(' + (334 + (t < 0 ? t * 6 : 0)).toFixed(2) + ' 240) scale(' + Math.max(sR, 0.12).toFixed(3) + ' 1)');

      // features slide toward the turn and squash a little
      el.face.setAttribute('transform', 'translate(' + (240 + t * 28).toFixed(2) + ' ' + (238 + g * 3).toFixed(2) + ') scale(' + (1 - 0.1 * a).toFixed(3) + ' 1)');
      el.brows.setAttribute('transform', 'translate(0 ' + (g * -2).toFixed(2) + ')');
      el.nose.setAttribute('transform', 'translate(' + (t * 12).toFixed(2) + ' 0)');
      el.noseShade.setAttribute('transform', 'translate(' + (-t * 9).toFixed(2) + ' 0)');
      el.mouth.setAttribute('transform', 'translate(' + (t * 5).toFixed(2) + ' 62)');

      // the far eye is foreshortened, the near eye opens up
      var sxL = t > 0 ? 1 + 0.12 * t : 1 + 0.3 * t, sxR = t > 0 ? 1 - 0.3 * t : 1 - 0.12 * t;
      el.eyeL.setAttribute('transform', 'translate(-38 -6) scale(' + sxL.toFixed(3) + ' 1)');
      el.eyeR.setAttribute('transform', 'translate(38 -6) scale(' + sxR.toFixed(3) + ' 1)');

      // the eyes lead the head: they look at the cursor
      var px = clamp(t * 8, -6.5, 6.5).toFixed(2), py = (g * 5).toFixed(2);
      el.irisL.setAttribute('transform', 'translate(' + px + ' ' + py + ')');
      el.irisR.setAttribute('transform', 'translate(' + px + ' ' + py + ')');

      // the far side of the face is a little darker
      el.shadeR.setAttribute('opacity', (Math.max(0, t) * 0.55).toFixed(3));
      el.shadeL.setAttribute('opacity', (Math.max(0, -t) * 0.55).toFixed(3));
    }

    // Blinking: a quick close and open every few seconds. Paused while the tab is hidden.
    var timer = 0;
    function blinkOnce() {
      el.lidL.style.transform = el.lidR.style.transform = 'scaleY(1)';
      setTimeout(function () { el.lidL.style.transform = el.lidR.style.transform = 'scaleY(0)'; }, 120);
    }
    function schedule() {
      timer = setTimeout(function () { if (!document.hidden) blinkOnce(); schedule(); }, 2600 + Math.random() * 3000);
    }
    function startBlinking() { if (!timer) schedule(); }
    function stopBlinking() { clearTimeout(timer); timer = 0; }

    set(0.5, 0);
    return { el: svg, set: set, startBlinking: startBlinking, stopBlinking: stopBlinking };
  }

  window.Avatar = { create: create };
})();
