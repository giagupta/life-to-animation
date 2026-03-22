/**
 * App controller — quiz flow, screen transitions, Gemini image generation.
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
  const aiImage        = document.getElementById('ai-image');
  const landingCanvas  = document.getElementById('landing-canvas');
  const genCanvas      = document.getElementById('gen-canvas');
  const apiKeyInput    = document.getElementById('api-key-input');

  const quiz     = new Quiz();
  const renderer = new AnimationRenderer(animCanvas);
  const genAnim  = new GenAnimation(genCanvas);

  // ── Gemini Image Generation ──
  const IMAGE_PROMPTS = {
    'cozy-room': 'A dreamy, atmospheric illustration of a person curled up reading in a cozy armchair surrounded by stacked books and warm amber light. Soft blankets, a steaming cup of tea, a cat sleeping nearby. Style: expressive gestural art, flowing ink lines, warm color palette with burnt orange and deep browns, dark moody background, mixed media collage feeling. Abstract and artistic, not photorealistic.',
    'studio': 'An expressive illustration of a wild creative artist in a chaotic paint studio. Paint splatters everywhere, half-finished canvases, brushes and ink. Style: bold gestural strokes, abstract expressionism, vibrant colors splashing against dark background, energetic and spontaneous, mixed media collage aesthetic. Raw and artistic.',
    'nature-path': 'A serene, atmospheric illustration of a solitary figure walking along a quiet winding path through wildflower meadows at golden hour. Birds in the distance, rolling hills. Style: gentle flowing ink lines, organic textures, earthy greens and soft golds, watercolor bleed effects, dark atmospheric background. Contemplative and peaceful.',
    'gathering': 'A warm illustration of a group of friends gathered together on a rooftop at night with fairy lights and candles. Intimate conversation, laughter, connected energy. Style: expressive gestural art, warm sunset colors against dark night sky, flowing lines connecting the figures, mixed media collage feeling. Radiant and social.',
    'night-room': 'An atmospheric illustration of a solitary thinker sitting at a desk by a large window at 2am, moonlight streaming in. Stars visible, notebooks and scattered papers. Style: deep midnight blues and silvers, contemplative mood, gestural ink lines, constellation-like patterns, dark and mysterious. Philosophical and introspective.'
  };

  async function generateAIImage(archetype) {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return null;

    const prompt = IMAGE_PROMPTS[archetype.scene] || IMAGE_PROMPTS['cozy-room'];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `Generate an image: ${prompt}` }]
            }],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE']
            }
          })
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn('Gemini API error:', err);
        return null;
      }

      const data = await response.json();
      // Extract inline image data from Gemini response
      const candidates = data.candidates;
      if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (err) {
      console.warn('Image generation failed:', err);
      return null;
    }
  }

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

  // ── Generating ──
  let pendingImagePromise = null;

  function showGenerating() {
    showScreen('generating');
    genAnim.start();

    const result = quiz.getResult();

    // Start image generation immediately
    pendingImagePromise = generateAIImage(result.archetype);

    // Wait for either image generation or a minimum delay
    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    Promise.all([pendingImagePromise, minDelay]).then(([imageUrl]) => {
      genAnim.stop();
      showResult(result, imageUrl);
    });
  }

  function showResult(result, aiImageUrl) {
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

    // Show AI image or fall back to canvas animation
    if (aiImageUrl) {
      aiImage.src = aiImageUrl;
      aiImage.style.display = 'block';
      animCanvas.style.display = 'none';
      renderer.stop();
    } else {
      aiImage.style.display = 'none';
      animCanvas.style.display = 'block';
      requestAnimationFrame(() => {
        renderer.start(result);
      });
    }

    showScreen('result');
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
    aiImage.style.display = 'none';
    animCanvas.style.display = 'block';
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

  // Persist API key in sessionStorage
  const savedKey = sessionStorage.getItem('gemini-api-key');
  if (savedKey) apiKeyInput.value = savedKey;
  apiKeyInput.addEventListener('input', () => {
    sessionStorage.setItem('gemini-api-key', apiKeyInput.value);
  });

  // ── Init ──
  initLandingAnimation();
})();
