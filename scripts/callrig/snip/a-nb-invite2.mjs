import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out = {net:[]};
  page.on('response', async (r) => {
    const u = r.url(); if (!/invite/i.test(u)) return;
    let body=null; try{body=(await r.text()).slice(0,200);}catch(e){body='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,160), body});
  });
  await page.locator('[data-testid="call-controls-add-to-call"]').first().click();
  await page.waitForTimeout(2500);
  out.rowInDialog = await page.evaluate(([name,v])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const rows=[...d.querySelectorAll('li,label,[role="option"]')].filter(vis)
      .filter(e=>(e.innerText||'').includes(name))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const all=[...d.querySelectorAll('li,label,[role="option"]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<60);
    return {row: rows[0]?(rows[0].innerText||'').replace(/\s+/g,' ').trim():null, allRows: [...new Set(all)].slice(0,12)};
  }, [who, VIS]);
  await page.evaluate(([name,v])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    [...d.querySelectorAll('input')].filter(vis).find(i=>(i.getAttribute('aria-label')||'')===name).click(); }, [who, VIS]);
  await page.waitForTimeout(1000);
  await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    [...d.querySelectorAll('button')].filter(vis).find(x=>/^Invite \(/.test((x.innerText||'').trim())).click(); }, VIS);
  out.toasts = await page.evaluate(async (v)=>{ const vis=eval(v); const seen=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<10000){
      const ts=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
        .map(n=>{const r=n.getBoundingClientRect(); return {t:(n.innerText||'').replace(/\s+/g,' ').slice(0,160), w:Math.round(r.width), h:Math.round(r.height)};})
        .filter(x=>x.t&&x.w>8&&x.h>8);
      const k=JSON.stringify(ts); if(k!==last){ seen.push({ms:Date.now()-t0, ts}); last=k; }
      await new Promise(r=>setTimeout(r,300)); }
    return seen; }, VIS);
  return out;
}
