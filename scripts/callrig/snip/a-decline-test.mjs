export default async ({page}) => {
  const T='QA-A-DEC2'; const net=[]; const out={};
  page.on('response', async r=>{const u=r.url(); if(/respond/.test(u)){let b='';try{b=(await r.text()).slice(0,120);}catch(e){} net.push(`${r.status()} :: ${b}`);}});
  const open = async () => {
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5200);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:T}).first();
    if (!(await chip.count())) return null;
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
    await chip.click(); await page.waitForTimeout(3200);
    return await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      return d? {btns:[...d.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+'/'+(b.getAttribute('aria-pressed')||'-')+(b.disabled?'[dis]':''))).filter(Boolean)}:{none:true};});
  };
  out.before = await open();
  const no = page.locator('[role="dialog"] button').filter({hasText:/^No$/}).first();
  if (await no.count()) { await no.click(); await page.waitForTimeout(3000); }
  out.afterClick = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
    return d? {btns:[...d.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+'/'+(b.getAttribute('aria-pressed')||'-')+(b.disabled?'[dis]':''))).filter(Boolean)}:{none:true};});
  out.afterReload = await open();
  out.chipStillThere = out.afterReload !== null;
  out.net = net;
  return out;
};
