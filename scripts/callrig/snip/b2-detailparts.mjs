export default async ({ page }) => {
  const ws = 'W4QBF1XTURESO01', id = process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${ws}/calls/${id}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const vis = () => {};
  const clicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button,a'))
      .find(b => /^View all/i.test(b.textContent.trim()) && b.getBoundingClientRect().width>0);
    if (b) { b.click(); return b.textContent.trim(); } return null;
  });
  await page.waitForTimeout(2500);
  const txt = await page.evaluate(() => {
    const cand = Array.from(document.querySelectorAll('body *')).filter(n => {
      const r = n.getBoundingClientRect(); return r.width>0 && r.height>0 &&
        /in call/i.test(n.textContent); });
    const root = cand.find(n => !cand.some(o => o!==n && n.contains(o)));
    // walk up until we have every "in call" line
    let n = root, best = root;
    while (n && (n.innerText.match(/in call/gi)||[]).length < (document.body.innerText.match(/in call/gi)||[]).length) {
      n = n.parentElement; if (n) best = n; }
    return best ? best.innerText : '(none)';
  });
  return { clicked, block: txt.slice(0, 1200) };
};
