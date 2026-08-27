export default async ({page}) => {
  const ws='W4QCF1XTURESO01', id='C4QCGENERAL0001';
  const read = () => page.evaluate(() => {
    const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:{none:true};
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(3800);
  const before = await read();
  await page.locator('button[aria-label="Mute notifications"]').first().click();
  await page.waitForTimeout(2000);
  const afterClick = await read();
  const toasts = await page.evaluate(() => {
    const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
      let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
    return [...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean);
  });
  // reload and re-read
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${id}`, {waitUntil:'load'});
  await page.waitForTimeout(4200);
  const afterReload = await read();
  // sidebar appearance of the channel
  const side = await page.evaluate(() => {
    const el=[...document.querySelectorAll('a[href*="/c/"]')].find(a=>/qa-general/.test(a.innerText));
    return el?{text:el.innerText.replace(/\s+/g,' ').slice(0,50), opacity:getComputedStyle(el).opacity}:{none:true};
  });
  return {before, afterClick, toasts, afterReload, sidebar: side};
};
