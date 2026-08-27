export default async ({page}) => {
  const WHO=process.env.QA_WHO||'QA Bob';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  // close any open menu first
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const opened = await page.evaluate(({v,who})=>{ const vis=eval(v);
    const list=document.querySelector('[data-testid="participants-list"]');
    if(!list) return {noList:true};
    const btns=[...list.querySelectorAll('button')].filter(vis).filter(b=>(b.getAttribute('aria-label')||'')==='Participant actions');
    const target=btns.find(b=>{ let r=b; for(let k=0;k<6&&r.parentElement;k++){ r=r.parentElement; if((r.innerText||'').includes(who)) return true; } return false; });
    if(!target) return {notFound:btns.length};
    target.click();
    return {opened:true, of:who};
  }, {v:V, who:WHO});
  await page.waitForTimeout(2500);
  const menu = await page.evaluate((v)=>{ const vis=eval(v);
    const m=[...document.querySelectorAll('[role=menu],[role=dialog]')].filter(vis).pop();
    return m?{txt:(m.innerText||'').replace(/\n+/g,' | ').slice(0,400),
      items:[...m.querySelectorAll('button,[role=menuitem]')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,36)).filter(Boolean)}:null; }, V);
  return {opened, menu};
};
