import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
    posts.push({req:(r.request().postData()||'').slice(0,300), res:b}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E desc probe 3');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-22'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-22'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end-time"]').first().fill('14:30'); await page.waitForTimeout(700);
  // drive the textarea through the label's for
  out.fill = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const l=[...d.querySelectorAll('label')].find(x=>/description/i.test(x.textContent||''));
     const t=document.getElementById(l.getAttribute('for'));
     if(!t) return 'no target';
     t.scrollIntoView({block:'center'});
     const p=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
     p.call(t,'QA-E description body probe three');
     t.dispatchEvent(new Event('input',{bubbles:true}));
     t.dispatchEvent(new Event('change',{bubbles:true}));
     return {set:true, value:t.value.slice(0,40)}; })()`);
  await page.waitForTimeout(1500);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.sentDescription = posts[0]? (posts[0].req.match(/"description":"[^"]*"/)||['(absent)'])[0] : '(no POST)';
  const id = posts[0]? (posts[0].res.match(/"id":"([^"]+)"/)||[])[1] : null;
  if(id){
    await page.goto(BASE+'/w/'+WS+'/calendar/'+id, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    out.card = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const t=((d||document.querySelector('main')).innerText||'').replace(/\\s+/g,' ');
       return {text:t.slice(0,220), showsDescription:/description body probe three/i.test(t)}; })()`);
    out.apiDescription = await page.evaluate(`(async () => {
       const r=await fetch('/api/v1/calendar/meetings/'+'${id}',{credentials:'include'});
       const t=await r.text(); const m=t.match(/"description":"[^"]*"/); return m?m[0].slice(0,80):'(none)'; })()`);
  }
  return out;
};
