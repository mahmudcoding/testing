export default async ({page}) => {
  const read = () => page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    const ae=document.activeElement;
    const inp=[...document.querySelectorAll('[role=dialog] input[type=text],[role=dialog] input:not([type])')][0];
    return {
      active: ae?(ae.tagName+'|'+(ae.getAttribute('data-testid')||ae.getAttribute('aria-label')||ae.type||'')).slice(0,40):null,
      dialogOpen: !!dlg,
      scrollTop: dlg?dlg.scrollTop:null,
      inputAria: inp?{invalid:inp.getAttribute('aria-invalid'), describedby:inp.getAttribute('aria-describedby')}:null,
      dlgText: dlg?(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,180):null
    };
  });
  const before = await read();
  await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="calls-start-submit"]');
    if(b) b.click();
  });
  await page.waitForTimeout(2500);
  const after = await read();
  return {before, after, changed: JSON.stringify(before)!==JSON.stringify(after)};
};
