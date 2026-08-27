const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,40)} <- ${(r.request().postData()||'').slice(0,80)} -> ${r.status()} ${b}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`,{waitUntil:'networkidle'}); await page.waitForTimeout(2700); };
  const stat=()=>page.evaluate(async()=>(await (await fetch('/api/v1/users/U4QDALICE000001/status',{credentials:'include'})).text()).slice(0,110));
  const save=async()=>{ const had=await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
      if(!b.length) return false; b[0].click(); return true; })()`); await page.waitForTimeout(2600); return had; };
  // 1. set a status through the UI
  await load();
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis).filter(x=>/Sick/i.test(x.innerText||''));
    if(r.length===1) r[0].click(); })()`);
  await page.waitForTimeout(900);
  const savedSet = await save();
  const afterSet = await stat();
  net.length=0;
  // 2. now try to clear it the way a user would: empty the status text field
  await load();
  const cleared = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input')].filter(vis);
    const target=ins[ins.length-1];
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    const was=target.value;
    setter.call(target,''); target.dispatchEvent(new Event('input',{bubbles:true}));
    target.dispatchEvent(new Event('change',{bubbles:true}));
    return { was, now:target.value }; })()`);
  await page.waitForTimeout(1200);
  const barState = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  const savedClear = await save();
  const notices = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,4); })()`);
  const afterClear = await stat();
  await load();
  const finalUI = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input')].filter(vis);
    return { lastInput:ins[ins.length-1].value,
             radiosOn:[...main.querySelectorAll('[role=radio]')].filter(vis)
               .filter(r=>r.getAttribute('aria-checked')==='true').map(r=>(r.innerText||'').replace(/\\s+/g,' ').trim()) }; })()`);
  return { savedSet, afterSet, clearedField:cleared, barAfterClear:barState, savedClear,
           notices, afterClear, finalUI, net };
};
