import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const rx = new RegExp(process.env.QA_BTN || '^(Confirm|Remove|Yes|OK)$','i');
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/\/api\/v1\//.test(r.url()))return;
    let b=null; try{b=(await r.text()).slice(0,200);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150),body:b}); });
  out.click = await page.evaluate(([re,v])=>{ const vis=eval(v); const rx=new RegExp(re,'i');
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8);
    const d=ds.pop(); if(!d) return {err:'no dialog'};
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>rx.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if(!b) return {err:'no button', have:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim())};
    const l=(b.textContent||'').trim(); b.click(); return {ok:true,l}; }, [rx.source, VIS]);
  await page.waitForTimeout(6000);
  return out;
};
