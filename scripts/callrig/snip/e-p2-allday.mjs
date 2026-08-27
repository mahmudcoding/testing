import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST') posts.push((r.postData()||'').slice(0,150)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  const t=page.locator('input[data-field="event-title"]').first();
  await t.click(); await page.keyboard.type('E2 allday today'); await page.waitForTimeout(700);
  // flip All day via its label (it is a switch with a label[for])
  out.allDayToggled = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const sw=[...d.querySelectorAll('[role=switch],input[type=checkbox]')].filter(vis);
     const lab=[...d.querySelectorAll('label')].find(l=>/All day/i.test(l.textContent||''));
     let el=null;
     if(lab && lab.getAttribute('for')) el=document.getElementById(lab.getAttribute('for'));
     if(!el) el=sw[0];
     if(!el) return {found:false, switches:sw.length};
     const before=el.getAttribute('aria-checked')||String(el.checked);
     el.click();
     return {found:true, before, after:el.getAttribute('aria-checked')||String(el.checked)}; })()`);
  await page.waitForTimeout(2200);
  out.state = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const txt=(d.innerText||'').replace(/\\s+/g,' ');
     return {fields:f, error:/must be in the future|required|must be/i.test(txt),
             errText:(txt.match(/[A-Z][^.!]{0,60}(must be|required)[^.!]{0,20}/)||[''])[0]}; })()`);
  posts.length=0;
  const sub=page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b=await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(5500);
  out.posted=posts.slice(0,1);
  out.afterSubmit = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {closed:true};
     const txt=(d.innerText||'').replace(/\\s+/g,' ');
     return {closed:false, errText:(txt.match(/[A-Z][^.!]{0,70}(must be|required)[^.!]{0,20}/)||[''])[0]}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
