export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001', deep='C4OX0TTLIMVOUBH';
  const out={};
  const order=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('nav a, aside a')].filter(v)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''))
      .map(a=>({t:(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
        y:Math.round(a.getBoundingClientRect().top)}));});
  const unreadFor=(ch)=>page.evaluate(async({ws,ch})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const u=(j.unread_counts||[]).find(c=>c.channel_id===ch);
    return u? u.unread_count : null;},{ws,ch});
  // sit in a different channel so #qa-general accumulates unread
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(9000);
  out.unreadBefore=await unreadFor(gen);
  out.orderWhileUnread=await order();
  if(!out.unreadBefore){ out.note='#qa-general has no unread — test not exercised'; return out; }
  // read it
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(11000);
  out.unreadAfter=await unreadFor(gen);
  out.orderWhileReading=await order();
  // and come back out
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(8000);
  out.orderAfter=await order();
  const nm=(o)=>o.map(x=>x.t.replace(/\s+\d+$/,''));
  out.movedWhileReading = JSON.stringify(nm(out.orderWhileUnread))!==JSON.stringify(nm(out.orderWhileReading));
  out.movedAfter = JSON.stringify(nm(out.orderWhileUnread))!==JSON.stringify(nm(out.orderAfter));
  return out;
};
