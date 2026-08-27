import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => await page.evaluate((v)=>{ const vis=eval(v);
  const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
  return {txt:(p.innerText||'').replace(/\s+/g,' ').slice(0,400),
    ctl:[...p.querySelectorAll('button,[role="switch"],[role="checkbox"],select')].filter(vis)
      .map(b=>({t:b.getAttribute('data-testid'), l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34),
                c:b.getAttribute('aria-checked')||b.getAttribute('aria-pressed')||null}))};}, VIS);
