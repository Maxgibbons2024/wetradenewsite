/* ================================================================
   WETRADE — 2026 Interactions
   Smooth scroll, parallax, magnetic cards, cursor glow, counters
   ================================================================ */

(function () {
  'use strict';

  // ── Smooth Scroll (Lenis-style) ──
  const html = document.documentElement;
  let scrollY = 0;
  let targetScrollY = 0;
  let isSmooth = true;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothScroll() {
    targetScrollY = window.scrollY;
    scrollY = lerp(scrollY, targetScrollY, 0.1);
    requestAnimationFrame(smoothScroll);
  }

  // Only enable smooth scroll on desktop
  if (window.innerWidth > 768) {
    smoothScroll();
  }

  // ── Cursor Glow ──
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function animateCursor() {
    glowX = lerp(glowX, mouseX, 0.08);
    glowY = lerp(glowY, mouseY, 0.08);
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursor);
  }

  if (window.innerWidth > 768) {
    animateCursor();
  }

  // ── Card Mouse Tracking (glow follows cursor) ──
  function initCardGlow() {
    var cards = document.querySelectorAll('.method-card, .eco-card, .testimonial-card, .result-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }
  initCardGlow();

  // ── Header ──
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ── Mobile Nav ──
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function toggleNav() {
      navToggle.classList.toggle('active');
      mainNav.classList.toggle('open');
      overlay.classList.toggle('active');
      document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    }

    navToggle.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);

    mainNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (mainNav.classList.contains('open')) toggleNav();
      });
    });
  }

  // ── Scroll Reveal with IntersectionObserver ──
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // ── Counter Animation ──
  var counterElements = document.querySelectorAll('[data-count]');
  if (counterElements.length > 0) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 2200;
    var startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutExpo(progress);
      var current = Math.floor(eased * target);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(step);
  }

  // ── Parallax on scroll ──
  function initParallax() {
    var parallaxElements = document.querySelectorAll('.hero-bg-orb');
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', function () {
      var scroll = window.pageYOffset;
      parallaxElements.forEach(function (el, i) {
        var speed = 0.03 + (i * 0.02);
        el.style.transform = 'scale(1) translateY(' + (scroll * speed) + 'px)';
      });
    }, { passive: true });
  }
  initParallax();

  // ── Hero Grid Lines ──
  function createHeroGrid() {
    var grid = document.querySelector('.hero-grid');
    if (!grid) return;

    // Horizontal lines
    for (var i = 0; i < 6; i++) {
      var line = document.createElement('div');
      line.className = 'hero-grid-line hero-grid-line--h';
      line.style.top = (15 + i * 15) + '%';
      grid.appendChild(line);
    }

    // Vertical lines
    for (var j = 0; j < 8; j++) {
      var vline = document.createElement('div');
      vline.className = 'hero-grid-line hero-grid-line--v';
      vline.style.left = (10 + j * 12) + '%';
      grid.appendChild(vline);
    }
  }
  createHeroGrid();

  // ── Form ──
  var startForm = document.getElementById('startForm');
  if (startForm) {
    startForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = startForm.querySelector('.form-btn');
      var original = btn.textContent;
      btn.textContent = 'Processing...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(function () {
        btn.textContent = 'Access Sent';
        btn.style.opacity = '1';
        btn.style.background = '#22c55e';

        setTimeout(function () {
          btn.textContent = original;
          btn.style.background = '';
          btn.disabled = false;
          startForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ── Smooth Anchor Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var offset = header ? header.offsetHeight + 20 : 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── Magnetic Buttons ──
  function initMagneticButtons() {
    var buttons = document.querySelectorAll('.btn--primary, .btn--secondary, .nav-link--cta');
    buttons.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () {
          btn.style.transition = '';
        }, 500);
      });
    });
  }

  if (window.innerWidth > 768) {
    initMagneticButtons();
  }

  // ── Subtle tilt on cards ──
  function initCardTilt() {
    var cards = document.querySelectorAll('.method-card, .eco-card');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'translateY(-4px) perspective(800px) rotateX(' + (y * -3) + 'deg) rotateY(' + (x * 3) + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () {
          card.style.transition = '';
        }, 600);
      });
    });
  }

  if (window.innerWidth > 768) {
    initCardTilt();
  }

})();
