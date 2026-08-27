import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const t = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .find(x=>/Open QA Alice's profile/i.test(x.getAttribute('aria-label')||''));
    if(!b) return {none:true};
    const r=b.getBoundingClientRect();
    return {label:b.getAttribute('aria-label'), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.opened=t; if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(4500);
  out.popup = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[data-state=open],aside,[class*=popover]')].filter(boxVis).pop();
    if(!d) return {none:true};
    const t=(d.innerText||'').replace(/\\s+/g,' ');
    return { text:t.slice(0,320),
             shows:{ department:/Quality/i.test(t), jobTitle:/QA Engineer/i.test(t),
                     timezone:/GMT|Tashkent|\\+05/i.test(t), localTime:/\\d{1,2}:\\d{2}/.test(t) },
             controls:[...new Set([...d.querySelectorAll('button,a[href]')].filter(vis)
               .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,28)).filter(Boolean))].slice(0,14) }; })()`);
  // what does the server actually give bob about alice?
  out.apiUser = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/users/U4QEALICE000001',{credentials:'include'});
    const t=await r.text();
    return {st:r.status, hasDept:/department/.test(t), hasJob:/jobTitle|job_title/.test(t),
            keys: (()=>{try{const j=JSON.parse(t); return Object.keys(j.user||j).join(',').slice(0,200);}catch(e){return t.slice(0,140);}})() }; })()`);
  return out;
};
