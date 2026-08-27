import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    let b=null; try{b=(await r.text()).slice(0,160);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,120),body:b}); });
  await page.locator('[data-testid="call-side-panel-slot"] button', {hasText:/^Add people$/}).first().click();
  await page.waitForTimeout(2500);
  out.dialog = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds[ds.length-1]; if(!d) return {err:'no dialog'};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
      ctl:[...d.querySelectorAll('button,input')].filter(vis)
        .map(b=>((b.getAttribute('data-testid')||'')+'|'+(b.getAttribute('aria-label')||b.textContent||b.type||'').trim()).slice(0,46))}; }, VIS);
  if (out.dialog.err) return out;
  out.pick = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds[ds.length-1];
    const el=[...d.querySelectorAll('input,button,[role="option"],label')].filter(vis)
      .find(x=>((x.getAttribute('aria-label')||'')+' '+(x.textContent||'')).includes(n));
    if(!el) return {err:'no row for '+n}; el.click(); return {ok:true}; }, [who, VIS]);
  await page.waitForTimeout(1200);
  out.submit = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^(Invite|Add|Send)/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no submit', have:[...d.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,24))};
    if(b.disabled) return {err:'submit disabled'};
    b.click(); return {ok:true, l:(b.textContent||'').trim()}; }, VIS);
  await page.waitForTimeout(5000);
  return out;
};
