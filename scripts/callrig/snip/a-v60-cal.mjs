const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/calendar.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { btns:[...main.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,22),tid:b.getAttribute('data-testid')||'',al:(b.getAttribute('aria-label')||'').slice(0,22)})).filter(b=>b.t||b.tid||b.al).slice(0,26),
             chips:[...main.querySelectorAll('[data-testid="calendar-event-chip"]')].length,
             txt:(main.innerText||'').replace(/\s+/g,' ').slice(0,260) };},VS);
};
