import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/settings/privacy', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // scroll the Blocked users heading into view
  await page.evaluate(`(() => {
     const el=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); });
     if(el) el.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(1800);
  return await page.evaluate(`(() => { ${VISFN}
     const hd=[...document.querySelectorAll('*')].find(e=>{
       const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
       return /^\\s*Blocked users\\s*$/.test(own); });
     if(!hd) return {err:'no heading'};
     // walk up to the section container
     let sec=hd; for(let i=0;i<5;i++){ if(sec.parentElement) sec=sec.parentElement;
       if(/Blocked users/.test(sec.innerText||'') && (sec.innerText||'').length>90) break; }
     const els=[...sec.querySelectorAll('button,a,input,select,[role=combobox],[role=switch],[role=listbox],[contenteditable]')]
       .map(e=>{const b=e.getBoundingClientRect();
         return {tag:e.tagName, role:e.getAttribute('role')||'',
           tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26),
           ph:e.getAttribute('placeholder')||'', al:(e.getAttribute('aria-label')||'').slice(0,26),
           dis:e.disabled===true, vis:vis(e)?1:0, w:Math.round(b.width)};});
     return {sectionText:(sec.innerText||'').replace(/\\s+/g,' ').slice(0,220), n:els.length, els:els.slice(0,10)}; })()`);
};
