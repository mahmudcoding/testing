export default async ({page}) => {
  const dlg = page.locator('[role=dialog]').last();
  await dlg.locator('button', {hasText:'qa-private'}).first().click();
  await page.waitForTimeout(600);
  const sel = (await dlg.innerText()).match(/(\d+) selected/);
  await dlg.locator('button', {hasText:'Continue'}).first().click();
  await page.waitForTimeout(1800);
  const d2 = page.locator('[role=dialog]').last();
  const txt2 = (await d2.innerText()).slice(0,500);
  const btns2 = await d2.evaluate(d => [...d.querySelectorAll('button')]
     .filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0;})
     .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30)));
  return {selectedLabel: sel && sel[0], step2Text: txt2, step2Buttons: btns2.slice(0,20)};
};
