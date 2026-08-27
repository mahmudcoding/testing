export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const all = [...document.querySelectorAll('button')].filter(v)
      .map(b=>({ tid:b.getAttribute('data-testid'),
                 al:(b.getAttribute('aria-label')||'').slice(0,32),
                 t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22),
                 disabled:b.disabled }));
    return { callish: all.filter(b=>/call|audio|video|звон/i.test((b.tid||'')+(b.al||'')+b.t)) };
  });
};
