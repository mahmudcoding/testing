const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button[aria-label="Side Rooms"]').first().click();
  await page.waitForTimeout(2800);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/sideroom-panel.png'});
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop();
    const scope=d||document.body;
    return { txt:(scope.innerText||'').replace(/\s+/g,' ').slice(0,420),
      btns:[...scope.querySelectorAll('button')].filter(vis).map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,28),t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,24),dis:b.disabled})).filter(b=>b.al||b.t).slice(0,20),
      inputs:[...scope.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,26)})) };},VS);
  return out;
};
