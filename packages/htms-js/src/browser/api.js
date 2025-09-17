/* eslint-disable no-console */
(() => {
  customElements.define(
    'htms-chunk',
    class HTMLChunk extends HTMLElement {
      connectedCallback() {
        const uuid = this.getAttribute('uuid');
        const commitMode = this.getAttribute('commit');

        if (!uuid) {
          console.warn("[htms-chunk] missing 'uuid' attribute:", this);
          return;
        }

        const selector = `[data-htms-uuid="${uuid}"]`;
        const host = document.querySelector(selector);

        if (!host) {
          console.warn(`[htms-chunk] target element not found with selector '${selector}'`);
          return;
        }

        requestAnimationFrame(() => {
          commit(host, this.innerHTML, commitMode);
          removeHtmsAttributes(host);
          this.remove();
        });
      }
    },
  );

  /**
   * @param {string} html
   */
  function toFragment(html) {
    const template = document.createElement('template');

    template.innerHTML = html;

    return template.content;
  }

  /**
   * @param {Element} host
   * @param {string} html
   * @param {unknown} mode
   */
  function commit(host, html, mode) {
    const fragment = toFragment(html);

    switch (mode) {
      case 'content': {
        host.replaceChildren(fragment);
        host.setAttribute('aria-busy', 'false');
        break;
      }
      case 'append': {
        host.append(fragment);
        break;
      }
      case 'prepend': {
        host.prepend(fragment);
        break;
      }
      case 'before': {
        host.before(fragment);
        break;
      }
      case 'after': {
        host.after(fragment);
        break;
      }
      default: {
        host.replaceWith(fragment);
        break;
      }
    }
  }

  /**
   * @param {Element} host
   */
  function removeHtmsAttributes(host) {
    for (const attribute of host.attributes) {
      if (attribute.name.startsWith('data-htms')) {
        host.removeAttribute(attribute.name);
      }
    }
  }

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
