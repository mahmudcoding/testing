export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(-46));
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:'gone';});
  const out={account:'second account', before:{ls:await ls(), ...(await st())}};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button,button')].filter(v)
      .find(b=>/^For 1 hour$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement(); if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  out.afterMute={ls:await ls(), ...(await st()), reqs:reqs.length};
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,24));},true);});
  await page.locator('button[aria-label="Unmute notifications"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.afterUnmuteClick={ls:await ls(), ...(await st()), reqs:reqs.length,
    landed:await page.evaluate(()=>window.__c)};
  out.requests=reqs.slice(0,3);
  out.cleanup=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/notifications/channels/${ch}/mute`,{method:'DELETE',credentials:'include'});
    try{const k='aloqa.channel.mute';const o=JSON.parse(localStorage.getItem(k)||'{}');
      if(o&&o.state){o.state.mutedByChannel={};localStorage.setItem(k,JSON.stringify(o));}}catch(e){}
    return r.status;}, ch);
  return out;
};
