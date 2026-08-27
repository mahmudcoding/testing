export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const ls=()=>page.evaluate(()=>{
    const keys=Object.keys(localStorage).filter(k=>/mute/i.test(k));
    return Object.fromEntries(keys.map(k=>[k,String(localStorage.getItem(k)).slice(0,90)]));});
  out.localStorageBefore=await ls();
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000}).catch(()=>{out.muteFail=true});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.requestsOnMute=reqs.slice(0,4);
  out.localStorageAfter=await ls();
  out.buttonNow=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:'gone';});
  out.serverSide=await page.evaluate(async ({ws,ch})=>{
    const a=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    let aj=null; try{aj=await a.json()}catch{}
    const fields=aj?Object.keys(aj).filter(k=>/mute|notif/i.test(k)):[];
    const b=await fetch(`/api/v1/channels/${ch}/members/mute`,{credentials:'include'});
    return {channelStatus:a.status, muteFieldsOnChannel:fields,
      muteEndpointGet:b.status};},{ws,ch});
  // restore
  await page.locator('button[aria-label*="ute"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  out.localStorageRestored=await ls();
  return out;
};
