import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const lbl = process.env.QA_BTN || 'Remove';
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/\/api\/v1\//.test(r.url()))return;
    let b=null; try{b=(await r.text()).slice(0,200);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),body:b}); });
  out.click = await page.evaluate(([l,v])=>{ const vis=eval(v);
    const a=[...document.querySelectorAll('aside')].filter(vis).pop(); if(!a) return {err:'no aside'};
    const b=[...a.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()===l);
    if(!b) return {err:'no button '+l, have:[...a.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,24)).slice(0,20)};
    b.click(); return {ok:true}; }, [lbl, VIS]);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const a=[...document.querySelectorAll('aside')].filter(vis).pop();
    return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,200):null; }, VIS);
  return out;
};
