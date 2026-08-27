export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2500);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type(process.env.QA_CALLNAME||'QA-C-REC2',{delay:15}); }
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.callId=(await page.evaluate(()=>location.pathname)).split('/call/')[1];
  if (process.env.QA_REC==='1') {
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Record"]')].find(x=>x.getClientRects().length); if(b)b.click();});
    await page.waitForTimeout(1800);
    out.recStarted = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>/^Start recording$/i.test((e.textContent||'').trim())); if(!b) return false; b.click(); return true;});
    await page.waitForTimeout(3000);
  }
  return out;
};
