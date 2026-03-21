/**
 * App controller — quiz flow, screen transitions, animations.
 */

(function () {
  const screens = {
    landing:    document.getElementById('landing'),
    quiz:       document.getElementById('quiz'),
    generating: document.getElementById('generating'),
    result:     document.getElementById('result')
  };

  const startBtn       = document.getElementById('start-btn');
  const restartBtn     = document.getElementById('restart-btn');
  const progressFill   = document.getElementById('progress-fill');
  const quizCounter    = document.getElementById('quiz-counter');
  const questionText   = document.getElementById('question-text');
  const optionsEl      = document.getElementById('options');
  const resultTitle    = document.getElementById('result-title');
  const resultDesc     = document.getElementById('result-description');
  const resultTraits   = document.getElementById('result-traits');
  const animCanvas     = document.getElementById('animation-canvas');
  const landingCanvas  = document.getElementById('landing-canvas');
  const genCanvas      = document.getElementById('gen-canvas');

  const quiz     = new Quiz();
  const renderer = new AnimationRenderer(animCanvas);
  const genAnim  = new GenAnimation(genCanvas);

  // ── Landing background ──
  let landingCtx, landingAnimId, landingParticles = [];

  function initLandingAnimation() {
    landingCtx = landingCanvas.getContext('2d');
    const rect = landingCanvas.getBoundingClientRect();
    landingCanvas.width = rect.width * window.devicePixelRatio;
    landingCanvas.height = rect.height * window.devicePixelRatio;
    landingCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width, h = rect.height;
    landingParticles = [];
    const colors = ['#e85d26', '#3d5a80', '#c2748b', '#f4a261', '#3a7d44'];
    for (let i = 0; i < 40; i++) {
      landingParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.1 + Math.random() * 0.2
      });
    }

    let time = 0;
    function draw() {
      time += 0.01;
      landingCtx.fillStyle = '#0a0a0a';
      landingCtx.globalAlpha = 0.06;
      landingCtx.fillRect(0, 0, w, h);
      landingCtx.globalAlpha = 1;

      // Flowing gestural lines
      landingCtx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        landingCtx.beginPath();
        landingCtx.strokeStyle = colors[i];
        landingCtx.lineWidth = 1;
        landingCtx.globalAlpha = 0.08;
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const r = w * 0.15 + Math.sin(a * 3 + time + i) * w * 0.1;
          const px = w * 0.5 + Math.cos(a + time * 0.2 + i * 0.5) * r;
          const py = h * 0.5 + Math.sin(a + time * 0.2 + i * 0.5) * r * 0.6;
          if (a === 0) landingCtx.moveTo(px, py);
          else landingCtx.lineTo(px, py);
        }
        landingCtx.stroke();
      }

      // Particles
      for (const p of landingParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        landingCtx.globalAlpha = p.alpha;
        landingCtx.fillStyle = p.color;
        landingCtx.beginPath();
        landingCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        landingCtx.fill();
      }
      landingCtx.globalAlpha = 1;

      landingAnimId = requestAnimationFrame(draw);
    }
    draw();
  }

  // ── Screen management ──
  function showScreen(name) {
    for (const [key, el] of Object.entries(screens)) {
      el.classList.toggle('active', key === name);
    }
  }

  // ── Render question ──
  function renderQuestion() {
    const q = quiz.getQuestion();
    const num = quiz.currentQuestion + 1;
    const total = quiz.totalQuestions;

    progressFill.style.width = `${quiz.progress * 100}%`;
    quizCounter.textContent = `${String(num).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    questionText.textContent = q.text;

    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => handleAnswer(i));
      optionsEl.appendChild(btn);
    });

    // Re-trigger animation
    const body = document.querySelector('.quiz-body');
    body.style.animation = 'none';
    body.offsetHeight;
    body.style.animation = '';
  }

  function handleAnswer(index) {
    const done = quiz.answer(index);
    if (done) {
      showGenerating();
    } else {
      renderQuestion();
    }
  }

  function showGenerating() {
    showScreen('generating');
    genAnim.start();
    setTimeout(() => {
      genAnim.stop();
      showResult();
    }, 2500);
  }

  function showResult() {
    const result = quiz.getResult();
    const arch = result.archetype;

    resultTitle.textContent = arch.name;
    resultDesc.textContent = arch.description;

    resultTraits.innerHTML = '';
    arch.traitTags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'trait-tag';
      span.textContent = tag;
      resultTraits.appendChild(span);
    });

    showScreen('result');
    requestAnimationFrame(() => {
      renderer.start(result);
    });
  }

  // ── Events ──
  startBtn.addEventListener('click', () => {
    if (landingAnimId) cancelAnimationFrame(landingAnimId);
    quiz.reset();
    showScreen('quiz');
    renderQuestion();
  });

  restartBtn.addEventListener('click', () => {
    renderer.stop();
    quiz.reset();
    showScreen('landing');
    initLandingAnimation();
  });

  window.addEventListener('resize', () => {
    if (screens.landing.classList.contains('active')) {
      if (landingAnimId) cancelAnimationFrame(landingAnimId);
      initLandingAnimation();
    }
  });

  // ── Init ──
  initLandingAnimation();
})();
