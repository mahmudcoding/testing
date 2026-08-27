export default async ({page}) => {
  const old = process.env.QA_MEET;
  const out = {};
  const e = page.locator('[data-testid="call-controls-end-for-everyone"]');
  if (await e.count()) { await e.click(); await page.waitForTimeout(1200);
    const cf = page.locator('[data-testid="call-end-confirm-submit"]'); if (await cf.count()) await cf.click(); }
  await page.waitForTimeout(8000);
  out.endedNow = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="ended-rate-section"]');
    return {url: location.href, has: !!document.querySelector('[data-testid="call-ended-summary"]'),
            rate: s? {text:s.innerText.replace(/\n+/g,' | ').slice(0,120), filled:[...s.querySelectorAll('button')].map(x=>(x.querySelector('svg')?.getAttribute('fill')||'?')).join(',')} : null};
  });
  // close the summary, then reopen the OLD ended call by URL
  const close = page.locator('[data-testid="call-ended-close"]');
  if (await close.count()) { await close.click(); await page.waitForTimeout(2500); }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/'+old, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.reopenOld = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="ended-rate-section"]');
    return {url: location.href, has: !!document.querySelector('[data-testid="call-ended-summary"]'),
            rate: s? {text:s.innerText.replace(/\n+/g,' | ').slice(0,150), filled:[...s.querySelectorAll('button')].map(x=>(x.querySelector('svg')?.getAttribute('fill')||'?')).join(',')} : null,
            body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  out.apiOld = await page.evaluate(async (id)=> (await (await fetch('/api/v1/meeting/'+id,{credentials:'include'})).json()).meeting?.rating, old);
  return out;
};
