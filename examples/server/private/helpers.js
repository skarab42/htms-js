export async function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function randomBetween(min, max) {
  if (min > max) [min, max] = [max, min];

  return Math.min(max, Math.random() * (max - min + 1) + min);
}

export function formatCompact(input) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(input);
}

export function formatPercent(input, rounded = true) {
  const fractionDigits = rounded || Number.isInteger(input) ? 0 : 1;

  return new Intl.NumberFormat('en', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(input / 100);
}
