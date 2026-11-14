import { bindControls } from './ui/controls.js';
import { runFixtures } from './engine.js';

const statusEl = document.querySelector('#status');
const statsEl = document.querySelector('#stats');
const outEl = document.querySelector('#out');
let tokens = [];
let last = null;

const ui = bindControls({
  statusEl, statsEl, outEl,
  onLoad: async () => {
    const res = await fetch('./fixtures/tokens.json');
    tokens = await res.json();
    ui.setOut({ loaded: tokens.length });
  },
  onVerify: async () => {
    last = await runFixtures(tokens, {
      hmacSecret: 'lab-secret',
      jkuAllowlist: ['https://keys.example.com/jwks'],
      fetchJwk: async () => ({ kty: 'oct', k: 'lab' }),
    });
    ui.setStats(last.stats);
    ui.setOut(last);
  },
  onExport: () => ui.setOut(last || { error: 'no-result' }),
});
