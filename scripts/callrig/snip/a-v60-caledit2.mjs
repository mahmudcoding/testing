const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('[data-testid="calendar-event-chip"]',{hasText:/Participant Check/}).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3200);
  out.dialogAll = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),
      everyButton:[...d.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().slice(0,20),al:(b.getAttribute('aria-label')||'').slice(0,26)})),
      links:[...d.querySelectorAll('a')].filter(vis).map(a=>(a.innerText||'').trim().slice(0,20)) };},VS);
  // try a menu/more inside the dialog
  const more = page.locator('[role="dialog"] button[aria-label*="ore"], [role="dialog"] button[aria-label*="ctions"]').first();
  out.moreFound = await more.count()>0;
  if(out.moreFound){ await more.click().catch(()=>{}); await page.waitForTimeout(1800);
    out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...new Set([...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(vis).map(x=>(x.innerText||'').trim().slice(0,24)))];},VS); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-detail-actions.png'});
  return out;
};
