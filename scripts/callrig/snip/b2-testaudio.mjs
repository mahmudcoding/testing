export default async ({ page }) => {
  const ws='W4QBF1XTURESO01', id=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const read = () => page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const els = [...document.querySelectorAll('button,span,div')].filter(v)
      .filter(e=>/Test audio|Playing/i.test(e.innerText||'') && (e.innerText||'').length < 30);
    const min = els.filter(e=>!els.some(o=>o!==e && e.contains(o)));
    return min.map(e=>({ tag:e.tagName, text:e.innerText.trim(),
                         isButton: e.tagName==='BUTTON' || !!e.closest('button'),
                         disabled: e.tagName==='BUTTON' ? e.disabled : null }));
  });
  const before = await read();
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/Test audio/i.test(x.innerText||''));
    if (b) b.click(); });
  const samples = [];
  for (const ms of [700, 1500, 3000, 6000, 10000]) {
    await page.waitForTimeout(ms === 700 ? 700 : 0);
    if (ms !== 700) await page.waitForTimeout(ms - samples[samples.length-1].at);
    samples.push({ at: ms, state: await read() });
  }
  return { before, samples };
};
