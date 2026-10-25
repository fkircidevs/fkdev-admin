/*! fkdev Admin · CDN yedeği: ui.fkdev.sbs yüklenemezse /assets/fkdev/ kopyasına geçer */
(function (d) {
  'use strict';
  var BASE = '/assets/fkdev/';
  function local(el) {
    if (el.__fkYedek) return;
    el.__fkYedek = 1;
    var file = el.getAttribute('data-fk-yedek');
    var n;
    if (el.tagName === 'LINK') {
      n = d.createElement('link');
      n.rel = 'stylesheet';
      n.href = BASE + file;
      el.parentNode.insertBefore(n, el.nextSibling);
    } else {
      n = d.createElement('script');
      n.src = BASE + file;
      n.async = false;
      d.head.appendChild(n);
    }
    if (window.console) console.warn('[fkdev] CDN yüklenemedi, yerel kopya kullanılıyor: ' + file);
  }
  d.addEventListener('error', function (e) {
    var el = e.target;
    if (el && el.getAttribute && el.getAttribute('data-fk-yedek')) local(el);
  }, true);
  d.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(d.querySelectorAll('link[data-fk-yedek]'), function (l) {
      var ok = false;
      try { ok = !!(l.sheet && l.sheet.cssRules && l.sheet.cssRules.length); } catch (err) { ok = !!l.sheet; }
      if (!ok) local(l);
    });
  });
  window.addEventListener('load', function () {
    var s = d.querySelector('script[data-fk-yedek]');
    if (s && !window.FK) local(s);
  });
})(document);
