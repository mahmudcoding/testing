import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const before = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('a')].find(e=>/skip to content/i.test(e.textContent||''));
    if(!a) return {exists:false};
    const r=a.getBoundingClientRect(); const cs=getComputedStyle(a);
    return {exists:true, href:a.getAttribute('href'),
      hiddenUntilFocus: r.width===0||r.height===0||cs.clip!=='auto'||parseFloat(cs.opacity)===0||r.y<0,
      rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},
      targetExists: !!document.querySelector(a.getAttribute('href')||'#__none')};
  });
  // Tab from the top: the skip link should be the first focusable and should become visible
  await page.evaluate(()=>{ document.body.focus(); window.scrollTo(0,0); });
  await page.keyboard.press('Tab'); await page.waitForTimeout(600);
  const focused = await page.evaluate(()=>{
    const e=document.activeElement; if(!e) return null;
    const r=e.getBoundingClientRect();
    return {tag:e.tagName, text:(e.textContent||'').trim().slice(0,30),
      visibleNow: r.width>0&&r.height>0&&r.y>=0,
      rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}};
  });
  // activate it and see where focus lands
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  const after = await page.evaluate(()=>{
    const e=document.activeElement;
    const main=document.querySelector('main');
    return {activeTag:e?e.tagName:null, activeId:e?e.id:null,
      activeLabel:e?((e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,34)):null,
      focusInsideMain: !!(main&&e&&main.contains(e)),
      activeIsMain: !!(main&&e===main), hash:location.hash};
  });
  return {before, focusedAfterTab:focused, afterEnter:after};
};
