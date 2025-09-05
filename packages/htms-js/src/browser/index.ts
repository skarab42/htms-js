import fs from 'node:fs';
import path from 'node:path';

export function getApiSource(): string {
  return fs.readFileSync(path.resolve(import.meta.dirname, 'api.js'), 'utf8');
}
