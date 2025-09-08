import { formatCompact, formatPercent, randomBetween, sleep } from '../private/helpers.js';

export async function salesData() {
  await sleep(800);

  const metric = formatCompact(randomBetween(10_000, 42_000));
  const growth = formatPercent(randomBetween(20, 60));

  return `<div class="card complete">
    <div class="status ready">COMPLETED</div>
    <div class="metric">${metric}</div>
    <h3>Pages Streamed</h3>
    <p class="label">This month</p>
    <p>+${growth} growth 🚀</p>
  </div>`;
}

export async function userStats() {
  await sleep(1500);

  const metric = formatCompact(randomBetween(1000, 5000));
  const growth = formatPercent(randomBetween(20, 60));

  return `<div class="card complete">
    <div class="status ready">COMPLETED</div>
    <div class="metric">${metric}</div>
    <h3>Active Users</h3>
    <p class="label">Last 24 hours</p>
    <p>+${growth} from yesterday 📈</p>
  </div>`;
}

export async function analytics() {
  await sleep(2500);

  const metric = formatPercent(randomBetween(98, 99.9), false);

  return `<div class="card complete">
    <div class="status ready">COMPLETED</div>
    <div class="metric">${metric}</div>
    <h3>Performance</h3>
    <p class="label">Core Web Vitals</p>
    <p>HTMS rocks! ⚡</p>
  </div>`;
}
