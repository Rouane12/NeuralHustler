// Neural Hustle atmosphere.
// A single local Canvas 2D renderer powers both themes:
// - dark: bright, drifting stars on true near-black
// - light: a sparse moving neural-link network
//
// No third-party animation runtime is required. Keeping both themes in the
// same renderer makes theme switching deterministic and avoids CDN/preset
// registration failures.
(() => {
  'use strict';

  const LAYER_ID = 'neural-atmosphere';
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 720px)');

  let canvas = null;
  let ctx = null;
  let stars = [];
  let nodes = [];
  let theme = null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastFrame = 0;
  let rafId = 0;
  let running = false;

  function isLightTheme() {
    return root.classList.contains('light') || body.getAttribute('data-theme') === 'light';
  }

  function currentTheme() {
    return isLightTheme() ? 'light' : 'dark';
  }

  function isPaused() {
    return document.hidden || root.classList.contains('profile-background-paused');
  }

  function ensureLayer() {
    let layer = document.getElementById(LAYER_ID);
    if (!layer) {
      layer = document.createElement('div');
      layer.id = LAYER_ID;
      layer.setAttribute('aria-hidden', 'true');
      layer.setAttribute('role', 'presentation');
      body.prepend(layer);
    }

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'neural-atmosphere-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      layer.appendChild(canvas);

      // Keep the context synchronized with normal browser compositing.
      // The previous desynchronized/WebGL-style paths made the decorative
      // layer unreliable across browsers and theme changes.
      ctx = canvas.getContext('2d', { alpha: true });
    }

    return layer;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function createStars() {
    const count = compactViewport.matches ? 58 : 92;

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: random(0.9, 2.65),
      speedX: random(-1.4, 1.4),
      speedY: random(1.8, 5.4),
      baseAlpha: random(0.58, 0.98),
      twinkleSpeed: random(0.55, 1.35),
      phase: random(0, Math.PI * 2),
      cool: Math.random() > 0.72
    }));
  }

  function createNodes() {
    const count = compactViewport.matches ? 24 : 38;
    const palette = ['#287f86', '#587b98', '#7568a6'];

    nodes = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: random(1.7, 3.0),
      vx: random(-7.5, 7.5),
      vy: random(-7.5, 7.5),
      alpha: random(0.58, 0.86),
      color: palette[index % palette.length]
    }));
  }

  function resize() {
    ensureLayer();

    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (theme === 'light') createNodes();
    else createStars();
  }

  function setTheme(nextTheme, force = false) {
    if (!force && nextTheme === theme) return;

    theme = nextTheme;
    const layer = ensureLayer();
    layer.dataset.theme = theme;
    layer.dataset.ready = 'true';
    layer.dataset.motion = reducedMotion.matches ? 'reduced' : 'animated';

    if (!width || !height) resize();
    else if (theme === 'light') createNodes();
    else createStars();
  }

  function clear() {
    ctx.clearRect(0, 0, width, height);
  }

  function wrap(point, padding = 8) {
    if (point.x < -padding) point.x = width + padding;
    else if (point.x > width + padding) point.x = -padding;

    if (point.y < -padding) point.y = height + padding;
    else if (point.y > height + padding) point.y = -padding;
  }

  function drawDark(dt, time) {
    const speedScale = reducedMotion.matches ? 0.35 : 1;

    for (const star of stars) {
      star.x += star.speedX * dt * speedScale;
      star.y += star.speedY * dt * speedScale;
      wrap(star, 6);

      const twinkle = 0.82 + Math.sin(time * star.twinkleSpeed + star.phase) * 0.18;
      ctx.globalAlpha = Math.max(0.34, star.baseAlpha * twinkle);
      ctx.fillStyle = star.cool ? '#dce9f4' : '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // A few larger stars get a very small cross flare so the dark field
      // stays readable without turning into a bright sci-fi effect.
      if (star.radius > 2.15) {
        ctx.globalAlpha *= 0.23;
        ctx.strokeStyle = star.cool ? '#cfe0ef' : '#ffffff';
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(star.x - star.radius * 2.4, star.y);
        ctx.lineTo(star.x + star.radius * 2.4, star.y);
        ctx.moveTo(star.x, star.y - star.radius * 2.4);
        ctx.lineTo(star.x, star.y + star.radius * 2.4);
        ctx.stroke();
      }
    }
  }

  function drawLight(dt) {
    const speedScale = reducedMotion.matches ? 0.35 : 1;
    const linkDistance = compactViewport.matches ? 125 : 165;
    const maxDistanceSq = linkDistance * linkDistance;

    for (const node of nodes) {
      node.x += node.vx * dt * speedScale;
      node.y += node.vy * dt * speedScale;
      wrap(node, 10);
    }

    ctx.lineWidth = 1;

    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq > maxDistanceSq) continue;

        const distance = Math.sqrt(distanceSq);
        const strength = 1 - distance / linkDistance;

        ctx.globalAlpha = 0.10 + strength * 0.24;
        ctx.strokeStyle = '#607f96';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const node of nodes) {
      ctx.globalAlpha = node.alpha;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function frame(timestamp) {
    rafId = 0;
    if (!running) return;

    const targetFps = reducedMotion.matches ? 18 : 30;
    const minFrameTime = 1000 / targetFps;
    const elapsed = timestamp - lastFrame;

    if (elapsed >= minFrameTime && !isPaused()) {
      const dt = Math.min(elapsed / 1000, 0.08);
      lastFrame = timestamp;

      clear();
      ctx.save();

      if (theme === 'light') drawLight(dt);
      else drawDark(dt, timestamp / 1000);

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;

    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function syncTheme() {
    const nextTheme = currentTheme();
    if (nextTheme !== theme) setTheme(nextTheme);
  }

  function initialize() {
    const layer = ensureLayer();

    if (!ctx) {
      layer.dataset.ready = 'false';
      layer.dataset.motion = 'static';
      return;
    }

    resize();
    setTheme(currentTheme(), true);
    start();
  }

  const themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  themeObserver.observe(body, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('pageshow', () => {
    setTheme(currentTheme(), true);
    start();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastFrame = performance.now();
      start();
    }
  });

  reducedMotion.addEventListener?.('change', () => setTheme(currentTheme(), true));

  compactViewport.addEventListener?.('change', () => {
    resize();
    setTheme(currentTheme(), true);
  });

  window.__neuralAtmosphereStatus = () => ({
    theme,
    ready: Boolean(ctx),
    running,
    reducedMotion: reducedMotion.matches,
    compactViewport: compactViewport.matches,
    stars: stars.length,
    nodes: nodes.length
  });

  initialize();
})();
