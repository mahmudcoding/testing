const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('Grid Pass '+Math.floor(Date.now()/1000%100000),{delay:16}); }
  out.dialogOptions = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return { txt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,320),
      btns:[...(d?.querySelectorAll('button')||[])].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean) };},VS);
  // pick "Anyone" so nobody needs admitting
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/^Anyone$/.test((b.innerText||'').trim()));
    if(!b) return false; b.click(); return true;},VS);
  out.pickedAnyone=picked;
  await page.waitForTimeout(1200);
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.url = await page.evaluate(()=>location.pathname);
  out.callId = out.url.split('/call/')[1]||null;
  // fetch the invite link for the anonymous guests
  await page.locator('button[aria-label="Add to call"]').first().click().catch(()=>{});
  await page.waitForTimeout(2600);
  out.inviteLink = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('input')].filter(vis).map(i=>i.value).find(v=>/\/join\//.test(v||''))||null;},VS);
  return out;
};
