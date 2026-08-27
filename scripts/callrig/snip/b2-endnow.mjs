export default async ({page}) => {
  const r1 = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    if(!dlg) return {noDialog:true, btns:[...document.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30)).slice(0,20)};
    const cands=[...dlg.querySelectorAll('button')].filter(v);
    const sub = cands.find(b=>(b.getAttribute('data-testid')||'').includes('confirm-submit')) || cands.find(b=>/End for everyone|^Leave$|^End$/i.test((b.innerText||'').trim()));
    if(sub){ sub.click(); return {clicked:(sub.getAttribute('data-testid')||sub.innerText||'').trim().slice(0,40)}; }
    return {noSubmit:true, cands: cands.map(b=>({t:(b.innerText||'').trim().slice(0,26), tid:b.getAttribute('data-testid')}))};
  });
  await page.waitForTimeout(7000);
  const after = await page.evaluate(()=>({url:location.href, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,260)}));
  return {r1, after};
};
