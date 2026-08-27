export default async ({page}) => {
  const out={};
  out.rowControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...new Set([...document.querySelectorAll('button,[role="menuitem"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30)))];});
  // hover the beta row to reveal row actions
  const row=page.locator('div,li').filter({hasText:'QA-PINTAB-beta'}).last();
  try { await row.hover({timeout:5000}); out.hover='ok'; } catch(e){ out.hover='FAIL'; }
  await page.waitForTimeout(2000);
  out.afterHover=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...new Set([...document.querySelectorAll('button,[role="menuitem"]')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,30)))];});
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&/pin/i.test(u)) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,52));};
  page.on('request',onReq);
  const unpin=page.locator('button').filter({hasText:/unpin/i}).first();
  out.unpinCount=await unpin.count();
  if(out.unpinCount){ await unpin.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(5000); }
  page.off('request',onReq);
  out.requests=reqs.slice(0,4);
  out.after=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages/pinned',{credentials:'include'});
    const j=await r.json();
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    return {serverTotal:j&&j.total,
      tab:[...document.querySelectorAll('button[aria-selected="true"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)).join(',')};});
  return out;
};
