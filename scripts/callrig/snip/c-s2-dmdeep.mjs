export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T', mid='M4OX37SY7T1FVDN';
  await page.goto('about:blank'); await page.waitForTimeout(800);
  const marks=[];
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}?m=${mid}`);
  for(let i=0;i<25;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((id)=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      const loaded=document.querySelectorAll('main [data-message-id]').length;
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,40));
      if(!el) return {loaded, present:false, toasts};
      const r=el.getBoundingClientRect();
      return {loaded, present:true, top:Math.round(r.top), inView:r.top>=-4&&r.bottom<=innerHeight+4, toasts};
    }, mid));
    const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
  }
  return {waitedSec:marks.length, everPresent:marks.some(m=>m.present),
    everInView:marks.some(m=>m.inView),
    loadedProgression:[...new Set(marks.map(m=>m.loaded))],
    toasts:[...new Set(marks.flatMap(m=>m.toasts))].filter(Boolean),
    final:marks[marks.length-1]};
};
