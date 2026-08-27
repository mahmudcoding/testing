import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
// Enumerate primary action buttons across sector-E screens and record their declared state.
// A button that is enabled-looking but inert is the finding-16 shape.
export default async ({page}) => {
  const out={};
  for(const [route,label] of [['/files','Files'],['/calendar','Calendar'],
                              ['/directories?tab=people','Directories'],
                              ['/settings/privacy','Privacy'],['/settings/appearance','Appearance']]){
    await page.goto(BASE+'/w/'+WS+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    out[label] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main');
       const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
       return [...m.querySelectorAll('button')]
         .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
                   dis:e.disabled===true, ad:e.getAttribute('aria-disabled'),
                   vis:vis(e)?1:0}))
         .filter(e=>e.tx && !nav.test(e.tx))
         .filter(e=>e.dis || e.ad==='true'); })()`);
  }
  return out;
};
