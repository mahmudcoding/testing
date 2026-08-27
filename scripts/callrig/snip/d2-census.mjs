const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const who = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const routes = await page.evaluate(`(() => { const vis=(${VIS});
    return [...new Set([...document.querySelectorAll('a[href*="/settings/"]')].filter(vis).map(a=>a.getAttribute('href')))]; })()`);
  const census={};
  for (const href of routes) {
    await page.goto('https://airion-cargo.store'+href, { waitUntil:'networkidle' });
    await page.waitForTimeout(1900);
    census[href.split('/settings/')[1]] = await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      return [...main.querySelectorAll('button,input,select,textarea,[role=switch],[role=combobox],[role=radio],a[href]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
        .map(e=>{ const lab=((e.innerText||'').replace(/\\s+/g,' ').trim()||e.getAttribute('aria-label')||e.getAttribute('placeholder')||('<'+e.tagName.toLowerCase()+(e.getAttribute('type')?' '+e.getAttribute('type'):'')+'>'));
          return lab.slice(0,38)+(e.disabled===true||e.getAttribute('aria-disabled')==='true'?' [off]':''); }); })()`);
  }
  return { who, routes:routes.length, census };
};
