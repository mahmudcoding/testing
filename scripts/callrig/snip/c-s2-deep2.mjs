export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', old='M4OX0TTPGJCFW4G';
  const out={};
  const newest=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||j;
    const m=Array.isArray(a)?a[a.length-1]:null;
    return m?{id:m.id, body:(m.body||'').slice(0,20)}:null;}, ch);
  out.newest=newest;
  const probe=async(mid,label,sec)=>{
    await page.goto('about:blank'); await page.waitForTimeout(700);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${mid}`);
    let last=null;
    for(let i=0;i<sec;i++){
      await page.waitForTimeout(1000);
      last=await page.evaluate((mid)=>{
        const el=document.querySelector(`main [data-message-id="${mid}"]`);
        const loaded=document.querySelectorAll('main [data-message-id]').length;
        const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
        const toasts=[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')]
          .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,40));
        if(!el) return {loaded, present:false, toasts};
        const r=el.getBoundingClientRect();
        return {loaded, present:true, top:Math.round(r.top),
          inView:r.top>=-4&&r.bottom<=innerHeight+4, toasts};
      }, mid);
      if(last.present&&last.inView&&i>=2) break;
    }
    out[label]={sec:1, ...last, waited:sec};
    out[label].sec=undefined;
  };
  if(newest) await probe(newest.id,'newestSeq398',12);
  await probe(old,'oldSeq3',22);
  return out;
};
