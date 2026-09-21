/* ==========================================================
   Digital PA Presentation — นางพัฒนาภรณ์ คำอุ่น
   ========================================================== */
(function () {
  'use strict';
  let presenting = false;

  /* ---------- 1) GALLERY DATA : 25 ภาพ แยกหมวดเด็ดขาด ---------- */
  const CATS = {
    profile:   { name: 'ประวัติ',                 dir: 'images/profile/',   prefix: 'profile',   count: 2  },
    challenge: { name: 'ประเด็นท้าทาย',            dir: 'images/challenge/', prefix: 'challenge', count: 3  },
    teaching:  { name: 'การจัดการเรียนรู้',        dir: 'images/teaching/',  prefix: 'teaching',  count: 5  },
    plc:       { name: 'ส่งเสริม สนับสนุน + PLC', dir: 'images/plc/',       prefix: 'plc',       count: 5  },
    awards:    { name: 'ผลงานและรางวัล',           dir: 'images/awards/',    prefix: 'award',     count: 10 }
  };
  const ORDER = ['profile', 'challenge', 'teaching', 'plc', 'awards'];

  const ITEMS = [];
  ORDER.forEach(key => {
    const c = CATS[key];
    for (let i = 1; i <= c.count; i++) {
      const n = String(i).padStart(2, '0');
      ITEMS.push({ cat: key, catName: c.name, src: `${c.dir}${c.prefix}-${n}.jpg`, cap: `${c.name} ${i}/${c.count}` });
    }
  });

  /* ---------- 2) PLACEHOLDER เมื่อยังไม่มีไฟล์ภาพ ---------- */
  function placeholder(label) {
    const d = document.createElement('div');
    d.className = 'ph';
    d.innerHTML = `<span><b>♪</b>${label}<br><small>วางไฟล์ภาพในโฟลเดอร์</small></span>`;
    return d;
  }
  function bindImg(img) {
    const src = img.dataset.img || img.getAttribute('src');
    const label = img.dataset.label || img.alt || 'ภาพประกอบ';
    img.addEventListener('error', () => { img.replaceWith(placeholder(label)); }, { once: true });
    if (img.dataset.img) img.src = src;
  }
  document.querySelectorAll('img[data-img]').forEach(bindImg);

  /* ---------- 3) RENDER GALLERY ---------- */
  const grid = document.getElementById('galleryGrid');
  let visible = ITEMS.slice();

  function renderGallery(cat) {
    visible = (cat === 'all') ? ITEMS.slice() : ITEMS.filter(x => x.cat === cat);
    grid.innerHTML = '';
    visible.forEach((it, idx) => {
      const fig = document.createElement('figure');
      fig.className = 'gitem';
      const img = document.createElement('img');
      img.alt = it.cap; img.loading = 'lazy';
      img.dataset.img = it.src; img.dataset.label = it.catName;
      const cap = document.createElement('figcaption');
      cap.className = 'gitem__cap'; cap.textContent = it.cap;
      fig.append(img, cap);
      fig.addEventListener('click', () => openLB(idx));
      grid.appendChild(fig);
      bindImg(img);
    });
  }
  renderGallery('all');

  document.getElementById('galTabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    document.querySelectorAll('#galTabs .tab').forEach(t => t.classList.remove('is-active'));
    b.classList.add('is-active');
    renderGallery(b.dataset.cat);
  });

  /* ---------- 4) LIGHTBOX ---------- */
  const lb = document.getElementById('lightbox'),
        lbImg = document.getElementById('lbImg'),
        lbCap = document.getElementById('lbCap');
  let lbIndex = 0, lbList = [];

  function openLB(i, list) {
    lbList = list || visible;
    lbIndex = i; lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showLB();
  }
  function showLB() {
    const it = lbList[lbIndex];
    lbImg.style.display = ''; lbImg.src = it.src; lbImg.alt = it.cap;
    lbCap.textContent = `${it.cap}  ·  ${lbIndex + 1} / ${lbList.length}`;
    lbImg.onerror = () => { lbImg.style.display = 'none'; lbCap.textContent = `${it.cap} — ยังไม่พบไฟล์ภาพ (${it.src})`; };
  }
  function moveLB(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; showLB(); }
  function closeLB() { lb.hidden = true; if (!document.body.classList.contains('present')) document.body.style.overflow = ''; }

  document.getElementById('lbNext').onclick = () => moveLB(1);
  document.getElementById('lbPrev').onclick = () => moveLB(-1);
  document.getElementById('lbClose').onclick = closeLB;
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

  /* ภาพใน Section ต่าง ๆ ก็เปิด Lightbox ได้ (ภายในหมวดตัวเอง) */
  document.querySelectorAll('.imgrow .thumb').forEach(fig => {
    fig.addEventListener('click', () => {
      const img = fig.querySelector('img'); if (!img) return;
      const src = img.dataset.img || img.src;
      const i = ITEMS.findIndex(x => src.indexOf(x.src) > -1);
      if (i > -1) { const list = ITEMS.filter(x => x.cat === ITEMS[i].cat); openLB(list.findIndex(x => x.src === ITEMS[i].src), list); }
    });
  });

  /* ---------- 5) REVEAL + COUNTER + PROGRESS ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      setTimeout(() => el.classList.add('in'), +(el.dataset.delay || 0));
      io.unobserve(el);
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  function animateCount(el) {
    const target = +el.dataset.count, dur = 1400, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('th-TH');
      if (p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString('th-TH');
    })(t0);
  }
  const ioNum = new IntersectionObserver(es => {
    es.forEach(en => { if (en.isIntersecting) { animateCount(en.target); ioNum.unobserve(en.target); } });
  }, { threshold: .5 });
  document.querySelectorAll('.counter').forEach(el => ioNum.observe(el));

  const ioBar = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      setTimeout(() => { el.style.width = el.dataset.fill + '%'; }, 200);
      ioBar.unobserve(el);
    });
  }, { threshold: .4 });
  document.querySelectorAll('.bar__fill').forEach(el => ioBar.observe(el));

  const ringFg = document.getElementById('ringFg');
  if (ringFg) {
    const C = 2 * Math.PI * 94;
    ringFg.style.strokeDasharray = C; ringFg.style.strokeDashoffset = C;
    new IntersectionObserver((es, ob) => {
      es.forEach(en => {
        if (!en.isIntersecting) return;
        setTimeout(() => { ringFg.style.strokeDashoffset = C * (1 - 0.90); }, 250);
        ob.unobserve(en.target);
      });
    }, { threshold: .4 }).observe(document.getElementById('ring90'));
  }

  /* ---------- 6) NAV : scrollspy / progress / mobile ---------- */
  const sections = Array.from(document.querySelectorAll('#deck .section'));
  const links = Array.from(document.querySelectorAll('.nav__menu a'));
  const scrollBar = document.getElementById('scrollBar');
  const toTop = document.getElementById('toTop');

  /* ---------- 6.5) NARRATION AUDIO : เสียงบรรยายรายหัวข้อ ---------- */
  const narrationEl = document.getElementById('narration');
  const narrationBtn = document.getElementById('narrationBtn');
  const narrationIcon = document.getElementById('narrationIcon');
  const narrationLabel = document.getElementById('narrationLabel');
  const narrationAudio = document.getElementById('narrationAudio');
  let narrationId = null, isNarrating = false, activeSectionId = sections[0].id;

  function sectionLabel(id) { const s = document.getElementById(id); return (s && s.dataset.title) || id; }

  function loadNarration(id) {
    narrationId = id;
    narrationAudio.src = `audio/${id}.mp3`;
    narrationLabel.textContent = sectionLabel(id);
  }
  function playNarration(id) {
    if (id && id !== narrationId) loadNarration(id);
    narrationAudio.play().catch(() => {
      narrationLabel.textContent = `ไม่พบไฟล์เสียง: audio/${narrationId}.mp3`;
    });
  }
  narrationBtn.addEventListener('click', () => {
    if (isNarrating) { narrationAudio.pause(); return; }
    playNarration(presenting ? sections[slide].id : activeSectionId);
  });
  narrationAudio.addEventListener('play', () => { isNarrating = true; narrationEl.classList.add('is-playing'); narrationIcon.textContent = '⏸'; });
  narrationAudio.addEventListener('pause', () => { isNarrating = false; narrationEl.classList.remove('is-playing'); narrationIcon.textContent = '▶'; });
  narrationAudio.addEventListener('ended', () => {
    const idx = sections.findIndex(s => s.id === narrationId);
    if (idx > -1 && idx < sections.length - 1) {
      const nextId = sections[idx + 1].id;
      if (presenting) goto(idx + 1);
      playNarration(nextId);
    }
  });
  loadNarration(activeSectionId);

  function onScroll() {
    const y = window.scrollY, h = document.body.scrollHeight - innerHeight;
    scrollBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    toTop.classList.toggle('show', y > 600);
    let cur = sections[0].id;
    sections.forEach(s => { if (y >= s.offsetTop - 140) cur = s.id; });
    links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur));
    if (cur !== activeSectionId && !presenting) {
      activeSectionId = cur;
      isNarrating ? playNarration(cur) : loadNarration(cur);
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  const navMenu = document.getElementById('navMenu');
  document.getElementById('navToggle').onclick = () => navMenu.classList.toggle('open');
  links.forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    const id = (a.getAttribute('href') || '').replace('#', '');
    if (!id || !document.getElementById(id)) return;
    activeSectionId = id;
    playNarration(id);
  }));

  /* ---------- 7) PRESENTATION MODE ---------- */
  const pctl = document.getElementById('pctl'),
        pFill = document.getElementById('pctlFill'),
        pCount = document.getElementById('pCount'),
        pTitle = document.getElementById('pTitle');
  let slide = 0, wheelLock = 0;

  function goto(i) {
    slide = Math.max(0, Math.min(i, sections.length - 1));
    sections.forEach((s, k) => s.classList.toggle('slide-on', k === slide));
    pFill.style.width = ((slide + 1) / sections.length) * 100 + '%';
    pCount.textContent = `${slide + 1} / ${sections.length}`;
    pTitle.textContent = sections[slide].dataset.title || '';
    const s = sections[slide];
    s.scrollTop = 0;
    s.querySelectorAll('.counter').forEach(el => { el.textContent = '0'; animateCount(el); });
    s.querySelectorAll('.bar__fill').forEach(el => { el.style.width = '0'; setTimeout(() => el.style.width = el.dataset.fill + '%', 150); });
    if (ringFg && s.id === 'results') {
      const C = 2 * Math.PI * 94;
      ringFg.style.strokeDashoffset = C;
      setTimeout(() => ringFg.style.strokeDashoffset = C * .10, 180);
    }
    activeSectionId = s.id;
    isNarrating ? playNarration(s.id) : loadNarration(s.id);
  }
  function enter() {
    presenting = true; document.body.classList.add('present');
    pctl.hidden = false; document.body.style.overflow = 'hidden';
    const idx = sections.findIndex(s => s.id === (location.hash || '#home').slice(1));
    goto(idx > -1 ? idx : 0);
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  }
  function exit() {
    presenting = false; document.body.classList.remove('present');
    pctl.hidden = true; document.body.style.overflow = '';
    sections.forEach(s => s.classList.remove('slide-on'));
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    sections[slide].scrollIntoView();
  }
  document.getElementById('startPresent').onclick = enter;
  document.getElementById('pNext').onclick = () => goto(slide + 1);
  document.getElementById('pPrev').onclick = () => goto(slide - 1);
  document.getElementById('pExit').onclick = exit;
  document.getElementById('pFull').onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  addEventListener('keydown', e => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowRight') moveLB(1);
      if (e.key === 'ArrowLeft') moveLB(-1);
      return;
    }
    if (e.key === 'F5' || (e.key.toLowerCase() === 'p' && e.shiftKey)) { e.preventDefault(); presenting ? exit() : enter(); return; }
    if (!presenting) return;
    if ([' ', 'ArrowRight', 'ArrowDown', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); goto(slide + 1); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); goto(slide - 1); }
    if (e.key === 'Escape') exit();
    if (e.key === 'Home') goto(0);
    if (e.key === 'End') goto(sections.length - 1);
  });

  addEventListener('wheel', e => {
    if (!presenting || !lb.hidden) return;
    const s = sections[slide];
    const scrollable = s.scrollHeight > s.clientHeight + 4;
    if (scrollable) {
      const atTop = s.scrollTop <= 2, atBot = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
      if ((e.deltaY > 0 && !atBot) || (e.deltaY < 0 && !atTop)) return;
    }
    const now = Date.now(); if (now - wheelLock < 700) return; wheelLock = now;
    goto(slide + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  /* Swipe บนมือถือขณะนำเสนอ */
  let tsX = 0, tsY = 0;
  addEventListener('touchstart', e => { tsX = e.touches[0].clientX; tsY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (!presenting) return;
    const dx = e.changedTouches[0].clientX - tsX, dy = e.changedTouches[0].clientY - tsY;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) goto(slide + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && presenting) { /* คงโหมดนำเสนอไว้ ออกได้ด้วยปุ่ม ✕ */ }
  });
})();