import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.calCtrls = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main')||document.body;
    return interactives(m).map(d=>d.label.slice(0,26)).join(' | ').slice(0,500); })()`);
  // open New meeting
  const opened = await page.evaluate(`(() => { ${VISFN}
    const n=[...document.querySelectorAll('button,a')].filter(vis).find(b=>/new meeting|schedule meeting|create event/i.test(b.getAttribute('aria-label')||b.textContent||''));
    if(!n) return 'not found'; n.click(); return 'clicked "'+((n.getAttribute('aria-label')||n.textContent)||'').replace(/\\s+/g,' ').trim().slice(0,30)+'"'; })()`);
  out.opened = opened;
  await page.waitForTimeout(3000);
  out.dialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return {none:true};
    return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,700),
      fields:[...d.querySelectorAll('input,textarea,select')].map((i,ix)=>ix+':'+(i.getAttribute('aria-label')||i.getAttribute('placeholder')||i.name||i.type||'?')+'='+String(i.value||'').slice(0,22)).join(' ; ').slice(0,600),
      buttons: interactives(d).filter(x=>x.tag==='BUTTON').map(x=>x.label.slice(0,26)+(x.disabled?'[DIS]':'')).join(' | ').slice(0,500) }; })()`);
  return out;
};
