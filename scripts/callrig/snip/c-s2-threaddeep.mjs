export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH', parent='M4OX2S2JDLOFCMP';
  const out={};
  // find the id of reply #001 (the oldest in a 140-reply thread)
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  out.target=await page.evaluate(async(parent)=>{
    let before=null;
    for(let p=0;p<3;p++){
      const u=`/api/v1/messaging/messages/${parent}/thread?limit=100`+(before?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) return {err:r.status};
      const j=await r.json(); const reps=j.replies||[];
      const hit=reps.find(m=>/QA-S2-BT2-001/.test(m.body||''));
      if(hit) return {id:hit.id, seq:hit.channel_seq, body:hit.body.slice(0,18), page:p+1};
      if(!reps.length) break;
      before=Math.min(...reps.map(m=>m.channel_seq));
    }
    return {err:'reply 001 not found in thread pages'};}, parent);
  if(!out.target.id) return out;
  await page.goto('about:blank'); await page.waitForTimeout(700);
  const t0=Date.now();
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${out.target.id}&thread=${parent}`);
  const marks=[];
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    marks.push(await page.evaluate((id)=>{
      const el=document.querySelector(`[data-message-id="${id}"]`);
      const all=document.querySelectorAll('[data-message-id]').length;
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const panel=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
        .find(d=>/Replies \(/.test(d.innerText||''));
      if(!el) return {all, present:false, panel:!!panel};
      const r=el.getBoundingClientRect();
      return {all, present:true, panel:!!panel, top:Math.round(r.top),
        inView:r.top>=-4&&r.bottom<=innerHeight+4};}, out.target.id));
    const l=marks[marks.length-1]; if(l.present&&l.inView&&i>=2) break;
  }
  out.result={waitedSec:marks.length, everPresent:marks.some(m=>m.present),
    everInView:marks.some(m=>m.inView), panelOpened:marks.some(m=>m.panel),
    final:marks[marks.length-1], secs:+((Date.now()-t0)/1000).toFixed(1)};
  return out;
};
