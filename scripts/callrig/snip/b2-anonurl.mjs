export default async ({page, ctx}) => {
  await ctx.clearCookies();
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  await page.goto('about:blank');
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const all=[...document.querySelectorAll('button,a[href],input,[role=button]')].filter(v);
    return {url:location.href, body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      interactiveCount: all.length,
      interactive: all.map(e=>({tag:e.tagName, t:(e.getAttribute('aria-label')||e.innerText||e.getAttribute('href')||'').replace(/\s+/g,' ').trim().slice(0,36)})).slice(0,12)};
  });
};
