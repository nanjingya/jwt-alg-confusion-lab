export function bindControls({ statusEl, statsEl, outEl, onLoad, onVerify, onExport }) {
  const loadBtn = document.querySelector('#btn-load');
  const verifyBtn = document.querySelector('#btn-verify');
  const exportBtn = document.querySelector('#btn-export');
  if (loadBtn) loadBtn.onclick = () => onLoad?.();
  if (verifyBtn) verifyBtn.onclick = () => onVerify?.();
  if (exportBtn) exportBtn.onclick = () => onExport?.();
  if (statusEl) statusEl.textContent = 'ready';
  return { setStats: (s) => { if (statsEl) statsEl.textContent = JSON.stringify(s); }, setOut: (o) => { if (outEl) outEl.textContent = typeof o === 'string' ? o : JSON.stringify(o, null, 2); } };
}
