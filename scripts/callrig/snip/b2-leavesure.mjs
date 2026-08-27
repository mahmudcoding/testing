export default async ({ page }) => {
  const steps = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const inCall = () => page.evaluate(() => location.pathname.includes('/call/'));
    if (!(await inCall())) { steps.push({ attempt, note: 'already out' }); break; }
    const controls = await page.evaluate(() => {
      const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
      return [...document.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
        .filter(t=>/leave/i.test(t)); });
    steps.push({ attempt, leaveControls: controls });
    // if we are in a side room, come back to the main call first
    if (controls.some(c=>/leave side room/i.test(c)) && !controls.some(c=>/^leave call$/i.test(c))) {
      await page.evaluate(() => { const v=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
        const b=[...document.querySelectorAll('button')].filter(v).find(x=>/leave side room/i.test((x.innerText||'')+(x.getAttribute('aria-label')||'')));
        if (b) b.click(); });
      await page.waitForTimeout(6000); continue;
    }
    await page.evaluate(() => { const v=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(v).find(x=>/^Leave call$/i.test((x.innerText||x.getAttribute('aria-label')||'').trim()));
      if (b) b.click(); });
    await page.waitForTimeout(2000);
    const dlg = await page.evaluate(() => {
      const v=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
      const b = d && [...d.querySelectorAll('button')].filter(v).find(x=>/^Leave$/i.test((x.innerText||'').trim()));
      if (!b) return 'no confirm button'; b.click(); return 'confirmed'; });
    steps.push({ attempt, dialog: dlg });
    await page.waitForTimeout(5000);
    if (!(await inCall())) break;
  }
  return { steps, finalUrl: page.url().slice(-30),
           stillInCall: await page.evaluate(() => location.pathname.includes('/call/')) };
};
