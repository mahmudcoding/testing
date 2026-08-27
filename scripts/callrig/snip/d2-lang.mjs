const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const LANG = process.env.D2_LANG || 'ru';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1800);
  const set = await page.evaluate(`(async () => {
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const s=cur.settings||{};
    const r=await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...s, language:${JSON.stringify(LANG)}})});
    const back=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { put:r.status, language:(back.settings||{}).language }; })()`);
  if (process.env.D2_ONLYSET) return set;
  // discover the settings routes from the nav itself
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const routes = await page.evaluate(`(() => { const vis=(${VIS});
    return [...new Set([...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>a.getAttribute('href')))]; })()`);
  const pages=[];
  for (const href of routes) {
    await page.goto('https://airion-cargo.store'+href, { waitUntil:'networkidle' });
    await page.waitForTimeout(2100);
    const d = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const strings=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      const ctl=[...main.querySelectorAll('button,[role=switch],[role=combobox],input,a[href]')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').slice(0,50))
        .filter(Boolean);
      return { strings:[...new Set(strings)], controls:[...new Set(ctl)] }; })()`);
    pages.push({ href, ...d });
  }
  return { set, routeCount:routes.length, pages };
};
