export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const b = page.locator('button:has-text("Schedule meeting")').first();
  if (!(await b.count())) return {err:'no button'};
  await b.click(); await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')].pop();
    if (!d) return {err:'no dialog'};
    return {title: (d.querySelector('h2')||{}).textContent,
      text: d.innerText.replace(/\n+/g,' | ').slice(0,700),
      fields: [...d.querySelectorAll('input,select,textarea')].map(i=>({t:i.type||i.tagName, id:i.id, al:i.getAttribute('aria-label'), ph:i.placeholder, v:String(i.value).slice(0,26)})),
      btns: [...d.querySelectorAll('button')].map(x=>((x.getAttribute('aria-label')||x.textContent||'').trim()+'#'+(x.getAttribute('data-testid')||'-')).slice(0,52)),
      testids: [...new Set([...d.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,30)};
  });
};
