export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const dlg=page.locator('[role=dialog]').first();
  await dlg.locator('button:has-text("Reminder")').first().click().catch(()=>{});
  await page.waitForTimeout(2000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const menus=[...document.querySelectorAll('[role=menu],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const d=document.querySelector('[role=dialog]');
    return {menuCount:menus.length,
      menuTxt:menus.map(m=>m.innerText.replace(/\n+/g,' | ').slice(0,220)),
      dlgHasReminder: d? /Reminder|No reminder/.test(d.innerText):null,
      reminderLine: d? (d.innerText.split('\n').find(l=>/reminder/i.test(l))||null):null};
  });
};
