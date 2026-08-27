import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const open = await page.evaluate(() => { const l=document.querySelector('[data-testid="participants-list"]'); return !!l && window.__qa.boxVis(l); });
  if (!open) { await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); await page.evaluate(DOM); }
  const perms = await page.evaluate(async (id) => {
    try { const r = await fetch(`/api/v1/meeting/${id}/my-permissions`,{credentials:'include'}); return await r.json(); } catch(e){ return String(e); }
  }, process.env.QA_CALL);
  return await page.evaluate((p) => {
    const l = document.querySelector('[data-testid="participants-list"]');
    const host = l ? (l.closest('aside') || l.parentElement) : null;
    return { url: location.pathname, myPerms: p,
      rows: l ? [...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>r.innerText.replace(/\s+/g,' ').trim().slice(0,44)) : null,
      panelText: host ? host.innerText.replace(/\s+/g,' ').slice(0,400) : null,
      blockedVisible: !!host && /BLOCKED/.test(host.innerText) };
  }, perms);
};
