const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // start a call in the ORIGINAL workspace
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2600);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('WS Switch '+Math.floor(Date.now()/1000%100000),{delay:16}); }
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.inCall = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, callId:location.pathname.split('/call/')[1]||null,
      hasLeave:[...document.querySelectorAll('button')].filter(vis).some(b=>/Leave call/i.test(b.getAttribute('aria-label')||b.innerText||'')) };},VS);
  // now switch workspace
  await page.goto('https://airion-cargo.store/w/W4OV431T9GS61M5/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-switch.png'});
  out.afterSwitch = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      callSurvived:[...document.querySelectorAll('button')].filter(vis).some(b=>/Leave call|Return to call|End for everyone/i.test(b.getAttribute('aria-label')||b.innerText||'')),
      callChrome:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/WS Switch|in call|Return to call|active call/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,5),
      videos:document.querySelectorAll('video').length,
      leaveBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)).filter(t=>/leave|end|return/i.test(t)).slice(0,5) };},VS);
  return out;
};
