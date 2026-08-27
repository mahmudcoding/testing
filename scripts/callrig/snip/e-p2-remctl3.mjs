import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.hasWord = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||''); return {present:/reminder/i.test(t), len:t.length}; })()`);
  out.nodes = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('*')].filter(vis)
       .filter(x=>/reminder/i.test(x.textContent||'') && (x.textContent||'').replace(/\\s+/g,' ').trim().length<70);
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     return inner.map(e=>{ const r=e.getBoundingClientRect(); const a={};
       for(const at of e.attributes) a[at.name]=String(at.value).slice(0,30);
       return {tag:e.tagName, txt:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44),
               attrs:a, x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height)}; }).slice(0,6); })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700); await page.keyboard.press('Escape');
  return out;
};
