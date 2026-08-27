export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.banner=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const b=[...document.querySelectorAll('main *')].filter(v)
      .filter(e=>/pinned/i.test(e.innerText||'')&&e.children.length<8);
    const t=b[0];
    return t?{text:(t.innerText||'').replace(/\s+/g,' ').slice(0,80),
      clipped: t.scrollWidth>t.clientWidth+1,
      w:Math.round(t.getBoundingClientRect().width)}:{none:true};});
  out.pinnedTabLabel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('button,[role="tab"]')].filter(v)
      .map(e=>(e.textContent||'').trim()).filter(t=>/^Pinned/i.test(t)).slice(0,3);});
  out.pageOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
  // unpin everything
  out.cleanup=await page.evaluate(async (ch)=>{
    const g=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const gj=await g.json().catch(()=>null);
    const arr=Array.isArray(gj)?gj:(gj?.messages||gj?.data||[]);
    let done=0;
    for(const m of arr){
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages/${m.id}/pin`,
        {method:'POST',credentials:'include',headers:{'content-type':'application/json'},
         body:JSON.stringify({pin:false})});
      if(r.ok) done++;
    }
    const g2=await fetch(`/api/v1/messaging/channels/${ch}/messages/pinned`,{credentials:'include'});
    const j2=await g2.json().catch(()=>null);
    const a2=Array.isArray(j2)?j2:(j2?.messages||j2?.data||[]);
    return {unpinned:done, remaining:a2.length};
  }, ch);
  return out;
};
