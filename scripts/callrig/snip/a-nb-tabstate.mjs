import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const out={};
    for (const t of ['header-tab-main-activate','header-tab-room-activate']) {
      const e=document.querySelector('[data-testid="'+t+'"]');
      out[t]= e? {txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,34), cls:cls(e).slice(0,90),
                  attrs:[...e.attributes].filter(a=>a.name!=='class').map(a=>a.name+'='+String(a.value).slice(0,18))} : null;
    }
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    out.chatHeader = p? (p.innerText||'').split('\n').slice(0,2).join(' | ') : null;
    return out; }, VIS);
};
