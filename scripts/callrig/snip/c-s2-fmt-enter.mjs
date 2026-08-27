export default async ({page}) => {
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const snap = () => page.evaluate(() => {
    const c = [...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    const send = [...document.querySelectorAll('button[aria-label="Send"]')].pop();
    return {n: document.querySelectorAll('[data-message-id]').length,
            txt: c.innerText.replace(/\n/g,'\\n').slice(0,80),
            paras: c.querySelectorAll('p').length,
            sendDisabled: send.disabled};
  });
  const runs = [];
  const cases = [
    {name:'plain, no toolbar',  mark:null,     txt:'QA-S2-E-PLAIN'},
    {name:'Bold via toolbar',   mark:'Bold',   txt:'QA-S2-E-BOLD'},
    {name:'Italic via toolbar', mark:'Italic', txt:'QA-S2-E-ITAL'},
  ];
  for (const c of cases) {
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(200);
    await comp.type('pre ');
    if (c.mark) { await page.locator(`button[aria-label="${c.mark}"]`).last().click(); await page.waitForTimeout(400); }
    await comp.type(c.txt);
    await page.waitForTimeout(300);
    const before = await snap();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
    const after = await snap();
    runs.push({case:c.name, before, after, sent: after.n > before.n});
  }
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  return runs;
};
