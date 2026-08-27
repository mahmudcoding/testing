import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const want = (process.env.QA_PERMS||'').split(',').map(s=>s.trim()).filter(Boolean);
  const out = {want, net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(r.request().method()==='GET') return;
    if(!/permission|admin|participant/i.test(u)) return;
    let b=null; try{b=(await r.text()).slice(0,300);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,240), body:b}); });
  out.ticked = await page.evaluate(([w,v])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop();
    if(!d) return {err:'no dialog'};
    const done=[];
    for (const name of w) {
      const box=[...d.querySelectorAll('input[type=checkbox]')].filter(vis)
        .find(i=>{ const l=i.closest('label')||(i.id?d.querySelector('label[for="'+i.id+'"]'):null);
          return l && (l.innerText||'').trim() === name; });
      if (box && !box.checked) { box.click(); done.push(name); }
    }
    return {done}; }, [want, VIS]);
  await page.waitForTimeout(900);
  out.state = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop();
    return [...d.querySelectorAll('input[type=checkbox]')].filter(vis)
      .map(i=>{ const l=i.closest('label')||(i.id?d.querySelector('label[for="'+i.id+'"]'):null);
        return ((l&&l.innerText.trim())||'?')+'='+i.checked; }); }, VIS);
  await page.evaluate((v)=>{ const vis=eval(v);
    document.querySelector('[data-testid="admin-permissions-submit"]').click(); }, VIS);
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const notes=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,140)).filter(Boolean);
    return {panel:p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null, notes}; }, VIS);
  return out;
}
