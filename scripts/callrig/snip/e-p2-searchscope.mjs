import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,130)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  // typed :in filter with a channel the user IS in
  await page.keyboard.type(':in #qa-private probe'); await page.waitForTimeout(5000);
  out.inMemberChannel = {req:reqs[reqs.length-1]||'(none)'};
  out.chipsA = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     return [...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/Remove .* filter/.test(a)); })()`);
  // now a channel the user is NOT in
  await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  await page.keyboard.type(':in #qa-empty probe'); await page.waitForTimeout(5000);
  out.inNonMemberChannel = {req:reqs[reqs.length-1]||'(none)'};
  out.chipsB = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {chips:[...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/Remove .* filter/.test(a)),
       tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())}; })()`);
  await page.keyboard.press('Escape');
  return out;
};
