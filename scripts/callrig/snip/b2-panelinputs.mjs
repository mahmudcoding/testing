export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const t = document.querySelector('[data-testid="meeting-settings-approval-toggle"]');
    if (!t) return 'PANEL-CLOSED';
    let root = t; for (let i=0;i<9 && root.parentElement;i++){ root=root.parentElement;
      if ((root.innerText||'').includes('PARTICIPANT LIMIT')) break; }
    return [...root.querySelectorAll('input')].map(e=>({
      tid:e.getAttribute('data-testid'), type:e.type, value:e.value,
      ph:e.getAttribute('placeholder'), al:e.getAttribute('aria-label'), visible:v(e) }));
  });
};
