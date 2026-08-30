import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^View all$/i));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).pop();
    if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,1200),
      btns:[...d.querySelectorAll('button,a')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,60),t:n.getAttribute('data-testid')}))};
  });
  out.api = await page.evaluate(async (m)=>{
    const r=await fetch(`/api/v1/meeting/${m}/participants`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,1500)};
  }, mid);
  return out;
};
