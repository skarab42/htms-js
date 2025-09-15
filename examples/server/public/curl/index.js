import { formatCompact, minRead, randomBetween, sleep } from '../../private/helpers.js';

export async function getNews() {
  await sleep(1000);

  return `
    <ul>
      <li><strong>Breaking:</strong> New release is out. ${minRead()}</a></li>
      <li><strong>Update:</strong> Minor fixes shipped. ${minRead()}</li>
    </ul>
  `;
}

export async function getStats() {
  await sleep(1500);

  const users = Math.round(randomBetween(1, 100));
  const ping = Math.round(randomBetween(42, 142));
  const chunks = formatCompact(randomBetween(10_000, 42_000));

  return `
    <ul>
      <li>Users online: <strong>${users}</strong></li>
      <li>Avg. latency: <strong>${ping}ms</strong></li>
      <li>Chunks delivered: <strong>${chunks}</strong></li>
    </ul>
  `;
}
