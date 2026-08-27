import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
     const all=[...m.querySelectorAll('button,a,[role=switch],[role=checkbox],[role=combobox],input,select,[tabindex]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tag:e.tagName, role:e.getAttribute('role')||'',
           tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
           dis:e.disabled===true, ad:e.getAttribute('aria-disabled'),
           vis:vis(e)?1:0, w:Math.round(b.width), h:Math.round(b.height),
           pe:getComputedStyle(e).pointerEvents};})
       .filter(e=>e.tx && !nav.test(e.tx));
     return {n:all.length, all:all.slice(0,16)}; })()`);
};
