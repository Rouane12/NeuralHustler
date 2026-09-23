// Neural Hustle atmosphere.
// One tsParticles engine powers both themes:
// - dark: a high-contrast Stars preset on near-black
// - light: a custom sparse neural-link field
(() => {
  'use strict';

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
  const compactViewport = window.matchMedia('(max-width: 720px)');

  let particleContainer = null;
  let mountedTheme = null;
  let mountToken = 0;
  let syncFrame = null;
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

    throw lastError || new Error('Unable to load the atmosphere runtime.');
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

  function baseInteractivity() {
    return {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
        resize: { enable: true }
      }
    };
  }

  function darkOptions() {
    const reduced = reducedMotion.matches;
    const compact = compactViewport.matches;

    return {
      preset: 'stars',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: reduced ? 18 : 30,
      detectRetina: false,
      interactivity: baseInteractivity(),
      particles: {
        number: { value: compact ? 46 : 68 },
        color: { value: ['#ffffff', '#edf4fb', '#cbd9e6'] },
        opacity: {
          value: { min: 0.55, max: 1 },
          animation: { enable: !reduced, speed: 0.35, sync: false }
        },
        size: { value: { min: 0.55, max: 1.7 } },
        move: {
          enable: !reduced,
          speed: 0.08,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' }
        }
      }
    };
  }

  function lightOptions() {
    const reduced = reducedMotion.matches;
    const compact = compactViewport.matches;

    return {
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: reduced ? 18 : 30,
      detectRetina: false,
      interactivity: baseInteractivity(),
      particles: {
        number: { value: compact ? 20 : 32 },
        color: { value: ['#2f858b', '#607f9b', '#7b6bad'] },
        links: {
          enable: true,
          distance: compact ? 118 : 148,
          color: '#70889d',
          opacity: 0.18,
          width: 1
        },
        move: {
          enable: !reduced,
          speed: compact ? 0.11 : 0.15,
          direction: 'none',
          random: false,
          straight: false,
          outModes: { default: 'out' }
        },
        opacity: { value: { min: 0.34, max: 0.62 } },
        shape: { type: 'circle' },
        size: { value: { min: 1.05, max: 2.15 } }
      }
    };
  }

  function optionsForTheme(theme) {
    return theme === 'light' ? lightOptions() : darkOptions();
  }

  async function destroyParticles() {
    if (!particleContainer) return;

    try {
      particleContainer.destroy();
    } catch (_) {
      // A new instance can still be created in the same layer.
    }

    particleContainer = null;
  }

  function useStaticFallback(theme) {
    const layer = ensureLayer();
    layer.dataset.theme = theme;
    layer.dataset.motion = 'static';
  }

  async function mountParticles() {
    const token = ++mountToken;
    const layer = ensureLayer();
    const theme = isLightTheme() ? 'light' : 'dark';

    mountedTheme = theme;
    layer.dataset.theme = theme;
    layer.dataset.motion = reducedMotion.matches ? 'reduced' : 'animated';

    try {
      await ensureLibrary();
      if (token !== mountToken) return;

      await destroyParticles();
      if (token !== mountToken) return;

      particleContainer = await window.tsParticles.load({
        id: LAYER_ID,
        options: optionsForTheme(theme)
      });

      if (token !== mountToken || theme !== (isLightTheme() ? 'light' : 'dark')) {
        await destroyParticles();
        return;
      }

      syncPauseState();
    } catch (error) {
      await destroyParticles();
      useStaticFallback(theme);
      console.warn('Neural Hustle atmosphere is using its static fallback.', error);
    }
  }

  function syncPauseState() {
    if (!particleContainer) return;

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

    if (nextTheme === mountedTheme && particleContainer) {
      syncPauseState();
      return;
    }

    mountParticles();
  }

  function scheduleSync() {
    if (syncFrame !== null) return;

    syncFrame = requestAnimationFrame(() => {
      syncFrame = null;
      syncTheme();
      syncPauseState();
    });
  }

  function bindLifecycle() {
    document.addEventListener('visibilitychange', syncPauseState);
    window.addEventListener('pageshow', scheduleSync);
    window.addEventListener('online', () => {
      if (!particleContainer) mountParticles();
    });

    reducedMotion.addEventListener?.('change', mountParticles);
    compactViewport.addEventListener?.('change', mountParticles);

    const observer = new MutationObserver(scheduleSync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] });
  }

  ensureLayer();
  bindLifecycle();
  mountParticles();
})();
