import { sleep } from './helpers.js';

export async function taskA() {
  await sleep(10);

  return 'named exported task A completed';
}

export async function taskB() {
  await sleep(20);

  return 'named exported task B completed';
}
