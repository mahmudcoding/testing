import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  return await page.evaluate(`(() => { ${VISFN}
     const n=new Date();
     const localDate=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
     const m=document.querySelector('main');
     // week grid slots: find elements with a disabled look, grouped by their day/hour if derivable
     const cands=[...m.querySelectorAll('[data-testid],[class*="slot"],[class*="cell"]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>20&&r.height>10&&r.height<80;});
     const info=cands.map(e=>{const cs=getComputedStyle(e);
       return {tid:e.getAttribute('data-testid')||'', cur:cs.cursor, op:cs.opacity,
               dis:e.getAttribute('aria-disabled')||String(e.disabled||'')};});
     const notAllowed=info.filter(x=>x.cur==='not-allowed');
     const tids=[...new Set(info.map(x=>x.tid).filter(Boolean))].slice(0,6);
     return {localDate, localTime:n.toTimeString().slice(0,5), utcDate:n.toISOString().slice(0,10),
             utcTime:n.toISOString().slice(11,16),
             totalCandidates:info.length, notAllowedCount:notAllowed.length,
             testidsSeen:tids,
             sampleDisabled:notAllowed.slice(0,4)}; })()`);
};
