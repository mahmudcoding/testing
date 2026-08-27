import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    posts.push({req:(r.request().postData()||'').slice(0,220), res:b}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E desc probe');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-18'); await page.waitForTimeout(320);
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00'); await page.waitForTimeout(320);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-18'); await page.waitForTimeout(320);
  await page.locator('input[data-field="event-end-time"]').first().fill('14:30'); await page.waitForTimeout(800);
  out.expand = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /Add description/i); })()`);
  await page.waitForTimeout(2500);
  out.fields = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('textarea,[contenteditable="true"]')].filter(vis)
       .map(e=>e.tagName+' ph="'+((e.getAttribute('placeholder')||e.getAttribute('aria-label')||'').slice(0,26))+'"'); })()`);
  const DESC='QA-E description body '+process.env.QA_TOK;
  out.typed = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('textarea,[contenteditable="true"]')].filter(vis)[0];
     if(!e) return 'no field';
     if(e.tagName==='TEXTAREA'){ const p=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
       p.call(e,'${DESC}'); e.dispatchEvent(new Event('input',{bubbles:true})); return 'textarea set'; }
     e.focus(); document.execCommand('insertText',false,'${DESC}'); return 'contenteditable set'; })()`);
  await page.waitForTimeout(1200);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.post = posts[0]? {sentDescription:/description/.test(posts[0].req), req:posts[0].req.slice(0,200)} : '(no POST)';
  const id = posts[0]? (posts[0].res.match(/"id":"([^"]+)"/)||[])[1] : null;
  out.meetingId = id? id.slice(-6):null;
  if(id){
    await page.goto(BASE+'/w/'+WS+'/calendar/'+id, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    out.card = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const root=d||document.querySelector('main');
       const t=(root.innerText||'').replace(/\\s+/g,' ');
       return {text:t.slice(0,200), showsDescription:/description body/i.test(t)}; })()`);
    out.api = await page.evaluate(`(async () => {
       const r=await fetch('/api/v1/calendar/meetings/'+'${id}',{credentials:'include'});
       const t=await r.text(); const m=t.match(/"description":"[^"]*"/);
       return m?m[0].slice(0,90):'(no description field)'; })()`);
  }
  return out;
};
