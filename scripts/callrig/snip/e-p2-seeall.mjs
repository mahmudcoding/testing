import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,120)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(4500);
  const before = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     return {tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()),
             opts:[...d.querySelectorAll('[role=option]')].filter(vis).length,
             seeAll:[...d.querySelectorAll('button')].filter(vis)
               .map(b=>(b.innerText||'').trim()).filter(t=>/^See all/.test(t))}; })()`);
  out.before = before; reqs.length=0;
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^See all in Messages$/.test((x.innerText||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.seeAllFound = !!t;
  if(t){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(400);
    out.pointerOn = await page.evaluate(`(() => { const e=document.elementFromPoint(${t.cx},${t.cy});
       return e?(e.innerText||'').trim().slice(0,26):null; })()`);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(5000);
    out.after = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       if(!d) return {dialogGone:true, url:location.pathname+location.search};
       return {tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()),
               opts:[...d.querySelectorAll('[role=option]')].filter(vis).length,
               selectedTab:[...d.querySelectorAll('[role=tab]')].filter(vis)
                 .filter(e=>e.getAttribute('aria-selected')==='true').map(e=>(e.innerText||'').trim()),
               url:location.pathname+location.search}; })()`);
    out.requestsAfterClick = reqs.slice(0,3);
  }
  return out;
};
