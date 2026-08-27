export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const t = document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    if (!t) return 'PANEL-CLOSED';
    // walk up to the panel root
    let root = t; for (let i=0;i<8 && root.parentElement;i++) { root = root.parentElement;
      if ((root.innerText||'').includes('Require approval') && (root.innerText||'').length > 200) break; }
    return { panelText: (root.innerText||'').replace(/\n+/g,' | ').slice(0,300),
             buttons: [...root.querySelectorAll('button')].filter(v)
               .map(b=>({ tid:b.getAttribute('data-testid'),
                          al:(b.getAttribute('aria-label')||'').slice(0,30),
                          t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,24) }))
               .filter(b=>b.t || b.al),
             hasSave: /^(Save|Apply|Done|Update)$/i.test(
               [...root.querySelectorAll('button')].map(b=>(b.innerText||'').trim()).join('|')) };
  });
};
