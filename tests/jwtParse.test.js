import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJwt } from '../src/jwtParse.js';
import { b64urlEncode } from '../src/b64url.js';

function tok(h, p, sig = 'AA') {
  const enc = (o) => b64urlEncode(JSON.stringify(o));
  return `${enc(h)}.${enc(p)}.${sig}`;
}

test('parseJwt splits three segments', () => {
  // encode manually without depending on impl for header/payload text
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify({ sub: 'u1' })).toString('base64url');
  const t = `${h}.${p}.qq`;
  const r = parseJwt(t);
  assert.equal(r.header.alg, 'HS256');
  assert.equal(r.payload.sub, 'u1');
  assert.equal(r.signingInput, `${h}.${p}`);
  assert.ok(r.sigBytes instanceof Uint8Array);
});

test('parseJwt rejects malformed', () => {
  assert.throws(() => parseJwt('a.b'));
  assert.throws(() => parseJwt(''));
});
