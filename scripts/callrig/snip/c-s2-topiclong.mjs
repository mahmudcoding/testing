export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const open=async()=>{
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(5500);
    const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
    if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
    const about=page.locator('[role="tab"]').filter({hasText:'About'});
    if(await about.count()){ await about.first().click(); await page.waitForTimeout(1100); }
  };
  const measure=()=>page.evaluate(()=>{
    const h=document.querySelector('main header')||document.querySelector('header');
    const inner=window.innerWidth;
    const controls=[...document.querySelectorAll('header button')].filter(b=>{
      const r=b.getBoundingClientRect(); return r.width>2&&r.height>2;})
      .map(b=>{const r=b.getBoundingClientRect();
        return {label:b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,18),
          left:Math.round(r.left), right:Math.round(r.right), offscreen:r.left>=inner};});
    const leaves=[...(h?h.querySelectorAll('*'):[])].filter(e=>e.children.length===0)
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>24&&r.height>4;})
      .map(e=>{const cs=getComputedStyle(e);
        return {t:(e.textContent||'').trim().slice(0,24), sw:e.scrollWidth, cw:e.clientWidth,
          ov:cs.textOverflow, ws:cs.whiteSpace};});
    return {inner, docScrollW:document.documentElement.scrollWidth,
      bodyOverflowsX: document.documentElement.scrollWidth>inner,
      headerH: h? Math.round(h.getBoundingClientRect().height):null,
      offscreenControls: controls.filter(c=>c.offscreen),
      controls: controls.slice(0,8),
      clippedLeaves: leaves.filter(l=>l.sw>l.cw+1)};
  });
  await open();
  out.baseline=await measure();
  const long='QA-S2-TOPICLONG '+'Aloqa channel topic boundary probe. '.repeat(14);
  out.len=long.length;
  const ta=page.locator('textarea').first();
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await ta.fill(long); await page.waitForTimeout(400);
  out.taValueLen = await ta.evaluate(e=>e.value.length);
  out.maxlength = await ta.evaluate(e=>e.getAttribute('maxlength'));
  await page.locator('button').filter({hasText:'Save'}).first().click();
  await page.waitForTimeout(2500);
  out.afterSave=await measure();
  out.stored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {len:(j.description||'').length, head:(j.description||'').slice(0,40)};
  }, ch);
  // restore
  await open();
  const ta2=page.locator('textarea').first();
  await ta2.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.locator('button').filter({hasText:'Save'}).first().click();
  await page.waitForTimeout(2000);
  out.restored = await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {desc:j.description};
  }, ch);
  return out;
};
