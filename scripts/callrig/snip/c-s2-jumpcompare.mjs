export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const OLD='M4OX0TTPGJCFW4G';   // QA-DEEP-0003, seq 3 of 398
  const NEW='M4OX0TYZFK8OC4P';   // QA-DEEP-0400, newest
  const api=(fn)=>page.evaluate(fn);
  const setPin=(mid,on)=>page.evaluate(async({ch,mid,on})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,
      {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
       body:JSON.stringify({pin:on})});
    return r.status;}, {ch,mid,on});
  const run=async(mid,label,secs)=>{
    await page.goto('about:blank'); await page.waitForTimeout(600);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(9000);
    const jb=page.locator('button[aria-label="Jump to pinned message"]').first();
    const n=await jb.count();
    if(!n) return {label, err:'no jump button'};
    const before=await page.evaluate(()=>document.querySelectorAll('main [data-message-id]').length);
    await jb.click();
    const marks=[];
    for(let i=0;i<secs;i++){
      await page.waitForTimeout(1000);
      marks.push(await page.evaluate((mid)=>{
        const el=document.querySelector(`main [data-message-id="${mid}"]`);
        const loaded=document.querySelectorAll('main [data-message-id]').length;
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,44));
        if(!el) return {loaded, present:false, toasts};
        const r=el.getBoundingClientRect();
        return {loaded, present:true, top:Math.round(r.top), inView:r.top>=-4&&r.bottom<=innerHeight+4, toasts};
      }, mid));
      const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
    }
    return {label, loadedBefore:before, waitedSec:marks.length,
      loadedProgression:[...new Set(marks.map(m=>m.loaded))],
      everPresent:marks.some(m=>m.present), everInView:marks.some(m=>m.inView),
      toasts:[...new Set(marks.flatMap(m=>m.toasts))].filter(Boolean),
      final:marks[marks.length-1]};
  };
  const out={};
  // control: pin only the newest message
  out.unpinOld1=await setPin(OLD,false);
  out.pinNew=await setPin(NEW,true);
  out.control_recentPin=await run(NEW,'recent pin',20);
  // subject: pin only the oldest
  out.unpinNew=await setPin(NEW,false);
  out.pinOld=await setPin(OLD,true);
  out.subject_oldPin=await run(OLD,'old pin (seq 3 of 398)',45);
  return out;
};
