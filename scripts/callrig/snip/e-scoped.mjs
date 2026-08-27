export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const meas = () => page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]'); if(!d) return null;
    // tabs
    const tabs=[...d.querySelectorAll('button,[role=tab]')].filter(vis)
      .filter(b=>/^(All|Messages|Channels|People|Files)\b/.test(b.innerText.trim()))
      .map(b=>b.innerText.replace(/\n/g,'=').trim());
    // section headings + how many result rows follow each
    const heads=[...d.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0 &&
      /^(MESSAGES|CHANNELS|PEOPLE|FILES)$/.test(e.textContent.trim()));
    const rows=[...d.querySelectorAll('button')].filter(vis).filter(b=>/^Open (message|channel|profile)|Open channel with file/.test((b.getAttribute('aria-label')||b.innerText).trim()));
    return {tabs, headings:heads.map(h=>h.textContent.trim()), resultRows:rows.length,
      scopeChip:[...d.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0&&/^in #/.test(e.textContent.trim())).map(e=>e.textContent.trim())[0]||null};
  });
  const out={};
  // A) scoped
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search in channel"]').first().click();
  await page.waitForTimeout(2000);
  let inp = page.locator('[role=dialog] input').first();
  await inp.fill('probe'); await page.waitForTimeout(2800);
  out.scoped = await meas();
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // B) unscoped
  await page.locator('button[aria-label^="Search QA"]').first().click();
  await page.waitForTimeout(2000);
  inp = page.locator('[role=dialog] input').first();
  await inp.fill('probe'); await page.waitForTimeout(2800);
  out.unscoped = await meas();
  return out;
};
