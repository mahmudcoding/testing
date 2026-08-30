import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  await safeClick(page,'[data-testid="recording-start-access-trigger"]').then(r=>out.trigger=r).catch(e=>out.trigger=String(e));
  await page.waitForTimeout(2000);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).filter(d=>[...d.querySelectorAll('button')].length<=10);
    const d=ds.pop(); if(!d) return null;
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,600),
            btns:[...d.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,50),t:n.getAttribute('data-testid')}))};
  });
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Start recording$/i));
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.notices = await page.evaluate(()=>window.__qa.notices());
  out.overlay = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(0,400);
  });
  out.wall = new Date().toISOString();
  return out;
};
