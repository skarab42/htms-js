import './fixtures/crypto.mock.js';

import path from 'node:path';

import Fastify, { type FastifyInstance } from 'fastify';
import { NoTaskFoundError } from 'htms-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { fastifyHtms } from '../src/index.js';
import { mockRandomUUIDIncrement } from './fixtures/crypto.mock.js';

const root = path.join(import.meta.dirname, 'fixtures/html');

describe('fastifyHtms (environment = development)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(fastifyHtms, { root, environment: 'development' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should serves a matching file', async () => {
    mockRandomUUIDIncrement();

    const response = await app.inject({ method: 'GET', url: '/simple.html' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.body).toContain('<htms-chunk uuid="uuid-test-0000-0000-mock">task A completed</htms-chunk>');
    expect(response.body).toContain('<htms-chunk uuid="uuid-test-0000-0001-mock">task B completed</htms-chunk>');
    expect(response.body).toContain('<script data-htms-remove-on-cleanup>htms.cleanup()</script>');
  });

  it('should ignores non-GET methods', async () => {
    const response = await app.inject({ method: 'POST', url: '/simple.html' });

    expect(response.statusCode).toBe(404);
  });

  it('should log error if no task is found but not break the stream', async () => {
    const spy = vi.spyOn(app.log, 'error');
    const response = await app.inject({ method: 'GET', url: '/index.html' });
    const fixturePath = path.join(root, 'index.html');

    expect(spy).toHaveBeenCalledWith(expect.any(NoTaskFoundError), `No task found for '${fixturePath}'`);

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html; charset=utf-8');
    expect(response.body).toContain(`<!-- Task Module Not Found Error: No task found for '${fixturePath}' -->`);
  });

  it('should ignores non-matching paths and lets Fastify handle 404', async () => {
    const response = await app.inject({ method: 'GET', url: '/not-found.html' });

    expect(response.statusCode).toBe(404);
  });
});

describe('fastifyHtms plugin (environment = production)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(fastifyHtms, { root, environment: 'production' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should log error if no task is found without extended error message in production output', async () => {
    const spy = vi.spyOn(app.log, 'error');
    const response = await app.inject({ method: 'GET', url: '/index.html' });
    const fixturePath = path.join(root, 'index.html');

    expect(spy).toHaveBeenCalledWith(expect.any(NoTaskFoundError), `No task found for '${fixturePath}'`);

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html; charset=utf-8');
    expect(response.body).toContain(`<!-- Task Module Not Found Error -->`);
  });
});
