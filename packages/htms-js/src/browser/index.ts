import fs from 'node:fs';
import path from 'node:path';

const api = path.resolve(import.meta.dirname, 'api.js');
const min = path.resolve(import.meta.dirname, 'api.min.js');

let source: string;

export function getApiSource(): string {
  if (!source) {
    source = fs.readFileSync(fs.existsSync(min) ? min : api, 'utf8');
  }

  return source;
}
