import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for(const route of ['about','security']){
    await page.goto(BASE+'/w/'+WS+'/settings/'+route, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    out[route] = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main')||document.body;
       // EVERYTHING interactive. No text filter. No tag assumptions beyond the interactive set.
       const all=[...m.querySelectorAll('button,a,input,select,textarea,[role],[tabindex],[contenteditable]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;})
         .map(e=>({tag:e.tag||e.tagName, role:e.getAttribute('role')||'', type:e.getAttribute('type')||'',
            tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22),
            al:(e.getAttribute('aria-label')||'').slice(0,22), ph:e.getAttribute('placeholder')||'',
            checked:e.getAttribute('aria-checked'), dis:e.disabled===true, vis:vis(e)?1:0}))
         .filter(e=>/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(e.tag) || /switch|checkbox|radio|combobox|tab/.test(e.role));
       const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
       const body=all.filter(e=>!nav.test(e.tx));
       return {total:all.length, nonNav:body.length, controls:body.slice(0,12)}; })()`);
  }
  return out;
};
