export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  // collect id+seq for the whole channel by walking before_seq
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  const all=await page.evaluate(async ({ch})=>{
    const out=[]; let before=null;
    for(let p=0;p<6;p++){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before!==null?`&before_seq=${before}`:'');
      const r=await fetch(u,{credentials:'include'}); if(!r.ok) break;
      const j=await r.json(); const arr=j.messages||j.items||j.data||[];
      if(!arr.length) break;
      for(const m of arr) out.push({id:m.id, seq:m.channel_seq, b:(m.body||'').slice(0,14)});
      const min=Math.min(...arr.map(m=>m.channel_seq));
      if(before!==null && min>=before) break;
      before=min;
    }
    out.sort((a,b)=>a.seq-b.seq);
    return out;
  }, {ch});
  const pick=(frac)=>all[Math.max(0,Math.min(all.length-1,Math.round(frac*(all.length-1))))];
  const targets=[['newest',pick(1)],['~75%',pick(0.75)],['~50%',pick(0.5)],
                 ['~25%',pick(0.25)],['oldest',pick(0)]];
  const res=[];
  for(const [label,m] of targets){
    if(!m) continue;
    await page.goto('about:blank'); await page.waitForTimeout(700);
    const t0=Date.now();
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${m.id}`);
    let fin=null;
    for(let i=0;i<20;i++){
      await page.waitForTimeout(900);
      fin=await page.evaluate((mid)=>{
        const el=document.querySelector(`[data-message-id="${mid}"]`);
        const loaded=document.querySelectorAll('main [data-message-id]').length;
        const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;};
        const banners=[...document.querySelectorAll('[data-sonner-toast],[role="alert"]')]
          .filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50));
        if(!el) return {loaded, present:false, banners};
        const r=el.getBoundingClientRect();
        return {loaded, present:true, top:Math.round(r.top), vh:innerHeight,
          inView:r.top>=-4&&r.bottom<=innerHeight+4, bg:getComputedStyle(el).backgroundColor, banners};
      }, m.id);
      if(fin.present && fin.inView && i>=3) break;
    }
    res.push({label, seq:m.seq, body:m.b, secs:+((Date.now()-t0)/1000).toFixed(1), ...fin});
  }
  return {total:all.length, seqRange:[all[0]&&all[0].seq, all[all.length-1]&&all[all.length-1].seq], res};
};
