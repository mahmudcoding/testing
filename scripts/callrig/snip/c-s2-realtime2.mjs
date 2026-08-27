export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const id=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-S2-RT2 target', idempotency_key:'qa-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;}, ch);
  await page.waitForTimeout(3000);
  const snap=()=>page.evaluate((id)=>{
    const vis=(x)=>{const r=x.getBoundingClientRect(); if(r.width<4||r.height<4) return false;
      let op=1,n=x; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const strip=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Pinned|View all/i.test(t)&&t.length<40);
    const h=document.querySelector('main header')||document.querySelector('header');
    return {pinnedStrip:[...new Set(strip)],
      header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,42),
      sidebarName:(()=>{const a=[...document.querySelectorAll('a[href*="C4QCPRIVATE0001"]')]
        .filter(vis)[0]; return a?(a.innerText||'').replace(/\s+/g,' ').slice(0,24):null;})()};}, id);
  out.before=await snap();
  // pin via API and rename via API, both "from elsewhere"
  out.ops=await page.evaluate(async({ch,id})=>{
    const p=await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})});
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({name:'qa-private-rt',description:null})});
    return {pin:p.status, rename:r.status};}, {ch,id});
  const s=[]; for(let i=0;i<18;i++){ await page.waitForTimeout(1500); s.push(await snap()); }
  out.pinAppearedAt=s.findIndex(x=>x.pinnedStrip.some(t=>/Pinned/i.test(t)));
  out.renameHeaderAt=s.findIndex(x=>/qa-private-rt/.test(x.header||''));
  out.renameSidebarAt=s.findIndex(x=>/qa-private-rt/.test(x.sidebarName||''));
  out.last=s.at(-1);
  await page.reload(); await page.waitForTimeout(8000);
  out.afterReload=await snap();
  // restore
  out.restore=await page.evaluate(async({ch,id})=>{
    await fetch(`/api/v1/messaging/channels/${ch}/messages/${id}/pin`,{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({pin:false})});
    const r=await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({name:'qa-private',description:null})});
    return {rename:r.status};}, {ch,id});
  return out;
};
