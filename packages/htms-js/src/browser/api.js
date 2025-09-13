/* eslint-disable no-console */
(() => {
  customElements.define(
    'htms-chunk',
    class HTMLChunk extends HTMLElement {
      connectedCallback() {
        const uuid = this.getAttribute('uuid');

        if (!uuid) {
          console.warn("[htms-chunk] missing 'uuid' attribute:", this);
          return;
        }

        const selector = `[data-htms-uuid="${uuid}"]`;
        const targetElement = document.querySelector(selector);

        if (!targetElement) {
          console.warn(`[htms-chunk] target element not found with selector '${selector}'`);
          return;
        }

        requestAnimationFrame(() => {
          targetElement.outerHTML = this.innerHTML;
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
