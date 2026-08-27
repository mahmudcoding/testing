export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(12000);
  const count=()=>page.evaluate(async (dm)=>{
    const r=await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j&&j.messages)||[];
    return {server:m.length, dom:document.querySelectorAll('main [data-message-id]').length};}, dm);
  const out={before:await count()};
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,46));};
  page.on('request',onReq);
  await page.locator(`a[href*="/d/${dm}"]`).first().click({button:'right',timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const h=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .find(b=>/^Clear conversation history$/i.test((b.innerText||'').trim()))||null:null;});
  const el=h.asElement(); out.itemFound=!!el;
  if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3500);
  out.confirm=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22))}:'no dialog';});
  out.requestsBeforeConfirm=reqs.length;
  const ok=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    if(!d) return null;
    return [...d.querySelectorAll('button')].filter(v)
      .find(b=>/^(Clear|Clear history|Confirm)$/i.test((b.innerText||'').trim()))||null;});
  const oe=ok.asElement(); out.confirmButtonFound=!!oe;
  if(oe) await oe.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(7000);
  page.off('request',onReq);
  out.requests=reqs.slice(0,3);
  out.after=await count();
  return out;
};
