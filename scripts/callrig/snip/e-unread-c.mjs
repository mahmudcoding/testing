export default async ({page}) => {
  // alice is already on /directories from the baseline snippet — do NOT reload,
  // so this measures the live badge, not a fresh fetch
  const samples=[];
  const snap=()=>page.evaluate(async()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const row=[...document.querySelectorAll('a,button')].filter(vis)
      .find(e=>/qa-general/.test((e.getAttribute('aria-label')||e.innerText||'')));
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/unread',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const gen=(j&&j.unread_counts||[]).find(c=>c.channel_id==='C4QEGENERAL0001');
    return {label: row? (row.getAttribute('aria-label')||row.innerText||'').replace(/\n/g,' ').trim().slice(0,50):null,
      apiUnread: gen? gen.unread_count : null};
  });
  for(let i=0;i<10;i++){ await page.waitForTimeout(1000); samples.push(await snap()); }
  return {first:samples[0], last:samples[samples.length-1],
    labelTrace:[...new Set(samples.map(s=>s.label))], apiTrace:samples.map(s=>s.apiUnread).join(',')};
};
