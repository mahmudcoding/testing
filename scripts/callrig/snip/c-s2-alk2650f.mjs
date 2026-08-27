export default async ({page}) => {
  const out={};
  await page.waitForTimeout(16000);
  out.afterBobPosted=await page.evaluate(()=>(window.__m||[]).map(e=>`${e.t}s: ${e.v}`));
  out.deleteAsOwner=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages',{method:'DELETE',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({message_ids:['M4OXGA9LW0Q3URF']})});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, deletedIds:j&&j.deleted_ids, key:j&&j.key};});
  await page.waitForTimeout(16000);
  out.afterDelete=await page.evaluate(()=>(window.__m||[]).map(e=>`${e.t}s: ${e.v}`));
  await page.reload(); await page.waitForTimeout(12000);
  out.afterReload=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('a[href*="/c/"]')].filter(v)
      .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)
      .map(a=>(a.getAttribute('aria-label')||a.innerText||'').replace(/\s+/g,' ').trim().slice(0,28));});
  return out;
};
