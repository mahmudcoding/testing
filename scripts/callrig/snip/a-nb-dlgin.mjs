import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop()
      || [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {err:'no dialog'};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,400),
      controls:[...d.querySelectorAll('input,[role="switch"],[role="checkbox"],button')].filter(vis)
        .map(i=>({tag:i.tagName.toLowerCase(), type:i.type||null, role:i.getAttribute('role'),
                  al:i.getAttribute('aria-label'), checked:i.checked!==undefined?i.checked:null,
                  ac:i.getAttribute('aria-checked'), tid:i.getAttribute('data-testid'),
                  txt:(i.innerText||'').replace(/\s+/g,' ').trim().slice(0,34)}))};
  }, VIS);
}
