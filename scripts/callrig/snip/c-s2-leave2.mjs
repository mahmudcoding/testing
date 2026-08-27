export default async ({page}) => {
  const ch='C4OXDIT33034G6M';
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  let click='no';
  try { await page.locator('[role="dialog"] button').filter({hasText:/^Leave$/}).first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  const after=await page.evaluate(async (ch)=>{
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {readStatus:r.status, key:j&&j.key,
      inSidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .some(a=>(a.getAttribute('href')||'').includes(ch)),
      url:location.pathname.slice(0,40),
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,50)).filter(Boolean)};}, ch);
  return {click, requests:reqs.slice(0,4), ...after};
};
