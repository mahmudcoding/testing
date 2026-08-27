import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {};
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^More$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return {err:'no More'}; b.click(); return {ok:true}; }, VIS);
  if (out.click.err) return out;
  await page.waitForTimeout(2200);
  out.menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="dialog"]')].filter(vis)
      .filter(m=>[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length<=16);
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    return {txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,300),
      items:[...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
        .map(i=>({l:(i.getAttribute('aria-label')||i.innerText||'').trim().replace(/\s+/g,' ').slice(0,44),
                  d:i.disabled||i.getAttribute('aria-disabled')||null, t:i.getAttribute('data-testid')}))}; }, VIS);
  return out;
}
