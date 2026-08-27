export default async ({page}) => {
  await page.waitForTimeout(50000);                 // let the recorder keep running
  const VIS = `(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;
  const ROWS = `(()=>{const vis=${VIS};
    return [...document.querySelectorAll('nav a[aria-label],nav button[aria-label],aside a[aria-label],aside button[aria-label]')]
      .filter(e=>vis(e)&&/qa-/.test(e.getAttribute('aria-label')||''))
      .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40)}));})()`;

  const rec = await page.evaluate(()=>{ clearInterval(window.__urIv);
    const r=window.__ur||[]; const key=s=>JSON.stringify(s.rows);
    const changes=[]; let prev=null;
    for(const s of r){ const k=key(s); if(k!==prev){changes.push({t:s.t, rows:s.rows}); prev=k;} }
    return {samples:r.length, spanMs:r.length?r[r.length-1].t:0, sidebarChanges:changes,
      anyUnreadLabelEverSeen:r.some(s=>s.rows.some(x=>/unread/i.test(x.al)||/\b\d+\b/.test(x.t))),
      allVisible:r.every(s=>s.vis==='visible')};
  });

  // boundary probe: client-side route change, NO reload
  const out={recorded:rec};
  await page.locator('nav a[aria-label="qa-private"],aside a[aria-label="qa-private"],nav button[aria-label="qa-private"]').first().click().catch(()=>{});
  await page.waitForTimeout(2500);
  await page.goto(page.url().replace(/\/c\/.*$/,'/files'), {waitUntil:'commit'}).catch(()=>{});
  await page.waitForTimeout(1000);
  out.afterSidebarClickSameChannel = await page.evaluate(ROWS);

  // in-app navigation to another section by clicking, then back — still no reload
  const filesLink = page.locator('nav a[href*="/files"],aside a[href*="/files"]').first();
  if(await filesLink.count()){ await filesLink.click().catch(()=>{}); await page.waitForTimeout(4000); }
  out.afterInAppNavToFiles = {url:page.url().replace(/^https:\/\/[^/]+/,''), rows: await page.evaluate(ROWS)};

  // finally a real reload
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCPRIVATE0001`, {waitUntil:'load'});
  await page.waitForTimeout(6000);
  out.afterReload = await page.evaluate(ROWS);
  return out;
};
