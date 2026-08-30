import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={}; const hold=Number(process.env.QA_HOLD||8000);
  await page.evaluate(DOM);
  out.recBtn0 = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-record"]');return b?window.__qa.nameOf(b):null;});
  if (/^Stop/.test(out.recBtn0||'')) { out.pre = await safeClick(page,'[data-testid="call-controls-record"]'); await page.waitForTimeout(6000); }
  await page.evaluate(DOM);
  out.trigger = await safeClick(page,'[data-testid="recording-start-access-trigger"]');
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.start = await page.evaluate(()=>window.__qa.clickDeepest(/^Start recording$/i));
  out.tStart = new Date().toISOString();
  await page.waitForTimeout(hold);
  await page.evaluate(DOM);
  out.stop = await safeClick(page,'[data-testid="call-controls-record"]');
  out.tStop = new Date().toISOString();
  await page.waitForTimeout(7000);
  await page.evaluate(DOM);
  out.notices = await page.evaluate(()=>window.__qa.notices().map(n=>n.text));
  out.recBtn = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-record"]');return b?window.__qa.nameOf(b):null;});
  out.recordings = await page.evaluate(async ()=>{
    const m=location.pathname.split('/call/')[1].split('?')[0];
    const r=await fetch(`/api/v1/meeting/${m}/recordings`,{credentials:'include'});
    return (await r.text()).slice(0,1500);
  });
  return out;
};
