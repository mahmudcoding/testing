import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.candidates = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('button,select,[role=combobox],[role=button],div[tabindex],span')].filter(vis)
       .filter(x=>/reminder/i.test((x.textContent||'')+(x.getAttribute('aria-label')||'')))
       .filter(x=>(x.textContent||'').length<80);
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     return inner.map(e=>{ const r=e.getBoundingClientRect(); const a={};
       for(const at of e.attributes) a[at.name]=at.value.slice(0,34);
       return {tag:e.tagName, text:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40),
               attrs:a, cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; }).slice(0,6); })()`);
  if(out.candidates.length){
    const t=out.candidates[0];
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3000);
    out.opened = await page.evaluate(`(() => { ${VISFN}
       return [...new Set([...document.querySelectorAll('[role=option],[role=menuitem],[data-state=open] button,[role=listbox] div')].filter(vis)
         .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim()).filter(x=>x&&x.length<30))].slice(0,10); })()`);
  }
  await page.keyboard.press('Escape'); await page.waitForTimeout(800); await page.keyboard.press('Escape');
  return out;
};
