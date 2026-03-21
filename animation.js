/**
 * Canvas-based hand-drawn style animations for each personality archetype.
 * Each scene draws a unique animated illustration on the result canvas.
 */

const PALETTES = {
  warm:     { bg: '#faf3e6', colors: ['#e85d26', '#c0392b', '#d4883a', '#8b4513', '#f4a261'] },
  bold:     { bg: '#fef9f0', colors: ['#e85d26', '#c0392b', '#6c3483', '#2874a6', '#f39c12'] },
  earthy:   { bg: '#f0efe8', colors: ['#3a7d44', '#6b8e4e', '#8d6e63', '#a67c52', '#4a7c59'] },
  sunset:   { bg: '#fef5ee', colors: ['#e85d26', '#f39c12', '#c2748b', '#eb7f6a', '#d4883a'] },
  midnight: { bg: '#e8eaf0', colors: ['#3d5a80', '#293241', '#5c6b8a', '#7b8fb2', '#4a5568'] }
};

class AnimationRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationId = null;
    this.time = 0;
    this.particles = [];
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

    this._initParticles();
    this._loop();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _loop() {
    this.time += 0.016;
    this._draw();
    this.animationId = requestAnimationFrame(() => this._loop());
  }

  _initParticles() {
    this.particles = [];
    const count = 40 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: 2 + Math.random() * 6,
        speed: 0.2 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        wobble: Math.random() * Math.PI * 2,
        color: this.palette.colors[Math.floor(Math.random() * this.palette.colors.length)],
        shape: Math.random() > 0.5 ? 'circle' : 'star'
      });
    }
  }

  _draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = this.palette.bg;
    ctx.fillRect(0, 0, w, h);

    switch (this.scene) {
      case 'cozy-room':   this._drawCozyRoom(); break;
      case 'studio':      this._drawStudio(); break;
      case 'nature-path': this._drawNaturePath(); break;
      case 'gathering':   this._drawGathering(); break;
      case 'night-room':  this._drawNightRoom(); break;
      default:            this._drawCozyRoom(); break;
    }

    this._drawParticles();
  }

  // ─── Scene: Cozy Room ─────────────────────────────────
  _drawCozyRoom() {
    const { ctx, w, h, time } = this;
    const colors = this.palette.colors;

    // Floor
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Window
    const wx = w * 0.6, wy = h * 0.1, ww = w * 0.3, wh = h * 0.35;
    ctx.strokeStyle = colors[3] || '#8b4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();

    // Moon/sun glow through window
    const glow = ctx.createRadialGradient(wx + ww / 2, wy + wh / 3, 5, wx + ww / 2, wy + wh / 3, ww * 0.4);
    glow.addColorStop(0, 'rgba(244, 162, 97, 0.4)');
    glow.addColorStop(1, 'rgba(244, 162, 97, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(wx, wy, ww, wh);

    // Armchair
    this._drawWobblyRect(ctx, w * 0.08, h * 0.42, w * 0.3, h * 0.28, colors[0], time);

    // Book stack
    for (let i = 0; i < 4; i++) {
      const bw = 25 + Math.random() * 15;
      ctx.fillStyle = colors[i % colors.length];
      this._drawWobblyRect(ctx, w * 0.42 + (i % 2) * 3, h * 0.52 - i * 14, bw, 12, colors[i % colors.length], time + i);
    }

    // Steam from cup
    const cupX = w * 0.45, cupY = h * 0.52;
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.ellipse(cupX, cupY + 10, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const sx = cupX - 5 + i * 5;
      const sy = cupY - 5 - i * 12;
      ctx.strokeStyle = 'rgba(200, 180, 160, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, cupY);
      ctx.quadraticCurveTo(sx + Math.sin(time * 2 + i) * 8, sy + 5, sx + Math.sin(time * 1.5 + i) * 4, sy - 10);
      ctx.stroke();
    }

    // Cat on chair
    this._drawCat(w * 0.18, h * 0.42, colors[3] || '#5a3a1a', time);

    // Rug
    ctx.strokeStyle = colors[4] || colors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(w * 0.35, h * 0.78, w * 0.22, h * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ─── Scene: Studio ────────────────────────────────────
  _drawStudio() {
    const { ctx, w, h, time } = this;
    const colors = this.palette.colors;

    // Floor
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);

    // Easel
    const ex = w * 0.5, ey = h * 0.15;
    ctx.strokeStyle = colors[3] || '#8b4513';
    ctx.lineWidth = 3;
    // Easel legs
    ctx.beginPath(); ctx.moveTo(ex - 30, ey + 10); ctx.lineTo(ex - 50, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex + 30, ey + 10); ctx.lineTo(ex + 50, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey + 10); ctx.lineTo(ex, h * 0.72); ctx.stroke();

    // Canvas on easel
    ctx.fillStyle = '#fff';
    ctx.fillRect(ex - 55, ey, 110, h * 0.35);
    ctx.strokeStyle = colors[3] || '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex - 55, ey, 110, h * 0.35);

    // Paint splotches on canvas
    for (let i = 0; i < 5; i++) {
      const px = ex - 40 + Math.sin(i * 1.7) * 30;
      const py = ey + 20 + Math.cos(i * 2.1) * (h * 0.12);
      const radius = 8 + Math.sin(time + i) * 3;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Paint jars on floor
    for (let i = 0; i < 4; i++) {
      const jx = w * 0.15 + i * 30;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(jx, h * 0.62, 16, 22);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(jx, h * 0.62, 16, 22);
    }

    // Brushes
    for (let i = 0; i < 3; i++) {
      const bx = w * 0.75 + i * 12;
      ctx.strokeStyle = colors[3] || '#5a3a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, h * 0.55);
      ctx.lineTo(bx + Math.sin(time * 0.5 + i) * 2, h * 0.7);
      ctx.stroke();
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(bx, h * 0.54, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scattered paint drops on floor
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(w * 0.2 + i * w * 0.08, h * 0.76 + Math.sin(i) * 10, 3 + Math.sin(time + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ─── Scene: Nature Path ───────────────────────────────
  _drawNaturePath() {
    const { ctx, w, h, time } = this;
    const colors = this.palette.colors;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#d4e8f0');
    skyGrad.addColorStop(1, '#e8f0e4');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.6);

    // Rolling hills
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = colors[layer % colors.length];
      ctx.globalAlpha = 0.3 + layer * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, h * (0.45 + layer * 0.1));
      for (let x = 0; x <= w; x += 20) {
        const y = h * (0.45 + layer * 0.1) + Math.sin(x * 0.008 + layer * 2 + time * 0.2) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Ground
    ctx.fillStyle = '#c8dbb0';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Path
    ctx.strokeStyle = '#b8a88a';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h);
    ctx.quadraticCurveTo(w * 0.45, h * 0.7, w * 0.52, h * 0.5);
    ctx.quadraticCurveTo(w * 0.55, h * 0.4, w * 0.48, h * 0.3);
    ctx.stroke();

    // Trees
    this._drawTree(w * 0.15, h * 0.45, colors[0], time);
    this._drawTree(w * 0.8, h * 0.42, colors[1], time + 1);
    this._drawTree(w * 0.65, h * 0.5, colors[2] || colors[0], time + 2);

    // Wildflowers
    for (let i = 0; i < 12; i++) {
      const fx = w * 0.1 + Math.sin(i * 3.7) * w * 0.4;
      const fy = h * 0.68 + Math.cos(i * 2.3) * h * 0.1;
      const sway = Math.sin(time * 1.5 + i) * 3;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(fx + sway, fy, 3 + Math.sin(time + i) * 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(fx + sway, fy + 3);
      ctx.lineTo(fx, fy + 15);
      ctx.stroke();
    }

    // Clouds
    this._drawCloud(w * 0.2 + Math.sin(time * 0.3) * 10, h * 0.1);
    this._drawCloud(w * 0.7 + Math.sin(time * 0.2 + 1) * 10, h * 0.15);
  }

  // ─── Scene: Gathering ─────────────────────────────────
  _drawGathering() {
    const { ctx, w, h, time } = this;
    const colors = this.palette.colors;

    // Night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrad.addColorStop(0, '#1a1a2e');
    skyGrad.addColorStop(1, '#3d2c5e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Stars
    for (let i = 0; i < 20; i++) {
      const sx = (i * 47 + 13) % w;
      const sy = (i * 31 + 7) % (h * 0.45);
      const twinkle = 0.5 + Math.sin(time * 2 + i * 0.7) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 220, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rooftop/ground
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Fairy lights string
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.35);
    for (let x = w * 0.05; x <= w * 0.95; x += 10) {
      const sag = Math.sin((x / w) * Math.PI) * 30;
      ctx.lineTo(x, h * 0.35 + sag);
    }
    ctx.stroke();

    // Light bulbs
    for (let i = 0; i < 12; i++) {
      const lx = w * 0.1 + i * (w * 0.075);
      const sag = Math.sin(((lx) / w) * Math.PI) * 30;
      const ly = h * 0.35 + sag + 5;
      const flicker = 0.7 + Math.sin(time * 3 + i * 1.2) * 0.3;
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 15);
      glow.addColorStop(0, `rgba(255, 220, 100, ${flicker})`);
      glow.addColorStop(1, 'rgba(255, 220, 100, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 15, ly - 15, 30, 30);
      ctx.fillStyle = `rgba(255, 230, 150, ${flicker})`;
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stick figures sitting in a circle
    const cx = w * 0.5, cy = h * 0.65;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 60;
      const py = cy + Math.sin(angle) * 30;
      const bobble = Math.sin(time * 1.5 + i * 1.3) * 2;
      this._drawStickPerson(px, py + bobble, colors[i % colors.length]);
    }

    // Table in center
    ctx.fillStyle = '#6b4226';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ─── Scene: Night Room ────────────────────────────────
  _drawNightRoom() {
    const { ctx, w, h, time } = this;
    const colors = this.palette.colors;

    // Dark room
    const roomGrad = ctx.createLinearGradient(0, 0, 0, h);
    roomGrad.addColorStop(0, '#1a1a2e');
    roomGrad.addColorStop(1, '#293241');
    ctx.fillStyle = roomGrad;
    ctx.fillRect(0, 0, w, h);

    // Large window with night sky
    const wx = w * 0.35, wy = h * 0.05, ww = w * 0.55, wh = h * 0.55;
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(wx, wy, ww, wh);

    // Moon
    const moonX = wx + ww * 0.7, moonY = wy + wh * 0.3;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 60);
    moonGlow.addColorStop(0, 'rgba(200, 210, 240, 0.6)');
    moonGlow.addColorStop(1, 'rgba(200, 210, 240, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - 60, moonY - 60, 120, 120);
    ctx.fillStyle = '#dde4f0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
    ctx.fill();

    // Stars in window
    for (let i = 0; i < 15; i++) {
      const sx = wx + 15 + (i * 37) % (ww - 30);
      const sy = wy + 10 + (i * 23) % (wh - 20);
      const twinkle = 0.4 + Math.sin(time * 2.5 + i) * 0.4;
      ctx.fillStyle = `rgba(200, 210, 240, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Window frame
    ctx.strokeStyle = colors[1] || '#5c6b8a';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();

    // Desk
    ctx.fillStyle = '#3d3028';
    ctx.fillRect(w * 0.05, h * 0.62, w * 0.55, 8);
    // Desk legs
    ctx.fillRect(w * 0.08, h * 0.62, 6, h * 0.2);
    ctx.fillRect(w * 0.52, h * 0.62, 6, h * 0.2);

    // Lamp with glow
    const lampX = w * 0.15, lampY = h * 0.42;
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lampX, h * 0.62); ctx.lineTo(lampX, lampY); ctx.stroke();
    const lampGlow = ctx.createRadialGradient(lampX, lampY, 3, lampX, lampY + 15, 50);
    lampGlow.addColorStop(0, 'rgba(255, 210, 140, 0.5)');
    lampGlow.addColorStop(1, 'rgba(255, 210, 140, 0)');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(lampX - 50, lampY - 10, 100, 80);
    ctx.fillStyle = 'rgba(255, 220, 160, 0.9)';
    ctx.beginPath();
    ctx.arc(lampX, lampY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Open notebook on desk
    ctx.fillStyle = '#f5f0e0';
    ctx.save();
    ctx.translate(w * 0.33, h * 0.56);
    ctx.rotate(-0.05);
    ctx.fillRect(0, 0, 50, 35);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 50, 35);
    // Writing lines
    for (let i = 0; i < 4; i++) {
      const lineWidth = 20 + Math.sin(time + i) * 5;
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(5, 8 + i * 7);
      ctx.lineTo(5 + lineWidth, 8 + i * 7);
      ctx.stroke();
    }
    ctx.restore();

    // Floor light reflection
    ctx.fillStyle = 'rgba(200, 210, 240, 0.03)';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
  }

  // ─── Helpers ──────────────────────────────────────────

  _drawWobblyRect(ctx, x, y, w, h, color, t) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const wobble = (i) => Math.sin(t * 0.5 + i) * 1.5;
    ctx.moveTo(x + wobble(0), y + wobble(1));
    ctx.lineTo(x + w + wobble(2), y + wobble(3));
    ctx.lineTo(x + w + wobble(4), y + h + wobble(5));
    ctx.lineTo(x + wobble(6), y + h + wobble(7));
    ctx.closePath();
    ctx.fill();
  }

  _drawCat(x, y, color, time) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    // Body
    ctx.beginPath();
    ctx.ellipse(x, y - 5, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    const headBob = Math.sin(time * 0.8) * 2;
    ctx.beginPath();
    ctx.arc(x + 14, y - 15 + headBob, 10, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 23 + headBob); ctx.lineTo(x + 12, y - 30 + headBob); ctx.lineTo(x + 16, y - 23 + headBob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 14, y - 23 + headBob); ctx.lineTo(x + 18, y - 30 + headBob); ctx.lineTo(x + 22, y - 23 + headBob);
    ctx.fill();
    // Tail
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 16, y - 5);
    ctx.quadraticCurveTo(x - 28, y - 25 + Math.sin(time) * 8, x - 20, y - 30 + Math.sin(time * 1.2) * 5);
    ctx.stroke();
  }

  _drawTree(x, y, color, time) {
    const ctx = this.ctx;
    // Trunk
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(x - 4, y, 8, 40);
    // Foliage layers
    const sway = Math.sin(time * 0.7) * 3;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6 + i * 0.15;
      ctx.beginPath();
      ctx.arc(x + sway * (1 - i * 0.3), y - 10 - i * 18, 22 - i * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawCloud(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 5, 15, 0, Math.PI * 2);
    ctx.arc(x + 35, y, 18, 0, Math.PI * 2);
    ctx.arc(x + 15, y + 5, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawStickPerson(x, y, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 25, 6, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath(); ctx.moveTo(x, y - 19); ctx.lineTo(x, y - 5); ctx.stroke();
    // Arms
    ctx.beginPath(); ctx.moveTo(x - 10, y - 15); ctx.lineTo(x + 10, y - 15); ctx.stroke();
    // Legs
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x - 8, y + 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 8, y + 8); ctx.stroke();
  }

  _drawParticles() {
    const { ctx, w, h, time } = this;
    for (const p of this.particles) {
      p.x += Math.cos(p.angle) * p.speed * 0.3;
      p.y += Math.sin(p.angle) * p.speed * 0.3 - 0.2;
      p.wobble += 0.02;

      // Wrap around
      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const alpha = 0.3 + Math.sin(p.wobble) * 0.2;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this._drawStar(p.x, p.y, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawStar(x, y, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const method = i === 0 ? 'moveTo' : 'lineTo';
      ctx[method](x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
}
