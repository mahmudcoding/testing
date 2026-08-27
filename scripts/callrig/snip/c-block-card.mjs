export default async ({page}) => {
  const WS='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const openCard = async (name) => {
    await page.evaluate((n) => {
      const el = [...document.querySelectorAll('button,[role="button"],a')].find(e=>(e.innerText||'').includes(n));
      if (el) el.click();
    }, name);
    await page.waitForTimeout(2200);
    return await page.evaluate(() => {
      const dlg = [...document.querySelectorAll('[role="dialog"]')].pop() || document.body;
      return {
        text: (dlg.innerText||'').replace(/\n+/g,' | ').slice(0,600),
        buttons: [...dlg.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30), d:b.disabled}))
      };
    });
  };
  const before = await openCard('QA Bob');
  // click Block
  const blocked = await page.evaluate(() => {
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop()||document.body;
    const b=[...dlg.querySelectorAll('button')].find(b=>/^Block$/i.test((b.textContent||'').trim()));
    if(!b||b.disabled) return false; b.click(); return true;
  });
  await page.waitForTimeout(2500);
  const blockedList = await page.evaluate(async () => (await (await fetch('/api/v1/messaging/users/blocked',{credentials:'include'})).text()).slice(0,300));
  // reopen the card
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500);
  const after = await openCard('QA Bob');
  return {before, blockedClicked: blocked, blockedList, after};
};
