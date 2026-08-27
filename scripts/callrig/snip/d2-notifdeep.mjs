const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const seen=[];
  page.on('response', async r => { const m=r.request().method(); if(m==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/notifications\/settings/.test(u)) return;
    let body=''; try{ body=r.request().postData()||''; }catch{}
    let resp=''; try{ resp=(await r.text()).slice(0,200); }catch{}
    seen.push({ req:body.slice(0,80), status:r.status(), resp }); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const current = await page.evaluate(async () => {
    const r=await fetch('/api/v1/notifications/settings',{credentials:'include'});
    return { status:r.status, body:(await r.text()).slice(0,400) }; });
  // poll for toasts from BEFORE the click
  const toasts=[];
  const poll = setInterval(async () => { try {
    const t = await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')]
        .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`);
    for (const x of t) if(!toasts.includes(x)) toasts.push(x);
  } catch {} }, 250);
  await page.waitForTimeout(700);
  const idx0 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    const before=l[0].getAttribute('aria-checked'); l[0].click(); return before; })()`);
  await page.waitForTimeout(1500);
  const afterClick = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    const bs=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()));
    if(bs.length) bs[0].click();
    return l[0].getAttribute('aria-checked'); })()`);
  await page.waitForTimeout(3000);
  clearInterval(poll);
  const stateNow = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    return { sw:l.map(e=>e.getAttribute('aria-checked')),
      pageText:(main.innerText||'').replace(/\\s+/g,' ').slice(0,300) }; })()`);
  // direct API variants
  const api = await page.evaluate(async () => {
    const call=async b=>{ const r=await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      return { sent:JSON.stringify(b), status:r.status, resp:(await r.text()).slice(0,180) }; };
    return [ await call({in_app_enabled:false}),
             await call({in_app_enabled:true}),
             await call({in_app_enabled:false, mute_all_channels:false}),
             await call({mute_all_channels:false}),
             await call({mute_unknown_dm_users:false}) ];
  });
  return { current, idx0Before:idx0, afterClick, stateNow, toasts, network:seen, apiVariants:api };
};
