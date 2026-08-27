export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,120));
  const out={before:await ls()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator(`a[href*="/c/${ch}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    if(!m) return null;
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^Mute$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement(); out.muteItemFound=!!el;
  if(el) await el.click({timeout:6000}).catch(e=>{out.err=String(e.message).slice(0,40);});
  await page.waitForTimeout(3000);
  out.afterMuteClick={ls:await ls(), reqs:reqs.length};
  out.submenu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const ms=[...document.querySelectorAll('[role="menu"]')].filter(v);
    return ms.map(m=>[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').trim().slice(0,20)).filter(Boolean)).slice(0,2);});
  // if a duration submenu appeared, pick one
  const d=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(v)
      .find(b=>/^For 1 hour$/i.test((b.innerText||'').trim()))||null;});
  const de=d.asElement(); out.durationOffered=!!de;
  if(de) await de.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.final={ls:await ls(), reqs:reqs.length, requests:reqs.slice(0,3)};
  out.cleanup=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}
    return r.status;}, ch);
  return out;
};
