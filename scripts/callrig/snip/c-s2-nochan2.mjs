export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  // 1. explicit chat route
  await page.goto(`https://airion-cargo.store/w/${ws}/c`);
  await page.waitForTimeout(9000);
  out.chatRoute=await page.evaluate(()=>{
    const main=document.querySelector('main');
    return {url:location.pathname.slice(0,34),
      text:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(0,110)};});
  // 2. directories -> channels tab
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=channels`);
  await page.waitForTimeout(10000);
  out.channelsTab=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const joins=[...document.querySelectorAll('button')].filter(v)
      .filter(b=>/^join$/i.test((b.innerText||'').trim())).length;
    return {rows:(main?(main.innerText||''):'').replace(/\s+/g,' ').trim().slice(0,180),
      joinButtons:joins};});
  // 3. actually join one
  if(out.channelsTab.joinButtons){
    const reqs=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
      reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
    page.on('request',onReq);
    await page.locator('button').filter({hasText:/^Join$/}).first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(8000);
    page.off('request',onReq);
    out.joinRequests=reqs.slice(0,3);
    out.afterJoin=await page.evaluate(async ()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const r=await fetch('/api/v1/workspaces/W4QCF1XTURESO01/channels',{credentials:'include'});
      const j=await r.json(); const a=(j&&(j.channels||j.items))||[];
      return {channelsNow:Array.isArray(a)?a.length:null,
        sidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(v).length};});
  }
  return out;
};
