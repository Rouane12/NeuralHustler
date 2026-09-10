// Load the global Neural Hustle atmosphere from an existing deferred entry point.
// Keeping this bootstrap here avoids adding another parser-blocking dependency to
// the static GitHub Pages document.
(() => {
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
