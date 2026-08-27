import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {net:[], steps:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/record/i.test(r.url())) return;
    let b=null; try{b=(await r.text()).slice(0,200);}catch(e){b='<no body>';}
    out.net.push({t:Date.now(), m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), body:b}); });
  const label = async () => await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^(Record|Stop recording)$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    return b?{l:(b.getAttribute('aria-label')||b.innerText||'').trim(), disabled:b.disabled}:null; }, VIS);
  out.steps.push({at:Date.now(), phase:'before stop', btn: await label()});
  await page.evaluate((v)=>{ const vis=eval(v);
    [...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^Stop recording$/.test((x.getAttribute('aria-label')||x.innerText||'').trim())).click(); }, VIS);
  const t0 = Date.now();
  for (const wait of [1500, 3000, 5000, 8000, 12000]) {
    await page.waitForTimeout(wait - (Date.now()-t0) > 0 ? wait - (Date.now()-t0) : 100);
    out.steps.push({ms: Date.now()-t0, btn: await label()});
  }
  // now immediately press whatever the button is
  out.secondPress = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>/^(Record|Stop recording)$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return {err:'no button'};
    const l=(b.getAttribute('aria-label')||b.innerText||'').trim();
    if(b.disabled) return {err:'disabled', l};
    b.click(); return {ok:true, pressed:l}; }, VIS);
  await page.waitForTimeout(4000);
  out.afterSecondPress = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>/Recording access/.test(x.innerText||'')).pop();
    return {dialog: d?(d.innerText||'').replace(/\s+/g,' ').slice(0,140):null}; }, VIS);
  return out;
}
