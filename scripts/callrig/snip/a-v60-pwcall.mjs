const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2800);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('PW Call '+Math.floor(Date.now()/1000%10000),{delay:12}); }
  // enable Password protection
  out.before = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return { txt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,300),
      switches:[...(d?.querySelectorAll('[role="switch"]')||[])].filter(vis).map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40),on:s.getAttribute('aria-checked')})) };},VS);
  const pw = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const b=[...d.querySelectorAll('button')].filter(vis).find(b=>/Password protection/i.test(b.innerText||''));
    if(!b) return null; b.click(); return b.innerText.trim().slice(0,26);},VS);
  out.pwToggle=pw;
  await page.waitForTimeout(2000);
  out.afterPw = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return { txt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,320),
      inputs:[...(d?.querySelectorAll('input')||[])].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26),type:i.type})) };},VS);
  // type a password if a field appeared
  const pwi = await page.$('[role="dialog"] input[type="password"], [role="dialog"] input[placeholder*="assword"]');
  if(pwi){ await pwi.click(); await page.keyboard.type('V60pass!',{delay:25}); out.pwTyped=true; }
  await page.waitForTimeout(700);
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.callId=(await page.evaluate(()=>location.pathname)).split('/call/')[1]||null;
  return out;
};
