export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', mid='M4OX0TTPGJCFW4G';
  const out={};
  const poll=async(n)=>{
    const marks=[];
    for(let i=0;i<n;i++){
      await page.waitForTimeout(1000);
      marks.push(await page.evaluate((mid)=>{
        const el=document.querySelector(`main [data-message-id="${mid}"]`);
        const loaded=document.querySelectorAll('main [data-message-id]').length;
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const toasts=[...document.querySelectorAll('[data-sonner-toast]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,44));
        if(!el) return {loaded, present:false, toasts};
        const r=el.getBoundingClientRect();
        return {loaded, present:true, top:Math.round(r.top),
          inView:r.top>=-4&&r.bottom<=innerHeight+4, toasts};
      }, mid));
      const l=marks[marks.length-1];
      if(l.present&&l.inView&&i>=2) break;
    }
    return {waitedSec:marks.length, everPresent:marks.some(m=>m.present),
      everInView:marks.some(m=>m.inView), toasts:[...new Set(marks.flatMap(m=>m.toasts))],
      final:marks[marks.length-1]};
  };
  // path 1: the banner's own "Jump to pinned message"
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const jb=page.locator('button[aria-label="Jump to pinned message"]').first();
  out.bannerBtn=await jb.count();
  if(out.bannerBtn){ await jb.click(); out.viaBanner=await poll(18); }
  // path 2: the entry inside the pinned panel
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const va=page.locator('main button, main [role="button"]').filter({hasText:/View all/i}).first();
  if(await va.count()){
    await va.click(); await page.waitForTimeout(2500);
    const entry=page.locator('[role="dialog"] button, aside button')
      .filter({hasText:/QA-DEEP-0003/}).first();
    out.panelEntry=await entry.count();
    if(out.panelEntry){ await entry.click(); out.viaPanel=await poll(18); }
  }
  return out;
};
