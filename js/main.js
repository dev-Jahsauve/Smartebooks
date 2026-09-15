/* ============================================================
   SmartEbooks — Scripts principaux
   ============================================================ */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  var WA_NUMBER = '237698308780';

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

  /* --- Son de la vidéo héro (volume à fond, bascule on/off) --- */
  var heroVideo = document.getElementById('heroVideo');
  var soundBtn = document.getElementById('videoSound');
  if (heroVideo && soundBtn) {
    heroVideo.volume = 1;

    var toggleSound = function () {
      heroVideo.muted = !heroVideo.muted;
      if (!heroVideo.muted) {
        heroVideo.volume = 1;
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () {});
      }
      var on = !heroVideo.muted;
      soundBtn.classList.toggle('on', on);
      soundBtn.setAttribute('aria-pressed', String(on));
      soundBtn.setAttribute('aria-label', on ? 'Couper le son' : 'Activer le son');
    };

    soundBtn.addEventListener('click', toggleSound);
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

  /* --- Carrousel services (auto-play, flèches, pastilles, swipe) --- */
  var track = document.getElementById('servicesTrack');
  var dotsWrap = document.getElementById('servicesDots');
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var index = 0;
    var timer = null;
    var AUTO_MS = 5000;

    slides.forEach(function (s) {
      var img = s.querySelector('img');
      if (img) img.loading = 'eager'; // svg de diapositives : toujours chargés
    });

    function buildDots() {
      if (!dotsWrap) return;
      slides.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Aller au service ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); restart(); });
        dotsWrap.appendChild(b);
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      if (track) track.style.transform = 'translateX(-' + index * 100 + '%)';
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, j) {
          d.classList.toggle('active', j === index);
          d.setAttribute('aria-current', j === index ? 'true' : 'false');
        });
      }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function start() {
      if (!timer) timer = setInterval(next, AUTO_MS);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    var prevBtn = document.getElementById('servicesPrev');
    var nextBtn = document.getElementById('servicesNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });

    var car = track.closest('.service-carousel');
    if (car) {
      car.addEventListener('mouseenter', stop);
      car.addEventListener('mouseleave', start);
      car.addEventListener('focusin', stop);
      car.addEventListener('focusout', function () { if (!car.contains(document.activeElement)) start(); });

      var startX = null;
      car.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      car.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) { dx < 0 ? next() : prev(); restart(); }
        startX = null;
      }, { passive: true });
    }

    buildDots();
    goTo(0);
    start();
  }

  /* --- Formulaire de contact → Formspree (envoi email) avec repli WhatsApp --- */
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdeorygr';
  var MAILTO = 'smartebooksbusiness@gmail.com';

  function setStatus(state) {
    if (!success) return;
    var shown = state !== 'idle';
    success.classList.toggle('show', shown);
    success.classList.toggle('error', state === 'error');

    if (state === 'pending') {
      success.textContent = 'Envoi de votre demande en cours…';
    } else if (state === 'success') {
      success.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>' +
        'Merci ! Votre message a bien été envoyé. Nous vous répondrons sous 24 h.';
    } else if (state === 'error') {
      success.innerHTML =
        'L&rsquo;envoi a échoué pour le moment. ' +
        '<a href="' + waUrl('Bonjour SmartEbooks ! Je vous contacte depuis le site, car le formulaire a rencontré un problème.') + '" target="_blank" rel="noopener">Contactez-nous sur WhatsApp</a>' +
        ' ou par <a href="mailto:' + MAILTO + '">email</a>.';
    }
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      data.append('_subject', 'Nouvelle demande depuis le site SmartEbooks');

      setStatus('pending');

      fetch(form.action || FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Formspree request failed');
          form.reset();
          setStatus('success');
        })
        .catch(function () {
          setStatus('error');
        });
    });
  }
})();