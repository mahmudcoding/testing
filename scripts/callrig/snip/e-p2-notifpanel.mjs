import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3500);
  return await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!p) return {err:'no panel'};
     // every interactive element, with role and state — not filtered by what I expect
     const els=[...p.querySelectorAll('button,a,[role=tab],[role=option],[role=menuitem],[role=switch],input,select')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tag:e.tagName, role:e.getAttribute('role')||'',
                 al:(e.getAttribute('aria-label')||'').slice(0,26),
                 tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40),
                 sel:e.getAttribute('aria-selected'), press:e.getAttribute('aria-pressed'),
                 vis:vis(e)?1:0, w:Math.round(b.width)};});
     return {panelText:(p.innerText||'').replace(/\\s+/g,' ').slice(0,200),
             n:els.length, chrome:els.filter(e=>e.w<260).slice(0,14)}; })()`);
};
