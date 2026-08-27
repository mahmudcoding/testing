export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const wc = document.querySelector('[data-testid="call-controls-waiting-count"]');
    let host = null;
    if (wc) { let n = wc, h = 0; while (n && h < 4) { n = n.parentElement; h++;
      if (n && (n.getAttribute('aria-label') || n.tagName === 'BUTTON')) {
        host = { tag:n.tagName, tid:n.getAttribute('data-testid'),
                 al:n.getAttribute('aria-label'), text:(n.innerText||'').replace(/\n+/g,' ').slice(0,60) }; break; } } }
    return { present: !!wc, visible: wc ? v(wc) : false,
             value: wc ? (wc.innerText||'').trim() : null, owner: host,
             peopleBtn: (()=>{ const b=document.querySelector('[data-testid="call-controls-people-toggle"]');
               return b ? { al:b.getAttribute('aria-label'), text:(b.innerText||'').replace(/\n+/g,' ').trim().slice(0,40) } : null; })() };
  });
};
