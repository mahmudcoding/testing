import { VIS } from './a-nb-lib.mjs';
// open participant menu -> click item -> confirm, all in one drive
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Dave';
  const item = process.env.QA_ITEM || '^Ban$';
  const tid = process.env.QA_TESTID || 'ban-participant-confirm-submit';
  const out = {who, net:[]};
  page.on('response', async (r)=>{ const u=r.url(); if(!/ban|participants/i.test(u)) return; if(r.request().method()==='GET') return;
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,'')}); });
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
  if (o.err) { out.err = o.err; return out; }
  await page.waitForTimeout(2200);
  const ci = await page.evaluate(([v,re])=>{ const vis=eval(v); const rx=new RegExp(re,'i');
    const ms=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"]')].filter(vis)
      .filter(m=>[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length<=14);
    const m=ms[ms.length-1]; if(!m) return {err:'no menu'};
    const b=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).find(i=>rx.test((i.getAttribute('aria-label')||i.innerText||'').trim()));
    if(!b) return {err:'no item'}; b.click(); return {ok:true}; }, [VIS, item]);
  if (ci.err) { out.err = ci.err; return out; }
  await page.waitForTimeout(2000);
  out.confirm = await page.evaluate(([v,t])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8).pop();
    if(!d) return {err:'no confirm'};
    const b=d.querySelector('[data-testid="'+t+'"]'); if(!b) return {err:'no submit', have:[...d.querySelectorAll('button')].map(x=>x.getAttribute('data-testid'))};
    b.click(); return {ok:true, txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,140)}; }, [VIS, tid]);
  await page.waitForTimeout(5000);
  out.panel = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null; });
  return out;
}
