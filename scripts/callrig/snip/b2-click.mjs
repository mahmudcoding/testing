export default async ({page}) => {
  const LABEL = process.env.QA_LABEL;
  const WAIT = Number(process.env.QA_WAIT || 4000);
  const vis = el => true;
  const clicked = await page.evaluate((label) => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const cands=[...document.querySelectorAll('button,a[href],[role=menuitem],[role=tab]')].filter(v);
    const b = cands.find(x => (x.getAttribute('aria-label')||'').trim()===label)
           || cands.find(x => (x.innerText||'').trim()===label)
           || cands.find(x => (x.getAttribute('data-testid')||'')===label);
    if (!b) return {found:false, near: cands.map(x=>(x.getAttribute('aria-label')||x.innerText||'').trim().slice(0,32)).filter(Boolean).slice(0,30)};
    const before = {pressed: b.getAttribute('aria-pressed'), expanded: b.getAttribute('aria-expanded'), sel: b.getAttribute('aria-selected')};
    b.click();
    return {found:true, before};
  }, LABEL);
  await page.waitForTimeout(WAIT);
  const after = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const ids=[...new Set([...document.querySelectorAll('[data-testid]')].filter(v).map(e=>e.getAttribute('data-testid')))];
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    const scope = dlg || document.querySelector('main') || document.body;
    return {url: location.href, ids: ids.filter(t=>/call|lobby|pip|meet|ended|taken|wait|hub/i.test(t)).slice(0,26),
      dialog: dlg?(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,300):null,
      text:(scope.innerText||'').replace(/\n+/g,' | ').slice(0,340),
      btns:[...scope.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,24)};
  });
  return {clicked, after};
};
