import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    return {txt:(p.innerText||'').replace(/\s+/g,' ').slice(0,320),
      ctl:[...p.querySelectorAll('button,[role="combobox"],select,[contenteditable="true"]')].filter(vis)
        .map(b=>({t:b.getAttribute('data-testid'), l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36),
                  exp:b.getAttribute('aria-expanded')||null})),
      msgs:[...p.querySelectorAll('[data-message-id],[data-testid*="message"]')].filter(vis)
        .map(m=>({id:m.getAttribute('data-message-id')||m.getAttribute('data-testid'),
                  txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,70)})).slice(-6)};}, VIS);
};
