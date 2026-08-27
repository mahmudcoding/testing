import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Who may reach you');
     // for each switch, find its nearest labelled ancestor block
     const sw=[...m.querySelectorAll('[role=switch]')].filter(vis).map(e=>{
       let n=e, ctx='';
       for(let k=0;k<5&&n;k++){ n=n.parentElement;
         if(n){ const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>12){ctx=s.slice(0,80); break;} } }
       return {checked:e.getAttribute('aria-checked'),
               name:(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.getAttribute('title')||''),
               ctx}; });
     const cb=[...m.querySelectorAll('[role=combobox]')].filter(vis).map(e=>{
       let n=e, ctx='';
       for(let k=0;k<5&&n;k++){ n=n.parentElement;
         if(n){ const s=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(s.length>12){ctx=s.slice(0,80); break;} } }
       return {val:(e.innerText||'').trim().slice(0,24),
               name:(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||''), ctx}; });
     return {text:t.slice(i, i+560), switches:sw, comboboxes:cb}; })()`);
};
