/* ============================================================
   Lloyd & Co. — script.js v3
   ============================================================ */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── js-ready flag ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js-ready');
  initNav();
  initFadeIn();
  initBlueprintHero();
  initWordSwap();
  initCoverflow();
  initProjectAccordion();
  initStatCounters();
  initTimeline();
  initFlipCards();
  initFAQ();
  initAutomateDrawer();
  initQuizDrawer();
  initCursor();
});

/* ─── Nav ────────────────────────────────────────────────────── */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    if (a.getAttribute('href') === page || (page === 'index.html' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ─── Fade-in ────────────────────────────────────────────────── */
function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const show = el => el.classList.add('visible');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { show(e.target); observer.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  els.forEach(el => observer.observe(el));
  setTimeout(() => els.forEach(show), 500);
}

/* ─── Blueprint Hero Animation ──────────────────────────────── */
function initBlueprintHero() {
  const svg = document.getElementById('blueprint-svg');
  if (!svg) return;

  const W = window.innerWidth, H = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const lines = [];
  const STEP = 48;

  // Horizontal lines
  for (let y = 0; y < H; y += STEP) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', 0); el.setAttribute('y1', y);
    el.setAttribute('x2', W); el.setAttribute('y2', y);
    svg.appendChild(el); lines.push(el);
  }
  // Vertical lines
  for (let x = 0; x < W; x += STEP) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', x); el.setAttribute('y1', 0);
    el.setAttribute('x2', x); el.setAttribute('y2', H);
    svg.appendChild(el); lines.push(el);
  }

  if (reduced) { lines.forEach(l => { l.style.strokeDasharray = 'none'; }); return; }

  lines.forEach(l => {
    const len = l.getAttribute('x1') === '0' ? W : H;
    l.style.strokeDasharray = len;
    l.style.strokeDashoffset = len;
  });

  let i = 0;
  function drawNext() {
    if (i >= lines.length) return;
    const batch = Math.ceil(lines.length / 40);
    for (let b = 0; b < batch && i < lines.length; b++, i++) {
      lines[i].style.transition = `stroke-dashoffset 0.6s ease`;
      lines[i].style.strokeDashoffset = 0;
    }
    setTimeout(drawNext, 30);
  }
  setTimeout(drawNext, 200);

  // Fade hero content in after grid draws
  const content = document.querySelector('.hero__content');
  if (content) {
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.8s ease';
    setTimeout(() => { content.style.opacity = '1'; }, 1400);
  }
}

/* ─── Word Swap ──────────────────────────────────────────────── */
function initWordSwap() {
  const wordEl = document.querySelector('.hero__word');
  if (!wordEl || reduced) return;
  const words = [
    'real estate agents',
    'construction firms',
    'property managers',
    'law firms',
    'independent contractors',
    'accounting firms',
    'local operators'
  ];
  let idx = 0;

  setInterval(() => {
    idx = (idx + 1) % words.length;
    wordEl.classList.add('slide-out');
    setTimeout(() => {
      wordEl.textContent = words[idx];
      wordEl.classList.remove('slide-out');
      wordEl.classList.add('slide-in');
      setTimeout(() => wordEl.classList.remove('slide-in'), 350);
    }, 350);
  }, 2800);
}

/* ─── 3D Coverflow Carousel ──────────────────────────────────── */
function initCarousel() { /* legacy — replaced by initCoverflow */ }

function initCoverflow() {
  const cards = document.querySelectorAll('.cflow-card');
  const dots  = document.querySelectorAll('.cflow-dot');
  if (!cards.length) return;

  const n = cards.length;
  let active = 0;
  let timer;

  function posFor(cardIdx) {
    const diff = ((cardIdx - active) % n + n) % n;
    if (diff === 0) return 'active';
    if (diff === 1) return 'right';
    if (diff === n - 1) return 'left';
    return 'hidden';
  }
  // n is now 6 — hidden cards stay behind the active one

  function render() {
    cards.forEach((c, i) => c.setAttribute('data-pos', posFor(i)));
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  function goTo(idx) { active = ((idx % n) + n) % n; render(); }
  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  render();

  // Click side cards to advance
  cards.forEach((c, i) => c.addEventListener('click', () => {
    const pos = c.getAttribute('data-pos');
    if (pos === 'right') { stopTimer(); next(); startTimer(); }
    if (pos === 'left')  { stopTimer(); prev(); startTimer(); }
  }));

  document.querySelector('.cflow-btn--next')?.addEventListener('click', () => { stopTimer(); next(); startTimer(); });
  document.querySelector('.cflow-btn--prev')?.addEventListener('click', () => { stopTimer(); prev(); startTimer(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopTimer(); goTo(i); startTimer(); }));

  const outer = document.querySelector('.cflow-outer');
  function startTimer() { timer = setInterval(next, 5000); }
  function stopTimer()  { clearInterval(timer); }
  outer?.addEventListener('mouseenter', stopTimer);
  outer?.addEventListener('mouseleave', startTimer);
  startTimer();

  // Touch/swipe
  let touchStartX = 0;
  outer?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  outer?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { stopTimer(); dx < 0 ? next() : prev(); startTimer(); }
  }, { passive: true });
}

/* ─── Project Accordion ──────────────────────────────────────── */
function initProjectAccordion() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.querySelector('.project-card__header')?.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      cards.forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });
}

/* ─── Stat Counters ─────────────────────────────────────────── */
function initStatCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1500;
      const start = performance.now();
      observer.unobserve(el);

      if (reduced) { el.textContent = target + suffix; return; }

      function frame(now) {
        const prog = Math.min((now - start) / dur, 1);
        const val = Math.floor(prog * target);
        el.textContent = val + suffix;
        if (prog < 1) requestAnimationFrame(frame);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
}

/* ─── Horizontal Timeline ────────────────────────────────────── */
function initTimeline() {
  const outer = document.querySelector('.timeline-sticky-outer');
  const track = document.querySelector('.timeline-track');
  const steps = document.querySelectorAll('.timeline-step');
  if (!outer || !track || window.innerWidth <= 768) return;

  function onScroll() {
    const rect = outer.getBoundingClientRect();
    const total = outer.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    const maxShift = track.scrollWidth - window.innerWidth + 160;
    track.style.transform = `translateX(-${progress * maxShift}px)`;

    steps.forEach((step, i) => {
      const threshold = i / steps.length;
      if (progress >= threshold) step.classList.add('arrived');
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Flip Cards ─────────────────────────────────────────────── */
function initFlipCards() {
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

/* ─── FAQ ────────────────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ─── Automate Drawer ────────────────────────────────────────── */
function initAutomateDrawer() {
  const tab      = document.getElementById('automateTab');
  const drawer   = document.getElementById('automateDrawer');
  const backdrop = document.getElementById('automateBackdrop');
  const closeBtn = document.getElementById('automateClose');
  const quizDrawer = document.getElementById('quizDrawer');
  const quizBackdrop = document.getElementById('quizBackdrop');

  if (!tab || !drawer) return;

  function open() {
    // Close quiz if open
    quizDrawer?.classList.remove('open');
    quizBackdrop?.classList.remove('open');
    drawer.classList.add('open');
    backdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    drawer.classList.remove('open');
    backdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  tab.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.querySelectorAll('[data-automate-open]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(); }));
}

/* ─── Quiz Drawer ────────────────────────────────────────────── */
const quizData = [
  {
    q: 'What industry are you in?',
    type: 'single',
    opts: ['Residential Construction','Commercial Construction','Real Estate (Sales/Brokerage)','Real Estate (Property Management)','Other']
  },
  {
    q: 'How many people are on your team?',
    type: 'single',
    opts: ['Just me','2–5','6–15','16+']
  },
  {
    q: 'Where does most of your manual time go?',
    type: 'multi',
    opts: ['Following up with leads or clients','Scheduling and dispatch','Reporting and status updates','Invoicing and billing','Coordinating with subs or vendors','Paperwork and documentation']
  },
  {
    q: 'What tools are you currently using?',
    type: 'multi',
    opts: ['Buildertrend','CoConstruct / Buildxact','QuickBooks','Follow Up Boss / HubSpot','Excel / Google Sheets mostly','Nothing formal']
  },
  {
    q: "What's your biggest operational headache right now?",
    type: 'open'
  },
  {
    q: 'How much time per week goes to manual admin?',
    type: 'single',
    opts: ['Less than 2 hours','2–5 hours','5–10 hours','More than 10 hours']
  }
];

let qIdx = 0;
let answers = {};
let multiSel = new Set();

function initQuizDrawer() {
  const tab      = document.getElementById('quizTab');
  const drawer   = document.getElementById('quizDrawer');
  const backdrop = document.getElementById('quizBackdrop');
  const closeBtn = document.getElementById('quizClose');

  if (!tab || !drawer) return;

  function open()  {
    document.getElementById('automateDrawer')?.classList.remove('open');
    document.getElementById('automateBackdrop')?.classList.remove('open');
    drawer.classList.add('open'); backdrop.classList.add('open');
    document.body.style.overflow = 'hidden'; renderQ();
  }
  function close() { drawer.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow = ''; }

  tab.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  // Also wire any in-page "Take Quiz" links
  document.querySelectorAll('[data-quiz-open]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(); }));
}

function renderQ() {
  if (qIdx >= quizData.length) { renderLead(); return; }

  const q = quizData[qIdx];
  const body = document.getElementById('quizBody');
  const footer = document.getElementById('quizFooter');
  multiSel = new Set();
  updateBeam();

  let html = `<p class="quiz-q-text">${q.q}</p>`;

  if (q.type === 'single') {
    html += `<div class="quiz-opts">${q.opts.map((o,i) => `
      <button class="quiz-opt" data-i="${i}" onclick="selectSingle(this,${i})">
        <span class="quiz-opt__radio"></span>${o}
      </button>`).join('')}</div>`;
  } else if (q.type === 'multi') {
    html += `<p style="font-size:0.75rem;color:var(--subtle);margin-bottom:0.85rem;font-style:italic;">Select all that apply</p>
    <div class="quiz-opts">${q.opts.map((o,i) => `
      <button class="quiz-opt" data-i="${i}" onclick="toggleMulti(this,${i})">
        <span class="quiz-opt__check"></span>${o}
      </button>`).join('')}</div>`;
  } else {
    html += `<textarea class="quiz-open-input" id="quizOpen" placeholder="Type your answer here…" rows="4"></textarea>`;
  }

  body.innerHTML = html;

  footer.innerHTML = `
    ${qIdx > 0 ? '<button class="btn btn--outline" onclick="quizBack()">Back</button>' : ''}
    <button class="btn btn--primary" id="quizNextBtn" onclick="quizNext()" ${q.type !== 'open' && q.type !== 'multi' ? 'disabled' : ''}>
      ${qIdx === quizData.length - 1 ? 'See My Results' : 'Next →'}
    </button>`;
}

function selectSingle(el, i) {
  document.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[qIdx] = i;
  const btn = document.getElementById('quizNextBtn');
  if (btn) btn.disabled = false;
}

function toggleMulti(el, i) {
  if (multiSel.has(i)) { multiSel.delete(i); el.classList.remove('multi-selected'); el.querySelector('.quiz-opt__check').textContent = ''; }
  else { multiSel.add(i); el.classList.add('multi-selected'); el.querySelector('.quiz-opt__check').textContent = '✓'; }
  answers[qIdx] = [...multiSel];
}

function quizNext() {
  const q = quizData[qIdx];
  if (q.type === 'open') { answers[qIdx] = document.getElementById('quizOpen')?.value || ''; }
  if (q.type === 'multi') { answers[qIdx] = [...multiSel]; }
  qIdx++;
  if (qIdx >= quizData.length) { renderLead(); } else { renderQ(); }
  updateBeam();
}

function quizBack() {
  if (qIdx > 0) { qIdx--; renderQ(); updateBeam(); }
}

function updateBeam() {
  const segs = document.querySelectorAll('.quiz-beam-seg');
  const label = document.getElementById('beamLabel');
  segs.forEach((s,i) => s.classList.toggle('filled', i < qIdx));
  if (label) label.textContent = `${Math.min(qIdx, quizData.length)} / ${quizData.length}`;
}

function renderLead() {
  const body = document.getElementById('quizBody');
  const footer = document.getElementById('quizFooter');
  body.innerHTML = `
    <p class="quiz-q-text">Where should we send your results?</p>
    <div class="quiz-lead-fields">
      <input type="text" id="quizName" placeholder="Your name" autocomplete="name" />
      <input type="email" id="quizEmail" placeholder="Your email address" autocomplete="email" />
    </div>
    <p style="font-size:0.78rem;color:var(--subtle);font-style:italic;">No spam. Just your results.</p>`;
  footer.innerHTML = `
    <button class="btn btn--outline" onclick="quizBack()">Back</button>
    <button class="btn btn--primary" onclick="quizSubmit()">Get My Results →</button>`;
}

function quizSubmit() {
  const name  = document.getElementById('quizName')?.value?.trim();
  const email = document.getElementById('quizEmail')?.value?.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }

  // Score
  const hoursIdx   = typeof answers[5] === 'number' ? answers[5] : -1; // 3 = 10+ hrs
  const toolsArr   = Array.isArray(answers[3]) ? answers[3] : [];
  const noFormal   = toolsArr.includes(5); // "Nothing formal"
  const industry   = typeof answers[0] === 'number' ? answers[0] : -1; // 0,1,2,3 = construction/RE
  const isConstRE  = industry <= 3;

  const isStrong = hoursIdx === 3 || noFormal || isConstRE;

  const timeMap   = ['Less than 2 hours','2–5 hours','5–10 hours','More than 10 hours'];
  const painMap   = ['Following up with leads or clients','Scheduling and dispatch','Reporting and status updates','Invoicing and billing','Coordinating with subs or vendors','Paperwork and documentation'];
  const pains     = Array.isArray(answers[2]) ? answers[2].map(i => painMap[i]) : [];

  const body   = document.getElementById('quizBody');
  const footer = document.getElementById('quizFooter');

  const segs = document.querySelectorAll('.quiz-beam-seg');
  segs.forEach(s => s.classList.add('filled'));

  if (isStrong) {
    body.innerHTML = `
      <div class="quiz-result">
        <span class="quiz-result-label quiz-result-label--strong">Strong Fit</span>
        <h3>Here's what we're seeing, ${name.split(' ')[0]}:</h3>
        ${pains.length ? `<ul class="quiz-result__points">${pains.slice(0,3).map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
        <p>These are exactly the gaps we fix. We've seen operations like yours save 10+ hours a week by automating these specific workflows. Book a free 30-minute audit call to see exactly what we'd build for your operation.</p>
        <a href="book.html" class="btn btn--primary" style="width:100%;justify-content:center;margin-top:0.5rem;">Book Your Free Audit Now →</a>
      </div>`;
  } else {
    body.innerHTML = `
      <div class="quiz-result">
        <span class="quiz-result-label quiz-result-label--weak">You're Ahead of the Curve</span>
        <h3>Honestly? You're already thinking about this the right way.</h3>
        <p>You're ahead of most businesses in your space. If you ever want a second set of eyes on your current setup — or want to explore what's next — we're happy to spend 30 minutes with you. No pressure.</p>
        <a href="book.html" class="btn btn--outline" style="width:100%;justify-content:center;margin-top:0.5rem;">Schedule a Conversation</a>
      </div>`;
  }
  footer.innerHTML = '';
}

/* ─── Cursor Follower ────────────────────────────────────────── */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const dot = document.getElementById('cursorDot');
  if (!dot) return;
  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });
}
