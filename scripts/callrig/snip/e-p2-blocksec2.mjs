import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => {
     const el=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); });
     if(el) el.scrollIntoView({block:'start'}); })()`);
  await page.waitForTimeout(2000);
  return await page.evaluate(`(() => { ${VISFN}
     const hd=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); });
     const hy = hd ? hd.getBoundingClientRect().y : null;
     const m=document.querySelector('main')||document.body;
     // EVERY interactive node, no text filter at all
     const all=[...m.querySelectorAll('button,a,input,select,textarea,[role=combobox],[role=switch],[role=listbox],[role=option],[contenteditable="true"]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tag:e.tagName, role:e.getAttribute('role')||'',
           tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
           ph:e.getAttribute('placeholder')||'', al:(e.getAttribute('aria-label')||'').slice(0,24),
           dis:e.disabled===true, vis:vis(e)?1:0, y:Math.round(b.y), w:Math.round(b.width)};})
       .filter(e=>hy===null || (e.y>=hy-20 && e.y<=hy+260))
       .sort((a,b)=>a.y-b.y);
     return {headingY:hy===null?null:Math.round(hy), nNear:all.length, near:all.slice(0,12)}; })()`);
};
