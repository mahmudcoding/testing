import { DOM, safeClick, waitClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  out.trigger = await waitClick(page,'[data-testid="recording-start-access-trigger"]',{timeout:25000});
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.start = await page.evaluate(()=>window.__qa.clickDeepest(/^Start recording$/i));
  out.tStart=new Date().toISOString();
  await page.waitForTimeout(25000);   // well past min_duration
  await page.evaluate(DOM);
  out.recBefore = await page.evaluate(async ()=>{
    const m=location.pathname.split('/call/')[1].split('?')[0];
    const r=await fetch(`/api/v1/meeting/${m}/recordings`,{credentials:'include'});
    const j=await r.json(); return j.recordings.map(x=>`${x.id} ${x.status} ${x.duration_sec}s`);
  });
  out.end = await safeClick(page,'[data-testid="call-controls-end-for-everyone"]');
  await page.waitForTimeout(1500);
  out.confirm = await safeClick(page,'[data-testid="call-end-confirm-submit"]');
  out.tEnd=new Date().toISOString();
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);
  out.overlay = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-ended-overlay"]');
    return ov?(ov.innerText||'').replace(/\s+/g,' ').slice(0,900):null;
  });
  return out;
};
