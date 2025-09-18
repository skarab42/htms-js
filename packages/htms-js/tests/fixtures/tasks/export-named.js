import { sleep } from './helpers.js';

export async function taskA(value) {
  await sleep(10);

  return `named exported task A completed: ${JSON.stringify(value)}`;
}

export async function taskB(value) {
  await sleep(20);

  return `named exported task B completed: ${JSON.stringify(value)}`;
}
