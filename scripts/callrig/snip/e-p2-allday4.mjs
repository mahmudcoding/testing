import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const btns=[...d.querySelectorAll('button')].filter(vis).map(e=>{
      const r=e.getBoundingClientRect();
      return {l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26),
        type:e.type, y:Math.round(r.y), x:Math.round(r.x), disabled:e.disabled};
    });
    return {total:btns.length, bottom: btns.filter(b=>b.y>500).slice(-8), submits: btns.filter(b=>b.type==='submit')};
  });
};
