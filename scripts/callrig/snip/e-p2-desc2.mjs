import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    posts.push({req:(r.request().postData()||'').slice(0,260), res:b}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E desc probe 2');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-19'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-19'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end-time"]').first().fill('14:30'); await page.waitForTimeout(700);
  // locate WITHOUT the visibility test, scroll it into view, then click with a real mouse
  const loc = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('*')].filter(x=>/^Add description$/i.test((x.textContent||'').trim()));
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     if(!inner.length) return {none:true, count:els.length};
     const e=inner[0]; e.scrollIntoView({block:'center'});
     return {tag:e.tagName, cls:String(e.className||'').slice(0,34)}; })()`);
  out.located=loc;
  if(loc.none) return out;
  await page.waitForTimeout(1400);
  const box = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('*')].filter(x=>/^Add description$/i.test((x.textContent||'').trim()));
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     const e=inner[0]; const t=e.closest('button')||e; const r=t.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(box.cx,box.cy); await page.waitForTimeout(350);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(2800);
  out.fieldsNow = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('textarea,[contenteditable="true"]')].filter(vis)
       .map(e=>e.tagName+' ph="'+((e.getAttribute('placeholder')||e.getAttribute('aria-label')||'').slice(0,28))+'"'); })()`);
  if(out.fieldsNow.length){
    await page.keyboard.type('QA-E description body probe');
    await page.waitForTimeout(900);
  }
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.sentDescription = posts[0]? /"description":"[^"]+"/.test(posts[0].req) : '(no POST)';
  const id = posts[0]? (posts[0].res.match(/"id":"([^"]+)"/)||[])[1] : null;
  if(id){
    await page.goto(BASE+'/w/'+WS+'/calendar/'+id, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    out.card = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const t=((d||document.querySelector('main')).innerText||'').replace(/\\s+/g,' ');
       return {text:t.slice(0,200), showsDescription:/description body probe/i.test(t)}; })()`);
    out.api = await page.evaluate(`(async () => {
       const r=await fetch('/api/v1/calendar/meetings/'+'${id}',{credentials:'include'});
       const t=await r.text(); const m=t.match(/"description":"[^"]*"/); return m?m[0].slice(0,80):'(none)'; })()`);
  }
  return out;
};
