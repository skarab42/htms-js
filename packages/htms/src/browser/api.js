(() => {
  customElements.define(
    'htms-chunk',
    class HTMLChunk extends HTMLElement {
      connectedCallback() {
        const uuid = this.getAttribute('uuid');

        if (!uuid) {
          console.warn('[htms-chunk] undefined uuid attribute:', this);
          return;
        }

        const selector = `[data-htms-uuid="${uuid}"]`;
        const element = document.querySelector(selector);

        if (!element) {
          console.warn('[htms-chunk] element not found with selector:', selector);
          return;
        }

        requestAnimationFrame(() => {
          element.outerHTML = this.innerHTML;
          this.remove();
        });
      }
    },
  );

  function cleanup() {
    for (const element of document.querySelectorAll('[data-htms-remove-on-cleanup]')) {
      element.remove();
    }
  }

  Object.defineProperty(globalThis, 'htms', {
    value: { cleanup },
    writable: false,
    configurable: false,
  });
})();
