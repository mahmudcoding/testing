import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(() => { ${VISFN}
     const all=[...document.querySelectorAll('button,a,[role=tab],[role=link]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                 al:(e.getAttribute('aria-label')||'').slice(0,24),
                 href:(e.getAttribute('href')||'').slice(-30),
                 role:e.getAttribute('role')||'', vis:vis(e)?1:0,
                 x:Math.round(b.x), y:Math.round(b.y), w:Math.round(b.width)};})
       .filter(e=>e.tx||e.al);
     return {n:all.length, profileLike:all.filter(e=>/profile/i.test(e.tx+' '+e.al+' '+e.href)),
             visible:all.filter(e=>e.vis).slice(0,24)}; })()`);
};
