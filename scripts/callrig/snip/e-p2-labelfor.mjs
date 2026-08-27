import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.labels = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('label')].map(l=>({
       txt:(l.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26),
       forAttr:l.getAttribute('for')||'(none)',
       target:(()=>{ const f=l.getAttribute('for'); if(!f) return '(n/a)';
         const t=document.getElementById(f); return t? t.tagName+'['+(t.getAttribute('type')||t.getAttribute('role')||'')+']':'(id not found)'; })()
     })).slice(0,12); })()`);
  // drive the description control via the label's for
  out.driveResult = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const l=[...d.querySelectorAll('label')].find(x=>/description/i.test(x.textContent||''));
     if(!l) return 'no description label';
     const f=l.getAttribute('for'); if(!f) return 'label has no for; html='+l.outerHTML.slice(0,120);
     const t=document.getElementById(f);
     if(!t) return 'for="'+f+'" but no such element';
     t.scrollIntoView({block:'center'});
     const cs=getComputedStyle(t);
     return {tag:t.tagName, type:t.getAttribute('type'), display:cs.display, visibility:cs.visibility,
             rect:(()=>{const r=t.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height);})()}; })()`);
  return out;
};
