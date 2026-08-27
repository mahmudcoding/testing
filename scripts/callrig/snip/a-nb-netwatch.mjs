import { VIS } from './a-nb-lib.mjs';
// Watch network for a pattern while doing nothing, or while clicking a labelled control.
export default async ({page}) => {
  const pat = new RegExp(process.env.QA_PAT || 'breakout|focus', 'i');
  const MS = Number(process.env.QA_MS || 15000);
  const out = {net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!pat.test(u)) return;
    let b=null; try{b=(await r.text()).slice(0,400);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  if (process.env.QA_CLICK) {
    const lbl = process.env.QA_CLICK;
    out.click = await page.evaluate(([l,v])=>{ const vis=eval(v);
      const b=[...document.querySelectorAll('button,[role="menuitem"],a')].filter(vis)
        .find(x=>new RegExp('^'+l+'$','i').test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      if(!b) return {err:'not found', have:[...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' ').slice(0,32)).slice(0,40)};
      b.click(); return {ok:true, label:(b.getAttribute('aria-label')||b.innerText||'').trim()}; }, [lbl, VIS]);
  }
  await page.waitForTimeout(MS);
  out.panel = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null; });
  return out;
}
