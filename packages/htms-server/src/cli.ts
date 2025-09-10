#!/usr/bin/env node
import path from 'node:path';

import { cac } from 'cac';

import { start } from './index.js';

const cli = cac('htms-server');

try {
  cli
    .command('start', 'Start the htms server')
    .option('--host <host>', 'Host to bind', { default: 'localhost' })
    .option('--port <port>', 'Port to listen on', { default: 4200 })
    .option('--root <path>', 'Root directory to serve', { default: './public' })
    .option('--environment <env>', 'Environment (production|development)', { default: 'production' })
    .option('--compression', 'Enable response compression', { default: true })
    .option('--cache-module', 'Enable module caching (true if undefined and development)', { default: undefined })
    .option('--logger', 'Enable logging (true if undefined and development)', { default: undefined })
    .action(async (options) => {
      await start({
        host: options.host,
        port: options.port,
        root: path.resolve(options.root),
        environment: options.environment,
        compression: options.compression,
        cacheModule: options.cacheModule,
        logger: options.logger,
      });
    });

  cli.help();
  cli.parse(process.argv);
} catch (error) {
  console.log(`[error] ${(error as Error).message}\n`);
  cli.outputHelp();
}
