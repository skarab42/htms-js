import { minRead, sleep } from '../../private/helpers.js';

export async function getMostUpvoted() {
  await sleep(300);

  return `
    <article class="most-upvoted">
      <h3>htms-js v0.3.0 is out!</h3>
      <p>Now you can nest modules and HTMS will pick the right scope for each placeholder.</p>
      ${minRead()}
    </article>
  `;
}

export async function getLastPublished() {
  await sleep(500);

  return `
    <article>
      <h3>Streaming HTML chunks</h3>
      <p>How HTMS progressively fills placeholders during the response.</p>
      ${minRead()}
    </article>
    <article>
      <h3>Server-driven UI</h3>
      <p>Sending UI fragments directly from the server without a SPA.</p>
      ${minRead()}
    </article>
  `;
}
