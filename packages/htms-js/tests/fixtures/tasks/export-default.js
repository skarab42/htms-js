import { sleep } from './helpers.js';

export default {
  async taskA(value) {
    await sleep(10);

    return `default exported task A completed: ${JSON.stringify(value)}`;
  },
  async taskB(value) {
    await sleep(20);

    return `default exported task B completed: ${JSON.stringify(value)}`;
  },
};
