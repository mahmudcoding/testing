import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if ((await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis)
      .map(r=>({txt:(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,70),
                marks:[...r.querySelectorAll('[data-testid],[aria-label],svg')]
                  .map(x=>x.getAttribute('data-testid')||x.getAttribute('aria-label')||(x.tagName==='svg'?'svg':null)).filter(Boolean).slice(0,8)}));
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
      .map(x=>({txt:(x.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
                marks:[...x.querySelectorAll('[data-testid]')].map(y=>y.getAttribute('data-testid')).filter(Boolean).slice(0,10)}));
    return {rows, tiles}; }, VIS);
}
