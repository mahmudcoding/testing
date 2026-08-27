import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${VISFN}
  const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/message requests/i.test(x.getAttribute('aria-label')||''));
  return {reqBtn: b? b.getAttribute('aria-label') : 'gone',
    dmLinks:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,22))}; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,50)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.before = await page.evaluate(st);
  await page.locator('button[aria-label^="Message requests"]').first().click();
  await page.waitForTimeout(2500);
  writes.length=0;
  out.accept = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Accept$/); })()`);
  await page.waitForTimeout(5000);
  out.writes = writes.slice(0,3);
  out.panelAfter = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,220) : '(panel closed)'; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  out.afterLive = await page.evaluate(st);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.afterReload = await page.evaluate(st);
  return out;
};
