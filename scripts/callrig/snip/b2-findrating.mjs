export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=(document.body.innerText||'');
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
    return {
      hasRatingWord: /rating|rate|звёзд|star/i.test(body),
      matches: (body.match(/[^\n]*[Rr]at(e|ing)[^\n]*/g)||[]).slice(0,6),
      ratingTestids: ids.filter(t=>/rat|star/i.test(t)),
      allTestids: ids.slice(0,26),
      bodyLen: body.length
    };
  });
};
