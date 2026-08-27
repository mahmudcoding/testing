export default async ({page}) => {
  const IDX=Number(process.env.QA_IDX ?? 1);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  const opened = await page.evaluate(({v,idx})=>{ const vis=eval(v);
    const list=document.querySelector('[data-testid="participants-list"]');
    const btns=[...list.querySelectorAll('button')].filter(vis).filter(b=>(b.getAttribute('aria-label')||'')==='Participant actions');
    if(!btns[idx]) return {noBtn:btns.length};
    let r=btns[idx], txt=''; for(let k=0;k<6&&r.parentElement;k++){ r=r.parentElement; const t=(r.innerText||'').replace(/\s+/g,' ').trim(); if(t.length>2){ txt=t.slice(0,50); break; } }
    btns[idx].click(); return {idx, row:txt};
  }, {v:V, idx:IDX});
  await page.waitForTimeout(2500);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const ms=[...document.querySelectorAll('[role=menu],[role=dialog]')].filter(vis);
    const m=ms[ms.length-1];
    return m?{txt:(m.innerText||'').replace(/\n+/g,' | ').slice(0,400),
      items:[...m.querySelectorAll('button,[role=menuitem]')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean)}:null; }, V);
  return {opened, menu};
};
