import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createPublicKey, sign as nodeSign, generateKeyPairSync } from 'node:crypto';
import { verifyJwt } from '../src/jwtVerify.js';

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}
function makeHs256(payload, secret) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify(payload));
  const si = `${h}.${p}`;
  const sig = createHmac('sha256', secret).update(si).digest();
  return `${si}.${b64url(sig)}`;
}

test('rejects alg none', async () => {
  const h = b64url(JSON.stringify({ alg: 'none' }));
  const p = b64url(JSON.stringify({ sub: 'x' }));
  const r = await verifyJwt(`${h}.${p}.`, { hmacSecret: 'lab-secret' });
  assert.equal(r.ok, false);
});

test('HS256 verifies with secret', async () => {
  const token = makeHs256({ sub: 'ok' }, 'lab-secret');
  const r = await verifyJwt(token, { hmacSecret: 'lab-secret' });
  assert.equal(r.ok, true);
  assert.equal(r.payload.sub, 'ok');
});

test('HS256 does not accept RSA public key material as hmac (alg confusion)', async () => {
  const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = publicKey.export({ type: 'spki', format: 'pem' });
  const token = makeHs256({ sub: 'evil' }, pem);
  const r = await verifyJwt(token, { hmacSecret: 'lab-secret', publicKeyPem: pem });
  assert.equal(r.ok, false);
});

test('jku outside allowlist rejected', async () => {
  const h = b64url(JSON.stringify({ alg: 'RS256', jku: 'https://evil.example/jwks' }));
  const p = b64url(JSON.stringify({ sub: 'x' }));
  const r = await verifyJwt(`${h}.${p}.aa`, {
    jkuAllowlist: ['https://keys.example.com/jwks'],
    fetchJwk: async () => ({ kty: 'RSA' }),
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'jku-not-allowed');
});
