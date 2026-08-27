export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="side-rooms-new"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const step1 = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    return { text: d ? (d.innerText||'').replace(/\n+/g,' | ').slice(0,240) : '(none)',
      inputs: d ? [...d.querySelectorAll('input')].filter(v).map(i=>({type:i.type, ph:i.getAttribute('placeholder'), val:(i.value||'').slice(0,20)})) : [],
      buttons: d ? [...d.querySelectorAll('button')].filter(v)
        .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24), tid:b.getAttribute('data-testid'), dis:b.disabled}))
        .filter(b=>b.t||b.tid).slice(-10) : [] };
  });
  return step1;
};
