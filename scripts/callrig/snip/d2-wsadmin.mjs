const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,54)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const all = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return { text:(main.innerText||'').replace(/\\s+/g,' ').slice(0,500),
      controls:[...main.querySelectorAll('button,a[href]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({t:(e.innerText||'').trim().slice(0,40), al:(e.getAttribute('aria-label')||'').slice(0,44),
                  y:Math.round(e.getBoundingClientRect().top), dis:e.disabled===true})) }; })()`);
  net.length=0;
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Show storage$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(3200);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    return { text:(main.innerText||'').replace(/\\s+/g,' ').slice(0,520),
      controls:[...main.querySelectorAll('button,a[href]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>(e.innerText||'').trim().slice(0,36)).filter(Boolean) }; })()`);
  return { before:all, clickedShowStorage:clicked, after, net:net.slice(0,6) };
};
