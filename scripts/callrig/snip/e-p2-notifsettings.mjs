import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/notifications', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  return await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const nav=/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/;
     // every switch, no visibility filter, labelled by ancestor
     const sw=[...m.querySelectorAll('[role=switch]')].map((e,i)=>{
       let n=e,ctx='';
       for(let k=0;k<6&&n;k++){ n=n.parentElement;
         if(n){const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>10&&s.length<150){ctx=s.slice(0,64);break;}}}
       return {i, checked:e.getAttribute('aria-checked'), ctx};});
     const other=[...m.querySelectorAll('button,[role=combobox],[role=radio]')]
       .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                 role:e.getAttribute('role')||'', checked:e.getAttribute('aria-checked')}))
       .filter(e=>e.tx && !nav.test(e.tx));
     return {head:t.slice(0,240), nSwitches:sw.length, switches:sw.slice(0,10),
             otherControls:[...new Map(other.map(e=>[e.tx,e])).values()].slice(0,10)}; })()`);
};
