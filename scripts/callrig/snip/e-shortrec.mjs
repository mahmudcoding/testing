/* Start a recording and stop it after N ms; report notices at each step. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={}; const hold=Number(process.env.QA_HOLD||8000);
  await page.evaluate(DOM);
  await safeClick(page,'[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.dialogText = await page.evaluate(()=>{
    const q=window.__qa;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).filter(x=>[...x.querySelectorAll('button')].length<=10).pop();
    return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,500):null;
  });
  out.start = await page.evaluate(()=>window.__qa.clickDeepest(/^Start recording$/i));
  out.tStart = new Date().toISOString();
  await page.waitForTimeout(hold);
  await page.evaluate(DOM);
  out.stop = await page.evaluate(()=>window.__qa.clickDeepest(/Stop recording/i));
  out.tStop = new Date().toISOString();
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.notices = await page.evaluate(()=>window.__qa.notices().map(n=>n.text));
  out.recordings = await page.evaluate(async ()=>{
    const m=location.pathname.split('/call/')[1].split('?')[0];
    const r=await fetch(`/api/v1/meeting/${m}/recordings`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,1200)};
  });
  return out;
};
