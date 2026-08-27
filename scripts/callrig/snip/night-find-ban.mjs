export default async ({page}) => {
  for (const tid of ['call-controls-people-toggle','call-controls-settings-toggle']){
    const l=page.locator('[data-testid="'+tid+'"]');
    if (await l.count() && await l.getAttribute('aria-pressed')!=='true'){ await l.click(); await page.waitForTimeout(2000); }
  }
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>({
    bodyBan:(document.body.innerText.match(/.{0,50}ban.{0,50}/gi)||[]).filter(x=>!/banner/i.test(x)).slice(0,6),
    ariaBan:[...document.querySelectorAll('[aria-label*="ban" i]')].map(e=>e.getAttribute('aria-label')).filter(x=>!/banner/i.test(x)),
    testidBan:[...document.querySelectorAll('[data-testid*="ban" i]')].map(e=>e.getAttribute('data-testid')).filter(x=>!/banner/i.test(x)),
    peoplePanel:(p=>p?p.innerText.replace(/\n+/g,' | ').slice(0,300):null)(document.querySelector('[data-testid="participants-list-panel"]'))
  }));
};
