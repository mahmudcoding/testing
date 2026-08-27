export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const setup=await page.evaluate(async(ch)=>{
    const post=async(body,parent)=>{
      const b={channel_id:ch, body, idempotency_key:'qdp-'+Math.random().toString(36).slice(2)};
      if(parent) b.thread_parent_id=parent;
      const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify(b)});
      return r.ok? (await r.json()).id : null;};
    const p=await post('QA-V3-DP parent');
    const rep=await post('QA-V3-DP reply', p);
    const chan=await post('QA-V3-DP channel');
    return {parent:p, reply:rep, chanMsg:chan};}, ch);
  out.setup=setup;
  await page.waitForTimeout(3500);
  // open the thread panel and leave it open
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${setup.parent}`);
  await page.waitForTimeout(11000);
  const snap=()=>page.evaluate(({rep,chan})=>{
    const r=document.querySelector(`[data-message-id="${rep}"]`);
    const c=document.querySelector(`main [data-message-id="${chan}"]`);
    const v=(e)=>{const r2=e.getBoundingClientRect();return r2.width>3&&r2.height>3;};
    const panel=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .find(d=>/Replies \(/.test(d.innerText||''));
    const hdr=panel? ((panel.innerText||'').match(/Replies \(\d+\)/)||[''])[0]:null;
    return {replyText: r? (r.innerText||'').replace(/\s+/g,' ').slice(-30):'(absent)',
      replySaysDeleted: r? /was deleted/i.test(r.innerText||''):null,
      chanSaysDeleted: c? /was deleted/i.test(c.innerText||''):null,
      header:hdr};},{rep:setup.reply, chan:setup.chanMsg});
  out.before=await snap();
  // delete BOTH in one request, from this same page, panel still open
  out.delete=await page.evaluate(async({ch,rep,chan})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages`,{method:'DELETE',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({message_ids:[rep,chan]})});
    return {status:r.status, body:(await r.text()).slice(0,110)};},{ch,rep:setup.reply,chan:setup.chanMsg});
  const series=[];
  for(let i=0;i<22;i++){ await page.waitForTimeout(1500); series.push({at:((i+1)*1.5).toFixed(1), ...await snap()}); }
  const k=(s)=>JSON.stringify([s.replySaysDeleted,s.chanSaysDeleted,s.header]);
  const c=[]; let p=null; for(const s of series){ if(k(s)!==p){c.push(s);p=k(s);} }
  out.timeline=c.slice(0,5); out.final=series[series.length-1];
  await page.reload(); await page.waitForTimeout(10000);
  out.afterReload=await snap();
  out.PASS = out.final.replySaysDeleted===false && out.final.chanSaysDeleted===true
             && out.afterReload.replySaysDeleted===true;
  return out;
};
