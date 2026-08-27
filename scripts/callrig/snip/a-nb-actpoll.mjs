import { VIS } from './a-nb-lib.mjs';
// open participant menu, click item, then poll THIS page's toasts continuously.
export default async ({page}) => {
  const who = process.env.QA_WHO, item = process.env.QA_ITEM;
  const out = {net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/\/api\/v1\//.test(r.url())) return;
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,140)}); });
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  out.result = await page.evaluate(async ([name, it, v]) => {
    const vis = eval(v);
    const panel=document.querySelector('[data-testid="call-side-panel-slot"]');
    const row=[...panel.querySelectorAll('*')].filter(vis)
      .filter(e=>(e.innerText||'').includes(name))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/Participant actions/i.test(b.getAttribute('aria-label')||'')))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row'};
    const snapshot=()=>[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')]
      .filter(vis).map(n=>{const r=n.getBoundingClientRect();
        return {t:(n.innerText||'').replace(/\s+/g,' ').slice(0,120), w:Math.round(r.width), h:Math.round(r.height)};})
      .filter(x=>x.t && x.w>8 && x.h>8).map(x=>x.t);
    row.querySelector('button[aria-label*="Participant actions"]').click();
    await new Promise(r=>setTimeout(r,1200));
    const menus=[...document.querySelectorAll('[role="menu"],[data-radix-menu-content],[role="listbox"],[role="dialog"]')]
      .filter(vis).filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded')
      .filter(m=>{const n=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis).length; return n>0&&n<=14;});
    const m=menus[menus.length-1]; if(!m) return {err:'no menu'};
    const b=[...m.querySelectorAll('[role="menuitem"],button')].filter(vis)
      .find(i=>new RegExp(it,'i').test((i.getAttribute('aria-label')||i.innerText||'').trim()));
    if(!b) return {err:'no item'};
    const before=snapshot();
    const at=Date.now(); b.click();
    const seen=[]; let last=JSON.stringify(before);
    while(Date.now()-at<20000){
      const s=snapshot(); const k=JSON.stringify(s);
      if(k!==last){ seen.push({ms:Date.now()-at, toasts:s}); last=k; }
      await new Promise(r=>setTimeout(r,300));
    }
    return {ok:true, before, seen};
  }, [who, item, VIS]);
  return out;
}
