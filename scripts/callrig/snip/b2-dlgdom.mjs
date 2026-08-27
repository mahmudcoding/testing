export default async ({page}) => {
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    if(!dlg) return {noDialog:true};
    const inter=[...dlg.querySelectorAll('button,input,[role=option],[role=checkbox],[role=button],li,[tabindex]:not([tabindex="-1"])')].filter(v);
    return {
      count: inter.length,
      items: inter.map(e=>({tag:e.tagName, role:e.getAttribute('role')||undefined, type:e.type||undefined,
        tid:e.getAttribute('data-testid')||undefined, al:(e.getAttribute('aria-label')||'').slice(0,34)||undefined,
        txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,34)||undefined, checked:e.checked||undefined, dis:e.disabled||undefined}))
    };
  });
};
