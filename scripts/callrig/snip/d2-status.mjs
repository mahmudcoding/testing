const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,44)} <- ${(r.request().postData()||'').slice(0,80)} -> ${r.status()} ${b}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };
  await load();
  const presets = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=radio]')].filter(vis)
      .map((e,i)=>({i, t:(e.innerText||'').trim().slice(0,28), on:e.getAttribute('aria-checked')})); })()`);
  const target = presets.find(p=>/Vacation/i.test(p.t));
  if (!target) return { err:'no Vacation preset', presets };
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis); r[${target.i}].click(); })()`);
  await page.waitForTimeout(1200);
  const afterClick = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis);
    const bar=[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t));
    return { on:r[${target.i}].getAttribute('aria-checked'), bar,
             fields:[...main.querySelectorAll('input')].filter(vis).map(e=>e.value).filter(Boolean).slice(0,4) }; })()`);
  if (afterClick.bar.some(t=>/^Save/.test(t))) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2500);
  }
  const sent=[...net];
  await load();
  const afterReload = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis);
    return { on:r[${target.i}].getAttribute('aria-checked'),
             allOn:r.map(x=>x.getAttribute('aria-checked')).filter(v=>v==='true').length }; })()`);
  const api = await page.evaluate(async () => {
    const r=await fetch('/api/v1/users/U4QDALICE000001/status',{credentials:'include'});
    return { s:r.status, b:(await r.text()).slice(0,180) }; });
  return { presetLabels:presets.map(p=>p.t), target:target.t, afterClick, requests:sent, afterReload, apiStatus:api };
};
