// Bootstrap the global Neural Hustle atmosphere from the existing deferred entry point.
// The site stays fully usable if the visual layer or its CDN dependencies fail.
(() => {
  if (!document.querySelector('link[data-neural-atmosphere-styles]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'assets/css/neural-atmosphere.css';
    stylesheet.dataset.neuralAtmosphereStyles = 'true';
    document.head.appendChild(stylesheet);
  }

  // Retire the legacy hero-only Vanta runtime immediately after parsing, before
  // the replacement module finishes loading, so two animations never continue
  // running together during normal use.
  try {
    window.vantaEffect?.destroy?.();
  } catch (_) {
    // Background visuals are progressive enhancement only.
  }
  window.vantaEffect = null;
  document.querySelectorAll('#hero-vanta > canvas, #hero-vanta .vanta-canvas').forEach((canvas) => canvas.remove());

  if (document.querySelector('script[data-neural-atmosphere]')) return;
  const script = document.createElement('script');
  script.src = 'assets/js/neural-atmosphere.js';
  script.async = true;
  script.dataset.neuralAtmosphere = 'true';
  document.head.appendChild(script);
})();

// Native FormSubmit upload; selection stays local until the visitor submits.
(() => {
  const input = document.getElementById('contactAttachment');
  if (!input) return;
  const error = document.getElementById('attachmentError');
  const clear = input.closest('.attachment-field').querySelector('.attachment-clear');
  const control = input.closest('.attachment-control');
  const filename = control.querySelector('.attachment-filename');
  // Keep the native input's accessible file value; display one clean visual label.
  control.classList.add('has-filename-display');
  filename.hidden = false;
  // FormSubmit documents a 10 MB combined attachment limit. There is one file here.
  const maxBytes = 10_000_000;
  const types = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  function validateAttachment() {
    const file = input.files[0];
    let message = '';
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      const mime = file.type.toLowerCase();
      if (!Object.hasOwn(types, extension) || (mime && mime !== 'application/octet-stream' && mime !== types[extension])) {
        message = 'Choose a PDF, DOC or DOCX document.';
      } else if (file.size > maxBytes) {
        message = 'This file is too large. Choose a document of 10 MB or less.';
      }
    }
    input.setCustomValidity(message);
    input.setAttribute('aria-invalid', String(Boolean(message)));
    input.title = file?.name || '';
    filename.textContent = file?.name || 'No file chosen';
    filename.title = file?.name || '';
    error.textContent = message;
    error.hidden = !message;
    clear.hidden = !file;
  }

  input.addEventListener('change', validateAttachment);
  clear.addEventListener('click', () => {
    input.value = '';
    validateAttachment();
    input.focus();
  });
  input.form.addEventListener('reset', () => {
    // The native reset clears the file after the reset event has dispatched.
    queueMicrotask(validateAttachment);
  });
})();
