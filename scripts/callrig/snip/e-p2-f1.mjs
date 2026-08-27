import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,140)); });
  // inside a channel — the condition the finding names
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  reqs.length=0;
  await page.keyboard.type('probe'); await page.waitForTimeout(5000);
  out.inDialog = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     return {tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()),
             rows:[...d.querySelectorAll('[role=option]')].length,
             chips:[...d.querySelectorAll('button')].filter(vis)
               .map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/Remove .* filter/.test(a))}; })()`);
  out.reqBefore = reqs.slice(-1);
  // click Open full search
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Open full search$/.test((x.innerText||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.buttonFound=!!t;
  if(t){ reqs.length=0;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(6000);
    out.reqAfter = reqs.slice(0,2);
    out.afterUrl = page.url().replace(BASE,'').slice(0,80);
    out.afterScreen = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main');
       const t=(m.innerText||'').replace(/\\s+/g,' ');
       return {head:t.slice(0,190),
               resultRows:[...m.querySelectorAll('[role=option],[data-testid*="result"]')].filter(vis).length,
               noResults:/No results|Ничего не найдено/i.test(t)}; })()`); }
  return out;
};
