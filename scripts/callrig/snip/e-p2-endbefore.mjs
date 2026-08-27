import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST')
    posts.push((r.postData()||'').slice(0,220)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  const fields = `(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {fields:f, summary:(t.match(/\\w{3}, \\w{3} \\d{1,2}[^|]{0,44}/)||[''])[0]}; })()`;
  out.defaults = await page.evaluate(fields);
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-10');
  await page.waitForTimeout(1200);
  out.afterStart = await page.evaluate(fields);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-09');
  await page.waitForTimeout(2000);
  out.afterEnd = await page.evaluate(fields);
  // now actually try to submit and see what happens
  await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i,'E2 end-before-start guard'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(900); posts.length=0;
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b = await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(6000);
  out.posted = posts.slice(0,1);
  out.afterSubmit = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {dialogClosed:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogClosed:false, tail:t.slice(-160)}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
