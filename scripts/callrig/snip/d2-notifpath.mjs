const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/notifications\/settings/.test(u)) return;
    let b=''; try{b=r.request().postData()||'';}catch{}
    net.push(`<- ${b} -> ${r.status()}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`,{waitUntil:'networkidle'}); await page.waitForTimeout(2400); };
  await load();
  // full inventory of the screen: every visible control + all page prose
  const inv = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const ctl=[...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a[href]')]
      .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>({tag:e.tagName.toLowerCase(),role:e.getAttribute('role')||'',
                t:(e.innerText||'').trim().slice(0,40), st:e.getAttribute('aria-checked')||''}));
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const i=t.lastIndexOf('›');
    return { controls:ctl, prose:(i>=0?t.slice(i+1):t).trim().slice(0,700) }; })()`);
  // now: enable "Mute channel notifications" (switch 1), save; then turn OFF in-app, save
  const step = async (idx, label) => {
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      l[${idx}].click(); })()`);
    await page.waitForTimeout(900);
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2600);
    const s = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
      const n=[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')]
        .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      return { sw:l.map(e=>e.getAttribute('aria-checked')), notices:n }; })()`);
    return { label, ...s };
  };
  const s1 = await step(1, 'turn ON Mute channel notifications');
  await load();
  const s2 = await step(0, 'now turn OFF In-app notifications');
  await load();
  const final = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    return l.map(e=>e.getAttribute('aria-checked')); })()`);
  // restore defaults
  const restore = await page.evaluate(async () => {
    const r=await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({in_app_enabled:true, mute_all_channels:false, mute_unknown_dm_users:false})});
    return { status:r.status, body:(await r.text()).slice(0,150) }; });
  return { inv, s1, s2, afterReload:final, restore, net };
};
