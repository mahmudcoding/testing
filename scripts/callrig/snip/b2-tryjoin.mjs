export default async ({ page }) => {
  const ws = 'W4QBF1XTURESO01', id = process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(() => Array.from(document.querySelectorAll('button'))
    .filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>({t:b.textContent.trim().slice(0,32), dis:b.disabled})));
  const hit = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button'))
      .filter(x=>x.getBoundingClientRect().width>0)
      .find(x => /^(Join call|Ask to join|Request to join|Join)$/i.test(x.textContent.trim()) && !x.disabled);
    if (b) { const t=b.textContent.trim(); b.click(); return t; } return null;
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => ({
    url: location.pathname,
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300),
    buttons: Array.from(document.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>b.textContent.trim().slice(0,32)).filter(Boolean).slice(0,12)
  }));
  return { before: before.slice(0,10), clicked: hit, after };
};
