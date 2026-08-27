export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const btns = [...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^(Start call|Start now|Join)$/i.test((b.innerText||'').trim()));
    return btns.map(b => {
      let n = b, ctx = null, h = 0;
      while (n && h < 5) { n = n.parentElement; h++;
        if (n && (n.innerText||'').trim().length > 25) { ctx = n.innerText.replace(/\n+/g,' | ').slice(0,120); break; } }
      const inOverlay = !!b.closest('[data-testid="call-overlay-expanded"],[data-testid="call-surface"]');
      return { t:(b.innerText||'').trim(), disabled:b.disabled, inCallOverlay: inOverlay, ctx };
    });
  });
};
