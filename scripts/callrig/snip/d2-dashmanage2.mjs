const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  // find the settings nav's right edge, then take only content to the right of it
  const grab = () => page.evaluate(`(() => { const vis=(${VIS});
    const links=[...document.querySelectorAll('a[href*="/settings/"]')].filter(vis);
    // the settings sidebar is the densest cluster of settings links; use its max right edge
    const xs=links.map(a=>a.getBoundingClientRect().right).sort((a,b)=>a-b);
    const navRight = xs.length ? xs[Math.floor(xs.length*0.6)] : 0;
    const main=document.querySelector('main')||document.body;
    const items=[...main.querySelectorAll('button,a,input,select,textarea,[role=switch],[role=combobox],[role=tab]')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left > navRight + 10)
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                 label:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('placeholder')||'').trim().replace(/\\s+/g,' ').slice(0,40),
                 href:(e.getAttribute('href')||'').slice(0,52),
                 dis:e.disabled===true||e.getAttribute('aria-disabled')==='true',
                 x:Math.round(e.getBoundingClientRect().left) }));
    return { navRight: Math.round(navRight), controls: items }; })()`);
  const out={ overview: await grab() };
  const manage = page.locator('button:has-text("Manage"), [role=tab]:has-text("Manage")').first();
  if (await manage.count()) { await manage.scrollIntoViewIfNeeded(); await manage.click(); await page.waitForTimeout(3000);
    out.manage = await grab(); }
  return out;
};
