import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,130)); });
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  await page.keyboard.type(':in #qa-private unread'); await page.waitForTimeout(5200);
  out.withFilter = {req:reqs[reqs.length-1]||'(none)',
    ...(await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       return {rows:[...d.querySelectorAll('[role=option]')].filter(vis).length,
               chip:[...d.querySelectorAll('button')].filter(vis)
                 .map(b=>b.getAttribute('aria-label')||'').filter(a=>/Remove .* filter/.test(a))[0]||null}; })()`))};
  // click the chip's remove control
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Remove .* filter/.test(x.getAttribute('aria-label')||''));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.removeFound = !!t;
  if(t){ reqs.length=0;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(4500);
    out.afterRemove = {req:reqs[reqs.length-1]||'(none)',
      ...(await page.evaluate(`(() => { ${VISFN}
         const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
         if(!d) return {dialogGone:true};
         const inp=d.querySelector('input[type=text],input[type=search]');
         return {rows:[...d.querySelectorAll('[role=option]')].filter(vis).length,
                 chips:[...d.querySelectorAll('button')].filter(vis)
                   .map(b=>b.getAttribute('aria-label')||'').filter(a=>/Remove .* filter/.test(a)),
                 inputValue: inp?String(inp.value).slice(0,40):null}; })()`))}; }
  await page.keyboard.press('Escape');
  return out;
};
