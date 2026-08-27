export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,150));
  const out={before:await ls()};
  out.buttonBefore=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):'gone';});
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,26));},true);});
  await page.locator('button[aria-label="Unmute notifications"]').first().click({timeout:6000}).catch(e=>{out.err=String(e.message).slice(0,40);});
  await page.waitForTimeout(4000);
  out.landed=await page.evaluate(()=>window.__c);
  out.menuNow=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)).filter(Boolean):'no menu';});
  // if a menu opened, pick the unmute entry
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="menuitem"],[role="menu"] button')].filter(v)
      .find(b=>/unmute|turn off/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement();
  if(el){ await el.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(4000); }
  page.off('request',onReq);
  out.requests=reqs.slice(0,4);
  out.after=await ls();
  out.buttonAfter=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:'gone';});
  return out;
};
