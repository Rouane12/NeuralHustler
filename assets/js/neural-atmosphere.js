// Continuous Neural Hustle atmosphere.
// Dark mode uses the official tsParticles Stars preset. Light mode leaves the
// global particle canvas idle so the hero can use the restored Vanta NET effect.
(() => {
  'use strict';

  // Keep all tsParticles packages on the same pinned version. The engine alone
  // does not include the runtime features required by presets, so Stars must be
  // registered after the slim bundle. Each package also gets a second CDN path
  // so a transient provider failure does not silently remove the atmosphere.
  const ENGINE_URLS = [
    'https://cdn.jsdelivr.net/npm/@tsparticles/engine@4.4.0/tsparticles.engine.min.js',
    'https://unpkg.com/@tsparticles/engine@4.4.0/tsparticles.engine.min.js'
  ];
  const SLIM_URLS = [
    'https://cdn.jsdelivr.net/npm/@tsparticles/slim@4.4.0/tsparticles.slim.bundle.min.js',
    'https://unpkg.com/@tsparticles/slim@4.4.0/tsparticles.slim.bundle.min.js'
  ];
  const STARS_URLS = [
    'https://cdn.jsdelivr.net/npm/@tsparticles/preset-stars@4.4.0/tsparticles.preset.stars.bundle.min.js',
    'https://unpkg.com/@tsparticles/preset-stars@4.4.0/tsparticles.preset.stars.bundle.min.js'
  ];
  const LAYER_ID = 'neural-atmosphere';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  let particleContainer = null;
  let currentTheme = null;
  let mountToken = 0;
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

  async function loadScriptWithFallback(urls, ready) {
    if (ready()) return;

    let lastError;
    for (const url of urls) {
      try {
        await loadScriptOnce(url, ready);
        if (ready()) return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to load required animation library.');
  }

  function ensureLibrary() {
    if (libraryPromise) return libraryPromise;

    libraryPromise = (async () => {
      await loadScriptWithFallback(ENGINE_URLS, () => Boolean(window.tsParticles?.load));
      await loadScriptWithFallback(SLIM_URLS, () => typeof window.loadSlim === 'function');
      await window.loadSlim(window.tsParticles);
      await loadScriptWithFallback(STARS_URLS, () => typeof window.loadStarsPreset === 'function');
      await window.loadStarsPreset(window.tsParticles);
    })().catch((error) => {
      libraryPromise = null;
      throw error;
    });

    return libraryPromise;
  }

  // Keep the official Stars preset appearance intact. We override only the
  // canvas ownership/background so the preset can live inside our fixed layer.
  function particleOptions() {
    return {
      preset: 'stars',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } }
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

  function useStaticFallback(state = 'static') {
    ensureLayer().dataset.motion = state;
  }

  async function mountParticles() {
    const token = ++mountToken;
    const layer = ensureLayer();
    currentTheme = isLightTheme() ? 'light' : 'dark';

    // Light mode intentionally has no global Stars canvas. The hero-only Vanta
    // module owns motion there. Reduced-motion keeps the static fallback only.
    if (isLightTheme()) {
      await destroyParticles();
      useStaticFallback('light');
      resetPointer();
      return;
    }

    if (reducedMotion.matches) {
      await destroyParticles();
      useStaticFallback();
      return;
    }

    layer.dataset.motion = 'animated';

    try {
      await ensureLibrary();
      if (token !== mountToken || isLightTheme()) return;

      await destroyParticles();
      if (token !== mountToken || isLightTheme()) return;

      particleContainer = await window.tsParticles.load({
        id: LAYER_ID,
        options: particleOptions()
      });

      if (token !== mountToken || isLightTheme()) {
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
      if (profileIsOpen() || isLightTheme()) resetPointer();
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
      isLightTheme() ||
      !precisePointer.matches ||
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

  function bindLifecycle() {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget) resetPointer();
    }, { passive: true });

    document.addEventListener('visibilitychange', syncPauseState);
    window.addEventListener('pageshow', scheduleThemeSync);
    window.addEventListener('online', () => {
      if (!isLightTheme() && !particleContainer && !reducedMotion.matches) mountParticles();
    });

    reducedMotion.addEventListener?.('change', () => {
      resetPointer();
      mountParticles();
    });

    precisePointer.addEventListener?.('change', resetPointer);

    const observer = new MutationObserver(scheduleThemeSync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] });
  }

  ensureLayer();
  bindLifecycle();
  mountParticles();
})();

// The light-theme Vanta implementation is isolated from the dark Stars path.
// Its third-party libraries are loaded lazily only when light mode is active.
(() => {
  if (document.querySelector('script[data-neural-light-vanta]')) return;
  const script = document.createElement('script');
  script.src = 'assets/js/light-vanta.js';
  script.defer = true;
  script.dataset.neuralLightVanta = 'true';
  document.head.appendChild(script);
})();
