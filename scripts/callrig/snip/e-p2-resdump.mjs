import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('unread'); await page.waitForTimeout(4500);
  return await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     if(!d) return {err:'no dialog'};
     const els=[...d.querySelectorAll('button,[role=option],[role=listitem],a,li,[data-testid]')].filter(vis)
       .map(x=>{const b=x.getBoundingClientRect();
         return {tag:x.tagName, tid:x.getAttribute('data-testid')||'', role:x.getAttribute('role')||'',
                 tx:(x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,52),
                 y:Math.round(b.y), w:Math.round(b.width), h:Math.round(b.height)};});
     return {n:els.length, els:els.slice(0,22)}; })()`);
};
