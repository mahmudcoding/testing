export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,120));
  const out={};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  // mute from the header
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button,button')].filter(v)
      .find(b=>/^For 1 hour$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement(); if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  out.afterMute={ls:await ls(), reqs:reqs.length};
  // unmute from the SIDEBAR menu
  await page.locator(`a[href*="/d/${dm}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  out.dmMenuWhileMuted=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').trim()).filter(Boolean))]:'NO-MENU';});
  const u=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    if(!m) return null;
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^unmute$/i.test((b.innerText||'').trim()))||null;});
  const ue=u.asElement(); out.unmuteItemFound=!!ue;
  if(ue) await ue.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.afterSidebarUnmute={ls:await ls(), reqs:reqs.length, requests:reqs.slice(0,3)};
  out.cleanup=await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/notifications/channels/${dm}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}
    return r.status;}, dm);
  return out;
};
