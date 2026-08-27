const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button', { hasText: /^New Side Room$/ }).first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/sideroom-new.png'});
  out.form = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,400),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,28),type:i.type,val:(i.value||'').slice(0,20)})),
      switches:[...d.querySelectorAll('[role="switch"],input[type=checkbox]')].filter(vis).map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40),on:String(s.getAttribute('aria-checked')??s.checked)})),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,24),t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,22),dis:b.disabled})).filter(b=>b.al||b.t).slice(0,18) };},VS);
  return out;
};
