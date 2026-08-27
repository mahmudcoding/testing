import {WS, BASE} from './e-p2-helpers.mjs';
const heap = () => performance.memory? Math.round(performance.memory.usedJSHeapSize/1048576) : null;
export default async ({page}) => {
  const out={};
  out.now = await page.evaluate(heap);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(heap);
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
  out.afterChannelLoad = await page.evaluate(heap);
  // settle: idle 20 s in one place
  await page.waitForTimeout(20000);
  out.after20sIdle = await page.evaluate(heap);
  out.domNodes = await page.evaluate(()=>document.querySelectorAll('*').length);
  return out;
};
