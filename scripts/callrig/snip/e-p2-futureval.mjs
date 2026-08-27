import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const setField = async (page, field, value) => page.evaluate(`(() => { ${boxVis}
   const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
   const i=d.querySelector('input[data-field="'+${JSON.stringify(field)}+'"]');
   if(!i) return false;
   const proto=i.type==='time'||i.type==='date'?window.HTMLInputElement.prototype:window.HTMLInputElement.prototype;
   const s=Object.getOwnPropertyDescriptor(proto,'value').set;
   s.call(i, ${JSON.stringify(value)}); i.dispatchEvent(new Event('input',{bubbles:true}));
   i.dispatchEvent(new Event('change',{bubbles:true})); return true; })()`);
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST')
    posts.push((r.postData()||'').slice(0,260)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.clock = await page.evaluate(`(() => { const n=new Date();
     return {localDate:n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),
             localTime:n.toTimeString().slice(0,5), utcDate:n.toISOString().slice(0,10)}; })()`);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(4000);
  out.defaults = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const f={}; ['event-start','event-start-time','event-end','event-end-time'].forEach(k=>{
       const i=d.querySelector('input[data-field="'+k+'"]'); if(i) f[k]=String(i.value); }); return f; })()`);
  // set a clearly-future local time TODAY (local date), 3 hours from now
  const tgt = await page.evaluate(`(() => { const n=new Date(Date.now()+3*3600*1000);
     return {d:n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'),
             t:String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')}; })()`);
  out.target = tgt;
  await setField(page,'event-start',tgt.d);
  await setField(page,'event-start-time',tgt.t);
  await page.waitForTimeout(1500);
  await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i,'E2 future validation probe'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(900); posts.length=0;
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  const b=await sub.boundingBox();
  if(b){ await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); }
  await page.waitForTimeout(6000);
  out.posted = posts.slice(0,1);
  out.afterSubmit = await page.evaluate(`(() => { ${boxVis} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     if(!d) return {dialogClosed:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {dialogClosed:false, error:(t.match(/must be in the future|future|ошибк|error/i)||[''])[0],
             tail:t.slice(-140)}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
