import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3500);
  const dump = `(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Repeat');
     return { near: i>=0? t.slice(i, i+220):'(no Repeat text)',
              inputs:[...d.querySelectorAll('input,select')].filter(vis)
                .map(x=>x.tagName.toLowerCase()+' df='+(x.getAttribute('data-field')||'-')+' type='+(x.getAttribute('type')||'-')
                     +' val="'+String(x.value||'').slice(0,16)+'"').slice(0,12) }; })()`;
  out.before = await page.evaluate(dump);
  // open the Repeat control with a real mouse
  const t = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const cands=[...d.querySelectorAll('button,[role=combobox],select')].filter(vis)
       .filter(x=>/Does not repeat|Repeat/i.test((x.getAttribute('aria-label')||'')+' '+(x.textContent||'')));
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     const el=inner[0]||cands[0]; if(!el) return {none:true};
     const r=el.getBoundingClientRect();
     return {name:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,34),
             cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.control=t; if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(2500);
  out.options = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[role=listbox] button,[data-state=open] button')].filter(vis)
       .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,14); })()`);
  // pick Daily and see whether an end condition appears
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const root=document.querySelector('[role=listbox]')||document.querySelector('[data-state=open]')||document.body;
     return clickDeepest(root, /^(Daily|Every day)$/); })()`);
  await page.waitForTimeout(3000);
  out.afterDaily = await page.evaluate(dump);
  out.endCondition = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return { mentionsEnd:/Ends|End date|Until|After .* occurrence|Never/i.test(t),
              snippet:(t.match(/.{0,60}(Ends|Until|Never|occurrence).{0,80}/i)||['(none)'])[0] }; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');
  return out;
};
