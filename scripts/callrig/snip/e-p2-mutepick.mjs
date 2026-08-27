import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const OPT=process.env.QA_MUTE||'Until turned off';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,54)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    return clickDeepest(document.body, /Mute notifications|Unmute notifications/i); })()`);
  await page.waitForTimeout(2200);
  writes.length=0;
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis).pop();
    if(!d) return 'no menu';
    return clickDeepest(d, new RegExp('^'+${JSON.stringify(OPT)}.replace(/ /g,'\\\\s+')+'$')); })()`);
  await page.waitForTimeout(4000);
  out.writes = writes.slice(0,3);
  out.controlNow = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b? b.getAttribute('aria-label')+' pressed='+(b.getAttribute('aria-pressed')??'-') : 'gone'; })()`);
  // park away from the channel so nothing marks read
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  out.baseline = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return {total:j.total, messaging:a.filter(n=>String(n.category||'')==='messaging').length}; })()`);
  return out;
};
