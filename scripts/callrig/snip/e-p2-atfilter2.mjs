import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const rows = `(() => { ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {none:true};
  const t=(d.innerText||'').replace(/\\n+/g,'\\n');
  const c=t.replace(/\\n/g,' ').match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
  const bodies=[...t.matchAll(/#([a-z-]+)\\n([^\\n]{1,60})\\n(QA [A-Za-z]+) ·/g)].map(m=>m[3]+' | '+m[2].slice(0,42));
  return {counts: c? 'All='+c[1]+' Msg='+c[2]:'?', rows: bodies}; })()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/search')) reqs.push(u.replace(/^https:\/\/[^/]+/,'').slice(0,140)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  // ground truth: who wrote what in this channel
  out.groundTruth = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QEGENERAL0001/messages?limit=50',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.messages||[];
    return a.map(m=>(m.user_id||'').slice(-6)+' :: '+String(m.body||'').replace(/\\\\/g,'').slice(0,44)); })()`);
  out.hint = await page.evaluate(`(() => (document.body.innerText.match(/Use typed filters[^\\n]*/)||[''])[0])()`);
  await page.locator('button[aria-label^="Search "]').first().click();
  await page.waitForTimeout(2200);
  out.hintInDialog = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return ((d.innerText||'').match(/Use typed filters[^\\n]*/)||[''])[0]; })()`);
  const inp = page.locator('input[type=search], [role=dialog] input').first();
  for (const q of [':@ QA Bob', ':in #qa-general probe']) {
    reqs.length=0;
    await inp.fill(''); await page.waitForTimeout(600);
    await inp.fill(q); await page.waitForTimeout(4000);
    out['q['+q+']'] = {...await page.evaluate(rows), req: reqs.slice(-1)[0]||'(none)'};
  }
  return out;
};
