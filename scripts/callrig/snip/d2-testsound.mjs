const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/calls', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  // instrument every plausible audio path BEFORE the click
  await page.evaluate(() => {
    window.__snd = { audioCtor: 0, ctxCtor: 0, play: 0, bufSrc: 0, osc: 0, setSinkId: 0, errors: [] };
    const A = window.Audio; window.Audio = function (...a) { window.__snd.audioCtor++; return new A(...a); };
    for (const k of ['AudioContext', 'webkitAudioContext']) {
      const C = window[k]; if (!C) continue;
      window[k] = function (...a) { window.__snd.ctxCtor++; const c = new C(...a);
        const cbs = c.createBufferSource.bind(c); c.createBufferSource = () => { window.__snd.bufSrc++; return cbs(); };
        const osc = c.createOscillator.bind(c); c.createOscillator = () => { window.__snd.osc++; return osc(); };
        return c; };
      window[k].prototype = C.prototype;
    }
    const p = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) { window.__snd.play++; return p.apply(this, a); };
    if (HTMLMediaElement.prototype.setSinkId) { const s = HTMLMediaElement.prototype.setSinkId;
      HTMLMediaElement.prototype.setSinkId = function (...a) { window.__snd.setSinkId++; return s.apply(this, a); }; }
    window.addEventListener('error', e => window.__snd.errors.push(String(e.message).slice(0, 80)));
    window.addEventListener('unhandledrejection', e => window.__snd.errors.push('rej: ' + String(e.reason).slice(0, 80)));
  });
  const btn = page.locator('button[aria-label="Play test sound on the selected speaker"]').first();
  if (!(await btn.count())) return { err: 'button not found' };
  await btn.scrollIntoViewIfNeeded();
  const labelBefore = (await btn.innerText()).trim();
  const disabledBefore = await btn.isDisabled();
  // poll the button's own text/state from before the click
  const seen = new Set([labelBefore]);
  const poll = setInterval(async () => { try { const t = (await btn.innerText()).trim(); seen.add(t); } catch {} }, 200);
  await btn.click();
  await page.waitForTimeout(4000);
  clearInterval(poll);
  const snd = await page.evaluate(() => window.__snd);
  const notices = await page.evaluate(`(() => { const vis = ${VIS};
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis)
      .map(e=>(e.innerText||'').trim()).filter(Boolean).slice(0,4); })()`);
  return { labelBefore, disabledBefore, labelsSeenDuring: [...seen], audioActivity: snd, notices,
           consoleErrors: snd.errors };
};
