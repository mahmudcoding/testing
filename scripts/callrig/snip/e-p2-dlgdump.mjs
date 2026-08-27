import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(4000);
  const dump = () => page.evaluate(`(() => { ${boxVisFn} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {err:'no dialog'};
     const r=d.getBoundingClientRect();
     const els=[...d.querySelectorAll('button,[role=combobox],[role=switch],[role=checkbox],[role=radio],select,input,textarea,label,a')]
       .map(x=>{const b=x.getBoundingClientRect();
         return {t:x.tagName, r:x.getAttribute('role')||'', al:(x.getAttribute('aria-label')||'').slice(0,34),
           tx:(x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,34), df:x.getAttribute('data-field')||'',
           y:Math.round(b.y), h:Math.round(b.height), vis:vis(x)?1:0};})
       .filter(x=>x.al||x.tx||x.df);
     return {box:{y:Math.round(r.y),h:Math.round(r.height)}, sh:d.scrollHeight, ch:d.clientHeight, n:els.length, els}; })()`);
  const a = await dump();
  // scroll the dialog to the bottom and dump again
  await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const sc=[d,...d.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+40);
     if(sc) sc.scrollTop = sc.scrollHeight; })()`);
  await page.waitForTimeout(1800);
  const b = await dump();
  return {top:a, bottom:b.els.filter(x=>!a.els.some(y=>y.al===x.al&&y.tx===x.tx))};
};
