import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(() => { ${VISFN}
     const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
     // every button on the page, visible or not, no text filter
     const all=[...document.querySelectorAll('button,[role=button]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                 al:(e.getAttribute('aria-label')||'').slice(0,26),
                 vis:vis(e)?1:0, y:Math.round(b.y), w:Math.round(b.width)};})
       .filter(e=>(e.tx||e.al) && !nav.test(e.tx));
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     return {n:all.length, reset:all.filter(e=>/reset/i.test(e.tx+' '+e.al)),
             tail:t.slice(-260), all:all.slice(0,18).map(e=>e.tx||('['+e.al+']'))}; })()`);
};
