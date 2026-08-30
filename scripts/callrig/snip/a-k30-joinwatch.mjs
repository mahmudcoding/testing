/* Walk the whole door (lobby -> Join -> password -> in) polling ~300ms from BEFORE the
   first click, and record the first moment any visible text mentions recording. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = { samples: [] };
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);

  const snap = () => page.evaluate(() => {
    const q = window.__qa;
    const leaves = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && q.vis(e));
    const rec = [...new Set(leaves.map(e => e.textContent.trim()).filter(t => /record/i.test(t)))];
    const micBtn = [...document.querySelectorAll('button')].filter(q.vis)
      .find(e => /microphone/i.test(e.getAttribute('aria-label') || e.textContent || ''));
    return {
      vs: document.visibilityState,
      screen: document.querySelector('[data-testid="call-password-gate"]') ? 'password'
            : document.querySelector('[data-testid="lobby-page"]') ? 'lobby'
            : document.querySelector('[data-testid="call-overlay-expanded"]') ? 'in-call' : 'other',
      rec,
      mic: micBtn ? { label: (micBtn.getAttribute('aria-label')||micBtn.textContent||'').trim().slice(0,30),
                      pressed: micBtn.getAttribute('aria-pressed'), dstate: micBtn.getAttribute('data-state') } : null,
    };
  });

  const t0 = Date.now();
  const push = async (tag) => out.samples.push({ t: Date.now() - t0, tag, ...(await snap()) });
  await push('before-join');

  // press Join in the lobby
  await page.locator('[data-testid="lobby-join"]').click();
  for (let i = 0; i < 12; i++) { await push('after-lobby-join'); await page.waitForTimeout(300); }

  // password gate
  const inp = page.locator('[data-testid="call-password-input"]');
  if (await inp.count()) {
    await inp.fill('Secret123');
    await page.locator('button[type=submit]').first().click();
  }
  for (let i = 0; i < 45; i++) { await push('after-password'); await page.waitForTimeout(300); }

  out.firstRecordingMention = out.samples.find(s => s.rec.length) || null;
  out.enteredCallAt = (out.samples.find(s => s.screen === 'in-call') || {}).t ?? null;
  out.lastSample = out.samples[out.samples.length - 1];
  // compress: only transitions
  out.transitions = out.samples.filter((s, i) =>
    i === 0 || s.screen !== out.samples[i-1].screen || s.rec.length !== out.samples[i-1].rec.length);
  delete out.samples;
  return out;
};
