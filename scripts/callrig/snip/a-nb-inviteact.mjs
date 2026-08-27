import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const act = process.env.QA_ACT || 'Decline';
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,'')}); });
  const found = await page.evaluate(([a,v])=>{ const vis=eval(v);
    const hit=[...document.querySelectorAll('*')].filter(e=>!e.childElementCount)
      .find(e=>/invited you to join/i.test(e.textContent||'') && vis(e));
    if(!hit) return {err:'no banner'};
    let box=hit; for(let i=0;i<5 && box.parentElement;i++){ box=box.parentElement;
      if([...box.querySelectorAll('button')].filter(vis).length) break; }
    const b=[...box.querySelectorAll('button')].filter(vis).find(x=>new RegExp('^'+a+'$','i').test((x.textContent||'').trim()));
    if(!b) return {err:'no '+a}; b.click(); return {ok:true}; }, [act, VIS]);
  out.found = found;
  await page.waitForTimeout(5000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(0,110); }, VIS);
  return out;
};
