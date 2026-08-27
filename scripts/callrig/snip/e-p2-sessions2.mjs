import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/sessions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const api = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
     let j=null; try{j=await r.json();}catch(e){}
     const arr=(j&&(j.sessions||j.data||j.items))||(Array.isArray(j)?j:[]);
     return {st:r.status, topKeys:j?Object.keys(j).slice(0,6):[], n:arr.length,
             keys:arr[0]?Object.keys(arr[0]):[],
             rows:arr.slice(0,4).map(x=>JSON.stringify(x).slice(0,300))}; })()`);
  const screen = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const start=t.indexOf('Active sessions');
     const btns=[...m.querySelectorAll('button')].filter(vis)
       .map(e=>({tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
                 al:(e.getAttribute('aria-label')||'').slice(0,26)}))
       .filter(e=>!/^(Account|Profile|Notifications|Appearance|Calls and audio|Privacy & security|Sessions|Security|About|Company|Workspace|Roles|Company dashboard|Members)$/.test(e.tx));
     const uaShown = /Mozilla\\/5\\.0/.test(t);
     const unknownCount=(t.match(/Unknown device/g)||[]).length;
     return {section:t.slice(start, start+700), btns:btns.slice(0,10),
             uaShown, unknownCount}; })()`);
  return {api, screen};
};
