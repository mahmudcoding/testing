export default async ({page}) => {
  const read = () => page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const tabs=[...body.querySelectorAll('[role=tab]')].filter(v).map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim(), sel:b.getAttribute('aria-selected')}));
    const btns=[...body.querySelectorAll('button')].filter(v);
    // a call row = a button whose text carries the "Outbound|Inbound · <status> ·" shape
    const rows=btns.filter(b=>/(Outbound|Inbound)\s*·/.test(b.innerText||''));
    const lm=btns.find(b=>/load more|loading more/i.test(b.innerText||''));
    return {tabs, rowCount: rows.length, loadMore: lm?{t:(lm.innerText||'').trim(), dis:lm.disabled}:null,
            oldest: rows.length?(rows[rows.length-1].innerText||'').replace(/\s+/g,' ').trim().slice(0,60):null};
  });
  const before = await read();
  const clicked = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=[...document.querySelectorAll('button')].filter(v).find(x=>/load more/i.test(x.innerText||''));
    if(b){ b.scrollIntoView({block:'center'}); b.click(); return true; } return false;
  });
  await page.waitForTimeout(6000);
  const after = await read();
  return {before, clicked, after};
};
