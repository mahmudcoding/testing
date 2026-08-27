export default async ({page}) => {
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const surf = document.querySelector('[data-testid="call-surface"]') || document.querySelector('[data-testid="pip-mini-call"]') || document.querySelector('[data-testid="call-ended-overlay"]');
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
    return {
      url: location.href,
      inCall: !!surf,
      surfaceText: surf ? (surf.innerText||'').replace(/\n+/g,' | ').slice(0,400) : null,
      tiles: [...document.querySelectorAll('[data-testid*="participant-tile"],[data-testid="participant-tile-card"]')].filter(v).length,
      names: [...new Set([...document.querySelectorAll('[data-testid*="participant"]')].filter(v).map(e=>(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,30)).filter(Boolean))].slice(0,10),
      banners: ids.filter(t=>/banner|recover|notice|error|lifecycle|toast/i.test(t)),
      callIds: ids.filter(t=>/call|pip|ended|taken/i.test(t)).slice(0,24)
    };
  });
};
