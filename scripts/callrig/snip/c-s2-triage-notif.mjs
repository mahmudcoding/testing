export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  out.apiNotif=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=5',{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
    const n=arr.find(x=>/thread reply/i.test(x.title||''));
    return n? {title:n.title, body:(n.body||'').slice(0,34),
      payload:(typeof n.payload==='string'? n.payload : JSON.stringify(n.payload||{})).slice(0,150)}:null;});
  // open the bell and click the thread-reply entry
  const bell=page.locator('button[aria-label^="Notifications"]').first();
  out.bellFound=await bell.count();
  if(!out.bellFound) return out;
  await bell.click(); await page.waitForTimeout(3000);
  out.panel=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],aside,[data-radix-popper-content-wrapper]')].filter(v)
      .sort((a,b)=>b.getBoundingClientRect().height-a.getBoundingClientRect().height)[0];
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,120):null;});
  const entry=page.locator('[role="dialog"] *, aside *, [data-radix-popper-content-wrapper] *')
    .filter({hasText:/QA-T4-NOTIF reply from other/}).last();
  out.entryFound=await entry.count();
  if(out.entryFound){
    await entry.click();
    await page.waitForTimeout(6000);
  }
  out.afterClick=await page.evaluate((p)=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const threadPanel=[...document.querySelectorAll('aside,[role="dialog"],section')].filter(v)
      .find(d=>/Replies \(/.test(d.innerText||''));
    return {url:location.pathname+location.search,
      threadPanelOpen:!!threadPanel,
      threadHeader:threadPanel? ((threadPanel.innerText||'').match(/Replies \(\d+\)/)||[''])[0]:null,
      replyVisible: !!document.querySelector('[data-message-id]') &&
        /QA-T4-NOTIF reply from other/.test(document.body.innerText||'')};}, null);
  return out;
};
