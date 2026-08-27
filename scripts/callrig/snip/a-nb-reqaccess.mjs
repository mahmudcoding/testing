import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/room/i.test(u)) return; if(r.request().method()==='GET') return;
    let b=null; try{b=(await r.text()).slice(0,240);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,140), body:b}); });
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Request access$/i.test((x.innerText||'').trim()));
    if(!b) return {err:'no Request access'}; b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(8000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null,
      stage:(ov.innerText||'').replace(/\s+/g,' ').slice(0,150)}; }, VIS);
  return out;
}
