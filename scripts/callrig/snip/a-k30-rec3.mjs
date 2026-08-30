/* Close any open dialog, then start recording. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.evaluate(DOM);
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/recording/.test(u)) return;
    let b=null; try { b=(await r.text()).slice(0,300); } catch {}
    seen.push({ m:r.request().method(), u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(), res:b });
  });
  const t = page.locator('[data-testid="recording-start-access-trigger"]');
  out.trigger = await t.count();
  if (!out.trigger) {
    out.buttons = await page.evaluate(() => { const q=window.__qa;
      return [...document.querySelectorAll('button')].filter(e=>q.vis(e)).map(e=>e.getAttribute('data-testid')).filter(Boolean); });
    return out;
  }
  await t.click(); await page.waitForTimeout(2000);
  const btn = page.locator('button', { hasText: /^Start recording$/ });
  out.startCount = await btn.count();
  if (out.startCount) { await btn.first().click(); await page.waitForTimeout(6000); }
  out.api = seen;
  out.badge = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-recording-badge"]');
    return b ? b.innerText : null;
  });
  return out;
};
