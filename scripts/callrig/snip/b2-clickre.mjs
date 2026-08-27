export default async ({page}) => {
  const RE = process.env.QA_RE;
  const WAIT = Number(process.env.QA_WAIT || 4000);
  const clicked = await page.evaluate((re) => {
    const rx = new RegExp(re, 'i');
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const cands=[...document.querySelectorAll('button,a[href],[role=menuitem],[role=tab],[role=option]')].filter(v);
    const b = cands.find(x => rx.test((x.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim()))
           || cands.find(x => rx.test((x.innerText||'').replace(/\s+/g,' ').trim()));
    if (!b) return {found:false, near: cands.map(x=>(x.getAttribute('aria-label')||x.innerText||'').replace(/\s+/g,' ').trim().slice(0,34)).filter(Boolean).slice(0,26)};
    b.scrollIntoView({block:'center'});
    b.click();
    return {found:true, label:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)};
  }, RE);
  await page.waitForTimeout(WAIT);
  const after = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    const scope = dlg || document.querySelector('main') || document.body;
    return {url: location.href, dialog: !!dlg,
      text:(scope.innerText||'').replace(/\n+/g,' | ').slice(0,1600),
      btns:[...scope.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,22)};
  });
  return {clicked, after};
};
