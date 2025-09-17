import { sleep } from './helpers.js';

export async function taskA(...parameters) {
  await sleep(10);

  return `named exported task A completed: ${JSON.stringify(parameters)}`;
}

export async function taskB(...parameters) {
  await sleep(20);

  return `named exported task B completed: ${JSON.stringify(parameters)}`;
}
