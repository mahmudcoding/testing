import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const sidebar = `(() => { ${VISFN}
  return [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,22)); })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEEMPTY000001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.sidebarBefore = await page.evaluate(sidebar);
  await page.getByRole('button',{name:'Channel details'}).first().click();
  await page.waitForTimeout(2800);
  out.panelCtrls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).pop();
    return p? interactives(p).map(x=>x.label.slice(0,24)+(x.disabled?'[D]':'')).join(' | ').slice(0,300):'none'; })()`);
  writes.length=0;
  out.clickLeave = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(p, /leave channel/i); })()`);
  await page.waitForTimeout(2500);
  out.confirmUI = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return p? {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(-220), ctrls:interactives(p).map(x=>x.label.slice(0,22)).join(' | ').slice(-200)}:'none'; })()`);
  out.confirm = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog],[role=alertdialog]')].filter(boxVis).pop();
    return clickDeepest(p, /^Leave channel$|^Leave$/i); })()`);
  await page.waitForTimeout(5000);
  out.writes = writes.slice(0,3);
  out.sidebarAfter = await page.evaluate(sidebar);
  out.membersApi = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/messaging/channels/C4QEEMPTY000001/members',{credentials:'include'});
    return {s:r.status}; })()`);
  return out;
};
