import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { reqs: [] };
  page.on('response', r => { if (/\/ban/.test(r.url())) out.reqs.push({m:r.request().method(), u:r.url().replace(/https:\/\/[^/]+/,''), s:r.status()}); });
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); await page.evaluate(DOM); }
  out.before = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); const h=l?(l.closest('aside')||l.parentElement):null; return h?h.innerText.replace(/\s+/g,' ').slice(0,200):null; });
  out.clicked = await page.evaluate(() => window.__qa.clickDeepest(/^Unban/));
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  out.after = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); const h=l?(l.closest('aside')||l.parentElement):null; return h?h.innerText.replace(/\s+/g,' ').slice(0,200):null; });
  return out;
};
