import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { createHtmsFileModulePipeline } from 'htms-js';

const app = new Hono();

app.get('/', (context) => {
  context.header('Content-Type', 'text/html; charset=utf-8');

  return stream(context, async (api) => {
    const webStream = createHtmsFileModulePipeline('../_pages/index.html', { extension: 'ts' });

    await api.pipe(webStream as ReadableStream<string>);
  });
});

serve({ fetch: app.fetch, port: 4200 }, () => {
  console.log('Hono listening on http://localhost:4200');
});
