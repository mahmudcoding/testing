const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/company', { waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const out={};
  const grab = async tag => page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const navH=new Set([...document.querySelectorAll('a[href*="/settings/"]')].map(a=>a.getAttribute('href')));
    const items=[...main.querySelectorAll('button,a,input,select,textarea,[role=switch],[role=combobox],[role=tab]')].filter(vis)
      .filter(e=>!(e.tagName==='A'&&navH.has(e.getAttribute('href'))))
      .filter(e=>(e.getAttribute('placeholder')||'')!=='Filter settings')
      .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                 label:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,40),
                 dis:e.disabled===true||e.getAttribute('aria-disabled')==='true',
                 sel:e.getAttribute('aria-selected') }));
    const t=(main.innerText||''); const i=t.lastIndexOf('\\u203a');
    return { content:(i>=0?t.slice(i+1):t).replace(/\\n+/g,' | ').trim().slice(0,420), controls: items }; })()`);
  out.overview = await grab();
  const manage = page.locator('button:has-text("Manage"), [role=tab]:has-text("Manage")').first();
  out.manageTabFound = await manage.count();
  if (out.manageTabFound) { await manage.scrollIntoViewIfNeeded(); await manage.click(); await page.waitForTimeout(3000);
    out.manage = await grab(); }
  return out;
};
