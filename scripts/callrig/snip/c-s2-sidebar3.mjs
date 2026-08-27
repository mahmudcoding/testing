export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001', deep='C4OX0TTLIMVOUBH';
  const out={};
  const order=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('nav a, aside a')].filter(v)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''))
      .map(a=>(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,20));});
  const unreadFor=(ch)=>page.evaluate(async({ws,ch})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const u=(j.unread_counts||[]).find(c=>c.channel_id===ch);
    return u? u.unread_count : 0;},{ws,ch});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(10000);
  out.channelCount=(await order()).length;
  out.unreadBefore=await unreadFor(gen);
  out.orderWhileUnread=await order();
  if(!out.unreadBefore){ out.note='no unread in #qa-general — not exercised'; return out; }
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(11000);
  out.unreadAfter=await unreadFor(gen);
  out.orderWhileReading=await order();
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(8000);
  out.orderAfter=await order();
  const nm=(o)=>o.map(x=>x.replace(/\s+\d+$/,''));
  out.moved = JSON.stringify(nm(out.orderWhileUnread))!==JSON.stringify(nm(out.orderAfter));
  out.posBefore = nm(out.orderWhileUnread).indexOf('qa-general');
  out.posAfter  = nm(out.orderAfter).indexOf('qa-general');
  return out;
};
