export default async ({page}) => {
  const steps = [];
  // Dismiss whatever is covering the control bar (the camera/screen-share nudge).
  const dismissed = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(x=>x.offsetParent)
      .find(x=>/^not now$/i.test((x.textContent||'').trim()));
    if (b) { b.click(); return 'clicked Not now'; }
    return 'nothing to dismiss';
  });
  steps.push(dismissed);
  await page.waitForTimeout(2500);
  const clear = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-leave"]');
    const r=b.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return t===b||b.contains(t); });
  steps.push('leave button reachable: ' + clear);
  await page.locator('[data-testid="call-controls-leave"]').first().click().catch(e=>steps.push('click err'));
  await page.waitForTimeout(2500);
  const confirmed = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(x=>x.offsetParent)
      .find(x=>/Leave this call\?/.test(x.innerText||''));
    if(!d) return 'no confirm dialog';
    const btns=[...d.querySelectorAll('button')];
    const b=btns.find(x=>/^leave/i.test((x.textContent||'').trim()));
    if(!b) return 'buttons: '+btns.map(x=>(x.textContent||'').trim()).join('|');
    b.click(); return 'confirmed "'+(b.textContent||'').trim()+'"';
  });
  steps.push(confirmed);
  await page.waitForTimeout(6000);
  steps.push('still in call: ' + await page.evaluate(()=>!!document.querySelector('[data-testid="call-controls-leave"]')));
  return steps;
};
