export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OX37SVWDRD28T';
  const look=()=>page.evaluate(async({ws,dm})=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const links=[...document.querySelectorAll('nav a, aside a')].filter(v);
    const entry=links.find(a=>(a.getAttribute('href')||'').includes(dm));
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const u=(j.unread_counts||[]).find(c=>c.channel_id===dm)||{};
    return {sidebar: entry? (entry.innerText||'').replace(/\s+/g,' ').slice(0,32):'absent',
      apiUnread:u.unread_count, apiLastMsg:u.last_message_seq, apiLastRead:u.last_read_seq};},{ws,dm});
  const t0=Date.now(); const series=[];
  while(Date.now()-t0 < 70000){
    series.push({at:+((Date.now()-t0)/1000).toFixed(0), ...await look()});
    await page.waitForTimeout(2500);
  }
  const k=(s)=>JSON.stringify([s.sidebar,s.apiUnread,s.apiLastMsg]);
  const ch=[]; let p=null; for(const s of series){ if(k(s)!==p){ch.push(s);p=k(s);} }
  return {samples:series.length, changes:ch, final:series[series.length-1]};
};
