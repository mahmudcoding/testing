export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*= parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].pop();
    if(!dlg) return {noDialog:true};
    return {
      text:(dlg.innerText||'').replace(/\n+/g,' | ').slice(0,700),
      inputs:[...dlg.querySelectorAll('input,select,textarea')].map(i=>({type:i.type, name:i.name||undefined, value:i.value, checked:i.checked||undefined, ph:i.placeholder||undefined, tid:i.getAttribute('data-testid')||undefined, al:i.getAttribute('aria-label')||undefined, vis:v(i)})),
      buttons:[...dlg.querySelectorAll('button')].filter(v).map(b=>({t:(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,36), tid:b.getAttribute('data-testid')||undefined, press:b.getAttribute('aria-pressed')||undefined}))
    };
  });
};
