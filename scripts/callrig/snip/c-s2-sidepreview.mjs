export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(12000);
  const out={startUrl:'/c/qa-general'};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  await page.locator(`a[href*="/c/${ch}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    if(!m) return null;
    return [...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^Preview$/i.test((b.innerText||'').trim()))||null;});
  const el=h.asElement(); out.previewItemFound=!!el;
  reqs.length=0;
  if(el) await el.click({timeout:6000}).catch(e=>{out.err=String(e.message).slice(0,40);});
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.requestsAfterPreview=reqs.slice(0,5);
  out.after=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const pops=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>{const b=e.getBoundingClientRect();
        return {size:`${Math.round(b.width)}x${Math.round(b.height)}`,
          text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90)};});
    return {url:location.pathname.slice(0,42), popups:pops.slice(0,2),
      messagesShown:document.querySelectorAll('main [data-message-id]').length};});
  return out;
};
