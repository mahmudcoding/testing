export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,130));
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return {label:b?b.getAttribute('aria-label'):'gone', pressed:b?b.getAttribute('aria-pressed'):null};});
  const out={before:{ls:await ls(), ...(await st())}};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button,button')].filter(v)
      .find(b=>/^For 1 hour$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement(); out.menuItem=!!el;
  if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  out.afterMute={ls:await ls(), ...(await st()), reqs:reqs.length};
  await page.locator('button[aria-label="Unmute notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.afterUnmuteClick={ls:await ls(), ...(await st()), reqs:reqs.length};
  out.requests=reqs.slice(0,4);
  // restore
  out.apiCleanup=await page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/notifications/channels/${dm}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}
    return r.status;}, dm);
  return out;
};
