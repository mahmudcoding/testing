// Clean boundary probe: NO page.goto until the very end. Only in-app clicks.
export default async ({page}) => {
  await page.waitForTimeout(45000);
  const VIS = `(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;
  const ROWS = `(()=>{const vis=${VIS};
    return [...document.querySelectorAll('nav a[aria-label],nav button[aria-label],aside a[aria-label],aside button[aria-label]')]
      .filter(e=>vis(e)&&/qa-/.test(e.getAttribute('aria-label')||''))
      .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40)}));})()`;
  const out={};
  out.recorded = await page.evaluate(()=>{ clearInterval(window.__urIv);
    const r=window.__ur||[]; const key=s=>JSON.stringify(s.rows);
    const ch=[]; let prev=null; for(const s of r){const k=key(s); if(k!==prev){ch.push({t:s.t, rows:s.rows}); prev=k;}}
    return {samples:r.length, spanMs:r.length?r[r.length-1].t:0, sidebarChanges:ch,
      anyUnreadEver:r.some(s=>s.rows.some(x=>/unread/i.test(x.al))), allVisible:r.every(s=>s.vis==='visible')};});
  out.navEntryBefore = await page.evaluate(()=>performance.getEntriesByType('navigation').length);

  // (a) click the row of the channel already open — pure client-side, must not mark qa-general read
  await page.locator('a[aria-label="qa-private"],button[aria-label="qa-private"]').first().click().catch(e=>out.clickErrA=String(e).slice(0,80));
  await page.waitForTimeout(3000);
  out.afterClickOwnRow = await page.evaluate(ROWS);

  // (b) in-app navigation by clicking a left-rail link (Files / Calls) — still no reload
  const rail = page.locator('a[href*="/files"],a[href*="/calls"],a[aria-label="Files"],a[aria-label="Calls"]').first();
  out.railFound = await rail.count();
  if(out.railFound){ await rail.click().catch(e=>out.clickErrB=String(e).slice(0,80)); await page.waitForTimeout(5000); }
  out.afterInAppNav = {url:page.url().replace(/^https:\/\/[^/]+/,''), rows: await page.evaluate(ROWS)};
  out.navEntryAfter = await page.evaluate(()=>performance.getEntriesByType('navigation').length);
  out.sameDocument = out.navEntryBefore===out.navEntryAfter;
  return out;
};
