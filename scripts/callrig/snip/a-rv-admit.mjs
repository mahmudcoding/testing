import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  const open = await page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    return !!l && window.__qa.boxVis(l);
  });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  await page.evaluate(DOM);
  const aa = page.locator('button[aria-label^="Admit all"]').first();
  out.admitAll = (await aa.count()) ? await aa.getAttribute('aria-label') : null;
  if (out.admitAll) { await aa.click(); await page.waitForTimeout(7000); }
  await page.evaluate(DOM);
  out.roster = await page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    const panel = l && l.closest('aside,[role=dialog],div');
    return { rows: l ? [...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>r.innerText.replace(/\s+/g,' ').trim().slice(0,40)) : null,
             panelText: l ? (l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,300) : null };
  });
  return out;
};
