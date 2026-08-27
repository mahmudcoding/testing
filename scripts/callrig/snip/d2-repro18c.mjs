export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const sw = await page.$('button[aria-label="Switch company"]');
  if (sw) { await sw.click().catch(()=>{}); await page.waitForTimeout(2000); }
  // click by exact visible label, whatever the tag
  const clicked = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .find(e=>((e.getAttribute('aria-label')||e.innerText||'').trim())==='Create a company');
    if(!el) return false; el.click(); return true;
  });
  out.clicked = clicked;
  await page.waitForTimeout(5000);
  out.url = page.url().replace('https://airion-cargo.store','');
  out.page = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const inter=[...document.querySelectorAll('button,a,[role=button],[role=link]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)).filter(Boolean);
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { controlCount:inter.length, controls:inter.slice(0,14),
      exitLike: inter.filter(x=>/back|cancel|close|sign out|log out|skip to/i.test(x)),
      head:t.slice(0,200) };
  });
  return out;
};
