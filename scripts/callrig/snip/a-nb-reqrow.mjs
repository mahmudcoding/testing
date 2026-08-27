import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const rows=[...document.querySelectorAll('[data-testid="permission-request-row"]')].filter(vis)
      .map(r=>({txt:(r.innerText||'').replace(/\s+/g,' ').slice(0,90),
        btns:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40))}));
    const all=[...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').trim()).filter(x=>/approve|decline|allow|deny|request/i.test(x));
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {rows, matching:all, panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,200):null}; }, VIS);
};
