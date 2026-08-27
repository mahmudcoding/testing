export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/directories',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const links=[...document.querySelectorAll('a[aria-label],button[aria-label]')].filter(vis)
      .map(e=>e.getAttribute('aria-label')).filter(t=>/qa-|unread/i.test(t));
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/unread',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const gen=(j&&j.unread_counts||[]).find(c=>c.channel_id==='C4QEGENERAL0001');
    const row=[...document.querySelectorAll('a[aria-label]')].filter(vis).find(e=>/qa-general/.test(e.getAttribute('aria-label')));
    return {apiUnread:gen?gen.unread_count:null, sidebarLabels:links,
      generalFull: row? {aria:row.getAttribute('aria-label'), txt:row.innerText.replace(/\n/g,' ').trim(),
        fw:getComputedStyle(row).fontWeight, kids:[...row.children].map(c=>c.tagName).join(',')}:null};
  });
};
