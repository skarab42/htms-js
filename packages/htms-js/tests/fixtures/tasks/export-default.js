import { sleep } from './helpers.js';

export default {
  async taskA(...parameters) {
    await sleep(10);

    return `default exported task A completed: ${JSON.stringify(parameters)}`;
  },
  async taskB(...parameters) {
    await sleep(20);

    return `default exported task B completed: ${JSON.stringify(parameters)}`;
  },
};
