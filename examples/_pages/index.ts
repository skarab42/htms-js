function sleep(ms?: number): Promise<void> {
  const delay = ms ?? Math.floor(Math.random() * 8000);

  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function foo(): Promise<string> {
  await sleep(1000);

  return 'Foo task completed';
}

export async function bar(): Promise<string> {
  await sleep(2000);

  return 'Bar task completed';
}

export async function baz(): Promise<string> {
  await sleep(3000);

  return 'Baz task completed';
}
