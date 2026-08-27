export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  // hard fresh load
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`, {waitUntil:'load'});
  await page.waitForTimeout(4500);
  const res={};
  for(const who of ['QA Bob','QA Dave']){
    await page.locator('main').getByText(who,{exact:true}).first().click();
    await page.waitForTimeout(2200);
    res[who] = await page.evaluate(() => {
      const vis = e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false;
        let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      if(!d) return {noDialog:true};
      return {text:d.innerText.replace(/\s+/g,' ').slice(0,240),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,25), dis:b.disabled}))};
    });
    const close = page.locator('[role=dialog] button[aria-label="Close profile"]').first();
    if(await close.count()) { await close.click(); await page.waitForTimeout(1200); }
  }
  return res;
};
