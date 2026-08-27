import { VIS } from './a-nb-lib.mjs';
const DLG = `(vis) => [...document.querySelectorAll('[role="dialog"]')].filter(vis)
  .find(d => d.querySelector('[data-testid="side-room-create-name"]'))`;
export default async ({page}) => {
  const name = process.env.QA_ROOM || 'Room A';
  const priv = process.env.QA_PRIVATE === '1';
  const invite = (process.env.QA_INVITE||'').split(',').map(s=>s.trim()).filter(Boolean);
  const out = {name, priv, invite, net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/room/i.test(u)) return; if(r.request().method()==='GET') return;
    let b=null; try{b=(await r.text()).slice(0,300);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  const has = await page.evaluate(([v,dq])=>{ const vis=eval(v); return !!eval(dq)(vis); }, [VIS, DLG]);
  if (!has) { await page.locator('[data-testid="side-rooms-new"]').first().click(); await page.waitForTimeout(2500); }
  await page.fill('[data-testid="side-room-create-name"]', name);
  await page.waitForTimeout(500);
  if (priv) await page.evaluate(([v,dq])=>{ const vis=eval(v); const d=eval(dq)(vis);
    [...d.querySelectorAll('button')].filter(vis).find(b=>/^Private/.test((b.innerText||'').trim())).click(); }, [VIS, DLG]);
  for (const who of invite) {
    await page.evaluate(([n,v,dq])=>{ const vis=eval(v); const d=eval(dq)(vis);
      const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').includes(n));
      if (b) b.click(); }, [who, VIS, DLG]);
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(500);
  out.create = await page.evaluate(([v,dq])=>{ const vis=eval(v); const d=eval(dq)(vis);
    if(!d) return {err:'dialog gone'};
    const btns=[...d.querySelectorAll('button')].filter(vis);
    const b=btns.find(x=>/^Create room/i.test((x.innerText||'').trim()));
    if(!b) return {err:'no create btn', have: btns.map(x=>(x.innerText||'').trim().replace(/\s+/g,' ').slice(0,30))};
    if(b.disabled) return {err:'create disabled'};
    b.click(); return {ok:true}; }, [VIS, DLG]);
  await page.waitForTimeout(6000);
  out.panel = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,400):null; });
  return out;
}
