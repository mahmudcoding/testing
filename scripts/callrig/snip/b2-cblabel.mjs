export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    const cbs=[...dlg.querySelectorAll('input[type=checkbox]')];
    return cbs.map((c,i)=>{
      const inLabel = !!c.closest('label');
      const labelFor = c.id ? !!dlg.querySelector(`label[for="${c.id}"]`) : false;
      let row=c; for(let k=0;k<5&&row.parentElement;k++){ row=row.parentElement; if((row.innerText||'').trim().length>2) break; }
      return {i, id:c.id||null, ariaLabel:c.getAttribute('aria-label'), ariaLabelledby:c.getAttribute('aria-labelledby'),
              title:c.getAttribute('title'), inLabel, labelFor, rowText:(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)};
    });
  });
};
