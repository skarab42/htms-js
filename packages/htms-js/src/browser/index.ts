import fs from 'node:fs';
import { createRequire } from 'node:module';

let htmsDomSource: string;

export function resolveHtmsDomModulePath(minified = true): string {
  const require = createRequire(import.meta.url);

  return require.resolve(minified ? 'htms-dom/umd-min' : 'htms-dom/umd');
}

export function getHtmsDomSource(minified = true): string {
  if (!htmsDomSource) {
    htmsDomSource = fs.readFileSync(resolveHtmsDomModulePath(minified), 'utf8');
  }

  return htmsDomSource;
}

// TODO: implement `getHtmsDomUrl(minified: boolean): string` when `htms-dom@0.1.0` is released
