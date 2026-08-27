export default async ({page}) => {
  const steps = [];
  const inCall = () => page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]'));
  steps.push('inCall before: ' + await inCall());
  // open the confirm if it is not already open
  const dlgOpen = () => page.evaluate(()=>[...document.querySelectorAll('[role="dialog"]')]
    .filter(d=>d.offsetParent).some(d=>/Leave this call\?/.test(d.innerText||'')));
  if (!(await dlgOpen())) {
    await page.locator('[data-testid="call-controls-leave"]').first().click().catch(()=>{});
    await page.waitForTimeout(2500);
  }
  steps.push('confirm dialog open: ' + await dlgOpen());
  const confirmed = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(x=>x.offsetParent)
      .find(x=>/Leave this call\?/.test(x.innerText||''));
    if (!d) return 'no dialog';
    const btns = [...d.querySelectorAll('button')];
    // the affirmative action, not Cancel / the close X
    const b = btns.find(x=>/^leave/i.test((x.textContent||'').trim())) ||
              btns.filter(x=>!/cancel|close/i.test((x.textContent||'')+(x.getAttribute('aria-label')||''))).pop();
    if (!b) return 'buttons: ' + btns.map(x=>(x.textContent||'').trim()).join('|');
    b.click(); return 'clicked "' + (b.textContent||'').trim() + '"';
  });
  steps.push('confirm: ' + confirmed);
  await page.waitForTimeout(6000);
  steps.push('inCall after: ' + await inCall());
  steps.push('url: ' + await page.evaluate(()=>location.pathname));
  return steps;
};
