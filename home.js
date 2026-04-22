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

  /* 6. Smooth-scroll anchor hrefs ------------------------------ */
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
