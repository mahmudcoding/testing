import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const net=[];
  page.on('response', r=>{ if(r.status()>=400 && /\/api\/v1\//.test(r.url()))
    net.push(r.status()+' '+decodeURIComponent(r.url().split('/api/v1/')[1]).slice(0,60)); });
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(BASE+'/w/'+WS+'/c/C0000000000BOGUS', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  const out = await page.evaluate(`(() => { ${VISFN}
     // controls OUTSIDE main — the sidebar the empty state points at
     const m=document.querySelector('main');
     const all=[...document.querySelectorAll('a[href],button')].filter(vis)
       .filter(e=>!m || !m.contains(e))
       .map(e=>((e.innerText||'').trim().replace(/\\s+/g,' ')||e.getAttribute('aria-label')||'').slice(0,22))
       .filter(Boolean);
     const chan=all.filter(t=>/^(qa-|#)/.test(t));
     return {nOutsideMain:all.length, channelLinks:chan, sample:[...new Set(all)].slice(0,12)}; })()`);
  // click a channel link from the empty state and confirm recovery
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).filter(e=>!m||!m.contains(e))[0];
     if(!a) return null; const r=a.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), tx:(a.innerText||'').trim().slice(0,18)}; })()`);
  if(t){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(5000);
    out.afterClick = await page.evaluate(`(() => ({url:location.pathname,
       main:(document.querySelector('main').innerText||'').replace(/\\s+/g,' ').slice(0,70)}))()`); }
  out.apiErrors = [...new Set(net)].slice(0,4);
  return out;
};
