import { DOM } from './lib.mjs';
import { safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); await page.evaluate(DOM); }
  out.admitBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.vis)
      .map(b=>window.__qa.nameOf(b).replace(/\s+/g,' ')).filter(n=>/^Admit|^Deny/.test(n)));
  for (let i=0;i<4;i++) {
    const r = await page.evaluate(() => window.__qa.clickDeepest(/^Admit/));
    if (!r.ok) break;
    out.clicked = (out.clicked||[]).concat(r.name);
    await page.waitForTimeout(4000);
    await page.evaluate(DOM);
  }
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  out.roster = await page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    return { rows: l ? [...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>r.innerText.replace(/\s+/g,' ').trim().slice(0,40)) : null,
             panelText: l ? (l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,320) : null };
  });
  return out;
};
