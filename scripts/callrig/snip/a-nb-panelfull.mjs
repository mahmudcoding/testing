import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    return {txt:(p.innerText||'').replace(/\s+/g,' '),
      controls:[...p.querySelectorAll('button,input,[role="switch"],[role="checkbox"]')].filter(vis)
        .map(b=>({tag:b.tagName.toLowerCase(), type:b.type||null, role:b.getAttribute('role'),
                  l:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40),
                  checked:b.checked!==undefined?b.checked:null, ac:b.getAttribute('aria-checked'),
                  tid:b.getAttribute('data-testid')}))}; }, VIS);
}
