import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    return {inputs:[...p.querySelectorAll('input,textarea,select,[role="combobox"],[role="tab"]')].filter(vis)
        .map(e=>({tag:e.tagName.toLowerCase(), t:e.getAttribute('data-testid'),
                  ph:e.getAttribute('placeholder'), al:e.getAttribute('aria-label'), role:e.getAttribute('role')})),
      headings:[...p.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>(h.textContent||'').trim().slice(0,30)),
      topBtns:[...p.querySelectorAll('button')].filter(vis).slice(0,6)
        .map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,44))}; }, VIS);
};
