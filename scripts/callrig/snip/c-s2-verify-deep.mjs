export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  // walk to the oldest message of this channel
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.oldest=await page.evaluate(async(ch)=>{
    let before=null, oldest=null, pages=0;
    for(let p=0;p<10;p++){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||[]; if(!arr.length) break;
      pages++;
      for(const m of arr) if(!oldest||m.channel_seq<oldest.channel_seq) oldest=m;
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    return oldest? {id:oldest.id, seq:oldest.channel_seq, pagesWalked:pages}:null;}, ch);
  if(!out.oldest) return out;
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${out.oldest.id}`);
  const marks=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((id)=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return {loaded:document.querySelectorAll('main [data-message-id]').length, present:!!el,
        toasts:[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v).length};}, out.oldest.id));
    const l=marks[marks.length-1]; if(l.present) break;
  }
  const f=marks[marks.length-1];
  out.deepLink={waitedSec:marks.length, everPresent:marks.some(m=>m.present),
    loadedProgression:[...new Set(marks.map(m=>m.loaded))], toastsSeen:marks.some(m=>m.toasts>0), final:f};
  out.PASS = !out.deepLink.everPresent && !out.deepLink.toastsSeen;
  return out;
};
