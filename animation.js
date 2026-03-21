/**
 * Expressive, gestural canvas animations for each personality archetype.
 * Inspired by: flowing ink lines, silhouettes, abstract expressionism, mixed-media art.
 */

const PALETTES = {
  warm:     { bg: '#0f0a06', colors: ['#e85d26', '#f4a261', '#d4883a', '#c0392b', '#fff3e0'], glow: '#e85d26' },
  bold:     { bg: '#0a0612', colors: ['#e85d26', '#ff3366', '#6c3483', '#00d4ff', '#f39c12'], glow: '#ff3366' },
  earthy:   { bg: '#060a06', colors: ['#3a7d44', '#8bc34a', '#6b8e4e', '#a67c52', '#d4e157'], glow: '#3a7d44' },
  sunset:   { bg: '#0f0806', colors: ['#e85d26', '#ff6b6b', '#feca57', '#c2748b', '#ff9ff3'], glow: '#ff6b6b' },
  midnight: { bg: '#060810', colors: ['#3d5a80', '#7b8fb2', '#98c1d9', '#e0fbfc', '#293241'], glow: '#3d5a80' }
};

class AnimationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
    this.time = 0;
    this.strokes = [];
    this.silhouettePaths = [];
    this.flowField = [];
  }

  start(result) {
    this.stop();
    this.time = 0;

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.w = rect.width;
    this.h = rect.height;

    const palette = PALETTES[result.archetype.palette] || PALETTES.warm;
    this.palette = palette;
    this.scene = result.archetype.scene;
    this.traits = result.traits;

    this._initScene();
    this._loop();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _loop() {
    this.time += 0.012;
    this._draw();
    this.animationId = requestAnimationFrame(() => this._loop());
  }

  _initScene() {
    this.strokes = [];
    this.flowParticles = [];

    // Create flowing ink strokes
    const count = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      this.strokes.push({
        points: this._generateCurve(),
        color: this.palette.colors[i % this.palette.colors.length],
        width: 1 + Math.random() * 4,
        speed: 0.3 + Math.random() * 0.7,
        offset: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.5,
        dash: Math.random() > 0.7
      });
    }

    // Flow field particles
    for (let i = 0; i < 80; i++) {
      this.flowParticles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: 0, vy: 0,
        life: Math.random(),
        maxLife: 0.5 + Math.random() * 0.5,
        color: this.palette.colors[Math.floor(Math.random() * this.palette.colors.length)],
        size: 1 + Math.random() * 3
      });
    }
  }

  _generateCurve() {
    const points = [];
    const segments = 5 + Math.floor(Math.random() * 5);
    let x = Math.random() * this.w;
    let y = Math.random() * this.h;
    for (let i = 0; i < segments; i++) {
      points.push({ x, y });
      x += (Math.random() - 0.5) * this.w * 0.5;
      y += (Math.random() - 0.5) * this.h * 0.5;
    }
    return points;
  }

  _draw() {
    const { ctx, w, h } = this;

    // Fade trail
    ctx.fillStyle = this.palette.bg;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    switch (this.scene) {
      case 'cozy-room':   this._drawCozyDreamer(); break;
      case 'studio':      this._drawWildCreative(); break;
      case 'nature-path': this._drawGentleWanderer(); break;
      case 'gathering':   this._drawWarmConnector(); break;
      case 'night-room':  this._drawMidnightThinker(); break;
      default:            this._drawCozyDreamer(); break;
    }
  }

  // ─── Cozy Dreamer: Slow floating orbs, gentle curves, warm glow ──
  _drawCozyDreamer() {
    const { ctx, w, h, time, palette } = this;

    // Warm central glow
    const glow = ctx.createRadialGradient(w * 0.4, h * 0.5, 0, w * 0.4, h * 0.5, w * 0.5);
    glow.addColorStop(0, 'rgba(232, 93, 38, 0.06)');
    glow.addColorStop(1, 'rgba(232, 93, 38, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Slow breathing circles
    for (let i = 0; i < 8; i++) {
      const cx = w * (0.2 + (i * 0.09));
      const cy = h * 0.5 + Math.sin(time * 0.5 + i * 0.8) * h * 0.2;
      const r = 20 + Math.sin(time * 0.3 + i) * 10;
      const alpha = 0.15 + Math.sin(time * 0.4 + i * 0.5) * 0.1;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[i % palette.colors.length];
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Gentle flowing curves — like yarn or blanket folds
    ctx.lineCap = 'round';
    for (const stroke of this.strokes) {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.globalAlpha = stroke.opacity * 0.6;

      const pts = stroke.points;
      const t = time * stroke.speed + stroke.offset;
      ctx.moveTo(
        pts[0].x + Math.sin(t) * 20,
        pts[0].y + Math.cos(t * 0.7) * 15
      );
      for (let i = 1; i < pts.length; i++) {
        const px = pts[i].x + Math.sin(t + i) * 25;
        const py = pts[i].y + Math.cos(t * 0.6 + i) * 20;
        const cpx = (pts[i - 1].x + px) / 2 + Math.sin(t + i * 2) * 30;
        const cpy = (pts[i - 1].y + py) / 2 + Math.cos(t + i * 2) * 20;
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Silhouette: curled figure
    this._drawCurledSilhouette(w * 0.5, h * 0.55, time);

    // Floating dust motes
    this._drawFlowParticles();
  }

  // ─── Wild Creative: Explosive gestural strokes, paint splatters ──
  _drawWildCreative() {
    const { ctx, w, h, time, palette } = this;

    // Energy burst center
    const burst = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, w * 0.6);
    burst.addColorStop(0, 'rgba(255, 51, 102, 0.04)');
    burst.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = burst;
    ctx.fillRect(0, 0, w, h);

    // Wild gestural strokes — fast, expressive
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of this.strokes) {
      const t = time * stroke.speed * 1.5 + stroke.offset;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 1.5;
      ctx.globalAlpha = stroke.opacity * 0.7;

      if (stroke.dash) {
        ctx.setLineDash([8, 12]);
      }

      const pts = stroke.points;
      const ox = Math.sin(t * 2) * 40;
      const oy = Math.cos(t * 1.5) * 30;
      ctx.moveTo(pts[0].x + ox, pts[0].y + oy);
      for (let i = 1; i < pts.length; i++) {
        const px = pts[i].x + Math.sin(t * 2 + i * 3) * 50;
        const py = pts[i].y + Math.cos(t * 1.8 + i * 2) * 40;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;

    // Paint splatters
    for (let i = 0; i < 12; i++) {
      const sx = w * (0.1 + Math.sin(i * 2.3 + time * 0.3) * 0.4 + 0.4);
      const sy = h * (0.1 + Math.cos(i * 1.7 + time * 0.2) * 0.4 + 0.4);
      const r = 3 + Math.sin(time * 2 + i) * 4;
      ctx.fillStyle = palette.colors[i % palette.colors.length];
      ctx.globalAlpha = 0.4 + Math.sin(time + i) * 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.abs(r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Dancing silhouette
    this._drawDancingSilhouette(w * 0.5, h * 0.5, time);

    this._drawFlowParticles();
  }

  // ─── Gentle Wanderer: Organic flow, nature lines, drifting ──
  _drawGentleWanderer() {
    const { ctx, w, h, time, palette } = this;

    // Soft horizon gradient glow
    const horizon = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.7);
    horizon.addColorStop(0, 'rgba(58, 125, 68, 0.03)');
    horizon.addColorStop(0.5, 'rgba(58, 125, 68, 0.06)');
    horizon.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = horizon;
    ctx.fillRect(0, 0, w, h);

    // Organic flowing lines — like grass or wind
    ctx.lineCap = 'round';
    for (let i = 0; i < 30; i++) {
      const baseX = (i / 30) * w;
      const baseY = h * 0.6;
      const t = time * 0.8 + i * 0.3;

      ctx.beginPath();
      ctx.strokeStyle = palette.colors[i % palette.colors.length];
      ctx.lineWidth = 1 + Math.sin(i) * 0.5;
      ctx.globalAlpha = 0.2 + Math.sin(t) * 0.1;

      ctx.moveTo(baseX, baseY);
      const swayX = Math.sin(t) * 30;
      const swayY = -40 - Math.sin(t * 0.5 + i) * 30;
      ctx.quadraticCurveTo(
        baseX + swayX * 0.5, baseY + swayY * 0.5,
        baseX + swayX, baseY + swayY
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Gentle flowing curves
    for (const stroke of this.strokes) {
      const t = time * stroke.speed * 0.5 + stroke.offset;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 0.8;
      ctx.globalAlpha = stroke.opacity * 0.4;

      const pts = stroke.points;
      ctx.moveTo(
        pts[0].x + Math.sin(t) * 15,
        pts[0].y + Math.cos(t * 0.6) * 10
      );
      for (let i = 1; i < pts.length; i++) {
        const px = pts[i].x + Math.sin(t + i * 0.7) * 15;
        const py = pts[i].y + Math.cos(t * 0.5 + i * 0.7) * 12;
        const cpx = (pts[i - 1].x + px) / 2;
        const cpy = (pts[i - 1].y + py) / 2 + Math.sin(t + i) * 15;
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Walking figure silhouette
    this._drawWalkingSilhouette(w * 0.45, h * 0.48, time);

    // Birds in the distance
    for (let i = 0; i < 5; i++) {
      const bx = w * (0.3 + i * 0.1) + Math.sin(time * 0.5 + i) * 20;
      const by = h * 0.2 + Math.sin(time * 0.3 + i * 2) * 15;
      this._drawBird(bx, by, 8, time + i, palette.colors[2]);
    }

    this._drawFlowParticles();
  }

  // ─── Warm Connector: Radiating connections, linked nodes ──
  _drawWarmConnector() {
    const { ctx, w, h, time, palette } = this;

    // Warm center glow
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.4);
    glow.addColorStop(0, 'rgba(232, 93, 38, 0.05)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Connected node network
    const nodes = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.15;
      const radius = w * 0.2 + Math.sin(time * 0.3 + i * 0.5) * w * 0.08;
      nodes.push({
        x: w * 0.5 + Math.cos(angle) * radius,
        y: h * 0.5 + Math.sin(angle) * radius * 0.7,
        color: palette.colors[i % palette.colors.length]
      });
    }

    // Draw connections
    ctx.lineCap = 'round';
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < w * 0.3) {
          ctx.beginPath();
          ctx.strokeStyle = nodes[i].color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.1 * (1 - dist / (w * 0.3));
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const pulse = 4 + Math.sin(time * 2) * 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.6;
      ctx.fill();

      // Glow ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulse + 6, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Flowing strokes
    for (const stroke of this.strokes) {
      const t = time * stroke.speed + stroke.offset;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 0.7;
      ctx.globalAlpha = stroke.opacity * 0.3;

      const pts = stroke.points;
      ctx.moveTo(pts[0].x + Math.sin(t) * 15, pts[0].y + Math.cos(t) * 10);
      for (let i = 1; i < pts.length; i++) {
        const px = pts[i].x + Math.sin(t + i) * 20;
        const py = pts[i].y + Math.cos(t + i) * 15;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Group silhouette
    this._drawGroupSilhouette(w * 0.5, h * 0.55, time);

    this._drawFlowParticles();
  }

  // ─── Midnight Thinker: Stars, constellations, thought streams ──
  _drawMidnightThinker() {
    const { ctx, w, h, time, palette } = this;

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (i * 67 + 13) % w;
      const sy = (i * 43 + 7) % h;
      const twinkle = 0.2 + Math.sin(time * 1.5 + i * 0.9) * 0.3;
      const size = 1 + Math.sin(i * 0.3) * 0.5;
      ctx.fillStyle = palette.colors[i % palette.colors.length];
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Constellation lines
    const constellationNodes = [];
    for (let i = 0; i < 8; i++) {
      constellationNodes.push({
        x: w * (0.25 + Math.sin(i * 1.2) * 0.25),
        y: h * (0.2 + Math.cos(i * 1.7) * 0.2)
      });
    }
    ctx.strokeStyle = palette.colors[2];
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15 + Math.sin(time * 0.5) * 0.05;
    ctx.beginPath();
    for (let i = 0; i < constellationNodes.length; i++) {
      const n = constellationNodes[i];
      if (i === 0) ctx.moveTo(n.x, n.y);
      else ctx.lineTo(n.x, n.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Thought streams — spiraling lines
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.strokeStyle = palette.colors[i % palette.colors.length];
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      const cx = w * 0.55 + i * 10;
      const cy = h * 0.35;
      for (let a = 0; a < Math.PI * 4; a += 0.1) {
        const r = a * 5 + Math.sin(time + i) * 5;
        const px = cx + Math.cos(a + time * 0.3 + i) * r;
        const py = cy + Math.sin(a + time * 0.3 + i) * r * 0.6;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Flowing strokes
    for (const stroke of this.strokes) {
      const t = time * stroke.speed * 0.4 + stroke.offset;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * 0.5;
      ctx.globalAlpha = stroke.opacity * 0.25;

      const pts = stroke.points;
      ctx.moveTo(pts[0].x + Math.sin(t) * 10, pts[0].y + Math.cos(t) * 8);
      for (let j = 1; j < pts.length; j++) {
        const px = pts[j].x + Math.sin(t + j) * 12;
        const py = pts[j].y + Math.cos(t * 0.7 + j) * 10;
        const cpx = (pts[j - 1].x + px) / 2;
        const cpy = (pts[j - 1].y + py) / 2;
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Seated thinking silhouette
    this._drawThinkingSilhouette(w * 0.35, h * 0.6, time);

    this._drawFlowParticles();
  }

  // ─── Silhouettes ──────────────────────────────────────

  _drawCurledSilhouette(x, y, t) {
    const { ctx } = this;
    const breathe = Math.sin(t * 0.8) * 3;
    ctx.fillStyle = this.palette.colors[0];
    ctx.globalAlpha = 0.7;
    ctx.save();
    ctx.translate(x, y);

    // Curled up figure — abstract organic shape
    ctx.beginPath();
    ctx.moveTo(-30, 10 + breathe);
    ctx.bezierCurveTo(-35, -15 + breathe, -15, -35 + breathe, 5, -30 + breathe);
    ctx.bezierCurveTo(25, -25 + breathe, 30, -10, 25, 10);
    ctx.bezierCurveTo(20, 25, 0, 30, -15, 25);
    ctx.bezierCurveTo(-25, 20, -28, 15, -30, 10 + breathe);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(-5, -28 + breathe, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _drawDancingSilhouette(x, y, t) {
    const { ctx } = this;
    ctx.fillStyle = this.palette.colors[1];
    ctx.globalAlpha = 0.75;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 1.2) * 0.1);

    const legSwing = Math.sin(t * 2) * 15;
    const armSwing = Math.sin(t * 2 + 0.5) * 25;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.bezierCurveTo(-15, -20, -10, 10, -5 + legSwing, 50);
    ctx.lineTo(5 - legSwing, 50);
    ctx.bezierCurveTo(10, 10, 15, -20, 0, -40);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -52, 14, 0, Math.PI * 2);
    ctx.fill();

    // Arms — gestural lines
    ctx.strokeStyle = this.palette.colors[1];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, -25);
    ctx.quadraticCurveTo(-30 - armSwing, -40, -45 - armSwing, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -25);
    ctx.quadraticCurveTo(30 + armSwing, -45, 50 + armSwing, -30);
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _drawWalkingSilhouette(x, y, t) {
    const { ctx } = this;
    ctx.fillStyle = this.palette.colors[0];
    ctx.globalAlpha = 0.6;
    ctx.save();
    ctx.translate(x, y);

    const stride = Math.sin(t * 1.5) * 12;
    const bob = Math.abs(Math.sin(t * 1.5)) * 3;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -35 - bob);
    ctx.bezierCurveTo(-10, -15, -8, 15, stride, 45);
    ctx.lineTo(-stride, 45);
    ctx.bezierCurveTo(8, 15, 10, -15, 0, -35 - bob);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -48 - bob, 13, 0, Math.PI * 2);
    ctx.fill();

    // Legs as simple strokes
    ctx.strokeStyle = this.palette.colors[0];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, 20);
    ctx.lineTo(stride, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, 20);
    ctx.lineTo(-stride, 50);
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _drawGroupSilhouette(x, y, t) {
    const { ctx, palette } = this;
    ctx.globalAlpha = 0.6;
    const positions = [
      { dx: -50, dy: 0 }, { dx: -20, dy: -10 }, { dx: 15, dy: 5 },
      { dx: 45, dy: -5 }, { dx: -35, dy: 15 }
    ];
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const bob = Math.sin(t * 1.2 + i * 1.3) * 4;
      ctx.fillStyle = palette.colors[i % palette.colors.length];
      ctx.save();
      ctx.translate(x + p.dx, y + p.dy + bob);

      // Simple abstract person shape
      ctx.beginPath();
      ctx.arc(0, -22, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.bezierCurveTo(-8, 0, -6, 15, -4, 28);
      ctx.lineTo(4, 28);
      ctx.bezierCurveTo(6, 15, 8, 0, 0, -13);
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  _drawThinkingSilhouette(x, y, t) {
    const { ctx } = this;
    ctx.fillStyle = this.palette.colors[0];
    ctx.globalAlpha = 0.6;
    ctx.save();
    ctx.translate(x, y);

    const breathe = Math.sin(t * 0.6) * 2;

    // Seated figure — hunched forward
    ctx.beginPath();
    ctx.moveTo(5, -30 + breathe);
    ctx.bezierCurveTo(-15, -20, -20, 0, -15, 20);
    ctx.lineTo(20, 20);
    ctx.bezierCurveTo(25, 0, 20, -15, 5, -30 + breathe);
    ctx.fill();

    // Head resting on hand
    ctx.beginPath();
    ctx.arc(-5, -40 + breathe, 13, 0, Math.PI * 2);
    ctx.fill();

    // Arm to chin
    ctx.strokeStyle = this.palette.colors[0];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, -30 + breathe);
    ctx.quadraticCurveTo(-25, -20, -20, -5);
    ctx.stroke();

    // Thought bubbles
    for (let i = 0; i < 4; i++) {
      const bx = 15 + i * 12;
      const by = -55 - i * 15 + Math.sin(t + i) * 5;
      const br = 3 + i * 1.5;
      ctx.fillStyle = this.palette.colors[2];
      ctx.globalAlpha = 0.2 + i * 0.05;
      ctx.beginPath();
      ctx.arc(bx, by + breathe, br, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // ─── Helpers ──────────────────────────────────────────

  _drawBird(x, y, size, t, color) {
    const ctx = this.ctx;
    const flap = Math.sin(t * 3) * 0.4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - size, y + Math.sin(flap) * size * 0.5);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * flap, x, y);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * flap, x + size, y + Math.sin(flap) * size * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  _drawFlowParticles() {
    const { ctx, w, h, time } = this;
    for (const p of this.flowParticles) {
      // Flow field movement
      const angle = Math.sin(p.x * 0.005 + time) * Math.PI + Math.cos(p.y * 0.005 + time * 0.7) * Math.PI;
      p.vx += Math.cos(angle) * 0.05;
      p.vy += Math.sin(angle) * 0.05;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ── Generating screen animation ──
class GenAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animId = null;
    this.time = 0;
  }

  start() {
    this.stop();
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.w = rect.width;
    this.h = rect.height;
    this.time = 0;
    this._loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  _loop() {
    this.time += 0.02;
    this._draw();
    this.animId = requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const { ctx, w, h, time } = this;
    ctx.fillStyle = '#0a0a0a';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    const cx = w / 2, cy = h / 2;
    const colors = ['#e85d26', '#3d5a80', '#c2748b', '#f4a261', '#3a7d44'];

    // Morphing shape
    ctx.lineCap = 'round';
    for (let ring = 0; ring < 4; ring++) {
      ctx.beginPath();
      ctx.strokeStyle = colors[ring % colors.length];
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4 - ring * 0.08;
      for (let a = 0; a < Math.PI * 2; a += 0.05) {
        const r = 25 + ring * 12 + Math.sin(a * 3 + time * 2 + ring) * 10 + Math.cos(a * 5 - time) * 5;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
