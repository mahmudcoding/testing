import { DOM, safeClick, waitClick } from './lib.mjs';
export default async ({ page }) => {
  const out={}; const hold=Number(process.env.QA_HOLD||8000);
  await page.evaluate(DOM);
  out.trigger = await waitClick(page,'[data-testid="recording-start-access-trigger"]',{timeout:20000});
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.start = await page.evaluate(()=>window.__qa.clickDeepest(/^Start recording$/i));
  out.tStart = new Date().toISOString();
  await page.waitForTimeout(hold);
  await page.evaluate(DOM);
  out.stopName = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-record"]');return b?{n:window.__qa.nameOf(b),dis:b.disabled}:null;});
  out.stop = await waitClick(page,'[data-testid="call-controls-record"]',{timeout:15000});
  out.tStop = new Date().toISOString();
  await page.waitForTimeout(8000);
  await page.evaluate(DOM);
  out.notices = await page.evaluate(()=>window.__qa.notices().map(n=>n.text));
  out.recordings = await page.evaluate(async ()=>{
    const m=location.pathname.split('/call/')[1].split('?')[0];
    const r=await fetch(`/api/v1/meeting/${m}/recordings`,{credentials:'include'});
    return (await r.text()).slice(0,1600);
  });
  return out;
};
