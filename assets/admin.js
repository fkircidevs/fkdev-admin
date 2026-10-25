/*! fkdev Admin v1.0.0 · https://admin.fkdev.sbs · MIT · Furkan Kırcı */
(function () {
  var d = document, root = d.documentElement;

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var STR = '"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'';
  var RULES = {
    html: [['c', '<!--[\\s\\S]*?-->'], ['t', '</?[a-zA-Z][\\w-]*|/?>'], ['s', '"[^"]*"|\'[^\']*\''], ['a', '[a-zA-Z_:@][\\w:.-]*(?==)']],
    css: [['c', '/\\*[\\s\\S]*?\\*/'], ['s', STR], ['v', '--[\\w-]+'], ['a', '(?<=[{;\\s])[a-z-]+(?=\\s*:)'], ['t', '[.#][a-zA-Z][\\w-]*(?=[^;{}]*\\{)|@[a-z-]+'], ['n', '#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|rem|em|%|ms|s|vh|vw|vmax|deg|fr)?\\b']],
    js: [['c', '//[^\\n]*|/\\*[\\s\\S]*?\\*/'], ['s', '`[^`]*`|' + STR], ['k', '\\b(?:const|let|var|function|return|if|else|for|while|await|async|import|from|export|default|new|try|catch|throw|class|extends|of|in|true|false|null|undefined|this|typeof)\\b'], ['n', '\\b\\d+(?:\\.\\d+)?\\b']],
    php: [['c', '//[^\\n]*|/\\*[\\s\\S]*?\\*/|(?<![\\w\'"])#[^\\n]*'], ['s', STR], ['t', '<\\?php|\\?>'], ['v', '\\$[a-zA-Z_]\\w*'], ['k', '\\b(?:function|return|if|else|elseif|foreach|as|echo|new|use|require|require_once|include|try|catch|throw|class|public|private|static|fn|match|null|true|false|exit|isset|empty|declare|namespace)\\b'], ['n', '\\b\\d+\\b']],
    sql: [['c', '--[^\\n]*'], ['s', '\'(?:[^\'\\\\]|\\\\.)*\''], ['k', '\\b(?:CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|ON|DELETE|UPDATE|CASCADE|SET|NULL|DEFAULT|UNIQUE|INDEX|INSERT|INTO|VALUES|SELECT|FROM|WHERE|AND|OR|ORDER|BY|LIMIT|JOIN|LEFT|INNER|GROUP|AS|DESC|ASC|ENGINE|CHARSET|COLLATE|AUTO_INCREMENT|UNSIGNED|ENUM|CURRENT_TIMESTAMP|COUNT|BIGINT|INT|TINYINT|SMALLINT|VARCHAR|TEXT|MEDIUMTEXT|LONGTEXT|JSON|TIMESTAMP|DATETIME|BOOLEAN|DECIMAL|CHAR|CONSTRAINT|ALTER|ADD|COMMENT|RESTRICT|NOW|INTERVAL|DAY)\\b'], ['n', '\\b\\d+\\b']],
    bash: [['c', '(?<![\\w$])#[^\\n]*'], ['s', '"[^"]*"|\'[^\']*\''], ['k', '\\b(?:npm|npx|node|composer|php|curl|git|vercel|cd|mkdir|export)\\b'], ['v', '\\$[A-Z_]+']],
    apache: [['c', '^\\s*#[^\\n]*'], ['s', '"[^"]*"'], ['k', '^\\s*</?[A-Za-z]+|^\\s*[A-Z][A-Za-z]+']],
    json: [['a', '"(?:[^"\\\\]|\\\\.)*"(?=\\s*:)'], ['s', '"(?:[^"\\\\]|\\\\.)*"'], ['k', '\\b(?:true|false|null)\\b'], ['n', '-?\\b\\d+(?:\\.\\d+)?\\b']]
  };
  RULES.ts = RULES.js;
  var COMPILED = {};
  function highlight(code) {
    var lang = (code.className.match(/lang-(\w+)/) || [])[1];
    var rules = RULES[lang];
    var src = code.textContent;
    if (!rules) { code.innerHTML = esc(src); return; }
    var re = COMPILED[lang] || (COMPILED[lang] = new RegExp(rules.map(function (r) { return '(' + r[1] + ')'; }).join('|'), 'gm'));
    re.lastIndex = 0;
    var out = '', last = 0, m;
    while ((m = re.exec(src))) {
      if (!m[0].length) { re.lastIndex++; continue; }
      var gi = 1;
      while (gi < m.length && m[gi] === undefined) gi++;
      out += esc(src.slice(last, m.index)) + '<span class="tok-' + rules[gi - 1][0] + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    code.innerHTML = out + esc(src.slice(last));
  }
  d.querySelectorAll('pre code').forEach(highlight);

  d.querySelectorAll('.copy-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.closest('.codeblock').querySelector('pre code');
      FK.copy(code.textContent).then(function () {
        var old = b.innerHTML;
        b.classList.add('is-done');
        b.textContent = 'Kopyalandı';
        setTimeout(function () { b.classList.remove('is-done'); b.innerHTML = old; }, 1600);
      });
    });
  });

  d.querySelectorAll('[data-icon-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var html = '<i class="fk-i fk-i-' + b.getAttribute('data-icon-copy') + '" aria-hidden="true"></i>';
      FK.copy(html).then(function () { FK.toast('Kopyalandı: fk-i-' + b.getAttribute('data-icon-copy'), 'success', 2400); });
    });
  });

  d.querySelectorAll('[data-strength]').forEach(function (input) {
    var meter = d.getElementById(input.getAttribute('data-strength'));
    if (!meter) return;
    var text = meter.nextElementSibling;
    var LABELS = ['En az 8 karakter yaz', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
    input.addEventListener('input', function () {
      var v = input.value, s = 0;
      if (v.length >= 8) s++;
      if (/[A-ZÇĞİÖŞÜ]/.test(v) && /[a-zçğıöşü]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^\w\sçğıöşüÇĞİÖŞÜ]/.test(v) || v.length >= 14) s++;
      if (v.length < 8) s = Math.min(s, 1);
      meter.setAttribute('data-level', v ? String(Math.max(1, s)) : '0');
      if (text) text.textContent = v ? LABELS[Math.max(1, s)] : LABELS[0];
    });
  });

  var match = d.querySelector('[data-match]');
  if (match) {
    var first = d.getElementById(match.getAttribute('data-match'));
    var check = function () { match.setCustomValidity(match.value && first && match.value !== first.value ? 'Şifreler aynı değil.' : ''); };
    match.addEventListener('input', check);
    if (first) first.addEventListener('input', check);
  }

  var table = d.getElementById('siparisler');
  if (table && window.DataTable) {
    var dt = new DataTable(table, {
      pageLength: 10,
      lengthMenu: [10, 25, 50],
      order: [[2, 'desc']],
      columnDefs: [{ orderable: false, searchable: false, targets: -1 }],
      language: {
        decimal: ',', thousands: '.',
        emptyTable: 'Henüz sipariş yok',
        info: '_TOTAL_ siparişten _START_–_END_ arası',
        infoEmpty: 'Gösterilecek sipariş yok',
        infoFiltered: '(toplam _MAX_ sipariş içinde)',
        lengthMenu: 'Sayfada _MENU_ kayıt',
        loadingRecords: 'Yükleniyor…',
        processing: 'İşleniyor…',
        search: '',
        searchPlaceholder: 'Sipariş no, müşteri, şehir…',
        zeroRecords: 'Aramana uyan sipariş bulunamadı',
        paginate: { first: '«', last: '»', next: '›', previous: '‹' },
        aria: { orderable: 'Sırala', orderableReverse: 'Ters sırala' }
      }
    });
    d.querySelectorAll('input[name="durum"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var v = r.value;
        dt.column(5).search(v ? '^' + v + '$' : '', true, false).draw();
      });
    });
    table.addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (!b) return;
      FK.toast(b.getAttribute('data-view') + ' numaralı sipariş açılıyor (demo)', 'info', 2600);
    });
  }

  d.querySelectorAll('[data-demo-logout]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      FK.confirm({ title: 'Çıkış yapılsın mı?', text: 'Oturumun bu cihazda kapatılacak.', ok: 'Çıkış yap', cancel: 'Vazgeç' }).then(function (ok) {
        if (ok) location.href = a.getAttribute('href');
      });
    });
  });

  d.querySelectorAll('[data-demo-revoke]').forEach(function (b) {
    b.addEventListener('click', function () {
      FK.confirm({ title: 'Oturum kapatılsın mı?', text: b.getAttribute('data-demo-revoke') + ' cihazındaki oturum sonlandırılacak.', ok: 'Oturumu kapat', danger: true }).then(function (ok) {
        if (!ok) return;
        var row = b.closest('.ad-session');
        if (row) row.remove();
        countSessions();
        FK.toast('Oturum kapatıldı', 'success');
      });
    });
  });

  /* ---------- Mobil tablolar: hücrelere sütun adı, ilk hücre başlık, boş başlıklı sütun işlem ---------- */
  function cardify(table) {
    var heads = Array.prototype.map.call(table.querySelectorAll('thead th'), function (th) {
      return th.querySelector('.fk-sr') ? '' : th.textContent.trim();
    });
    Array.prototype.forEach.call(table.tBodies[0].rows, function (tr) {
      Array.prototype.forEach.call(tr.cells, function (td, i) {
        // Karışık içerik (metin + kod, rozetler) kartta tek parça kalsın
        if (td.childNodes.length > 1 && !td.querySelector(':scope > .ad-cell-v')) {
          var v = d.createElement('span');
          v.className = 'ad-cell-v';
          while (td.firstChild) v.appendChild(td.firstChild);
          td.appendChild(v);
        }
        if (i === 0) { td.classList.add('ad-cell-title'); return; }
        if (!heads[i]) { td.classList.add('ad-cell-act'); return; }
        td.setAttribute('data-label', heads[i]);
      });
    });
  }
  // Tablo kabına sığmıyorsa kart olur; sığıyorsa tablo kalır. Kaydırma çubuğu hiç çıkmaz.
  function fit(table) {
    var wrap = table.parentElement, w = wrap.clientWidth;
    if (!w || w === table._adW) return;
    table._adW = w;
    table.classList.remove('is-cards');
    table.classList.toggle('is-cards', table.scrollWidth > wrap.clientWidth + 1);
  }
  var fitObs = window.ResizeObserver ? new ResizeObserver(function (en) {
    en.forEach(function (e) { var t = e.target.querySelector(':scope > table.ad-cards'); if (t) fit(t); });
  }) : null;
  d.querySelectorAll('.ad-main table.fk-table').forEach(function (table) {
    if (table.id === 'siparisler' || !table.tHead || !table.tBodies[0] || !table.parentElement.classList.contains('fk-table-wrap')) return;
    table.classList.add('ad-cards');
    cardify(table);
    fit(table);
    if (fitObs) fitObs.observe(table.parentElement);
    new MutationObserver(function () { cardify(table); table._adW = 0; fit(table); }).observe(table.tBodies[0], { childList: true });
  });
  // Kayan şeritler: taşıyorsa is-scroll, uçtaysa at-start / at-end
  function edges(el) {
    var over = el.scrollWidth > el.clientWidth + 1;
    el.classList.toggle('is-scroll', over);
    el.classList.toggle('at-start', over && el.scrollLeft <= 1);
    el.classList.toggle('at-end', over && el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }
  var strips = d.querySelectorAll('.fk-segment, .ad-settings > .fk-tabsbar, .ad-board');
  strips.forEach(function (el) { el.addEventListener('scroll', function () { edges(el); }, { passive: true }); });
  function fitAll() {
    d.querySelectorAll('table.ad-cards').forEach(fit);
    strips.forEach(edges);
  }
  window.addEventListener('resize', fitAll);
  d.addEventListener('fk:tab', fitAll);
  // Fontlar gelince genişlikler değişir: sekme göstergesi ve ölçümler yeniden hizalanır
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { window.dispatchEvent(new Event('resize')); });
  fitAll();

  // Kayan ayar sekmelerinde seçili sekme her zaman görünür
  d.querySelectorAll('.ad-settings[data-fk-tabs]').forEach(function (wrap) {
    var bar = wrap.querySelector('.fk-tabsbar');
    wrap.addEventListener('fk:tab', function (e) {
      var t = e.detail.tab;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
    });
  });

  /* ---------- Toast'lar: aynı anda en fazla 3, dördüncü gelince en eskisi kapanır ---------- */
  var MAX_TOAST = 3;
  function trimToasts(box) {
    var live = box.querySelectorAll('.fk-toast:not(.is-out)');
    for (var i = 0; i < live.length - MAX_TOAST; i++) {
      var x = live[i].querySelector('.fk-toast-x');
      if (x) x.click(); else live[i].remove();
    }
  }
  function watchToasts(box) {
    if (box._ad) return;
    box._ad = 1;
    new MutationObserver(function () { trimToasts(box); }).observe(box, { childList: true });
    trimToasts(box);
  }
  var toastBox = d.querySelector('.fk-toasts');
  if (toastBox) watchToasts(toastBox);
  else new MutationObserver(function (muts, obs) {
    var box = d.querySelector('body > .fk-toasts');
    if (box) { obs.disconnect(); watchToasts(box); }
  }).observe(d.body, { childList: true });

  /* ---------- Hesap verisi: demo, bu tarayıcıda (localStorage) ---------- */
  var KEY = 'fk-admin';
  var state = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { FK.toast('Tarayıcı depolaması dolu ya da kapalı; değişiklik kaydedilemedi.', 'danger'); } }
  function $(id) { return d.getElementById(id); }
  function rnd(n, abc) {
    abc = abc || 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var a = new Uint32Array(n), s = '';
    crypto.getRandomValues(a);
    for (var i = 0; i < n; i++) s += abc.charAt(a[i] % abc.length);
    return s;
  }
  function download(name, text, type) {
    var a = d.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain;charset=utf-8' }));
    a.download = name;
    d.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function busy(btn, ms, fn) {
    if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
    setTimeout(function () { if (btn) { btn.classList.remove('is-loading'); btn.disabled = false; } fn(); }, ms);
  }
  function initials(n) { return n.trim().split(/\s+/).map(function (p) { return p.charAt(0); }).slice(0, 2).join('').toLocaleUpperCase('tr'); }

  function readGroup(scope) {
    var o = {};
    scope.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (el.type === 'file' || el.type === 'password' || el.disabled || el.hasAttribute('data-ad-skip')) return;
      if (el.type === 'radio') { if (el.checked) o['r:' + el.name] = el.value; return; }
      if (el.id) o[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return o;
  }
  function writeGroup(scope, o) {
    if (!o) return;
    scope.querySelectorAll('input, select, textarea').forEach(function (el) {
      var k = el.type === 'radio' ? 'r:' + el.name : el.id;
      if (!k || !(k in o) || el.hasAttribute('data-ad-skip')) return;
      if (el.type === 'radio') el.checked = el.value === o[k];
      else if (el.type === 'checkbox') el.checked = !!o[k];
      else { el.value = o[k]; el.dispatchEvent(new Event('input', { bubbles: true })); }
    });
  }

  // Kendi bilgilerin: navbar avatarı, profil sayfası, ekip satırı
  function renderMe() {
    var p = state.profil || {};
    d.querySelectorAll('.ad-tool-avatar .fk-avatar, [data-ad-me-avatar]').forEach(function (a) {
      if (p['p-ad']) a.textContent = initials(p['p-ad']);
      a.classList.toggle('has-img', !!state.avatar);
      a.style.backgroundImage = state.avatar ? 'url("' + state.avatar + '")' : '';
    });
    d.querySelectorAll('[data-ad-me]').forEach(function (el) {
      var v = p[el.getAttribute('data-ad-me')];
      if (v === undefined) return;
      var item = el.closest('.ad-chips li');
      if (item) item.hidden = !v;
      if (el.hasAttribute('data-ad-first')) v = v.trim().split(/\s+/)[0] + '.';
      el.textContent = v;
      if (el.hasAttribute('data-ad-href')) el.href = el.getAttribute('data-ad-href') + v;
    });
    var t = state.tercih || {}, g = state.guvenlik || {};
    if (t['t-saat']) d.querySelectorAll('[data-ad-tz]').forEach(function (el) { el.textContent = t['t-saat']; });
    if (state.plan) d.querySelectorAll('[data-ad-plan]').forEach(function (el) { el.textContent = state.plan.ad; });
    if ('g-totp' in g) d.querySelectorAll('[data-ad-2fa]').forEach(function (el) { el.innerHTML = g['g-totp'] ? '<span class="fk-badge fk-badge-success">Açık</span>' : '<span class="fk-badge fk-badge-warning">Kapalı</span>'; });
  }

  // Kaydedilen formlar: geçerliyse saklar, formu sıfırlamaz
  d.querySelectorAll('form[data-ad-save]').forEach(function (form) {
    var g = form.getAttribute('data-ad-save');
    writeGroup(form, state[g]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) return;
      busy(form.querySelector('[type="submit"]'), 700, function () {
        state[g] = readGroup(form);
        persist();
        renderMe();
        FK.toast(form.getAttribute('data-ad-msg') || 'Kaydedildi', 'success');
      });
    });
  });

  // Anında kaydedilen gruplar: anahtarlar, seçimler
  d.querySelectorAll('[data-ad-persist]').forEach(function (box) {
    var g = box.getAttribute('data-ad-persist'), t;
    writeGroup(box, state[g]);
    box.addEventListener('change', function (e) {
      if (e.target.hasAttribute('data-ad-skip')) return;
      state[g] = readGroup(box);
      persist();
      renderMe();
      clearTimeout(t);
      t = setTimeout(function () { FK.toast(box.getAttribute('data-ad-msg') || 'Kaydedildi', 'success', 2200); }, 300);
    });
  });

  // Sekmeyi adresle eşle: /ayarlar/#guvenlik doğrudan o sekmeyi açar
  d.querySelectorAll('[data-fk-tabs][data-ad-hash]').forEach(function (wrap) {
    function tabFor(id) { return /^[\w-]+$/.test(id) ? wrap.querySelector('[role="tab"][aria-controls="' + id + '"]') : null; }
    function open(id) {
      var tab = tabFor(id);
      if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();
    }
    // fkdev UI ilk sekmeyi bir sonraki karede seçer; adresteki sekme istenmişse o seçimi bir kez geri çeviririz
    var want = tabFor(location.hash.slice(1)) ? location.hash.slice(1) : null;
    open(want);
    window.addEventListener('hashchange', function () { open(location.hash.slice(1)); });
    wrap.addEventListener('fk:tab', function (e) {
      var id = e.detail.tab.getAttribute('aria-controls');
      if (want && id !== want) { var w2 = want; want = null; setTimeout(function () { open(w2); }, 0); return; }
      if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
    });
  });

  // Profil fotoğrafı: 256×256 kırpılıp JPEG olarak saklanır
  var foto = d.querySelector('[data-ad-avatar]');
  if (foto) foto.addEventListener('change', function () {
    var f = foto.files && foto.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg)$/.test(f.type)) { foto.value = ''; FK.toast('Yalnızca PNG ya da JPG yükleyebilirsin.', 'danger'); return; }
    if (f.size > 2 * 1048576) { foto.value = ''; FK.toast('Dosya 2 MB sınırını aşıyor.', 'danger'); return; }
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = 256, c = d.createElement('canvas'), k = Math.max(s / img.width, s / img.height);
        c.width = c.height = s;
        c.getContext('2d').drawImage(img, (s - img.width * k) / 2, (s - img.height * k) / 2, img.width * k, img.height * k);
        state.avatar = c.toDataURL('image/jpeg', 0.86);
        persist();
        renderMe();
        strength();
        FK.toast('Fotoğraf güncellendi', 'success');
      };
      img.onerror = function () { FK.toast('Görsel okunamadı.', 'danger'); };
      img.src = r.result;
    };
    r.readAsDataURL(f);
  });
  d.querySelectorAll('[data-ad-avatar-remove]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!state.avatar) { FK.toast('Yüklü bir fotoğraf yok.', 'info', 2400); return; }
      delete state.avatar;
      persist();
      renderMe();
      strength();
      var out = d.querySelector('.fk-drop-file');
      if (out) out.textContent = '';
      if (foto) foto.value = '';
      FK.toast('Fotoğraf kaldırıldı', 'success');
    });
  });

  // Profil gücü
  var pForm = $('f-profil');
  var NEED = [['p-ad', 'ad'], ['p-kullanici', 'kullanıcı adı'], ['p-mail', 'e-posta'], ['p-tel', 'telefon'], ['p-unvan', 'unvan'], ['p-konum', 'konum'], ['p-site', 'web sitesi'], ['p-bio', 'biyografi']];
  function strength() {
    if (!pForm) return;
    var miss = NEED.filter(function (n) { var el = $(n[0]); return !el || !el.value.trim(); }).map(function (n) { return n[1]; });
    if (!state.avatar) miss.push('fotoğraf');
    var pct = Math.round((NEED.length + 1 - miss.length) / (NEED.length + 1) * 100);
    var bar = $('profil-bar');
    bar.style.setProperty('--v', pct / 100);
    bar.setAttribute('aria-valuenow', pct);
    $('profil-yuzde').textContent = '%' + pct + ' tamam';
    $('profil-eksik').textContent = miss.length ? 'Eksik: ' + miss.join(', ') + '.' : 'Profilin eksiksiz. Harika görünüyor.';
  }
  if (pForm) { pForm.addEventListener('input', strength); strength(); }

  // Tema seçimi navbar'daki düğmeyle senkron
  var tema = d.querySelectorAll('input[name="tema"]');
  if (tema.length) {
    var syncTema = function () {
      var t = null;
      try { t = localStorage.getItem('fk-theme'); } catch (e) {}
      var v = t === 'dark' ? 'koyu' : t === 'light' ? 'acik' : 'sistem';
      tema.forEach(function (r) { r.checked = r.value === v; });
    };
    syncTema();
    root.addEventListener('fk:theme', syncTema);
    tema.forEach(function (r) {
      r.addEventListener('change', function () {
        if (r.value === 'koyu') FK.setTheme('dark');
        else if (r.value === 'acik') FK.setTheme('light');
        else { root.removeAttribute('data-theme'); try { localStorage.removeItem('fk-theme'); } catch (e) {} }
        FK.toast('Tema güncellendi', 'success', 2000);
      });
    });
  }

  // Bölge önizlemesi
  var onizle = $('t-onizleme');
  if (onizle) {
    var bolge = function () {
      var tz = $('t-saat').value, lang = $('t-dil').value, f = $('t-tarih').value, now = new Date();
      try {
        var date = f === 'iso'
          ? new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
          : new Intl.DateTimeFormat(lang, f === 'uzun' ? { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' } : { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
        var time = new Intl.DateTimeFormat(lang, { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
        var money = new Intl.NumberFormat(lang, { style: 'currency', currency: $('t-para').value }).format(1234.5);
        onizle.textContent = 'Önizleme: ' + date + ' · ' + time + ' · ' + money;
      } catch (e) { onizle.textContent = ''; }
    };
    ['t-saat', 't-dil', 't-tarih', 't-para'].forEach(function (id) { $(id).addEventListener('change', bolge); });
    bolge();
  }

  // Oturumlar
  function countSessions() {
    var out = $('oturum-sayi');
    if (out) out.textContent = d.querySelectorAll('.ad-session').length + ' cihaz';
  }
  d.querySelectorAll('[data-ad-revoke-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var rows = d.querySelectorAll('.ad-session [data-demo-revoke]');
      if (!rows.length) { FK.toast('Başka açık oturum yok.', 'info', 2400); return; }
      FK.confirm({ title: 'Diğer oturumlar kapatılsın mı?', text: rows.length + ' cihazdaki oturum sonlandırılacak. Bu cihaz açık kalır.', ok: 'Hepsini kapat', danger: true }).then(function (ok) {
        if (!ok) return;
        rows.forEach(function (r) { r.closest('.ad-session').remove(); });
        countSessions();
        FK.toast('Diğer tüm oturumlar kapatıldı', 'success');
      });
    });
  });

  // Yedek kodlar: yalnızca bellekte, oluşturulduğu an gösterilir
  var kodBox = $('yedek-kodlar'), kodlar = [];
  if (kodBox) {
    var kodBtns = d.querySelectorAll('[data-ad-codes-copy], [data-ad-codes-dl]');
    d.querySelector('[data-ad-codes-gen]').addEventListener('click', function () {
      var go = function () {
        kodlar = [];
        for (var i = 0; i < 10; i++) kodlar.push(rnd(4) + '-' + rnd(4));
        kodBox.innerHTML = kodlar.map(function (k) { return '<li>' + k + '</li>'; }).join('');
        kodBox.hidden = false;
        kodBtns.forEach(function (x) { x.disabled = false; });
        FK.toast('10 yeni yedek kod oluşturuldu', 'success');
      };
      if (!kodlar.length) { go(); return; }
      FK.confirm({ title: 'Yeni kodlar oluşturulsun mu?', text: 'Eski kodların hepsi geçersiz olur.', ok: 'Yenile' }).then(function (ok) { if (ok) go(); });
    });
    d.querySelector('[data-ad-codes-copy]').addEventListener('click', function () {
      FK.copy(kodlar.join('\n')).then(function () { FK.toast('Kodlar kopyalandı', 'success', 2400); });
    });
    d.querySelector('[data-ad-codes-dl]').addEventListener('click', function () {
      download('fkdev-yedek-kodlar.txt', 'fkdev Admin · yedek kodlar\nOluşturma: ' + new Date().toLocaleString('tr-TR') + '\nHer kod bir kez kullanılır.\n\n' + kodlar.join('\n') + '\n');
    });
  }

  // Bildirim matrisi: sessiz saat alanları anahtara bağlı
  var sessiz = $('b-sessiz');
  if (sessiz) {
    var sessizSync = function () { ['b-bas', 'b-bit'].forEach(function (id) { $(id).disabled = !sessiz.checked; }); };
    sessiz.addEventListener('change', sessizSync);
    sessizSync();
  }

  // Faturalandırma: plan
  var planForm = $('f-plan');
  function fmtTL(n) { return n ? '₺' + n.toLocaleString('tr-TR') : 'Ücretsiz'; }
  function renderPlan() {
    var p = state.plan;
    if (!p || !$('plan-ad')) return;
    $('plan-ad').textContent = p.ad;
    $('plan-fiyat').textContent = fmtTL(p.fiyat);
    $('plan-donem').textContent = p.fiyat ? (p.donem === 'yil' ? '/ yıl · KDV dahil' : '/ ay · KDV dahil') : '· kart gerekmez';
    $('plan-durum').className = 'fk-badge ' + (p.iptal ? 'fk-badge-warning' : 'fk-badge-success');
    $('plan-durum').textContent = p.iptal ? 'Dönem sonunda bitecek' : 'Aktif';
  }
  if (planForm) {
    var fiyatlar = function () {
      var donem = planForm.querySelector('input[name="donem"]:checked').value;
      planForm.querySelectorAll('input[name="plan"]').forEach(function (r) {
        var n = parseInt(r.getAttribute('data-' + donem), 10);
        r.closest('label').querySelector('[data-fiyat]').textContent = n ? fmtTL(n) + (donem === 'yil' ? ' / yıl' : ' / ay') : 'Ücretsiz';
      });
    };
    if (state.plan) {
      planForm.querySelectorAll('input[name="plan"]').forEach(function (r) { r.checked = r.value === state.plan.ad; });
      planForm.querySelectorAll('input[name="donem"]').forEach(function (r) { r.checked = r.value === state.plan.donem; });
    }
    planForm.addEventListener('change', fiyatlar);
    fiyatlar();
    renderPlan();
    planForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = planForm.querySelector('input[name="plan"]:checked'), donem = planForm.querySelector('input[name="donem"]:checked').value;
      busy(planForm.querySelector('[type="submit"]'), 800, function () {
        state.plan = { ad: r.value, donem: donem, fiyat: parseInt(r.getAttribute('data-' + donem), 10) };
        persist();
        renderPlan();
        FK.close('#m-plan');
        FK.toast('Planın ' + r.value + ' olarak güncellendi (demo)', 'success');
      });
    });
  }
  d.querySelectorAll('[data-ad-cancel-sub]').forEach(function (b) {
    b.addEventListener('click', function () {
      FK.confirm({ title: 'Abonelik iptal edilsin mi?', text: 'Planın dönem sonuna kadar açık kalır, sonra Başlangıç planına geçersin. Verilerin silinmez.', ok: 'Aboneliği iptal et', danger: true }).then(function (ok) {
        if (!ok) return;
        state.plan = state.plan || { ad: 'Pro', donem: 'ay', fiyat: 499 };
        state.plan.iptal = true;
        persist();
        renderPlan();
        FK.toast('Aboneliğin 24 Kasım 2026\'da sona erecek (demo)', 'warning');
      });
    });
  });

  // Fatura tipi: kurumsal / bireysel
  var fForm = $('f-fatura');
  if (fForm) {
    var ftip = function () {
      var kurumsal = fForm.querySelector('input[name="ftip"]:checked').value === 'kurumsal', no = $('f-no');
      fForm.querySelectorAll('[data-ad-ftip="kurumsal"]').forEach(function (f) {
        f.hidden = !kurumsal;
        f.querySelectorAll('input').forEach(function (i) { i.disabled = !kurumsal; });
      });
      $('f-no-l').textContent = kurumsal ? 'Vergi no' : 'TC kimlik no';
      no.pattern = kurumsal ? '\\d{10}' : '\\d{11}';
      no.setAttribute('data-fk-msg', kurumsal ? 'Vergi numarası 10 hane olmalı.' : 'TC kimlik numarası 11 hane olmalı.');
    };
    fForm.querySelectorAll('input[name="ftip"]').forEach(function (r) { r.addEventListener('change', ftip); });
    ftip();
  }
  d.querySelectorAll('[data-ad-invoice]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-ad-invoice').split('|'), f = (state.fatura || {});
      download(p[0] + '.txt', 'fkdev · Fatura ' + p[0] + '\nTarih: ' + p[1] + '\nAlıcı: ' + (f['f-unvan'] || 'fkdev Yazılım') + '\nHizmet: fkdev Admin Pro abonelik\nTutar: ₺' + p[2] + ' (KDV dahil)\n\nBu dosya demo amaçlıdır; gerçek kurulumda e-Arşiv PDF\'i indirilir.\n');
    });
  });

  // API anahtarları
  var apiForm = $('f-api'), apiBody = $('api-anahtarlar');
  if (apiForm && apiBody) {
    var apiModal = $('m-api');
    var step = function (n) { apiModal.querySelectorAll('[data-ad-step]').forEach(function (el) { el.hidden = el.getAttribute('data-ad-step') !== String(n); }); };
    apiModal.addEventListener('close', function () { setTimeout(function () { step(1); apiForm.reset(); $('a-deger').value = ''; }, 200); });
    apiForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!apiForm.checkValidity()) return;
      var scopes = Array.prototype.map.call(apiForm.querySelectorAll('input[name="kapsam"]:checked'), function (c) { return c.value; });
      if (!scopes.length) { FK.toast('En az bir izin seç.', 'danger'); return; }
      var name = $('a-ad').value.trim(), key = 'fk_live_' + rnd(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
      busy(apiForm.querySelector('[type="submit"]'), 700, function () {
        var tr = d.createElement('tr');
        tr.innerHTML = '<td><strong></strong></td><td class="fk-mono">fk_live_••••' + key.slice(-4) + '</td><td>' + scopes.map(function (s) { return '<span class="fk-badge">' + s + '</span>'; }).join(' ') + '</td><td>' + new Date().toLocaleDateString('tr-TR') + '</td><td>Hiç</td><td><button class="fk-btn fk-btn-icon fk-btn-sm" type="button" aria-label="Anahtarı iptal et"><i class="fk-i fk-i-trash" aria-hidden="true"></i></button></td>';
        tr.querySelector('strong').textContent = name;
        tr.querySelector('button').setAttribute('data-ad-revoke-key', name);
        apiBody.insertBefore(tr, apiBody.firstChild);
        $('a-deger').value = key;
        step(2);
        FK.toast('Anahtar oluşturuldu', 'success');
      });
    });
    apiBody.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ad-revoke-key]');
      if (!b) return;
      var name = b.getAttribute('data-ad-revoke-key');
      FK.confirm({ title: '"' + name + '" iptal edilsin mi?', text: 'Bu anahtarı kullanan tüm entegrasyonlar hemen çalışmayı durdurur.', ok: 'Anahtarı iptal et', danger: true }).then(function (ok) {
        if (!ok) return;
        b.closest('tr').remove();
        FK.toast('Anahtar iptal edildi', 'success');
      });
    });
  }

  // Entegrasyonlar
  state.entegrasyon = state.entegrasyon || {};
  d.querySelectorAll('[data-ad-integ]').forEach(function (card) {
    var id = card.getAttribute('data-ad-integ'), name = card.querySelector('h3').textContent;
    var badge = card.querySelector('.fk-badge'), btn = card.querySelector('button');
    var on = id in state.entegrasyon ? state.entegrasyon[id] : card.hasAttribute('data-ad-on');
    function render() {
      badge.className = 'fk-badge' + (on ? ' fk-badge-success' : '');
      badge.textContent = on ? 'Bağlı' : 'Bağlı değil';
      btn.className = 'fk-btn fk-btn-sm ' + (on ? 'fk-btn-ghost' : 'fk-btn-primary');
      btn.textContent = on ? 'Bağlantıyı kes' : 'Bağla';
    }
    function set(v) { on = v; state.entegrasyon[id] = v; persist(); render(); }
    render();
    btn.addEventListener('click', function () {
      if (!on) { busy(btn, 900, function () { set(true); FK.toast(name + ' bağlandı (demo)', 'success'); }); return; }
      FK.confirm({ title: name + ' bağlantısı kesilsin mi?', text: 'Otomatik aktarım durur; geçmiş veriler panelde kalır.', ok: 'Bağlantıyı kes', danger: true }).then(function (ok) {
        if (ok) { set(false); FK.toast(name + ' bağlantısı kesildi', 'success'); }
      });
    });
  });

  // Webhook'lar
  var hookForm = $('f-webhook'), hooks = $('webhooklar');
  if (hookForm && hooks) {
    hookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!hookForm.checkValidity()) return;
      var ev = Array.prototype.map.call(hookForm.querySelectorAll('input[name="olay"]:checked'), function (c) { return c.value; });
      if (!ev.length) { FK.toast('En az bir olay seç.', 'danger'); return; }
      var li = d.createElement('li');
      li.innerHTML = '<span class="ad-ico"><i class="fk-i fk-i-link" aria-hidden="true"></i></span><span><strong class="fk-mono"></strong><small></small></span><span class="fk-cluster" style="--fk-gap:4px"><button class="fk-btn fk-btn-ghost fk-btn-sm" type="button" data-ad-hook-test>Test et</button><button class="fk-btn fk-btn-icon fk-btn-sm" type="button" data-ad-hook-del aria-label="Webhook\'u sil"><i class="fk-i fk-i-trash" aria-hidden="true"></i></button></span>';
      li.querySelector('strong').textContent = $('w-url').value.trim();
      li.querySelector('small').textContent = ev.join(', ') + ' · whsec_••••' + rnd(4, 'abcdefABCDEF0123456789');
      hooks.appendChild(li);
      hookForm.reset();
      FK.toast('Webhook eklendi', 'success');
    });
    hooks.addEventListener('click', function (e) {
      var t = e.target.closest('[data-ad-hook-test]'), x = e.target.closest('[data-ad-hook-del]');
      if (t) busy(t, 900, function () { FK.toast('Test olayı gönderildi · 200 OK · 142 ms (demo)', 'success'); });
      if (x) FK.confirm({ title: 'Webhook silinsin mi?', text: x.closest('li').querySelector('strong').textContent, ok: 'Sil', danger: true }).then(function (ok) {
        if (ok) { x.closest('li').remove(); FK.toast('Webhook silindi', 'success'); }
      });
    });
  }

  // Ekip ve davetler
  var ekip = $('ekip-tablo'), davetler = $('davetler');
  function countTeam() {
    if (ekip) $('ekip-sayi').textContent = ekip.rows.length + ' kişi · 10 koltuk';
    if (davetler) {
      var n = davetler.children.length;
      $('davet-sayi').textContent = n + ' davet';
      $('davet-bos').hidden = n > 0;
    }
  }
  if (ekip) {
    ekip.addEventListener('change', function (e) {
      var s = e.target.closest('[data-ad-role]');
      if (s) FK.toast(s.getAttribute('data-ad-role') + ' artık ' + s.value + ' (demo)', 'success', 2600);
    });
    ekip.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ad-remove]');
      if (!b) return;
      var name = b.getAttribute('data-ad-remove');
      FK.confirm({ title: name + ' ekipten çıkarılsın mı?', text: 'Panel erişimi hemen kapanır. Yaptığı işlemler kayıtlarda kalır.', ok: 'Ekipten çıkar', danger: true }).then(function (ok) {
        if (!ok) return;
        b.closest('tr').remove();
        countTeam();
        FK.toast(name + ' ekipten çıkarıldı', 'success');
      });
    });
  }
  if (davetler) {
    davetler.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      if (e.target.closest('[data-ad-invite-resend]')) FK.toast(li.getAttribute('data-mail') + ' adresine davet yeniden gönderildi (demo)', 'success');
      if (e.target.closest('[data-ad-invite-cancel]')) { li.remove(); countTeam(); FK.toast('Davet iptal edildi', 'success'); }
    });
  }
  var davetForm = $('f-davet');
  if (davetForm && davetler) {
    davetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!davetForm.checkValidity()) return;
      var mail = $('d-mail').value.trim().toLowerCase(), rol = $('d-rol').value;
      var known = Array.prototype.some.call(ekip.rows, function (r) { return r.cells[1].textContent.trim().toLowerCase() === mail; }) ||
        Array.prototype.some.call(davetler.children, function (li) { return li.getAttribute('data-mail') === mail; });
      if (known) { FK.toast(mail + ' zaten ekipte ya da davet bekliyor.', 'warning'); return; }
      if (ekip.rows.length + davetler.children.length >= 10) { FK.toast('Koltuklar dolu. Planını yükselt ya da birini çıkar.', 'warning'); return; }
      busy(davetForm.querySelector('[type="submit"]'), 700, function () {
        var li = d.createElement('li');
        li.setAttribute('data-mail', mail);
        li.innerHTML = '<span class="ad-ico"><i class="fk-i fk-i-mail" aria-hidden="true"></i></span><span><strong></strong><small>' + rol + ' · az önce gönderildi</small></span><span class="fk-cluster" style="--fk-gap:4px"><button class="fk-btn fk-btn-ghost fk-btn-sm" type="button" data-ad-invite-resend>Yeniden gönder</button><button class="fk-btn fk-btn-icon fk-btn-sm" type="button" data-ad-invite-cancel aria-label="Daveti iptal et"><i class="fk-i fk-i-x" aria-hidden="true"></i></button></span>';
        li.querySelector('strong').textContent = mail;
        davetler.appendChild(li);
        countTeam();
        davetForm.reset();
        FK.close('#m-davet');
        FK.toast(mail + ' adresine davet gönderildi (demo)', 'success');
      });
    });
  }

  // Hesap: dışa aktar, sıfırla, dondur, sil
  d.querySelectorAll('[data-ad-export]').forEach(function (b) {
    b.addEventListener('click', function () {
      var out = { uygulama: 'fkdev Admin', disaAktarim: new Date().toISOString() };
      ['profil', 'tercih', 'guvenlik', 'bildirim', 'fatura', 'plan', 'entegrasyon'].forEach(function (k) { if (state[k]) out[k] = state[k]; });
      out.avatar = !!state.avatar;
      download('fkdev-hesap-verileri.json', JSON.stringify(out, null, 2), 'application/json');
      FK.toast('Verilerin indirildi', 'success', 2400);
    });
  });
  d.querySelectorAll('[data-ad-reset]').forEach(function (b) {
    b.addEventListener('click', function () {
      FK.confirm({ title: 'Demo verisi sıfırlansın mı?', text: 'Bu tarayıcıda kaydettiğin profil, tercih, plan ve bildirim durumları silinir.', ok: 'Sıfırla', danger: true }).then(function (ok) {
        if (!ok) return;
        try { localStorage.removeItem(KEY); } catch (e) {}
        location.reload();
      });
    });
  });
  d.querySelectorAll('[data-ad-freeze]').forEach(function (b) {
    b.addEventListener('click', function () {
      FK.confirm({ title: 'Hesap dondurulsun mu?', text: 'Mağaza ziyaretçilere kapanır, bekleyen siparişler işlenmeye devam eder.', ok: 'Dondur' }).then(function (ok) {
        if (ok) FK.toast('Hesap donduruldu. Tekrar giriş yaptığında açılır (demo).', 'warning');
      });
    });
  });
  var silOnay = $('sil-onay'), silOk = $('sil-ok');
  if (silOnay && silOk) {
    var myMail = function () { return ((state.profil && state.profil['p-mail']) || $('p-mail').value).trim().toLowerCase(); };
    silOnay.addEventListener('input', function () { silOk.disabled = silOnay.value.trim().toLowerCase() !== myMail(); });
    $('m-sil').addEventListener('close', function () { silOnay.value = ''; silOk.disabled = true; });
    silOk.addEventListener('click', function () {
      FK.close('#m-sil');
      FK.toast('Silme talebin alındı. 30 gün içinde giriş yaparak vazgeçebilirsin (demo).', 'warning', 6000);
    });
  }

  /* ---------- Bildirimler: navbar sayacı ve bildirim merkezi ---------- */
  var BELL = ['n1', 'n2', 'n3'];
  state.okundu = state.okundu || [];
  state.silinen = state.silinen || [];
  function isRead(id) { return state.okundu.indexOf(id) >= 0 || state.silinen.indexOf(id) >= 0; }
  function markRead(id) { if (state.okundu.indexOf(id) < 0) { state.okundu.push(id); persist(); } }
  function renderBell() {
    var n = BELL.filter(function (id) { return !isRead(id); }).length;
    d.querySelectorAll('.ad-tool-notif').forEach(function (dd) {
      var c = dd.querySelector('.ad-count'), s = dd.querySelector('summary'), h = dd.querySelector('.ad-notif-head span:last-child');
      if (c) { c.textContent = n; c.hidden = !n; }
      if (s) s.setAttribute('aria-label', n ? 'Bildirimler, ' + n + ' okunmamış' : 'Bildirimler');
      if (h) h.textContent = n ? n + ' yeni' : 'Hepsi okundu';
      dd.querySelectorAll('.ad-notif a:not(.ad-notif-all)').forEach(function (a, i) {
        if (!BELL[i]) return;
        a.hidden = state.silinen.indexOf(BELL[i]) >= 0;
        if (!a._ad) { a._ad = 1; a.addEventListener('click', function () { markRead(BELL[i]); }); }
      });
    });
  }

  var gelen = $('gelen');
  if (gelen) {
    var filtre = 'tumu';
    var listItems = function () { return Array.prototype.slice.call(gelen.children); };
    listItems().forEach(function (li) {
      var id = li.getAttribute('data-id');
      if (state.silinen.indexOf(id) >= 0) li.remove();
      else if (state.okundu.indexOf(id) >= 0) li.classList.remove('is-unread');
    });
    var renderInbox = function () {
      var all = listItems(), unread = all.filter(function (li) { return li.classList.contains('is-unread'); }).length, shown = 0;
      all.forEach(function (li) {
        var ok = filtre === 'tumu' || (filtre === 'okunmamis' ? li.classList.contains('is-unread') : li.getAttribute('data-kind') === filtre);
        li.hidden = !ok;
        if (ok) shown++;
      });
      $('gelen-bos').hidden = shown > 0;
      $('gelen-sayi').textContent = unread ? unread + ' okunmamış' : 'Hepsi okundu';
      $('gelen-toplam').textContent = all.length + ' bildirim';
      renderBell();
    };
    var read = function (li) { li.classList.remove('is-unread'); markRead(li.getAttribute('data-id')); };
    d.querySelectorAll('input[name="filtre"]').forEach(function (r) {
      r.addEventListener('change', function () { filtre = r.value; renderInbox(); });
    });
    gelen.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      if (e.target.closest('[data-ad-read]')) { read(li); renderInbox(); }
      else if (e.target.closest('[data-ad-del]')) {
        state.silinen.push(li.getAttribute('data-id'));
        persist();
        li.remove();
        renderInbox();
        FK.toast('Bildirim silindi', 'success', 2000);
      } else if (e.target.closest('a')) read(li);
    });
    d.querySelectorAll('[data-ad-read-all]').forEach(function (b) {
      b.addEventListener('click', function () {
        var u = listItems().filter(function (li) { return li.classList.contains('is-unread'); });
        if (!u.length) { FK.toast('Okunmamış bildirim yok.', 'info', 2200); return; }
        u.forEach(read);
        renderInbox();
        FK.toast(u.length + ' bildirim okundu sayıldı', 'success', 2200);
      });
    });
    d.querySelectorAll('[data-ad-clear]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = listItems().filter(function (li) { return !li.classList.contains('is-unread'); });
        if (!r.length) { FK.toast('Silinecek okunmuş bildirim yok.', 'info', 2200); return; }
        FK.confirm({ title: r.length + ' okunmuş bildirim silinsin mi?', ok: 'Sil', danger: true }).then(function (ok) {
          if (!ok) return;
          r.forEach(function (li) { state.silinen.push(li.getAttribute('data-id')); li.remove(); });
          persist();
          renderInbox();
          FK.toast('Okunmuş bildirimler silindi', 'success', 2200);
        });
      });
    });
    d.querySelectorAll('[data-ad-filter-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        var all = d.querySelector('input[name="filtre"][value="tumu"]');
        all.checked = true;
        filtre = 'tumu';
        renderInbox();
      });
    });
    renderInbox();
  } else {
    renderBell();
  }

  renderMe();
})();
