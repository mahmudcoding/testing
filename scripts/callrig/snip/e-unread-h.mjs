export default async ({page}) => {
  // alice's page is loaded and currently shows "qa-general, 1 unread messages".
  // bob just posted a 2nd message. Do NOT reload — watch the live label.
  const samples=[];
  for(let i=0;i<12;i++){
    await page.waitForTimeout(1000);
    samples.push(await page.evaluate(async()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const row=[...document.querySelectorAll('a[aria-label]')].filter(vis).find(e=>/qa-general/.test(e.getAttribute('aria-label')));
      const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/unread',{credentials:'include'});
      const j=await r.json().catch(()=>null);
      const gen=(j&&j.unread_counts||[]).find(c=>c.channel_id==='C4QEGENERAL0001');
      return {aria:row?row.getAttribute('aria-label'):null, api:gen?gen.unread_count:null};
    }));
  }
  return {ariaTrace:[...new Set(samples.map(s=>s.aria))], apiTrace:samples.map(s=>s.api).join(','),
    first:samples[0], last:samples[samples.length-1]};
};
