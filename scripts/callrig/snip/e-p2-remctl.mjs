import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.el = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const cands=[...d.querySelectorAll('*')].filter(vis).filter(x=>/^No reminder$/.test((x.textContent||'').trim()));
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     return inner.map(e=>{ const r=e.getBoundingClientRect(); const a={};
       for(const at of e.attributes) a[at.name]=at.value.slice(0,40);
       return {tag:e.tagName, attrs:a, cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
               parent:e.parentElement&&e.parentElement.tagName+'['+(e.parentElement.getAttribute('role')||'')+']'}; }); })()`);
  if(out.el.length){
    const t=out.el[0];
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(2800);
    out.options = await page.evaluate(`(() => { ${VISFN}
       return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[role=listbox] *,[data-state=open] button')].filter(vis)
         .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<30))].slice(0,10); })()`);
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(800); await page.keyboard.press('Escape');
  return out;
};
