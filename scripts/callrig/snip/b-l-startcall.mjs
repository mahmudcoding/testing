/* sector L: alice starts an instant group call, returns the meeting id */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Start now$/i));
  await page.waitForTimeout(3000);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const d=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).pop();
    if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,700),
            buttons:[...d.querySelectorAll('button')].filter(q.vis).map(q.nameOf).filter(Boolean).slice(0,20),
            inputs:[...d.querySelectorAll('input,textarea')].filter(q.vis).map(i=>({ph:i.placeholder,v:i.value,name:q.nameOf(i).slice(0,40)}))};
  });
  out.url = page.url();
  return out;
};
