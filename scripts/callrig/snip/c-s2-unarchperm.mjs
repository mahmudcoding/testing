export default async ({page}) => {
  const out={};
  const btn=page.locator('button').filter({hasText:/^Unarchive channel$|^Unarchive$/}).first();
  out.buttonCount=await btn.count();
  if(!out.buttonCount){
    out.visible=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
        .filter(t=>/unarchive/i.test(t));});
    return out;
  }
  out.label=await btn.innerText().catch(()=>'');
  const reqs=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET')
    reqs.push(r.method()+' '+u.split('/api/v1')[1].slice(0,42));};
  page.on('request',onReq);
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true);});
  await btn.click({timeout:6000}).catch(e=>{out.clickErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(6000);
  page.off('request',onReq);
  out.landed=await page.evaluate(()=>window.__c);
  out.requests=reqs.slice(0,3);
  out.after=await page.evaluate(async ()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const r=await fetch('/api/v1/channels/C4OXICXIKND2B2J',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {composer:!!c, stillArchivedBanner:/archived/i.test(main?(main.innerText||''):''),
      channelStatus:r.status,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};});
  return out;
};
