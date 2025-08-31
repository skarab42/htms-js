export function sleep(ms?: number): Promise<void> {
  const delay = ms ?? Math.floor(Math.random() * 8000);

  return new Promise((resolve) => setTimeout(resolve, delay));
}
