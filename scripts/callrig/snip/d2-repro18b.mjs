export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const sw = await page.$('button[aria-label="Switch company"]');
  out.switchFound = !!sw;
  if (sw) { await sw.click().catch(()=>{}); await page.waitForTimeout(2000); }
  out.menu = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=menuitem],[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40));
  });
  const create = await page.$('[role=menuitem]:has-text("Create"), [role=option]:has-text("Create")');
  out.createFound = !!create;
  if (create) { await create.click().catch(()=>{}); await page.waitForTimeout(4500); }
  out.url = page.url().replace('https://airion-cargo.store','');
  out.onPage = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const inter=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)).filter(Boolean);
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { controls:inter, exitLike:inter.filter(x=>/back|cancel|close|skip to|sign out|log out/i.test(x)),
      head:t.slice(0,150) };
  });
  return out;
};
