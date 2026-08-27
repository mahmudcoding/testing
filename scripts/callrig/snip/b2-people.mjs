export default async ({ page }) => {
  const open = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-people-toggle"]');
    if (!b) return 'no-toggle';
    b.click(); return b.getAttribute('aria-pressed') || 'clicked';
  });
  await page.waitForTimeout(2000);
  const panel = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect();
      if (r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05; };
    const all = Array.from(document.querySelectorAll('body *')).filter(vis);
    const cand = all.filter(n => /WAITING|IN CALL|Participants|People/i.test(n.textContent));
    const root = cand.filter(n => !cand.some(o=>o!==n && n.contains(o)))[0]
              || cand[cand.length-1];
    return { text: root ? root.innerText.replace(/\n+/g,' | ').slice(0,500) : '(none)',
             buttons: Array.from(document.querySelectorAll('button')).filter(vis)
               .map(b=>b.textContent.trim().slice(0,26)).filter(Boolean).slice(-14) };
  });
  return { toggle: open, panel };
};
