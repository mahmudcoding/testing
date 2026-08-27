import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Add channel"]').click();
  await page.waitForTimeout(2500);
  const form = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,200),
      inputs:[...d.querySelectorAll('input,textarea')].filter(vis)
        .map(e=>({t:e.type,lbl:(e.getAttribute('aria-label')||e.placeholder||'').slice(0,30)})),
      buttons:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>({l:(e.textContent||'').trim().slice(0,22), type:e.type, dis:e.disabled}))};
  });
  return form;
};
