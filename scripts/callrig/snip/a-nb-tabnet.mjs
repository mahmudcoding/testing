import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TAB_TID || 'header-tab-main-activate';
  const out={tid, net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    let b=null; try{b=(await r.text()).slice(0,160);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),
                  req:(r.request().postData()||'').slice(0,90), body:b}); });
  await page.mouse.move(700,400); await page.waitForTimeout(500);
  const box = await page.locator(`[data-testid="${tid}"]`).first().boundingBox();
  if (box) { await page.mouse.click(box.x+box.width/2, box.y+box.height/2); }
  await page.waitForTimeout(6000);
  out.after = await page.evaluate((t)=>{const e=document.querySelector('[data-testid="'+t+'"]');
    return e?e.getAttribute('aria-pressed'):null;}, tid);
  out.notes = await page.evaluate((v)=>{const vis=eval(v);
    return [...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>t.length<80 && /error|fail|not|unable|попроб/i.test(t)).slice(0,5);}, VIS);
  return out;
};
