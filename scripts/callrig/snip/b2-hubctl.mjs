export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const isRow = e => /·\s*(Ended|Declined|No answer|Canceled|Missed)/i.test(e.innerText||'');
    const ctl = [...document.querySelectorAll('button,[role="tab"],a,select')].filter(v).filter(e=>!isRow(e))
      .map(e=>({ tag:e.tagName, t:(e.textContent||'').trim().slice(0,28),
                 al:(e.getAttribute('aria-label')||'').slice(0,28),
                 tid:e.getAttribute('data-testid'),
                 sel:e.getAttribute('aria-selected')||e.getAttribute('data-state')||null }))
      .filter(e=>e.t||e.al);
    return { count: ctl.length, controls: ctl };
  });
};
