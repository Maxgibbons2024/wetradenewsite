(() => {
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Scroll-aware nav background ------------------------------ */
  const nav = document.getElementById('siteNav');
  if (nav) {
    let ticking = false;
    const update = () => {
      nav.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* 2. Mobile menu sheet --------------------------------------- */
  const toggle = document.getElementById('navToggle');
  const sheet = document.getElementById('navSheet');
  const sheetClose = document.getElementById('navSheetClose');

  const openMenu = () => {
    if (!sheet || !toggle) return;
    sheet.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('is-menu-open');
  };
  const closeMenu = () => {
    if (!sheet || !toggle) return;
    sheet.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('is-menu-open');
  };
  toggle?.addEventListener('click', openMenu);
  sheetClose?.addEventListener('click', closeMenu);
  sheet?.addEventListener('click', (e) => {
    const tgt = e.target;
    if (tgt instanceof HTMLAnchorElement) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet && !sheet.hidden) closeMenu();
  });

  /* 3. Booking slot selection ---------------------------------- */
  const slotsEl = document.querySelector('.book__slots');
  const selectedEl = document.getElementById('selectedSlot');
  const selectedInput = document.getElementById('selectedSlotInput');
  const submitLabel = document.getElementById('bookSubmitLabel');

  const selectSlot = (btn) => {
    if (!btn) return;
    const all = slotsEl.querySelectorAll('.slot');
    all.forEach((s) => { s.setAttribute('aria-checked', 'false'); s.tabIndex = -1; });
    btn.setAttribute('aria-checked', 'true');
    btn.tabIndex = 0;
    const value = btn.dataset.slot || btn.textContent.trim();
    if (selectedEl) selectedEl.textContent = value;
    if (selectedInput) selectedInput.value = value;
    if (submitLabel) submitLabel.textContent = value;
  };

  slotsEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.slot');
    if (btn) selectSlot(btn);
  });
  slotsEl?.addEventListener('keydown', (e) => {
    const all = Array.from(slotsEl.querySelectorAll('.slot'));
    const idx = all.indexOf(document.activeElement);
    if (idx < 0) return;
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % all.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + all.length) % all.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = all.length - 1;
    if (next >= 0) {
      e.preventDefault();
      all[next].focus();
      selectSlot(all[next]);
    }
  });

  /* 4. Calendar week label cycle (pure-client) ----------------- */
  const calLabel = document.getElementById('calLabel');
  const calTitle = document.getElementById('calTitle');
  const WEEKS = [
    { label: 'April 2026 · Week 17', title: 'Pick a 30-minute slot' },
    { label: 'April 2026 · Week 18', title: 'Pick a 30-minute slot' },
    { label: 'May 2026 · Week 19',   title: 'Pick a 30-minute slot' },
  ];
  let weekIdx = 0;
  const renderWeek = () => {
    if (calLabel) calLabel.textContent = WEEKS[weekIdx].label;
    if (calTitle) calTitle.textContent = WEEKS[weekIdx].title;
  };
  document.querySelectorAll('.book__cal-nav button').forEach((b) => {
    b.addEventListener('click', () => {
      const dir = Number(b.dataset.dir) || 0;
      weekIdx = (weekIdx + dir + WEEKS.length) % WEEKS.length;
      renderWeek();
    });
  });

  /* 5. Form submit stub ---------------------------------------- */
  const form = document.getElementById('bookForm');
  const status = document.getElementById('bookStatus');
  const submitBtn = document.getElementById('bookSubmit');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (status) {
      status.hidden = false;
      status.textContent = "Thanks — we'll confirm your slot by email within 2 hours.";
    }
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Booked ✓';
    }
  });

  /* 6. Globe student rotator (with arc trace + pop-up callout) -- */
  const callout = document.getElementById('studentCallout');
  const arcTrace = document.getElementById('arcTrace');
  const stage = document.querySelector('.globe-trust__stage');
  const pins = document.querySelectorAll('.globe .pin');
  const avatarEl = document.getElementById('studentAvatar');
  const nameEl = document.getElementById('studentName');
  const locEl = document.getElementById('studentLoc');
  const fundedEl = document.getElementById('studentFunded');

  const STUDENTS = [
    { pin: 'la',         initials: 'JM', name: 'John Martinez',    loc: 'Los Angeles, USA',   funded: 'Funded $600k' },
    { pin: 'manchester', initials: 'SR', name: 'Samantha Reid',    loc: 'Manchester, UK',     funded: 'Funded £100k' },
    { pin: 'paris',      initials: 'CD', name: 'Chloé Dubois',     loc: 'Paris, France',      funded: 'Funded €150k' },
    { pin: 'dubai',      initials: 'OH', name: 'Omar Haddad',      loc: 'Dubai, UAE',         funded: 'Funded $400k' },
    { pin: 'mumbai',     initials: 'PK', name: 'Priya Kumar',      loc: 'Mumbai, India',      funded: 'Funded $100k' },
    { pin: 'tokyo',      initials: 'TS', name: 'Takashi Sato',     loc: 'Tokyo, Japan',       funded: 'Funded $200k' },
    { pin: 'saopaulo',   initials: 'LB', name: 'Lucia Barros',     loc: 'São Paulo, Brazil',  funded: 'Funded $250k' },
  ];

  // SVG viewBox is 400x400, sphere centered at (200,200) radius 180.
  // Quadratic bezier with control point pushed outward from globe center
  // to give the arc a "lifted" curve like a great-circle route.
  const arcPath = (a, b) => {
    const cx = 200, cy = 200;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = mx - cx, dy = my - cy;
    const k = 0.55;
    const cpx = cx + dx * (1 + k);
    const cpy = cy + dy * (1 + k);
    return `M ${a.x} ${a.y} Q ${cpx} ${cpy} ${b.x} ${b.y}`;
  };

  const pinCoords = (key) => {
    const el = document.querySelector(`.globe .pin[data-pin="${key}"]`);
    return el ? { x: +el.dataset.x, y: +el.dataset.y } : null;
  };

  // SVG coords (0–400) → percentage of the stage div.
  const positionCallout = (pin) => {
    if (!callout || !pin) return;
    callout.style.left = (pin.x / 400) * 100 + '%';
    callout.style.top = (pin.y / 400) * 100 + '%';
    callout.dataset.pos = pin.y < 180 ? 'below' : 'above';
  };

  const traceArc = (from, to) => {
    if (!arcTrace || !from || !to) return;
    arcTrace.setAttribute('d', arcPath(from, to));
    let len = 0;
    try { len = arcTrace.getTotalLength(); } catch (_) { len = 600; }
    arcTrace.style.transition = 'none';
    arcTrace.style.strokeDasharray = len;
    arcTrace.style.strokeDashoffset = len;
    arcTrace.style.opacity = '0';
    arcTrace.getBoundingClientRect(); // force reflow
    arcTrace.style.transition = `stroke-dashoffset .6s cubic-bezier(.4,0,.2,1), opacity .25s ease`;
    arcTrace.style.opacity = '1';
    arcTrace.style.strokeDashoffset = '0';
    setTimeout(() => { arcTrace.style.opacity = '0'; }, 900);
  };

  if (callout && pins.length) {
    let idx = 0;
    let prevPin = null;

    const writeContent = (s) => {
      avatarEl.textContent = s.initials;
      nameEl.textContent = s.name;
      locEl.textContent = s.loc;
      fundedEl.textContent = s.funded;
    };

    // Initial render (no animation)
    const initial = STUDENTS[idx];
    const initialPin = pinCoords(initial.pin);
    pins.forEach((p) => p.classList.toggle('is-active', p.dataset.pin === initial.pin));
    writeContent(initial);
    positionCallout(initialPin);
    requestAnimationFrame(() => requestAnimationFrame(() => callout.classList.add('is-visible')));
    prevPin = initialPin;

    // Smooth slide-and-swap on each cycle: arc + card position animate in
    // parallel; text crossfades mid-transit so the card never disappears.
    const advance = () => {
      idx = (idx + 1) % STUDENTS.length;
      const s = STUDENTS[idx];
      const target = pinCoords(s.pin);

      pins.forEach((p) => p.classList.toggle('is-active', p.dataset.pin === s.pin));
      if (prevPin && !prefersReduced) traceArc(prevPin, target);
      positionCallout(target);

      // crossfade text mid-flight
      if (prefersReduced) {
        writeContent(s);
      } else {
        callout.classList.add('is-swapping');
        setTimeout(() => {
          writeContent(s);
          callout.classList.remove('is-swapping');
        }, 140);
      }
      prevPin = target;
    };
    setInterval(advance, 1800);
  }

  /* 7. Smooth-scroll anchor hrefs ------------------------------ */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    if (sheet && !sheet.hidden) closeMenu();
  });
})();
