export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-breakout-rooms"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const scope = d || document;
    return { dialogText: d ? (d.innerText||'').replace(/\n+/g,' | ').slice(0,260) : '(no dialog)',
      buttons: [...scope.querySelectorAll('button')].filter(v)
        .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                   tid:b.getAttribute('data-testid'), disabled:b.disabled }))
        .filter(b=>b.t||b.tid).slice(0,16),
      inputs: [...scope.querySelectorAll('input')].filter(v)
        .map(i=>({type:i.type, ph:i.getAttribute('placeholder')})) };
  });
};
