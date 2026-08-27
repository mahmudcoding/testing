const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const name='Quarterly Planning And Roadmap Review With The Extended Platform Team '+Math.floor(Date.now()/1000%10000);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type(name,{delay:4}); }
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.name=name;
  out.callId=(await page.evaluate(()=>location.pathname)).split('/call/')[1]||null;
  await page.locator('button[aria-label="Add to call"]').first().click().catch(()=>{});
  await page.waitForTimeout(2600);
  out.link = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('input')].filter(vis).map(i=>i.value).find(v=>/\/join\//.test(v||''))||null;},VS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
