import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  return await page.evaluate((v)=>{ const vis=eval(v);
    const out=[];
    for (const e of document.querySelectorAll('*')) {
      const t=(e.innerText||'').trim();
      if (!t || t.length>40) continue;
      if (!/^Recording\b/i.test(t)) continue;
      if (!vis(e)) continue;
      const r=e.getBoundingClientRect();
      out.push({txt:t.slice(0,40), tag:e.tagName.toLowerCase(), tid:e.getAttribute('data-testid'),
        cls:String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:(e.className||'')).slice(0,60),
        kids:e.childElementCount, w:Math.round(r.width), h:Math.round(r.height), y:Math.round(r.top)});
    }
    return out; }, VIS);
}
