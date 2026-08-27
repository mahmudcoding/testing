export default async ({page}) => {
  const out={};
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,140));
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/^Until turned off$/}).first().click({timeout:6000}).catch(()=>{out.pickFail=true});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.requestsOnMute=reqs.slice(0,4);
  out.localStorageAfterMute=await ls();
  out.serverSide=await page.evaluate(async ()=>{
    const ch='C4QCPRIVATE0001';
    const a=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    let aj=null; try{aj=await a.json()}catch{}
    return {channelStatus:a.status,
      muteFields:aj?Object.keys(aj).filter(k=>/mute|notif/i.test(k)):[],
      allKeys:aj?Object.keys(aj).slice(0,14):null};});
  out.buttonNow=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):'gone';});
  // restore: unmute
  await page.locator('button[aria-label*="ute"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  await page.locator('[role="menu"] [role="menuitem"], [role="menu"] button')
    .filter({hasText:/unmute|Turn on|Until turned off/i}).first().click({timeout:5000}).catch(()=>{});
  await page.waitForTimeout(3500);
  out.localStorageRestored=await ls();
  return out;
};
