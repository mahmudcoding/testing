export default async ({page}) => {
  const BOB='U4QCBOB00000001';
  try { return await run({page,BOB}); }
  finally {
    // always restore: unblock no matter what happened above
    await page.evaluate(async(u)=>{
      try{ await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
        headers:{'content-type':'application/json'}, body:JSON.stringify({user_id:u})}); }catch(e){}
    }, BOB);
  }
};
const run = async ({page, BOB}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const seesBob=()=>page.evaluate(async(ch)=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const fromBob=els.filter(e=>/QA Bob/.test(e.innerText||''));
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=30`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    return {inDom:fromBob.length, apiCount:(j.messages||[]).length,
      lastFromBob: fromBob.length? (fromBob[fromBob.length-1].innerText||'').replace(/\s+/g,' ').slice(-34):null};}, ch);
  out.before=await seesBob();
  out.block=await page.evaluate(async(u)=>{
    const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({user_id:u})});
    return {status:r.status, body:(await r.text()).slice(0,90)};}, BOB);
  await page.reload(); await page.waitForTimeout(10000);
  out.afterBlockReload=await seesBob();
  out.unblock=await page.evaluate(async(u)=>{
    const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'}, body:JSON.stringify({user_id:u})});
    return {status:r.status};}, BOB);
  await page.reload(); await page.waitForTimeout(10000);
  out.afterUnblock=await seesBob();
  return out;
};
