const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,40)} <- ${(r.request().postData()||'').slice(0,70)} -> ${r.status()} ${b}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`,{waitUntil:'networkidle'}); await page.waitForTimeout(2700); };
  const stat=()=>page.evaluate(async()=>(await (await fetch('/api/v1/users/U4QDALICE000001/status',{credentials:'include'})).text()).slice(0,110));
  await load();
  const start = await stat();
  // deselect whatever preset is on
  const desel = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis);
    const on=rs.filter(r=>r.getAttribute('aria-checked')==='true');
    if(on.length!==1) return {err:'selected='+on.length};
    const name=(on[0].innerText||'').replace(/\\s+/g,' ').trim(); on[0].click(); return {name}; })()`);
  await page.waitForTimeout(1200);
  const mid = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input')].filter(vis);
    return { selected:[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>r.getAttribute('aria-checked')==='true').length,
             statusField:ins[ins.length-1].value,
             bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(3000);
  const notices = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,4); })()`);
  const after = await stat();
  await load();
  const finalUI = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input')].filter(vis);
    return { selected:[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>r.getAttribute('aria-checked')==='true').length,
             statusField:ins[ins.length-1].value }; })()`);
  return { start, deselect:desel, afterDeselect:mid, saveRequests:net, notices, statusAfterSave:after, finalUI };
};
