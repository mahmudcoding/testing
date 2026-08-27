export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const all=[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' '));
    return { createLike: all.filter(x=>/create.*channel|new channel|add channel|browse channel/i.test(x)),
      channelsVisible: [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).length,
      totalControls: all.length };
  });
};
