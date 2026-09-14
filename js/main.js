/* ============================================================
   SmartEbooks — Scripts principaux
   ============================================================ */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var WA_NUMBER = '237698308780';
  var WA_BASE_TEXT = 'Bonjour SmartEbooks ! Je souhaite en savoir plus sur vos services et discuter de mon projet.';

  function waUrl(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* --- Header au scroll --- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Menu mobile --- */
  var menuBtn = document.getElementById('menu');
  var nav = document.getElementById('navlinks');

  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    };

    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false);
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenu(false);
      }
    });
  }

  /* --- Révélation au scroll --- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('show'); });
  }

  /* --- Année du copyright --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* --- Formulaire de contact → WhatsApp avec confirmation --- */
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  var fallback = document.getElementById('fallbackLink');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var lines = [
        'Nom : ' + f.get('nom'),
        'Email : ' + f.get('email')
      ];
      if (f.get('tel')) lines.push('Téléphone : ' + f.get('tel'));
      lines.push('Service : ' + f.get('service'));
      lines.push('Projet : ' + f.get('message'));

      var text = 'Bonjour SmartEbooks ! Voici ma demande :%0A%0A' +
        lines.map(function (line) { return line; }).join('%0A');
      var target = 'https://wa.me/' + WA_NUMBER + '?text=' + text;

      window.open(target, '_blank', 'noopener');

      if (fallback) fallback.setAttribute('href', target);
      if (success) success.classList.add('show');
    });
  }
})();