import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TID;
  const out = {tid, net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/meeting/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,220);}catch(e){b='<no body>';}
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'').slice(0,200), body:b}); });
  out.before = await page.evaluate((t)=>{ const b=document.querySelector('[data-testid="'+t+'"]');
    return b?{ac:b.getAttribute('aria-checked'), label:(b.getAttribute('aria-label')||b.innerText||'').trim()}:{err:'not found'}; }, tid);
  if (out.before.err) return out;
  await page.click('[data-testid="'+tid+'"]');
  await page.waitForTimeout(5000);
  out.after = await page.evaluate((t)=>{ const b=document.querySelector('[data-testid="'+t+'"]');
    return b?{ac:b.getAttribute('aria-checked')}:{err:'gone'}; }, tid);
  out.notes = await page.evaluate((v)=>{ const vis=eval(v);
    return [...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]')].filter(vis)
      .map(n=>(n.innerText||'').replace(/\s+/g,' ').slice(0,140)).filter(Boolean); }, VIS);
  return out;
}
