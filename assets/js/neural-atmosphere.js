// Continuous Neural Hustle atmosphere.
// The official tsParticles Stars preset provides the particle engine; this
// file applies the site-specific theme, performance and interaction behavior.
(() => {
  'use strict';

  const ENGINE_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@4.3.3/tsparticles.engine.min.js';
  const STARS_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-stars@4.3.3/tsparticles.preset.stars.bundle.min.js';
  const LAYER_ID = 'neural-atmosphere';

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
  let themeFrame = null;
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let libraryPromise = null;

  function isLightTheme() {
    return root.classList.contains('light') || body.getAttribute('data-theme') === 'light';
  }

  function profileIsOpen() {
    return root.classList.contains('profile-background-paused');
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

  function loadScriptOnce(src, ready) {
    if (ready()) return Promise.resolve();

    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing) {
      return new Promise((resolve, reject) => {
        if (ready()) {
          resolve();
          return;
        }
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
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
      fpsLimit: compact ? 30 : 45,
      // Fixed low particle counts are more important here than retina-scale
      // rendering. CSS still sizes the canvas sharply while avoiding a 4x GPU
      // cost on common DPR=2 displays.
      detectRetina: window.devicePixelRatio <= 1.5,
      particles: {
        number: {
          value: compact ? (light ? 18 : 24) : (light ? 32 : 44),
          density: { enable: false }
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
          speed: compact ? 0.05 : 0.072,
          outModes: { default: 'out' }
        },
        opacity: {
          value: light ? { min: 0.08, max: 0.22 } : { min: 0.12, max: 0.4 },
          animation: {
            enable: true,
            speed: light ? 0.1 : 0.13,
            sync: false
          }
        },
        size: {
          value: light ? { min: 0.45, max: 1.2 } : { min: 0.5, max: 1.5 },
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

  async function destroyParticles() {
    if (!particleContainer) return;
    try {
      particleContainer.destroy();
    } catch (_) {
      // A fresh instance can still be created in the same layer.
    }
    particleContainer = null;
  }

  function useStaticFallback() {
    ensureLayer().dataset.motion = 'static';
  }

  async function mountParticles() {
    const token = ++mountToken;
    const layer = ensureLayer();
    currentTheme = isLightTheme() ? 'light' : 'dark';
    currentCompact = compactViewport.matches;

    if (reducedMotion.matches) {
      await destroyParticles();
      useStaticFallback();
      return;
    }

    layer.dataset.motion = 'animated';

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
      useStaticFallback();
      console.warn('Neural Hustle atmosphere is using its static fallback.', error);
    }
  }

  function syncPauseState() {
    if (!particleContainer || reducedMotion.matches) return;
    const shouldPause = document.hidden || profileIsOpen();
    try {
      if (shouldPause) particleContainer.pause?.();
      else particleContainer.play?.();
    } catch (_) {
      // Pause/resume is a performance optimization, not a dependency.
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

  function scheduleThemeSync() {
    if (themeFrame !== null) return;
    themeFrame = requestAnimationFrame(() => {
      themeFrame = null;
      syncTheme();
      syncPauseState();
      if (profileIsOpen()) resetPointer();
    });
  }

  function animatePointer() {
    pointerX += (targetPointerX - pointerX) * 0.075;
    pointerY += (targetPointerY - pointerY) * 0.075;

    const layer = document.getElementById(LAYER_ID);
    if (layer) {
      layer.style.setProperty('--atmosphere-x', `${pointerX.toFixed(2)}px`);
      layer.style.setProperty('--atmosphere-y', `${pointerY.toFixed(2)}px`);
    }

    const moving =
      Math.abs(targetPointerX - pointerX) > 0.02 ||
      Math.abs(targetPointerY - pointerY) > 0.02;

    if (moving) pointerFrame = requestAnimationFrame(animatePointer);
    else pointerFrame = null;
  }

  function requestPointerFrame() {
    if (!pointerFrame) pointerFrame = requestAnimationFrame(animatePointer);
  }

  function handlePointerMove(event) {
    if (
      !precisePointer.matches ||
      compactViewport.matches ||
      reducedMotion.matches ||
      profileIsOpen()
    ) return;

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

    const observer = new MutationObserver(scheduleThemeSync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] });
  }

  ensureLayer();
  bindLifecycle();
  mountParticles();
})();
