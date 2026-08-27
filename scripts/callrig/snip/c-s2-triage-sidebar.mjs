export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001', deep='C4OX0TTLIMVOUBH';
  const out={};
  const order=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const links=[...document.querySelectorAll('nav a, aside a')].filter(v)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''));
    return links.map(a=>({t:(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,28),
      y:Math.round(a.getBoundingClientRect().top)}));});
  // start in a different channel so #qa-general carries unread
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(9000);
  out.beforeUnread=await order();
  // second account posts (via this page's API as another user is not possible;
  // instead rely on the idle messages already unread) — measure unread first
  out.unread=await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.unread_counts||[]).filter(c=>c.unread_count>0)
      .map(c=>({ch:c.channel_id.slice(-6), n:c.unread_count}));}, ws);
  out.withUnread=await order();
  // now read #qa-general
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(10000);
  out.afterReading=await order();
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${deep}`);
  await page.waitForTimeout(7000);
  out.afterLeaving=await order();
  const names=(o)=>o.map(x=>x.t.replace(/\s+\d+$/,''));
  out.orderChanged = JSON.stringify(names(out.withUnread))!==JSON.stringify(names(out.afterReading));
  return out;
};
