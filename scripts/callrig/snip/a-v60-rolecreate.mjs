const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/roles?scope=workspace',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button',{hasText:/^Create role$/}).first().click();
  await page.waitForTimeout(3000);
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {noDialog:true, url:location.pathname};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,320),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,24),type:i.type})),
      checkboxes:[...d.querySelectorAll('input[type=checkbox],[role="switch"]')].filter(vis).length,
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,22),dis:b.disabled})) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/rolecreate.png'});
  return out;
};
