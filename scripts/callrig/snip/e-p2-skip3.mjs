import {WS, BASE} from './e-p2-helpers.mjs';
async function probe(page, route, label){
  await page.goto(`${BASE}${route}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const atLoad = await page.evaluate(()=>{
    const e=document.activeElement;
    return {tag:e?e.tagName:null, label:e?((e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,28)):null,
      isBody: e===document.body};
  });
  await page.keyboard.press('Tab'); await page.waitForTimeout(700);
  const t1 = await page.evaluate(()=>{
    const e=document.activeElement; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    return {tag:e.tagName, text:(e.textContent||'').trim().slice(0,26),
      href:e.getAttribute?e.getAttribute('href'):null,
      visibleOnFocus: r.width>0&&r.height>0&&r.y>=0&&parseFloat(cs.opacity)>0,
      rect:{x:Math.round(r.x),y:Math.round(r.y)}};
  });
  let activated=null;
  if (t1.href==='#main-content') {
    await page.keyboard.press('Enter'); await page.waitForTimeout(1000);
    await page.keyboard.press('Tab'); await page.waitForTimeout(700);
    activated = await page.evaluate(()=>{
      const e=document.activeElement, main=document.querySelector('#main-content')||document.querySelector('main');
      return {nextStopInsideMain: !!(main&&e&&main.contains(e)),
        label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,32), hash:location.hash};
    });
  }
  return {label, route, atLoad, firstTabStop:t1, isSkipLink:t1.href==='#main-content', activated};
}
export default async ({page}) => ({
  files: await probe(page,`/w/${WS}/files`,'Files (no composer)'),
  directories: await probe(page,`/w/${WS}/directories`,'Directories (no composer)'),
});
