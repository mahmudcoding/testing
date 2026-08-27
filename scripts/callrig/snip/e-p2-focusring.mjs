import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const r of ['/directories','/files','/calendar']) {
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    const res=[];
    for (let i=0;i<18;i++){
      await page.keyboard.press('Tab');
      await page.waitForTimeout(120);
      const s=await page.evaluate(()=>{
        const e=document.activeElement;
        if(!e || e===document.body) return null;
        const cs=getComputedStyle(e);
        const rect=e.getBoundingClientRect();
        const ring = (cs.outlineStyle!=='none' && parseFloat(cs.outlineWidth)>0)
                  || (cs.boxShadow && cs.boxShadow!=='none');
        return {tag:e.tagName,
          label:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,24),
          ring, outline:cs.outlineStyle+' '+cs.outlineWidth, shadow:(cs.boxShadow||'none').slice(0,26),
          inViewport: rect.top>=0 && rect.bottom<=innerHeight && rect.width>0};
      });
      if(s) res.push(s);
    }
    out[r]={stops:res.length, noRing:res.filter(x=>!x.ring).map(x=>x.label||x.tag).slice(0,6),
      offscreen:res.filter(x=>!x.inViewport).map(x=>x.label||x.tag).slice(0,4)};
  }
  return out;
};
