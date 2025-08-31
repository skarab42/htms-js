import { sleep } from './helpers.js';

export default {
  async taskA() {
    await sleep(10);

    return 'default exported task A completed';
  },
  async taskB() {
    await sleep(20);

    return 'default exported task B completed';
  },
};
