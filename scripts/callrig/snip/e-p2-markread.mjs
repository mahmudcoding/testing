import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const bell = `(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||'')); return b? b.getAttribute('aria-label')+' badge="'+(b.innerText||'').replace(/\\s+/g,'')+'"':null;})()`;
const apiN = `(async()=>{const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});const j=await r.json().catch(()=>({}));
  const a=j?.notifications||j?.data||[]; return {n:a.length, unread:a.filter(x=>!(x.is_read||x.read_at)).length};})()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.bellBefore = await page.evaluate(bell);
  out.apiBefore = await page.evaluate(apiN);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  out.panelRowCount = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? [...d.querySelectorAll('li')].filter(vis).length : -1; })()`);
  writes.length=0;
  out.clickMarkAll = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /mark all as read/i); })()`);
  const t=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(600); t.push(await page.evaluate(bell)); }
  out.bellTrace = [...new Set(t)].join('  ->  ');
  out.writes = writes.slice(0,3);
  out.apiAfter = await page.evaluate(apiN);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.bellAfterReload = await page.evaluate(bell);
  return out;
};
