/* sector L: join the sector-L call by id (env QA_MEETING) */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QBF1XTURESO01';
  const ID=process.env.QA_MEETING;
  const out={id:ID};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${ID}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(DOM);
  out.url = page.url();
  out.buttons = await page.evaluate(()=>{
    const w=window.__qa;
    return [...document.querySelectorAll('button')].filter(w.vis).map(w.nameOf).filter(Boolean).slice(0,40);
  });
  // if a lobby "Join" style button exists, press it
  out.joined = await page.evaluate(()=>window.__qa.clickDeepest(/^(Join now|Join call|Join)$/i));
  await page.waitForTimeout(6000);
  out.url2 = page.url();
  out.toolbar = await page.evaluate(()=>{
    const w=window.__qa;
    return [...document.querySelectorAll('button')].filter(w.vis).map(w.nameOf).filter(Boolean).slice(0,40);
  });
  return out;
};
