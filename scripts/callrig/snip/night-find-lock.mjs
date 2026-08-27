export default async ({page}) => {
  // open every panel and scan for "lock"
  const out={};
  for (const tid of ['call-controls-settings-toggle','call-controls-people-toggle','call-controls-breakout-rooms']){
    const l=page.locator('[data-testid="'+tid+'"]');
    if (await l.count() && await l.getAttribute('aria-pressed')!=='true'){ await l.click(); await page.waitForTimeout(2000); }
  }
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>({
    bodyLockMatches:(document.body.innerText.match(/.{0,50}lock.{0,50}/gi)||[]).slice(0,6),
    ariaLock:[...document.querySelectorAll('[aria-label*="lock" i]')].map(e=>e.getAttribute('aria-label')),
    testidLock:[...document.querySelectorAll('[data-testid*="lock" i]')].map(e=>e.getAttribute('data-testid')),
    allToolbarLabels:[...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(b=>b.getAttribute('aria-label'))
  }));
};
