import { randomUUID, type UUID } from 'node:crypto';

import { type Mock, vi } from 'vitest';

vi.mock('node:crypto', async () => {
  const actual = await vi.importActual<typeof import('node:crypto')>('node:crypto');

  return { ...actual, randomUUID: vi.fn(() => actual.randomUUID()) };
});

export function mockRandomUUIDOnce(uuid: UUID): void {
  (randomUUID as Mock).mockReturnValueOnce(uuid);
}

export function mockRandomUUIDIncrement(from = 0): void {
  let count = from;

  (randomUUID as Mock).mockImplementation(() => {
    return `uuid-test-0000-${(count++).toString().padStart(4, '0')}-mock`;
  });
}
