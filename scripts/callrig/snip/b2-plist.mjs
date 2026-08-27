export default async ({page}) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const list=document.querySelector('[data-testid="participants-list"]');
    if(!list) return {noList:true};
    const btns=[...list.querySelectorAll('button')].filter(v).filter(b=>(b.getAttribute('aria-label')||'')==='Participant actions');
    return {n:btns.length, rows: btns.map((b,i)=>{
      let r=b, txt='';
      for(let k=0;k<6&&r.parentElement;k++){ r=r.parentElement; const t=(r.innerText||'').replace(/\s+/g,' ').trim(); if(t.length>2){ txt=t.slice(0,60); break; } }
      const rect=b.getBoundingClientRect();
      return {i, rowText:txt, y:Math.round(rect.y)};
    })};
  });
};
