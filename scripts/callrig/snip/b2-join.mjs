export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEETING;
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/call/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const vis = `el => { if(!el) return false; let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } return op>0.05; }`;
  out.pre = await page.evaluate((v)=>{ const vis=eval(v);
    return {text: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,350),
            btns: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,20)}; }, vis);
  const jb = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Join call|Join now|Ask to join|Request to join)$/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return (b.innerText||'').trim(); } return null; }, vis);
  out.joinClicked = jb;
  await page.waitForTimeout(7000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url: location.href,
            text: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,350),
            btns: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,22)}; }, vis);
  return out;
};
