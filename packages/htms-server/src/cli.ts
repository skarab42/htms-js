#!/usr/bin/env node
import path from 'node:path';

import { cac } from 'cac';

import { start } from './index.js';

const cli = cac('htms');

cli
  .command('start', 'Start the htms server')
  .option('--host <host>', 'Host to bind', { default: 'localhost' })
  .option('--port <port>', 'Port to listen on', { default: 4200 })
  .option('--root <path>', 'Root directory to serve', { default: './public' })
  .option('--environment <env>', 'Environment (production|development)', { default: 'production' })
  .action(async (options) => {
    await start({
      host: options.host,
      port: options.port ? Number(options.port) : undefined,
      root: path.resolve(options.root),
      environment: options.environment,
    });
  });

cli.help();
cli.parse();
