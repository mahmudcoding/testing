export default async ({page}) => {
  const ws='W4QCF1XTURESO01', CH='C4OX4NTD8DNF88E';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4OX0TTLIMVOUBH`);
  await page.waitForTimeout(8000);
  // unarchive it first so we can set it up properly
  out.unarchive=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/unarchive`,{method:'POST',credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,90)};}, CH);
  await page.waitForTimeout(4000);
  out.post=await page.evaluate(async(ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-ARCH2 target', idempotency_key:'qav2-'+Math.random().toString(36).slice(2)})});
    const t=await r.text(); let j={}; try{j=JSON.parse(t);}catch(e){}
    return {status:r.status, id:j.id, body:t.slice(0,110)};}, CH);
  await page.waitForTimeout(5000);
  // confirm it is readable BEFORE archiving
  out.readable=await page.evaluate(async({ch,mid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return {status:r.status, found:(j.messages||[]).some(m=>m.id===mid),
      bodies:(j.messages||[]).map(m=>(m.body||'').slice(0,20))};},{ch:CH, mid:out.post.id});
  if(!out.readable.found) return out;
  out.archive=await page.evaluate(async(ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/archive`,{method:'POST',credentials:'include'});
    return {status:r.status};}, CH);
  await page.waitForTimeout(5000);
  out.f7=await page.evaluate(async({ch,mid})=>{
    const j=async(p)=>{const r=await p; return {status:r.status, key:(await r.text()).match(/"key":"([^"]+)"/)||['','(none)']};};
    const send=await j(fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:'QA-V2-ARCH2 after', idempotency_key:'qay-'+Math.random().toString(36).slice(2)})}));
    const react=await j(fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/reactions`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({emoji:'🚀'})}));
    const pin=await j(fetch(`/api/v1/messaging/channels/${ch}/messages/${mid}/pin`,{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({pin:true})}));
    return {send:{status:send.status,key:send.key[1]}, react:{status:react.status,key:react.key[1]},
      pin:{status:pin.status,key:pin.key[1]}};},{ch:CH, mid:out.post.id});
  out.f7.PASS = out.f7.send.status===403 && out.f7.react.status===200 && out.f7.pin.status===200;
  // survives a reload?
  out.afterReload=await page.evaluate(async({ch,mid})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=5`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const m=(j.messages||[]).find(x=>x.id===mid);
    return m? {reactions:(m.reactions||[]).length, pinned:!!m.pinned}:'absent';},{ch:CH, mid:out.post.id});
  return out;
};
