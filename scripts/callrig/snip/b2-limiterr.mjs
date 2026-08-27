export default async ({ page }) => {
  const NEEDLE = 'cannot be lower than the number of people';
  const scan = () => page.evaluate(n => {
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let x=el,o=1; while(x&&x!==document.documentElement){o*=parseFloat(getComputedStyle(x).opacity||'1');x=x.parentElement;}
      return o>0.05; };
    const hits = [...document.querySelectorAll('*')].filter(e => (e.textContent||'').includes(n));
    const min = hits.filter(e => !hits.some(o => o!==e && e.contains(o)));
    return min.map(e => ({ tag:e.tagName, role:e.getAttribute('role'),
      testid:e.getAttribute('data-testid'),
      cls:(e.className||'').toString().slice(0,52),
      visible: vis(e), ariaLive: e.closest('[aria-live]') ? e.closest('[aria-live]').getAttribute('aria-live') : null,
      inToast: !!e.closest('[data-sonner-toast],[class*="toast"],[role="status"],[role="alert"]') }));
  }, NEEDLE);
  // make sure the panel is open
  for (let i=0;i<3;i++) {
    const ok = await page.evaluate(()=>{ const e=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
      return e ? e.getBoundingClientRect().width>0 : false; });
    if (ok) break;
    await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(1800);
  }
  const before = await scan();
  // set a limit below the current count and save
  await page.evaluate(() => { const e=document.querySelector('[data-testid="meeting-settings-max-participants-input"]');
    const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
    s.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true}));
    s.call(e,'1'); e.dispatchEvent(new Event('input',{bubbles:true})); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const b=document.querySelector('[data-testid="meeting-settings-save"]'); if(b && !b.disabled) b.click(); });
  await page.waitForTimeout(3500);
  const after = await scan();
  return { beforeAttempt: before, afterAttempt: after };
};
