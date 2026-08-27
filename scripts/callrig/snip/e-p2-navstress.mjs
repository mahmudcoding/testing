import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const routes=['/directories','/calendar','/files','/c/C4QEGENERAL0001','/c/C4QEPRIVATE0001',
                '/chat/saved','/chat/mentions','/settings/appearance','/directories?tab=channels','/calendar'];
  const errs=[]; const bad=[];
  page.on('pageerror', e=>errs.push((e.message||'').slice(0,90)));
  page.on('console', m=>{ if(m.type()==='error') errs.push('console: '+(m.text()||'').slice(0,80)); });
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\//.test(u)&&r.status()>=400 && !/files\/.*\/content/.test(u))
    bad.push(r.status()+' '+u.replace(/https?:\/\/[^/]+/,'').slice(0,60)); });
  await page.goto(`${BASE}/w/${WS}${routes[0]}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  // rapid client-side navigation: 20 hops, only 400 ms apart
  for (let i=0;i<20;i++){
    const r=routes[i%routes.length];
    await page.evaluate((u)=>{ history.pushState({}, '', u); window.dispatchEvent(new PopStateEvent('popstate')); }, `/w/${WS}${r}`).catch(()=>{});
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'commit'});
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(6000);
  const health = await page.evaluate(()=>{
    const d=document.documentElement;
    return {url:location.pathname, hasMain:!!document.querySelector('main'),
      bodyText:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,70),
      hScroll:d.scrollWidth-d.clientWidth,
      sidebarLinks:[...document.querySelectorAll('aside a, nav a')].length,
      heapMB: performance.memory? Math.round(performance.memory.usedJSHeapSize/1048576) : null};
  });
  return {hops:20, pageErrors:[...new Set(errs)].slice(0,5), pageErrorCount:errs.length,
    badApi:[...new Set(bad)].slice(0,5), badApiCount:bad.length, health};
};
