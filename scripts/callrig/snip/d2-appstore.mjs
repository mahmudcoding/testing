const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const where = await page.evaluate(async () => {
    const ls={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i);
      const v=localStorage.getItem(k)||''; ls[k]=v.slice(0,160); }
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { lsKeys:Object.keys(ls), ls, serverSettingsKeys:Object.keys(me.settings||{}),
             serverAppearance:(me.settings||{}).appearance ?? '(no appearance key on server)' };
  });
  return where;
};
