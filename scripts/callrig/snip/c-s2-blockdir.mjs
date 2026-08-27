export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dave='U4QCDAVE0000001';
  const out={};
  out.block=await page.evaluate(async (dave)=>{
    const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({user_id:dave})});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, key:j&&j.key};}, dave);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
  await page.waitForTimeout(11000);
  out.row=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    let host=null;
    for (const e of document.querySelectorAll('*'))
      if(e.children.length===0 && (e.textContent||'').trim()==='QA Dave'){ host=e; break; }
    if(!host) return {found:false,
      names:[...document.querySelectorAll('*')].filter(e=>e.children.length===0)
        .map(e=>(e.textContent||'').trim()).filter(t=>/^QA /.test(t)).slice(0,8)};
    let n=host, chain=[];
    for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n) break;
      const b=[...n.querySelectorAll('button,a')].filter(v)
        .map(x=>{const lbl=(x.getAttribute('aria-label')||x.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,24);
          return `${lbl}${x.disabled?' [disabled]':''}${x.getAttribute('aria-disabled')==='true'?' [aria-disabled]':''}`;});
      if(b.length) chain.push(`up${i+1}: ${[...new Set(b)].join(' | ')}`);}
    return {found:true, ancestry:chain.slice(0,4),
      rowText:(host.parentElement&&host.parentElement.parentElement
        ?(host.parentElement.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,80):'')};});
  return out;
};
