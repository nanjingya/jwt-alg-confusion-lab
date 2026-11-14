import test from 'node:test';
import assert from 'node:assert/strict';
import { b64urlDecode, b64urlEncode } from '../src/b64url.js';

test('b64url roundtrip ascii', () => {
  const s = 'hello-jwt';
  const enc = b64urlEncode(s);
  assert.equal(enc.includes('+'), false);
  assert.equal(enc.includes('/'), false);
  const dec = new TextDecoder().decode(b64urlDecode(enc));
  assert.equal(dec, s);
});

test('b64urlDecode accepts missing padding', () => {
  const full = Buffer.from('ab').toString('base64url');
  const nopad = full.replace(/=+$/, '');
  assert.deepEqual(b64urlDecode(nopad), b64urlDecode(full.length % 4 === 0 ? full : full));
  assert.equal(b64urlDecode(nopad).byteLength, 2);
});

test('b64urlDecode rejects illegal charset', () => {
  assert.throws(() => b64urlDecode('@@@'));
});
