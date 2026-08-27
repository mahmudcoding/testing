export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // find the message with the most replies across my channels
  out.scan=await page.evaluate(async(ws)=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    const chans=(j.channels||j.data||j||[]);
    const best=[];
    for(const c of chans){
      const m=await (await fetch(`/api/v1/messaging/channels/${c.id}/messages?limit=100`,{credentials:'include'})).json();
      const ms=m.messages||m.data||m||[];
      for(const x of ms) if((x.reply_count||0)>3) best.push({ch:c.id, name:c.name, id:x.id, replies:x.reply_count});
    }
    best.sort((a,b)=>b.replies-a.replies);
    return best.slice(0,4);}, ws);
  if(!out.scan.length) return out;
  const t=out.scan[0];
  out.target=t;
  const t0=Date.now();
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${t.ch}?thread=${t.id}`);
  const s=[];
  for(let i=0;i<18;i++){ await page.waitForTimeout(800);
    s.push(await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const head=[...document.querySelectorAll('*')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>/^Replies \(/.test(t))[0]||null;
      return {head, rendered:[...document.querySelectorAll('[data-message-id]')]
        .filter(e=>e.getBoundingClientRect().x>900).length};}));
  }
  out.loadMs=Date.now()-t0;
  out.settle=s.map(x=>x.rendered);
  out.head=s.at(-1).head;
  // scroll the thread panel up and see whether more load
  out.afterScroll=await page.evaluate(async()=>{
    const sc=[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().x>900)
      .filter(e=>e.scrollHeight>e.clientHeight+60)[0];
    if(!sc) return 'no scroller in panel';
    const before=sc.scrollTop;
    sc.scrollTop=0;
    await new Promise(r=>setTimeout(r,3000));
    return {before, after:sc.scrollTop, scrollHeight:sc.scrollHeight,
      rendered:[...document.querySelectorAll('[data-message-id]')].filter(e=>e.getBoundingClientRect().x>900).length};});
  await page.waitForTimeout(3000);
  out.finalRendered=await page.evaluate(()=>[...document.querySelectorAll('[data-message-id]')]
    .filter(e=>e.getBoundingClientRect().x>900).length);
  return out;
};
