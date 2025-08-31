import { randomUUID, type UUID } from 'node:crypto';

import { type Mock, vi } from 'vitest';

vi.mock('node:crypto', async () => {
  const actual = await vi.importActual<typeof import('node:crypto')>('node:crypto');

  return { ...actual, randomUUID: vi.fn(() => actual.randomUUID()) };
});

export function mockRandomUUIDOnce(uuid: UUID): void {
  (randomUUID as Mock).mockReturnValueOnce(uuid);
}
