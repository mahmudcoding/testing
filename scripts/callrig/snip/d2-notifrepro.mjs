const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const m=r.request().method(); if(m==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/notifications\/settings/.test(u)) return;
    let body=''; try{ body=r.request().postData()||''; }catch{}
    let resp=''; try{ resp=(await r.text()).slice(0,210); }catch{}
    net.push(`PATCH <- ${body} -> ${r.status()} ${resp}`); });
  // force the documented default state first
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  const reset = await page.evaluate(async () => {
    const r=await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({in_app_enabled:true, mute_all_channels:false, mute_unknown_dm_users:false})});
    return { status:r.status, body:(await r.text()).slice(0,180) }; });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  net.length=0;
  const timeline=[];
  const snap = async tag => { try { const s = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      const notices=[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[aria-live],[class*=oast],[class*=lert]')]
        .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      const bar=[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t));
      return { sw:l.map(e=>e.getAttribute('aria-checked')), notices, bar }; })()`);
      timeline.push({ tag, ...s }); } catch(e){ timeline.push({tag, err:String(e).slice(0,50)}); } };
  const poll = setInterval(()=>snap('poll'), 300);
  await snap('t0-before-any-click');
  await page.waitForTimeout(500);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    l[0].click(); })()`);
  await page.waitForTimeout(1200);
  await snap('t1-after-toggle');
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(4000);
  clearInterval(poll);
  await snap('t2-after-save');
  const noticesEver=[...new Set(timeline.flatMap(t=>t.notices||[]))];
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  await snap('t3-after-reload');
  return { reset, network:net,
    t0:timeline.find(t=>t.tag==='t0-before-any-click'),
    t1:timeline.find(t=>t.tag==='t1-after-toggle'),
    t2:timeline.find(t=>t.tag==='t2-after-save'),
    t3:timeline.find(t=>t.tag==='t3-after-reload'),
    noticesEver, samples:timeline.length };
};
