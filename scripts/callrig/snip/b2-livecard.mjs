export default async ({page}) => {
  const s = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    // find the "Live now" section
    const main=document.querySelector('main')||document.body;
    const secs=[...main.querySelectorAll('section,div')].filter(e=>v(e) && /Live now/.test((e.innerText||'').slice(0,40)));
    const sec = secs[secs.length-1];
    if(!sec) return {noLive:true};
    const card = sec;
    return {
      html: card.innerText.replace(/\n+/g,' | ').slice(0,400),
      interactive: [...card.querySelectorAll('button,a[href],[role=button]')].filter(v).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,40), tid:b.getAttribute('data-testid')||undefined, title:b.getAttribute('title')||undefined}))
    };
  });
  return s;
};
