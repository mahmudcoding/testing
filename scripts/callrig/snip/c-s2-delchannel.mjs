export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXDIT33034G6M';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const out={};
  const side=page.locator(`a[href*="/c/${ch}"]`).first();
  out.sidebarRow=await side.count();
  await side.click({button:'right',timeout:6000}).catch(()=>{out.rightClick='FAIL';});
  await page.waitForTimeout(3000);
  out.menu=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const m=[...document.querySelectorAll('[role="menu"]')].filter(v)[0];
    return m?[...new Set([...m.querySelectorAll('[role="menuitem"],button')].filter(v)
      .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)).filter(Boolean))]:'NO-MENU';});
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,44));};
  page.on('request',onReq);
  try { await page.locator('[role="menuitem"],button').filter({hasText:/^Delete channel$/}).first().click({timeout:6000}); out.deleteClick='ok'; }
  catch(e){ out.deleteClick='FAIL'; }
  await page.waitForTimeout(3500);
  out.confirm=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)[0];
    return d?{text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,170),
      buttons:[...d.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,20)),
      inputs:[...d.querySelectorAll('input')].filter(v)
        .map(i=>i.getAttribute('placeholder')||'(no placeholder)')}:null;});
  page.off('request',onReq);
  out.requestsBeforeConfirm=reqs.slice(0,3);
  return out;
};
