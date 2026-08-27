export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  // verify the grant is live for this session
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1000);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  for (const scope of ['workspace','company']) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    out[scope] = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main')||document.body;
      const all=(main.innerText||'').replace(/\s+/g,' ');
      const i=all.indexOf('Company roles Workspace roles');
      const c=(i>=0?all.slice(i):all);
      return { refusal:/cannot view|do not have permission|access required/i.test(c),
        body:c.slice(0,220),
        buttons:[...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,14),
        rows:[...main.querySelectorAll('[role=row],tbody tr')].filter(vis).length };
    });
  }
  out.navHasRoles = await page.evaluate(()=>!!document.querySelector('a[href*="roles?scope"]'));
  return out;
};
