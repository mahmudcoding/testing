export default async ({ page }) => {
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect();
      if (r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden') return false;
        o*=parseFloat(c.opacity||'1'); n=n.parentElement;}
      return o>0.05; };
    const d = Array.from(document.querySelectorAll('button')).find(b=>/^Dismiss$/i.test(b.textContent.trim()) && vis(b));
    let ctx = null;
    if (d) { let n=d, h=0; while(n && h<6){ n=n.parentElement; h++;
      if (n && n.innerText.trim().length > 12) { ctx = n.innerText.replace(/\n+/g,' | ').slice(0,240); break; } } }
    return { hasDismiss: !!d, toast: ctx,
      allLive: Array.from(document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"],[class*="Toast"]'))
        .filter(vis).map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean) };
  });
};
