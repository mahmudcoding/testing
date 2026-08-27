export default async ({page}) => {
  const WHO=process.env.QA_WHO||'QA Bob';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const picked = await page.evaluate(({v,who})=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const cbs=[...dlg.querySelectorAll('input[type=checkbox]')];
    const target=cbs.find(c=>{ let r=c; for(let k=0;k<5&&r.parentElement;k++){ r=r.parentElement; if((r.innerText||'').trim().length>2) break; } return (r.innerText||'').trim().startsWith(who); });
    if(!target) return {notFound:true};
    if(!target.checked) target.click();
    return {checked:target.checked};
  }, {v:V, who:WHO});
  await page.waitForTimeout(1000);
  const saved = await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const b=[...dlg.querySelectorAll('button')].filter(vis).find(x=>/^save$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(5000);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const main=document.querySelector('main')||document.body;
    return {text:(main.innerText||'').replace(/\n+/g,' | ').slice(0,300),
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)).filter(Boolean))]}; }, V);
  return {picked, saved, after};
};
