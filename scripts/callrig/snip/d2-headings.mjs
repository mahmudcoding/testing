const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const routes=['account','profile','notifications','appearance','privacy','security','sessions','about',
                'company','workspace','roles?scope=company','admin/company','admin/members','admin/audit-log'];
  const out=[];
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${r}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(1900);
    const h = await page.evaluate(`(() => { const vis=(${VIS});
      const hs=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(vis)
        .map(e=>({ lvl: e.getAttribute('aria-level') ? Number(e.getAttribute('aria-level'))
                     : Number((e.tagName.match(/H(\\d)/)||[0,0])[1]),
                   t:(e.innerText||'').trim().slice(0,34) }));
      const landmarks={ main:document.querySelectorAll('main,[role=main]').length,
                        nav:document.querySelectorAll('nav,[role=navigation]').length,
                        banner:document.querySelectorAll('header,[role=banner]').length };
      let skips=0;
      for(let i=1;i<hs.length;i++) if(hs[i].lvl > hs[i-1].lvl+1) skips++;
      return { count:hs.length, h1:hs.filter(x=>x.lvl===1).length, levels:hs.map(x=>x.lvl).join(''),
               skips, first:hs.slice(0,3), landmarks }; })()`);
    out.push({ route:r, ...h });
  }
  return out;
};
