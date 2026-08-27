import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const val = process.env.QA_LIMIT || '2';
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    let b=null; try{b=(await r.text()).slice(0,180);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,100),body:b}); });
  out.field = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const ins=[...p.querySelectorAll('input')].filter(vis)
      .map((e,i)=>({i, type:e.type, ph:e.getAttribute('placeholder'), al:e.getAttribute('aria-label'), val:e.value}));
    return ins; }, VIS);
  const numInput = page.locator('[data-testid="call-side-panel-slot"] input[type="number"]').first();
  out.hasNum = await numInput.count();
  if (!out.hasNum) return out;
  await numInput.fill(val); await page.waitForTimeout(700);
  const save = page.locator('[data-testid="meeting-settings-save"]').first();
  out.saveFound = await save.count();
  if (out.saveFound) { await save.click(); await page.waitForTimeout(5000); }
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return {txt:(p.innerText||'').replace(/\s+/g,' ').slice(0,220),
      notes:[...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>t.length<90 && /limit|less|cannot|error|already|exceed/i.test(t)).slice(0,5)}; }, VIS);
  return out;
};
