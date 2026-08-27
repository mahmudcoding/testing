export default async ({ page }) => {
  await page.evaluate(() => { const b=document.querySelector('[data-testid="call-controls-add-to-call"]'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop() || document.body;
    return { text: (dlg.innerText||'').replace(/\n+/g,' | ').slice(0,320),
             inputs: [...dlg.querySelectorAll('input')].filter(v).map(i=>({type:i.type, val:(i.value||'').slice(0,150)})),
             buttons: [...dlg.querySelectorAll('button')].filter(v)
               .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)).filter(Boolean).slice(0,14) };
  });
};
