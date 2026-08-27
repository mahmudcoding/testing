import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2500);
  const st1 = await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {noDialog:true};
    return {inputs:[...d.querySelectorAll('input')].map(i=>({ph:i.placeholder,v:i.value,ro:i.readOnly,dis:i.disabled})),
            text:d.innerText.replace(/\s+/g,' ').slice(0,220)};
  });
  const inp=page.locator('[role=dialog] input').first();
  await inp.click();
  await inp.type('archive',{delay:60});
  await page.waitForTimeout(4000);
  const st2 = await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return {inputs:[...d.querySelectorAll('input')].map(i=>({v:i.value})),
            text:d.innerText.replace(/\s+/g,' ').slice(0,300)};
  });
  return {afterOpen:st1, afterType:st2};
};
