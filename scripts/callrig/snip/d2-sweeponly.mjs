const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const routes = await page.evaluate(`(() => { const vis=(${VIS});
    return [...new Set([...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>a.getAttribute('href')))]; })()`);
  const pages=[];
  for (const href of routes) {
    await page.goto('https://airion-cargo.store'+href, { waitUntil:'networkidle' });
    await page.waitForTimeout(2000);
    const d = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const strings=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      return { strings:[...new Set(strings)] }; })()`);
    pages.push({ href, ...d });
  }
  const lang = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return (me.settings||{}).language; });
  return { lang, routeCount:routes.length, pages };
};
