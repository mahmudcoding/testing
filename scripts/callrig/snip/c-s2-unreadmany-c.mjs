export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001';
  const out={};
  // read unread BEFORE opening the channel
  out.beforeOpen=await page.evaluate(async({ws,gen})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.unread_counts||[]).find(c=>c.channel_id===gen)||{note:'absent'};
  },{ws,gen});
  // sidebar badge before opening
  out.sidebarBadge=await page.evaluate(()=>{
    const a=[...document.querySelectorAll('nav a, aside a')].find(x=>/qa-general/.test(x.innerText||''));
    return a? (a.innerText||'').replace(/\s+/g,' ').slice(0,40) : 'no sidebar entry';});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${gen}`);
  await page.waitForTimeout(9000);
  out.divider=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const main=document.querySelector('main');
    // find a visible leaf whose text is exactly the divider label
    const leaves=[...main.querySelectorAll('*')].filter(e=>e.children.length===0 && v(e));
    const d=leaves.find(e=>/^(New|New messages|Unread)$/i.test((e.textContent||'').trim()));
    const msgs=[...main.querySelectorAll('[data-message-id]')];
    const num=(e)=>{const m=(e.innerText||'').match(/QA-S2-UNREAD-(\d{2})/); return m?+m[1]:null;};
    if(!d) return {found:false, loaded:msgs.length,
      unreadOnScreen:msgs.map(num).filter(n=>n!==null).slice(0,3)};
    const dr=d.getBoundingClientRect();
    // which message sits immediately below the divider
    const below=msgs.filter(m=>m.getBoundingClientRect().top>=dr.top)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
    const above=msgs.filter(m=>m.getBoundingClientRect().bottom<=dr.top)
      .sort((a,b)=>b.getBoundingClientRect().top-a.getBoundingClientRect().top)[0];
    return {found:true, label:(d.textContent||'').trim(),
      y:Math.round(dr.top), inView: dr.top>=0 && dr.bottom<=innerHeight,
      firstBelow: below? (below.innerText||'').replace(/\s+/g,' ').slice(-22):null,
      lastAbove: above? (above.innerText||'').replace(/\s+/g,' ').slice(-22):null,
      loaded: msgs.length};});
  await page.waitForTimeout(3000);
  out.afterOpen=await page.evaluate(async({ws,gen})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return (j.unread_counts||[]).find(c=>c.channel_id===gen)||{note:'absent'};
  },{ws,gen});
  return out;
};
