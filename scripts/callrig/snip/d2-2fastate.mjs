const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  return await page.evaluate(`(async () => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { who: me.email.split('@')[0],
             screenSays:(t.match(/Two-factor authentication[^.]*\\./)||[])[0]||null,
             buttons:[...main.querySelectorAll('button')].filter(vis)
               .map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean),
             pendingCodeField: [...main.querySelectorAll('input')].filter(vis)
               .some(i=>/123456/.test(i.placeholder||'')) }; })()`);
};
