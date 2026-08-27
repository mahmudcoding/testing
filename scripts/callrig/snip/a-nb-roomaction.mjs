import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const room = process.env.QA_ROOM || 'Hidden Test';
  const out = {net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/room/i.test(u)) return; if(r.request().method()==='GET') return;
    let b=null; try{b=(await r.text()).slice(0,250);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), body:b}); });
  out.click = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    // find the card whose text contains the room name and holds a side-room-action button
    const cands=[...p.querySelectorAll('*')].filter(vis)
      .filter(e=>(e.innerText||'').includes(n))
      .filter(e=>e.querySelector('[data-testid="side-room-action"]'))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    if(!cands[0]) return {err:'no card for '+n};
    const btn=cands[0].querySelector('[data-testid="side-room-action"]');
    const label=(btn.innerText||'').trim();
    btn.click();
    return {ok:true, label, card:(cands[0].innerText||'').replace(/\s+/g,' ').slice(0,70)}; }, [room, VIS]);
  await page.waitForTimeout(8000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(0,150); }, VIS);
  return out;
}
