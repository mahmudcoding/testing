import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3500);
  const clickText = async (re) => {
    const t = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const cands=[...d.querySelectorAll('button,[role=option],[role=radio],label')].filter(vis)
         .filter(x=>${re}.test((x.getAttribute('aria-label')||'')+' '+(x.textContent||'')));
       const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
       const el=inner[0]||cands[0]; if(!el) return {none:true};
       const r=el.getBoundingClientRect();
       return {name:(el.textContent||'').trim().slice(0,30), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return t;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(2500); return t;
  };
  out.pickCustom = await clickText('/Custom RRULE/i');
  out.panel = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Repeat');
     return { near:t.slice(i, i+280),
              inputs:[...d.querySelectorAll('input,textarea')].filter(vis)
                .map(x=>'df='+(x.getAttribute('data-field')||'-')+' type='+(x.getAttribute('type')||'-')
                  +' ph="'+((x.getAttribute('placeholder')||'').slice(0,44))+'" val="'+String(x.value||'').slice(0,30)+'"').slice(0,12) }; })()`);
  return out;
};
