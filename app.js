/**
 * App controller — quiz flow, screen transitions, OpenAI image generation.
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
  const aiSequence     = document.getElementById('ai-sequence');
  const aiFrames       = aiSequence.querySelectorAll('.ai-frame');
  const landingCanvas  = document.getElementById('landing-canvas');
  const genCanvas      = document.getElementById('gen-canvas');
  const apiKeyInput    = document.getElementById('api-key-input');

  const quiz     = new Quiz();
  const renderer = new AnimationRenderer(animCanvas);
  const genAnim  = new GenAnimation(genCanvas);

  // ── OpenAI Image Generation (DALL-E 3) — 3-stage progression ──
  const SCENE_STAGES = {
    'cozy-room': [
      'A quiet, atmospheric illustration of an empty cozy armchair with stacked books and a steaming cup of tea. No person yet — just the warm space waiting. A cat sleeps nearby. Style: expressive gestural art, flowing ink lines, warm burnt orange and deep brown palette, dark moody background, mixed media collage. Abstract, not photorealistic.',
      'A dreamy illustration of a person settling into a cozy armchair, reaching for a book. Warm amber light beginning to glow brighter. Blankets unfolding, tea steam curling upward. Style: expressive gestural art, flowing ink lines, warm palette with golden highlights emerging, dark background, mixed media collage. Slightly more movement and energy than before.',
      'A fully alive, luminous illustration of a person deeply absorbed in reading, surrounded by floating pages and swirling warm light. The cat stretches awake, tea steam dances in spirals, golden particles drift through the air. Style: expressive gestural art, dynamic flowing ink lines, radiant warm palette, dark background with glowing embers, mixed media collage bursting with life.'
    ],
    'studio': [
      'An illustration of a quiet, empty paint studio. Brushes standing in jars, blank canvases leaning against walls, tubes of paint neatly arranged. Still and waiting. Style: bold gestural strokes, muted colors against dark background, abstract expressionism, mixed media collage aesthetic. Calm before creation.',
      'An expressive illustration of an artist picking up brushes, first splatters of paint hitting canvas. Color beginning to explode from the center. Style: bold gestural strokes, colors starting to splash and run, abstract expressionism, vibrant energy building against dark background, mixed media collage. The moment of ignition.',
      'A wildly expressive illustration of a creative artist fully unleashed — paint flying everywhere, canvases covered in brilliant color, ink splashing, the whole studio alive with chaotic creative energy. Style: maximum gestural strokes, abstract expressionism, vibrant colors exploding against dark background, mixed media collage. Pure creative frenzy.'
    ],
    'nature-path': [
      'A serene illustration of a quiet winding path through wildflower meadows at dawn. No figure yet — just the empty path, still air, soft mist. Style: gentle flowing ink lines, organic textures, muted earthy greens and pale golds, watercolor bleed effects, dark atmospheric background. Stillness before the walk.',
      'An atmospheric illustration of a solitary figure beginning to walk along the path. Wildflowers gently swaying, a few birds lifting off. Golden hour light starting to break through. Style: gentle flowing ink lines, organic textures, earthy greens and warming golds, watercolor bleed effects, dark atmospheric background. Gentle awakening.',
      'A luminous illustration of a figure mid-stride on the path, wildflowers blooming and bending in a gentle breeze, birds soaring across a golden sky, light pouring through everything. The landscape feels alive and breathing. Style: flowing ink lines with dynamic movement, rich earthy greens and radiant golds, watercolor bleeds spreading outward, atmospheric depth. Nature fully alive.'
    ],
    'gathering': [
      'An illustration of an empty rooftop at night — fairy lights strung but dim, empty chairs arranged in a circle, candles unlit. The city glows below. Anticipation. Style: expressive gestural art, cool muted colors against dark night sky, mixed media collage. Quiet potential.',
      'A warm illustration of friends beginning to arrive on the rooftop. First conversations starting, someone lighting candles, fairy lights warming up. Style: expressive gestural art, warm colors starting to glow against dark night sky, flowing lines beginning to connect figures, mixed media collage. Energy building.',
      'A radiant illustration of friends fully gathered on a rooftop, deep in laughter and conversation, fairy lights blazing, candles flickering, warm energy connecting everyone. The night sky seems to pulse with their joy. Style: expressive gestural art, rich sunset colors radiating against night sky, dynamic flowing lines weaving between figures, mixed media collage bursting with warmth and connection.'
    ],
    'night-room': [
      'An atmospheric illustration of an empty desk by a large window at 2am. Moonlight falls on blank notebooks and a still pen. Stars visible outside. The chair is empty. Style: deep midnight blues and silvers, still and contemplative, gestural ink lines, dark and mysterious. Waiting for thought.',
      'An illustration of a figure sitting down at the desk, pen touching paper. First ideas forming — faint constellation-like patterns beginning to emerge from the notebooks. Moonlight brightening. Style: deep midnight blues and silvers with faint luminous traces, contemplative mood, gestural ink lines, constellation patterns starting to form. Thought awakening.',
      'A luminous illustration of a thinker fully immersed at the desk, surrounded by swirling constellations of ideas, notebooks covered in brilliant sketches, the moonlight now blazing with creative intensity. Stars seem to pour through the window. Style: deep midnight blues and radiant silvers, dynamic gestural ink lines, constellation patterns exploding across the scene. Mind fully alive.'
    ]
  };

  const MAX_RETRIES = 3;

  async function tryGenerateWithRetry(prompt, apiKey) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        })
      });

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt + 1) * 1000;
        console.warn(`Rate limited (429), retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn('OpenAI API error:', err);
        return null;
      }

      const data = await response.json();
      if (data.data && data.data[0] && data.data[0].url) {
        return data.data[0].url;
      }
      return null;
    }
    return null;
  }

  async function generateAISequence(archetype) {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return [];

    const stages = SCENE_STAGES[archetype.scene] || SCENE_STAGES['cozy-room'];

    try {
      // Fire all 3 in parallel
      const results = await Promise.all(
        stages.map(prompt => tryGenerateWithRetry(prompt, apiKey))
      );
      return results.filter(Boolean);
    } catch (err) {
      console.warn('Image sequence generation failed:', err);
      return [];
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
  let pendingSequencePromise = null;
  let crossfadeInterval = null;

  function showGenerating() {
    showScreen('generating');
    genAnim.start();

    const result = quiz.getResult();

    // Start all 3 image generations in parallel
    pendingSequencePromise = generateAISequence(result.archetype);

    // Wait for generation + minimum delay
    const minDelay = new Promise(resolve => setTimeout(resolve, 2500));

    Promise.all([pendingSequencePromise, minDelay]).then(([imageUrls]) => {
      genAnim.stop();
      showResult(result, imageUrls);
    });
  }

  function startCrossfade(urls) {
    if (crossfadeInterval) clearInterval(crossfadeInterval);

    let current = 0;
    aiFrames.forEach((frame, i) => {
      frame.src = urls[i] || '';
      frame.style.display = urls[i] ? 'block' : 'none';
      frame.classList.toggle('active', i === 0);
    });
    aiSequence.style.display = 'block';

    if (urls.length <= 1) return;

    crossfadeInterval = setInterval(() => {
      const prev = current;
      current = (current + 1) % urls.length;
      aiFrames[prev].classList.remove('active');
      aiFrames[current].classList.add('active');
    }, 4000);
  }

  function stopCrossfade() {
    if (crossfadeInterval) {
      clearInterval(crossfadeInterval);
      crossfadeInterval = null;
    }
    aiFrames.forEach(f => { f.classList.remove('active'); f.style.display = 'none'; });
    aiSequence.style.display = 'none';
  }

  function showResult(result, imageUrls) {
    const arch = result.archetype;

    resultTitle.textContent = arch.name;
    resultTitle.setAttribute('data-text', arch.name);
    resultDesc.textContent = arch.description;

    resultTraits.innerHTML = '';
    arch.traitTags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'trait-tag';
      span.textContent = tag;
      resultTraits.appendChild(span);
    });

    // Show crossfading AI sequence with canvas overlay, or canvas-only fallback
    if (imageUrls && imageUrls.length > 0) {
      startCrossfade(imageUrls);
      animCanvas.style.display = 'block';
      requestAnimationFrame(() => {
        renderer.start(result, true);
      });
    } else {
      stopCrossfade();
      animCanvas.style.display = 'block';
      requestAnimationFrame(() => {
        renderer.start(result, false);
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
    stopCrossfade();
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
  const savedKey = sessionStorage.getItem('openai-api-key');
  if (savedKey) apiKeyInput.value = savedKey;
  apiKeyInput.addEventListener('input', () => {
    sessionStorage.setItem('openai-api-key', apiKeyInput.value);
  });

  // ── Init ──
  initLandingAnimation();
})();
