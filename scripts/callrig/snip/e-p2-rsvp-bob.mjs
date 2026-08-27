import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const MID='S4OWKW57UWOK0WU';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const card = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  return d? {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,500),
    ctrls: interactives(d).map(x=>x.label.slice(0,24)+(x.disabled?'[DIS]':'')).join(' | ').slice(0,400)} : {none:true}; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{ b=(await r.text()).slice(0,200);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,60)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar/'+MID, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  out.cardBefore = await page.evaluate(card);
  out.apiBefore = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/calendar/meetings/${MID}',{credentials:'include'});const t=await r.text();return {s:r.status, body:t.slice(0,420)};})()`);
  writes.length=0;
  out.clickYes = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop()||document.body;
    return clickDeepest(d, /^\\s*Yes\\s*$/); })()`);
  await page.waitForTimeout(5000);
  out.writesOnYes = writes.slice(0,3);
  out.cardAfter = await page.evaluate(card);
  out.apiAfter = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/calendar/meetings/${MID}',{credentials:'include'});const t=await r.text();return {s:r.status, body:t.slice(0,420)};})()`);
  // reload and confirm the response persisted
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.cardAfterReload = await page.evaluate(card);
  return out;
};
