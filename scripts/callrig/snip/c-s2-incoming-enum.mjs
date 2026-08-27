export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  const seen=[];
  const t0=Date.now();
  while(Date.now()-t0 < 75000){
    const s=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const btns=[...document.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')||(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20))
        .filter(Boolean);
      const dlg=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
        .map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,70));
      return {btns, dlg, url:location.pathname.slice(-22)};});
    const key=JSON.stringify([s.dlg, s.url]);
    if(!seen.some(x=>x.key===key)) seen.push({key, at:Math.round((Date.now()-t0)/1000), ...s});
    if(s.dlg.some(d=>/incoming|calling|is calling/i.test(d))) break;
    await page.waitForTimeout(800);
  }
  return seen.slice(-4).map(s=>({at:s.at, url:s.url, dialogs:s.dlg,
    callish:s.btns.filter(b=>/accept|join|answer|decline|call/i.test(b))}));
};
