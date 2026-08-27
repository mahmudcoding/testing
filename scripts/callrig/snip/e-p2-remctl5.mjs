import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  // locate the node by textContent only (no visibility test), then scroll it into view
  const loc = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('*')].filter(x=>/reminder/i.test(x.textContent||'')
        && (x.textContent||'').replace(/\\s+/g,' ').trim().length<70);
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     if(!inner.length) return {none:true, anyMatch:els.length};
     const e=inner[0]; e.scrollIntoView({block:'center'});
     const a={}; for(const at of e.attributes) a[at.name]=String(at.value).slice(0,30);
     return {tag:e.tagName, txt:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40), attrs:a}; })()`);
  out.located = loc;
  if(loc.none) return out;
  await page.waitForTimeout(1500);
  const box = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('*')].filter(x=>/reminder/i.test(x.textContent||'')
        && (x.textContent||'').replace(/\\s+/g,' ').trim().length<70);
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     const e=inner[0]; const r=e.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height),
             topmost: document.elementFromPoint(r.x+r.width/2, r.y+r.height/2)?.tagName}; })()`);
  out.box=box;
  await page.mouse.move(box.cx, box.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(3000);
  out.options = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button,[role=listbox] *')].filter(vis)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<32))].slice(0,10); })()`);
  return out;
};
