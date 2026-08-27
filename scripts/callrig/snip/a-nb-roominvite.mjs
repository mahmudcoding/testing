import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out = {net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/room|invite/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,220);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,160), body:b}); });
  out.pick = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>/Add people to/.test(d.innerText||''));
    const d=ds[ds.length-1]; if(!d) return {err:'no add dialog'};
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').includes(n));
    if(!b) return {err:'no candidate '+n};
    b.click(); return {ok:true}; }, [who, VIS]);
  if (out.pick.err) return out;
  await page.waitForTimeout(900);
  out.send = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>/Add people to/.test(d.innerText||''));
    const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Invite/.test((x.innerText||'').trim()));
    if(!b) return {err:'no Invite'}; if(b.disabled) return {err:'Invite still disabled'};
    b.click(); return {ok:true, label:(b.innerText||'').trim()}; }, VIS);
  await page.waitForTimeout(6000);
  return out;
}
