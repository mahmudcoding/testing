const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    net.push(`${r.request().method()} ${u.slice(0,44)} -> ${r.status()}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const state1 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { on:/Two-factor authentication is on/i.test(t), off:/Two-factor authentication is off/i.test(t),
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>(e.innerText||'').trim()) }; })()`);
  // if a pending flow is showing, cancel it
  const cancelled = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>/^Cancel$/.test((e.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2600);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const state2 = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { on:/Two-factor authentication is on/i.test(t), off:/Two-factor authentication is off/i.test(t),
      buttons:[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>(e.innerText||'').trim()),
      hasCodeField:[...main.querySelectorAll('input')].filter(vis).some(e=>e.getAttribute('placeholder')==='123456') }; })()`);
  return { beforeCancel:state1, cancelled, afterReload:state2, net };
};
