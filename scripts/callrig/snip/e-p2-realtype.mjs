import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST') posts.push(1); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  // type the title like a person
  const title = page.locator('input[data-field="event-title"]').first();
  await title.click(); await page.keyboard.type('E2 typed range test'); await page.waitForTimeout(800);
  // type a LATE start time, then an EARLIER end time — both by keyboard
  const startt = page.locator('input[data-field="event-start-time"]').first();
  await startt.click(); await page.waitForTimeout(400);
  await page.keyboard.type('0200PM'); await page.waitForTimeout(1500);
  const endt = page.locator('input[data-field="event-end-time"]').first();
  await endt.click(); await page.waitForTimeout(400);
  await page.keyboard.type('0900AM'); await page.waitForTimeout(2000);
  out.afterTyping = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start-time','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); });
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {fields:f, hasSummary:/\\d{1,2}:\\d{2}\\s*(AM|PM)?\\s*–/.test(t),
             anyError:/required|must be|invalid|ошиб/i.test(t)}; })()`);
  posts.length=0;
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b = await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(5000);
  out.postFired = posts.length>0;
  out.afterSubmit = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {dialogClosed:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogClosed:false, anyError:/required|must be|invalid|ошиб/i.test(t)}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
