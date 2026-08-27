import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ms = Number(process.env.QA_MS || 75000), step = Number(process.env.QA_STEP || 500);
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); await page.evaluate(DOM); }
  const t0=Date.now(); const states=[]; let last=null, n=0;
  while (Date.now()-t0 < ms) {
    let s; try { s = await page.evaluate(() => {
      const l=document.querySelector('[data-testid="participants-list"]'); const h=l?(l.closest('aside')||l.parentElement):null;
      const t = h ? h.innerText.replace(/\s+/g,' ') : '(no panel)';
      const seats = t.replace(/^.*let them in again\./,'').trim();
      return { vis: document.visibilityState, t: seats.slice(0,240) };
    }); } catch { s={vis:'?',t:'(eval failed)'}; }
    n++;
    if (s.t !== last) { states.push({ at: Date.now(), ms: Date.now()-t0, vis: s.vis, text: s.t }); last=s.t; }
    await page.waitForTimeout(step);
  }
  return { startedAt: t0, samples:n, states };
};
