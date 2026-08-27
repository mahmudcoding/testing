export default async ({page}) => {
  const id = process.env.QA_CH, mid = process.env.QA_MID;
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const sel = 'div[contenteditable="true"][aria-label="Compose message"]';
  const before = await page.evaluate((s)=>{const e=document.querySelector(s);return e?(e.innerText||''):null;}, sel);
  // enter edit mode
  const art = await page.$(`[data-message-id="${mid}"]`);
  await art.hover(); await page.waitForTimeout(2000);
  const moreH = await page.evaluateHandle((mid) => {
    const a = document.querySelector(`[data-message-id="${mid}"]`);
    return [...a.querySelectorAll('button')].find(b => /more/i.test(b.getAttribute('aria-label')||'')) || null;
  }, mid);
  await moreH.asElement().click(); await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('[role=menuitem]')].find(b => /^edit/i.test((b.innerText||'').trim()));
    el && el.click();
  });
  await page.waitForTimeout(1800);
  return await page.evaluate((sel) => {
    const ed = document.querySelector(sel);
    const r = ed.getBoundingClientRect();
    // the composer region: walk up a few levels and list its buttons + text
    let box = ed; for (let i=0;i<5 && box.parentElement;i++) box = box.parentElement;
    const btns = [...box.querySelectorAll('button')].filter(b=>{const q=b.getBoundingClientRect();return q.width>0&&q.height>0;})
      .map(b => (b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    return {
      composerText: (ed.innerText||'').slice(0,120),
      composerFocused: document.activeElement === ed,
      activeEl: document.activeElement ? document.activeElement.tagName+'/'+(document.activeElement.getAttribute('aria-label')||document.activeElement.className||'').toString().slice(0,40) : null,
      regionText: (box.innerText||'').replace(/\s+/g,' ').slice(0,220),
      regionButtons: [...new Set(btns)],
      editBannerPresent: /editing|edit message/i.test(box.innerText||'')
    };
  }, sel);
};
