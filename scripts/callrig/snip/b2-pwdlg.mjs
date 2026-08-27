export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{ const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value==='password'); if(r) r.click(); });
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(v).pop();
    return {text:(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,600),
      inputs:[...dlg.querySelectorAll('input,textarea')].filter(v).map(i=>({type:i.type, val:(i.value||'').slice(0,30), ph:i.placeholder, al:i.getAttribute('aria-label'), tid:i.getAttribute('data-testid')})),
      btns:[...dlg.querySelectorAll('button')].filter(v).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), dis:b.disabled||undefined}))};
  });
};
