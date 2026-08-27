const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/i.test(u)&&r.request().method()!=='GET'){
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,42),s:r.status(),req:(r.request().postData()||'').slice(0,260)});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button',{hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2600);
  const title='V60 Future '+Math.floor(Date.now()/1000%100000);
  await page.evaluate(([vs,v])=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const i=[...d.querySelectorAll('input')].filter(vis)[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(i,v); i.dispatchEvent(new Event('input',{bubbles:true}));},[VS,title]);
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button',{hasText:/^Schedule meeting$/}).first().click();
  await page.waitForTimeout(5000);
  out.created=net.filter(n=>n.m==='POST');
  out.title=title;
  // reopen it and enumerate
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const chip = page.locator('[data-testid="calendar-event-chip"]',{hasText:/V60 Future/}).first();
  out.chipFound = await chip.count()>0;
  if(out.chipFound){ await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3200); }
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,20),al:(b.getAttribute('aria-label')||'').slice(0,22)})) };},VS);
  return out;
};
