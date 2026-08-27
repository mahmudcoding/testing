import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Carol';
  const item = process.env.QA_ITEM || ('Pin ' + who + ' for everyone');
  const out = {net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/pin/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,300);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(1800); }
  const o = await page.evaluate(([name,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const c=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(name))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!c) return {err:'no row'};
    [...c.querySelectorAll('button')].filter(vis).find(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')).click();
    return {ok:true}; }, [who, VIS]);
  if (o.err) { out.err=o.err; return out; }
  await page.waitForTimeout(2000);
  out.click = await page.evaluate(([v,it])=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"]')].filter(vis)
      .filter(m=>[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length<=14);
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    const items=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis);
    const b=items.find(i=>(i.getAttribute('aria-label')||i.innerText||'').trim()===it);
    if(!b) return {err:'no item', have:items.map(i=>(i.getAttribute('aria-label')||i.innerText||'').trim())};
    b.click(); return {ok:true, label:it}; }, [VIS, item]);
  await page.waitForTimeout(7000);
  out.toasts = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,140)).filter(Boolean); }, VIS);
  return out;
}
