// Continuous Neural Hustle atmosphere.
// Dark mode uses the official tsParticles Stars preset; light mode uses the
// official Links preset, with both heavily customized to the site's visual system.
(() => {
  'use strict';

  const ENGINE_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/engine@4.4.0/tsparticles.engine.min.js';
  const STARS_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-stars@4.4.0/tsparticles.preset.stars.bundle.min.js';
  const LINKS_URL = 'https://cdn.jsdelivr.net/npm/@tsparticles/preset-links@4.4.0/tsparticles.preset.links.min.js';
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
  let enginePromise = null;
  const presetPromises = new Map();

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

  function ensureEngine() {
    if (enginePromise) return enginePromise;

    enginePromise = loadScriptOnce(ENGINE_URL, () => Boolean(window.tsParticles)).catch((error) => {
      enginePromise = null;
      throw error;
    });

    return enginePromise;
  }

  function ensurePreset(name) {
    if (presetPromises.has(name)) return presetPromises.get(name);

    const promise = (async () => {
      await ensureEngine();

      if (name === 'links') {
        await loadScriptOnce(LINKS_URL, () => typeof window.loadLinksPreset === 'function');
        await window.loadLinksPreset(window.tsParticles);
      } else {
        await loadScriptOnce(STARS_URL, () => typeof window.loadStarsPreset === 'function');
        await window.loadStarsPreset(window.tsParticles);
      }
    })().catch((error) => {
      presetPromises.delete(name);
      throw error;
    });

    presetPromises.set(name, promise);
    return promise;
  }

  function darkStarOptions(compact) {
    return {
      preset: 'stars',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: compact ? 30 : 45,
      detectRetina: window.devicePixelRatio <= 1.5,
      particles: {
        number: {
          value: compact ? 36 : 64,
          density: { enable: false }
        },
        color: {
          value: ['#f4f9ff', '#d3e0ec', '#53dec2', '#aa96e8']
        },
        links: { enable: false },
        collisions: { enable: false },
        move: {
          enable: true,
          direction: 'none',
          random: true,
          straight: false,
          speed: compact ? 0.055 : 0.078,
          outModes: { default: 'out' }
        },
        opacity: {
          value: { min: 0.24, max: 0.66 },
          animation: {
            enable: true,
            speed: 0.14,
            sync: false
          }
        },
        size: {
          value: { min: 0.68, max: 1.95 },
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

  function lightNetworkOptions(compact) {
    return {
      preset: 'links',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: compact ? 30 : 42,
      detectRetina: window.devicePixelRatio <= 1.5,
      particles: {
        number: {
          value: compact ? 28 : 42,
          density: { enable: false }
        },
        color: {
          value: ['#315f78', '#168b87', '#7764a8', '#59758d']
        },
        links: {
          enable: true,
          distance: compact ? 118 : 150,
          color: '#6f8fa0',
          opacity: compact ? 0.085 : 0.115,
          width: 0.65,
          triangles: { enable: false },
          shadow: { enable: false }
        },
        collisions: { enable: false },
        move: {
          enable: true,
          direction: 'none',
          random: true,
          straight: false,
          speed: compact ? 0.045 : 0.06,
          outModes: { default: 'out' }
        },
        opacity: {
          value: { min: 0.28, max: 0.54 },
          animation: {
            enable: true,
            speed: 0.085,
            sync: false
          }
        },
        size: {
          value: { min: 0.85, max: 1.85 },
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

  function particleOptions() {
    const compact = compactViewport.matches;
    return isLightTheme() ? lightNetworkOptions(compact) : darkStarOptions(compact);
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
    const light = isLightTheme();
    const presetName = light ? 'links' : 'stars';
    currentTheme = light ? 'light' : 'dark';
    currentCompact = compactViewport.matches;

    if (reducedMotion.matches) {
      await destroyParticles();
      useStaticFallback();
      return;
    }

    layer.dataset.motion = 'animated';
    layer.dataset.variant = presetName;

    try {
      await ensurePreset(presetName);
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
