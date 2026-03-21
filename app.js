/**
 * Main app controller — wires up quiz flow, screen transitions, and animations.
 */

(function () {
  // ── Elements ──
  const screens = {
    landing:    document.getElementById('landing'),
    quiz:       document.getElementById('quiz'),
    generating: document.getElementById('generating'),
    result:     document.getElementById('result')
  };

  const startBtn       = document.getElementById('start-btn');
  const restartBtn     = document.getElementById('restart-btn');
  const progressFill   = document.getElementById('progress-fill');
  const questionNumber = document.getElementById('question-number');
  const questionText   = document.getElementById('question-text');
  const optionsEl      = document.getElementById('options');
  const resultTitle    = document.getElementById('result-title');
  const resultDesc     = document.getElementById('result-description');
  const resultTraits   = document.getElementById('result-traits');
  const animCanvas     = document.getElementById('animation-canvas');
  const landingCanvas  = document.getElementById('landing-canvas');

  const quiz     = new Quiz();
  const renderer = new AnimationRenderer(animCanvas);

  // ── Landing background animation ──
  let landingCtx, landingAnim, landingDots = [];

  function initLandingAnimation() {
    landingCtx = landingCanvas.getContext('2d');
    const rect = landingCanvas.getBoundingClientRect();
    landingCanvas.width = rect.width * window.devicePixelRatio;
    landingCanvas.height = rect.height * window.devicePixelRatio;
    landingCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const w = rect.width, h = rect.height;
    landingDots = [];
    for (let i = 0; i < 30; i++) {
      landingDots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 3 + Math.random() * 8,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        color: ['#e85d26', '#c0392b', '#3a7d44', '#3d5a80', '#c2748b'][Math.floor(Math.random() * 5)],
        alpha: 0.15 + Math.random() * 0.15
      });
    }

    function drawLanding() {
      landingCtx.clearRect(0, 0, w, h);
      for (const d of landingDots) {
        d.x += d.dx; d.y += d.dy;
        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;

        landingCtx.globalAlpha = d.alpha;
        landingCtx.fillStyle = d.color;
        landingCtx.beginPath();
        landingCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        landingCtx.fill();
      }
      landingCtx.globalAlpha = 1;
      landingAnim = requestAnimationFrame(drawLanding);
    }
    drawLanding();
  }

  // ── Screen management ──
  function showScreen(name) {
    for (const [key, el] of Object.entries(screens)) {
      el.classList.toggle('active', key === name);
    }
  }

  // ── Render a question ──
  function renderQuestion() {
    const q = quiz.getQuestion();
    const num = quiz.currentQuestion + 1;
    const total = quiz.totalQuestions;

    progressFill.style.width = `${quiz.progress * 100}%`;
    questionNumber.textContent = `Question ${num} of ${total}`;
    questionText.textContent = q.text;

    optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => handleAnswer(i));
      optionsEl.appendChild(btn);
    });

    // Re-trigger card animation
    const card = document.getElementById('question-card');
    card.style.animation = 'none';
    card.offsetHeight; // force reflow
    card.style.animation = '';
  }

  function handleAnswer(index) {
    const done = quiz.answer(index);
    if (done) {
      showGenerating();
    } else {
      renderQuestion();
    }
  }

  // ── Generating screen ──
  function showGenerating() {
    showScreen('generating');
    // Simulate a brief "painting" delay for dramatic effect
    setTimeout(() => {
      showResult();
    }, 2200);
  }

  // ── Result screen ──
  function showResult() {
    const result = quiz.getResult();
    const arch = result.archetype;

    resultTitle.textContent = arch.name;
    resultDesc.textContent = arch.description;

    // Trait tags
    const tagColors = ['orange', 'red', 'green', 'blue', 'pink'];
    resultTraits.innerHTML = '';
    arch.traitTags.forEach((tag, i) => {
      const span = document.createElement('span');
      span.className = `trait-tag ${tagColors[i % tagColors.length]}`;
      span.textContent = tag;
      resultTraits.appendChild(span);
    });

    showScreen('result');

    // Start animation after screen is visible
    requestAnimationFrame(() => {
      renderer.start(result);
    });
  }

  // ── Events ──
  startBtn.addEventListener('click', () => {
    if (landingAnim) cancelAnimationFrame(landingAnim);
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

  // Handle canvas resize
  window.addEventListener('resize', () => {
    if (screens.landing.classList.contains('active')) {
      if (landingAnim) cancelAnimationFrame(landingAnim);
      initLandingAnimation();
    }
  });

  // ── Init ──
  initLandingAnimation();
})();
