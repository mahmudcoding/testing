export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QDGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btn = await page.$('button[aria-label="Open workspace menu"]');
  if (btn) { await btn.click().catch(()=>{}); await page.waitForTimeout(1800); }
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const el=[...document.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
      .find(e=>((e.getAttribute('aria-label')||e.innerText||'').trim())==="Switch to QA Alice's workspace");
    if(!el) return false; el.click(); return true;
  });
  out.clicked = clicked;
  await page.waitForTimeout(5500);
  out.landed = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { url: location.pathname.slice(0,44),
      head: t.slice(0,220),
      channels: [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).length,
      controls: [...document.querySelectorAll('button')].filter(vis).length,
      errorish: /error|went wrong|not found|403|404|denied/i.test(t) };
  });
  out.console = [];
  return out;
};
