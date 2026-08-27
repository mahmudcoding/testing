export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const out={};
  out.notifCountBefore=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
    return Array.isArray(a)?a.length:null;});
  // mute the DM "Until turned off" via the sidebar
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator(`a[href*="/d/${dm}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^Mute$/i.test((b.innerText||'').trim()))||null:null;});
  const el=h.asElement(); if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const d=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(v)
      .find(b=>/^Until turned off$/i.test((b.innerText||'').trim()))||null;});
  const de=d.asElement(); if(de) await de.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.muteRequests=reqs.slice(0,3);
  out.mutedInLocal=await page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(-46));
  return out;
};
