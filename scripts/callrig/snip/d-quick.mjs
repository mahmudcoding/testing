export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res=[];
  const labels=['Edit company profile','Create workspace','Invite members','Manage roles'];
  for (const L of labels) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/company`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    const el = page.locator('main button, main a').filter({hasText:new RegExp('^'+L+'$','i')}).first();
    if (!(await el.count())) { res.push({label:L, note:'control not found'}); continue; }
    const before = page.url();
    try { await el.click({timeout:6000}); } catch(e) { res.push({label:L, note:'click failed: '+String(e).slice(0,50)}); continue; }
    await page.waitForTimeout(2800);
    const after = await page.evaluate(()=>{
      const d=document.querySelector('[role="dialog"],[role="alertdialog"]');
      const m=document.querySelector('main');
      return {url:location.pathname+location.search,
              dialog: d?(d.innerText||'').replace(/\s+/g,' ').slice(0,90):null,
              heading:(m?.querySelector('h1,h2')?.innerText||'').trim().slice(0,40)};
    });
    res.push({label:L, from:before.replace('https://airion-cargo.store',''), ...after});
    // close any dialog we opened without submitting anything
    await page.keyboard.press('Escape').catch(()=>{});
    await page.waitForTimeout(600);
  }
  return res;
};
