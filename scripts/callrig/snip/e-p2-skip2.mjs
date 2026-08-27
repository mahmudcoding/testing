import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const start = await page.evaluate(()=>({active:document.activeElement?document.activeElement.tagName:null,
    activeLabel:document.activeElement?((document.activeElement.getAttribute('aria-label')||'').slice(0,30)):null}));
  await page.keyboard.press('Tab'); await page.waitForTimeout(700);
  const t1 = await page.evaluate(()=>{
    const e=document.activeElement; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
    return {tag:e.tagName, text:(e.textContent||'').trim().slice(0,26), href:e.getAttribute?e.getAttribute('href'):null,
      rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      visible:r.width>0&&r.height>0&&r.y>=0&&parseFloat(cs.opacity)>0};
  });
  const isSkip = t1.href==='#main-content';
  let afterEnter=null;
  if (isSkip) {
    await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    afterEnter = await page.evaluate(()=>{
      const e=document.activeElement, main=document.querySelector('#main-content')||document.querySelector('main');
      return {activeTag:e?e.tagName:null, activeId:e?e.id:null,
        focusMovedIntoMain: !!(main&&e&&(e===main||main.contains(e))),
        hash:location.hash};
    });
    // and does the NEXT Tab land inside main?
    await page.keyboard.press('Tab'); await page.waitForTimeout(600);
    afterEnter.nextTabInsideMain = await page.evaluate(()=>{
      const e=document.activeElement, main=document.querySelector('#main-content')||document.querySelector('main');
      return {inside: !!(main&&e&&main.contains(e)),
        label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,32)};
    });
  }
  return {focusAtLoad:start, firstTabStop:t1, firstTabStopIsSkipLink:isSkip, afterEnter};
};
