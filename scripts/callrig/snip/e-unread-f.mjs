export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/directories',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(async()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const get=n=>[...document.querySelectorAll('a[aria-label]')].filter(vis).find(e=>e.getAttribute('aria-label')===n);
    const g=get('qa-general'), p=get('qa-private');
    const r=await fetch('/api/v1/workspaces/W4QEF1XTURESO01/unread',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const gen=(j&&j.unread_counts||[]).find(c=>c.channel_id==='C4QEGENERAL0001');
    const d=el=>el?{aria:el.getAttribute('aria-label'), txt:el.innerText.replace(/\n/g,' ').trim(),
      fw:getComputedStyle(el).fontWeight, color:getComputedStyle(el).color,
      kids:[...el.children].map(c=>c.tagName).join(','), cls:(el.className||'').toString().slice(-60)}:null;
    return {apiUnread: gen?gen.unread_count:null, generalRow:d(g), privateRow:d(p),
      identical: g&&p ? (g.className.toString()===p.className.toString()) : null};
  });
};
