export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r => { if (r.url().includes('/calendar/meetings')) net.push({m:r.request().method(), u:r.url().slice(-60), s:r.status(), b:(await r.text().catch(()=>'')).slice(0,300)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg = page.locator('[role=dialog]').first();
  const title = dlg.locator('input').first();
  await title.fill('QA-E Sync 1');
  await dlg.locator('input[aria-label="Starts time"]').fill('15:00');
  await page.waitForTimeout(400);
  await dlg.locator('input[aria-label="Ends time"]').fill('15:30');
  await page.waitForTimeout(400);
  // invite bob
  await dlg.locator('button:has-text("QA Bob")').first().click().catch(e=>{});
  await page.waitForTimeout(800);
  const before = await dlg.innerText().catch(()=> '');
  await dlg.locator('button:has-text("Schedule meeting")').first().click();
  await page.waitForTimeout(4500);
  const after = await page.evaluate(() => {
    const d=document.querySelector('[role=dialog]');
    return {dlgOpen: !!d, dlgTxt: d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,400):null,
      chips: [...document.querySelectorAll('button[data-testid="calendar-event-chip"]')].map(c=>c.innerText.replace(/\n/g,' ')).slice(0,10)};
  });
  return {net, beforeTail: before.replace(/\n{2,}/g,' | ').slice(-300), after};
};
