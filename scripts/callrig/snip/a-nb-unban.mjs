import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out = {net:[]};
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*(ban|meeting)/i.test(u)) return;
    if (r.request().method()==='GET') return;
    let body=null; try{ body=(await r.text()).slice(0,300);}catch(e){body='<unreadable>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body});
  });
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(1800); }
  out.before = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null; }, VIS);
  out.click = await page.evaluate(([name,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const rows=[...p.querySelectorAll('li')].filter(vis).filter(r=>(r.innerText||'').includes(name));
    const row=rows.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row'};
    const b=[...row.querySelectorAll('button')].filter(vis).find(x=>/unban/i.test((x.getAttribute('aria-label')||x.innerText||'')));
    if(!b) return {err:'no Unban btn', rowTxt:(row.innerText||'').slice(0,80), btns:[...row.querySelectorAll('button')].map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim())};
    b.click(); return {ok:true, label:(b.getAttribute('aria-label')||b.innerText||'').trim(), rowTxt:(row.innerText||'').replace(/\s+/g,' ').slice(0,80)};
  }, [who, VIS]);
  await page.waitForTimeout(2000);
  out.dlg = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8).pop();
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30),t:b.getAttribute('data-testid')}))}:null; }, VIS);
  await page.waitForTimeout(4000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const notes=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis).map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,160)).filter(Boolean);
    return {panel: p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null, notes}; }, VIS);
  return out;
}
