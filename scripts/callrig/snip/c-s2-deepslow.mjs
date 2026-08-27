export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const cases=[['oldest','M4OX0TTPGJCFW4G'], ['mid-50%', process.env.QA_MID50||''],
               ['newest', process.env.QA_MIDNEW||'']].filter(c=>c[1]);
  const res=[];
  for(const [label,mid] of cases){
    await page.goto('about:blank'); await page.waitForTimeout(700);
    const t0=Date.now();
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${mid}`);
    const marks=[];
    for(let i=0;i<50;i++){                       // up to ~50s
      await page.waitForTimeout(1000);
      const s=await page.evaluate((mid)=>{
        const el=document.querySelector(`[data-message-id="${mid}"]`);
        const loaded=document.querySelectorAll('main [data-message-id]').length;
        const sc=document.querySelector('main [data-message-id]');
        const cont=sc?sc.closest('[style*="overflow"],div'):null;
        if(!el) return {loaded, present:false};
        const r=el.getBoundingClientRect();
        return {loaded, present:true, top:Math.round(r.top),
          inView:r.top>=-4&&r.bottom<=innerHeight+4};
      }, mid);
      marks.push({at:+((Date.now()-t0)/1000).toFixed(0), ...s});
      if(s.present&&s.inView&&i>=3) break;
    }
    const key=(s)=>JSON.stringify([s.loaded,s.present,s.inView]);
    const ch2=[]; let prev=null;
    for(const m of marks){ if(key(m)!==prev){ch2.push(m); prev=key(m);} }
    res.push({label, mid, waitedSec:marks[marks.length-1].at, changes:ch2.slice(0,8),
      final:marks[marks.length-1]});
  }
  return res;
};
