export default async ({page}) => {
  const label=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/Notifications/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):'gone';});
  const out={before:await label()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true);});
  await page.locator('button').filter({hasText:/^Mark all as read$/}).first().click({timeout:6000}).catch(e=>{out.err=String(e.message).slice(0,40);});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.landed=await page.evaluate(()=>window.__c);
  out.requests=reqs.slice(0,3);
  out.afterClick=await label();
  await page.reload(); await page.waitForTimeout(11000);
  out.afterReload=await label();
  out.apiUnread=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
    const list=Array.isArray(a)?a:[];
    return {total:list.length, unread:list.filter(n=>n.read===false||n.is_read===false||n.read_at===null).length};});
  return out;
};
