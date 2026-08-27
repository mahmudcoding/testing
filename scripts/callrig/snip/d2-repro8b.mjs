export default async ({ page }) => {
  const WS='W4QDF1XTURESO01', IDX=2; const out={};
  const stored=()=>page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('aloqa.appearance')||'{}');}catch{return{};}});
  const st=()=>page.evaluate((i)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const s=[...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis)[i];
    return s? s.getAttribute('aria-checked') : null;
  }, IDX);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.uiBefore = await st(); out.storedBefore = (await stored()).showRoles;
  const els = await page.$$('main [role=switch]');
  await els[IDX].click().catch(()=>{});
  await page.waitForTimeout(2200);
  out.uiAfterClick = await st(); out.storedAfterClick = (await stored()).showRoles;
  out.saveBar = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
      .filter(b=>/^(Save|Discard)/i.test((b.innerText||'').trim())).map(b=>b.innerText.trim());
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4800);
  out.uiAfterReload = await st(); out.storedAfterReload = (await stored()).showRoles;
  return out;
};
