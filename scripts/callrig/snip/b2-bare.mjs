export default async ({page}) => {
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const all=[...document.querySelectorAll('button,a,input,select,textarea,[role=button],[role=link],[tabindex]:not([tabindex="-1"])')].filter(v);
    return {
      url: location.href,
      bodyText: (document.body.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      interactiveCount: all.length,
      interactive: all.map(e=>({tag:e.tagName, t:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('href')||'').replace(/\s+/g,' ').trim().slice(0,40)})),
      links: [...document.querySelectorAll('a[href]')].filter(v).map(a=>a.getAttribute('href')).slice(0,8)
    };
  });
};
