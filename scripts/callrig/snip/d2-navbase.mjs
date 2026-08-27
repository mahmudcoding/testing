export default async ({ page }) => {
  const WS = 'W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2800);
  const me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const b=await r.json();return b.email;});
  const nav = await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return [...document.querySelectorAll('a[href*="/settings/"]')].filter(vis)
      .map(a=>({t:(a.innerText||'').trim().replace(/\s+/g,' ').slice(0,34), h:a.getAttribute('href').split('/settings/')[1]}))
      .filter(x=>x.t);
  });
  // probe the admin URLs directly
  const probes = {};
  for (const p of ['admin/members','admin/company-roles','admin/audit-log','admin/invites','admin/workspaces','roles?scope=workspace']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${p}`, {waitUntil:'domcontentloaded'}).catch(()=>{});
    await page.waitForTimeout(1800);
    probes[p] = await page.evaluate(() => {
      const t = document.body.innerText.replace(/\s+/g,' ');
      const denied = /don.?t have (access|permission)|no access|not authoriz|Access denied|403/i.test(t);
      return { url: location.pathname + location.search, denied, head: t.slice(0,90) };
    });
  }
  return { me, navCount: nav.length, nav, probes };
};
