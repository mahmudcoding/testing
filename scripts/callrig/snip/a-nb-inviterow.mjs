import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out = {net:[]};
  page.on('response', async (r) => { const u=r.url(); if(!/invite/i.test(u)) return;
    let b=null; try{b=(await r.text()).slice(0,160);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:u.replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,140), body:b}); });
  await page.locator('[data-testid="call-controls-add-to-call"]').first().click();
  await page.waitForTimeout(2500);
  await page.evaluate(([name,v])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    [...d.querySelectorAll('input')].filter(vis).find(i=>(i.getAttribute('aria-label')||'')===name).click(); }, [who, VIS]);
  await page.waitForTimeout(900);
  await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    [...d.querySelectorAll('button')].filter(vis).find(x=>/^Invite \(/.test((x.innerText||'').trim())).click(); }, VIS);
  out.rows = await page.evaluate(async (v)=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<30000){
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
      const all=d?[...d.querySelectorAll('li,label,[role="option"]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<60):[];
      const toasts=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
        .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,120)).filter(Boolean);
      const uniq=[...new Set(all)];
      const k=JSON.stringify([uniq,toasts]); if(k!==last){ out.push({ms:Date.now()-t0, rows:uniq, toasts}); last=k; }
      await new Promise(r=>setTimeout(r,400)); }
    return out; }, VIS);
  return out;
}
