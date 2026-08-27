export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  if(!await va.count()) return {err:'no View all'};
  await va.click(); await page.waitForTimeout(2600);
  out.panel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(v)
      .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
    if(!d) return 'none';
    return {head:(d.innerText||'').replace(/\s+/g,' ').slice(0,70),
      inputs:[...d.querySelectorAll('input')].filter(v).map(e=>e.placeholder||e.getAttribute('aria-label')),
      btns:[...d.querySelectorAll('button,[role="button"]')].filter(v)
        .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,30), al:e.getAttribute('aria-label')}))};});
  // click the entry (the button that is neither Close nor Unpin)
  const dlg=page.locator('[role="dialog"]').filter({hasText:'Pinned messages'}).first();
  const entry=dlg.locator('button[aria-label="Jump to pinned message"]').first();
  out.entryCount=await entry.count();
  if(out.entryCount){
    out.entryText=(await entry.innerText()).replace(/\s+/g,' ').slice(0,40);
    out.dialogGoneAfter=null;
    await entry.click();
    const marks=[];
    for(let i=0;i<20;i++){
      await page.waitForTimeout(1000);
      marks.push(await page.evaluate((mid)=>{
        const el=document.querySelector(`main [data-message-id="${mid}"]`);
        return {loaded:document.querySelectorAll('main [data-message-id]').length,
          present:!!el, inView: el? (()=>{const r=el.getBoundingClientRect();
            return r.top>=-4&&r.bottom<=innerHeight+4;})() : false};}, mid));
      const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
    }
    out.jump={waited:marks.length, loaded:[...new Set(marks.map(m=>m.loaded))],
      everPresent:marks.some(m=>m.present), everInView:marks.some(m=>m.inView)};
  }
  return out;
};
