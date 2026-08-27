export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3800);
  const sw = await page.$('main button:has-text("Switch company")');
  out.switchFound = !!sw;
  if (sw) { await sw.click().catch(()=>{}); await page.waitForTimeout(1800); }
  out.menuItems = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=menuitem],[role=option],button,a')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' '))
      .filter(t=>/create a company|create company/i.test(t)).slice(0,3);
  });
  const create = await page.$('[role=menuitem]:has-text("Create a company"), button:has-text("Create a company"), a:has-text("Create a company")');
  out.createFound = !!create;
  if (create) { await create.click().catch(()=>{}); await page.waitForTimeout(4000); }
  out.url = page.url().replace('https://airion-cargo.store','');
  out.exits = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const inter=[...document.querySelectorAll('button,a,[role=button],[role=link]')].filter(vis)
      .map(e=>({l:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,34),
                href:e.getAttribute('href')||''}));
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { total:inter.length, items:inter.slice(0,12),
      exitLike: inter.filter(x=>/back|cancel|close|skip|sign out|logout|назад/i.test(x.l)),
      textHead: t.slice(0,160) };
  });
  return out;
};
