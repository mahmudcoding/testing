export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  return page.evaluate(async ()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const chans=[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));
    const dms=[...document.querySelectorAll('a[href*="/d/"]')].filter(v)
      .map(a=>(a.getAttribute('aria-label')||'').slice(0,24));
    const nav=[...new Set([...document.querySelectorAll('a,button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/^(Chat|Calls|Calendar|Files|Directories|Mentions|Saved Messages|Add channel|New direct message)$/.test(t)))];
    const perm=await fetch('/api/v1/channels/C4QCGENERAL0001/permissions/available',{credentials:'include'});
    return {composer:!!c, composerEditable:c?c.getAttribute('contenteditable'):null,
      msgs:document.querySelectorAll('main [data-message-id]').length,
      channels:[...new Set(chans)], dms:[...new Set(dms)].slice(0,5), topNav:nav,
      permissionsEndpoint:perm.status,
      mainTail:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(-70)};});
};
