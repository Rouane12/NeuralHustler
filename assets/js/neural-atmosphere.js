// Neural Hustle atmosphere.
// One tsParticles engine powers both themes:
// - dark: official Stars preset, customized for a deeper near-black field
// - light: official Links preset, customized into a sparse neural network
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
  const LINKS_URLS = [
    'https://cdn.jsdelivr.net/npm/@tsparticles/preset-links@4.4.0/tsparticles.preset.links.min.js',
    'https://unpkg.com/@tsparticles/preset-links@4.4.0/tsparticles.preset.links.min.js'
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
  let corePromise = null;
  const presetPromises = { dark: null, light: null };

  function isLightTheme() {
    return root.classList.contains('light') || body.getAttribute('data-theme') === 'light';
  }

  function currentTheme() {
    return isLightTheme() ? 'light' : 'dark';
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

  function setLayerState(theme, state) {
    const layer = ensureLayer();
    layer.dataset.theme = theme;
    layer.dataset.motion = state;
    layer.dataset.atmosphereStatus = state;
  }

  function loadScriptOnce(src, ready) {
    if (ready()) return Promise.resolve();

    const absolute = new URL(src, document.baseURI).href;
    let existing = [...document.scripts].find((script) => script.src === absolute);

    if (existing?.dataset.neuralLoadState === 'error') {
      existing.remove();
      existing = null;
    }

    if (existing) {
      return new Promise((resolve, reject) => {
        if (ready()) {
          resolve();
          return;
        }

        const onLoad = () => {
          existing.dataset.neuralLoadState = 'loaded';
          ready() ? resolve() : reject(new Error(`Loaded ${src}, but its API is unavailable.`));
        };
        const onError = () => {
          existing.dataset.neuralLoadState = 'error';
          existing.remove();
          reject(new Error(`Failed to load ${src}`));
        };

        existing.addEventListener('load', onLoad, { once: true });
        existing.addEventListener('error', onError, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.neuralLoadState = 'loading';

      script.addEventListener('load', () => {
        script.dataset.neuralLoadState = 'loaded';
        ready() ? resolve() : reject(new Error(`Loaded ${src}, but its API is unavailable.`));
      }, { once: true });

      script.addEventListener('error', () => {
        script.dataset.neuralLoadState = 'error';
        script.remove();
        reject(new Error(`Failed to load ${src}`));
      }, { once: true });

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

  function ensureCore() {
    if (corePromise) return corePromise;

    corePromise = (async () => {
      await loadScriptWithFallback(ENGINE_URLS, () => Boolean(window.tsParticles?.load));
      await loadScriptWithFallback(SLIM_URLS, () => typeof window.loadSlim === 'function');
      await window.loadSlim(window.tsParticles);
    })().catch((error) => {
      corePromise = null;
      throw error;
    });

    return corePromise;
  }

  function ensurePreset(theme) {
    if (presetPromises[theme]) return presetPromises[theme];

    presetPromises[theme] = (async () => {
      await ensureCore();

      if (theme === 'light') {
        await loadScriptWithFallback(LINKS_URLS, () => typeof window.loadLinksPreset === 'function');
        await window.loadLinksPreset(window.tsParticles);
      } else {
        await loadScriptWithFallback(STARS_URLS, () => typeof window.loadStarsPreset === 'function');
        await window.loadStarsPreset(window.tsParticles);
      }
    })().catch((error) => {
      presetPromises[theme] = null;
      throw error;
    });

    return presetPromises[theme];
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
      fpsLimit: reduced ? 20 : 32,
      detectRetina: false,
      interactivity: baseInteractivity(),
      particles: {
        number: { value: compact ? 54 : 78 },
        color: { value: ['#ffffff', '#edf4fb', '#d7e2ec'] },
        opacity: {
          value: { min: 0.52, max: 1 },
          animation: {
            enable: true,
            speed: reduced ? 0.16 : 0.42,
            sync: false
          }
        },
        size: { value: { min: 0.65, max: 1.9 } },
        move: {
          enable: true,
          speed: reduced ? 0.12 : 0.34,
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
      preset: 'links',
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: reduced ? 20 : 32,
      detectRetina: false,
      interactivity: baseInteractivity(),
      particles: {
        number: { value: compact ? 28 : 44 },
        color: { value: ['#287f86', '#587b98', '#7568a6'] },
        links: {
          enable: true,
          distance: compact ? 132 : 162,
          color: '#667f96',
          opacity: 0.28,
          width: 1
        },
        move: {
          enable: true,
          speed: reduced ? 0.10 : 0.26,
          direction: 'none',
          random: false,
          straight: false,
          outModes: { default: 'out' }
        },
        opacity: { value: { min: 0.52, max: 0.82 } },
        shape: { type: 'circle' },
        size: { value: { min: 1.25, max: 2.5 } }
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
      // A fresh instance can still be created in the same layer.
    }

    particleContainer = null;
  }

  function useStaticFallback(theme) {
    mountedTheme = theme;
    setLayerState(theme, 'static');
  }

  async function mountParticles() {
    const token = ++mountToken;
    const theme = currentTheme();

    mountedTheme = theme;
    setLayerState(theme, 'loading');

    try {
      await ensurePreset(theme);
      if (token !== mountToken) return;

      await destroyParticles();
      if (token !== mountToken) return;

      particleContainer = await window.tsParticles.load({
        id: LAYER_ID,
        options: optionsForTheme(theme)
      });

      if (token !== mountToken || theme !== currentTheme()) {
        await destroyParticles();
        return;
      }

      setLayerState(theme, reducedMotion.matches ? 'reduced' : 'animated');
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
    const nextTheme = currentTheme();

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

  // Expose a tiny read-only diagnostic helper for browser troubleshooting.
  window.__neuralAtmosphereStatus = () => ({
    theme: currentTheme(),
    mountedTheme,
    hasContainer: Boolean(particleContainer),
    reducedMotion: reducedMotion.matches,
    compactViewport: compactViewport.matches,
    state: document.getElementById(LAYER_ID)?.dataset.atmosphereStatus || 'missing'
  });

  ensureLayer();
  bindLifecycle();
  mountParticles();
})();
