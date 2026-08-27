import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const pick = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const c=[...m.querySelectorAll('button')].filter(vis)
      .filter(b=>/Create event/i.test(b.getAttribute('aria-label')||''));
    // pick one in a middle column, a plausible hour
    const el=c.find(b=>/Thursday at 14:00|Thursday at 2:00 PM/.test(b.getAttribute('aria-label')||'')) || c[38];
    const r=el.getBoundingClientRect();
    return {label:el.getAttribute('aria-label'), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.target = pick;
  const anyOverlay = `(() => { ${VISFN}
     const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<80||r.height<60) return false;
       let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
         if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
     const c=[...document.querySelectorAll('[role=dialog],[role=alertdialog],[data-state=open],form,aside')].filter(boxVis);
     return c.map(e=>e.tagName.toLowerCase()+'['+(e.getAttribute('role')||e.getAttribute('data-state')||'')+'] '
       +((e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,90))).slice(0,4); })()`;
  out.overlaysBefore = await page.evaluate(anyOverlay);
  // real mouse click
  await page.mouse.move(pick.cx, pick.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(150); await page.mouse.up();
  const samples=[]; for(let i=0;i<12;i++){ await page.waitForTimeout(400); samples.push(await page.evaluate(anyOverlay)); }
  out.afterMouseClick = samples[samples.length-1];
  out.firstOverlay = (()=>{ for(let i=0;i<samples.length;i++) if(samples[i].length) return {atMs:(i+1)*400, v:samples[i]}; return null; })();
  out.fields = await page.evaluate(`(() => { ${VISFN}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>80;}).pop();
    if(!d) return 'no dialog';
    const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
      const i=d.querySelector('input[data-field="'+k+'"]'); f[k]= i? String(i.value||'') : '(absent)'; });
    return f; })()`);
  return out;
};
