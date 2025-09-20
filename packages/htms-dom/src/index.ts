/* eslint-disable no-console */

import { type CommitMode, defaultCommitMode, isCommitMode } from './commit-mode';

export function parseCommitMode(value: string | null): CommitMode {
  if (isCommitMode(value)) {
    return value;
  }

  console.error(`[htms-chunk] unknown commit mode '${value}', fallback to '${defaultCommitMode}'`);

  return defaultCommitMode;
}

export function toFragment(html: string): DocumentFragment {
  const template = document.createElement('template');

  template.innerHTML = html;

  return template.content;
}

export function commit(host: Element, html: string, mode: CommitMode): void {
  const fragment = toFragment(html);

  switch (mode) {
    case 'content': {
      host.replaceChildren(fragment);
      host.setAttribute('aria-busy', 'false');
      break;
    }
    case 'append': {
      host.append(fragment);
      host.setAttribute('aria-busy', 'false');
      break;
    }
    case 'prepend': {
      host.prepend(fragment);
      host.setAttribute('aria-busy', 'false');
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

export function removeHtmsAttributes(host: Element): void {
  for (const attribute of host.attributes) {
    if (attribute.name.startsWith('data-htms')) {
      host.removeAttribute(attribute.name);
    }
  }
}

export class HTMLChunk extends HTMLElement {
  connectedCallback(): void {
    const uuidValue = this.getAttribute('uuid');
    const commitValue = this.getAttribute('commit');
    const partialValue = this.getAttribute('partial');

    if (!uuidValue) {
      console.error("[htms-chunk] missing 'uuid' attribute:", this);
      return;
    }

    const selector = `[data-htms-uuid="${uuidValue}"]`;
    const host = document.querySelector(selector);

    if (!host) {
      console.error(`[htms-chunk] target element not found with selector '${selector}'`);
      return;
    }

    requestAnimationFrame(() => {
      commit(host, this.innerHTML, parseCommitMode(commitValue));

      if (typeof partialValue !== 'string' || partialValue.trim() === 'false') {
        removeHtmsAttributes(host);
      }

      this.remove();
    });
  }
}

export function setup(): void {
  if (!customElements.get('htms-chunk')) {
    customElements.define('htms-chunk', HTMLChunk);
  }
}

export function cleanup(): void {
  for (const element of document.querySelectorAll('[data-htms-remove-on-cleanup]')) {
    element.remove();
  }
}
