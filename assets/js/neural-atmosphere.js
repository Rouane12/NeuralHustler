// Continuous Neural Hustle atmosphere.
// Uses the official tsParticles Stars preset as the engine, then applies a
// restrained theme-aware configuration for this site.
(() => {
  'use strict';

  const ENGINE_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@4.3.3/tsparticles.engine.min.js';
  const STARS_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-stars@4.3.3/tsparticles.preset.stars.bundle.min.js';
  const LAYER_ID = 'neural-atmosphere';
  const STYLE_ID = 'neural-atmosphere-styles';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 720px)');
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let particleContainer = null;
  let currentTheme = null;
  let currentCompact = compactViewport.matches;
  let mountToken = 0;
  let resizeTimer = null;
  let pointerFrame = null;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;

  function isLightTheme() {
    return root.classList.contains('light') || body.getAttribute('data-theme') === 'light';
  }

  function profileIsOpen() {
    return root.classList.contains('profile-background-paused');
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html {
        background: #05060a;
      }

      html.light {
        background: #f3f7fc;
      }

      body {
        background: transparent !important;
      }

      #${LAYER_ID} {
        --atmosphere-x: 0px;
        --atmosphere-y: 0px;
        position: fixed;
        inset: -14px;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        transform: translate3d(var(--atmosphere-x), var(--atmosphere-y), 0) scale(1.015);
        transform-origin: center;
        background:
          radial-gradient(ellipse 68% 58% at 16% 6%, rgba(123, 92, 255, 0.12), transparent 72%),
          radial-gradient(ellipse 62% 52% at 84% 8%, rgba(47, 218, 184, 0.10), transparent 74%),
          radial-gradient(ellipse 58% 46% at 52% 84%, rgba(37, 91, 124, 0.055), transparent 76%),
          #05060a;
        transition: background-color 240ms ease, opacity 220ms ease;
        contain: strict;
      }

      #${LAYER_ID}::before,
      #${LAYER_ID}::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      #${LAYER_ID}::before {
        z-index: 0;
        background:
          radial-gradient(circle at 18% 26%, rgba(47, 218, 184, 0.055), transparent 20%),
          radial-gradient(circle at 77% 38%, rgba(123, 92, 255, 0.055), transparent 22%),
          radial-gradient(circle at 48% 76%, rgba(72, 126, 160, 0.035), transparent 24%);
        filter: blur(30px);
      }

      #${LAYER_ID}::after {
        z-index: 0;
        opacity: 0.18;
        background-image:
          radial-gradient(circle, rgba(214, 230, 242, 0.34) 0 0.65px, transparent 0.9px),
          radial-gradient(circle, rgba(47, 218, 184, 0.20) 0 0.55px, transparent 0.8px),
          radial-gradient(circle, rgba(153, 132, 219, 0.20) 0 0.55px, transparent 0.8px);
        background-size: 193px 173px, 271px 239px, 337px 307px;
        background-position: 23px 41px, 111px 79px, 193px 131px;
      }

      #${LAYER_ID} > canvas {
        position: absolute !important;
        inset: 0 !important;
        z-index: 1 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
      }

      /* Keep the atmosphere behind every page surface without disturbing the
         existing modal and profile stacking contexts. */
      #hero-vanta,
      main,
      .footer {
        position: relative;
        z-index: 1;
      }

      #hero-vanta {
        background: transparent !important;
      }

      /* Vanta may have already initialized before this deferred module runs.
         Its canvas is removed in JS; this is a defensive visual fallback. */
      #hero-vanta > canvas,
      #hero-vanta .vanta-canvas {
        display: none !important;
      }

      .hero {
        background: linear-gradient(135deg, rgba(11, 13, 19, 0.72), rgba(5, 6, 10, 0.56)) !important;
      }

      html.light #${LAYER_ID} {
        background:
          radial-gradient(ellipse 68% 58% at 16% 6%, rgba(121, 104, 201, 0.075), transparent 74%),
          radial-gradient(ellipse 62% 52% at 84% 8%, rgba(31, 146, 145, 0.065), transparent 76%),
          radial-gradient(ellipse 58% 46% at 52% 84%, rgba(109, 136, 166, 0.055), transparent 78%),
          #f3f7fc;
      }

      html.light #${LAYER_ID}::before {
        background:
          radial-gradient(circle at 18% 26%, rgba(50, 151, 147, 0.04), transparent 22%),
          radial-gradient(circle at 77% 38%, rgba(116, 94, 188, 0.04), transparent 24%),
          radial-gradient(circle at 48% 76%, rgba(98, 132, 162, 0.035), transparent 26%);
      }

      html.light #${LAYER_ID}::after {
        opacity: 0.10;
        background-image:
          radial-gradient(circle, rgba(74, 95, 119, 0.28) 0 0.55px, transparent 0.8px),
          radial-gradient(circle, rgba(29, 133, 131, 0.18) 0 0.5px, transparent 0.75px),
          radial-gradient(circle, rgba(111, 94, 166, 0.17) 0 0.5px, transparent 0.75px);
      }

      html.light .hero {
        background: linear-gradient(135deg, rgba(247, 250, 253, 0.78), rgba(239, 246, 250, 0.62)) !important;
      }

      html.profile-background-paused #${LAYER_ID} {
        opacity: 0.74;
      }

      @media (max-width: 720px) {
        #${LAYER_ID} {
          inset: -8px;
          transform: none !important;
        }

        #${LAYER_ID}::after {
          opacity: 0.11;
        }

        html.light #${LAYER_ID}::after {
          opacity: 0.065;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #${LAYER_ID} {
          transform: none !important;
        }

        #${LAYER_ID}::after {
          opacity: 0.22;
        }

        html.light #${LAYER_ID}::after {
          opacity: 0.12;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLayer() {
    let layer = document.getElementById(LAYER_ID);
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute('role', 'presentation');
    body.prepend(layer);
    return layer;
  }

  function removeVanta() {
    try {
      window.vantaEffect?.destroy?.();
    } catch (_) {
      // A partially initialized WebGL instance should never block the fallback.
    }
    window.vantaEffect = null;

    document.querySelectorAll('#hero-vanta > canvas, #hero-vanta .vanta-canvas').forEach((canvas) => {
      canvas.remove();
    });
  }

  function loadScriptOnce(src, ready) {
    if (ready()) return Promise.resolve();

    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing) {
      return new Promise((resolve, reject) => {
        if (ready()) resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  let libraryPromise = null;
  function ensureLibrary() {
    if (libraryPromise) return libraryPromise;

    libraryPromise = (async () => {
      await loadScriptOnce(ENGINE_URL, () => Boolean(window.tsParticles));
      await loadScriptOnce(STARS_URL, () => typeof window.loadStarsPreset === 'function');
      await window.loadStarsPreset(window.tsParticles);
    })().catch((error) => {
      libraryPromise = null;
      throw error;
    });

    return libraryPromise;
  }

  function particleOptions() {
    const light = isLightTheme();
    const compact = compactViewport.matches;

    return {
      preset: 'stars',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: compact ? 32 : 45,
      detectRetina: true,
      particles: {
        number: {
          value: compact ? (light ? 21 : 27) : (light ? 34 : 46)
        },
        color: {
          value: light
            ? ['#71839a', '#4c9695', '#887caf']
            : ['#dce8f3', '#b7c9d8', '#45c8ae', '#8c78cd']
        },
        links: { enable: false },
        collisions: { enable: false },
        move: {
          enable: true,
          direction: 'none',
          random: true,
          straight: false,
          speed: compact ? 0.055 : 0.075,
          outModes: { default: 'out' }
        },
        opacity: {
          value: light ? { min: 0.08, max: 0.24 } : { min: 0.11, max: 0.42 },
          animation: {
            enable: true,
            speed: light ? 0.11 : 0.14,
            sync: false
          }
        },
        size: {
          value: light ? { min: 0.45, max: 1.25 } : { min: 0.5, max: 1.55 },
          animation: { enable: false }
        },
        shape: { type: 'circle' }
      },
      interactivity: {
        events: {
          onClick: { enable: false },
          onHover: { enable: false },
          resize: { enable: true }
        }
      }
    };
  }

  function setStaticFallback(enabled) {
    const layer = ensureLayer();
    layer.dataset.motion = enabled ? 'static' : 'animated';
  }

  async function destroyParticles() {
    if (!particleContainer) return;
    try {
      particleContainer.destroy();
    } catch (_) {
      // The next mount still uses the same single layer.
    }
    particleContainer = null;
  }

  async function mountParticles() {
    const token = ++mountToken;
    const layer = ensureLayer();
    const light = isLightTheme();
    currentTheme = light ? 'light' : 'dark';
    currentCompact = compactViewport.matches;

    if (reducedMotion.matches) {
      await destroyParticles();
      setStaticFallback(true);
      return;
    }

    setStaticFallback(false);

    try {
      await ensureLibrary();
      if (token !== mountToken) return;
      await destroyParticles();
      if (token !== mountToken) return;

      particleContainer = await window.tsParticles.load({
        id: LAYER_ID,
        options: particleOptions()
      });

      if (token !== mountToken) {
        await destroyParticles();
        return;
      }

      syncPauseState();
    } catch (error) {
      // The layered CSS background is the intentional no-JS/CDN fallback.
      setStaticFallback(true);
      console.warn('Neural Hustle atmosphere fell back to its static background.', error);
    }
  }

  function syncPauseState() {
    if (!particleContainer || reducedMotion.matches) return;
    const shouldPause = document.hidden || profileIsOpen();
    try {
      if (shouldPause) particleContainer.pause?.();
      else particleContainer.play?.();
    } catch (_) {
      // Pause/resume is an optimization, never a functional dependency.
    }
  }

  function syncTheme() {
    const nextTheme = isLightTheme() ? 'light' : 'dark';
    if (nextTheme === currentTheme) {
      syncPauseState();
      return;
    }
    mountParticles();
  }

  function animatePointer() {
    pointerX += (targetPointerX - pointerX) * 0.075;
    pointerY += (targetPointerY - pointerY) * 0.075;

    const layer = document.getElementById(LAYER_ID);
    if (layer) {
      layer.style.setProperty('--atmosphere-x', `${pointerX.toFixed(2)}px`);
      layer.style.setProperty('--atmosphere-y', `${pointerY.toFixed(2)}px`);
    }

    const moving = Math.abs(targetPointerX - pointerX) > 0.02 || Math.abs(targetPointerY - pointerY) > 0.02;
    if (moving) pointerFrame = requestAnimationFrame(animatePointer);
    else pointerFrame = null;
  }

  function requestPointerFrame() {
    if (!pointerFrame) pointerFrame = requestAnimationFrame(animatePointer);
  }

  function handlePointerMove(event) {
    if (!precisePointer.matches || compactViewport.matches || reducedMotion.matches || profileIsOpen()) return;
    const normalizedX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
    const normalizedY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    targetPointerX = normalizedX * -5;
    targetPointerY = normalizedY * -4;
    requestPointerFrame();
  }

  function resetPointer() {
    targetPointerX = 0;
    targetPointerY = 0;
    requestPointerFrame();
  }

  function handleResponsiveChange() {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (compactViewport.matches !== currentCompact) mountParticles();
    }, 180);
  }

  function bindLifecycle() {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget) resetPointer();
    }, { passive: true });

    document.addEventListener('visibilitychange', syncPauseState);
    window.addEventListener('resize', handleResponsiveChange, { passive: true });

    reducedMotion.addEventListener?.('change', () => {
      resetPointer();
      mountParticles();
    });

    compactViewport.addEventListener?.('change', handleResponsiveChange);
    precisePointer.addEventListener?.('change', resetPointer);

    const themeObserver = new MutationObserver(() => {
      syncTheme();
      syncPauseState();
      if (profileIsOpen()) resetPointer();
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
    themeObserver.observe(body, { attributes: true, attributeFilter: ['data-theme'] });
  }

  installStyles();
  ensureLayer();
  removeVanta();
  bindLifecycle();
  mountParticles();
})();
