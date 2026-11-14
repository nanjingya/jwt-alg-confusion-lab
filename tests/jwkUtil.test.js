import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprintJwk } from '../src/jwkUtil.js';

test('fingerprint stable for same jwk', async () => {
  const jwk = { kty: 'oct', k: 'YWJj' };
  const a = await fingerprintJwk(jwk);
  const b = await fingerprintJwk({ k: 'YWJj', kty: 'oct' });
  assert.equal(a, b);
  assert.notEqual(a, await fingerprintJwk({ kty: 'oct', k: 'eHl6' }));
});
