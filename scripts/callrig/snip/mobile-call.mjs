export default async ({page}) => {
  // join the active call
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const jb = page.locator('main button', {hasText:/^Join$/}).first();
  if (await jb.count()) { await jb.click(); await page.waitForTimeout(4000); }
  const pj = await page.$$('button');
  for (const b of pj) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Join$/i.test(t)) { await b.click(); break; } }
  await page.waitForTimeout(8000);
  const desktop = await page.evaluate(()=>({w:innerWidth,h:innerHeight, inCall: !!document.querySelector('[data-testid="call-toolbar"]')}));
  await page.setViewportSize({width:390, height:844});
  await page.waitForTimeout(3500);
  const mobile = await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight;
    const surface = document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const btns = [...surface.querySelectorAll('button')].map(b=>{
      const r=b.getBoundingClientRect();
      return {l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30),
              x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height),
              offRight: r.left >= vw, offBottom: r.top >= vh, tiny: r.width>0 && (r.width<24||r.height<24),
              hidden: r.width===0&&r.height===0};
    });
    const clipped = [...surface.querySelectorAll('*')].filter(e=>e.children.length===0 && e.scrollWidth > e.clientWidth+1 && e.clientWidth>0)
      .map(e=>({t:e.textContent.trim().slice(0,40), sw:e.scrollWidth, cw:e.clientWidth}));
    return {vw, vh, docScrollW: document.documentElement.scrollWidth,
      offRight: btns.filter(b=>b.offRight), offBottom: btns.filter(b=>b.offBottom),
      tiny: btns.filter(b=>b.tiny).slice(0,8), visibleButtons: btns.filter(b=>!b.hidden).length,
      clipped: clipped.slice(0,8),
      toolbarLabels: [...(document.querySelector('[data-testid="call-toolbar"]')||surface).querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,22)).filter(Boolean)};
  });
  return {desktop, mobile};
};
