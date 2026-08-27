export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  // find the OLDEST message in the channel via seq pagination
  out.oldest = await page.evaluate(async(ch)=>{
    let before=null, oldest=null, pages=0;
    for(let i=0;i<12;i++){
      const u=`/api/v1/messaging/channels/${ch}/messages?limit=100`+(before?`&before_seq=${before}`:'');
      const j=await (await fetch(u,{credentials:'include'})).json();
      const ms=j.messages||j.data||j||[];
      if(!ms.length) break;
      pages++;
      const last=ms[ms.length-1];
      oldest={id:last.id, seq:last.channel_seq ?? last.seq ?? null, body:(last.body||'').slice(0,26)};
      if(oldest.seq==null) break;
      before=oldest.seq;
      if(ms.length<100) break;
    }
    return {oldest, pages};
  }, ch);
  const id=out.oldest.oldest && out.oldest.oldest.id;
  if(!id) return out;
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?m=${id}`);
  const s=[];
  for(let i=0;i<20;i++){ await page.waitForTimeout(700);
    s.push(await page.evaluate((id)=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const t=document.querySelector(`[data-message-id="${id}"]`);
      const r=t?t.getBoundingClientRect():null;
      return {present:!!t, inView: r? (r.y>-50 && r.y<window.innerHeight):null,
        rendered:document.querySelectorAll('main [data-message-id]').length,
        notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
          .map(x=>x.textContent.trim().slice(0,60)),
        banner:[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
          .map(e=>(e.textContent||'').trim())
          .filter(x=>/older|not loaded|history|couldn|could not/i.test(x)&&x.length<70)};
    }, id));
  }
  out.target=id;
  out.first=s[0]; out.last=s.at(-1);
  out.everPresent=s.some(x=>x.present);
  out.everInView=s.some(x=>x.inView);
  out.noticesSeen=[...new Set(s.flatMap(x=>x.notices))];
  out.bannersSeen=[...new Set(s.flatMap(x=>x.banner))];
  return out;
};
