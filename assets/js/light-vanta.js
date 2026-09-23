// Light-mode-only Neural Hustle hero effect.
// Restores the previously used Vanta NET treatment without loading Vanta or
// Three.js in dark mode.
(() => {
  'use strict';

  // Pin the pair Vanta documents against and keep a second CDN available.
  // Leaving Vanta unversioned made this background vulnerable to upstream
  // changes while Three stayed on an older revision.
  const THREE_URLS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js'
  ];
  const VANTA_URLS = [
    'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.net.min.js',
    'https://unpkg.com/vanta@0.5.24/dist/vanta.net.min.js'
  ];

  const root = document.documentElement;
  const body = document.body;
  const heroTarget = document.getElementById('hero-vanta');
  const heroSection = document.getElementById('hero-section');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let effect = null;
  let libraryPromise = null;
  let syncFrame = null;
  let mountToken = 0;

  function isLightTheme() {
    return root.classList.contains('light') || body.getAttribute('data-theme') === 'light';
  }

  function profileIsOpen() {
    return root.classList.contains('profile-background-paused');
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

    throw lastError || new Error('Unable to load required light-mode library.');
  }

  function ensureLibrary() {
    if (libraryPromise) return libraryPromise;

    libraryPromise = (async () => {
      await loadScriptWithFallback(THREE_URLS, () => Boolean(window.THREE));
      await loadScriptWithFallback(VANTA_URLS, () => Boolean(window.VANTA?.NET));
    })().catch((error) => {
      libraryPromise = null;
      throw error;
    });

    return libraryPromise;
  }

  function heroHeight() {
    return Math.max(heroSection?.getBoundingClientRect().height || 560, 200);
  }

  function destroyEffect() {
    mountToken += 1;
    if (!effect) return;

    try {
      effect.destroy();
    } catch (_) {
      // The static light hero remains usable if WebGL cleanup fails.
    }

    effect = null;
    if (window.vantaEffect) window.vantaEffect = null;
    heroTarget?.classList.remove('vanta-light-active');
  }

  function syncControls() {
    if (!effect || !isLightTheme()) return;
    const paused = profileIsOpen() || document.hidden;
    const reduced = reducedMotion.matches;

    try {
      effect.setOptions({
        mouseControls: !paused && !reduced,
        touchControls: !paused && !reduced
      });
    } catch (_) {
      // Input control is an enhancement; the animation can keep rendering.
    }
  }

  function resizeEffect() {
    if (!effect || !isLightTheme()) return;
    requestAnimationFrame(() => {
      try {
        effect.resize?.();
      } catch (_) {
        // Layout remains intact if Vanta cannot resize on this frame.
      }
    });
  }

  async function mountEffect() {
    const token = ++mountToken;

    if (!heroTarget || !isLightTheme()) {
      destroyEffect();
      return;
    }

    heroTarget.classList.remove('vanta-light-fallback');

    if (effect) {
      syncControls();
      resizeEffect();
      return;
    }

    try {
      await ensureLibrary();
      if (token !== mountToken || !isLightTheme()) return;

      const reduced = reducedMotion.matches;
      effect = window.VANTA.NET({
        el: '#hero-vanta',
        mouseControls: !profileIsOpen() && !reduced,
        touchControls: !profileIsOpen() && !reduced,
        minHeight: heroHeight(),
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x55bfc3,
        backgroundColor: 0xf3f7fc,
        backgroundAlpha: 1,
        points: reduced ? 6.0 : 8.0,
        maxDistance: reduced ? 16.0 : 19.0,
        spacing: reduced ? 19.0 : 18.0
      });

      if (token !== mountToken || !isLightTheme()) {
        destroyEffect();
        return;
      }

      window.vantaEffect = effect;
      heroTarget.classList.remove('vanta-light-fallback');
      heroTarget.classList.add('vanta-light-active');
      syncControls();
      resizeEffect();
    } catch (error) {
      destroyEffect();
      heroTarget?.classList.add('vanta-light-fallback');
      console.warn('Neural Hustle light hero is using its static fallback.', error);
    }
  }

  function syncTheme() {
    if (!heroTarget) return;

    if (!isLightTheme()) {
      destroyEffect();
      heroTarget.classList.remove('vanta-light-fallback');
      return;
    }

    mountEffect();
  }

  function scheduleSync() {
    if (syncFrame !== null) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = null;
      syncTheme();
      syncControls();
    });
  }

  const observer = new MutationObserver(scheduleSync);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  observer.observe(body, { attributes: true, attributeFilter: ['data-theme'] });

  const resizeObserver =
    typeof ResizeObserver === 'function' && heroSection
      ? new ResizeObserver(resizeEffect)
      : null;
  resizeObserver?.observe(heroSection);

  window.addEventListener('resize', resizeEffect, { passive: true });
  window.addEventListener('pageshow', syncTheme);
  window.addEventListener('online', () => {
    if (isLightTheme() && !effect) mountEffect();
  });
  document.addEventListener('visibilitychange', syncControls);
  reducedMotion.addEventListener?.('change', syncTheme);

  syncTheme();
})();
