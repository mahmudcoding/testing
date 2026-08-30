import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}?tab=logs`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(DOM);
  const snap = async()=> await page.evaluate(()=>{
    const q=window.__qa; const m=document.querySelector('main')||document.body;
    return {text:(m.innerText||'').replace(/\s+/g,' ').slice(0,1000),
      btns:[...m.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).replace(/\s+/g,' ').slice(0,40))};
  });
  out.before = await snap();
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Files0$/));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.after = await snap();
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
