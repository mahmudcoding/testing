export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlgs = [...document.querySelectorAll('[role="dialog"]')].filter(v);
    return dlgs.map(d => ({
      text: (d.innerText||'').replace(/\n+/g,' | ').slice(0, 320),
      buttons: [...d.querySelectorAll('button')].filter(v)
        .map(b=>({ t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
                   al:(b.getAttribute('aria-label')||'').slice(0,26),
                   tid:b.getAttribute('data-testid'), disabled:b.disabled })),
      tid: d.getAttribute('data-testid') }));
  });
};
