export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXDIT33034G6M';
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  let click='no';
  try { await page.locator('[role="dialog"] button, [role="alertdialog"] button')
          .filter({hasText:/^Delete channel$/}).first().click({timeout:6000}); click='ok'; }
  catch(e){ click='FAIL '+String(e.message).split('\n')[0].slice(0,40); }
  await page.waitForTimeout(8000);
  page.off('request',onReq);
  const out={click, requests:reqs.slice(0,5)};
  out.afterDelete=await page.evaluate(async (ch)=>{
    const v=(e)=>{const b=e.getBoundingClientRect();return b.width>3&&b.height>3;};
    const msg=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=2`,{credentials:'include'});
    let mj=null; try{mj=await msg.json()}catch{}
    const det=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    let dj=null; try{dj=await det.json()}catch{}
    return {messagesStatus:msg.status, messagesKey:mj&&mj.key,
      messagesReturned:mj&&mj.messages?mj.messages.length:null,
      channelStatus:det.status, channelKey:dj&&dj.key,
      inSidebar:[...document.querySelectorAll('a[href*="/c/"]')].filter(v)
        .some(a=>(a.getAttribute('href')||'').includes(ch)),
      url:location.pathname.slice(0,44)};}, ch);
  // user path: deep link to the deleted channel
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  out.deepLink=await page.evaluate(()=>{
    const main=document.querySelector('main');
    return {mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,120):'NO-MAIN',
      composer:!!document.querySelector('div[contenteditable][aria-label="Compose message"]'),
      messages:document.querySelectorAll('main [data-message-id]').length};});
  return out;
};
