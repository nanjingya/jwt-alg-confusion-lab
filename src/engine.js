import { verifyJwt } from './jwtVerify.js';

export async function runFixtures(tokens, opts) {
  const accepted = [];
  const rejected = [];
  for (const item of tokens) {
    try {
      const r = await verifyJwt(item.token, { ...opts, ...item.opts });
      if (r.ok) accepted.push({ id: item.id, payload: r.payload });
      else rejected.push({ id: item.id, reason: r.reason || 'verify-failed' });
    } catch (e) {
      rejected.push({ id: item.id, reason: String(e.message || e) });
    }
  }
  return { accepted, rejected, stats: { accepted: accepted.length, rejected: rejected.length } };
}
