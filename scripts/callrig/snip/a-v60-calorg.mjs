const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.chips = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('[data-testid="calendar-event-chip"]')].map(c=>({
      txt:(c.innerText||'').replace(/\s+/g,' ').slice(0,40), vis:vis(c),
      y:Math.round(c.getBoundingClientRect().y)}));},VS);
  // open the Participant Check chip (scrollIntoViewIfNeeded per repo guidance)
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  const n = await chip.count();
  out.chipFound = n>0;
  if(n){ await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(2500); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-details.png'});
  out.details = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    if(!d) return {noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,420),
             mentionsAlice:/QA Alice/.test(d.innerText||''), mentionsBob:/QA Bob/.test(d.innerText||''),
             hasOrganizerWord:/organi[sz]er|host|created by/i.test(d.innerText||''),
             btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,18)).filter(Boolean).slice(0,12) };},VS);
  return out;
};
