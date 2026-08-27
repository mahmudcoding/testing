export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(13000);
  const out={};
  const target=page.locator('main [data-message-id]').last();
  await target.scrollIntoViewIfNeeded().catch(()=>{});
  await target.hover(); await page.waitForTimeout(1500);
  out.hoverButtons=await target.evaluate(e=>{
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...new Set([...e.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,22)))];});
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  await target.locator('button[aria-label="Add reaction"]').first().click({timeout:6000}).catch(e=>{out.openErr='FAIL';});
  await page.waitForTimeout(3500);
  out.landedOpen=await page.evaluate(()=>window.__c);
  out.picker=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].filter(v)
      .find(x=>/RECENTLY|Search emoji/i.test(x.innerText||''));
    if(!d) return 'NO-PICKER';
    const btns=[...d.querySelectorAll('button')].filter(v)
      .map(b=>b.getAttribute('aria-label')||'').filter(Boolean);
    return {buttonCount:btns.length, firstFew:btns.slice(0,6),
      head:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)};});
  if(out.picker!=='NO-PICKER' && out.picker.firstFew.length){
    const emoji=out.picker.firstFew.find(x=>x && x.length<=4) || out.picker.firstFew[0];
    const posts=[];
    const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
      posts.push(r.method()+' '+u.split('/api/v1')[1].slice(0,40));};
    page.on('request',onReq);
    await page.evaluate(()=>{window.__c2=[];document.addEventListener('click',e=>{
      const t=e.target.closest('button')||e.target;
      window.__c2.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,8));},true);});
    await page.locator(`button[aria-label="${emoji}"]`).first().click({timeout:6000}).catch(()=>{out.pickErr='FAIL';});
    await page.waitForTimeout(5000);
    page.off('request',onReq);
    out.chose=emoji;
    out.landedPick=await page.evaluate(()=>window.__c2);
    out.requests=posts.slice(0,3);
  }
  return out;
};
