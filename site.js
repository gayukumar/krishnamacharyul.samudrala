(function () {
  // ---------- mobile menu ----------
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.nodeValue = open ? 'Close ' : 'Menu ';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.firstChild.nodeValue = 'Menu '; btn.focus(); }
    });
  }

  // ---------- decades of service, counted from 1983 ----------
  var decades = Math.floor((new Date().getFullYear() - 1983) / 10);
  var words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  if (decades >= 4 && decades < words.length) {
    document.querySelectorAll('.dec-word').forEach(function (el) { el.textContent = words[decades]; });
    document.querySelectorAll('.dec-num').forEach(function (el) { el.textContent = decades; });
  }

  // ---------- kolam behind the home hero ----------
  var cv = document.getElementById('kolam');
  if (cv) {
    var draw = function () {
      var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
      var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, r.width, r.height);
      var s = 46, color = getComputedStyle(document.documentElement).getPropertyValue('--hero-ink').trim() || '#4A1410';
      c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 1.6;
      for (var y = s / 2; y < r.height + s; y += s) {
        for (var x = s / 2; x < r.width + s; x += s) {
          var i = Math.round(x / s), j = Math.round(y / s);
          c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill();
          c.beginPath();
          if ((i + j) % 2 === 0) {
            c.moveTo(x, y - s * 0.42); c.quadraticCurveTo(x + s * 0.42, y - s * 0.42, x + s * 0.42, y);
            c.quadraticCurveTo(x + s * 0.42, y + s * 0.42, x, y + s * 0.42);
            c.quadraticCurveTo(x - s * 0.42, y + s * 0.42, x - s * 0.42, y);
            c.quadraticCurveTo(x - s * 0.42, y - s * 0.42, x, y - s * 0.42);
          } else {
            c.arc(x, y, s * 0.2, 0, Math.PI * 2);
          }
          c.stroke();
        }
      }
    };
    draw();
    window.addEventListener('resize', draw);
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw); } catch (e) {}
  }

  // ---------- copy buttons ----------
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('data-copy')), text = el.textContent.trim(), label = b.textContent;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = label; }, 1600); };
      var fallback = function () { var rg = document.createRange(); rg.selectNodeContents(el); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); b.textContent = 'Selected: press Ctrl+C'; setTimeout(function () { b.textContent = label; }, 2200); };
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });

  // ---------- request form ----------
  var form = document.getElementById('req');
  if (!form) return;

  // Pre-select the ceremony or tradition when arriving from a link such as contact.html?c=Goda%20Kalyanam
  try {
    var q = new URLSearchParams(location.search);
    var pick = function (id, val) {
      if (!val) return;
      var sel = document.getElementById(id);
      for (var k = 0; k < sel.options.length; k++) { if (sel.options[k].text === val) { sel.selectedIndex = k; return true; } }
    };
    if (pick('f-cer', q.get('c'))) document.getElementById('f-name').focus({ preventScroll: true });
    pick('f-comm', q.get('t'));
  } catch (e) {}

  // Web3Forms emails each request to the address the access key was created for.
  // Get a free key at https://web3forms.com (enter krishna@priestkrishnam.org) and paste it below.
  var WEB3FORMS_KEY = 'PASTE_YOUR_ACCESS_KEY_HERE';
  var MAIL_TO = 'krishna@priestkrishnam.org';
  var err = document.getElementById('f-err'), ok = document.getElementById('f-ok'), sendBtn = document.getElementById('f-send');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { return document.getElementById(id).value.trim(); };
    ok.hidden = true;
    if (v('f-honey')) return;
    var missing = [];
    if (!v('f-name')) missing.push('your name');
    if (!v('f-phone')) missing.push('a phone number');
    if (!v('f-cer')) missing.push('the ceremony');
    if (missing.length) { err.textContent = 'Add ' + missing.join(', ') + ' to send the request.'; err.hidden = false; return; }
    err.hidden = true;
    var d = v('f-date');
    var dateText = d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Flexible';
    var subject = 'Ceremony request: ' + v('f-cer') + ' - ' + v('f-name');
    var fields = { 'Name': v('f-name'), 'Phone': v('f-phone'), 'Ceremony': v('f-cer'), 'Community / tradition': v('f-comm') || 'Not specified', 'Preferred date': dateText, 'Location': v('f-where') || 'To be decided', 'Notes': v('f-notes') || '-' };

    // No key yet: open the visitor's email app so the button still works.
    if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf('PASTE_') === 0) {
      var body = Object.keys(fields).map(function (k) { return k + ': ' + fields[k]; }).join('\n');
      window.location.href = 'mailto:' + MAIL_TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Namaste,\n\n' + body + '\n\nThank you.');
      return;
    }

    var payload = Object.assign({ access_key: WEB3FORMS_KEY, subject: subject, from_name: 'Website request - ' + v('f-name'), botcheck: '' }, fields);
    var label = sendBtn.textContent;
    sendBtn.disabled = true; sendBtn.textContent = 'Sending...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.success) throw new Error(j.message || 'Send failed'); }); })
      .then(function () { form.reset(); ok.textContent = 'Request sent. You will get a call or email back to confirm the details.'; ok.hidden = false; })
      .catch(function (x) { console.error('Form send failed:', x); err.textContent = 'The request did not send (' + ((x && x.message) || 'network error') + '). Call +1 (818) 618-2082 or email ' + MAIL_TO + ' instead.'; err.hidden = false; })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = label; });
  });
})();
