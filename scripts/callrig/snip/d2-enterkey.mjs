const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    net.push(`${r.request().method()} ${u.slice(0,36)} -> ${r.status()}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  // find the Phone field (first contact input) and type a valid value, then press Enter
  const focused = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300);
    if(!ins.length) return {err:'no field'};
    ins[0].focus(); return { ph:ins[0].getAttribute('placeholder')||'', was:ins[0].value }; })()`);
  if (focused.err) return focused;
  await page.keyboard.type('+998901234567', { delay: 25 });
  await page.waitForTimeout(900);
  const beforeEnter = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  net.length=0;
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  const afterEnter = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    return { bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)),
      fieldValue: ins.length?ins[0].value:null,
      notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3) }; })()`);
  const stored = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return (me.settings||{}).contacts; });
  // clean up whatever happened
  const cleanup = await page.evaluate(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...s, contacts:{phone:'',github:'',website:'',linkedin:''}})});
    return r.status; });
  return { focused, beforeEnter, requestsOnEnter:net, afterEnter, storedAfterEnter:stored, cleanup };
};
