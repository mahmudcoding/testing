export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const ls=()=>page.evaluate(()=>String(localStorage.getItem('aloqa.channel.mute')||'').slice(0,150));
  const out={before:await ls()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Mute notifications"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const all=[...document.querySelectorAll('[role="menuitem"],[role="menu"] button,button')].filter(v);
    return all.find(b=>/^Until turned off$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement();
  out.menuItemFound=!!el;
  if(el){ await el.click({timeout:6000}).catch(e=>{out.pickErr=String(e.message).slice(0,40);}); }
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.requestsOnMute=reqs.slice(0,4);
  out.afterMute=await ls();
  out.buttonAfterMute=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=[...document.querySelectorAll('button')].filter(v)
      .find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed')}:'gone';});
  // restore in the same run
  const un=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button')].filter(v)
      .find(b=>/unmute/i.test(b.getAttribute('aria-label')||b.innerText||''))||null;});
  const ue=un.asElement();
  if(ue){ await ue.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(4000); }
  out.afterRestore=await ls();
  return out;
};
