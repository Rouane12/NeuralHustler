// Light-mode-only Neural Hustle hero effect.
// Restores the previously used Vanta NET treatment without loading Vanta or
// Three.js in dark mode.
(() => {
  'use strict';

  const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js';
  const VANTA_URL = 'https://cdn.jsdelivr.net/npm/vanta/dist/vanta.net.min.js';

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

  function ensureLibrary() {
    if (libraryPromise) return libraryPromise;

    libraryPromise = (async () => {
      await loadScriptOnce(THREE_URL, () => Boolean(window.THREE));
      await loadScriptOnce(VANTA_URL, () => Boolean(window.VANTA?.NET));
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

    try {
      effect.setOptions({
        mouseControls: !paused,
        touchControls: !paused
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

    if (!heroTarget || !isLightTheme() || reducedMotion.matches) {
      destroyEffect();
      return;
    }

    if (effect) {
      syncControls();
      resizeEffect();
      return;
    }

    try {
      await ensureLibrary();
      if (token !== mountToken || !isLightTheme() || reducedMotion.matches) return;

      effect = window.VANTA.NET({
        el: '#hero-vanta',
        mouseControls: !profileIsOpen(),
        touchControls: !profileIsOpen(),
        minHeight: heroHeight(),
        minWidth: 200.0,
        scale: 1.4,
        scaleMobile: 1.8,
        color: 0x55bfc3,
        backgroundColor: 0xf3f7fc,
        backgroundAlpha: 1,
        points: 10.0,
        maxDistance: 21.0,
        spacing: 16.0
      });

      if (token !== mountToken || !isLightTheme()) {
        destroyEffect();
        return;
      }

      window.vantaEffect = effect;
      heroTarget.classList.add('vanta-light-active');
      syncControls();
      resizeEffect();
    } catch (error) {
      destroyEffect();
      console.warn('Neural Hustle light hero is using its static fallback.', error);
    }
  }

  function syncTheme() {
    if (isLightTheme() && !reducedMotion.matches) mountEffect();
    else destroyEffect();
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
  document.addEventListener('visibilitychange', syncControls);
  reducedMotion.addEventListener?.('change', syncTheme);

  syncTheme();
})();
