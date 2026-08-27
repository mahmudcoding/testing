import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const MID = process.env.QA_MID || 'S4OWKW57UWOK0WU';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const measure = `(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return {noCard:true};
    const btns=[...d.querySelectorAll('button')].filter(b=>/^(Yes|No|Start meeting|Edit|Delete|Invite by email)$/.test((b.textContent||'').trim()) || /^(Yes|No)$/.test(b.getAttribute('aria-label')||''));
    return { cardText:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,260),
      btns: btns.map(b=>{ const cs=getComputedStyle(b); const r=b.getBoundingClientRect();
        return (b.textContent||'').trim().slice(0,14)+' disabled='+b.disabled+' aria-dis='+(b.getAttribute('aria-disabled')||'-')
          +' pe='+cs.pointerEvents+' op='+cs.opacity+' rect='+Math.round(r.width)+'x'+Math.round(r.height); }) }; })()`;
  // poll: does it settle from a loading state?
  const trace=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(800); const m=await page.evaluate(measure);
    trace.push((m.btns||[]).map(b=>b.split(' ')[0]+':'+(b.includes('disabled=true')?'DIS':'en')).join(',')); }
  out.settleTrace = [...new Set(trace)].join('  ->  ');
  out.detail = await page.evaluate(measure);
  return out;
};
